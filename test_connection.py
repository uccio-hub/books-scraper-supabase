from __future__ import annotations

from datetime import datetime, timezone

from supabase_client import get_client


TEST_ID = "__connection_test__"


def main() -> None:
    client = get_client()
    inserted_ok = False
    test_row = {
        "book_id": TEST_ID,
        "title": "Supabase connection test",
        "category": "Test",
        "price_gbp": 0,
        "availability": "Test row",
        "stock_quantity": 0,
        "rating": 5,
        "review_count": 0,
        "product_url": "https://example.com/supabase-connection-test",
        "scraped_at": datetime.now(timezone.utc).isoformat(),
    }

    try:
        inserted = client.table("books").upsert(test_row, on_conflict="book_id").execute()
        inserted_ok = True
        print("WRITE OK:", inserted.data)

        selected = client.table("books").select("book_id,title").eq("book_id", TEST_ID).single().execute()
        if not selected.data or selected.data.get("book_id") != TEST_ID:
            raise RuntimeError("The test row could not be read back")
        print("READ OK:", selected.data)
        print("CONNECTION TEST PASSED")
    finally:
        if inserted_ok:
            client.table("books").delete().eq("book_id", TEST_ID).execute()
            print("Test row removed")


if __name__ == "__main__":
    main()

