import type { Metadata } from "next";
import "./globals.css";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://my-fashion-gadget-store.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "FG Trend Tech | Elevated Style & Everyday Tech",
    template: "%s | FG Trend Tech",
  },
  description:
    "Shop Men's & Women's Fashion, Men's & Women's Footwear, Beauty Products, Gadgets & Mobile Accessories with Cash on Delivery from Mymensingh.",
  openGraph: {
    type: "website",
    siteName: "FG Trend Tech",
    title: "FG Trend Tech | Elevated Style & Everyday Tech",
    description:
      "Shop Men's & Women's Fashion, Men's & Women's Footwear, Beauty Products, Gadgets & Mobile Accessories with Cash on Delivery from Mymensingh.",
    url: SITE_URL,
    images: [
      {
        url: "/hero-banner.jpg",
        width: 1200,
        height: 630,
        alt: "FG Trend Tech Storefront Banner",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "FG Trend Tech | Elevated Style & Everyday Tech",
    description:
      "Shop Men's & Women's Fashion, Men's & Women's Footwear, Beauty Products, Gadgets & Mobile Accessories with Cash on Delivery from Mymensingh.",
    images: ["/hero-banner.jpg"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}