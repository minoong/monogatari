-- 여행 단위 데이터 분리: 4개 테이블에 trip_id를 추가한다.
-- 기존 행은 모두 태국 여행으로 귀속된다. NOT NULL + DEFAULT로 추가하면
-- Postgres가 기존 행에 기본값을 채우므로 별도 backfill UPDATE가 필요 없다.
--
-- DEFAULT(태국 여행)는 trip_id를 모르는 이전 버전 클라이언트가 계속 동작하도록 두는
-- 호환용 임시 값이다. 앱이 모든 쓰기에서 trip_id를 보내게 된 뒤 후속 마이그레이션에서 제거한다.

alter table public.preparation_items
  add column if not exists trip_id uuid not null
    default '00000000-0000-4000-8000-000000000001'
    references public.trips (id) on delete restrict;

alter table public.wish_items
  add column if not exists trip_id uuid not null
    default '00000000-0000-4000-8000-000000000001'
    references public.trips (id) on delete restrict;

alter table public.schedule_items
  add column if not exists trip_id uuid not null
    default '00000000-0000-4000-8000-000000000001'
    references public.trips (id) on delete restrict;

alter table public.expenses
  add column if not exists trip_id uuid not null
    default '00000000-0000-4000-8000-000000000001'
    references public.trips (id) on delete restrict;

create index if not exists preparation_items_trip_id_idx on public.preparation_items (trip_id);
create index if not exists wish_items_trip_id_idx on public.wish_items (trip_id);
create index if not exists schedule_items_trip_date_idx on public.schedule_items (trip_id, schedule_date);
create index if not exists expenses_trip_purchased_at_idx on public.expenses (trip_id, purchased_at);

-- 일정 날짜가 태국 여행 기간(2026-08-29 ~ 2026-09-02)으로 고정돼 있던 제약을 제거한다.
-- 날짜 범위 검증은 여행별 설정(trips.start_date/end_date)을 기준으로 API에서 수행한다.
alter table public.schedule_items
  drop constraint if exists schedule_items_schedule_date_check;

-- 지출: 통화 컬럼 추가. 기존 행은 모두 THB.
-- 금액 컬럼(amount_thb 등)의 이름 변경은 앱 코드 전환과 같은 시점에 별도 마이그레이션으로 진행한다.
alter table public.expenses
  add column if not exists currency text not null default 'THB'
    check (currency ~ '^[A-Z]{3}$');

-- 일본 여행용 카테고리(온천)와 결제수단(교통 IC카드)을 허용한다.
alter table public.expenses drop constraint if exists expenses_category_check;
alter table public.expenses
  add constraint expenses_category_check
  check (category = any (array[
    'food', 'transport', 'shopping', 'stay', 'activity',
    'massage', 'convenience', 'onsen', 'other'
  ]));

alter table public.expenses drop constraint if exists expenses_payment_method_check;
alter table public.expenses
  add constraint expenses_payment_method_check
  check (payment_method = any (array['cash', 'card', 'qr', 'ic_card', 'other']));
