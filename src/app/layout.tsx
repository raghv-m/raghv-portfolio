import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Inter, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { validateEnv } from "@/lib/env";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";

// Google Tag Manager container. Tags inside it (GA4 etc.) are managed in the GTM dashboard; any
// new host a tag loads from must also be allowed in the CSP in src/proxy.ts.
const GTM_ID = "GTM-MNDJBFV4";

if (process.env.NODE_ENV === "production") validateEnv();
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import AlertTicker from "@/components/layout/AlertTicker";
import NewsletterModal from "@/components/newsletter/NewsletterModal";
import { PublicChrome } from "@/components/layout/PublicChrome";
import { SiteJsonLd } from "@/components/seo/JsonLd";
import { site } from "@/config/site";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: site.title, template: "%s | raghv.dev" },
  description: site.description,
  applicationName: site.name,
  keywords: [...site.keywords],
  authors: [{ name: site.person, url: site.url }],
  creator: site.person,
  alternates: { canonical: site.url },
  openGraph: {
    title: site.title,
    description: site.description,
    url: site.url,
    siteName: site.name,
    type: "website",
    locale: "en_CA",
  },
  twitter: { card: "summary_large_image", title: site.title, description: site.description },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 },
  },
  formatDetection: { telephone: false },
  category: "technology",
};

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
  colorScheme: "dark",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en-CA"
      data-scroll-behavior="smooth"
      className={`${inter.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable}`}
    >
      <body className="grain bg-[#0a0a0a] text-[#f5f5f5] antialiased overflow-x-hidden">
        {/* Google Tag Manager. beforeInteractive puts it in <head> of the server HTML, where GTM
            asks for it and where Google's tag checker looks. */}
        <Script id="gtm" strategy="beforeInteractive">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${GTM_ID}');`}
        </Script>
        <noscript>
          <iframe
            src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>
        <SiteJsonLd />
        <PublicChrome>
          <Navbar />
        </PublicChrome>
        <main className="relative z-10">{children}</main>
        <PublicChrome>
          <Footer />
          <AlertTicker />
          <NewsletterModal />
        </PublicChrome>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
