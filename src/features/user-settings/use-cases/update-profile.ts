import type { SupabaseClient } from "@supabase/supabase-js";
import { nanoid } from "nanoid";
import { z } from "zod";
import { PREFECTURES } from "@/lib/constants/prefectures";
import { formatZodErrors } from "@/lib/utils/validation-utils";
import type { HubSpotClient } from "../types/hubspot-client";
import type { MailClient } from "../types/mail-client";

export type UpdateProfileInput = {
  userId: string;
  email: string | undefined;
  name: string;
  addressPrefecture: string;
  dateOfBirth: string;
  postcode: string;
  xUsername?: string;
  githubUsername?: string;
  avatarPath: string | null;
};

export type UpdateProfileResult =
  | { success: true }
  | { success: false; error: string };

export type UpdateProfileDeps = {
  adminSupabase: SupabaseClient;
  hubspot: HubSpotClient;
  mail: MailClient;
};

const updateProfileSchema = z.object({
  name: z
    .string()
    .nonempty({ message: "ニックネームを入力してください" })
    .max(100, { message: "ニックネームは100文字以内で入力してください" }),
  addressPrefecture: z
    .string()
    .nonempty({ message: "都道府県を選択してください" })
    .refine((val) => PREFECTURES.includes(val), {
      message: "有効な都道府県を選択してください",
    }),
  dateOfBirth: z
    .string()
    .nonempty({ message: "生年月日を入力してください" })
    .regex(/^\d{4}-\d{2}-\d{2}$/, {
      message: "生年月日はYYYY-MM-DD形式で入力してください",
    }),
  postcode: z
    .string()
    .nonempty({ message: "郵便番号を入力してください" })
    .regex(/^\d{7}$/, {
      message: "郵便番号はハイフンなし7桁で入力してください",
    }),
  xUsername: z
    .string()
    .max(50, { message: "Xユーザー名は50文字以内で入力してください" })
    .optional(),
  githubUsername: z
    .string()
    .max(39, { message: "GitHubユーザー名は39文字以内で入力してください" })
    .optional(),
});

export async function updateProfile(
  deps: UpdateProfileDeps,
  input: UpdateProfileInput,
): Promise<UpdateProfileResult> {
  const { adminSupabase, hubspot, mail } = deps;

  // バリデーション
  const validatedFields = updateProfileSchema.safeParse({
    name: input.name,
    addressPrefecture: input.addressPrefecture,
    dateOfBirth: input.dateOfBirth,
    postcode: input.postcode,
    xUsername: input.xUsername,
    githubUsername: input.githubUsername,
  });

  if (!validatedFields.success) {
    return {
      success: false,
      error: formatZodErrors(validatedFields.error),
    };
  }

  const validatedData = validatedFields.data;

  // 既存ユーザー情報を取得
  const { data: privateUser } = await adminSupabase
    .from("private_users")
    .select("*")
    .eq("id", input.userId)
    .single();

  const isNewUser = !privateUser;
  const hubspotContactId = privateUser?.hubspot_contact_id ?? null;

  // private_users / public_user_profiles の upsert
  if (isNewUser) {
    const { error: privateUserError } = await adminSupabase
      .from("private_users")
      .insert({
        id: input.userId,
        date_of_birth: validatedData.dateOfBirth,
        postcode: validatedData.postcode,
        hubspot_contact_id: null,
        updated_at: new Date().toISOString(),
      });
    if (privateUserError) {
      console.error("Error inserting private_users:", privateUserError);
      return {
        success: false,
        error: "ユーザー情報の登録に失敗しました",
      };
    }

    const { error: publicUserError } = await adminSupabase
      .from("public_user_profiles")
      .insert({
        id: input.userId,
        name: validatedData.name,
        address_prefecture: validatedData.addressPrefecture,
        x_username: validatedData.xUsername || null,
        github_username: validatedData.githubUsername || null,
        avatar_url: input.avatarPath,
        updated_at: new Date().toISOString(),
      });
    if (publicUserError) {
      console.error("Error inserting public_user_profiles:", publicUserError);
      return {
        success: false,
        error: "ユーザー情報の登録に失敗しました",
      };
    }

    // ウェルカムメール送信
    try {
      if (input.email) {
        await mail.sendWelcomeMail(input.email);
      }
    } catch (e) {
      console.error("案内メール送信失敗:", e);
    }

    // サインアップアクティビティ記録
    try {
      // 既存のサインアップアクティビティをチェック
      const { data: existingActivity } = await adminSupabase
        .from("user_activities")
        .select("id")
        .eq("user_id", input.userId)
        .eq("activity_type", "signup")
        .maybeSingle();

      if (!existingActivity) {
        await adminSupabase.from("user_activities").insert({
          user_id: input.userId,
          activity_type: "signup",
          activity_title: `${validatedData.name}さんが仲間入りしました！`,
        });
      }
    } catch (e) {
      console.error("サインアップアクティビティ記録失敗:", e);
    }
  } else {
    const { error: privateUserError } = await adminSupabase
      .from("private_users")
      .update({
        date_of_birth: validatedData.dateOfBirth,
        postcode: validatedData.postcode,
        updated_at: new Date().toISOString(),
      })
      .eq("id", input.userId);
    if (privateUserError) {
      console.error("Error updating private_users:", privateUserError);
      return {
        success: false,
        error: "ユーザー情報の更新に失敗しました",
      };
    }

    const { error: publicUserError } = await adminSupabase
      .from("public_user_profiles")
      .update({
        name: validatedData.name,
        address_prefecture: validatedData.addressPrefecture,
        x_username: validatedData.xUsername || null,
        github_username: validatedData.githubUsername || null,
        avatar_url: input.avatarPath,
        updated_at: new Date().toISOString(),
      })
      .eq("id", input.userId);
    if (publicUserError) {
      console.error("Error updating public_user_profiles:", publicUserError);
      return {
        success: false,
        error: "ユーザー情報の更新に失敗しました",
      };
    }
  }

  // HubSpot連携処理（プロフィール更新成功後に実行）
  try {
    const hubspotResult = await hubspot.createOrUpdateContact(
      {
        email: input.email || "",
        firstname: input.email || "",
        state: validatedData.addressPrefecture,
      },
      hubspotContactId,
    );

    if (hubspotResult.success) {
      const { error: updateHubSpotIdError } = await adminSupabase
        .from("private_users")
        .update({ hubspot_contact_id: hubspotResult.contactId })
        .eq("id", input.userId);

      if (updateHubSpotIdError) {
        console.error(
          "Error updating hubspot_contact_id:",
          updateHubSpotIdError,
        );
      }
    } else {
      console.error("HubSpot integration failed:", hubspotResult.error);
    }
  } catch (error) {
    console.error("HubSpot integration error:", error);
  }

  // ユーザー別紹介コードの登録処理（重複時は最大5回リトライ）
  const MAX_RETRY = 5;

  const { data: existingReferral } = await adminSupabase
    .from("user_referral")
    .select("user_id")
    .eq("user_id", input.userId)
    .maybeSingle();

  if (!existingReferral) {
    let referralSuccess = false;
    let lastError = null;

    for (let attempt = 0; attempt < MAX_RETRY; attempt++) {
      const referralCode = nanoid(8);

      const { error: referralInsertError } = await adminSupabase
        .from("user_referral")
        .insert({
          user_id: input.userId,
          referral_code: referralCode,
        });

      if (!referralInsertError) {
        referralSuccess = true;
        break;
      }

      if (referralInsertError.code !== "23505") {
        lastError = referralInsertError;
        break;
      }
    }

    if (!referralSuccess) {
      console.error("紹介コード登録に失敗:", lastError);
      return {
        success: false,
        error: "紹介コードの登録に失敗しました。（重複によるリトライ上限）",
      };
    }
  }

  return { success: true };
}
