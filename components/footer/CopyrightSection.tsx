import { FOOTER_CONFIG } from "@/config/footer";
import Link from "next/link";

export function CopyrightSection() {
  return (
    <div className="bg-white py-8">
      <div className="px-4 md:container md:mx-auto">
        <div className="text-center">
          <div className="flex justify-center items-center gap-2 text-sm text-teal-600">
            <Link
              href="https://team-mir.ai/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-teal-700 transition-colors duration-200"
            >
              運営組織
            </Link>
            <span>|</span>
            <Link
              href="/terms"
              className="hover:text-teal-700 transition-colors duration-200"
            >
              利用規約
            </Link>
            <span>|</span>
            <Link
              href="/privacy"
              className="hover:text-teal-700 transition-colors duration-200"
            >
              プライバシーポリシー
            </Link>
            <span>|</span>
            <Link
              href={FOOTER_CONFIG.feedback.url}
              className="hover:text-teal-700 transition-colors duration-200"
              target="_blank"
              rel="noopener noreferrer"
            >
              ご意見箱
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
