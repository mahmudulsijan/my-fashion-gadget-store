import type { Metadata } from "next";
import "./globals.css";

const BRAND_NAME = "MAVÉRON";
const BRAND_TAGLINE = "Elevate Your Everyday";
const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://my-fashion-gadget-store.vercel.app";
const LOGO_ICON = "/images/maveron-logo.png";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${BRAND_NAME} — ${BRAND_TAGLINE}`,
    template: `%s | ${BRAND_NAME}`,
  },
  description: `${BRAND_NAME} — ${BRAND_TAGLINE}. Shop Men's Fashion, Women's Fashion, Men's Footwear, Women's Footwear, Gadgets, Beauty Products, and Mobile Accessories across Bangladesh.`,
  icons: {
    icon: LOGO_ICON,
    shortcut: LOGO_ICON,
    apple: LOGO_ICON,
  },
  openGraph: {
    type: "website",
    siteName: BRAND_NAME,
    title: `${BRAND_NAME} — ${BRAND_TAGLINE}`,
    description: `${BRAND_NAME} — ${BRAND_TAGLINE}. Shop Men's Fashion, Women's Fashion, Men's Footwear, Women's Footwear, Gadgets, Beauty Products, and Mobile Accessories across Bangladesh.`,
    url: SITE_URL,
    images: [
      {
        url: "/hero-banner.jpg",
        width: 1200,
        height: 630,
        alt: `${BRAND_NAME} — ${BRAND_TAGLINE} Banner`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${BRAND_NAME} — ${BRAND_TAGLINE}`,
    description: `${BRAND_NAME} — ${BRAND_TAGLINE}. Shop Men's Fashion, Women's Fashion, Men's Footwear, Women's Footwear, Gadgets, Beauty Products, and Mobile Accessories across Bangladesh.`,
    images: ["/hero-banner.jpg"],
  },
};

const themeInitScript = `
  (function () {
    try {
      var mode = localStorage.getItem("maveron_theme_mode");
      var resolved = mode === "light" || mode === "night" ? mode : "night";
      var root = document.documentElement;
      root.setAttribute("data-maveron-theme", resolved);
      root.style.colorScheme = resolved === "light" ? "light" : "dark";
      root.style.backgroundColor = resolved === "light" ? "#F4F4F6" : "#09090B";
    } catch (e) {}
  })();
`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body suppressHydrationWarning className="min-h-screen">
        {children}
      </body>
    </html>
  );
}