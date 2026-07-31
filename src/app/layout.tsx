import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { prisma } from "@/lib/prisma";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const jetbrains = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains" });

export const metadata: Metadata = {
  title: { default: "AutoParts MENA — Industrial Automation Parts", template: "%s | AutoParts MENA" },
  description:
    "Industrial automation parts for Egypt, Middle East & Africa. 50+ brands, 5000+ SKUs — PLCs, VFDs, HMIs, sensors, and more. Genuine parts, fast delivery.",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const categories = await prisma.category.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
    select: { id: true, name: true, slug: true },
  });

  return (
    <html lang="en">
      <body className={`${inter.variable} ${jetbrains.variable} min-h-screen flex flex-col antialiased`}>
        <Header categories={categories} />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
