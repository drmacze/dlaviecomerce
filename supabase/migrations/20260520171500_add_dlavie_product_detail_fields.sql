alter table public.products
add column if not exists release_date date,
add column if not exists stock integer not null default 99,
add column if not exists badge text not null default 'DLAVIE',
add column if not exists mood_color text not null default '#2467c9';

update public.products
set
  stock = coalesce(stock, 99),
  badge = coalesce(nullif(badge, ''), 'DLAVIE'),
  mood_color = coalesce(nullif(mood_color, ''), '#2467c9');
