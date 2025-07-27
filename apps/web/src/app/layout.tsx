import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ConvexProvider } from "@/components/ConvexProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "InvestIQ - Elite IB Prep",
  description:
    "Master investment banking concepts with our elite preparation platform.",
  keywords: "investment banking, IB prep, finance, quiz, elite",
  authors: [{ name: "InvestIQ Team" }],
  viewport: "width=device-width, initial-scale=1",
  themeColor: "#1e3a8a",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${inter.className} antialiased bg-gray-50`}>
        <ConvexProvider>
          {children}
        </ConvexProvider>
      </body>
    </html>
  );
}
