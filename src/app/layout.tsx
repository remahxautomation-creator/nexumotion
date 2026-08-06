import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Cairo } from "next/font/google";
import "./globals.css";
import TopBar from "@/components/layout/TopBar";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { prisma } from "@/lib/prisma";
import { getLocale } from "@/i18n/server";
import { isRtl } from "@/i18n/dictionaries";
import { I18nProvider } from "@/i18n/client";
import SiteGuide from "@/components/chat/SiteGuide";
import ContactDock from "@/components/chat/ContactDock";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const jetbrains = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains" });
const cairo = Cairo({ subsets: ["arabic", "latin"], variable: "--font-cairo" });

export const metadata: Metadata = {
  title: {
    default: "NexuMotion — Industrial Automation Parts | Egypt, MENA & Africa",
    template: "%s | NexuMotion",
  },
  description:
    "NexuMotion supplies genuine industrial automation parts across Egypt, the Middle East and Africa — PLCs, VFDs, HMIs, sensors and more, with the technical data engineers need to specify them.",

  // Declared by hand because the files live in public/, not in this directory.
  // A metadata icon placed in app/ becomes a generated route with the image
  // inlined into the Worker script: three of them added ~190 KB of base64 and
  // pushed the bundle past Cloudflare's 3 MiB limit, which Prisma's WASM query
  // engine already fills 2.24 MiB of. From public/ they are static assets on
  // the assets binding and cost the Worker script nothing.
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "64x64", type: "image/x-icon" },
      { url: "/icon.png", sizes: "256x256", type: "image/png" },
    ],
    apple: [{ url: "/apple-icon.png", sizes: "180x180", type: "image/png" }],
  },
};

/**
 * Categories for the header mega-menu.
 *
 * Every page renders through this layout, including statically prerendered
 * ones like /_not-found — and the build runs where no database is reachable.
 * A failure here must degrade to an empty menu rather than fail the build, or
 * take the whole site down if the database is briefly unavailable.
 */
async function getNavCategories() {
  try {
    return await prisma.category.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
      select: { id: true, name: true, slug: true },
    });
  } catch {
    return [];
  }
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [categories, locale] = await Promise.all([getNavCategories(), getLocale()]);

  const rtl = isRtl(locale);

  // Applied before first paint so the page never flashes the wrong theme.
  // Runs ahead of hydration and only touches the root attribute, so server and
  // client markup stay identical.
  const noFlashTheme = `(function(){try{var c=localStorage.getItem('autoparts-theme')||'system';var d=c==='dark'||(c==='system'&&window.matchMedia('(prefers-color-scheme: dark)').matches);document.documentElement.setAttribute('data-theme',d?'dark':'light')}catch(e){}})()`;

  return (
    <html lang={locale} dir={rtl ? "rtl" : "ltr"} suppressHydrationWarning>
      <body
        className={`${inter.variable} ${jetbrains.variable} ${cairo.variable} ${
          rtl ? "font-arabic" : ""
        } min-h-screen flex flex-col antialiased`}
      >
        <script dangerouslySetInnerHTML={{ __html: noFlashTheme }} />
        <I18nProvider locale={locale}>
          <TopBar />
          <Header categories={categories} />
          <main className="flex-1">{children}</main>
          <Footer />
          <SiteGuide />
          <ContactDock />
        </I18nProvider>
      </body>
    </html>
  );
}
