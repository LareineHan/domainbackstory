# Domain Backstory v16 — stable rewrite

This version removes the fragile global-loading logic.

- Every source has a hard browser timeout.
- Registration and DNS render independently.
- The top progress bar ends as soon as the two core sources finish.
- Wayback is enrichment and never blocks core results.
- No source can keep the entire page in loading state forever.
- Korean/English UI and top buttons are retained.
- Raw header parsing remains browser-only.

Both frontend and Worker JavaScript are syntax-checked before packaging.
