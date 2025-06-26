import {
  AccordionSection,
  type AccordionSectionItem,
} from "@/components/ui/accordion-section";
import { USEFUL_LINKS_CONFIG } from "@/config/footer";
import type { FooterAccordionSection } from "@/types/footer";
import type { User } from "@supabase/supabase-js";
import { AccordionContentGenerator } from "./useful-links";

interface UsefulLinksSectionProps {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
}

/**
 * チームみらいお役立ちサイトセクション
 * 認証状態に基づいてリンクの表示/非表示を制御するアコーディオン形式のセクション
 */
export function UsefulLinksSection({
  user,
  loading,
  isAuthenticated,
}: UsefulLinksSectionProps) {
  // 設定からアコーディオンアイテムを生成
  const accordionItems: AccordionSectionItem[] =
    USEFUL_LINKS_CONFIG.accordionSections.map(
      (section: FooterAccordionSection) => ({
        value: section.value,
        title: section.title,
        content: (
          <AccordionContentGenerator
            section={section}
            loading={loading}
            isAuthenticated={isAuthenticated}
          />
        ),
      }),
    );

  // デフォルトで開くセクションを抽出
  const defaultOpenSections = USEFUL_LINKS_CONFIG.accordionSections
    .filter((section: FooterAccordionSection) => section.defaultOpen)
    .map((section: FooterAccordionSection) => section.value);

  return (
    <div className="bg-white py-12 max-w-6xl mx-auto">
      <AccordionSection
        items={accordionItems}
        type="multiple"
        defaultValue={defaultOpenSections}
      />
    </div>
  );
}
