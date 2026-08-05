# website-portfolio

A standalone portfolio site living inside this repo, independent of the root
Control Tee site. Nothing here imports from — or is imported by — the files at
the repository root.

## Layout

```
website-portfolio/
├── index.html    single page: intro, work, about, contact
├── style.css     scoped tokens + layout
├── script.js     renders the work grid from a `projects` array
└── assets/       images, video, fonts
```

## Running locally

No build step. Serve the directory and open it:

```bash
python3 -m http.server 8000 --directory website-portfolio
# → http://localhost:8000
```

## Adding a project

Append an entry to the `projects` array in `script.js`:

```js
{ title: 'Name', meta: 'Discipline · Year', href: '#', thumb: 'assets/name.jpg' }
```

`thumb` is optional — cards without one render an empty placeholder tile.

## Deployment note

The root `vercel.json` applies headers to `/(.*)`, so this directory is served
at `/website-portfolio/` on the same deployment as the root site, under the same
Content-Security-Policy. Fonts are loaded from `fonts.googleapis.com`, which that
policy already permits. Any new external origin needs a corresponding CSP update
in `vercel.json`.
