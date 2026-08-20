# Domain Backstory v9

Main change: `Current DNS Footprint` is replaced with `Current Infrastructure`.

The main view now interprets:
- Web/host destination from A/CNAME
- Inbound email gateway from MX
- Authorized outbound-provider clues from SPF
- DNS-management provider from NS
- DMARC when available

Raw A/AAAA/MX/NS/CNAME/SOA records are still available under `Show raw DNS records`.

Important interpretation safeguard:
MX is inbound routing. The app never treats `MX = Sophos` plus `Observed sender = Mailgun` as suspicious by itself.

The email-header analyzer remains browser-only and compares the observed sending provider against current SPF authorization clues, SPF/DKIM/DMARC, From/Return-Path/DKIM domains, and the investigated domain.

Deploy by replacing the existing repo with these files and pushing to GitHub.
