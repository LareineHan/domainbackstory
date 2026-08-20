# Domain Backstory v12 — Korean / English

## UX changes
- 한국어 / English toggle
- Korean is the default; choice is saved in browser localStorage
- New compact summary at the top:
  - key domain context
  - recent registration changes
  - inbound gateway
  - SPF outbound-provider clues
  - recommended next investigation step
- Raw/technical details remain below
- Existing floating ↑ button and bottom ↑ Back to top button are retained

## Validation
- Frontend inline JavaScript: syntax checked with Node
- Worker JavaScript: syntax checked with Node

## Deploy
Replace the existing GitHub repo contents with this package and push.
