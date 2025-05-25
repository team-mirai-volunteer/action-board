import { signOutAction } from "@/app/actions";
import HeaderAuth from "@/components/header-auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { createClient } from "@/lib/supabase/server";
import { Menu } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default async function Navbar() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <nav className="sticky top-0 z-50 max-w-3xl mx-auto flex justify-center bg-white h-16">
      <div className="px-2 md:px-0 w-full flex justify-between items-center text-sm border-b border-b-foreground/10 ">
        <div className="flex gap-5 items-center font-semibold min-w-[60px]">
          <Link href="/">
            <Image src="/img/logo.png" alt="logo" width={57} height={48} />
          </Link>
        </div>
        <div className="gap-6 items-center font-semibold hidden sm:flex">
          <Link href="/">ダッシュボード</Link>
          {/* <Link href="/missions">ミッション</Link> */}
          <HeaderAuth />
        </div>
        <div className="flex gap-6 items-center font-semibold sm:hidden">
          {user ? (
            <HeaderAuth />
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger>
                <Menu role="menu" />
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                side="bottom"
                align="end"
                sideOffset={4}
              >
                <DropdownMenuGroup>
                  <DropdownMenuItem asChild>
                    <Link href="/">ダッシュボード</Link>
                  </DropdownMenuItem>
                  {/*
                  <DropdownMenuItem asChild>
                    <Link href="/missions">ミッション</Link>
                  </DropdownMenuItem>
                  */}
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/sign-in">ログイン</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/sign-up">サインアップ</Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </nav>
  );
}
