"use client";

import { useState } from "react";
import { Phone, Mail, MessageSquare, Plus, X } from "lucide-react";
import { useT } from "@/i18n/client";
import { contact } from "@/content/site-content";

// WhatsApp brand glyph — drawn rather than an image file, so no asset to ship.
function WhatsAppIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M17.47 14.38c-.3-.15-1.75-.86-2.02-.96-.27-.1-.47-.15-.67.15-.2.3-.77.96-.94 1.16-.17.2-.35.22-.64.08-.3-.15-1.25-.46-2.39-1.47-.88-.79-1.48-1.76-1.65-2.06-.17-.3-.02-.46.13-.6.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.61-.92-2.2-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.01-1.04 2.47s1.06 2.86 1.21 3.06c.15.2 2.1 3.2 5.08 4.49.71.3 1.26.49 1.69.63.71.22 1.36.19 1.87.12.57-.09 1.75-.72 2-1.41.25-.69.25-1.28.17-1.41-.07-.13-.27-.2-.57-.35z" />
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.86 9.86 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2zm0 18.15h-.01a8.2 8.2 0 0 1-4.18-1.15l-.3-.18-3.11.82.83-3.04-.2-.31a8.16 8.16 0 0 1-1.25-4.38c0-4.54 3.7-8.24 8.24-8.24 2.2 0 4.27.86 5.82 2.42a8.18 8.18 0 0 1 2.41 5.83c0 4.54-3.7 8.23-8.25 8.23z" />
    </svg>
  );
}

export default function ContactDock() {
  const { t } = useT();
  const [open, setOpen] = useState(false);

  const waHref = `https://wa.me/${contact.whatsapp}?text=${encodeURIComponent(contact.whatsappGreeting)}`;
  const telHref = `tel:${contact.phone.replace(/[^\d+]/g, "")}`;
  const mailHref = `mailto:${contact.email}`;

  const items = [
    { href: waHref, label: t("contact.whatsapp"), value: contact.phone, Icon: WhatsAppIcon, bg: "bg-[#25D366]", external: true },
    { href: telHref, label: t("contact.phone"), value: contact.phone, Icon: Phone, bg: "bg-[#0052CC]", external: false },
    { href: mailHref, label: t("contact.email"), value: contact.email, Icon: Mail, bg: "bg-slate-700", external: false },
  ];

  return (
    <div className="fixed bottom-5 end-5 z-40 flex flex-col items-end gap-2">
      {open &&
        items.map((it) => (
          <a
            key={it.label}
            href={it.href}
            {...(it.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
            className="group flex items-center gap-2.5 bg-white border border-slate-200 rounded-full shadow-lg ps-3 pe-1.5 py-1.5 hover:shadow-xl transition-shadow"
          >
            <span className="text-xs font-semibold text-slate-700 hidden sm:block">
              {it.label}
              <span className="block text-[10px] font-normal text-slate-400" dir="ltr">{it.value}</span>
            </span>
            <span className={`w-9 h-9 rounded-full ${it.bg} text-white flex items-center justify-center shrink-0`}>
              <it.Icon className="w-4.5 h-4.5" />
            </span>
          </a>
        ))}

      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={t("contact.title")}
        aria-expanded={open}
        className="w-14 h-14 rounded-full bg-[#FF6B00] hover:bg-orange-600 text-white shadow-lg flex items-center justify-center transition-transform hover:scale-105"
      >
        {open ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
        {!open && (
          <span className="absolute -top-0.5 -end-0.5 w-4 h-4 rounded-full bg-white text-[#FF6B00] flex items-center justify-center">
            <Plus className="w-3 h-3" strokeWidth={3} />
          </span>
        )}
      </button>
    </div>
  );
}
