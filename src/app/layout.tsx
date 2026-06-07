import type { Metadata } from "next";
import { Inter, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import AnimatedCursor from "@/components/cursor/AnimatedCursor";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import AlertTicker from "@/components/layout/AlertTicker";
import NewsletterModal from "@/components/newsletter/NewsletterModal";

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
  title: {
    default: "Raghav Mahajan — Cybersecurity Analyst | SOC | Blue Team",
    template: "%s | raghv.dev",
  },
  description:
    "Cybersecurity portfolio of Raghav Mahajan — SOC Analyst in Training, Blue Team defender, homelab builder, and secure software developer. Edmonton, Alberta, Canada.",
  keywords: [
    "SOC Analyst", "Cybersecurity", "Blue Team", "Threat Detection",
    "Incident Response", "SIEM", "Wazuh", "Splunk", "Edmonton", "Canada",
  ],
  authors: [{ name: "Raghav Mahajan", url: "https://raghv.dev" }],
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://raghv.dev"),
  openGraph: {
    title: "Raghav Mahajan — Cybersecurity Analyst | SOC | Blue Team",
    description: "Defensive security practitioner building real-world detection and response capabilities.",
    url: "https://raghv.dev",
    siteName: "raghv.dev",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${inter.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable}`}
    >
      <body className="grain bg-[#0a0a0a] text-[#f5f5f5] antialiased overflow-x-hidden">
        <AnimatedCursor />
        <Navbar />
        <main className="relative z-10">{children}</main>
        <Footer />
        <AlertTicker />
        <NewsletterModal />
      </body>
    </html>
  );
}
