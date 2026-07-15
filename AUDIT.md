# Control Tee — Site Audit

Branch: `feature/site-audit-and-fixes`. Generated as the working checklist for the fix loop. Each item is marked `[ ]` pending or `[x]` resolved as work proceeds.

## 1. Codebase map

**Pages**
- `index.html` — homepage. Hero video, about section, dynamic poster marquee, 5 category folders, partner logos, desktop taskbar, footer. Pulls hero video, posters, and site text (hero subtitle, about headline/body) live from Supabase.
- `contact.html` — contact form. Submits via Web3Forms REST API (`fetch` to `api.web3forms.com/submit`) with an hCaptcha widget and honeypot field. Not wired to Supabase for storage, only loads `db.js` for the shared client (currently unused on this page besides being declared).
- `category.html` — lists projects for a category. Reads `?id=<slug>` from the URL, looks up the category in Supabase `categories`, then lists matching `projects`.
- `project.html` — single project/case-study page. Reads `?id=<uuid>`, fetches `projects` joined with `categories`/`clients`, plus a `project_media` gallery.
- `admin.html` — CMS. Supabase Auth email/password login, gates a tabbed panel for Posters, Videos, Hero Video, Site Text, Categories, Clients, Projects, Project Gallery.
- `mg-motion.html`, `project-template.html` — static legacy case-study templates from before the Supabase-driven `project.html` existed. **Not linked from anywhere in the site** and both link back to pages that don't exist (`motion-design.html`, `brand-identity.html`).

**JS**
- `db.js` — initializes the shared Supabase client (`window.db`) from a hardcoded URL + anon key. Loaded by every page.
- `animations.js` — all interaction/motion logic: preloader, text scramble, scroll reveals, grain overlay, magnetic buttons, cursor trail, page-transition curtain wipe, accessibility widget toggle, folder-open transition. Respects `prefers-reduced-motion`.

**CMS admin panel**
- Auth: Supabase Auth (`signInWithPassword`), session persisted by the SDK; access gated purely by having a valid Supabase user account (there is no separate app-level password gate — the "Enter password" screen *is* Supabase Auth).
- Can create/edit/delete: posters (image + DB row), homepage hero video (storage upsert), YouTube video links, site text fields (hero subtitle, about headline/body, contact intro), category descriptions, clients (with optional parent for subclients + banner image), projects (title, category, client, date, description, cover image/video, drag-to-reorder), project gallery images.
- Talks to Supabase Storage bucket `portfolio_assets` for all binary uploads, and to Postgres tables `posters`, `videos`, `site_content`, `categories`, `clients`, `projects`, `project_media`.
- RLS policies and bucket policies are **not visible in the codebase** (no `supabase/` migrations directory) — could not be audited from code. Flagged for manual verification in Supabase dashboard (see Handover).

**Config**
- `vercel.json` — sets HSTS, X-Content-Type-Options, X-Frame-Options, Referrer-Policy, Permissions-Policy, and a CSP. No `Cache-Control` headers for static assets.
- No `robots.txt`, no `sitemap.xml`, no favicon declared anywhere.

## 2. Findings and fixes

### Newly discovered during the fix loop
- [x] `contact.html` had no `<footer>` at all (every other page has one with social links). Added the standard footer for consistency, now also carrying the legal page links.

### Priority 1 — Broken / dead code
- [x] `mg-motion.html` back-link points to non-existent `motion-design.html`; "Back" nav in `project-template.html` points to non-existent `brand-identity.html`. Both pages are orphaned (nothing in the site links to them). Fixed dead links rather than deleting the files (deletion needs explicit sign-off per guardrails) — flagged in Handover as delete candidates.
- [x] `index.html`'s `loadDynamicContent()` has no error handling — if `db.js`/Supabase CDN fails to load (ad-blocker, offline, CDN outage), the whole script throws uncaught and silently breaks the homepage's dynamic content with no fallback. `category.html`/`project.html` already guard this with try/catch; `index.html` did not.
- [x] `README.md` contained only `# vividsourcesolutions`, a leftover from a template/boilerplate, not descriptive of this project at all.
- [x] Dead CSS in `style.css` for classes never referenced by any HTML or JS: `.scroll-progress`, `.cursor-dot`, `.slider-container`, `.horizontal-track`, `.folder-desc`, `.folder-icon-label`, `.contact-links`, `.contact-link-label`, `.contact-link-value`.
- [ ] Supabase JS SDK loaded via unpinned `@supabase/supabase-js@2` on jsdelivr on every page — floats to latest 2.x. Left as-is after review (jsdelivr's `@2` behaves like npm's caret range, won't jump to a breaking v3); noted as a low-priority hardening item for the handover rather than guessing an exact pinned version that might not resolve.

### Priority 2 — Security
- [x] Public pages (`category.html`, `project.html`) interpolate admin-entered free text (project title, description, category name, client name) directly into `innerHTML` with no escaping. Low likelihood (requires a compromised admin session or RLS misconfiguration to inject), but fixed with a shared `escapeHtml()` helper for defense in depth.
- [x] `admin.html` should not be indexable by search engines. Added `<meta name="robots" content="noindex, nofollow">`.
- [ ] RLS policies / bucket access policies could not be verified from the repo. Flagged for manual check in Supabase dashboard — **not modified**, per guardrails.
- [x] Contact form and CMS input handling reviewed: honeypot field present, required fields enforced client-side, Web3Forms handles spam/captcha server-side. No action needed.

### Priority 3 — Accessibility & mobile
- [x] Accessibility widget toggle button lacked `aria-label`, `aria-haspopup`, `aria-expanded`; menu had no `role`.
- [x] No "Skip to content" link for keyboard users.
- [x] Preloader had no `aria-hidden`, so screen readers would announce the scrambling counter/tagline as content.
- [x] `.empty-state` text (used for real state messages like "No projects found") was set at 0.25 opacity on black — fails WCAG AA contrast (~2.6:1). Increased opacity.
- [x] Desktop taskbar (`"4 folders open"` center item) could overflow/crowd on narrow phones — hidden below 640px, matching the site's existing mobile breakpoint pattern.
- [x] `.case-meta` grid item padding too wide for very small screens, causing cramped metadata rows. Reduced padding at the 640px breakpoint.

### Priority 4 — Performance
- [x] Fonts loaded via CSS `@import` in `style.css`, which serializes the font fetch behind the stylesheet fetch (render-blocking, not discoverable by the preload scanner). Converted to `<link rel="preconnect">` + `<link rel="stylesheet">` tags in each page's `<head>`.
- [x] No `loading="lazy"` on dynamically rendered poster/project images in `category.html`, `project.html`, `index.html`'s poster marquee.
- [x] No `Cache-Control` headers for static assets (fonts, images, video) in `vercel.json`. Added long-lived caching for `/assets/*`.

### Priority 5 — SEO / metadata
- [x] No favicon on any page. Added, using the existing logo asset.
- [x] Only `index.html` and `contact.html` had a `<meta name="description">`. Added to `category.html`, `project.html`, `mg-motion.html`, `project-template.html`.
- [x] No Open Graph / Twitter Card tags anywhere. Added to all public-facing pages.
- [x] No `robots.txt`. Added, disallowing `/admin.html` and pointing at the sitemap.
- [x] No `sitemap.xml`. Added, covering the static pages and the five known category slugs used on the homepage.

### Priority 6 — Visual polish
- [x] No changes made to design tokens (background/accent/border colors, fonts) per instructions. Minor consistency pass only where required by the accessibility/mobile fixes above (contrast, spacing) — nothing decorative changed beyond what those fixes required.

## 3. Phase 3 — CMS verification
- [x] Confirmed create/read/update/delete code paths exist and are wired correctly for every content type the admin panel exposes (posters, hero video, YouTube videos, site text, categories, clients, projects incl. reordering, project gallery media).
- [x] Storage bucket name (`portfolio_assets`) is consistent across every upload/delete call.
- [x] No credentials, API keys, or RLS policies were changed.

## 4. Phase 4 — Legal pages
- [x] `privacy.html` — Privacy Policy
- [x] `terms.html` — Terms of Service
- [x] `copyright.html` — Copyright & Client Work Notice
- [ ] Cookie notice — **not added as a standalone page.** The audit found no first-party analytics/tracking cookies; the only third-party script that may set cookies is hCaptcha on the contact page (functional/security purpose, not tracking). Covered instead as a short section inside the Privacy Policy rather than a separate page. Flagged for lawyer review same as the other three.
- [x] All three linked from the footer of every page.
