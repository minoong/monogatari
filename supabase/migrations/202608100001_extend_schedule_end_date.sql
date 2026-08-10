alter table public.schedule_items
  drop constraint if exists schedule_items_schedule_date_check;

alter table public.schedule_items
  add constraint schedule_items_schedule_date_check
  check (schedule_date between date '2026-08-29' and date '2026-09-02');
