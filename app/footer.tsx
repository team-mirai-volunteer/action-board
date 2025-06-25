"use client";

import {
  AccordionSection,
  type AccordionSectionItem,
} from "@/components/ui/accordion-section";
import { FOOTER_CONFIG } from "@/config/footer";
import { useFooterAuth } from "@/hooks/useFooterAuth";
import { useFooterSocialShare } from "@/hooks/useFooterSocialShare";
import type { FooterAccordionSection, FooterSNSPlatform } from "@/types/footer";
import type { User } from "@supabase/supabase-js";
import { Copy, Edit, Instagram, Youtube } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type React from "react";

export default function Footer() {
  const { user, loading, error, isAuthenticated } = useFooterAuth();
  const {
    handleLineShare,
    handleTwitterShare,
    handleFacebookShare,
    handleCopyUrl,
  } = useFooterSocialShare();

  if (error) {
    console.error("Footer認証エラー:", error);
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

      <UsefulLinksSection
        user={user}
        loading={loading}
        isAuthenticated={isAuthenticated}
      />

      <CopyrightSection />
    </footer>
  );
}

function SocialShareSection({
  onLineShare,
  onTwitterShare,
  onFacebookShare,
  onCopyUrl,
}: {
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
              <Copy className="w-5 h-5" />
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
          チームみらいアクションボードをより良いサービスにするため、
          <br />
          皆様のご意見・ご要望をお聞かせください。
          <br />
          いただいたフィードバックは今後の改善に活用させていただきます。
        </p>
        <Link
          href={FOOTER_CONFIG.feedback.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center whitespace-nowrap ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary hover:bg-primary/90 h-10 px-8 max-w-xs rounded-full py-6 text-base font-bold text-white shadow-md hover:shadow-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-5 h-5 mr-2"
            aria-hidden="true"
          >
            <path d="M12 20h9" />
            <path d="M16.376 3.622a1 1 0 0 1 3.002 3.002L7.368 18.635a2 2 0 0 1-.855.506l-2.872.838a.5.5 0 0 1-.62-.62l.838-2.872a2 2 0 0 1 .506-.854z" />
          </svg>
          ご意見箱を開く
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
            {(
              Object.entries(FOOTER_CONFIG.snsLinks) as [
                FooterSNSPlatform,
                string,
              ][]
            ).map(([platform, url]) => (
              <Link
                key={platform}
                href={url}
                className="w-12 h-12 rounded-full flex items-center justify-center hover:opacity-80 transition-opacity"
                aria-label={`${platform}公式アカウント`}
              >
                <Image
                  src={`${FOOTER_CONFIG.images.basePath}/${FOOTER_CONFIG.images.icons[platform]}`}
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

function generateAccordionContent(
  section: FooterAccordionSection,
  loading: boolean,
  isAuthenticated: boolean,
): React.ReactNode {
  if (section.contentType === "links" && section.content.links) {
    const links = section.content.links.filter(
      (link) => link.public || isAuthenticated,
    );

    return (
      <div className={section.styling.containerClassName}>
        {loading ? (
          <div className="text-center py-4">
            <span className="text-gray-500">読み込み中...</span>
          </div>
        ) : (
          links.map((link) => (
            <Link
              key={link.url}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className={section.styling.linkClassName}
            >
              <div className={section.styling.titleClassName}>{link.title}</div>
              <div className={section.styling.descriptionClassName}>
                {link.description}
              </div>
            </Link>
          ))
        )}
      </div>
    );
  }

  return null;
}

function UsefulLinksSection({
  user,
  loading,
  isAuthenticated,
}: {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
}) {
  const accordionItems: AccordionSectionItem[] =
    FOOTER_CONFIG.accordionSections.map((section: FooterAccordionSection) => ({
      value: section.value,
      title: section.title,
      content: generateAccordionContent(section, loading, isAuthenticated),
    }));

  const defaultOpenSections = FOOTER_CONFIG.accordionSections
    .filter((section: FooterAccordionSection) => section.defaultOpen)
    .map((section: FooterAccordionSection) => section.value);

  return (
    <div className="bg-white py-12">
      <AccordionSection
        items={accordionItems}
        type="multiple"
        defaultValue={defaultOpenSections}
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
