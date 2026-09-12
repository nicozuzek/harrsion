# Harrison · Ford Fiesta 2012

Static, Spanish-language sales page for a 2012 Ford Fiesta. Built with Next.js and deployable to Vercel.

## Add photos and receipts

The three folders under `public/car/` are the content manager:

- `current/`: current sales photos, sorted by filename (`01-frente.jpg`, `02-lateral.jpg`).
- `records/`: scans and photos named `YYYY-MM-DD--descripcion.ext`. The date joins the matching service record automatically; PDFs appear as links and images in the expanded detail panel.
- `details/`: close-ups and cosmetic details, sorted by filename. A caption is derived from the text after the numeric prefix.

Supported image types are `.jpg`, `.jpeg`, `.png`, `.webp`, and `.avif`; records also support `.pdf`. Files appear after committing and deploying.

## Development

```bash
npm install
npm run validate:content
npm run dev
```

Run `npm run build` before deploying. The source spreadsheet URL and import date are recorded in `content/services.json`; that JSON is the stable, read-only data source used at build time.
