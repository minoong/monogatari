alter table public.schedule_images
  add column if not exists kind text not null default 'cover';

alter table public.schedule_images
  drop constraint if exists schedule_images_kind_check;

alter table public.schedule_images
  add constraint schedule_images_kind_check check (kind = any (array['cover'::text, 'trip'::text]));

alter table public.schedule_images
  drop constraint if exists schedule_images_schedule_item_id_sort_order_key;

alter table public.schedule_images
  drop constraint if exists schedule_images_item_kind_sort_unique;

alter table public.schedule_images
  add constraint schedule_images_item_kind_sort_unique unique (schedule_item_id, kind, sort_order);

create or replace function public.schedule_images_limit_five()
returns trigger language plpgsql set search_path = '' as $$
begin
  if (
    select count(*) from public.schedule_images
    where schedule_item_id = new.schedule_item_id and kind = new.kind
  ) >= 5 then
    raise exception 'A schedule item can have at most five images of each kind';
  end if;
  return new;
end;
$$;
