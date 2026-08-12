/**
 * Transactional email.
 *
 * Resend over its HTTP API rather than SMTP: Cloudflare Workers have no TCP
 * sockets, so nodemailer and every SMTP client are unusable here. This is a
 * plain fetch, which is the one thing the runtime does have.
 *
 * Sending is best-effort by design. An inquiry is already committed to the
 * database before this runs; if the notification fails, the lead is still
 * captured and visible in /admin/inquiries. Losing an email is bad. Losing the
 * lead because the email provider had a bad minute is worse, so nothing here
 * is allowed to fail the request.
 */

const RESEND_ENDPOINT = "https://api.resend.com/emails";

/**
 * Sender address.
 *
 * Resend will only send from a domain verified in the account. Until
 * nexumotion.com is verified there, this must stay on resend.dev or every
 * send returns 403. Swap it once the DNS records are in place — the
 * notification is far more likely to be read when it comes from our own
 * domain rather than a shared testing one.
 */
const FROM = "NexuMotion <onboarding@resend.dev>";

/** Where notifications land. The business address, not a personal one. */
const NOTIFY_TO = "technical@nexumotion.com";

type InquiryNotification = {
  id: string;
  kind: string;
  name: string;
  company?: string | null;
  email: string;
  phone?: string | null;
  country?: string | null;
  message: string;
  sku?: string | null;
  manufacturer?: string | null;
  partNumber?: string | null;
  quantity?: number | null;
};

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

function buildHtml(i: InquiryNotification, siteUrl: string): string {
  const part = i.partNumber ?? i.sku ?? "—";
  const inCatalogue = i.kind === "PRODUCT";

  const row = (label: string, value: string) =>
    `<tr><td style="padding:6px 12px 6px 0;color:#64748b;font-size:13px;white-space:nowrap">${esc(label)}</td>` +
    `<td style="padding:6px 0;color:#0f172a;font-size:13px">${value}</td></tr>`;

  return `<!doctype html>
<html><body style="margin:0;padding:24px;background:#f5f8f8;font-family:-apple-system,Segoe UI,Roboto,sans-serif">
  <div style="max-width:560px;margin:0 auto;background:#fff;border:1px solid #e2e8f0;border-radius:10px;overflow:hidden">
    <div style="background:#0a6286;color:#fff;padding:16px 20px">
      <div style="font-size:12px;opacity:.85;letter-spacing:.04em;text-transform:uppercase">New part inquiry</div>
      <div style="font-size:19px;font-weight:700;margin-top:2px;direction:ltr">${esc(part)}</div>
    </div>

    <div style="padding:18px 20px">
      <div style="display:inline-block;font-size:11px;font-weight:700;padding:3px 9px;border-radius:99px;margin-bottom:14px;
                  background:${inCatalogue ? "#d7ebef" : "#fef3c7"};color:${inCatalogue ? "#0d445b" : "#92400e"}">
        ${inCatalogue ? "In our catalogue" : "Not listed — needs sourcing"}
      </div>

      <table style="width:100%;border-collapse:collapse">
        ${row("Part number", `<strong style="direction:ltr">${esc(part)}</strong>`)}
        ${i.manufacturer ? row("Manufacturer", esc(i.manufacturer)) : ""}
        ${i.quantity ? row("Quantity", String(i.quantity)) : ""}
      </table>

      <hr style="border:0;border-top:1px solid #e2e8f0;margin:16px 0">

      <table style="width:100%;border-collapse:collapse">
        ${row("From", `<strong>${esc(i.name)}</strong>${i.company ? ` — ${esc(i.company)}` : ""}`)}
        ${row("Email", `<a href="mailto:${esc(i.email)}" style="color:#0a6286">${esc(i.email)}</a>`)}
        ${i.phone ? row("Phone", `<a href="tel:${esc(i.phone.replace(/[^\d+]/g, ""))}" style="color:#0a6286;direction:ltr">${esc(i.phone)}</a>`) : ""}
        ${i.country ? row("Country", esc(i.country)) : ""}
      </table>

      <div style="margin-top:16px;padding:12px 14px;background:#f8fafc;border-radius:8px;
                  font-size:13px;color:#334155;line-height:1.55;white-space:pre-wrap">${esc(i.message)}</div>

      <a href="${siteUrl}/admin/inquiries"
         style="display:inline-block;margin-top:18px;background:#07c89b;color:#0a2a38;text-decoration:none;
                font-weight:700;font-size:13px;padding:10px 18px;border-radius:8px">Open in admin</a>

      <p style="margin:14px 0 0;font-size:12px;color:#94a3b8">
        Reply to this email to answer ${esc(i.name)} directly.
      </p>
    </div>
  </div>
</body></html>`;
}

/**
 * Notifies the business that an inquiry arrived.
 *
 * Returns whether the send succeeded so the caller can log it, but never
 * throws. Reply-To is the customer's address, so answering is a plain reply
 * rather than a copy-paste into a new message — the difference between
 * responding in a minute and responding tomorrow.
 */
export async function sendInquiryNotification(
  inquiry: InquiryNotification,
  siteUrl = "https://nexumotion.com"
): Promise<boolean> {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    // Not an error: the site runs fine without notifications configured, and
    // failing here would take down the inquiry endpoint itself.
    console.warn("[email] RESEND_API_KEY not set — inquiry notification skipped");
    return false;
  }

  const part = inquiry.partNumber ?? inquiry.sku ?? "part";

  try {
    const res = await fetch(RESEND_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM,
        to: [NOTIFY_TO],
        reply_to: inquiry.email,
        subject: `New inquiry: ${part}${inquiry.quantity ? ` × ${inquiry.quantity}` : ""} — ${inquiry.name}`,
        html: buildHtml(inquiry, siteUrl),
      }),
      // A hanging email provider must not hold the customer's form submit
      // open. The inquiry is already saved; the notification is not worth
      // making anyone wait on.
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      console.error(`[email] Resend responded ${res.status}: ${detail.slice(0, 300)}`);
      return false;
    }
    return true;
  } catch (err) {
    console.error(`[email] notification failed: ${String(err).slice(0, 300)}`);
    return false;
  }
}
