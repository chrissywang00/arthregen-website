# ArthRegen — Marketing Website

Bilingual (Korean default, English secondary) marketing website for **ArthRegen Co., Ltd.** — a regenerative-medicine platform spun out of Samsung Medical Center, designing personalized cartilage and meniscus regeneration therapies.

> **Healing motion, Restoring moments.** / 움직임을 치유하고, 순간을 되찾다.

## Pages
- `index.html` — Home (video hero + product platform overview)
- `about.html` — Company, CEO greeting, leadership, advisors, partners
- `pipeline.html` — Carti-All · MeniSave · MeniFul, with figures and regulatory strategy
- `investors.html` — Market opportunity, investment highlights
- `news.html` — Press coverage, media appearances, announcements
- `contact.html` — Contact form and IR contacts
- `announcements/*.html` — Individual announcement detail pages with image carousels

## Tech
Plain HTML / CSS / vanilla JS — no build step, no framework, no dependencies.

- `assets/css/styles.css` — single stylesheet, brand-aligned design system
- `assets/js/main.js` — language toggle, mobile nav, dropdown, lightbox, image carousel
- `assets/img/` — logos, products, news photos
- `assets/video/hero.mp4` — homepage hero background video

## Brand
Per `ArthRegen_Brand_System_v0.2.md`:
- Colors: Navy `#293a8e` → Blue `#28759b` → Blue-mid `#28a6a5` → Teal `#28b9aa` (signature 4-stop gradient)
- Type: **Inter** (Latin) + **Pretendard** (Korean) + **IBM Plex Mono** (data accents)
- Voice: clinically precise, quietly confident, humanely grounded

## Local development
This is a static site — open any HTML file in a browser, or serve the folder:

```bash
python3 -m http.server 8000
# then visit http://localhost:8000
```

## Deploy
Static — drop into any web host, or enable GitHub Pages from the repo settings.
