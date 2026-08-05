import { Phone, Mail } from "lucide-react";
import { contact } from "@/content/site-content";
import { getT } from "@/i18n/server";

/**
 * Thin contact strip above the header.
 *
 * Deliberately not sticky — the header below it is, and stacking two sticky
 * bars eats vertical space on phones. This scrolls away; the contact dock
 * stays reachable for the whole session.
 *
 * The number and address are marked dir="ltr" and text-start: in Arabic the
 * surrounding text runs right-to-left, and a bidi reorder of a phone number
 * or an email address makes it wrong, not just oddly placed.
 */
export default async function TopBar() {
  const { t } = await getT();

  const telHref = `tel:${contact.phone.replace(/[^\d+]/g, "")}`;
  const mailHref = `mailto:${contact.email}`;

  return (
    <div className="bg-[#0A6286] text-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-end gap-4 sm:gap-6 h-9 text-xs">
          <a
            href={telHref}
            className="flex items-center gap-1.5 hover:text-[#07C89B] transition-colors"
            aria-label={t("contact.phone")}
          >
            <Phone className="w-3.5 h-3.5 shrink-0" aria-hidden />
            <span dir="ltr" className="text-start font-medium tracking-tight">
              {contact.phone}
            </span>
          </a>

          <a
            href={mailHref}
            className="flex items-center gap-1.5 hover:text-[#07C89B] transition-colors"
            aria-label={t("contact.email")}
          >
            <Mail className="w-3.5 h-3.5 shrink-0" aria-hidden />
            <span dir="ltr" className="text-start font-medium tracking-tight">
              {contact.email}
            </span>
          </a>
        </div>
      </div>
    </div>
  );
}
