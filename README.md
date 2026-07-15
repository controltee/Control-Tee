# Control Tee

Portfolio website for Control Tee, a Nairobi-based creative studio working in motion design, brand identity, poster design, social and marketing campaigns, and video editing.

## Stack

Vanilla HTML, CSS, and JavaScript, no build step. Hosted on Vercel, backed by Supabase (Postgres + Storage + Auth).

## Structure

- `index.html`, `contact.html` — static pages
- `category.html`, `project.html` — dynamic pages driven by Supabase (`?id=` query param)
- `admin.html` — CMS for managing posters, videos, site text, categories, clients, and projects
- `db.js` — shared Supabase client
- `animations.js` — shared motion/interaction logic
- `style.css` — shared stylesheet

## Legal

`privacy.html`, `terms.html`, and `copyright.html` are draft legal pages. They have not been reviewed by a lawyer, see the notice at the top of each page.
