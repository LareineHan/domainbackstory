# Domain Backstory v10

## Fixes
- Registration/RDAP lookup is more fault-tolerant:
  1. tries rdap.org with retry,
  2. falls back to the official IANA RDAP bootstrap and authoritative registry endpoint,
  3. returns a detailed multi-source error instead of a vague failure.
- Longer RDAP timeout and one retry per source.
- Lifecycle panel no longer tries to infer anything when registration data is unavailable.
- Added a floating **↑ Back to top** button in the lower-right corner after scrolling down.

## Deploy
Replace the existing GitHub repo contents with this package and push.
Your connected Cloudflare Worker should redeploy automatically.

## Quick registration test
After deployment:
`/api/rdap?domain=yahoo.com`

The JSON now also includes a `source` field so you can see whether the result came from `rdap.org` or the IANA/registry fallback.
