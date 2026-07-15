# Handover — Site Audit & Fixes

Branch: `feature/site-audit-and-fixes`. This document is the wrap-up for the audit/fix session described in `AUDIT.md`. Read that file for the full item-by-item checklist; this file is the narrative summary, the CMS guide, and the next steps.

## 1. What was broken, in plain language

- Two old case-study pages (`mg-motion.html`, `project-template.html`) had "Back" buttons pointing to pages that were deleted a long time ago when the site moved to a database-driven system. Nobody links to these two pages from anywhere else on the site, but if someone landed on them directly, the back button was a dead end. Fixed the links; see "Known issues" below for why these pages exist at all.
- The homepage would silently break its dynamic content (hero video, posters, live text) with no fallback if Supabase's script failed to load, for example from a slow connection or an ad-blocker. It now fails gracefully and logs a clear error instead.
- Text and image data pulled from the database was inserted into the page without escaping in a couple of spots on the public project/category pages. This is a low-risk issue (the data can currently only get there through the admin panel), but it's now escaped as a safety net.
- Fonts were loading in a way that delayed the whole page's text from appearing (`@import` inside the stylesheet). Switched to standard `<link>` tags, which load in parallel with everything else.
- No favicon, no page previews when a link is shared on social media/WhatsApp, no `robots.txt`, no sitemap. All added.
- Several accessibility gaps: no way to skip the animated intro when using a keyboard, the accessibility menu button didn't announce itself properly to screen readers, and some status text ("No projects found yet", etc.) was too faint to read comfortably. Fixed.
- On very narrow phone screens, the bottom taskbar and the project info boxes were a bit cramped. Tightened up.
- `contact.html` had no footer at all, unlike every other page (no social links, nothing). It now matches the rest of the site.
- Removed a chunk of CSS left over from earlier designs that nothing on the site actually uses anymore.

## 2. How the CMS works

Go to `/admin.html`. There's no separate "site password", the login screen is a real account login (Supabase Authentication, email + password). Whoever has a Supabase user account for this project can log in here.

Once logged in you get eight tabs:

| Tab | What it does |
|---|---|
| **Posters** | Manages the homepage's scrolling poster marquee only (not the "Poster Designs" project folder — that's under Projects). Drop an image, it auto-compresses it, then click **Save Changes**. |
| **Videos** | Paste a YouTube link to add it to the video grid. |
| **Hero Video** | Uploads the homepage's background video. After uploading, it gives you a URL to paste into `index.html` manually (this one step isn't automatic by design). |
| **Site Text** | Edits the homepage subtitle/headline/body text and the contact page intro, without touching code. |
| **Categories** | Edits the description shown at the top of each category page (Motion Design, Poster Designs, etc.). The categories themselves aren't created here, just their descriptions. |
| **Clients** | Add clients (and sub-clients, for things like a university's individual departments) with an optional banner image. |
| **Projects** | The main one: title, category, client, date, description, and a cover image or video. Drag rows to reorder how they appear on the category pages. Click "Edit" on an existing project to update it. |
| **Project Gallery** | Adds extra images to a specific project's page (the scrolling gallery you see when you open a project). |

Every button labeled **Save Changes** in the header saves whichever tab is currently open.

**Where the data actually lives:** everything (posters, videos, projects, clients, categories, site text) is rows in a Supabase Postgres database, and every image/video file lives in a single Supabase Storage bucket called `portfolio_assets`. Deleting something in the admin panel deletes both the database row and the underlying file in storage.

**Confirmed working end-to-end** by reading through every create/edit/delete code path: uploads compress and land in storage, database rows get created/updated/deleted correctly, and the public pages (`index.html`, `category.html`, `project.html`) read live from the same tables, so anything you change in the CMS shows up on the live site immediately, no rebuild or redeploy needed. This is a vanilla static site with no build step, so "deploy" here just means Vercel serving whatever's on the branch that's live.

## 3. New files created

| File | What it is |
|---|---|
| `AUDIT.md` | The full audit checklist this session worked through |
| `HANDOVER.md` | This document |
| `robots.txt` | Blocks search engines from indexing `/admin.html`, points at the sitemap |
| `sitemap.xml` | Lists the static pages and known category URLs (see "Known issues" for its one caveat) |
| `privacy.html` | Privacy Policy draft |
| `terms.html` | Terms of Service draft |
| `copyright.html` | Copyright & Client Work Notice draft, with a takedown request process for clients |

## 4. Known issues / things not fixed, and why

- **`mg-motion.html` and `project-template.html` are orphaned pages.** Nothing on the live site links to either of them; they're leftovers from before the Supabase-driven `project.html` existed. I fixed their broken internal links rather than deleting the files, since deleting files needs your explicit go-ahead per the guardrails for this session. If you don't need them, they're safe to delete, `project-template.html` in particular is a scaffold with placeholder client names and lorem-ipsum-style copy, not a real page.
- **RLS (Row Level Security) policies on the Supabase tables and storage bucket could not be audited from this codebase**, there are no migration files checked into the repo, the schema only exists in the Supabase dashboard. The admin panel's security ultimately depends on those policies being configured correctly (so that only authenticated users can write, and the public can only read). Worth a five-minute check in the Supabase dashboard to confirm write access is actually locked down, since that's the real security boundary here, not the admin login screen itself.
- **`sitemap.xml` uses a placeholder domain** (`REPLACE-WITH-YOUR-DOMAIN.example`). The real production domain isn't recorded anywhere in this repository, so rather than guess, every URL in the file needs a find-and-replace with the actual domain before submitting it to Google Search Console or Bing Webmaster Tools.
- **Individual project pages (`project.html?id=<uuid>`) aren't in the sitemap.** Their IDs are only known inside the Supabase database, not at the time this file was written. Fully solving this would mean generating the sitemap dynamically (a small serverless function), which is a reasonable next step but is new infrastructure, not a fix to existing code, so it wasn't added without checking with you first.
- **The Content-Security-Policy still allows `'unsafe-inline'` for scripts and styles.** This is because the whole site's interactivity is written as inline `<script>` tags in each HTML file, by design, given the "no build tools" constraint. Removing `unsafe-inline` would mean moving all of that JavaScript into external files sitewide, a large, invasive change across every page including the 900+ line admin panel. Given the risk of introducing regressions for a modest security gain (the admin panel is already gated behind real authentication), I didn't attempt this without checking with you first. Worth considering as a dedicated future project if you want to tighten it further.
- **Browser console verification was done statically, not with a live browser.** This environment didn't have a headless browser tool available, so instead of screenshots I: syntax-checked every script (inline and external), confirmed every `getElementById` call in the code matches a real element ID on the page (the most common cause of "Cannot read properties of null" errors), checked every internal link resolves to a real file, and served the site locally to confirm every page returns HTTP 200. That covers structural correctness; it doesn't replace actually clicking through the live site with real Supabase data in a real browser once this is deployed to a preview URL.

## 5. Recommended next steps

1. **Have a Kenyan lawyer review `privacy.html`, `terms.html`, and `copyright.html`** before publishing, especially for alignment with the Kenya Data Protection Act, 2019, and whether Control Tee needs to register with the Office of the Data Protection Commissioner (ODPC). These are structurally complete drafts, not legal advice.
2. **Confirm Supabase RLS policies** are actually restricting writes to authenticated users only (see "Known issues" above).
3. **Replace the placeholder domain in `sitemap.xml`** once you know the production URL, then submit it to Search Console.
4. **Decide on `mg-motion.html` / `project-template.html`**: keep as reference/scaffolding, or delete them now that `project.html` handles this dynamically.
5. Open a pull request from this branch once you've reviewed the diff. The branch has been pushed but nothing has been merged to `main`.

## 6. Changelog (this session)

- `7c54237` Add full codebase audit (AUDIT.md)
- `32dc178` Fix broken links, missing error handling, dead code
- `beb96ae` Escape database content before innerHTML injection, noindex the admin panel
- `147b65e` Improve accessibility and mobile layout
- `2564265` Speed up font loading and cache static assets
- `f8c0d42` Add favicon, Open Graph/Twitter tags, robots.txt, and sitemap.xml
- `ac48849` Add legal pages and link them from every footer
