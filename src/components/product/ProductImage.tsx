"use client";

import { useState } from "react";
import Image from "next/image";
import { Package } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Product photo with a graceful fallback.
 *
 * ~3% of the catalogue has no image, and the images that do exist are served
 * from a third-party CDN that can 404 at any time — so a broken image must
 * degrade to the placeholder rather than showing a torn-image icon.
 */
export default function ProductImage({
  src,
  alt,
  className,
  sizes = "(max-width: 768px) 50vw, 25vw",
  priority = false,
}: {
  src?: string | null;
  alt: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
}) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div className={cn("flex items-center justify-center bg-slate-50", className)}>
        <Package className="w-1/3 h-1/3 max-w-16 max-h-16 text-slate-300" />
      </div>
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
