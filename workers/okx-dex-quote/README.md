# Pangolins OKX DEX Quote Worker

This Worker backs the static Pangolins Swap page with live OKX DEX quotes only. It does not request swap calldata, approvals, signatures, or transaction broadcast.

## Required Secrets

Set these as Cloudflare Worker secrets:

```powershell
npx wrangler secret put OKX_API_KEY
npx wrangler secret put OKX_SECRET_KEY
npx wrangler secret put OKX_PASSPHRASE
```

Optional variable:

```text
ALLOWED_ORIGINS=https://bitpickles.github.io,http://localhost:4173,http://127.0.0.1:4173
```

## Deploy

```powershell
cd workers/okx-dex-quote
npx wrangler deploy
```

After deployment, set the frontend build variable:

```text
VITE_DEX_QUOTE_ENDPOINT=https://<worker-name>.<account>.workers.dev/api/dex/quote
```

For GitHub Pages, set repository variable `DEX_QUOTE_ENDPOINT` to the same Worker URL.
