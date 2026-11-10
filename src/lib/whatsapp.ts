/**
 * WhatsApp notification to the business's own number, over CallMeBot.
 *
 * Meta's WhatsApp Cloud API cannot start a conversation with free text: a
 * business-initiated message needs a pre-approved template, a verified business
 * and a separate phone number. For "tell the owner a lead arrived" that is far
 * more than the job needs. CallMeBot is a free relay built for exactly this —
 * notifications to a number that has opted in — and is a single GET.
 *
 * Setup (once): from the receiving phone, send "I allow callmebot to send me
 * messages" to +34 644 71 81 99 on WhatsApp. The reply contains an API key. Set
 * CALLMEBOT_PHONE (international format, digits only, e.g. 201559404399) and
 * CALLMEBOT_APIKEY in the Cloudflare dashboard. Until both exist this is a
 * no-op, so nothing breaks before it is configured.
 *
 * Best-effort, like email: the lead is already saved before this runs, so a
 * failed send never fails the request.
 */
export async function sendWhatsAppNotification(text: string): Promise<boolean> {
  const phone = process.env.CALLMEBOT_PHONE;
  const apikey = process.env.CALLMEBOT_APIKEY;
  if (!phone || !apikey) return false;

  const url =
    `https://api.callmebot.com/whatsapp.php?phone=${encodeURIComponent(phone)}` +
    `&apikey=${encodeURIComponent(apikey)}&text=${encodeURIComponent(text.slice(0, 1500))}`;
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) console.warn(`[whatsapp] CallMeBot returned ${res.status}`);
    return res.ok;
  } catch (err) {
    console.warn(`[whatsapp] send failed: ${String(err).slice(0, 200)}`);
    return false;
  }
}
