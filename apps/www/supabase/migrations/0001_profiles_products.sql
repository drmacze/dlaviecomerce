create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique,
  display_name text,
  avatar_url text,
  role text not null default 'customer',
  is_vip boolean not null default false,
  l_points integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  description text,
  price integer not null default 0,
  category text not null default 'digital',
  image_url text,
  file_path text,
  is_published boolean not null default false,
  created_at timestamptz not null default now()
);
