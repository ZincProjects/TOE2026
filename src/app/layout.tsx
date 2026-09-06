import type { Metadata, Viewport } from "next";
import { Fraunces, Inter } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import { TabBar } from "@/components/TabBar";

// Both faces are self-hosted by next/font, so no external font request is made and the
// content security policy can stay free of third-party origins.
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});
const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  display: "swap",
  axes: ["SOFT", "WONK"],
});

export const metadata: Metadata = {
  title: {
    default: "TOE — The Opportunity Engine",
    template: "%s · TOE",
  },
  description:
    "Match your degree, skills and projects against the opportunities on the career fair floor, " +
    "grounded in O*NET occupational evidence.",
  applicationName: "TOE",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: "#f7efe3",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} ${fraunces.variable}`}>
      <body className="antialiased">
        <a
          href="#main"
          className="sr-only rounded-full bg-rust px-4 py-2 text-paper focus:not-sr-only
                       focus:absolute focus:top-3 focus:left-3 focus:z-50"
        >
          Skip to content
        </a>

        <header className="sticky top-0 z-30 border-b border-line/70 bg-cream/85 backdrop-blur-sm">
          <div className="shell flex h-14 items-center justify-between">
            <Link href="/" className="flex items-baseline gap-2">
              <span className="font-display text-xl font-bold tracking-tight text-rust">
                TOE
              </span>
              <span className="hidden text-xs font-medium text-ink-soft sm:inline">
                The Opportunity Engine
              </span>
            </Link>
            <span className="text-xs font-medium text-ink-faint">
              Career Fair 2026
            </span>
          </div>
        </header>

        <main id="main" className="shell">
          {children}
        </main>

        <footer className="shell pt-10 pb-8">
          <p className="border-t border-line pt-5 text-xs leading-relaxed text-ink-faint">
            TOE ranks opportunities from O*NET-aligned occupational evidence.
            Demonstration data only — companies, roles and booth numbers are
            illustrative. Your profile stays on this device.
          </p>
        </footer>

        <TabBar />
      </body>
    </html>
  );
}
