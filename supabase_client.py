from __future__ import annotations

import os
from collections.abc import Iterable

from dotenv import load_dotenv
from supabase import Client, create_client


load_dotenv()


def get_client() -> Client:
    url = os.getenv("SUPABASE_URL")
    key = os.getenv("SUPABASE_SECRET_KEY")
    if not url or not key:
        raise RuntimeError(
            "Missing SUPABASE_URL or SUPABASE_SECRET_KEY. "
            "Copy .env.example to .env and add your project values."
        )
    return create_client(url, key)


def chunks(rows: list[dict], size: int = 100) -> Iterable[list[dict]]:
    for start in range(0, len(rows), size):
        yield rows[start : start + size]


def upsert_books(client: Client, rows: list[dict], batch_size: int = 100) -> int:
    written = 0
    for batch in chunks(rows, batch_size):
        response = client.table("books").upsert(batch, on_conflict="book_id").execute()
        written += len(response.data or batch)
        print(f"Supabase: processed {min(written, len(rows))}/{len(rows)} rows")
    return written

