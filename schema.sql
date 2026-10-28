create table if not exists public.books (
  book_id text primary key,
  title text not null,
  category text not null,
  price_gbp numeric(10, 2) not null check (price_gbp >= 0),
  price_excl_tax_gbp numeric(10, 2),
  price_incl_tax_gbp numeric(10, 2),
  tax_gbp numeric(10, 2),
  availability text,
  stock_quantity integer check (stock_quantity is null or stock_quantity >= 0),
  rating smallint check (rating between 1 and 5),
  review_count integer check (review_count is null or review_count >= 0),
  description text,
  product_url text not null unique,
  image_url text,
  scraped_at timestamptz not null default now()
);

alter table public.books enable row level security;

grant select, insert, update, delete on public.books to service_role;

-- This project writes from a trusted Python script using a Supabase secret key.
-- No public RLS policy is intentionally created.

create index if not exists books_category_idx on public.books (category);
create index if not exists books_price_idx on public.books (price_gbp);
create index if not exists books_rating_idx on public.books (rating);

