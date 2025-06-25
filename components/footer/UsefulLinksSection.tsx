import {
  AccordionSection,
  type AccordionSectionItem,
} from "@/components/ui/accordion-section";
import { FOOTER_CONFIG } from "@/config/footer";
import type { FooterAccordionSection } from "@/types/footer";
import type { User } from "@supabase/supabase-js";
import Link from "next/link";
import type React from "react";

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
