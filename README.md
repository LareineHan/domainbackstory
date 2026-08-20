# Domain Backstory v13 — UI redesign

## What changed
- Full UI redesign for faster scanning.
- Korean is the default and is fully supported across static labels and main dynamic analysis text.
- Fixed Korean wrapping: `word-break: keep-all`, `white-space: nowrap` on buttons, and a wider language toggle.
- Korean / English toggle remains persistent in localStorage.
- Strong top-level summary with a clear **Next step**.
- Raw technical data is de-emphasized and collapsible where possible.
- Current Infrastructure is shown as four analyst-friendly cards:
  - Web / host destination
  - Inbound mail routing
  - SPF outbound clues
  - DNS management
- Header findings use the selected language.
- Registration, lifecycle, timeline, reputation pivots, notes, and top buttons are retained.
- Floating ↑ and bottom ↑ Back to top are both retained.

## Validation
- Frontend JavaScript syntax: PASS
- Worker JavaScript syntax: PASS

## Deploy
Replace the existing GitHub repo contents with this package and push.
