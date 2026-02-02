"use client";

type Props = {
  message: string;
  missionSlug: string;
  url?: string;
};

export function ShareTwitterButton({ message, missionSlug, url }: Props) {
  const shareUrl = url ?? `${window.location.origin}/missions/${missionSlug}`;
  const handleShare = () => {
    const twitterIntentUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(twitterIntentUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <button
      type="button"
      onClick={handleShare}
      className="w-[50px] h-[50px] rounded-full hover:opacity-80 transition-opacity"
      aria-label="Xでシェア"
    >
      <img
        src="/img/icon-X2x.png"
        alt="X"
        className="w-full h-full object-contain"
      />
    </button>
  );
}
