"use client";

import { useEffect } from "react";
import { trackContactClick } from "@/lib/analytics";

/**
 * Counts WhatsApp and phone clicks wherever they appear.
 *
 * One delegated listener on the document rather than an onClick on each link.
 * The same two destinations are rendered by the top bar, the footer, the
 * mobile menu, the floating contact dock and the per-product "Order on
 * WhatsApp" button — five components today and more later. Wiring each one
 * means a new contact link added next month is silently uncounted, and the
 * campaign optimises on a number that is quietly wrong.
 *
 * Mounted once in the root layout. Renders nothing.
 */
export default function ContactClickTracker() {
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const target = e.target;
      if (!(target instanceof Element)) return;
      const link = target.closest("a");
      if (!link) return;

      const href = link.getAttribute("href") ?? "";
      // `closest` is used rather than reading e.target directly because the
      // click usually lands on the icon or label inside the anchor.
      if (/wa\.me|api\.whatsapp\.com/.test(href)) {
        trackContactClick("whatsapp", link.dataset.contact ?? undefined);
      } else if (href.startsWith("tel:")) {
        trackContactClick("phone", link.dataset.contact ?? undefined);
      }
    };

    // Capture phase: a link that stops propagation, or a navigation that tears
    // the page down, must not lose the event on the way up.
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  return null;
}
