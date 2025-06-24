import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import SlideMenu from "./slide-menu";

export default async function AuthButton() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user ? (
    <SlideMenu user={user} />
  ) : (
    <div className="flex gap-2">
      <Button asChild size="sm" variant="outline">
        <Link href="/sign-in">ログイン</Link>
      </Button>
      <Button asChild size="sm" variant="default">
        <Link href="/sign-up">新規登録</Link>
      </Button>
    </div>
  );
}
