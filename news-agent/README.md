# World News Digest Agent

Claude searches the web for the top world stories of the last 24h and sends a WhatsApp digest
(brief, consequences, results so far, sources) to **+20 155 598 0202**.

## Setup
1. **Twilio WhatsApp**: create a Twilio account → Messaging → Try WhatsApp (sandbox).
   From your phone, send the sandbox "join <code>" message to the sandbox number once.
   (For production/unattended use beyond the 24h window, register a WhatsApp sender and an approved template.)
2. Set secrets (GitHub → Settings → Secrets → Actions): `ANTHROPIC_API_KEY`, `TWILIO_ACCOUNT_SID`,
   `TWILIO_AUTH_TOKEN`, `TWILIO_WHATSAPP_FROM` (e.g. `whatsapp:+14155238886`).
3. Workflow `.github/workflows/news-digest.yml` runs daily 05:00 UTC; trigger manually via "Run workflow".

## Run locally
```bash
export ANTHROPIC_API_KEY=...
node news-agent/agent.mjs --dry-run   # prints the digest, sends nothing
TWILIO_ACCOUNT_SID=... TWILIO_AUTH_TOKEN=... node news-agent/agent.mjs
```
Optional env: `NEWS_TOPICS`, `NEWS_COUNT`, `NEWS_MODEL`, `WHATSAPP_TO`.
