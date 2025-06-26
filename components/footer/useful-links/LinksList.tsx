import type { FooterAccordionStyling, FooterLink } from "@/types/footer";
import { LinkItem } from "./LinkItem";
import { LoadingState } from "./LoadingState";

interface LinksListProps {
  links: FooterLink[];
  styling: FooterAccordionStyling;
  loading: boolean;
  isAuthenticated: boolean;
}

export function LinksList({
  links,
  styling,
  loading,
  isAuthenticated,
}: LinksListProps) {
  const visibleLinks = links.filter((link) => link.public || isAuthenticated);

  if (loading) {
    return <LoadingState />;
  }

  return (
    <div className={styling.containerClassName}>
      {visibleLinks.map((link) => (
        <LinkItem key={link.url} link={link} styling={styling} />
      ))}
    </div>
  );
}
