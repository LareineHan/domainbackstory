# Domain Backstory v11.1 — build fix

Validated with `node --check` before packaging.

# Domain Backstory v11

## Registration fallback improvements
- RDAP 404/not-found is shown as **Registration record not found via RDAP**, not as evidence that the domain is malicious or nonexistent.
- The registration card immediately offers:
  - **Check ICANN Lookup**
  - **Check WHOIS (DomainTools)**
  - **Retry RDAP**
- The Lifecycle card also shows ICANN/WHOIS fallback buttons whenever registration data is unavailable.
- Provider errors and not-found conditions remain conceptually separate.

## Navigation
- The floating lower-right **↑** button from v10 is retained.
- A visible **↑ Back to top** button is also added at the very bottom of the page.

## Deploy
Replace the existing repo contents with this package and push. The connected Cloudflare deployment should rebuild automatically.
