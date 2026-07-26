create or replace function public.wish_text_list_valid(value text[], max_length integer)
returns boolean
language sql
immutable
set search_path = ''
as $$
  select
    array_position(value, null) is null
    and cardinality(value) = (
      select count(distinct item)
      from unnest(value) as item
    )
    and not exists (
      select 1
      from unnest(value) as item
      where btrim(item) = '' or char_length(item) > max_length
    );
$$;

create or replace function public.wish_links_valid(value text[])
returns boolean
language sql
immutable
set search_path = ''
as $$
  select
    public.wish_text_list_valid(value, 500)
    and not exists (
      select 1
      from unnest(value) as link
      where link !~ '^https?://'
    );
$$;

alter table public.wish_items
  add column if not exists locations text[] not null default '{}',
  add column if not exists links text[] not null default '{}';

update public.wish_items
set locations = array[map_query]
where map_query is not null
  and btrim(map_query) <> ''
  and cardinality(locations) = 0;

drop policy if exists "wish items are insertable by anonymous users" on public.wish_items;

alter table public.wish_items
  drop column if exists map_query,
  add constraint wish_items_locations_valid
    check (public.wish_text_list_valid(locations, 200)),
  add constraint wish_items_links_valid
    check (public.wish_links_valid(links));

create policy "wish items are insertable by anonymous users"
  on public.wish_items for insert to anon
  with check (
    type in ('shopping', 'snack', 'restaurant')
    and char_length(btrim(title)) between 1 and 100
    and public.wish_categories_valid(categories)
    and public.wish_text_list_valid(locations, 200)
    and public.wish_links_valid(links)
    and (memo is null or char_length(memo) <= 500)
    and (vendor is null or char_length(vendor) <= 100)
    and (target_price_thb is null or target_price_thb >= 0)
    and (image_path is null or image_path ~ '^wishes/[0-9a-f-]+\.(jpg|jpeg|png|webp)$')
  );
