# Domain Backstory v4

Optimized for fast, practical use during phishing/sender-domain investigation.

## What changed
- RDAP remains the reliable primary source.
- Certificate Transparency now uses a lightweight exact-domain lookup by default.
- A **Deep CT lookup** button runs wildcard/subdomain enumeration only when you actually need it.
- Wayback now uses the lightweight **Wayback Availability API** instead of the heavy CDX history query that was returning HTTP 429.
- A manual **Open full Wayback history** button opens Internet Archive in a new tab when deeper browsing is worth the time.
- Worker cache reduces repeat traffic to RDAP/crt.sh/Wayback.
- Source status is explicit: failed lookups are never interpreted as “no suspicious context.”
- Added an analyst-oriented signal, colored clues, timeline, local notes, and “Copy analyst summary.”

## Update existing deployment
Replace the contents of your existing GitHub repo with this ZIP, commit, and push.
Your existing Cloudflare Git-connected Worker should redeploy automatically.

Expected repo structure:
```
domain-backstory/
├── package.json
├── wrangler.jsonc
├── public/
│   └── index.html
└── src/
    └── index.js
```

## Quick tests after deployment
- `/api/rdap?domain=yahoo.com`
- `/api/ct?mode=quick&domain=yahoo.com`
- `/api/wayback?mode=quick&domain=yahoo.com`

RDAP should return JSON. CT/Wayback may still occasionally be unavailable because they are public services, but the app now keeps those lookups much lighter and caches successful results.

## Interpretation
This app supports analyst hypotheses; it does not confirm compromise from public metadata alone.
