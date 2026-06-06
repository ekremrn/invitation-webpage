import type { Metadata } from "next";
import { Cormorant_Garamond, Jost } from "next/font/google";
import { siteCopy } from "@/content/copy";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  subsets: ["latin", "latin-ext"],
  weight: ["300", "400", "500"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});

const jost = Jost({
  subsets: ["latin", "latin-ext"],
  weight: ["300", "400"],
  variable: "--font-jost",
  display: "swap",
});

export const metadata: Metadata = {
  title: siteCopy.metadata.title,
  description: siteCopy.metadata.description,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" className={`h-full antialiased ${cormorant.variable} ${jost.variable}`}>
      <body className="min-h-svh text-foreground">{children}</body>
    </html>
  );
}
