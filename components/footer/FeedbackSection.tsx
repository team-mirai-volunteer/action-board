import { EXTERNAL_LINKS } from "@/lib/links";
import Link from "next/link";

export function FeedbackSection() {
  return (
    <div className="bg-white py-12 border-t border-gray-200">
      <div className="px-4 md:container md:mx-auto text-center">
        <h2 className="text-xl font-bold mb-4">ご意見箱</h2>
        <p className="text-sm text-gray-600 mb-8 p-4">
          チームはやまアクションボードを より良いサービスにするため、
          <br />
          皆様のご意見・ご要望をお聞かせください。
          <br />
          いただいたフィードバックは 今後の改善に活用させていただきます。
        </p>
        <Link
          href={EXTERNAL_LINKS.feedback_poster_map}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="ポスターマップへのご意見フォーム（新しいタブで開きます）"
          className="inline-flex items-center justify-center md:mr-4 ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary hover:bg-primary/90 h-10 px-8 max-w-xs rounded-full py-6 text-base font-bold text-white shadow-md hover:shadow-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 mb-8"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-5 h-5 mr-2"
            aria-hidden="true"
          >
            <path d="M12 20h9" />
            <path d="M16.376 3.622a1 1 0 0 1 3.002 3.002L7.368 18.635a2 2 0 0 1-.855.506l-2.872.838a.5.5 0 0 1-.62-.62l.838-2.872a2 2 0 0 1 .506-.854z" />
          </svg>
          ポスターマップへのご意見
        </Link>
        <Link
          href={EXTERNAL_LINKS.feedback_action_board}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="アクションボードへのご意見フォーム（新しいタブで開きます）"
          className="inline-flex items-center justify-center whitespace-nowrap ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary hover:bg-primary/90 h-10 px-8 max-w-xs rounded-full py-6 text-base font-bold text-white shadow-md hover:shadow-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-5 h-5 mr-2"
            aria-hidden="true"
          >
            <path d="M12 20h9" />
            <path d="M16.376 3.622a1 1 0 0 1 3.002 3.002L7.368 18.635a2 2 0 0 1-.855.506l-2.872.838a.5.5 0 0 1-.62-.62l.838-2.872a2 2 0 0 1 .506-.854z" />
          </svg>
          アクションボードへのご意見
        </Link>
      </div>
    </div>
  );
}
