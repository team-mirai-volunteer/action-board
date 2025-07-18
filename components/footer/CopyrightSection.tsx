import { EXTERNAL_LINKS } from "@/lib/constants";
import Link from "next/link";
import { FOOTER_CONFIG } from "./footer";

export function CopyrightSection() {
  return (
    <div className="bg-white py-8">
      <div className="px-4 md:container md:mx-auto">
        <div className="text-center">
          <div className="hidden xs570:flex justify-center items-center gap-2 text-sm">
            <Link
              href="https://team-mir.ai/"
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
              href={FOOTER_CONFIG.feedback.url}
              className="hover:opacity-70 transition-opacity duration-200"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "#089781" }}
            >
              ご意見箱
            </Link>
            <span className="text-black">|</span>
            <Link
              href={EXTERNAL_LINKS.FAQ}
              className="hover:opacity-70 transition-opacity duration-200"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "#089781" }}
            >
              よくあるご質問
            </Link>
          </div>

          <div className="xs570:flex xs570:flex-col xs570:items-center xs570:gap-4 hidden">
            <div className="flex justify-center items-center gap-2 text-sm">
              <Link
                href="https://team-mir.ai/"
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

            <div className="flex justify-center items-center gap-2 text-sm">
              <Link
                href={FOOTER_CONFIG.feedback.url}
                className="hover:opacity-70 transition-opacity duration-200"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "#089781" }}
              >
                ご意見箱
              </Link>
              <span className="text-black">|</span>
              <Link
                href={EXTERNAL_LINKS.FAQ}
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
