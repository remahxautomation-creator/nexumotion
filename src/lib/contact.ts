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
