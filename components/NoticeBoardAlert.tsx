import React from "react";

export default function NoticeBoardAlert() {
  return (
    <div className="flex justify-center w-full mt-8">
      <div
        className="w-full max-w-xl bg-yellow-50 text-yellow-900 p-4 mb-8 flex items-center gap-3"
        role="alert"
      >
        <svg
          className="w-6 h-6 text-yellow-500 flex-shrink-0"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          viewBox="0 0 24 24"
          role="img"
          aria-label="お知らせ"
        >
          <title>お知らせ</title>
          <circle
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="2"
            fill="white"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 8v4m0 4h.01"
          />
        </svg>
        <div className="flex-1 min-w-0">
          <span className="break-words">
            アクションボードは{" "}
            <span className="font-semibold">7/19(土) 23:59</span>{" "}
            をもってサービスを終了します。
            <br className="hidden sm:block" />
            ミッション達成報告はお早めに！
          </span>
        </div>
      </div>
    </div>
  );
}
