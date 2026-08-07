import { Phone, Mail, MapPin } from "lucide-react";
import { contact } from "@/content/site-content";
import SocialLinks from "@/components/layout/SocialLinks";
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
          {/* Where we are. Not a link — nothing useful to open, and a dead
              anchor next to two live ones invites a wasted tap. Pushed to the
              start so the two actionable items stay together at the end.
              Hidden on the narrowest screens so the phone and email, which
              people actually act on, never wrap. */}
          <span className="hidden sm:flex items-center gap-1.5 me-auto text-white/80">
            <MapPin className="w-3.5 h-3.5 shrink-0" aria-hidden />
            <span className="font-medium">{t("footer.location")}</span>
          </span>

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

          {/* Hidden below md, unlike the phone and email. Four more targets is
              what finally makes this row wrap on a phone, and someone on a
              phone taps the number — the icons are in the footer regardless. */}
          <SocialLinks
            className="hidden md:flex gap-3 ps-4 border-s border-white/20"
            iconClass="w-3.5 h-3.5"
            linkClass="text-white/80 hover:text-[#07C89B]"
          />
        </div>
      </div>
    </div>
  );
}
