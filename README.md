# Books to Scrape → Supabase

Python project that extracts book data from `books.toscrape.com`, saves a CSV backup, tests a Supabase write/read cycle, and upserts the complete dataset into PostgreSQL through Supabase.

## What Supabase does

Supabase is the hosted database layer. The scraper collects and cleans the data; Supabase stores it in a queryable PostgreSQL table so it can later power dashboards, filters, charts, APIs, or an application.

## Data collected

- UPC (`book_id`, primary key)
- title and category
- current price, pre-tax price, post-tax price and tax
- availability and stock quantity
- rating and review count
- description
- product and cover-image URLs
- scrape timestamp

## 1. Prepare Python

```bash
python -m venv .venv
```

Windows PowerShell:

```powershell
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

macOS/Linux:

```bash
source .venv/bin/activate
pip install -r requirements.txt
```

## 2. Build and test the scraper first

Test the HTML parsing logic:

```bash
python -m unittest discover -s tests
```

Run a small flow of 10 books:

```bash
python scraper.py --limit 10
```

Open `books.csv`. If it contains 10 data rows, the scraping flow works. To collect all 1,000 books:

```bash
python scraper.py
```

## 3. Create Supabase and the table

1. Create a project at `https://supabase.com/dashboard`.
2. Open **SQL Editor** → **New query**.
3. Paste all of `schema.sql` and click **Run**.
4. Open **Project Settings** → **API** (or the project's **Connect** panel).
5. Copy `.env.example` to a new file named `.env`.
6. Put the Project URL and **secret key** (`sb_secret_...`) in `.env`.

Never commit `.env` or expose the secret key in a website, browser extension, or public GitHub repository. It bypasses Row Level Security and is only for this trusted local/backend script.

## 4. Write one row and read it back

```bash
python test_connection.py
```

Expected output includes `WRITE OK`, `READ OK`, and `CONNECTION TEST PASSED`. The temporary row is removed afterwards.

## 5. Merge Supabase with the scraper

First test with 10 books:

```bash
python pipeline.py --limit 10
```

Then run the complete import:

```bash
python pipeline.py
```

The pipeline uses `upsert` with the UPC as primary key. Running it again updates existing books rather than creating duplicates.

## Recommended order

1. `python scraper.py --limit 10`
2. Inspect `books.csv`
3. Run `schema.sql` in Supabase
4. Configure `.env`
5. `python test_connection.py`
6. `python pipeline.py --limit 10`
7. Inspect the `books` table in Supabase
8. `python pipeline.py` for all books

