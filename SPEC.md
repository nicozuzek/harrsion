# Harrison — Ford Fiesta 2012 sales page

## Product goal

Create a polished, single-page Spanish sales experience for Harrison, a 2012 Ford Fiesta. The page should feel confident, spacious, and automotive, drawing from Ford's current visual language without copying Ford trademarks or presenting itself as an official Ford page.

The story is: current condition first, documented history second, evidence of mileage third, cosmetic details fourth, and a direct sale call-to-action last.

## Audience and tone

- Prospective private buyers in Argentina.
- Spanish copy, concise and factual.
- Emphasize care, traceability, and transparency.
- Avoid invented specifications, claims, photos, or condition notes.

## Information architecture

1. **Sticky header**
   - Wordmark `HARRISON` and `Fiesta 2012`.
   - Anchors: Fotos, Historial, Kilómetros, Detalles, Contacto.
   - Compact music player.

2. **Current photos / hero**
   - Full-bleed cinematic first viewport with a restrained blue/white Ford-inspired palette.
   - Title: `Ford Fiesta 2012`.
   - Supporting line centered on documented ownership and 91,000 km recorded.
   - Primary CTA scrolls to price/contact; secondary CTA scrolls to history.
   - Actual car photos are loaded from `public/car/current/` in filename order.
   - Until photos are supplied, show elegant, clearly labeled photo placeholders. Never use a stock vehicle photo that could misrepresent this car.

3. **Service history**
   - Scrollable vertical timeline on mobile and horizontally guided editorial sequence on desktop.
   - All 23 records from the supplied Google Sheet, newest first.
   - Each event shows date, workshop, category, mileage when available, and concise work summary.
   - Clicking an event opens an accessible modal/detail panel with full notes and every matching receipt scan.
   - Alongside the records, dated car photos appear as slightly rotated Polaroids, evoking film end credits without compromising readability.

4. **Kilometres chart**
   - Responsive line/area chart plotting all records that contain mileage.
   - X axis is chronological date; Y axis is km, formatted for Spanish locale.
   - Include hover/tap tooltip and the latest reading of `91.000 km`.

5. **Detalles**
   - Editorial image grid sourced from `public/car/details/`.
   - Intended for aesthetic imperfections and close-ups; neutral wording and no hidden-condition claims.
   - Empty state explains where to add images.

6. **Price and contact**
   - Strong closing section: `USD 10.000`.
   - Mail CTA to `nicozuzek@gmail.com` with subject for the Fiesta.
   - Repeat latest documented mileage and year.

## Drop-folder content workflow

The repo is the content manager; no admin UI or database is required.

```text
public/car/current/
  01-frente.jpg
  02-lateral.jpg

public/car/records/
  2025-02-03--service-norauto.jpg
  2025-02-03--factura-norauto.pdf
  2025-05-31--stereo.jpg

public/car/details/
  01-rayon-puerta.jpg
  02-interior.jpg
```

- `current`: hero/sales photos, sorted by filename.
- `records`: files beginning with `YYYY-MM-DD--`; the date automatically attaches them to the matching timeline event. Images render as photos/receipt scans; PDFs open in a new tab and are listed in the expanded event.
- `details`: cosmetic-detail images, sorted by filename. The readable caption comes from the text after the numeric prefix, replacing hyphens with spaces.
- Supported assets: `.jpg`, `.jpeg`, `.png`, `.webp`, `.avif`, and `.pdf` for records.
- New files appear after the next commit/deployment. A README must explain this workflow.

Maintenance data lives in `content/services.json`, transcribed from the supplied read-only Google Sheet. It is the stable source for the deployed page. The source Sheet URL and import date are recorded in that file. A small validation script should reject malformed dates, duplicate IDs, or decreasing known mileage.

## Music interaction

- Track: `See You Again (feat. Charlie Puth)` by Wiz Khalifa.
- Use the official Apple/iTunes 30-second preview URL and album artwork, with a link to the Apple Music track. Do not commit copyrighted audio.
- Browsers block unprompted audio, so playback begins only after the visitor presses the control.
- The control looks like a small vinyl record with album art. Playing = rotating record and active blue icon. Paused = rotation stops and the entire control becomes muted gray.
- Button must expose `aria-pressed`, a changing accessible label, visible focus, and respect reduced-motion preferences.

## Visual direction

- Ford-inspired, not a clone: deep navy, Ford-like electric blue, white, pale cool gray, and one warm paper tone for Polaroids.
- Large condensed/display headlines paired with a clean sans-serif UI face loaded locally or through `next/font`.
- Full-width image-led sections, generous whitespace, confident large numerals, thin dividers, and pill-shaped primary actions.
- The timeline uses controlled cinematic movement and staggered Polaroids. All essential information remains available when reduced motion is requested.
- No Ford oval logo and no language implying official affiliation.

## Technical implementation

- Next.js App Router + TypeScript, deployable on Vercel.
- Primarily Server Components. A small client component owns audio state, the gallery, timeline expansion/modal, and chart tooltips where needed.
- Build-time filesystem discovery for the three public asset folders.
- Use `next/image` for raster images, semantic HTML, keyboard-operable dialogs, and responsive layouts from 360 px upward.
- No environment variables, database, or runtime dependency on Google Sheets.
- Metadata title/description and a repository-local social preview asset.
- `npm run build`, lint/type checks, and content validation must pass.

## Source data summary

- 23 events from 2013-04-05 through 2026-07-22.
- 16 dated mileage readings (14 distinct values), from 6,073 km in 2013 to 91,000 km in 2026. The source's early 6,073 → 6,071 discrepancy is preserved and explicitly marked as a source anomaly.
- Known categories include service, repairs, wheels/tyres, battery, glass, clutch, gearbox, cooling, and stereo.
- Preserve source gaps: do not fabricate mileage or work detail where the Sheet is blank.

## Acceptance criteria

- Page order exactly follows Photos → Timeline → Km chart → Detalles → Price/contact.
- All 23 source records are present and chronologically correct.
- Dated record files attach automatically and open from the relevant expanded event.
- Real-car asset folders have helpful polished empty states.
- Music toggles reliably, animation mirrors playback, and failure to load is handled gracefully.
- Responsive and keyboard accessible; reduced-motion is supported.
- Repository includes clear content-update documentation.
- Production build succeeds, repository is pushed to the supplied GitHub remote, and the production Vercel URL responds successfully.
