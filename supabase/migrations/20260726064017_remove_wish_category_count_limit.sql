create or replace function public.wish_categories_valid(value text[])
returns boolean
language sql
immutable
set search_path = ''
as $$
  select
    array_position(value, null) is null
    and not exists (
      select 1
      from unnest(value) as category
      where btrim(category) = '' or char_length(category) > 14
    );
$$;

drop policy if exists "wish items are insertable by anonymous users" on public.wish_items;

alter table public.wish_items
  drop constraint if exists wish_items_categories_valid;

alter table public.wish_items
  add constraint wish_items_categories_valid
  check (public.wish_categories_valid(categories));

create policy "wish items are insertable by anonymous users"
  on public.wish_items for insert to anon
  with check (
    type in ('shopping', 'snack', 'restaurant')
    and char_length(btrim(title)) between 1 and 100
    and public.wish_categories_valid(categories)
    and (memo is null or char_length(memo) <= 500)
    and (vendor is null or char_length(vendor) <= 100)
    and (map_query is null or char_length(map_query) <= 200)
    and (target_price_thb is null or target_price_thb >= 0)
    and (image_path is null or image_path ~ '^wishes/[0-9a-f-]+\.(jpg|jpeg|png|webp)$')
  );
