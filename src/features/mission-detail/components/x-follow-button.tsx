import Script from "next/script";

type Props = {
  screenName: string;
  className?: string;
};

export function XFollowButton({ screenName, className }: Props) {
  return (
    <div className={className}>
      <a
        href={`https://x.com/${screenName}`}
        className="twitter-follow-button"
        data-show-count="false"
      >
        Follow @{screenName}
      </a>
      <Script async src="https://platform.x.com/widgets.js" />
    </div>
  );
}
