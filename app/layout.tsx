import Navbar from "@/components/navbar";
import { notoSansJP } from "@/lib/metadata";
import { ThemeProvider } from "next-themes";
import Footer from "./footer";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { ToastProvider, ToastViewport } from "@/components/ui/toast";
import { generateRootMetadata } from "@/lib/metadata";
import Script from "next/script";

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

//metadata.tsxでmetadataを管理
export const metadata = {
  title: "チームみらい アクションボード",
  description:
    "政治活動をもっと身近に。政治活動をゲーム感覚で楽しめる、チームみらいのアクションボード。",
};

// Next.js 15でのviewport設定
export const viewport = {
  width: "device-width",
  initialScale: 1.0,
  maximumScale: 1.0,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className={notoSansJP.variable} suppressHydrationWarning>
      <body className="bg-background text-foreground">
        {GA_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
              strategy="afterInteractive"
            />
            <Script id="gtag-init" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${GA_ID}');
              `}
            </Script>
          </>
        )}
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Navbar />
          <main className="md:container md:mx-auto flex flex-col items-center">
            {children}
          </main>
          <Footer />
          <Toaster />
          <ToastProvider>
            <ToastViewport />
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
