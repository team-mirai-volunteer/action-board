"use client";

import { signOutAction } from "@/app/actions";
import MyAvatar from "@/components/my-avatar";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Bell,
  ChevronRight,
  Home,
  LogOut,
  MapPin,
  Settings,
} from "lucide-react";
import Link from "next/link";
import * as React from "react";

interface SlideMenuProps {
  user: {
    id: string;
    email?: string;
  };
}

export default function SlideMenu({ user }: SlideMenuProps) {
  return (
    <Sheet>
      <SheetTrigger
        aria-label="ユーザーメニューを開く"
        data-testid="usermenubutton"
      >
        <MyAvatar className="w-8 h-8" />
      </SheetTrigger>
      <SheetContent side="right" className="w-80 sm:w-96">
        <SheetHeader>
          <SheetTitle>メニュー</SheetTitle>
        </SheetHeader>
        <div className="mt-6">
          <Accordion type="multiple" className="w-full">
            <AccordionItem value="navigation">
              <AccordionTrigger className="text-base font-medium">
                <div className="flex items-center gap-2">
                  <Home className="h-4 w-4" />
                  ナビゲーション
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2 pl-6">
                  <SheetClose asChild>
                    <Link
                      href="/"
                      className="flex items-center gap-2 py-2 text-sm hover:text-primary transition-colors"
                    >
                      <ChevronRight className="h-3 w-3" />
                      ホーム
                    </Link>
                  </SheetClose>
                  <SheetClose asChild>
                    <Link
                      href="/map/posting"
                      className="flex items-center gap-2 py-2 text-sm hover:text-primary transition-colors"
                    >
                      <ChevronRight className="h-3 w-3" />
                      機関誌配布マップ
                    </Link>
                  </SheetClose>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="account">
              <AccordionTrigger className="text-base font-medium">
                <div className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  アカウント
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2 pl-6">
                  <SheetClose asChild>
                    <Link
                      href="/settings/profile"
                      className="flex items-center gap-2 py-2 text-sm hover:text-primary transition-colors"
                    >
                      <ChevronRight className="h-3 w-3" />
                      プロフィール設定
                    </Link>
                  </SheetClose>
                  <div className="flex items-center gap-2 py-2 text-sm hover:text-primary transition-colors cursor-pointer">
                    <ChevronRight className="h-3 w-3" />
                    <Bell className="h-3 w-3" />
                    お知らせ
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <div className="mt-6 pt-4 border-t">
            <form action={signOutAction}>
              <button
                type="submit"
                className="flex items-center gap-2 w-full py-3 px-2 text-sm text-destructive hover:bg-destructive/10 rounded-md transition-colors"
                data-testid="sign-out"
              >
                <LogOut className="h-4 w-4" />
                ログアウト
              </button>
            </form>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
