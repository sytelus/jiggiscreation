# Jiggis Creation

Modern Indian ethnic wear for women, men and kids. Public website: **https://jiggiscreation.com/**.

This is an initial brand introduction, with collection enquiries sent to `shital@jiggiscreation.com`. It deliberately makes no product availability, manufacturing, pricing, delivery or sustainability claims. There is no checkout or email-subscription database.

## Development

Use Node.js 20 or later. No package installation is required.

```sh
npm run dev
# http://127.0.0.1:4173/

npm run build
npm run preview
```

The build copies `index.html`, `src/` and `public/` into `dist/` and checks referenced local assets. Reload the browser after edits. `dist/` is generated and not committed.

## Design and implementation

- Ivory, plum, saffron and sage; Cormorant Garamond display typography with Manrope for navigation and text. Google Fonts are optional external assets, with system font fallbacks.
- `src/sculpture.js`: original WebGL 2 parametric textile sculpture. Animation runs in vertex shaders, with two-sided lighting, woven motifs and gold borders. There are no 3D dependencies or external models.
- `src/main.js`: palette selection, animation pause, reduced-motion preferences, progressive reveals and current year.
- `src/style.css`: responsive layouts for small phones through ultrawide screens. The canvas caps resolution and uses a lower animation rate on phones. It stops rendering while offscreen or while the tab is hidden.
- The still SVG remains visible if WebGL is unavailable or the graphics context is lost; restored contexts rebuild GPU resources. Navigation and enquiries work without JavaScript.
- `public/assets/editorial.webp`: an original AI-generated illustrative campaign image for modern women's, men's and children's clothing. It is labelled as an imagined style story on the page, not presented as real stock or as a photograph of actual products. This optimized asset is approximately 230 KB.
- The collection illustrations are abstract CSS silhouettes, not product photographs.
- No trackers, cookies, browser storage, forms, or visitor-data collection are added. Contact links open the visitor's email client.

## Publication

The GitHub repository is `sytelus/jiggiscreation`. Settings → Pages should use **GitHub Actions**, with custom domain `jiggiscreation.com`. `.github/workflows/pages.yml` builds and deploys every push to `main`. `public/CNAME` preserves the custom domain in the deployed artifact.

Domain registrar: Namecheap. DNS: Cloudflare, with assigned nameservers `kami.ns.cloudflare.com` and `zac.ns.cloudflare.com`.

GitHub Pages DNS:

| Type | Name | Value |
| --- | --- | --- |
| A | @ | 185.199.108.153 |
| A | @ | 185.199.109.153 |
| A | @ | 185.199.110.153 |
| A | @ | 185.199.111.153 |
| CNAME | www | sytelus.github.io |

Use DNS-only records while GitHub validates the domain and provisions its certificate. Enable Enforce HTTPS when GitHub makes it available. MX/TXT records are managed separately by the email provider; never replace them with website records.

Email intent: receive `shital@jiggiscreation.com` at `shital@guni.ai`. Incoming forwarding does not by itself configure outbound sending as the new address.

## Updating the site

Edit the text in `index.html`, colours/layouts in `src/style.css`, and sculpture palettes/shape in `src/sculpture.js`. Replace the editorial asset with actual collection photography when available, and update its alt text, disclosure and Open Graph metadata together. Keep factual claims aligned with the real business.

Before publishing, check phone and desktop layouts, anchor links, mail links, colour and motion controls, reduced-motion behaviour, the WebGL fallback, and browser console errors. Run `npm run build`, commit and push. GitHub Actions publishes the site automatically.
