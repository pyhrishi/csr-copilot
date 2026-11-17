import type { Metadata } from "next";
import { EB_Garamond, Public_Sans } from "next/font/google";

import { FictionBanner } from "@/components/shell/FictionBanner";
import { SideNav } from "@/components/shell/SideNav";
import { StoreHydrator } from "@/components/shell/StoreHydrator";
import { TopBar } from "@/components/shell/TopBar";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import "./globals.css";

const ebGaramond = EB_Garamond({
  variable: "--font-eb-garamond",
  subsets: ["latin"],
  weight: ["600"],
  display: "swap",
});

const publicSans = Public_Sans({
  variable: "--font-public-sans",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: { default: "CSR Copilot", template: "%s · CSR Copilot" },
  description:
    "Clickable prototype of AI-assisted Clinical Study Report authoring, on fictional study data.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${ebGaramond.variable} ${publicSans.variable} antialiased`}>
      <body className="min-h-dvh">
        <TooltipProvider>
          <StoreHydrator />
          <a
            href="#main"
            className="sr-only z-50 rounded-md bg-card px-3 py-2 text-sm font-semibold text-ink focus:not-sr-only focus:fixed focus:top-2 focus:left-2"
          >
            Skip to content
          </a>
          <div className="sticky top-0 z-40">
            <FictionBanner />
            <TopBar />
          </div>
          <div className="flex">
            <SideNav />
            <main id="main" tabIndex={-1} className="min-w-0 flex-1 outline-none">
              {children}
            </main>
          </div>
          <Toaster position="bottom-right" />
        </TooltipProvider>
      </body>
    </html>
  );
}
