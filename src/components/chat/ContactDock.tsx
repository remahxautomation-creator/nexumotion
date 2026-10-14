"use client";

import { Phone, Mail } from "lucide-react";
import { useT } from "@/i18n/client";
import { contact } from "@/content/site-content";
import { telHref, mailHref, whatsAppHref } from "@/lib/contact";
import WhatsAppIcon from "@/components/ui/WhatsAppIcon";

/**
 * The three ways to reach a human, all on screen at once.
 *
 * This used to be a single floating button that expanded into the three. That
 * costs a tap before the visitor can see that WhatsApp is even an option —
 * and in this market WhatsApp is how most enquiries actually start. A buyer
 * who already knows they want to call should not have to discover a menu
 * first. Three targets, no state, nothing to learn.
 *
 * Labels are hidden below `sm`, leaving three coloured circles: enough to
 * recognise, small enough not to sit on top of the page on a phone.
 *
 * `data-contact` tags the click so the WhatsApp and phone conversions can be
 * told apart from the same links in the header and footer (see
 * components/analytics/ContactClickTracker).
 */
export default function ContactDock() {
  const { t } = useT();

  const items = [
    {
      href: whatsAppHref, label: t("contact.whatsapp"), value: contact.phone,
      Icon: WhatsAppIcon, bg: "bg-[#25D366]", external: true,
    },
    {
      href: telHref, label: t("contact.phone"), value: contact.phone,
      Icon: Phone, bg: "bg-[#0A6286]", external: false,
    },
    {
      href: mailHref, label: t("contact.email"), value: contact.email,
      Icon: Mail, bg: "bg-slate-700", external: false,
    },
  ];

  return (
    <div className="fixed bottom-5 end-5 z-40 flex flex-col items-end gap-2">
      {items.map((it) => (
        <a
          key={it.label}
          href={it.href}
          data-contact="dock"
          aria-label={`${it.label} — ${it.value}`}
          {...(it.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
          className="flex items-center gap-2.5 bg-white border border-slate-200 rounded-full shadow-lg
                     ps-3 pe-1.5 py-1.5 hover:shadow-xl transition-shadow"
        >
          <span className="text-xs font-semibold text-slate-700 hidden sm:block">
            {it.label}
            <span className="block text-[10px] font-normal text-slate-400" dir="ltr">
              {it.value}
            </span>
          </span>
          <span
            className={`w-9 h-9 rounded-full ${it.bg} text-white flex items-center justify-center shrink-0`}
          >
            <it.Icon className="w-4.5 h-4.5" />
          </span>
        </a>
      ))}
    </div>
  );
}
