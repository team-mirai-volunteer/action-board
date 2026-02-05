import Link from "next/link";
import { EXTERNAL_LINKS } from "@/lib/constants/external-links";
import { Button } from "../ui/button";

export function FeedbackSection() {
  return (
    <div className="bg-white mx-auto py-12">
      <div className="px-4 md:container md:mx-auto text-center">
        <h2 className="text-xl font-bold mb-2">ご意見箱</h2>
        <p className="text-sm text-gray-600 mb-4 p-4">
          チームみらいアクションボードを より良いサービスにするため、
          <br />
          皆様のご意見・ご要望をお聞かせください。
          <br />
          いただいたフィードバックは 今後の改善に活用させていただきます。
        </p>
        <Button asChild variant="outline">
          <Link
            href={EXTERNAL_LINKS.feedback_poster_map}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="ポスターマップへのご意見フォーム（新しいタブで開きます）"
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
        </Button>
        <Button asChild variant="outline" className="ml-4 mt-4 md:mt-0">
          <Link
            href={EXTERNAL_LINKS.feedback_action_board}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="アクションボードへのご意見フォーム（新しいタブで開きます）"
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
        </Button>
      </div>
    </div>
  );
}
