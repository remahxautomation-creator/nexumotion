"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { featuredBrands } from "@/content/site-content";

/**
 * Product photo, with a placeholder that is worth looking at.
 *
 * The catalogue currently has no product photography at all. It previously
 * carried 412 image URLs, but every one pointed at a competing distributor's
 * own photographs, so they were removed rather than published. Until the
 * business shoots its own, every card falls back to this.
 *
 * A single grey box repeated 1,025 times makes a catalogue look empty, so the
 * placeholder carries the two things a buyer actually scans for: who makes the
 * part, and its part number. Where a brand logo exists it is used; otherwise
 * the brand name renders as a wordmark — the same rule the brand wall follows,
 * so the site behaves consistently as logo files are added.
 *
 * It is deliberately not styled to look like a photograph. Pretending would be
 * worse than being plainly a placeholder: the customer knows what they are
 * looking at, and the SKU is more useful to them than a stock image of a
 * different part would be.
 */

const LOGO_BY_SLUG = new Map(
  featuredBrands.filter((b) => b.logo).map((b) => [b.slug, b.logo as string])
);

function Placeholder({
  brandName,
  brandSlug,
  sku,
  className,
}: {
  brandName?: string | null;
  brandSlug?: string | null;
  sku?: string | null;
  className?: string;
}) {
  const logo = brandSlug ? LOGO_BY_SLUG.get(brandSlug) : undefined;

  return (
    <div
      className={cn(
        "relative flex flex-col items-center justify-center gap-1.5 bg-slate-50 overflow-hidden",
        className
      )}
    >
      {/* Faint technical grid, so the tile reads as deliberate rather than as a
          failed image. Matches the hero's grid motif. */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            "linear-gradient(#0A6286 1px, transparent 1px), linear-gradient(90deg, #0A6286 1px, transparent 1px)",
          backgroundSize: "14px 14px",
        }}
      />

      {logo ? (
        <Image
          src={logo}
          alt=""
          width={120}
          height={28}
          unoptimized
          className="relative max-h-6 max-w-[70%] w-auto object-contain opacity-55"
        />
      ) : brandName ? (
        <span
          dir="ltr"
          className="relative text-[11px] font-bold tracking-tight text-slate-400 text-center px-2 line-clamp-1"
        >
          {brandName}
        </span>
      ) : null}

      {sku && (
        <span dir="ltr" className="relative sku text-[10px] text-slate-400 px-2 line-clamp-1">
          {sku}
        </span>
      )}
    </div>
  );
}

export default function ProductImage({
  src,
  alt,
  className,
  sizes = "(max-width: 768px) 50vw, 25vw",
  priority = false,
  brandName,
  brandSlug,
  sku,
}: {
  src?: string | null;
  alt: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
  brandName?: string | null;
  brandSlug?: string | null;
  sku?: string | null;
}) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <Placeholder brandName={brandName} brandSlug={brandSlug} sku={sku} className={className} />
    );
  }

  return (
    <div className={cn("relative bg-white overflow-hidden", className)}>
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        onError={() => setFailed(true)}
        // Industrial parts are shot on white; contain avoids cropping the part.
        className="object-contain p-2"
        unoptimized={false}
      />
    </div>
  );
}
