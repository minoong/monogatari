-- 통화 중립 컬럼명으로 변경한다. 금액은 여행의 현지 통화(expenses.currency, trips.currency) 기준이다.
-- 컬럼 이름 변경은 check 제약, 정책, 인덱스의 컬럼 참조를 자동으로 따라간다.
--
-- 주의: 이 마이그레이션은 앱 코드의 필드명 변경(amount_thb -> amount_local 등)과 한 쌍이다.
-- 이전 버전 앱은 이 마이그레이션 이후 지출/위시 조회·저장이 실패하므로, 새 코드 배포 직전에 적용한다.

alter table public.expenses rename column amount_thb to amount_local;
alter table public.expenses rename column exchange_rate_krw_per_thb to exchange_rate_krw_per_unit;
alter table public.expenses rename column share_gahyun_thb to share_gahyun_local;
alter table public.expenses rename column share_minu_thb to share_minu_local;

alter table public.wish_items rename column target_price_thb to target_price_local;

-- 제약조건 이름도 새 컬럼명에 맞춘다.
alter table public.expenses rename constraint expenses_amount_thb_check to expenses_amount_local_check;
alter table public.expenses rename constraint expenses_exchange_rate_krw_per_thb_check to expenses_exchange_rate_krw_per_unit_check;
alter table public.expenses rename constraint expenses_share_gahyun_thb_check to expenses_share_gahyun_local_check;
alter table public.expenses rename constraint expenses_share_minu_thb_check to expenses_share_minu_local_check;
alter table public.expenses rename constraint expenses_thb_shares_match to expenses_local_shares_match;
alter table public.wish_items rename constraint wish_items_target_price_thb_check to wish_items_target_price_local_check;
