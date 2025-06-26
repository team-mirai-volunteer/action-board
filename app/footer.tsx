"use client";

import {
  CopyrightSection,
  FeedbackSection,
  OfficialSNSSection,
  SocialShareSection,
  UsefulLinksSection,
} from "@/components/footer";
import { useFooterAuth } from "@/hooks/useFooterAuth";
import { useFooterSocialShare } from "@/hooks/useFooterSocialShare";

export default function Footer() {
  const { user, loading, error, isAuthenticated } = useFooterAuth();
  const {
    handleLineShare,
    handleTwitterShare,
    handleFacebookShare,
    handleCopyUrl,
  } = useFooterSocialShare(user);

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
