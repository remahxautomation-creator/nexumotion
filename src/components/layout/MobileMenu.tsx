"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Sparkles, Boxes, Info, Tag, ListChecks, PackageSearch, User, Phone, Mail } from "lucide-react";
import { useT } from "@/i18n/client";
import { isRtl } from "@/i18n/dictionaries";
import { contact, social } from "@/content/site-content";
import SearchAutocomplete from "@/components/search/SearchAutocomplete";

type Cat = { id: string; name: string; slug: string };

/**
 * Navigation for phones.
 *
 * Everything in the desktop nav was `hidden lg:*`, so on a phone the assistant,
 * systems, about, brands and quick-order pages had no route to them at all —
 * only the category dropdown worked. This is the whole nav, not a subset.
 *
 * Rendered as a drawer rather than an expanding block so the page underneath
 * does not reflow, and so the list can be long enough to hold the categories
 * without pushing content off screen.
 */
export default function MobileMenu({ categories }: { categories: Cat[] }) {
  const { t, locale } = useT();
  const rtl = isRtl(locale);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Close on navigation. Next.js keeps this component mounted across route
  // changes, so without it the drawer stays open over the page just opened.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Escape closes; body scroll locks while open, otherwise the page behind
  // scrolls under the drawer on iOS.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const links = [
    { href: "/assistant", label: t("nav.assistant"), Icon: Sparkles, accent: true },
    { href: "/systems", label: t("nav.systems"), Icon: Boxes },
    { href: "/brands", label: t("nav.brands"), Icon: Tag },
    { href: "/quick-order", label: t("nav.quickOrder"), Icon: ListChecks },
    { href: "/inquiry", label: t("meta.inquiry"), Icon: PackageSearch },
    { href: "/about", label: t("nav.about"), Icon: Info },
    { href: "/account", label: t("nav.account"), Icon: User },
  ];

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label={t("nav.menu")}
        aria-expanded={open}
        className="lg:hidden p-2 -ms-2 text-slate-700 hover:text-[#0A6286]"
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Backdrop */}
      <div
        onClick={() => setOpen(false)}
        aria-hidden="true"
        className={`lg:hidden fixed inset-0 z-[60] bg-slate-900/50 transition-opacity duration-200 ${
          open ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      />

      {/* Drawer. Slides from the start edge — right under Arabic, left under
          English.

          The offset is an inline transform derived from the locale rather than
          Tailwind's `-translate-x-full rtl:translate-x-full`. Both work; this
          one is direction-correct by construction instead of depending on the
          rtl: variant resolving, which is worth the explicitness when Arabic
          is the default and a wrong sign puts the panel off-screen. */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={t("nav.menu")}
        style={{ transform: open ? "translateX(0)" : `translateX(${rtl ? "100%" : "-100%"})` }}
        className="lg:hidden fixed inset-y-0 start-0 z-[70] w-[86%] max-w-sm bg-white shadow-2xl
                   flex flex-col transition-transform duration-300 ease-out"
      >
        <div className="flex items-center justify-between px-4 h-14 border-b border-slate-200 shrink-0">
          <span className="font-bold text-slate-900">{t("nav.menu")}</span>
          <button
            onClick={() => setOpen(false)}
            aria-label={t("nav.closeMenu")}
            className="p-2 -me-2 text-slate-500 hover:text-slate-900"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 overscroll-contain">
          {/* Search first — it is the main way anyone finds a part, and it was
              hidden below md entirely. */}
          <div className="p-4 border-b border-slate-100">
            <SearchAutocomplete />
          </div>

          <nav className="p-2">
            {links.map(({ href, label, Icon, accent }) => (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium hover:bg-slate-50 ${
                  accent ? "text-[#0A6286]" : "text-slate-700"
                }`}
              >
                <Icon className="w-5 h-5 shrink-0" />
                {label}
              </Link>
            ))}
          </nav>

          {categories.length > 0 && (
            <div className="px-2 pb-2">
              <div className="px-3 pt-3 pb-1 text-xs font-bold text-slate-400 uppercase tracking-wide">
                {t("nav.allCategories")}
              </div>
              {categories.map((c) => (
                <Link
                  key={c.id}
                  href={`/categories/${c.slug}`}
                  className="block px-3 py-2.5 rounded-lg text-sm text-slate-600 hover:bg-slate-50 hover:text-[#0A6286]"
                >
                  {c.name}
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Contact and social pinned to the bottom, reachable without scrolling
            back up through the category list. */}
        <div className="border-t border-slate-200 p-4 space-y-3 shrink-0">
          <a
            href={`tel:${contact.phone.replace(/[^\d+]/g, "")}`}
            className="flex items-center gap-2.5 text-sm font-semibold text-[#0A6286]"
          >
            <Phone className="w-4 h-4 shrink-0" />
            <span dir="ltr" className="text-start">{contact.phone}</span>
          </a>
          <a
            href={`mailto:${contact.email}`}
            className="flex items-center gap-2.5 text-sm text-slate-600"
          >
            <Mail className="w-4 h-4 shrink-0" />
            <span dir="ltr" className="text-start">{contact.email}</span>
          </a>
          <div className="flex items-center gap-4 pt-1">
            {social.map((s) => (
              <a
                key={s.id}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={s.label}
                className="text-slate-400 hover:text-[#0A6286]"
              >
                <SocialGlyph id={s.id} />
              </a>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

// Small local copy rather than importing SocialLinks: that component renders
// its own <ul> with fixed spacing, and here the icons sit inside the drawer's
// own footer layout.
function SocialGlyph({ id }: { id: string }) {
  const d: Record<string, string> = {
    linkedin:
      "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z",
    instagram:
      "M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405a1.441 1.441 0 01-2.88 0 1.44 1.44 0 012.88 0z",
    facebook:
      "M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z",
    tiktok:
      "M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z",
  };
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor" aria-hidden="true">
      <path d={d[id]} />
    </svg>
  );
}
