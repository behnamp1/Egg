# THE EGG — Local Interactive Demo

A desktop-first interactive prototype exported from a Google Stitch design and rebuilt as a clean static website.

## What works
- Click the egg surface to register a hit.
- Each hit adds a small crack and impact mark.
- Subtle synthesized tap sound (can be turned off).
- Hit count and impact marks persist in the current browser using `localStorage`.
- Keyboard interaction: focus the egg and press Enter or Space.
- Reset local demo data.

## Important limitations
This is a **local browser demo**, not the shared multi-user game:
- Hits are not shared between visitors or devices.
- There is no server-side hidden breaking point.
- There is no real prize, payment, account, or checkout system.
- Prize labels are illustrative only.
- Do not use this prototype to collect money or promise prizes.

A shared egg requires a backend (for example Supabase), server-side validation, realtime updates, rate limiting, audit logs, and a legal review before any paid prize mechanic is considered.

## Run locally
Open `index.html` in a modern browser. No build step or package installation is required.

## Publish on GitHub Pages
1. Create a **public** GitHub repository.
2. Upload `index.html`, `styles.css`, `app.js`, and the `assets` folder to the repository root.
3. Open **Settings → Pages**.
4. Under **Build and deployment**, choose **Deploy from a branch**.
5. Select branch `main` and folder `/(root)`, then save.
6. Wait for the Pages deployment to finish. GitHub will show the public URL in the Pages section.

## Project files
- `index.html` — page structure
- `styles.css` — visual design and animations
- `app.js` — local interaction, SVG cracks, sound, and browser storage
- `assets/egg.png` — local egg image asset
