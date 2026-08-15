alter table public.expenses
  add column custom_category text
  check (
    custom_category is null
    or char_length(btrim(custom_category)) between 1 and 30
  );

alter table public.expenses
  add constraint expenses_custom_category_requires_other
  check (custom_category is null or category = 'other');
