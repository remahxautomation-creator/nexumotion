import { MapPin, Phone, Mail, Clock, ExternalLink } from "lucide-react";
import { location, formatAddress, contact } from "@/content/site-content";
import { getT, getLocale } from "@/i18n/server";

/**
 * Where we are — address, contact details and a map.
 *
 * The map is the keyless Google Maps embed rather than the Embed API, which
 * needs a billable key. For a single fixed pin the two render the same thing,
 * and this cannot break when a key rotates or a quota runs out — a lesson worth
 * applying after a metered dependency took the whole site down.
 *
 * `loading="lazy"` matters more than it looks. The iframe pulls several hundred
 * kilobytes of Google's map bundle, and this sits at the bottom of the page, so
 * most visitors never scroll to it. Eagerly loaded it would slow every page
 * that includes it for a feature few people reach — and page speed feeds
 * Quality Score, which feeds cost-per-click while ads are running.
 *
 * The address renders in the visitor's language while the map stays a map; the
 * phone number is forced LTR because an international number inside an RTL
 * paragraph otherwise renders with the + at the wrong end.
 */
export default async function LocationMap() {
  const { t } = await getT();
  const locale = await getLocale();
  const lang = locale === "ar" ? "ar" : "en";

  const address = formatAddress(lang);
  const embedSrc =
    `https://maps.google.com/maps?q=${location.lat},${location.lng}` +
    `&z=15&output=embed&hl=${lang}`;

  const rows = [
    { Icon: MapPin, content: <span>{address}</span> },
    {
      Icon: Phone,
      content: (
        <a
          href={`tel:${contact.phone.replace(/[^\d+]/g, "")}`}
          dir="ltr"
          className="hover:text-[#0A6286] transition-colors"
        >
          {contact.phone}
        </a>
      ),
    },
    {
      Icon: Mail,
      content: (
        <a
          href={`mailto:${contact.email}`}
          dir="ltr"
          className="hover:text-[#0A6286] transition-colors break-all"
        >
          {contact.email}
        </a>
      ),
    },
    { Icon: Clock, content: <span>{t("footer.hours")}</span> },
  ];

  return (
    <section className="bg-white border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 py-14">
        <div className="text-center mb-8">
          <h2 className="text-xl font-bold text-slate-900">{t("location.title")}</h2>
          <p className="text-sm text-slate-500 mt-1">{t("location.subtitle")}</p>
        </div>

        <div className="grid lg:grid-cols-5 gap-6 items-stretch">
          <div className="lg:col-span-2 bg-slate-50 border border-slate-200 rounded-lg p-6 flex flex-col">
            <ul className="space-y-4 text-sm text-slate-700">
              {rows.map(({ Icon, content }, i) => (
                <li key={i} className="flex items-start gap-3">
                  <Icon className="w-4 h-4 text-[#0A6286] shrink-0 mt-0.5" aria-hidden />
                  <div className="leading-relaxed">{content}</div>
                </li>
              ))}
            </ul>

            <a
              href={location.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex items-center justify-center gap-2 bg-[#07C89B] hover:bg-[#06B48C]
                         text-[#0A2A38] font-semibold text-sm px-5 py-2.5 rounded-lg transition-colors"
            >
              {t("location.directions")}
              <ExternalLink className="w-4 h-4" aria-hidden />
            </a>
          </div>

          <div className="lg:col-span-3 rounded-lg overflow-hidden border border-slate-200 min-h-[320px]">
            <iframe
              src={embedSrc}
              title={t("location.mapTitle")}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="w-full h-full min-h-[320px] border-0"
              allowFullScreen
            />
          </div>
        </div>
      </div>
    </section>
  );
}
