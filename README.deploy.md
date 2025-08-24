# Deploying this Portfolio (Free)

This is a static site (HTML/CSS/JS). Recommended free platforms:

- Vercel (fast, global CDN, simple)
- Netlify (fast, global CDN)
- Cloudflare Pages (fast, generous bandwidth)
- GitHub Pages (simple, pair with Cloudflare CDN for bandwidth)

Images: You have many photos. Use CDN caching and modern image formats to keep it fast.

## 1) Vercel (recommended)
1. Push this folder to a GitHub repo.
2. Create a project on Vercel and import the repo.
3. Root directory: `/` (where `index.html` lives). No build command.
4. `vercel.json` here sets long cache for `/assets/**`.
5. Deploy. Your site will be on a `*.vercel.app` domain.

Tips:
- Use Vercel Analytics to observe image weight.
- If you add videos, host them on Cloudflare Stream or YouTube (unlisted) and embed.

## 2) Netlify
1. Push to GitHub.
2. Create a Netlify site from Git and select the repo.
3. Build command: none. Publish directory: `/`.
4. Add a `_headers` file (see below) to enable long cache for `/assets/**`.

Create a `_headers` file with:

```
/*
  Cache-Control: public, max-age=0, must-revalidate
  X-Content-Type-Options: nosniff
  X-Frame-Options: SAMEORIGIN
  X-XSS-Protection: 1; mode=block

/assets/css/*
  Cache-Control: public, max-age=31536000, immutable

/assets/js/*
  Cache-Control: public, max-age=31536000, immutable

/assets/img/*
  Cache-Control: public, max-age=31536000, immutable

/assets/video/*
  Cache-Control: public, max-age=31536000, immutable
```

## 3) Cloudflare Pages
1. Push to GitHub.
2. Create a Pages project and connect the repo.
3. Framework preset: None. Build command: none. Output directory: `/`.
4. In Pages Settings, add Caching rules to set 1-year cache for `/assets/*` and `immutable`.

## 4) GitHub Pages
1. Push to a repo. In Settings → Pages, choose main branch, root.
2. Keep `.nojekyll` to disable Jekyll processing.
3. For performance and bandwidth, front it with Cloudflare (free) as a CDN and set cache rules for `/assets/*`.

---

## Image & Video Best Practices
- Convert images to WebP/AVIF and resize to 320/640/960/1280 widths.
- Use `<img loading="lazy" decoding="async">` (already added); for hero/LCP image consider `fetchpriority="high"` and avoid lazy.
- Consider Cloudinary/ImageKit to auto-serve compressed images on-the-fly (free tiers available).
- Videos: Prefer Cloudflare Stream or YouTube/Vimeo. If self-host, use HLS with multiple bitrates and cache via CDN.

## Contact Form
- Currently uses Formspree endpoint with mailto fallback. In `assets/js/main.js`, update `FORM_ENDPOINT` if needed.

## Development
- Local test: `py -3.11 -m http.server 5500` (Windows) then open http://localhost:5500/

