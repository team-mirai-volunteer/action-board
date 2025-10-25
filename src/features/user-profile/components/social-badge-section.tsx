import { SocialBadge } from "./social-badge";

const SocialBadgeSection = ({
  x_username,
  github_username,
}: { x_username: string | null; github_username: string | null }) => {
  return (
    <div className="flex justify-center gap-2">
      {x_username && (
        <SocialBadge
          title={`@${x_username}`}
          href={`https://x.com/${x_username}`}
          logoSrc="/img/x_logo.png"
          logoAlt="Xのロゴ"
          logoSize={16}
        />
      )}
      {github_username && (
        <SocialBadge
          title={github_username}
          href={`https://github.com/${github_username}`}
          logoSrc="/img/github-logo.png"
          logoAlt="GitHubのロゴ"
          logoSize={20}
        />
      )}
    </div>
  );
};
export default SocialBadgeSection;
