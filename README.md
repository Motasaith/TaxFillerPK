# TaxFillr

Tax records, estimates and FBR notice replies for people who file their own returns in Pakistan.

Scan a receipt, a salary slip, a bank statement or a letter from the tax office. The text is read on
your own machine, a model turns it into structured fields, and you approve them before anything is
saved. Records live in your browser, feed a slab by slab calculator, and give an advisor chat the
context to answer using your figures rather than generic examples.

## What it does

| Page | What it is for |
| --- | --- |
| `/dashboard` | Totals by head, tax already paid, estimated balance, upcoming FBR dates |
| `/scan` | Upload a document, read it, review the extracted fields, save the record |
| `/documents` | Search, filter, edit, delete, export to CSV |
| `/advisor` | Streaming chat that can see your saved totals |
| `/calculator` | Salaried and non salaried slabs, set against tax already deducted |
| `/notices` | Read an FBR notice, get the section, deadline, risk and a draft reply as PDF |
| `/settings` | Ollama key, model, connection route, profile, backup and restore |

Marketing and legal pages live at `/`, `/about`, `/guide`, `/contact` and `/legal`.

## Architecture

- Next.js 15 App Router, exported as a fully static site (`output: 'export'`). No server, no
  database, no accounts.
- Text recognition runs in the browser through Tesseract. PDF parsing uses pdf.js, spreadsheets use
  SheetJS. Scanned PDFs with no text layer fall back to image recognition on the first three pages.
- The only outbound call is to the Ollama chat API with the key the user supplies. It is stored in
  `localStorage` on that device and never sent anywhere else.
- One Cloudflare Pages Function, `functions/api/ollama.ts`, exists purely as a CORS relay for
  browsers that block the direct call. It forwards the request, streams the reply back and stores
  nothing. Users can switch it off in Settings.

```
src/
  app/(site)/     home, about, guide, contact, legal
  app/(app)/      dashboard, scan, documents, advisor, calculator, notices, settings
  components/     ui primitives, site sections, app views
  lib/            ollama client, ai calls, file extraction, tax slabs, store, pdf export
functions/api/    Cloudflare relay
```

## Running locally

```bash
npm install
npm run dev
```

Open http://localhost:3000.

Note that `next dev` does not run Cloudflare Functions, so the relay at `/api/ollama` is missing
during development. That matters because **ollama.com answers a CORS preflight with 405 and no
allow-origin header, so a browser can never call it directly**. The relay is the only route that
works against Ollama Cloud, and the app defaults to it.

For AI features while developing, either run `npm run preview` (below), which serves the built site
through Wrangler with functions enabled, or point the base URL at a local Ollama server, which is
the one case where a direct call works.

To use a local Ollama server instead of the cloud:

```bash
ollama pull gemma3:12b
export OLLAMA_ORIGINS=http://localhost:3000   # Windows: set OLLAMA_ORIGINS=http://localhost:3000
ollama serve
```

Then set the base URL to `http://localhost:11434` in Settings.

## Building

```bash
npm run build      # static export into ./out
npm run typecheck  # tsc --noEmit
npm run serve      # serve ./out on a static server, no functions
npm run preview    # build, then run ./out plus functions through Wrangler
```

## Deploying to Cloudflare Pages

### Option A, connect the Git repository

1. Push this project to GitHub or GitLab.
2. In the Cloudflare dashboard, open **Workers and Pages**, then **Create**, then **Pages**, then
   **Connect to Git**, and pick the repository.
3. Build settings:
   - Framework preset: **Next.js (Static HTML Export)**
   - Build command: `npm run build`
   - Build output directory: `out`
   - Node version: 20 or later (add `NODE_VERSION = 20` under environment variables if the default
     is older)
4. Deploy. The `functions/` directory is picked up automatically and the relay becomes available at
   `/api/ollama`.

### Option B, deploy from your machine

```bash
npm run build
npx wrangler pages deploy out --project-name taxfillr
```

Run this from the project root so Wrangler finds the `functions/` directory. The first run creates
the project and asks which branch to treat as production.

There are no environment variables and no secrets to configure. Every user brings their own Ollama
key, which never reaches the deployment.

`public/_headers` sets the security headers and cache policy Cloudflare applies to the deployed
site.

## Accuracy and scope

Slab rates follow the salaried and non salaried schedules current at the time of writing and are
revised with every Finance Act. Deadlines are the statutory dates, and FBR frequently extends the
filing date by notification. Every figure the app produces, and every reply it drafts, is a working
draft to check before filing or sending. The full position is on `/legal`.

Scope is individual filers: salaried people, freelancers, professionals and sole proprietors.
Company returns, group structures and full sales tax compliance are out of scope for this version.
