import type { Metadata } from "next";
import "./globals.css";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://my-fashion-gadget-store.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "ZAVERO — Explore Beyond Trends",
    template: "%s | ZAVERO",
  },
  description:
    "ZAVERO — Explore Beyond Trends. Shop Men's & Women's Fashion, Men's & Women's Footwear, Beauty Products, Gadgets & Mobile Accessories across Bangladesh.",
  icons: {
    icon: "/images/zavero-logo.png",
    shortcut: "/images/zavero-logo.png",
    apple: "/images/zavero-logo.png",
  },
  openGraph: {
    type: "website",
    siteName: "ZAVERO",
    title: "ZAVERO — Explore Beyond Trends",
    description:
      "ZAVERO — Explore Beyond Trends. Shop Men's & Women's Fashion, Men's & Women's Footwear, Beauty Products, Gadgets & Mobile Accessories across Bangladesh.",
    url: SITE_URL,
    images: [
      {
        url: "/hero-banner.jpg",
        width: 1200,
        height: 630,
        alt: "ZAVERO — Explore Beyond Trends Storefront Banner",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ZAVERO — Explore Beyond Trends",
    description:
      "ZAVERO — Explore Beyond Trends. Shop Men's & Women's Fashion, Men's & Women's Footwear, Beauty Products, Gadgets & Mobile Accessories across Bangladesh.",
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