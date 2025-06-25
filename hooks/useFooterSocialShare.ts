import { useCallback } from 'react';

export function useFooterSocialShare() {
  const handleLineShare = useCallback(() => {
    const shareUrl = window.location.href;
    const lineIntentUrl = `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(shareUrl)}`;
    window.open(lineIntentUrl, "_blank", "noopener,noreferrer");
  }, []);

  const handleTwitterShare = useCallback(() => {
    const shareUrl = window.location.href;
    const message = "チームみらい Action Board - あなたの周りの人にもアクションボードを届けよう！";
    const twitterIntentUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(twitterIntentUrl, "_blank", "noopener,noreferrer");
  }, []);

  const handleFacebookShare = useCallback(() => {
    const shareUrl = window.location.href;
    const facebookIntentUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
    window.open(facebookIntentUrl, "_blank", "noopener,noreferrer");
  }, []);

  const handleCopyUrl = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      console.log('URLをコピーしました');
    } catch (error) {
      try {
        const textArea = document.createElement("textarea");
        textArea.value = window.location.href;
        textArea.style.position = "fixed";
        textArea.style.opacity = "0";
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
        console.log('URLをコピーしました（フォールバック）');
      } catch (fallbackError) {
        console.error('URLのコピーに失敗:', fallbackError);
      }
    }
  }, []);

  return {
    handleLineShare,
    handleTwitterShare,
    handleFacebookShare,
    handleCopyUrl,
  };
}
