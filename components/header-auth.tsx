import { signOutAction } from "@/app/actions";
import { OnboardingButton } from "@/components/onboarding/onboarding-button";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import MyAvatar from "./my-avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

export default async function AuthButton() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user /* && profile */ ? (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          aria-label="ユーザーメニューを開く"
          data-testid="usermenubutton"
        >
          <MyAvatar className="w-8 h-8" />
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
          side="bottom"
          align="end"
          sideOffset={4}
        >
          <DropdownMenuGroup>
            <DropdownMenuItem asChild>
              <Link href="/">ホーム</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/users/${user.id}`}>マイページ</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/map/posting">機関誌配布マップ</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/map/poster">ポスター掲示板マップ</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <OnboardingButton
                variant="link"
                className="w-full justify-start p-0 h-auto text-sm"
              >
                アクションボードとは？
              </OnboardingButton>
            </DropdownMenuItem>
            {/*
            <DropdownMenuItem asChild>
              <Link href="/missions">ミッション</Link>
            </DropdownMenuItem>
            */}
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem asChild>
              <Link href="/settings/profile">アカウント</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>お知らせ</DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <form action={signOutAction}>
            <DropdownMenuItem>
              <button
                type="submit"
                className="w-full text-left cursor-default"
                data-testid="sign-out"
              >
                ログアウト
              </button>
            </DropdownMenuItem>
          </form>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
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
