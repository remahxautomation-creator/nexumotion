import { contact } from "@/content/site-content";

/**
 * Link targets for the business contact details.
 *
 * The `tel:` normalisation was duplicated in five files — TopBar, Footer,
 * MobileMenu, ContactDock and the inquiry page — each running the same regex
 * over the same constant. One edited copy and a dialling link silently sends
 * the wrong number, with nothing to catch it.
 */

/** Display form stripped to E.164, e.g. "+20 15 59404399" -> "+201559404399". */
export const telHref = `tel:${contact.phone.replace(/[^\d+]/g, "")}`;

export const mailHref = `mailto:${contact.email}`;

/** wa.me rejects a leading + or any spaces, so the digits are stored separately. */
export const whatsAppHref = `https://wa.me/${contact.whatsapp}?text=${encodeURIComponent(
  contact.whatsappGreeting
)}`;

/**
 * WhatsApp link that opens a chat with the part already written into the
 * message, so the buyer never has to type a part number by hand. Bilingual:
 * the message follows the site language the buyer is reading in.
 *
 * The URL is included because WhatsApp on the recipient side renders it as a
 * preview card with the product photo, which is the fastest way for whoever
 * answers to see what is being asked about.
 */
export function whatsAppOrderHref(
  p: { sku: string; name: string; brand: string; price?: number | null; url: string },
  lang: "en" | "ar",
  qty = 1
): string {
  const price = p.price && p.price > 0 ? ` — USD ${p.price.toFixed(2)}` : "";
  const text =
    lang === "ar"
      ? `مرحباً، أود طلب هذه القطعة:\n\n${p.brand} ${p.sku}\n${p.name}${price}\nالكمية: ${qty}\n\n${p.url}\n\nمن فضلكم أفيدوني بالسعر ومدة التوريد.`
      : `Hello, I'd like to order this part:\n\n${p.brand} ${p.sku}\n${p.name}${price}\nQty: ${qty}\n\n${p.url}\n\nPlease confirm price and lead time.`;
  return `https://wa.me/${contact.whatsapp}?text=${encodeURIComponent(text)}`;
}
