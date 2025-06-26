import {
  AccordionSection,
  type AccordionSectionItem,
} from "@/components/ui/accordion-section";
import { FOOTER_CONFIG } from "@/config/footer";
import type { FooterAccordionSection } from "@/types/footer";
import type { User } from "@supabase/supabase-js";
import { AccordionContentGenerator } from "./useful-links";

interface UsefulLinksSectionProps {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
}

export function UsefulLinksSection({
  user,
  loading,
  isAuthenticated,
}: UsefulLinksSectionProps) {
  const accordionItems: AccordionSectionItem[] =
    FOOTER_CONFIG.accordionSections.map((section: FooterAccordionSection) => ({
      value: section.value,
      title: section.title,
      content: (
        <AccordionContentGenerator
          section={section}
          loading={loading}
          isAuthenticated={isAuthenticated}
        />
      ),
    }));

  const defaultOpenSections = FOOTER_CONFIG.accordionSections
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
