create table public.expenses (
  id uuid primary key default gen_random_uuid(),
  purchased_at timestamptz not null,
  item_name text not null check (char_length(btrim(item_name)) between 1 and 100),
  category text not null check (category in ('food', 'transport', 'shopping', 'stay', 'activity', 'massage', 'convenience', 'other')),
  merchant text check (merchant is null or char_length(merchant) <= 100),
  payment_method text not null check (payment_method in ('cash', 'card', 'qr', 'other')),
  amount_thb numeric(12, 2) not null check (amount_thb > 0),
  exchange_rate_krw_per_thb numeric(12, 6) not null check (exchange_rate_krw_per_thb > 0),
  exchange_rate_date date not null,
  exchange_rate_source text not null check (exchange_rate_source in ('frankfurter', 'manual_override')),
  amount_krw integer not null check (amount_krw > 0),
  actual_amount_krw integer check (actual_amount_krw is null or actual_amount_krw > 0),
  payer text not null check (payer in ('gahyun', 'minu')),
  share_gahyun_thb numeric(12, 2) not null default 0 check (share_gahyun_thb >= 0),
  share_minu_thb numeric(12, 2) not null default 0 check (share_minu_thb >= 0),
  share_gahyun_krw integer not null default 0 check (share_gahyun_krw >= 0),
  share_minu_krw integer not null default 0 check (share_minu_krw >= 0),
  memo text check (memo is null or char_length(memo) <= 500),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint expenses_thb_shares_match check (share_gahyun_thb + share_minu_thb = amount_thb),
  constraint expenses_krw_shares_match check (share_gahyun_krw + share_minu_krw = coalesce(actual_amount_krw, amount_krw)),
  constraint expenses_has_participant check (share_gahyun_thb > 0 or share_minu_thb > 0)
);

create index expenses_purchased_at_idx on public.expenses (purchased_at desc);
create index expenses_category_purchased_at_idx on public.expenses (category, purchased_at desc);
create index expenses_payer_purchased_at_idx on public.expenses (payer, purchased_at desc);

create table public.expense_images (
  id uuid primary key default gen_random_uuid(),
  expense_id uuid not null references public.expenses(id) on delete cascade,
  storage_path text not null unique check (storage_path ~ '^expenses/[0-9a-f-]+\.(jpg|jpeg|png|webp)$'),
  sort_order smallint not null check (sort_order between 0 and 4),
  created_at timestamptz not null default now(),
  unique (expense_id, sort_order)
);

create index expense_images_expense_id_idx on public.expense_images (expense_id, sort_order);

create or replace function public.expense_images_limit_five()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if (select count(*) from public.expense_images where expense_id = new.expense_id) >= 5 then
    raise exception 'An expense can have at most five images';
  end if;
  return new;
end;
$$;

create trigger expense_images_limit_five_trigger
before insert on public.expense_images
for each row execute function public.expense_images_limit_five();

alter table public.expenses enable row level security;
alter table public.expense_images enable row level security;

grant select, insert, update, delete on public.expenses, public.expense_images to anon;

create policy "expenses are readable by anonymous users"
  on public.expenses for select to anon using (true);
create policy "expenses are insertable by anonymous users"
  on public.expenses for insert to anon with check (true);
create policy "expenses are updatable by anonymous users"
  on public.expenses for update to anon using (true) with check (true);
create policy "expenses are deletable by anonymous users"
  on public.expenses for delete to anon using (true);

create policy "expense images are readable by anonymous users"
  on public.expense_images for select to anon using (true);
create policy "expense images are insertable by anonymous users"
  on public.expense_images for insert to anon with check (true);
create policy "expense images are updatable by anonymous users"
  on public.expense_images for update to anon using (true) with check (true);
create policy "expense images are deletable by anonymous users"
  on public.expense_images for delete to anon using (true);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'expense-images',
  'expense-images',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "expense image files are insertable by anonymous users"
  on storage.objects for insert to anon
  with check (
    bucket_id = 'expense-images'
    and name ~ '^expenses/[0-9a-f-]+\.(jpg|jpeg|png|webp)$'
  );

create policy "expense image files are deletable by anonymous users"
  on storage.objects for delete to anon
  using (
    bucket_id = 'expense-images'
    and name ~ '^expenses/[0-9a-f-]+\.(jpg|jpeg|png|webp)$'
  );

do $$
begin
  alter publication supabase_realtime add table public.expenses;
exception when duplicate_object then null;
end
$$;
