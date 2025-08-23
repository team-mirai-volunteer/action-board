import { createAdminClient } from "@/lib/supabase/adminClient";
import { createClient } from "@/lib/supabase/client";

export async function isValidReferralCode(code: string): Promise<boolean> {
  const supabase = createClient();
  const { data } = await supabase
    .from("user_referral")
    .select("user_id")
    .eq("referral_code", code)
    .eq("del_flg", false)
    .maybeSingle();
  return !!data;
}

export async function isEmailAlreadyUsedInReferral(
  email: string,
): Promise<boolean> {
  const supabase = await createAdminClient();
  const { data } = await supabase
    .from("mission_artifacts")
    .select("id")
    .eq("artifact_type", "REFERRAL")
    .eq("text_content", email.toLowerCase());

  return !!(data && data.length > 0);
}
