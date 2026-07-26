update public.wish_items
set
  locations = case
    when vendor = any(locations) then locations
    else array_append(locations, vendor)
  end,
  vendor = null,
  updated_at = now()
where vendor ~ '^https?://(maps\.app\.goo\.gl|([^/]+\.)?google\.[^/]+/maps)';
