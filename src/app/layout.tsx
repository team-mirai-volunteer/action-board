import { ThemeProvider } from "next-themes";
import Navbar from "@/components/common/navbar";
import { generateRootMetadata, notoSansJP } from "@/lib/utils/metadata";
import Footer from "./footer";
import "./globals.css";
import Script from "next/script";
import NextTopLoader from "nextjs-toploader";
import { Suspense } from "react";
import { Toaster } from "@/components/ui/sonner";
import { CampaignCodeHandlerWrapper } from "@/features/campaign-attribution/components/campaign-code-handler-wrapper";
import { ReferralCodeHandlerWrapper } from "@/features/referral/components/referral-code-handler-wrapper";

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;
const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID;

//metadata.tsxでmetadataを管理
export const generateMetadata = generateRootMetadata;

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
        {GTM_ID && (
          <>
            <noscript>
              <iframe
                src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
                height="0"
                width="0"
                style={{ display: "none", visibility: "hidden" }}
                title="Google Tag Manager"
              />
            </noscript>
            <Script id="gtm-init" strategy="afterInteractive">
              {`
              (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
              new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
              j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
              'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
              })(window,document,'script','dataLayer','${GTM_ID}');
            `}
            </Script>
          </>
        )}
        <NextTopLoader showSpinner={false} color="#2aa693" />
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
          <main className="flex flex-col items-center mt-8">
            <Suspense>
              <ReferralCodeHandlerWrapper />
            </Suspense>
            <Suspense>
              <CampaignCodeHandlerWrapper />
            </Suspense>
            {children}
          </main>
          <Footer />
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
