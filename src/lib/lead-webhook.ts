/**
 * Forward a new lead to the n8n lead workflow (NEXU-05), which logs it, alerts
 * the team on Telegram and schedules follow-up reminders.
 *
 * Optional: with LEAD_WEBHOOK_URL unset this does nothing. Like the email and
 * WhatsApp notifiers it caps itself at 8s and never throws, so a slow or down
 * n8n can delay a lead's alert but never lose the lead, which is already saved.
 */
export async function forwardLead(lead: Record<string, unknown>): Promise<boolean> {
  const url = process.env.LEAD_WEBHOOK_URL;
  if (!url) return false;
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ ...lead, source: "nexumotion.com", receivedAt: new Date().toISOString() }),
      signal: AbortSignal.timeout(8000),
    });
    return res.ok;
  } catch {
    return false;
  }
}
