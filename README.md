# SUchedule

A fast, modern course schedule builder for Sabancı University students.

**Live:** https://ogzozbl.github.io/suchedule/

## Features

- 📚 Browse all courses A–Z, or search by code / name
- 🧱 Visual weekly grid — click a block to remove it
- ⚠️ Instant conflict detection; conflicting sections share the slot side by side
- 🍽️ Lunch break window and free-day filters (violating sections are dimmed, not hidden)
- 🚫 Exclude instructors from results
- 🔗 Share your schedule as a link, copy CRNs with one click
- 📆 Export as `.ics` (Google / Apple Calendar) or PNG image
- 💾 Your schedule survives refreshes (localStorage)
- 🌗 Light / dark theme, installable PWA

## Data

Course data is scraped weekly from Sabancı University BannerWeb by a GitHub Action
([`update-data.yml`](.github/workflows/update-data.yml)) and committed to
[`src/data/courses.json`](src/data/courses.json). The current term code lives in
[`scraper/term.txt`](scraper/term.txt) — update it each semester
(format: `YYYYNN`, e.g. `202601` = Fall 2026–27, `02` = Spring, `03` = Summer).

Run manually:

```bash
pip install -r scraper/requirements.txt
python scraper/scrape.py 202601 src/data/courses.json
```

## Development

```bash
npm install
npm run dev
```

Built with Next.js (App Router), TypeScript, Tailwind CSS, and Zustand.

## Deployment

Pushes to `main` deploy automatically to GitHub Pages via
[`deploy.yml`](.github/workflows/deploy.yml). The build uses
`NEXT_PUBLIC_BASE_PATH=/suchedule` for correct asset paths.

## Credits

Inspired by the original [SUchedule](https://github.com/aburakayaz/suchedule)
by Adnan Burak Ayaz (MIT). This is a from-scratch redesign with a new UI and
feature set; the scraper is adapted from the original project.

## License

[MIT](LICENSE)
