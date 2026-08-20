# Domain Backstory v3 — Cloudflare Worker + Static Assets

This version fixes the 404 API problem from the earlier Pages Functions layout.

## Why v2 returned 404
Your Cloudflare project was deployed as a **Worker** (`workers.dev`), but v2 used a **Pages Functions** folder layout (`functions/api/...`). The HTML asset deployed, but `/api/rdap`, `/api/ct`, and `/api/wayback` did not exist.

## v3 structure
- `public/index.html` — website
- `src/index.js` — actual Cloudflare Worker API routes
- `wrangler.jsonc` — tells Cloudflare to run the Worker for `/api/*`
- `package.json` — Wrangler dependency/scripts

Cloudflare officially supports Worker + static assets using an `assets` binding and `run_worker_first` for selected routes.

## Update existing GitHub repo
Replace the existing repo contents with the contents of this ZIP and commit/push.

Your repo root should look exactly like:

```
domain-backstory/
├── package.json
├── wrangler.jsonc
├── public/
│   └── index.html
└── src/
    └── index.js
```

Remove the old `functions/` folder.

## Cloudflare build settings
If your existing Git-connected Worker redeploys automatically, let it run first.

If Cloudflare asks for commands:
- Build command: `npm install`
- Deploy command: `npx wrangler deploy`

After deployment, test:
`https://YOUR-WORKER.workers.dev/api/rdap?domain=yahoo.com`

You should see JSON rather than 404.

The UI now explicitly shows `RDAP: failed`, `CT: failed`, etc. It will never turn lookup failure into “no strong clue.”
