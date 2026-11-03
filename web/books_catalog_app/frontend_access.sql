alter table public.books enable row level security;

revoke all on table public.books from anon, authenticated;
grant select on table public.books to anon, authenticated;

drop policy if exists "Public can read books" on public.books;
create policy "Public can read books"
on public.books
for select
to anon, authenticated
using (true);

