/**
 * Transactional email, over Cloudflare's own `send_email` Worker binding.
 *
 * SMTP is not an option: Workers have no TCP sockets, so nodemailer and every
 * SMTP client are unusable here. This used to go out through Resend's HTTP API,
 * which worked but meant a second vendor, a second API key to rotate and a
 * second free tier to exhaust. The binding is native, needs no key, and its
 * delivery is the same infrastructure that already handles inbound mail for
 * this domain.
 *
 * Sending is best-effort by design. An inquiry is already committed to the
 * database before this runs; if the notification fails, the lead is still
 * captured and visible in /admin/inquiries. Losing an email is bad. Losing the
 * lead because mail had a bad minute is worse, so nothing here is allowed to
 * fail the request.
 */

/**
 * Sender address.
 *
 * Must be on a domain that is a zone in this Cloudflare account, or the send is
 * rejected. It does not need a mailbox — replies are steered by Reply-To, which
 * every message below sets to the customer's own address.
 */
const FROM_ADDRESS = "noreply@nexumotion.com";
const FROM = `NexuMotion <${FROM_ADDRESS}>`;

/**
 * Where notifications land.
 *
 * Cloudflare only delivers to an address verified under Email Routing, and this
 * is the verified one; `destination_address` in wrangler.jsonc pins the binding
 * to it. technical@nexumotion.com forwards to this same inbox, so addressing it
 * directly loses nothing and removes a forwarding hop that can fail.
 */
const NOTIFY_TO = "remahxautomation@gmail.com";

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

/** UTF-8 → base64. `btoa` alone is latin1 and mangles anything Arabic. */
function b64(input: string): string {
  const bytes = new TextEncoder().encode(input);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

/**
 * RFC 2047 encoded-word, applied only when a header actually needs it.
 *
 * Subjects here carry customer names and part numbers, and an Arabic name in a
 * raw header is a malformed message that some receivers drop outright. ASCII
 * subjects are left alone so the common case stays readable in logs.
 */
function encodeHeader(value: string): string {
  return /^[\x20-\x7E]*$/.test(value) ? value : `=?UTF-8?B?${b64(value)}?=`;
}

/**
 * Builds the raw MIME message the binding expects.
 *
 * The body goes out base64-encoded rather than as-is: it is HTML containing
 * Arabic, and quoted-printable hand-rolling plus the 998-octet line limit is a
 * class of bug worth designing out. Base64 in 76-character lines is always
 * valid regardless of what the content turns out to be.
 */
function buildMime(msg: { subject: string; html: string; replyTo?: string }): string {
  const body = b64(msg.html).replace(/(.{76})/g, "$1\r\n");

  const headers = [
    `From: ${FROM}`,
    `To: ${NOTIFY_TO}`,
    msg.replyTo ? `Reply-To: ${msg.replyTo}` : null,
    `Subject: ${encodeHeader(msg.subject)}`,
    // Required — Cloudflare rejects a message without one, and receivers use it
    // to collapse duplicates.
    `Message-ID: <${crypto.randomUUID()}@nexumotion.com>`,
    `Date: ${new Date().toUTCString()}`,
    "MIME-Version: 1.0",
    'Content-Type: text/html; charset="utf-8"',
    "Content-Transfer-Encoding: base64",
  ].filter(Boolean);

  return `${headers.join("\r\n")}\r\n\r\n${body}`;
}

/**
 * The single place a message actually leaves the building.
 *
 * Never throws. Every caller runs after the record is already committed, so a
 * mail failure must cost a notification and never the order, quote or lead
 * that triggered it. Returns whether it sent so callers can log the outcome.
 *
 * Outside Workers — `next dev`, `next start`, the seed scripts — there is no
 * binding, so this logs and reports failure rather than pretending to send.
 */
async function send(msg: {
  subject: string;
  html: string;
  replyTo?: string;
}): Promise<boolean> {
  try {
    // The specifier must not be statically analysable, hence the env lookup.
    //
    // `cloudflare:email` is supplied by the Workers runtime, not by anything on
    // disk, so a bundler that tries to resolve it fails the build with
    // 'Could not resolve "cloudflare:email"'. Two of them get a look here —
    // Turbopack, then OpenNext's esbuild — and neither can be told to leave it
    // alone: esbuild's external list is hard-coded in bundle-server.js with no
    // user hook, and `turbopackIgnore` only applies to literal specifiers.
    //
    // Simply hiding the literal is not enough. Turbopack constant-folds, and
    // it saw through both `"cloudflare:" + "email"` and
    // `["cloudflare","email"].join(":")`, restoring the literal import and
    // failing again. Reading an environment variable is the cheapest thing it
    // genuinely cannot evaluate at build time, so `import(x)` survives to
    // runtime, where Workers resolves it.
    //
    // CF_EMAIL_MODULE is never set in practice — it exists to make the
    // expression opaque, and doubles as an override if the module is ever
    // renamed.
    const emailModule = process.env.CF_EMAIL_MODULE ?? "cloudflare:email";
    const [{ EmailMessage }, { getCloudflareContext }] = await Promise.all([
      import(/* webpackIgnore: true */ /* turbopackIgnore: true */ emailModule) as Promise<{
        EmailMessage: new (from: string, to: string, raw: string) => unknown;
      }>,
      import("@opennextjs/cloudflare"),
    ]);

    const { env } = getCloudflareContext();
    const binding = (env as unknown as Record<string, unknown>).SEND_EMAIL as
      | { send(m: unknown): Promise<void> }
      | undefined;

    if (!binding) {
      console.warn(
        `[email] SEND_EMAIL binding missing — "${msg.subject}" not sent. ` +
          "Check the send_email block in wrangler.jsonc."
      );
      return false;
    }

    await binding.send(new EmailMessage(FROM_ADDRESS, NOTIFY_TO, buildMime(msg)));
    return true;
  } catch (err) {
    console.error(`[email] send failed: ${String(err).slice(0, 300)}`);
    return false;
  }
}

/** Shared shell so the three notification mails look like one system. */
function shell(opts: {
  kicker: string;
  headline: string;
  body: string;
  cta: { href: string; label: string };
  footnote?: string;
}): string {
  return `<!doctype html>
<html><body style="margin:0;padding:24px;background:#f5f8f8;font-family:-apple-system,Segoe UI,Roboto,sans-serif">
  <div style="max-width:560px;margin:0 auto;background:#fff;border:1px solid #e2e8f0;border-radius:10px;overflow:hidden">
    <div style="background:#0a6286;color:#fff;padding:16px 20px">
      <div style="font-size:12px;opacity:.85;letter-spacing:.04em;text-transform:uppercase">${esc(opts.kicker)}</div>
      <div style="font-size:19px;font-weight:700;margin-top:2px;direction:ltr">${esc(opts.headline)}</div>
    </div>
    <div style="padding:18px 20px">
      ${opts.body}
      <a href="${opts.cta.href}"
         style="display:inline-block;margin-top:18px;background:#07c89b;color:#0a2a38;text-decoration:none;
                font-weight:700;font-size:13px;padding:10px 18px;border-radius:8px">${esc(opts.cta.label)}</a>
      ${opts.footnote ? `<p style="margin:14px 0 0;font-size:12px;color:#94a3b8">${esc(opts.footnote)}</p>` : ""}
    </div>
  </div>
</body></html>`;
}

const rowHtml = (label: string, value: string) =>
  `<tr><td style="padding:6px 12px 6px 0;color:#64748b;font-size:13px;white-space:nowrap">${esc(label)}</td>` +
  `<td style="padding:6px 0;color:#0f172a;font-size:13px">${value}</td></tr>`;

const lineTable = (lines: Array<{ sku: string; name: string; qty: number }>) =>
  `<table style="width:100%;border-collapse:collapse;margin-top:4px">` +
  lines
    .map(
      (l) =>
        `<tr><td style="padding:5px 10px 5px 0;font-size:13px;color:#0f172a;direction:ltr">` +
        `<strong>${esc(l.sku)}</strong><br><span style="color:#64748b">${esc(l.name)}</span></td>` +
        `<td style="padding:5px 0;font-size:13px;color:#0f172a;text-align:right;white-space:nowrap">× ${l.qty}</td></tr>`
    )
    .join("") +
  `</table>`;

/**
 * A signed-in customer asked for a quote.
 *
 * Quotes are the higher-intent path — the customer has picked specific parts
 * and wants a price — so they warrant a notification at least as much as an
 * inquiry does.
 */
export async function sendQuoteRequestNotification(
  quote: {
    id: string;
    notes?: string | null;
    customerName?: string | null;
    customerEmail: string;
    company?: string | null;
    lines: Array<{ sku: string; name: string; qty: number }>;
  },
  siteUrl = "https://nexumotion.com"
): Promise<boolean> {
  const body =
    `<table style="width:100%;border-collapse:collapse">` +
    rowHtml("From", `<strong>${esc(quote.customerName ?? quote.customerEmail)}</strong>${quote.company ? ` — ${esc(quote.company)}` : ""}`) +
    rowHtml("Email", `<a href="mailto:${esc(quote.customerEmail)}" style="color:#0a6286">${esc(quote.customerEmail)}</a>`) +
    rowHtml("Lines", String(quote.lines.length)) +
    `</table>` +
    lineTable(quote.lines) +
    (quote.notes
      ? `<div style="margin-top:14px;padding:12px 14px;background:#f8fafc;border-radius:8px;font-size:13px;color:#334155;white-space:pre-wrap">${esc(quote.notes)}</div>`
      : "");

  return send({
    subject: `Quote request — ${quote.lines.length} line${quote.lines.length === 1 ? "" : "s"} from ${quote.customerName ?? quote.customerEmail}`,
    replyTo: quote.customerEmail,
    html: shell({
      kicker: "New quote request",
      headline: `${quote.lines.length} line${quote.lines.length === 1 ? "" : "s"}`,
      body,
      cta: { href: `${siteUrl}/admin/quotes/${quote.id}`, label: "Price this quote" },
      footnote: "Reply to this email to reach the customer directly.",
    }),
  });
}

/** An order was placed. */
export async function sendOrderNotification(
  order: {
    orderNumber: string;
    email: string;
    customerName?: string | null;
    total: number;
    lines: Array<{ sku: string; name: string; qty: number }>;
  },
  siteUrl = "https://nexumotion.com"
): Promise<boolean> {
  const body =
    `<table style="width:100%;border-collapse:collapse">` +
    rowHtml("Order", `<strong style="direction:ltr">${esc(order.orderNumber)}</strong>`) +
    rowHtml("Total", `<strong>$${order.total.toFixed(2)}</strong>`) +
    rowHtml("From", esc(order.customerName ?? order.email)) +
    rowHtml("Email", `<a href="mailto:${esc(order.email)}" style="color:#0a6286">${esc(order.email)}</a>`) +
    `</table>` +
    lineTable(order.lines);

  return send({
    subject: `New order ${order.orderNumber} — $${order.total.toFixed(2)}`,
    replyTo: order.email,
    html: shell({
      kicker: "New order",
      headline: order.orderNumber,
      body,
      cta: { href: `${siteUrl}/admin/orders`, label: "Open in admin" },
      footnote: "Reply to this email to reach the customer directly.",
    }),
  });
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
  const part = inquiry.partNumber ?? inquiry.sku ?? "part";
  return send({
    subject: `New inquiry: ${part}${inquiry.quantity ? ` × ${inquiry.quantity}` : ""} — ${inquiry.name}`,
    replyTo: inquiry.email,
    html: buildHtml(inquiry, siteUrl),
  });
}
