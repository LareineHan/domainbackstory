# Domain Backstory v2

Updated browser version with:
- RDAP Created / Updated / Expires / Registrar / IANA ID / Nameservers / Status
- Color-coded fields that deserve attention
- Analyst-oriented explanations
- Combined timeline across RDAP, Certificate Transparency, and Wayback
- Local analyst notes

## Update your existing deployment

Because your Cloudflare project is already connected to GitHub, the easiest update is:

1. Replace the files in your existing GitHub `domain-backstory` repo with the contents of this ZIP.
2. Commit/push the changes.
3. Cloudflare should automatically start a new deployment.
4. When deployment is complete, refresh your existing `workers.dev` URL.

No new Cloudflare project is needed.

## Important
This remains a passive context tool. Recent registration changes or certificate activity are clues, not proof of compromise.
