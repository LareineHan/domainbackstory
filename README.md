# Domain Backstory v5

This version shifts the tool toward domain-change investigation rather than raw OSINT output.

## New in v5
- Wayback is explicitly explained as an archived copy of a website, **not** a site-creation date or ownership signal.
- Added a **Change Cluster** section emphasizing that a registrar change alone is not suspicious.
- Added deeper history pivots:
  - DomainTools WHOIS
  - SecurityTrails domain history
  - ICANN RDAP lookup
- The app tells the analyst what to look for: registrar, registrant/organization, nameserver, privacy-status, and site-identity changes.
- Historical ownership is not auto-claimed because public RDAP does not reliably provide it.

## Update
Replace the existing GitHub repo with these files, commit, and push. Cloudflare should redeploy automatically.

Repo structure:
```
domain-backstory/
├── package.json
├── wrangler.jsonc
├── public/
│   └── index.html
└── src/
    └── index.js
```
