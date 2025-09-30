"use client";

type Props = {
  children?: React.ReactNode;
  missionId: string;
  className?: string;
  url?: string;
};

export function ShareFacebookButton({
  children,
  missionId,
  className,
  url,
}: Props) {
  // SNSシェア用のハンドラ関数
  const shareUrl = url ?? `${window.location.origin}/missions/${missionId}`;
  const handleShare = () => {
    const facebookIntentUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
    window.open(facebookIntentUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <button
      type="button"
      onClick={handleShare}
      className="w-[50px] h-[50px] rounded-full hover:opacity-80 transition-opacity"
      aria-label="Facebookでシェア"
    >
      <img
        src="/img/icon-facebook2x.png"
        alt="Facebook"
        className="w-full h-full object-contain"
      />
    </button>
  );
}
