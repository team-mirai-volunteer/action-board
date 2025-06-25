import type { FooterAccordionSection } from "@/types/footer";
import { LinksList } from "./LinksList";

interface AccordionContentGeneratorProps {
  section: FooterAccordionSection;
  loading: boolean;
  isAuthenticated: boolean;
}

export function AccordionContentGenerator({
  section,
  loading,
  isAuthenticated,
}: AccordionContentGeneratorProps) {
  if (section.contentType === "links" && section.content.links) {
    return (
      <LinksList
        links={section.content.links}
        styling={section.styling}
        loading={loading}
        isAuthenticated={isAuthenticated}
      />
    );
  }

  return null;
}
