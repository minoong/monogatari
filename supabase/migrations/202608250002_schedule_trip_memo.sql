alter table public.schedule_items
  add column if not exists trip_memo text check (trip_memo is null or char_length(trip_memo) <= 500);
