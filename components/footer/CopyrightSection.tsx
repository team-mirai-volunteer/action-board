import Link from "next/link";

export function CopyrightSection() {
  return (
    <div className="bg-gray-50 py-6">
      <div className="px-4 md:container md:mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex flex-wrap gap-6 text-sm justify-center md:justify-start">
            <Link
              href="https://team-mir.ai/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-primary transition-colors duration-200"
            >
              運営組織
            </Link>
            <Link
              href="/terms"
              className="text-muted-foreground hover:text-primary transition-colors duration-200"
            >
              利用規約
            </Link>
            <Link
              href="/privacy"
              className="text-muted-foreground hover:text-primary transition-colors duration-200"
            >
              プライバシーポリシー
            </Link>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2025 Team Mirai. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
