import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Inter, Space_Grotesk, JetBrains_Mono, Anton } from "next/font/google";
import "./globals.css";
import "./case-file.css";
import { validateEnv } from "@/lib/env";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";

// Google Tag Manager container. Tags inside it (GA4 etc.) are managed in the GTM dashboard; any
// new host a tag loads from must also be allowed in the CSP in src/proxy.ts.
const GTM_ID = "GTM-MNDJBFV4";

// GA4 property for www.raghv.dev, wired directly (not only via GTM) so pageviews are
// guaranteed to reach the property. The CSP already allows googletagmanager.com scripts
// and *.google-analytics.com / *.analytics.google.com beacons (see src/proxy.ts).
const GA_ID = "G-70FNMH9P4X";

if (process.env.NODE_ENV === "production") validateEnv();
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import AlertTicker from "@/components/layout/AlertTicker";
import NewsletterModal from "@/components/newsletter/NewsletterModal";
import { ConsentBanner } from "@/components/layout/ConsentBanner";
import { PublicChrome } from "@/components/layout/PublicChrome";
import { CfScope } from "@/components/casefile/CfScope";
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

/* Heavy condensed display face for the case-file public design (headlines only). */
const anton = Anton({
  variable: "--font-anton",
  subsets: ["latin"],
  weight: "400",
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
  alternates: {
    canonical: site.url,
    types: { "application/rss+xml": `${site.url}/rss.xml`, "application/feed+json": `${site.url}/blog/feed.json` },
  },
  openGraph: {
    title: site.title,
    description: site.description,
    url: site.url,
    siteName: site.name,
    type: "website",
    locale: "en_CA",
  },
  twitter: { card: "summary_large_image", title: site.title, description: site.description },
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/icon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/icon-16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 },
  },
  formatDetection: { telephone: false },
  category: "technology",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f3efe6" },
    { media: "(prefers-color-scheme: dark)", color: "#16140f" },
  ],
};

/**
 * Theme, set before first paint so nobody sees the wrong one: a saved manual
 * choice wins; otherwise the visitor's own clock decides (light 07:00-19:00
 * local, dark the rest). Keep in sync with ThemeToggle's rule.
 */
const THEME_SCRIPT = `(function(){try{var v=localStorage.getItem("cf-theme");var m=(v==="light"||v==="dark")?v:"auto";var t=m;if(m==="auto"){var h=new Date().getHours();t=(h>=7&&h<19)?"light":"dark";}var d=document.documentElement;d.dataset.theme=t;d.dataset.themeMode=m;}catch(e){document.documentElement.dataset.theme="light";document.documentElement.dataset.themeMode="auto";}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en-CA"
      data-scroll-behavior="smooth"
      data-theme="light"
      suppressHydrationWarning
      className={`${inter.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable} ${anton.variable}`}
    >
      <body className="bg-[var(--bg)] text-[var(--text)] antialiased">
        <Script id="cf-theme-init" strategy="beforeInteractive">
          {THEME_SCRIPT}
        </Script>
        {/* Google Tag Manager, loaded once the page has finished loading (lazyOnload) so its
            117 KB never competes with the page's own code. GTM's "tag checker" may say the
            snippet isn't in <head>; tags still fire normally. */}
        <Script id="gtm" strategy="lazyOnload">
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
        {/* GA4 (gtag.js), loaded after the page becomes interactive so it never competes
            with first paint. Consent behaviour is unchanged: analytics loads regardless of
            the banner choice, exactly as the privacy/cookies pages state. */}
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
          strategy="afterInteractive"
        />
        <Script id="ga4-init" strategy="afterInteractive">
          {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${GA_ID}');`}
        </Script>
        <SiteJsonLd />
        <PublicChrome>
          <Navbar />
        </PublicChrome>
        <main className="relative z-10">
          <CfScope>{children}</CfScope>
        </main>
        <PublicChrome>
          <Footer />
          <AlertTicker />
          <NewsletterModal />
          <ConsentBanner />
        </PublicChrome>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
