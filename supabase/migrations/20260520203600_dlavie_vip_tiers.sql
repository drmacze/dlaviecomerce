create table if not exists public.vip_tiers (
  id text primary key,
  name text not null,
  price integer,
  d_point_multiplier numeric(5,2) not null default 1,
  cashback_percent numeric(5,2) not null default 0,
  affiliate_multiplier numeric(5,2) not null default 1,
  perks jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

insert into public.vip_tiers(id, name, price, d_point_multiplier, cashback_percent, affiliate_multiplier, perks) values
('silver','Silver',29000,1.20,2.5,1.10,'["Starter aura","Daily bonus","Basic drops"]'::jsonb),
('gold','Gold',59000,1.50,5.0,1.50,'["Gold aura","Cashback+","Affiliate boost"]'::jsonb),
('platinum','Platinum',129000,2.00,7.5,2.00,'["Secret products","Priority AI","Mystery vault"]'::jsonb),
('black','Black',null,3.00,10.0,3.00,'["Elite lounge","Private drops","Founder badge"]'::jsonb)
on conflict (id) do update set
  name = excluded.name,
  price = excluded.price,
  d_point_multiplier = excluded.d_point_multiplier,
  cashback_percent = excluded.cashback_percent,
  affiliate_multiplier = excluded.affiliate_multiplier,
  perks = excluded.perks;

alter table public.vip_tiers enable row level security;
