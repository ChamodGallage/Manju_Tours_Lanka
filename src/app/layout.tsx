import type { Metadata, Viewport } from "next";
import { Outfit, Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import MobileBottomBar from "@/components/layout/MobileBottomBar";
import WhatsAppFloat from "@/components/layout/WhatsAppFloat";
import { generateOrganizationSchema } from "@/lib/seo";
import { getSiteSettings } from "@/lib/queries/site-settings";
import { normalizeSafeUrl } from "@/lib/sanitize";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#0C5A70",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://manjutourslanka.com";
  const title = settings.seo_title_default || "Manju Tours Lanka | Your Personal Sri Lanka Travel Planner";
  const description = settings.seo_description_default || "Private chauffeured tours, custom holiday itineraries, wildlife safaris, and authentic Sri Lankan travel planning based in Hikkaduwa.";
  const socialImage = normalizeSafeUrl(settings.seo_og_image) || "/images/og-banner.webp";

  return {
    metadataBase: new URL(siteUrl),
    title: { default: title, template: "%s | Manju Tours Lanka" },
    description,
    keywords: settings.seo_keywords_default.split(",").map((keyword) => keyword.trim()).filter(Boolean),
    authors: [{ name: settings.company_name || "Manju Tours Lanka" }],
    creator: settings.company_name || "Manju Tours Lanka",
    openGraph: {
      type: "website",
      locale: "en_US",
      url: siteUrl,
      siteName: settings.company_name || "Manju Tours Lanka",
      title,
      description,
      images: [{ url: socialImage, alt: `${settings.company_name || "Manju Tours Lanka"} travel photography` }],
    },
    twitter: { card: "summary_large_image", title, description, images: [socialImage] },
    robots: { index: true, follow: true },
    icons: { icon: settings.favicon_url || "/images/logo.png", shortcut: settings.favicon_url || "/images/logo.png", apple: settings.favicon_url || "/images/logo.png" },
  };
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLd = generateOrganizationSchema();

  return (
    <html lang="en" data-scroll-behavior="smooth" className={`${outfit.variable} ${inter.variable} scroll-smooth`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-screen flex flex-col bg-[#FBF9F4] text-[#17202A] selection:bg-[#E06D53]/20 selection:text-[#0C5A70]">
        <Header />
        <main className="flex-grow">{children}</main>
        <Footer />
        <WhatsAppFloat />
        <MobileBottomBar />
      </body>
    </html>
  );
}
