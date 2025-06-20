import Script from "next/script";

type Props = {
  channelId: string;
  className?: string;
};

export function YouTubeSubscribeButton({ channelId, className }: Props) {
  return (
    <div className={className}>
      <div
        className="g-ytsubscribe"
        data-channelid={channelId}
        data-layout="full"
        data-count="default"
      />
      <Script
        src="https://apis.google.com/js/platform.js"
        strategy="afterInteractive"
      />
    </div>
  );
}
