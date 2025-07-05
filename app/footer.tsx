"use client";

import { UsefulLinksSection } from "@/components/footer";
import { useFooterAuth } from "@/hooks/useFooterAuth";
import Link from "next/link";

export default function Footer() {
  const { user, loading, error, isAuthenticated } = useFooterAuth();

  if (error) {
    console.error("Footer認証エラー:", error);
  }

  return (
    <footer className="w-full mt-16 border-t border-border bg-background md:container md:mx-auto">
      <UsefulLinksSection
        user={user}
        loading={loading}
        isAuthenticated={isAuthenticated}
      />

      <div className="px-4 md:container md:mx-auto py-8">
        {/* 下部のコピーライト */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex gap-6 text-sm">
            <Link
              href="https://team-mir.ai/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-primary transition-colors duration-200 block"
            >
              運営組織
            </Link>
            <Link
              href="/terms"
              className="text-muted-foreground hover:text-primary transition-colors duration-200"
            >
              利用規約
            </Link>
            <Link
              href="/privacy"
              className="text-muted-foreground hover:text-primary transition-colors duration-200"
            >
              プライバシーポリシー
            </Link>
            <Link
              href="https://team-mirai.notion.site/204f6f56bae1800da8d5dd9c61dd7cd1?pvs=105"
              className="text-muted-foreground hover:text-primary transition-colors duration-200"
              target="_blank"
              rel="noopener noreferrer"
            >
              ご意見箱
            </Link>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2025 Team Mirai. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
