"use client";

type Props = {
  children?: React.ReactNode;
  message: string;
  missionSlug: string;
  className?: string;
  url?: string;
};

export function ShareButton({ message, missionSlug, url }: Props) {
  const shareUrl = url ?? `${window.location.origin}/missions/${missionSlug}`;
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "チームみらい Action Board",
          text: message,
          url: shareUrl,
        });
      } catch (error) {
        // シェアがキャンセルされた場合やエラー時は何もしない
        console.log("Share was cancelled or failed:", error);
      }
    } else {
      alert("このブラウザはWebシェアAPIに対応していません。");
    }
  };

  return (
    <button
      type="button"
      onClick={handleShare}
      className="w-[50px] h-[50px] rounded-full hover:opacity-80 transition-opacity md:hidden"
      aria-label="その他のサービスでシェア"
    >
      <img
        src="/img/icon-Shere2x.png"
        alt="シェア"
        className="w-full h-full object-contain"
      />
    </button>
  );
}
