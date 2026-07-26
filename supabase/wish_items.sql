create extension if not exists pgcrypto;

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

create table if not exists public.wish_items (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('shopping', 'snack', 'restaurant')),
  title text not null check (char_length(title) between 1 and 100),
  categories text[] not null default '{}' check (public.wish_categories_valid(categories)),
  target_price_thb numeric check (target_price_thb is null or target_price_thb >= 0),
  memo text check (memo is null or char_length(memo) <= 500),
  vendor text check (vendor is null or char_length(vendor) <= 100),
  image_path text check (
    image_path is null or image_path ~ '^wishes/[0-9a-f-]+\.(jpg|jpeg|png|webp)$'
  ),
  locations text[] not null default '{}' check (public.wish_text_list_valid(locations, 200)),
  links text[] not null default '{}' check (public.wish_links_valid(links)),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.wish_items enable row level security;

drop policy if exists "wish items are readable by anonymous users" on public.wish_items;
create policy "wish items are readable by anonymous users"
  on public.wish_items for select to anon using (true);

drop policy if exists "wish items are insertable by anonymous users" on public.wish_items;
create policy "wish items are insertable by anonymous users"
  on public.wish_items for insert to anon
  with check (
    type in ('shopping', 'snack', 'restaurant')
    and char_length(btrim(title)) between 1 and 100
    and public.wish_categories_valid(categories)
    and (memo is null or char_length(memo) <= 500)
    and (vendor is null or char_length(vendor) <= 100)
    and public.wish_text_list_valid(locations, 200)
    and public.wish_links_valid(links)
    and (target_price_thb is null or target_price_thb >= 0)
    and (image_path is null or image_path ~ '^wishes/[0-9a-f-]+\.(jpg|jpeg|png|webp)$')
  );

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'wish-images',
  'wish-images',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update set
  public = true,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "wish images are insertable by anonymous users" on storage.objects;
create policy "wish images are insertable by anonymous users"
  on storage.objects for insert to anon
  with check (
    bucket_id = 'wish-images'
    and name ~ '^wishes/[0-9a-f-]+\.(jpg|jpeg|png|webp)$'
  );

insert into public.wish_items (type, title, categories, memo) values
  ('restaurant', '팟타이', array['태국 음식'], null),
  ('restaurant', '카오카무 (태국 족발)', array['태국 음식'], null),
  ('restaurant', '카오소이', array['북부 태국 음식'], null),
  ('restaurant', '쏨땀', array['태국 음식'], '태국 샐러드! 같이 용산에서 먹었지'),
  ('restaurant', '얌운센', array['태국 음식'], '따뜻한 샐러드 국수 같은 느낌인가??'),
  ('restaurant', '커무양 (태국식 항정살)', array['태국 음식'], null),
  ('restaurant', '팟카파오 무쌉', array['태국 음식'], null),
  ('restaurant', '태국식 커리 깽키여우완', array['태국 음식'], null),
  ('restaurant', '갈비국수 (꾸어이띠아우 느아 뚠)', array['국수'], null),
  ('restaurant', '끈적국수', array['국수'], '해장 되는 느낌. 달달 매콤 시큼'),
  ('restaurant', '까이양', array['태국 음식'], null),
  ('restaurant', '무삥 꼬치구이', array['길거리 음식'], null),
  ('restaurant', '카오똠', array['태국 음식'], '태국 국밥'),
  ('snack', '각종 과일', array['과일'], null),
  ('snack', '로띠', array['디저트'], null),
  ('snack', '고수', array['식재료'], null),
  ('snack', '망고쥬스', array['음료'], null),
  ('snack', '수박쥬스', array['음료'], null),
  ('snack', '모카옌', array['음료'], '카페모카~~');
