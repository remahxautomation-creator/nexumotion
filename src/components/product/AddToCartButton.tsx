"use client";

import { useState } from "react";
import { ShoppingCart, Check } from "lucide-react";
import { useCart, type CartItem } from "@/hooks/useCart";
import { cn } from "@/lib/utils";

export default function AddToCartButton({
  product,
  disabled,
  className,
}: {
  product: Omit<CartItem, "qty">;
  disabled?: boolean;
  className?: string;
}) {
  const add = useCart((s) => s.add);
  const [added, setAdded] = useState(false);

  return (
    <button
      disabled={disabled}
      onClick={() => {
        add(product);
        setAdded(true);
        setTimeout(() => setAdded(false), 1200);
      }}
      className={cn(
        "w-full flex items-center justify-center gap-2 rounded-md text-sm font-semibold py-2 transition-colors",
        disabled
          ? "bg-slate-100 text-slate-400 cursor-not-allowed"
          : added
          ? "bg-emerald-600 text-white"
          : "bg-[#0052CC] text-white hover:bg-[#003D99]",
        className
      )}
    >
      {added ? <Check className="w-4 h-4" /> : <ShoppingCart className="w-4 h-4" />}
      {added ? "Added" : "Add to Cart"}
    </button>
  );
}
