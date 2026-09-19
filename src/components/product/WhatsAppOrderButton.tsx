"use client";

import { useState } from "react";
import { useT } from "@/i18n/client";
import { whatsAppOrderHref } from "@/lib/contact";
import WhatsAppIcon from "@/components/ui/WhatsAppIcon";

/**
 * "Order on WhatsApp" for a single product. Sits under the cart / inquiry
 * button on every product page: in this market most B2B orders close on
 * WhatsApp anyway, and a buyer who is ready to talk should not have to go
 * through a form first. The quantity travels with the message so the reply
 * can be a price, not a question.
 */
export default function WhatsAppOrderButton({
  product,
}: {
  product: { sku: string; name: string; brand: string; price?: number | null; url: string };
}) {
  const { t, locale } = useT();
  const [qty, setQty] = useState(1);

  return (
    <div className="mt-2 flex gap-2">
      <input
        type="number"
        min={1}
        value={qty}
        onChange={(e) => setQty(Math.max(1, Math.floor(Number(e.target.value) || 1)))}
        aria-label={t("product.qty")}
        dir="ltr"
        className="w-16 rounded-md border border-slate-300 px-2 text-sm text-center"
      />
      <a
        href={whatsAppOrderHref(product, locale, qty)}
        target="_blank"
        rel="noopener noreferrer"
        className="flex-1 flex items-center justify-center gap-2 rounded-md text-sm font-semibold py-2.5
                   bg-[#25D366] text-white hover:bg-[#1fb85a] transition-colors"
      >
        <WhatsAppIcon className="w-4 h-4 shrink-0" />
        {t("product.orderWhatsApp")}
      </a>
    </div>
  );
}
