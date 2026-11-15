alter table public.wish_items
  add constraint wish_items_category_length check (category is null or char_length(category) <= 50),
  add constraint wish_items_memo_length check (memo is null or char_length(memo) <= 500),
  add constraint wish_items_vendor_length check (vendor is null or char_length(vendor) <= 100),
  add constraint wish_items_map_query_length check (map_query is null or char_length(map_query) <= 200),
  add constraint wish_items_image_path_format check (
    image_path is null or image_path ~ '^wishes/[0-9a-f-]+\.(jpg|jpeg|png|webp)$'
  );

drop policy if exists "wish items are insertable by anonymous users" on public.wish_items;
create policy "wish items are insertable by anonymous users"
  on public.wish_items for insert to anon
  with check (
    type in ('shopping', 'snack', 'restaurant')
    and char_length(btrim(title)) between 1 and 100
    and (category is null or char_length(category) <= 50)
    and (memo is null or char_length(memo) <= 500)
    and (vendor is null or char_length(vendor) <= 100)
    and (map_query is null or char_length(map_query) <= 200)
    and (target_price_thb is null or target_price_thb >= 0)
    and (image_path is null or image_path ~ '^wishes/[0-9a-f-]+\.(jpg|jpeg|png|webp)$')
  );

update storage.buckets
set public = true,
    file_size_limit = 5242880,
    allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp']
where id = 'wish-images';

drop policy if exists "wish images are readable by anonymous users" on storage.objects;
drop policy if exists "wish images are insertable by anonymous users" on storage.objects;
create policy "wish images are insertable by anonymous users"
  on storage.objects for insert to anon
  with check (
    bucket_id = 'wish-images'
    and name ~ '^wishes/[0-9a-f-]+\.(jpg|jpeg|png|webp)$'
  );
