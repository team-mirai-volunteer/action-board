import type { FooterAccordionStyling, FooterLink } from "@/types/footer";
import Link from "next/link";
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
        <Link
          key={link.url}
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          className={styling.linkClassName}
        >
          <div className={styling.titleClassName}>{link.title}</div>
          <div className={styling.descriptionClassName}>{link.description}</div>
        </Link>
      ))}
    </div>
  );
}
