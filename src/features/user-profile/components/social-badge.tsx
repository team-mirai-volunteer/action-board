import Image from "next/image";
import { Badge } from "@/components/ui/badge";

interface SocialBadgeProps {
  title: string;
  href: string;
  logoSrc: string;
  logoAlt: string;
  logoSize: number;
}

const isValidUrl = (url: string) => {
  try {
    const parsedUrl = new URL(url);
    return ["http:", "https:"].includes(parsedUrl.protocol);
  } catch {
    return false;
  }
};

function SocialBadge({
  title,
  href,
  logoSrc,
  logoAlt,
  logoSize,
}: SocialBadgeProps) {
  if (!isValidUrl(href)) {
    console.warn("Invalid URL provided to SocialBadge:", href);
    return null;
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="font-medium no-underline"
      style={{
        fontFamily:
          "Chirp, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
      }}
    >
      <Badge
        variant="outline"
        className="flex items-center gap-2 px-3 py-1 text-[15px] bg-white transition cursor-pointer"
      >
        <Image src={logoSrc} alt={logoAlt} width={logoSize} height={logoSize} />
        {title}
      </Badge>
    </a>
  );
}

export { SocialBadge };
