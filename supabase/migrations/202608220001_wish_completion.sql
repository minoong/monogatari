ALTER TABLE public.wish_items
  ADD COLUMN IF NOT EXISTS is_completed boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS completed_at timestamptz;

CREATE INDEX IF NOT EXISTS wish_items_type_completed_idx
  ON public.wish_items (type, is_completed);
