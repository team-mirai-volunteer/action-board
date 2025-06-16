"use client";
import { Button } from "@/components/ui/button";
import { BookOpenIcon, FacebookIcon } from "lucide-react";
import type { FC } from "react";

interface OfficialSnsProps {
  className?: string;
}

const LINE_URL = "https://line.me/R/ti/p/@465hhyop?oat_content=url&ts=05062204";
const YOUTUBE_URL = "https://www.youtube.com/channel/UCiMwbmcCSMORJ-85XWhStBw";
const X_URL = "https://x.com/team_mirai_jp";
const INSTAGRAM_URL = "https://www.instagram.com/annotakahiro2024";
const FACEBOOK_URL = "https://www.facebook.com/teammirai.official";
const NOTE_URL = "https://note.com/annotakahiro24";

/**
 * チームみらい公式SNSコンポーネント
 */
const OfficialSns: FC<OfficialSnsProps> = () => {
  return (
    <>
      <div className="text-center mb-4">
        <h2 className="text-xl font-bold text-gray-800">チームみらい公式SNS</h2>
        <p className="text-sm text-gray-600 mt-2">
          最新情報の活動情報や舞台裏を、いち早くお届けします。ぜひ、フォロー＆チャンネル登録で応援してください！
        </p>
      </div>
      <div className="flex justify-center space-x-3">
        {/* LINE */}
        <Button
          size="icon"
          variant="outline"
          className="rounded-full h-10 w-10 bg-[#06c755] hover:bg-[#06c755]/90 text-white border-none"
          onClick={() => window.open(LINE_URL, "_blank")}
          aria-label="公式LINE"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-labelledby="line-title"
            role="img"
          >
            <title id="line-title">LINE Logo</title>
            <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
          </svg>
        </Button>

        {/* YouTube */}
        <Button
          size="icon"
          variant="outline"
          className="rounded-full h-10 w-10 bg-[#ff0000] hover:bg-[#ff0000]/90 text-white border-none"
          onClick={() => window.open(YOUTUBE_URL, "_blank")}
          aria-label="公式YouTube"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-labelledby="youtube-title"
            role="img"
          >
            <title id="youtube-title">YouTube Logo</title>
            <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" />
          </svg>
        </Button>

        {/* X (旧Twitter) */}
        <Button
          size="icon"
          variant="outline"
          className="rounded-full h-10 w-10 bg-black hover:bg-gray-800 text-white border-none"
          onClick={() => window.open(X_URL, "_blank")}
          aria-label="公式X(旧Twitter)"
        >
          <img
            src="/img/x-logo.svg"
            alt="X Logo"
            width="20"
            height="20"
            className="w-5 h-5"
            title="X Logo"
            aria-labelledby="x-title"
          />
        </Button>

        {/* Instagram */}
        <Button
          size="icon"
          variant="outline"
          className="rounded-full h-10 w-10 text-white border-none"
          onClick={() => window.open(INSTAGRAM_URL, "_blank")}
          aria-label="公式Instagram"
        >
          <img
            src="/img/instagram-logo.svg"
            alt="Instagram Logo"
            width="20"
            height="20"
            className="w-5 h-5"
            title="Instagram Logo"
            aria-labelledby="instagram-title"
          />
        </Button>

        {/* Facebook */}
        <Button
          size="icon"
          variant="outline"
          className="rounded-full h-10 w-10 bg-[#1877f2] hover:bg-[#1877f2]/90 text-white border-none"
          onClick={() => window.open(FACEBOOK_URL, "_blank")}
          aria-label="公式Facebook"
        >
          <FacebookIcon className="h-5 w-5" />
        </Button>

        {/* note */}
        <Button
          size="icon"
          variant="outline"
          className="rounded-full h-10 w-10 bg-white hover:bg-gray-100 text-black border border-gray-300"
          onClick={() => window.open(NOTE_URL, "_blank")}
          aria-label="公式note"
        >
          <img
            src="/img/note-logo.svg"
            alt="Note Logo"
            width="20"
            height="20"
            className="w-5 h-5"
            title="Note Logo"
            aria-labelledby="note-title"
          />
        </Button>
      </div>
    </>
  );
};

export default OfficialSns;
