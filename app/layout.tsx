import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Sora, Source_Sans_3 } from "next/font/google";
import "./globals.css";
import { getSettingsMap } from "@/server/repositories/settings.repository";
import { ToastViewport } from "@/components/shared/ToastViewport";
import { BookingModal } from "@/components/website/BookingModal";
import { siteUrl } from "@/lib/utils/cn";
import { resolveSiteIcon } from "@/lib/site-images";

const display = Sora({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const body = Source_Sans_3({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#612D05",
};

export async function generateMetadata(): Promise<Metadata> {
  try {
    const settings = await getSettingsMap();
    const icon = resolveSiteIcon(settings);
    const iconType = icon.endsWith(".png")
      ? "image/png"
      : icon.endsWith(".svg")
        ? "image/svg+xml"
        : icon.endsWith(".webp")
          ? "image/webp"
          : icon.endsWith(".jpg") || icon.endsWith(".jpeg")
            ? "image/jpeg"
            : undefined;
    return {
      metadataBase: new URL(siteUrl()),
      title: {
        default: settings["seo.default_title"] || settings["business.name"] || "TV Repair",
        template: `%s | ${settings["business.name"] || "TV Repair"}`,
      },
      description: settings["seo.default_description"] || "",
      icons: icon
        ? {
            icon: [{ url: icon, type: iconType }],
            shortcut: icon,
            apple: icon,
          }
        : undefined,
      verification: settings["seo.gsc"]
        ? { google: settings["seo.gsc"] }
        : undefined,
    };
  } catch {
    return { title: "TV Repair Service" };
  }
}

export default async function RootLayout({ children }: { children: ReactNode }) {
  let ga = "";
  let gtm = "";
  let icon = "";
  try {
    const settings = await getSettingsMap();
    ga = settings["seo.ga"] || process.env.GOOGLE_ANALYTICS_ID || "";
    gtm = settings["seo.gtm"] || process.env.GOOGLE_TAG_MANAGER_ID || "";
    icon = resolveSiteIcon(settings);
  } catch {
    ga = process.env.GOOGLE_ANALYTICS_ID || "";
    gtm = process.env.GOOGLE_TAG_MANAGER_ID || "";
  }

  return (
    <html lang="en" className={`${display.variable} ${body.variable} h-full antialiased`} data-scroll-behavior="smooth">
      <head>
        {icon ? (
          <>
            <link rel="icon" href={icon} />
            <link rel="shortcut icon" href={icon} />
            <link rel="apple-touch-icon" href={icon} />
          </>
        ) : null}
        {gtm ? (
          <script
            dangerouslySetInnerHTML={{
              __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':Date.now(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${gtm}');`,
            }}
          />
        ) : null}
        {ga ? (
          <>
            <script async src={`https://www.googletagmanager.com/gtag/js?id=${ga}`} />
            <script
              dangerouslySetInnerHTML={{
                __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${ga}');`,
              }}
            />
          </>
        ) : null}
      </head>
      <body className="min-h-full flex flex-col bg-paper text-ink overflow-x-hidden">
        {children}
        <ToastViewport />
        <BookingModal />
      </body>
    </html>
  );
}
