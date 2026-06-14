alter table public.ingredients
  add column if not exists unit_scale_unit text
  check (unit_scale_unit in ('unidade', 'g'));
