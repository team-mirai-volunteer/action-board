"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  extractAvatarPathFromUrl,
  shouldDeleteOldAvatar,
  validateAvatarFile,
} from "@/features/user-settings/utils/avatar-helpers";
import { createOrUpdateHubSpotContact } from "@/lib/services/hubspot";
import { sendWelcomeMail } from "@/lib/services/mail";
import { createAdminClient } from "@/lib/supabase/adminClient";
import { createClient } from "@/lib/supabase/client";
import type { HubSpotClient } from "../types/hubspot-client";
import type { MailClient } from "../types/mail-client";
import { updateProfile as updateProfileUseCase } from "../use-cases/update-profile";

export type UpdateProfileResult = {
  success: boolean;
  error?: string;
};

export type UploadAvatarResult = {
  success: boolean;
  avatarPath?: string;
  error?: string;
};

/** 本番用 HubSpot クライアント */
const prodHubSpotClient: HubSpotClient = {
  createOrUpdateContact: (contactData, existingContactId) =>
    createOrUpdateHubSpotContact(contactData, existingContactId),
};

/** 本番用メールクライアント */
const prodMailClient: MailClient = {
  sendWelcomeMail: (to) => sendWelcomeMail(to),
};

export async function updateProfile(
  _previousState: UpdateProfileResult | null,
  formData: FormData,
): Promise<UpdateProfileResult | null> {
  const supabaseServiceClient = await createAdminClient();
  const supabaseClient = createClient();

  const {
    data: { user },
  } = await supabaseClient.auth.getUser();

  if (!user) {
    console.error("User not found");
    return redirect("/sign-in");
  }

  // フォームデータの取得
  const name = formData.get("name")?.toString() ?? "";
  const address_prefecture =
    formData.get("address_prefecture")?.toString() ?? "";
  const date_of_birth = formData.get("date_of_birth")?.toString() ?? "";
  const postcode = formData.get("postcode")?.toString() ?? "";
  const x_username = formData.get("x_username")?.toString() || "";
  const github_username = formData.get("github_username")?.toString() || "";

  // アバター処理（Storage操作はアクション層で行う）
  let avatar_path = formData.get("avatar_path") as string | null;

  const { data: publicProfile } = await supabaseServiceClient
    .from("public_user_profiles")
    .select("avatar_url")
    .eq("id", user.id)
    .single();

  const previousAvatarUrl = publicProfile?.avatar_url || null;
  const avatar_file = formData.get("avatar") as File | null;

  const avatarValidation = validateAvatarFile(avatar_file);
  if (!avatarValidation.valid) {
    return {
      success: false,
      error: avatarValidation.error,
    };
  }

  const needsDeleteOldAvatar = shouldDeleteOldAvatar(
    previousAvatarUrl,
    avatar_path,
    !!(avatar_file && avatar_file.size > 0),
  );

  if (needsDeleteOldAvatar) {
    try {
      const filePath = previousAvatarUrl
        ? extractAvatarPathFromUrl(previousAvatarUrl)
        : null;

      if (filePath) {
        const { error: deleteError } = await supabaseServiceClient.storage
          .from("avatars")
          .remove([filePath]);

        if (deleteError) {
          console.error("Error deleting old avatar:", deleteError);
        }
      }
    } catch (error) {
      console.error("Error deleting old avatar:", error);
    }
  }

  if (avatar_file && avatar_file.size > 0) {
    try {
      const fileExt = avatar_file.name.split(".").pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      const fileBuffer = await avatar_file.arrayBuffer();

      const { error } = await supabaseServiceClient.storage
        .from("avatars")
        .upload(fileName, fileBuffer, {
          contentType: avatar_file.type,
          upsert: true,
        });

      if (error) {
        console.error("Upload error:", error);
      }
      avatar_path = fileName;
    } catch (error) {
      console.error("Avatar upload error during profile update:", error);
    }
  }

  // ユースケース呼び出し
  const result = await updateProfileUseCase(
    {
      adminSupabase: supabaseServiceClient,
      hubspot: prodHubSpotClient,
      mail: prodMailClient,
    },
    {
      userId: user.id,
      email: user.email,
      name,
      addressPrefecture: address_prefecture,
      dateOfBirth: date_of_birth,
      postcode,
      xUsername: x_username,
      githubUsername: github_username,
      avatarPath: avatar_path,
    },
  );

  if (result.success) {
    revalidatePath("/settings/profile");
    revalidatePath("/");
    revalidatePath(`/users/${user.id}`);
  }

  return result;
}
