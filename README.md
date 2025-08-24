# Portfolio — Secure & Intelligent Solutions

A dark, neon, cyberpunk-inspired personal portfolio with matrix animation, skills visuals, project cards, blog, case studies, testimonials, and a working mailto contact form.

## Structure
- `index.html` — main page with all sections
- `assets/css/style.css` — theme, layout, animations (dark/light theme)
- `assets/js/main.js` — matrix background, nav, theme toggle, contact actions

## Customize
Edit these in `index.html`:
- Hero
  - Replace `Nama Lengkap Anda` (H1)
  - Tagline (`.hero-tag`) — pick or update text
- About (`#about`) — update paragraph and stats
- Skills (`#skills`) — tune percentages via `style="--value: NN"`
- Projects (`#projects`) — replace titles, descriptions, links, and images (change `.placeholder` to real screenshots)
- Publications (`#publications`) — change the paper link/title, badges, achievements
- Education (`#education`) — program/semester and journey goals
- Testimonials (`#testimonials`) — replace text and names
- Blog & Case Studies — update content or point to real posts
- Contact (`#contact`)
  - Email: change `you@example.com` in the `#emailLink`
  - LinkedIn: update the URL

## Run locally
Open `index.html` directly in your browser, or serve locally for best results.

Windows PowerShell (optional):
- Python (if installed):
```powershell
python -m http.server 5500
```
- Node (if installed, using npx):
```powershell
npx serve . -l 5500
```
Then open http://localhost:5500

## Deploy
- GitHub Pages: push this folder to a repo, enable Pages (branch: main, folder: root)
- Netlify/Vercel: drag-and-drop or connect the repo; framework = static

## Notes
- Contact form uses `mailto:` (opens your email client). For a backend, you can wire Formspree, Netlify Forms, or a serverless function.
- Toggle theme with the button in the navbar. Preference is stored in `localStorage`.
- Matrix animation can be disabled by removing the `<canvas>` and its JS block.
