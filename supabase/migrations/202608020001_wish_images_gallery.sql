-- Keep wish_items.image_path during the rollout so this migration is reversible.
create table if not exists public.wish_images (
  id uuid primary key default gen_random_uuid(),
  wish_id uuid not null references public.wish_items(id) on delete cascade,
  storage_path text not null unique check (storage_path ~ '^wishes/[0-9a-f-]+\.(jpg|jpeg|png|webp)$'),
  sort_order smallint not null check (sort_order between 0 and 4),
  created_at timestamptz not null default now(),
  unique (wish_id, sort_order)
);

create or replace function public.wish_images_limit_five()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if (select count(*) from public.wish_images where wish_id = new.wish_id) >= 5 then
    raise exception 'A wish can have at most five images';
  end if;
  return new;
end;
$$;

drop trigger if exists wish_images_limit_five_trigger on public.wish_images;
create trigger wish_images_limit_five_trigger
before insert on public.wish_images
for each row execute function public.wish_images_limit_five();

insert into public.wish_images (wish_id, storage_path, sort_order)
select id, image_path, 0
from public.wish_items
where image_path is not null
on conflict (storage_path) do nothing;

alter table public.wish_images enable row level security;
grant select, insert, update, delete on table public.wish_images to anon;
drop policy if exists "wish images are readable by anonymous users" on public.wish_images;
create policy "wish images are readable by anonymous users" on public.wish_images for select to anon using (true);
drop policy if exists "wish images are insertable by anonymous users" on public.wish_images;
create policy "wish images are insertable by anonymous users" on public.wish_images for insert to anon with check (true);
drop policy if exists "wish images are updatable by anonymous users" on public.wish_images;
create policy "wish images are updatable by anonymous users" on public.wish_images for update to anon using (true) with check (true);
drop policy if exists "wish images are deletable by anonymous users" on public.wish_images;
create policy "wish images are deletable by anonymous users" on public.wish_images for delete to anon using (true);
