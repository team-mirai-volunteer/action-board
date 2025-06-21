import { createClient } from "@supabase/supabase-js";
import { endOfDay, format, startOfDay, subDays } from "date-fns";
import { ja } from "date-fns/locale";
import * as dotenv from "dotenv";
import { google } from "googleapis";

dotenv.config();

// 環境変数チェック関数
function getEnvVar(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }
  return value;
}

const supabase = createClient(
  getEnvVar("NEXT_PUBLIC_SUPABASE_URL"),
  getEnvVar("SUPABASE_SERVICE_ROLE_KEY"),
);

async function fetchDataForYesterday() {
  const yesterday = subDays(new Date(), 1);
  const start = startOfDay(yesterday).toISOString();
  const end = endOfDay(yesterday).toISOString();

  const { data, error } = await supabase
    .from("posting_activities")
    .select("*")
    .gte("created_at", start)
    .lt("created_at", end);

  if (error) throw new Error(`Supabase Error: ${error.message}`);
  return {
    data: data ?? [],
    dateStr: format(yesterday, "yyyy-MM-dd", { locale: ja }),
  };
}

type PostingActivity = {
  id: string;
  mission_artifact_id: string;
  posting_count: number;
  location_text: string;
  created_at: string;
  updated_at: string;
};

async function writeToNewSheet(rows: PostingActivity[], sheetName: string) {
  if (!rows.length) {
    console.log(`ℹ️ No data to write for ${sheetName}`);
    return;
  }

  const credentialsJson = getEnvVar("GOOGLE_SERVICE_ACCOUNT_JSON");
  const auth = new google.auth.GoogleAuth({
    credentials: JSON.parse(credentialsJson),
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  const sheets = google.sheets({ version: "v4", auth });

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId: getEnvVar("SPREADSHEET_ID"),
    requestBody: {
      requests: [
        {
          addSheet: {
            properties: {
              title: sheetName,
            },
          },
        },
      ],
    },
  });

  const values = rows.map((row) => Object.values(row));

  await sheets.spreadsheets.values.update({
    spreadsheetId: getEnvVar("SPREADSHEET_ID"),
    range: `${sheetName}!A1`,
    valueInputOption: "RAW",
    requestBody: {
      values: [
        Object.keys(rows[0]), // ヘッダー
        ...values,
      ],
    },
  });

  console.log(`✅ Sheet "${sheetName}" created and data written.`);
}

(async () => {
  try {
    const { data, dateStr } = await fetchDataForYesterday();
    await writeToNewSheet(data, dateStr);
  } catch (err) {
    console.error("❌ Error:", err);
    process.exit(1);
  }
})();
