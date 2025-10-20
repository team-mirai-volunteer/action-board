import { Badge } from "@/components/ui/badge";

interface SocialBadgeProps {
  username: string;
  platform: "x" | "github";
  href: string;
  logoSrc: string;
  logoAlt: string;
  logoSize: { width: number; height: number };
  showAtSymbol?: boolean;
}

const isValidUrl = (url: string) => {
  try {
    const parsedUrl = new URL(url);
    return ["http:", "https:"].includes(parsedUrl.protocol);
  } catch {
    return false;
  }
};

function SocialBadge(props: SocialBadgeProps) {
  const {
    username,
    platform,
    href,
    logoSrc,
    logoAlt,
    logoSize,
    showAtSymbol = false,
  } = props;

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
        className="flex items-center gap-2 px-3 py-1 text-[15px] hover:bg-emerald-50 transition cursor-pointer"
      >
        <img
          src={logoSrc}
          alt={logoAlt}
          style={{
            width: logoSize.width,
            height: logoSize.height,
            display: "block",
          }}
        />
        <span className="text-[#0F1419] hover:text-emerald-600">
          {showAtSymbol ? "@" : ""}
          {username}
        </span>
      </Badge>
    </a>
  );
}

export { SocialBadge };
