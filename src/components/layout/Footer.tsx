import Link from "next/link";
import { MapPin } from "lucide-react";
import Logo from "@/components/layout/Logo";
import { contact } from "@/content/site-content";
import { getT } from "@/i18n/server";

export default async function Footer() {
  const { t } = await getT();

  return (
    <footer className="surface-inverse mt-16">
      <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-4 gap-8 text-sm">
        <div>
          {/* Always-dark band, so the reversed variant regardless of theme. */}
          <Logo className="h-12 w-auto mb-3" alwaysLight />
          <h3 className="sr-only" dir="ltr">NexuMotion</h3>
          <p className="text-slate-400">{t("footer.tagline")}</p>
        </div>
        <div>
          <h4 className="font-semibold text-white mb-3">{t("footer.shop")}</h4>
          <ul className="space-y-2">
            <li><Link href="/assistant" className="hover:text-white">{t("nav.assistant")}</Link></li>
            <li><Link href="/systems" className="hover:text-white">{t("nav.systems")}</Link></li>
            <li><Link href="/about" className="hover:text-white">{t("nav.about")}</Link></li>
            <li><Link href="/brands" className="hover:text-white">{t("footer.allBrands")}</Link></li>
            <li><Link href="/search" className="hover:text-white">{t("footer.searchParts")}</Link></li>
            <li><Link href="/quick-order" className="hover:text-white">{t("footer.quickOrderPad")}</Link></li>
            <li><Link href="/cart" className="hover:text-white">{t("nav.cart")}</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold text-white mb-3">{t("footer.resources")}</h4>
          <ul className="space-y-2">
            <li><span className="text-slate-500">{t("footer.datasheets")}</span></li>
            <li><span className="text-slate-500">{t("footer.crossRefTool")}</span></li>
            <li><span className="text-slate-500">{t("footer.shipping")}</span></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold text-white mb-3">{t("footer.support")}</h4>
          <ul className="space-y-2 text-slate-400">
            <li>{t("home.trust.deliverySub")}</li>
            <li>
              <a
                href={`tel:${contact.phone.replace(/[^\d+]/g, "")}`}
                dir="ltr"
                className="block text-start hover:text-white transition-colors"
              >
                {contact.phone}
              </a>
            </li>
            <li>
              <a
                href={`mailto:${contact.email}`}
                dir="ltr"
                className="block text-start hover:text-white transition-colors"
              >
                {contact.email}
              </a>
            </li>
            <li className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 shrink-0" aria-hidden />
              {t("footer.location")}
            </li>
            <li>{t("footer.hours")}</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-slate-800 py-4 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} {t("footer.rights")}
      </div>
    </footer>
  );
}
