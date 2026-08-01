import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Cairo } from "next/font/google";
import "./globals.css";
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
  title: { default: "AutoParts MENA — Industrial Automation Parts", template: "%s | AutoParts MENA" },
  description:
    "Industrial automation parts for Egypt, Middle East & Africa. 50+ brands, 5000+ SKUs — PLCs, VFDs, HMIs, sensors, and more. Genuine parts, fast delivery.",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [categories, locale] = await Promise.all([
    prisma.category.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
      select: { id: true, name: true, slug: true },
    }),
    getLocale(),
  ]);

  const rtl = isRtl(locale);

  return (
    <html lang={locale} dir={rtl ? "rtl" : "ltr"}>
      <body
        className={`${inter.variable} ${jetbrains.variable} ${cairo.variable} ${
          rtl ? "font-arabic" : ""
        } min-h-screen flex flex-col antialiased`}
      >
        <I18nProvider locale={locale}>
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
