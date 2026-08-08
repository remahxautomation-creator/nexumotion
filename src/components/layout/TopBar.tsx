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
        <div className="flex items-center gap-4 sm:gap-6 h-9 text-xs">
          {/* Social leads the row at every width. On a phone this is the whole
              point of the bar; on desktop it reads as the usual utility strip.
              Targets are a little larger on mobile — 14px glyphs in a 32px-tall
              bar are a fiddly tap otherwise. */}
          {/* Padding, not gap, does the spacing here: it makes each anchor a
              ~28x36 tap target filling the bar's height, where the bare 16px
              glyph was an awkward hit on a phone. 44px is the usual guidance
              but cannot fit in a 36px utility bar — this is the most the bar
              allows. */}
          <SocialLinks
            className="-ms-1.5 gap-0.5"
            iconClass="w-4 h-4 sm:w-3.5 sm:h-3.5"
            linkClass="px-1.5 py-2.5 text-white/85 hover:text-[#07C89B]"
          />

          {/* Where we are. Not a link — nothing useful to open, and a dead
              anchor beside live ones invites a wasted tap. */}
          <span className="hidden md:flex items-center gap-1.5 ms-auto text-white/80">
            <MapPin className="w-3.5 h-3.5 shrink-0" aria-hidden />
            <span className="font-medium">{t("footer.location")}</span>
          </span>

          {/* Takes the spare space itself below md, where the location above is
              hidden and would otherwise leave this floating mid-row. */}
          <a
            href={telHref}
            className="flex items-center gap-1.5 ms-auto md:ms-0 hover:text-[#07C89B] transition-colors"
            aria-label={t("contact.phone")}
          >
            <Phone className="w-3.5 h-3.5 shrink-0" aria-hidden />
            <span dir="ltr" className="text-start font-medium tracking-tight">
              {contact.phone}
            </span>
          </a>

          {/* Dropped on the narrowest screens: the address is the longest item
              here, and losing it is what keeps social and the number on one
              line. It is in the drawer and the footer. */}
          <a
            href={mailHref}
            className="hidden sm:flex items-center gap-1.5 hover:text-[#07C89B] transition-colors"
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
