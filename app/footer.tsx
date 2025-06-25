"use client";

import { AccordionSection, AccordionSectionItem } from "@/components/ui/accordion-section";
import { useFooterAuth } from "@/hooks/useFooterAuth";
import { useFooterSocialShare } from "@/hooks/useFooterSocialShare";
import { FOOTER_CONFIG } from "@/config/footer";
import type { User } from "@supabase/supabase-js";
import {
  Copy,
  Edit,
  Instagram,
  Youtube,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function Footer() {
  const { user, loading, error, isAuthenticated } = useFooterAuth();
  const { handleLineShare, handleTwitterShare, handleFacebookShare, handleCopyUrl } = useFooterSocialShare();

  if (error) {
    console.error('Footer認証エラー:', error);
  }

  return (
    <footer className="w-full mt-16 bg-background">
      <SocialShareSection 
        onLineShare={handleLineShare}
        onTwitterShare={handleTwitterShare}
        onFacebookShare={handleFacebookShare}
        onCopyUrl={handleCopyUrl}
      />
      
      <FeedbackSection />
      
      <OfficialSNSSection />
      
      <UsefulLinksSection user={user} loading={loading} isAuthenticated={isAuthenticated} />
      
      <CopyrightSection />
    </footer>
  );
}

function SocialShareSection({ onLineShare, onTwitterShare, onFacebookShare, onCopyUrl }: {
  onLineShare: () => void;
  onTwitterShare: () => void;
  onFacebookShare: () => void;
  onCopyUrl: () => void;
}) {
  return (
    <div className="bg-gray-50 py-12">
      <div className="px-4 md:container md:mx-auto">
        <div className="text-center">
          <h2 className="text-xl font-bold mb-4 flex items-center justify-center gap-2">
            📢 このページをシェアしよう！
          </h2>
          <p className="text-gray-600 mb-8">
            あなたの周りの人にもアクションボードを届けよう。
          </p>
          <div className="flex justify-center gap-4 mb-8">
            <button
              type="button"
              onClick={onLineShare}
              className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white hover:bg-green-600 transition-colors"
              aria-label="LINEでシェア"
            >
              <Image
                src="https://team-mir.ai/images/sns/icon_line.png"
                alt="LINE"
                width={48}
                height={48}
              />
            </button>
            <button
              type="button"
              onClick={onTwitterShare}
              className="w-12 h-12 bg-black rounded-full flex items-center justify-center text-white hover:bg-gray-800 transition-colors"
              aria-label="Xでシェア"
            >
              <Image
                src="https://team-mir.ai/images/sns/icon_x.png"
                alt="X (Twitter)"
                width={48}
                height={48}
              />
            </button>
            <button
              type="button"
              onClick={onFacebookShare}
              className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white hover:bg-blue-700 transition-colors"
              aria-label="Facebookでシェア"
            >
              <Image
                src="https://team-mir.ai/images/sns/icon_facebook.png"
                alt="Facebook"
                width={48}
                height={48}
              />
            </button>
            <button
              type="button"
              onClick={onCopyUrl}
              className="w-12 h-12 bg-gray-400 rounded-full flex items-center justify-center text-white hover:bg-gray-500 transition-colors"
              aria-label="URLをコピー"
            >
              <Copy className="w-12 h-12" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function FeedbackSection() {
  return (
    <div className="bg-white py-12">
      <div className="px-4 md:container md:mx-auto text-center">
        <h2 className="text-xl font-bold mb-4">ご意見をお聞かせください</h2>
        <p className="text-gray-600 mb-8">
          チームみらいアクションボードより良いサービスにするため、
          <br />
          フィードバックをお寄せください。
        </p>
        <Link
          href={FOOTER_CONFIG.feedback.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-teal-500 text-white px-8 py-3 rounded-full hover:bg-teal-600 transition-colors font-medium"
        >
          <Edit className="w-5 h-5" />
          フィードバックする
        </Link>
      </div>
    </div>
  );
}

function OfficialSNSSection() {
  return (
    <div className="bg-teal-50 py-12">
      <div className="px-4 md:container md:mx-auto text-center">
        <h2 className="text-xl font-bold mb-4">チームみらい公式SNS</h2>
        <p className="text-gray-600 mb-8">
          最新の活動情報や舞台裏を、いち早くお届けします。ぜひフォロー＆チャンネル登録で応援してください！
        </p>
        <div className="bg-white rounded-lg p-6">
          <div className="flex gap-4 justify-center">
            {Object.entries(FOOTER_CONFIG.snsLinks).map(([platform, url]) => (
              <Link
                key={platform}
                href={url}
                className="w-12 h-12 rounded-full flex items-center justify-center hover:opacity-80 transition-opacity"
                aria-label={`${platform}公式アカウント`}
              >
                <Image
                  src={`${FOOTER_CONFIG.images.basePath}/${FOOTER_CONFIG.images.icons[platform as keyof typeof FOOTER_CONFIG.images.icons]}`}
                  alt={platform}
                  width={48}
                  height={48}
                  className="rounded-full"
                />
              </Link>
            ))}
          </div>
        </div>

        <div className="text-center mt-8">
          <Image
            src="/img/logo.png"
            alt="チームみらい"
            width={64}
            height={64}
            className="mx-auto mb-4"
          />
        </div>
      </div>
    </div>
  );
}

function UsefulLinksSection({ user, loading, isAuthenticated }: { 
  user: User | null; 
  loading: boolean; 
  isAuthenticated: boolean; 
}) {
  const availableLinks = FOOTER_CONFIG.usefulLinks.filter(link => 
    link.public || isAuthenticated
  );

  const accordionItems: AccordionSectionItem[] = [
    {
      value: "useful-sites",
      title: "チームみらいお役立ちサイト",
      content: (
        <div className="space-y-4 p-4">
          {loading ? (
            <div className="text-center py-4">
              <span className="text-gray-500">読み込み中...</span>
            </div>
          ) : (
            availableLinks.map((link, index) => (
              <Link
                key={index}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex gap-4 hover:bg-gray-50 p-2 rounded transition-colors"
              >
                <div className="text-sm font-bold text-black">
                  {link.title}
                </div>
                <div className="text-xs text-gray-600">
                  {link.description}
                </div>
              </Link>
            ))
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="bg-white py-12">
      <AccordionSection
        items={accordionItems}
        type="multiple"
        defaultValue={["useful-sites"]}
      />
    </div>
  );
}

function CopyrightSection() {
  return (
    <div className="border-t border-border bg-background">
      <div className="px-4 md:container md:mx-auto py-8">
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
              href={FOOTER_CONFIG.feedback.url}
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
    </div>
  );
}
