"use client";

import Link from "next/link";
import { MessageSquareQuote } from "lucide-react";
import { cn } from "@/lib/utils";
import { useT } from "@/i18n/client";

/**
 * Stands in for the add-to-cart button on anything we cannot ship from stock.
 *
 * A link rather than a disabled button: "Out of Stock" greyed out is a dead
 * end, and for a distributor an out-of-stock part is a sourcing job, not a
 * lost sale. Carries the SKU so the inquiry page can name the part and the
 * record attaches to it.
 */
export default function InquireButton({
  sku,
  className,
  compact = false,
}: {
  sku: string;
  className?: string;
  compact?: boolean;
}) {
  const { t } = useT();

  return (
    <Link
      href={`/inquiry?sku=${encodeURIComponent(sku)}`}
      className={cn(
        "w-full flex items-center justify-center gap-2 rounded-md font-semibold transition-colors",
        "bg-[#07C89B] text-[#0A2A38] hover:bg-[#06B48C]",
        compact ? "text-sm py-2" : "text-sm py-2.5",
        className
      )}
    >
      <MessageSquareQuote className="w-4 h-4 shrink-0" />
      {compact ? t("product.inquire") : t("product.inquireLong")}
    </Link>
  );
}
