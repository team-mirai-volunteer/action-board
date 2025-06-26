import Link from "next/link";
import type { FooterLink, FooterAccordionStyling } from "@/types/footer";

interface LinkItemProps {
  link: FooterLink;
  styling: FooterAccordionStyling;
}

export function LinkItem({ link, styling }: LinkItemProps) {
  return (
    <Link
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      className={styling.linkClassName}
    >
      <div className={styling.titleClassName}>{link.title}</div>
      <div className={styling.descriptionClassName}>{link.description}</div>
    </Link>
  );
}
