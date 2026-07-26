alter table public.wish_items
  drop constraint if exists wish_items_type_check,
  add constraint wish_items_type_check
    check (type in ('shopping', 'restaurant', 'menu', 'snack'));

drop policy if exists "wish items are insertable by anonymous users" on public.wish_items;
create policy "wish items are insertable by anonymous users"
  on public.wish_items for insert to anon
  with check (
    type in ('shopping', 'restaurant', 'menu', 'snack')
    and char_length(btrim(title)) between 1 and 100
    and public.wish_categories_valid(categories)
    and public.wish_google_maps_links_valid(locations)
    and public.wish_links_valid(links)
    and (memo is null or char_length(memo) <= 500)
    and (vendor is null or char_length(vendor) <= 100)
    and (target_price_thb is null or target_price_thb >= 0)
    and (image_path is null or image_path ~ '^wishes/[0-9a-f-]+\.(jpg|jpeg|png|webp)$')
  );

drop policy if exists "wish items are updatable by anonymous users" on public.wish_items;
create policy "wish items are updatable by anonymous users"
  on public.wish_items for update to anon
  using (true)
  with check (
    type in ('shopping', 'restaurant', 'menu', 'snack')
    and char_length(btrim(title)) between 1 and 100
    and public.wish_categories_valid(categories)
    and (memo is null or char_length(memo) <= 500)
    and (vendor is null or char_length(vendor) <= 100)
    and public.wish_google_maps_links_valid(locations)
    and public.wish_links_valid(links)
    and (target_price_thb is null or target_price_thb >= 0)
    and (image_path is null or image_path ~ '^wishes/[0-9a-f-]+\.(jpg|jpeg|png|webp)$')
  );
