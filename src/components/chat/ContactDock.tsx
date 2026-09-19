"use client";

import { useState } from "react";
import { Phone, Mail, MessageSquare, Plus, X } from "lucide-react";
import { useT } from "@/i18n/client";
import { contact } from "@/content/site-content";
import { telHref, mailHref, whatsAppHref } from "@/lib/contact";

import WhatsAppIcon from "@/components/ui/WhatsAppIcon";

export default function ContactDock() {
  const { t } = useT();
  const [open, setOpen] = useState(false);

  const waHref = whatsAppHref;

  const items = [
    { href: waHref, label: t("contact.whatsapp"), value: contact.phone, Icon: WhatsAppIcon, bg: "bg-[#25D366]", external: true },
    { href: telHref, label: t("contact.phone"), value: contact.phone, Icon: Phone, bg: "bg-[#0A6286]", external: false },
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
        className="w-14 h-14 rounded-full bg-[#07C89B] hover:bg-[#06B48C] text-[#0A2A38] shadow-lg flex items-center justify-center transition-transform hover:scale-105"
      >
        {open ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
        {!open && (
          <span className="absolute -top-0.5 -end-0.5 w-4 h-4 rounded-full bg-white text-[#07858F] flex items-center justify-center">
            <Plus className="w-3 h-3" strokeWidth={3} />
          </span>
        )}
      </button>
    </div>
  );
}
