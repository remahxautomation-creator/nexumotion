import Link from "next/link";
import { getT } from "@/i18n/server";

export default async function Footer() {
  const { t } = await getT();

  return (
    <footer className="bg-slate-900 text-slate-300 mt-16">
      <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-4 gap-8 text-sm">
        <div>
          <h3 className="font-bold text-white mb-3" dir="ltr">AutoParts MENA</h3>
          <p className="text-slate-400">{t("footer.tagline")}</p>
        </div>
        <div>
          <h4 className="font-semibold text-white mb-3">{t("footer.shop")}</h4>
          <ul className="space-y-2">
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
            <li dir="ltr" className="text-start">support@autoparts-mena.com</li>
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
