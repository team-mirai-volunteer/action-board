"use client";

type Props = {
  children?: React.ReactNode;
  missionId: string;
  className?: string;
  url?: string;
};

export function ShareLineButton({
  children,
  missionId,
  className,
  url,
}: Props) {
  // SNSシェア用のハンドラ関数
  const shareUrl = url ?? `${window.location.origin}/missions/${missionId}`;
  const handleShare = () => {
    const lineIntentUrl = `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(shareUrl)}`;
    window.open(lineIntentUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <button
      type="button"
      onClick={handleShare}
      className="w-[50px] h-[50px] rounded-full hover:opacity-80 transition-opacity md:hidden"
      aria-label="LINEでシェア"
    >
      <img
        src="/img/icon-line2x.png"
        alt="LINE"
        className="w-full h-full object-contain"
      />
    </button>
  );
}
