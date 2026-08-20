# Domain Backstory v8

## Major addition: browser-only email header analyzer
Paste a raw Internet header or upload a `.txt`/`.eml` file. The raw header is parsed in frontend JavaScript and is **not sent to the Cloudflare Worker**.

The analyzer extracts:
- From domain
- Return-Path / smtp.mailfrom domain
- DKIM signing domain from Authentication-Results
- SPF / DKIM / DMARC results
- public IPs observed in Received headers
- Received hop count
- common sending-provider clues (Mailgun, SendGrid, Mandrill, SES, Microsoft 365, Google, Proofpoint, Sophos, Mimecast)

It then compares those with:
- current SPF record
- current DMARC record
- the investigated domain
- provider clues

## Important interpretation safeguards
- MX is explicitly labeled as **inbound routing**, not an outbound baseline.
- A different outbound provider from the MX is not flagged as suspicious by itself.
- Authentication PASS does not prove the mailbox/SaaS account was uncompromised.
- If malicious content passes SPF/DKIM/DMARC through expected infrastructure, the app suggests authorized-infrastructure abuse / account compromise as a **hypothesis**, not confirmation.
- Current SPF can differ from the SPF record at the time the message was sent.

## Privacy
The raw header never leaves the browser in v8. However, users should still follow their organization's rules before pasting production email headers into any tool, even an internal/browser-only one.

## Deploy
Replace the existing repo contents with this package and push. Cloudflare should redeploy automatically.
