from __future__ import annotations

import argparse

from scraper import BookScraper, write_csv
from supabase_client import get_client, upsert_books


def main() -> None:
    parser = argparse.ArgumentParser(description="Scrape Books to Scrape and sync to Supabase")
    parser.add_argument("--limit", type=int, default=None, help="Maximum number of books")
    parser.add_argument("--csv", default="books.csv", help="Local backup CSV")
    parser.add_argument("--delay", type=float, default=0.15, help="Delay between requests")
    args = parser.parse_args()

    books = BookScraper(delay=args.delay).scrape(limit=args.limit)
    write_csv(books, args.csv)
    written = upsert_books(get_client(), books)
    print(f"DONE: scraped {len(books)} books and processed {written} Supabase rows")


if __name__ == "__main__":
    main()

