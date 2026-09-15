import Image from "next/image";
import { Cpu, Gauge, Radio, ShieldCheck, Timer, Zap } from "lucide-react";
import { featuredBrands } from "@/content/site-content";

/**
 * Hero artwork: a photographic bench of automation components, with the real
 * brand logos beneath it.
 *
 * The bench image is AI-generated to a deliberate brief: generic, unbranded
 * components — no logos, no labels, no packaging, no stock room. That is the
 * line that keeps it honest. Three alternatives were considered and rejected:
 *
 *   - A manufacturer's own marketing photograph. Copyrighted, the same problem
 *     as the 412 distributor photos removed from the catalogue.
 *   - AI images that render real brand marks on invented products. Trademark
 *     misuse, and the marks come out garbled ("Zanfoss") on close inspection.
 *   - An AI warehouse full of boxed stock. Every listed part is backorder, so
 *     that would misrepresent the business on its own ads landing page.
 *
 * So the photo supplies atmosphere only, and says nothing false because it
 * names nothing. The brand identity is carried by the logo strip below it,
 * which is real. The category badges over the image name what the business
 * actually stocks.
 *
 * Served as WebP with a JPEG fallback, 54 KB at 1024px, with fetchPriority
 * high: this is the largest contentful paint on the page that paid traffic
 * lands on, and LCP feeds Quality Score.
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
      {/* The bench photograph, with the badges over its lower edge. Explicit
          dimensions so the slot is reserved before the image arrives — this is
          the LCP element and must not shift the layout. */}
      <div className="relative rounded-2xl overflow-hidden border border-white/15 bg-[#0f172a] aspect-[1024/572]">
        <picture>
          <source
            type="image/webp"
            srcSet="/hero/bench-640.webp 640w, /hero/bench.webp 1024w"
            sizes="(max-width: 1024px) 50vw, 620px"
          />
          <img
            src="/hero/bench.jpg"
            alt=""
            width={1024}
            height={572}
            fetchPriority="high"
            decoding="async"
            className="absolute inset-0 w-full h-full object-cover"
          />
        </picture>

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
