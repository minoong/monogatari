create table public.schedule_items (
  id uuid primary key default gen_random_uuid(),
  schedule_date date not null check (schedule_date between date '2026-08-29' and date '2026-09-01'),
  start_time time not null,
  title text not null check (char_length(btrim(title)) between 1 and 100),
  subtitle text check (subtitle is null or char_length(subtitle) <= 500),
  google_maps_url text check (
    google_maps_url is null or google_maps_url ~ '^https?://(maps\\.app\\.goo\\.gl|goo\\.gl|([^/]+\\.)?google\\.[^/]+/maps)'
  ),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index schedule_items_date_time_idx on public.schedule_items (schedule_date, start_time, created_at);

create table public.schedule_images (
  id uuid primary key default gen_random_uuid(),
  schedule_item_id uuid not null references public.schedule_items(id) on delete cascade,
  storage_path text not null unique check (storage_path ~ '^schedule/[0-9a-f-]+\\.(jpg|jpeg|png|webp)$'),
  sort_order smallint not null check (sort_order between 0 and 4),
  created_at timestamptz not null default now(),
  unique (schedule_item_id, sort_order)
);

create or replace function public.schedule_images_limit_five()
returns trigger language plpgsql set search_path = '' as $$
begin
  if (select count(*) from public.schedule_images where schedule_item_id = new.schedule_item_id) >= 5 then
    raise exception 'A schedule item can have at most five images';
  end if;
  return new;
end;
$$;

create trigger schedule_images_limit_five_trigger before insert on public.schedule_images
for each row execute function public.schedule_images_limit_five();

alter table public.schedule_items enable row level security;
alter table public.schedule_images enable row level security;
grant select, insert, update, delete on public.schedule_items, public.schedule_images to anon;

create policy "schedule items are readable by anonymous users" on public.schedule_items for select to anon using (true);
create policy "schedule items are insertable by anonymous users" on public.schedule_items for insert to anon with check (true);
create policy "schedule items are updatable by anonymous users" on public.schedule_items for update to anon using (true) with check (true);
create policy "schedule items are deletable by anonymous users" on public.schedule_items for delete to anon using (true);
create policy "schedule images are readable by anonymous users" on public.schedule_images for select to anon using (true);
create policy "schedule images are insertable by anonymous users" on public.schedule_images for insert to anon with check (true);
create policy "schedule images are updatable by anonymous users" on public.schedule_images for update to anon using (true) with check (true);
create policy "schedule images are deletable by anonymous users" on public.schedule_images for delete to anon using (true);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('schedule-images', 'schedule-images', true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update set public = true, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

create policy "schedule image files are insertable by anonymous users" on storage.objects for insert to anon
with check (bucket_id = 'schedule-images' and name ~ '^schedule/[0-9a-f-]+\\.(jpg|jpeg|png|webp)$');
create policy "schedule image files are deletable by anonymous users" on storage.objects for delete to anon
using (bucket_id = 'schedule-images' and name ~ '^schedule/[0-9a-f-]+\\.(jpg|jpeg|png|webp)$');

do $$ begin
  alter publication supabase_realtime add table public.schedule_items;
exception when duplicate_object then null;
end $$;

insert into public.schedule_items (schedule_date, start_time, title, subtitle) values
  ('2026-08-29', '07:00', '공항 집합! 미누쿤은 환전하기', null),
  ('2026-08-29', '09:45', '출발입니다❤️ 비행기에서 만나요', null),
  ('2026-08-29', '13:35', '태국 드디어 도착', null),
  ('2026-08-29', '14:25', '차량 픽업', '수완나폼 ➡ 방콕 리버 로카 호텔 · 약 50분 소요 예상'),
  ('2026-08-29', '15:30', '방콕 리버 로카 호텔 도착', null),
  ('2026-08-29', '15:30', '짐 놓기', '필요시 샤워, 환복 · 숙소 근처 구경 또는 즉시 이동'),
  ('2026-08-29', '17:00', '고수 맛집을 찾아서', '메타왈라이 썬댕으로 이동 · 볼트 약 25분 예상'),
  ('2026-08-29', '17:30', '메타왈라이 썬댕 입장!!!', '가현쨩의 추억 메뉴 맛보기'),
  ('2026-08-29', '18:30', '근처 카페로 이동', '떨어진 카페인 충전'),
  ('2026-08-29', '19:30', '아시아틱 이동', '구경하고 쇼핑하기 · 과일과 선크림 구매'),
  ('2026-08-30', '07:00', '호텔 로비에서 기사님 만나기!', '투어 시작'),
  ('2026-08-30', '08:30', '카오키여우 주 도착', null),
  ('2026-08-30', '10:00', '펭귄 퍼레이드 쇼', null),
  ('2026-08-30', '11:00', '코끼리 수영 쇼', null),
  ('2026-08-30', '11:30', '동물 먹이주기 쇼', null),
  ('2026-08-30', '13:00', '스노클링 타임 🤿', null),
  ('2026-08-30', '17:00', '투어 끝! 호텔로 이동', '원하면 더 빠른 복귀 가능'),
  ('2026-08-30', '18:00', '호텔 도착', '필요시 샤워 및 환복'),
  ('2026-08-30', '19:00', '저녁 냠', null),
  ('2026-08-30', '20:00', '마사지 받으며 휴식', null),
  ('2026-08-30', '21:00', '댄스파티 🕺', null),
  ('2026-08-31', '07:00', '아침 냠냠', '조식은 미포함'),
  ('2026-08-31', '13:00', '코시창 선착장 이동', null),
  ('2026-08-31', '14:00', '배타고 코시창으로', null),
  ('2026-08-31', '15:00', '호텔에 짐 놓고 섬 구경', null),
  ('2026-08-31', '17:00', '여유즐기기~', '해변 수영과 카페'),
  ('2026-09-01', '07:00', '조식 냠냠', null),
  ('2026-09-01', '12:00', '호텔 체크아웃', null),
  ('2026-09-01', '13:00', '육지로 이동', null),
  ('2026-09-01', '19:30', '공항 도착', null),
  ('2026-09-01', '21:40', '비행기 탑승', null);
