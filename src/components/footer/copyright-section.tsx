import { EXTERNAL_LINKS } from "@/lib/constants/external-links";
import Link from "next/link";

export function CopyrightSection() {
  return (
    <div className="bg-white py-8">
      <div className="px-4 md:container md:mx-auto">
        <div className="text-center">
          {/* Desktop layout - single row */}
          <div className="hidden min-[571px]:flex justify-center items-center gap-2 text-sm">
            <Link
              href={EXTERNAL_LINKS.team_mirai_main}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:opacity-70 transition-opacity duration-200"
              style={{ color: "#089781" }}
            >
              運営組織
            </Link>
            <span className="text-black">|</span>
            <Link
              href="/terms"
              className="hover:opacity-70 transition-opacity duration-200"
              style={{ color: "#089781" }}
            >
              利用規約
            </Link>
            <span className="text-black">|</span>
            <Link
              href="/privacy"
              className="hover:opacity-70 transition-opacity duration-200"
              style={{ color: "#089781" }}
            >
              プライバシーポリシー
            </Link>
            <span className="text-black">|</span>
            <Link
              href={EXTERNAL_LINKS.feedback_action_board}
              className="hover:opacity-70 transition-opacity duration-200"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "#089781" }}
            >
              ご意見箱
            </Link>
            <span className="text-black">|</span>
            <Link
              href={EXTERNAL_LINKS.faq}
              className="hover:opacity-70 transition-opacity duration-200"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "#089781" }}
            >
              よくあるご質問
            </Link>
          </div>

          {/* Mobile layout - two rows for screens ≤570px */}
          <div className="max-[570px]:flex max-[570px]:flex-col max-[570px]:items-center max-[570px]:gap-4 min-[571px]:hidden">
            {/* First row */}
            <div className="flex justify-center items-center gap-2 text-sm">
              <Link
                href={EXTERNAL_LINKS.team_mirai_main}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:opacity-70 transition-opacity duration-200"
                style={{ color: "#089781" }}
              >
                運営組織
              </Link>
              <span className="text-black">|</span>
              <Link
                href="/terms"
                className="hover:opacity-70 transition-opacity duration-200"
                style={{ color: "#089781" }}
              >
                利用規約
              </Link>
              <span className="text-black">|</span>
              <Link
                href="/privacy"
                className="hover:opacity-70 transition-opacity duration-200"
                style={{ color: "#089781" }}
              >
                プライバシーポリシー
              </Link>
            </div>

            {/* Second row */}
            <div className="flex justify-center items-center gap-2 text-sm">
              <Link
                href={EXTERNAL_LINKS.feedback_action_board}
                className="hover:opacity-70 transition-opacity duration-200"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "#089781" }}
              >
                ご意見箱
              </Link>
              <span className="text-black">|</span>
              <Link
                href={EXTERNAL_LINKS.faq}
                className="hover:opacity-70 transition-opacity duration-200"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "#089781" }}
              >
                よくあるご質問
              </Link>
            </div>
          </div>
        </div>
        <p className="text-sm text-muted-foreground text-center mt-4">
          © 2025 Team Mirai. All rights reserved.
        </p>
      </div>
    </div>
  );
}
