import { EXTERNAL_LINKS } from "@/lib/constants";
import Link from "next/link";
import { FOOTER_CONFIG } from "./footer";

export function CopyrightSection() {
  return (
    <div className="bg-white py-8">
      <div className="px-4 md:container md:mx-auto">
        <div className="text-center">
          <div className="flex justify-center items-center gap-2 text-sm">
            <Link
              href="https://team-mir.ai/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-teal-700 transition-colors duration-200 text-teal-600"
            >
              運営組織
            </Link>
            <span>|</span>
            <Link
              href="/terms"
              className="hover:text-teal-700 transition-colors duration-200 text-teal-600"
            >
              利用規約
            </Link>
            <span>|</span>
            <Link
              href="/privacy"
              className="hover:text-teal-700 transition-colors duration-200 text-teal-600"
            >
              プライバシーポリシー
            </Link>
            <span>|</span>
            <Link
              href={FOOTER_CONFIG.feedback.url}
              className="hover:text-teal-700 transition-colors duration-200 text-teal-600"
              target="_blank"
              rel="noopener noreferrer"
            >
              ご意見箱
            </Link>
            <span>|</span>
            <Link
              href={EXTERNAL_LINKS.FAQ}
              className="hover:text-teal-700 transition-colors duration-200 text-teal-600"
              target="_blank"
              rel="noopener noreferrer"
            >
              よくあるご質問
            </Link>
          </div>
        </div>
        <p className="text-sm text-muted-foreground text-center mt-4">
          © 2025 Team Mirai. All rights reserved.
        </p>
      </div>
    </div>
  );
}
