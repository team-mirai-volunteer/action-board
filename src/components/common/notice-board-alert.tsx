import Link from "next/link";

export default function NoticeBoardAlert() {
  return (
    <div className="flex justify-center w-full">
      <div
        className="w-full bg-yellow-50 text-yellow-900 p-4 flex justify-center"
        role="alert"
      >
        <div className="flex items-center gap-3">
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
            <span className="break-words text-sm">
              新シーズンが開始しました！ <br />
              レベルやランキングはシーズンごとにリセットされます。
              過去のランキングは
              <Link href="/seasons/season1/ranking" className="underline">
                アーカイブからご覧いただけます。
              </Link>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
