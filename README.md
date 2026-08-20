# Domain Backstory v6

Rebuilt around the information that is actually useful during sender-domain triage.

## Primary data
- Domain creation date
- Domain last-changed date
- Registry expiration
- Registrar expiration (when supplied)
- RDAP database update date
- Registrar + IANA ID
- Registrar entity creation/change dates (only when RDAP actually supplies them)
- Nameservers + domain status
- Current DNS: A, AAAA, MX, NS, CNAME, SOA
- Lightweight Wayback archived-copy evidence

## Reliability improvements
- RDAP first uses the official IANA RDAP bootstrap to reach the registry directly.
- `rdap.org` is only a fallback.
- DNS uses Cloudflare DNS-over-HTTPS.
- CT is optional enrichment rather than a required source.

## Reputation pivots
- Cisco Talos button opens Talos Reputation Center.
  Talos documents public lookup rate limits and disallows scraping, so v6 does not automate it.
- VirusTotal button opens the direct GUI domain report; no API key is stored.
- DomainTools / SecurityTrails buttons are for historical WHOIS / ownership changes.
- Wayback opens full history for visual identity comparison.

## Update
Replace your existing GitHub repo contents with this ZIP and push.
Cloudflare should redeploy the same Worker URL automatically.
