import type { Metadata } from "next";
import { EB_Garamond, Public_Sans } from "next/font/google";
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
      <body className="min-h-dvh">{children}</body>
    </html>
  );
}
