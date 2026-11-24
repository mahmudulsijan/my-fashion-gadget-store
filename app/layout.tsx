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
      var root = document.documentElement;
      var isAdminRoute = window.location.pathname.indexOf("/admin") === 0;

      // Storefront theme
      var mode = localStorage.getItem("maveron_theme_mode");
      var resolved = mode === "light" || mode === "night" ? mode : "night";
      root.setAttribute("data-maveron-theme", resolved);

      // Admin theme
      var adminMode = localStorage.getItem("fg_admin_theme_mode");
      var resolvedAdmin = adminMode === "day" || adminMode === "night" ? adminMode : "night";
      root.setAttribute("data-admin-theme", resolvedAdmin);

      var bg = "#09090B";
      var fg = "#F4F4F5";
      var scheme = "dark";

      if (isAdminRoute) {
        if (resolvedAdmin === "day") {
          bg = "#F4F5F7";
          fg = "#1E293B";
          scheme = "light";
        } else {
          bg = "#0B0C0E";
          fg = "#E4E4E7";
          scheme = "dark";
        }
      } else if (resolved === "light") {
        bg = "#F4F4F6";
        fg = "#111114";
        scheme = "light";
      }

      root.style.colorScheme = scheme;
      root.style.backgroundColor = bg;
      root.style.color = fg;
      if (document.body) {
        document.body.style.backgroundColor = bg;
        document.body.style.color = fg;
      }
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
        <style
          dangerouslySetInnerHTML={{
            __html: `
              html[data-maveron-theme="light"]:not([data-admin-theme="day"]),
              html[data-maveron-theme="light"]:not([data-admin-theme="day"]) body {
                background-color: #F4F4F6 !important;
                color: #111114 !important;
              }
              html[data-maveron-theme="night"]:not([data-admin-theme="day"]),
              html[data-maveron-theme="night"]:not([data-admin-theme="day"]) body {
                background-color: #09090B !important;
                color: #F4F4F5 !important;
              }
              html[data-admin-theme="day"],
              html[data-admin-theme="day"] body {
                background-color: #F4F5F7 !important;
                color: #1E293B !important;
              }
              html[data-admin-theme="night"],
              html[data-admin-theme="night"] body {
                background-color: #0B0C0E !important;
                color: #E4E4E7 !important;
              }
            `,
          }}
        />
      </head>
      <body suppressHydrationWarning className="min-h-screen">
        {children}
      </body>
    </html>
  );
}