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

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://evleniyoz.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: siteCopy.metadata.title,
  description: siteCopy.metadata.description,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: siteCopy.metadata.title,
    description: siteCopy.metadata.description,
    url: "/",
    siteName: siteCopy.metadata.title,
    locale: "tr_TR",
    type: "website",
    images: [
      {
        url: siteCopy.metadata.image,
        width: 1200,
        height: 630,
        alt: siteCopy.metadata.imageAlt,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteCopy.metadata.title,
    description: siteCopy.metadata.description,
    images: [
      {
        url: siteCopy.metadata.image,
        alt: siteCopy.metadata.imageAlt,
      },
    ],
  },
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
