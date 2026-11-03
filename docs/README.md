# Leaf & Letter catalogue

A responsive catalogue for the 1,000 books stored in Supabase.

## Features

- live data from Supabase
- title search
- category and rating filters
- price, title and rating sorting
- pagination
- book detail dialog
- saved books stored in the browser
- responsive design

## Connect Supabase

1. Run `frontend_access.sql` in the Supabase SQL Editor. This grants public read-only access to `books`; browser visitors cannot insert, update or delete rows.
2. In Supabase, open **Settings → API Keys** and copy the **Publishable key** (`sb_publishable_...`).
3. Open `config.js` and replace `PASTE_YOUR_SB_PUBLISHABLE_KEY_HERE` with the complete Publishable key.
4. Never put the Secret key in this folder.

## Preview locally

From this folder run:

```powershell
..\.venv\Scripts\python.exe -m http.server 5500
```

If this folder is copied inside the existing project root as `web`, run instead:

```powershell
.\.venv\Scripts\python.exe -m http.server 5500 --directory web
```

Open `http://localhost:5500` in Chrome.

## Publish

The folder can be deployed as a static site. For GitHub Pages, move the files to a `/docs` folder or configure a deployment workflow.
