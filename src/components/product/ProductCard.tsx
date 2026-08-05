"use client";

import Link from "next/link";
import { formatPrice, formatEgp, STOCK_LABELS } from "@/lib/utils";
import { useT } from "@/i18n/client";
import AddToCartButton from "./AddToCartButton";
import ProductImage from "./ProductImage";

export type ProductCardData = {
  id: string;
  sku: string;
  name: string;
  slug: string;
  price: number;
  comparePrice: number | null;
  stockStatus: string;
  brandName: string;
  categoryName?: string;
  image?: string | null;
};

export default function ProductCard({ p }: { p: ProductCardData }) {
  const stock = STOCK_LABELS[p.stockStatus] ?? STOCK_LABELS.IN_STOCK;
  const { t } = useT();
  return (
    <div className="bg-white rounded-lg border border-slate-200 hover:border-[#0A6286] hover:shadow-md transition-all flex flex-col">
      <Link href={`/products/${p.slug}`} className="p-4 flex-1">
        <ProductImage src={p.image} alt={p.name} className="h-28 rounded-md mb-3" />
        <div className="sku text-slate-500 mb-1">{p.sku}</div>
        <div className="text-sm font-medium text-slate-900 line-clamp-2 mb-1">{p.name}</div>
        <div className="text-xs text-slate-500">{p.brandName}</div>
      </Link>
      <div className="px-4 pb-4">
        <div className="flex items-center justify-between mb-2">
          <div>
            <span className="font-bold text-slate-900 ltr-nums">{formatPrice(p.price)}</span>
            <div className="text-[11px] text-slate-500 ltr-nums">{formatEgp(p.price)}</div>
            {p.comparePrice && (
              <span className="ms-2 text-xs text-slate-400 line-through">{formatPrice(p.comparePrice)}</span>
            )}
          </div>
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${stock.className}`}>
            {t(stock.labelKey)}
          </span>
        </div>
        <AddToCartButton
          product={{ productId: p.id, sku: p.sku, name: p.name, slug: p.slug, brand: p.brandName, price: p.price }}
          disabled={p.stockStatus === "OUT_OF_STOCK"}
        />
      </div>
    </div>
  );
}
