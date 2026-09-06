import { privatePage } from "@/lib/seo";

/**
 * Exists only to carry metadata.
 *
 * page.tsx here is a Client Component, and Next does not allow a client module
 * to export `metadata` — the export is read during the server render. A layout
 * is the documented way to attach it without converting a working interactive
 * page into a server component.
 */
export const metadata = privatePage("Cart");

export default function CartLayout({ children }: { children: React.ReactNode }) {
  return children;
}
