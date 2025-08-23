import Script from "next/script";

type Props = {
  channelId: string;
  className?: string;
};

export function YouTubeSubscribeButton({ channelId, className }: Props) {
  const handleScriptError = () => {
    console.error("Failed to load YouTube platform script");
  };

  return (
    <div className={className}>
      <div
        className="g-ytsubscribe"
        data-channelid={channelId}
        data-layout="full"
        data-count="default"
        role="button"
        aria-label={`YouTube チャンネル ${channelId} を購読`}
        tabIndex={0}
      />
      <Script
        src="https://apis.google.com/js/platform.js"
        strategy="afterInteractive"
        onError={handleScriptError}
      />
    </div>
  );
}
