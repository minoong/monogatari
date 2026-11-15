-- 다중 여행 지원: 여행 단위를 나타내는 trips 테이블.
-- 여행별 상세 설정(항공, 숙소, 날씨 도시, 회화 등)은 코드(lib/trips)에 두고,
-- 이 테이블은 데이터 행이 소속될 여행의 기준점(외래키 대상)과 기본 메타데이터만 가진다.

create table if not exists public.trips (
  id uuid primary key,
  slug text not null unique check (slug ~ '^[a-z0-9-]+$'),
  name text not null check (char_length(btrim(name)) between 1 and 100),
  start_date date not null,
  end_date date not null,
  time_zone text not null,
  currency text not null check (currency ~ '^[A-Z]{3}$'),
  created_at timestamptz not null default now(),
  constraint trips_date_order check (end_date >= start_date)
);

alter table public.trips enable row level security;

drop policy if exists "trips are readable by anonymous users" on public.trips;
create policy "trips are readable by anonymous users"
  on public.trips for select to anon using (true);

-- ID는 코드(lib/trips)와 동일해야 하므로 고정 UUID를 사용한다.
insert into public.trips (id, slug, name, start_date, end_date, time_zone, currency)
values
  ('00000000-0000-4000-8000-000000000001', 'thailand-2026-08', '태국 방콕 여행', '2026-08-29', '2026-09-02', 'Asia/Bangkok', 'THB'),
  ('00000000-0000-4000-8000-000000000002', 'japan-yonago-2026-12', '일본 요나고·돗토리 여행', '2026-12-18', '2026-12-21', 'Asia/Tokyo', 'JPY')
on conflict (id) do nothing;
