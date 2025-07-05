import type { FooterLink } from "@/types/footer";
import Link from "next/link";
import { LoadingState } from "./LoadingState";

interface LinksListProps {
  links: FooterLink[];
  loading: boolean;
  isAuthenticated: boolean;
}

export function LinksList({ links, loading, isAuthenticated }: LinksListProps) {
  const visibleLinks = links.filter((link) => link.public || isAuthenticated);

  if (loading) {
    return <LoadingState />;
  }

  return (
    <div className="space-y-4 p-4">
      {visibleLinks.map((link) => (
        <Link
          key={link.url}
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex gap-4 hover:bg-gray-50 p-2 rounded transition-colors"
        >
          <div className="text-sm font-bold text-black">{link.title}</div>
          <div className="text-xs text-gray-600">{link.description}</div>
        </Link>
      ))}
    </div>
  );
}
