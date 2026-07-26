drop policy if exists "wish items are updatable by anonymous users" on public.wish_items;
create policy "wish items are updatable by anonymous users"
  on public.wish_items for update to anon
  using (true)
  with check (
    type in ('shopping', 'snack', 'restaurant')
    and char_length(btrim(title)) between 1 and 100
    and public.wish_categories_valid(categories)
    and (memo is null or char_length(memo) <= 500)
    and (vendor is null or char_length(vendor) <= 100)
    and public.wish_google_maps_links_valid(locations)
    and public.wish_links_valid(links)
    and (target_price_thb is null or target_price_thb >= 0)
    and (image_path is null or image_path ~ '^wishes/[0-9a-f-]+\.(jpg|jpeg|png|webp)$')
  );

drop policy if exists "wish items are deletable by anonymous users" on public.wish_items;
create policy "wish items are deletable by anonymous users"
  on public.wish_items for delete to anon
  using (true);

drop policy if exists "wish images are deletable by anonymous users" on storage.objects;
create policy "wish images are deletable by anonymous users"
  on storage.objects for delete to anon
  using (
    bucket_id = 'wish-images'
    and name ~ '^wishes/[0-9a-f-]+\.(jpg|jpeg|png|webp)$'
  );
