create or replace function public.wish_google_maps_links_valid(value text[])
returns boolean
language sql
immutable
set search_path = ''
as $$
  select
    public.wish_text_list_valid(value, 2048)
    and not exists (
      select 1
      from unnest(value) as location
      where location !~ '^https?://(maps\.app\.goo\.gl|([^/]+\.)?google\.[^/]+/maps)'
    );
$$;

alter table public.wish_items
  drop constraint if exists wish_items_locations_valid,
  add constraint wish_items_locations_valid
    check (public.wish_google_maps_links_valid(locations));

drop policy if exists "wish items are insertable by anonymous users" on public.wish_items;

create policy "wish items are insertable by anonymous users"
  on public.wish_items for insert to anon
  with check (
    type in ('shopping', 'snack', 'restaurant')
    and char_length(btrim(title)) between 1 and 100
    and public.wish_categories_valid(categories)
    and public.wish_google_maps_links_valid(locations)
    and public.wish_links_valid(links)
    and (memo is null or char_length(memo) <= 500)
    and (vendor is null or char_length(vendor) <= 100)
    and (target_price_thb is null or target_price_thb >= 0)
    and (image_path is null or image_path ~ '^wishes/[0-9a-f-]+\.(jpg|jpeg|png|webp)$')
  );
