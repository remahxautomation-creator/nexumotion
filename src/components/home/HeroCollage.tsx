import Image from "next/image";
import { Cpu, Gauge, Radio, ShieldCheck, Timer, Zap } from "lucide-react";
import { featuredBrands } from "@/content/site-content";
import ControlPanelArt from "./ControlPanelArt";

/**
 * Hero artwork: brands, parts and systems in one banner.
 *
 * Three honest sources, and nothing else:
 *
 *   Brands  — the manufacturer logo SVGs already in public/brands, the same
 *             files the brand wall uses. Showing them as a stockist is the
 *             normal, defensible use.
 *   Parts   — ControlPanelArt, the existing drawn panel illustration.
 *   Systems — lucide icons matching the eight systems pages.
 *
 * Deliberately no product photography, because the business has none of its
 * own yet. The catalogue used to carry 412 image URLs, all pointing at a
 * competing distributor's photographs; those were removed rather than
 * published. The moment real photos exist, this component is the place to
 * swap them in.
 *
 * Everything renders as inline SVG, CSS and local files, so the hero costs no
 * external requests and cannot break when a third-party image host changes.
 * That matters on a page that is also a paid-ads landing page: hero imagery is
 * the largest contentful paint, and LCP feeds Quality Score.
 */

/**
 * What the catalogue covers, as badges. Kept to categories the business still
 * trades in after the 2026-09-15 pruning — Pneumatics was here and is gone.
 */
const SYSTEM_ICONS = [
  { Icon: Cpu, label: "PLC & control" },
  { Icon: Zap, label: "Motor control & drives" },
  { Icon: Gauge, label: "Servo & motion" },
  { Icon: ShieldCheck, label: "Machine safety" },
  { Icon: Timer, label: "Relays & timers" },
  { Icon: Radio, label: "Networking & IIoT" },
];

/**
 * Brand strip on its own, for phones.
 *
 * The full collage is too tall for a phone — the panel illustration would push
 * the search and quote buttons below the fold, and those are the whole point of
 * the hero. But showing nothing was the previous behaviour and it wasted the
 * most persuasive thing this business has on the screen where most of the paid
 * traffic actually lands. Six logos in one row is the compromise.
 */
export function HeroBrandStrip({ className = "" }: { className?: string }) {
  const logos = featuredBrands.filter((b) => b.logo).slice(0, 6);

  return (
    <div className={`rounded-xl bg-white/95 border border-white/25 p-3 ${className}`} aria-hidden>
      <div className="grid grid-cols-3 gap-x-3 gap-y-2.5 items-center">
        {logos.map((b) => (
          <div key={b.slug} className="flex items-center justify-center h-6">
            <Image
              src={b.logo!}
              alt=""
              width={100}
              height={24}
              unoptimized
              className="max-h-5 max-w-full w-auto object-contain opacity-80"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function HeroCollage({ className = "" }: { className?: string }) {
  // Only brands whose logo file actually exists. A missing file would render an
  // empty box in the most prominent position on the site.
  const logos = featuredBrands.filter((b) => b.logo).slice(0, 12);

  return (
    <div className={`relative ${className}`} aria-hidden>
      {/* Panel illustration, sitting behind the collage as the anchor image. */}
      <div className="relative rounded-2xl overflow-hidden border border-white/15 bg-white/5 backdrop-blur-sm">
        <ControlPanelArt className="w-full h-auto" />

        {/* System badges along the bottom of the panel. These name what the
            business actually does, rather than decorating with abstract shapes. */}
        <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-[#052C3E]/90 to-transparent">
          <div className="flex flex-wrap gap-1.5 justify-center">
            {SYSTEM_ICONS.map(({ Icon, label }) => (
              <span
                key={label}
                className="inline-flex items-center gap-1.5 rounded-full bg-white/10 border border-white/20
                           px-2.5 py-1 text-[11px] font-medium text-white/90 whitespace-nowrap"
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Brand strip. White plate behind the logos because most manufacturer
          marks are dark and would disappear against the hero gradient — the
          same reason the brand wall sits on white cards. */}
      <div className="mt-3 rounded-xl bg-white/95 border border-white/25 p-3 shadow-lg">
        <div className="grid grid-cols-4 sm:grid-cols-6 gap-x-3 gap-y-2.5 items-center">
          {logos.map((b) => (
            <div key={b.slug} className="flex items-center justify-center h-7">
              <Image
                src={b.logo!}
                alt=""
                width={120}
                height={28}
                unoptimized
                className="max-h-6 max-w-full w-auto object-contain opacity-80"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
