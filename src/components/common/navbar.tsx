import HeaderAuth from "@/components/common/header-auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { OnboardingButton } from "@/features/onboarding/components/onboarding-button";
import { getUser } from "@/features/user-profile/services/profile";
import { Menu } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default async function Navbar() {
  const user = await getUser();

  return (
    <nav className="sticky top-0 z-50 w-full flex justify-center bg-white border-b border-b-foreground/10 h-16">
      <div className="px-4 md:container md:mx-auto w-full flex justify-between items-center text-sm">
        <div className="flex gap-5 items-center font-semibold min-w-[60px]">
          <Link href="/" className="flex items-center gap-4">
            <Image
              src="/img/logo_shiro.png"
              alt="logo"
              width={57}
              height={48}
            />
            <div className="text-lg">アクションボード</div>
          </Link>
        </div>
        {user ? (
          <div className="flex gap-6 items-center">
            <div className="font-semibold hidden sm:flex">
              <Link href="/">ホーム</Link>
            </div>
            <HeaderAuth />
          </div>
        ) : (
          <>
            <div className="gap-6 items-center font-semibold hidden sm:flex">
              <Link href="/">ホーム</Link>
              <HeaderAuth />
            </div>
            <div className="flex gap-6 items-center font-semibold sm:hidden">
              <DropdownMenu>
                <DropdownMenuTrigger
                  aria-label="ナビゲーションメニューを開く"
                  data-testid="navmenubutton"
                >
                  <Menu />
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
                  side="bottom"
                  align="end"
                  sideOffset={4}
                >
                  <DropdownMenuGroup>
                    <DropdownMenuItem asChild>
                      <Link href="/">ホーム</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/map/posting">ポスティングマップ</Link>
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
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/sign-in">ログイン</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/sign-up">新規登録</Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </>
        )}
      </div>
    </nav>
  );
}
