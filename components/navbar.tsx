import HeaderAuth from "@/components/header-auth";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { createClient } from "@/lib/supabase/server";
import { Home, Menu } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default async function Navbar() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <nav className="sticky top-0 z-50 w-full flex justify-center bg-white border-b border-b-foreground/10 h-16">
      <div className="px-4 md:container md:mx-auto w-full flex justify-between items-center text-sm">
        <div className="flex gap-5 items-center font-semibold min-w-[60px]">
          <Link href="/" className="flex items-center gap-4">
            <Image src="/img/logo.png" alt="logo" width={57} height={48} />
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
              <Sheet>
                <SheetTrigger
                  aria-label="ナビゲーションメニューを開く"
                  data-testid="navmenubutton"
                >
                  <Menu />
                </SheetTrigger>
                <SheetContent side="right" className="w-80">
                  <SheetHeader>
                    <SheetTitle>メニュー</SheetTitle>
                  </SheetHeader>
                  <div className="mt-6 space-y-4">
                    <SheetClose asChild>
                      <Link
                        href="/"
                        className="flex items-center gap-2 py-3 text-base hover:text-primary transition-colors"
                      >
                        <Home className="h-4 w-4" />
                        ホーム
                      </Link>
                    </SheetClose>
                    <div className="space-y-2 pt-4 border-t">
                      <SheetClose asChild>
                        <Link
                          href="/sign-in"
                          className="flex items-center gap-2 py-2 text-sm hover:text-primary transition-colors"
                        >
                          ログイン
                        </Link>
                      </SheetClose>
                      <SheetClose asChild>
                        <Link
                          href="/sign-up"
                          className="flex items-center gap-2 py-2 text-sm hover:text-primary transition-colors"
                        >
                          新規登録
                        </Link>
                      </SheetClose>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </>
        )}
      </div>
    </nav>
  );
}
