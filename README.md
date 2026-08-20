# Domain Backstory — browser version

No Python is needed on the school computer.

## Deploy with Cloudflare Pages
1. Create a GitHub repository, e.g. `domain-backstory`.
2. Upload **all files/folders from this ZIP** to the repository root.
3. In Cloudflare: **Workers & Pages → Create → Pages → Connect to Git**.
4. Select the repo.
5. Framework preset: **None**
6. Build command: leave blank
7. Build output directory: `.`
8. Deploy.

Open the generated `https://...pages.dev` URL in any browser.

## What it uses
- RDAP
- Certificate Transparency (`crt.sh`)
- Wayback/CDX
- Browser localStorage for your own notes

## Important
This is a passive context tool, not a compromise detector. Public metadata can be ambiguous.
Do not paste confidential email headers, credentials, tokens, or internal-only data into it.
