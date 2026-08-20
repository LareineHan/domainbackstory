# Domain Backstory v7

Focus: lifecycle and possible re-registration clues without inventing historical registration data.

## What v7 adds
- RDAP `transfer` event: last sponsoring-registrar transfer when the registry provides it.
- Clear distinction between **current registration creation date** and first-ever domain existence.
- Lightweight Wayback lookup returns an older and a recent archived copy.
- If an archived web copy predates the current RDAP creation date, the app flags **evidence of an earlier web lifecycle**.
- This can support a re-registration/repurposing hypothesis, but does not prove malicious intent or enumerate every registration cycle.
- Exact re-registration count and inactive-gap duration are explicitly marked as unavailable without historical WHOIS/passive DNS.
- DomainTools and SecurityTrails remain the deep pivots for that verification.

## Why the app does not claim "re-registered 3 times"
Free current RDAP normally exposes the current lifecycle, not a complete history of deleted and re-created domain objects. Guessing the count from sparse archive data would create false confidence.

## Deploy
Replace your existing repo contents with this package and push. Your existing Cloudflare Worker should redeploy automatically.
