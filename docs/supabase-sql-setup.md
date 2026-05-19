# LUMINA Supabase Setup

Buat tabel berikut di Supabase SQL Editor:

- products
- orders
- order_items

Minimal column products:
- id uuid primary key
- name text
- slug text unique
- description text
- price integer
- category text
- image_url text
- file_path text
- is_published boolean
- created_at timestamptz

Minimal column orders:
- id uuid primary key
- buyer_email text
- total_amount integer
- status text
- created_at timestamptz

Minimal column order_items:
- id uuid primary key
- order_id uuid
- product_id uuid
- qty integer
- price integer
- created_at timestamptz

Enable RLS untuk semua table. Products boleh public read hanya jika is_published = true.
