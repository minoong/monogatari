alter table public.wish_items
  add column categories text[] not null default '{}';

update public.wish_items
set categories = case
  when category is null or btrim(category) = '' then '{}'
  else array[btrim(category)]
end;

drop policy if exists "wish items are insertable by anonymous users" on public.wish_items;

alter table public.wish_items
  add constraint wish_items_categories_valid check (
    cardinality(categories) <= 3
    and array_position(categories, null) is null
    and char_length(array_to_string(categories, ', ')) <= 50
  );

alter table public.wish_items drop column category;

create policy "wish items are insertable by anonymous users"
  on public.wish_items for insert to anon
  with check (
    type in ('shopping', 'snack', 'restaurant')
    and char_length(btrim(title)) between 1 and 100
    and cardinality(categories) <= 3
    and array_position(categories, null) is null
    and char_length(array_to_string(categories, ', ')) <= 50
    and (memo is null or char_length(memo) <= 500)
    and (vendor is null or char_length(vendor) <= 100)
    and (map_query is null or char_length(map_query) <= 200)
    and (target_price_thb is null or target_price_thb >= 0)
    and (image_path is null or image_path ~ '^wishes/[0-9a-f-]+\.(jpg|jpeg|png|webp)$')
  );
