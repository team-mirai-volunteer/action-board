import "dotenv/config";

import crypto from "node:crypto";

import type { PartyPlan } from "@/features/party-membership/types";
import { createAdminClient } from "@/lib/supabase/adminClient";

type SheetRow = {
  email: string;
  plan: PartyPlan;
  rawPlan: string;
  rowNumber: number;
};

type NormalizedRow = {
  userId: string;
  plan: PartyPlan;
  raw: SheetRow;
};

type SyncConfig = {
  spreadsheetId: string;
  sheetName: string;
  serviceAccount: {
    client_email: string;
    private_key: string;
  };
};

type ExistingContext = {
  userIds: Set<string>;
  badgeVisibility: Map<string, boolean>;
};

type SyncSummary = {
  upserted: number;
  removed: number;
  skipped: number;
};

const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_SHEETS_SCOPE =
  "https://www.googleapis.com/auth/spreadsheets.readonly";

const PLAN_MAP: Record<string, PartyPlan | null> = {
  starter: "starter",
  regular: "regular",
  premium: "premium",
  donation: null,
};

function assertEnv(value: string | undefined, name: string): string {
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function base64UrlEncode(buffer: Buffer | string): string {
  return Buffer.from(buffer)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

function loadConfig(): SyncConfig {
  const spreadsheetId = assertEnv(
    process.env.GOOGLE_PARTY_MEMBER_SPREADSHEET_ID,
    "GOOGLE_PARTY_MEMBER_SPREADSHEET_ID",
  );
  const serviceAccountJson = assertEnv(
    process.env.GOOGLE_SERVICE_ACCOUNT_JSON,
    "GOOGLE_SERVICE_ACCOUNT_JSON",
  );
  const sheetName = process.env.GOOGLE_PARTY_MEMBER_SHEET_NAME?.trim() || "Raw";

  const parsed = JSON.parse(serviceAccountJson) as {
    client_email: string;
    private_key: string;
  };

  return {
    spreadsheetId,
    sheetName,
    serviceAccount: {
      client_email: parsed.client_email,
      private_key: parsed.private_key.replace(/\\n/g, "\n"),
    },
  };
}

async function getAccessToken(
  clientEmail: string,
  privateKey: string,
): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const header = {
    alg: "RS256",
    typ: "JWT",
  };

  const payload = {
    iss: clientEmail,
    scope: GOOGLE_SHEETS_SCOPE,
    aud: GOOGLE_TOKEN_URL,
    exp: now + 3600,
    iat: now,
  };

  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const dataToSign = `${encodedHeader}.${encodedPayload}`;

  const sign = crypto.createSign("RSA-SHA256");
  sign.update(dataToSign);
  sign.end();
  const signature = sign.sign(privateKey);
  const encodedSignature = base64UrlEncode(signature);

  const assertion = `${dataToSign}.${encodedSignature}`;

  const response = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Failed to obtain Google access token: ${response.status} ${errorText}`,
    );
  }

  const json = (await response.json()) as { access_token: string };
  return json.access_token;
}

async function fetchSheetRows(
  spreadsheetId: string,
  sheetName: string,
  accessToken: string,
): Promise<SheetRow[]> {
  const url = new URL(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(sheetName)}!A:Z`,
  );

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Failed to fetch sheet values: ${response.status} ${errorText}`,
    );
  }

  const data = (await response.json()) as {
    values?: string[][];
  };

  const rows = data.values ?? [];
  if (rows.length === 0) {
    return [];
  }

  const header = rows[0].map((value) => value.trim());
  const emailIndex = header.findIndex(
    (value) => value.toLowerCase() === "email",
  );
  const planIndex = header.findIndex(
    (value) => value.toLowerCase() === "currentplantype",
  );

  if (emailIndex === -1 || planIndex === -1) {
    throw new Error("Sheet must contain 'Email' and 'CurrentPlanType' columns");
  }

  const results: SheetRow[] = [];

  rows.slice(1).forEach((row, rowOffset) => {
    const email = (row[emailIndex] ?? "").trim().toLowerCase();
    const rawPlan = (row[planIndex] ?? "").trim().toLowerCase();
    if (!email) {
      return;
    }

    const mappedPlan = PLAN_MAP[rawPlan];
    if (!mappedPlan) {
      return;
    }

    results.push({
      email,
      plan: mappedPlan,
      rawPlan,
      rowNumber: rowOffset + 2,
    });
  });

  return results;
}

async function getExistingMembershipContext(
  adminClient: Awaited<ReturnType<typeof createAdminClient>>,
): Promise<ExistingContext> {
  const { data, error } = await adminClient
    .from("party_memberships")
    .select("user_id, badge_visibility");

  if (error) {
    throw new Error(
      `Failed to fetch existing party memberships: ${error.message}`,
    );
  }

  const context: ExistingContext = {
    userIds: new Set<string>(),
    badgeVisibility: new Map<string, boolean>(),
  };

  for (const membership of data ?? []) {
    if (!membership.user_id) {
      continue;
    }
    context.userIds.add(membership.user_id);
    if (typeof membership.badge_visibility === "boolean") {
      context.badgeVisibility.set(
        membership.user_id,
        membership.badge_visibility,
      );
    }
  }

  return context;
}

async function resolveSheetRows(
  rows: SheetRow[],
  adminClient: Awaited<ReturnType<typeof createAdminClient>>,
): Promise<{ normalized: NormalizedRow[]; skipped: number }> {
  const normalized: NormalizedRow[] = [];
  let skipped = 0;

  for (const row of rows) {
    const { data, error } = await adminClient.rpc("get_user_by_email", {
      user_email: row.email,
    });

    if (error) {
      console.error(
        `Failed to lookup user. Skipping row ${row.rowNumber}`,
        error.message,
      );
      skipped += 1;
      continue;
    }

    if (!data || data.length === 0) {
      console.warn(`No Supabase user found. Skipping row ${row.rowNumber}.`);
      skipped += 1;
      continue;
    }

    const userId = data[0]?.id as string | undefined;
    if (!userId) {
      console.warn(
        `User lookup returned no ID. Skipping row ${row.rowNumber}.`,
      );
      skipped += 1;
      continue;
    }

    normalized.push({ userId, plan: row.plan, raw: row });
  }

  return { normalized, skipped };
}

async function applyMembershipDiff(
  adminClient: Awaited<ReturnType<typeof createAdminClient>>,
  normalizedRows: NormalizedRow[],
  context: ExistingContext,
  sheetName: string,
): Promise<SyncSummary> {
  const nowIso = new Date().toISOString();
  const userIdsToSync = new Set<string>();

  const upsertPayload = normalizedRows.map(({ userId, plan, raw }) => {
    userIdsToSync.add(userId);
    return {
      user_id: userId,
      plan,
      badge_visibility: context.badgeVisibility.get(userId) ?? true,
      synced_at: nowIso,
      metadata: {
        source: "google_sheet",
        sheet: sheetName,
        rawPlan: raw.rawPlan,
        rowNumber: raw.rowNumber,
      },
    };
  });

  if (upsertPayload.length > 0) {
    const { error: upsertError } = await adminClient
      .from("party_memberships")
      .upsert(upsertPayload, { onConflict: "user_id" });

    if (upsertError) {
      throw new Error(
        `Failed to upsert party memberships: ${upsertError.message}`,
      );
    }
  }

  const staleUserIds = Array.from(context.userIds).filter(
    (userId) => !userIdsToSync.has(userId),
  );

  if (staleUserIds.length > 0) {
    const { error: deleteError } = await adminClient
      .from("party_memberships")
      .delete()
      .in("user_id", staleUserIds);

    if (deleteError) {
      throw new Error(
        `Failed to delete stale party memberships: ${deleteError.message}`,
      );
    }
  }

  return {
    upserted: upsertPayload.length,
    removed: staleUserIds.length,
    skipped: 0,
  };
}

async function main() {
  try {
    const config = loadConfig();
    const accessToken = await getAccessToken(
      config.serviceAccount.client_email,
      config.serviceAccount.private_key,
    );

    const sheetRows = await fetchSheetRows(
      config.spreadsheetId,
      config.sheetName,
      accessToken,
    );

    if (sheetRows.length === 0) {
      console.warn("No rows found in the Google Sheet. Nothing to sync.");
      return;
    }

    const adminClient = await createAdminClient();
    const existingContext = await getExistingMembershipContext(adminClient);
    const { normalized, skipped } = await resolveSheetRows(
      sheetRows,
      adminClient,
    );

    const summary = await applyMembershipDiff(
      adminClient,
      normalized,
      existingContext,
      config.sheetName,
    );

    const totalSkipped = skipped + summary.skipped;

    console.log(
      `Synced ${summary.upserted} memberships. Removed ${summary.removed} stale memberships.${totalSkipped ? ` Skipped ${totalSkipped} rows.` : ""}`,
    );
  } catch (error) {
    console.error("Failed to sync party memberships:", error);
    process.exit(1);
  }
}

main();
