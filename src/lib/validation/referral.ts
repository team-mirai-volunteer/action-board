import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/server";

export async function isValidReferralCode(code: string): Promise<boolean> {
  const supabase = await createClient();
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
  const supabase = await createServiceClient();
  const { data } = await supabase
    .from("mission_artifacts")
    .select("id")
    .eq("artifact_type", "REFERRAL")
    .eq("text_content", email.toLowerCase());

  return !!(data && data.length > 0);
}
