CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TYPE product_status AS ENUM ('draft', 'active', 'archived');
CREATE TYPE cart_status AS ENUM ('active', 'converted', 'abandoned');
CREATE TYPE order_status AS ENUM (
  'pending_payment',
  'paid',
  'processing',
  'shipped',
  'completed',
  'cancelled',
  'refunded'
);
CREATE TYPE payment_status AS ENUM (
  'pending',
  'authorized',
  'paid',
  'failed',
  'expired',
  'cancelled',
  'refunded',
  'partially_refunded',
  'requires_review'
);
CREATE TYPE inventory_movement_type AS ENUM (
  'restock',
  'reserve',
  'release',
  'sale',
  'return',
  'adjustment'
);

CREATE TABLE customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_subject text,
  email text NOT NULL,
  full_name text NOT NULL,
  phone text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX customers_auth_subject_unique ON customers (auth_subject);
CREATE UNIQUE INDEX customers_email_unique ON customers (email);

CREATE TABLE categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL,
  description text,
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT categories_sort_order_non_negative CHECK (sort_order >= 0)
);
CREATE UNIQUE INDEX categories_slug_unique ON categories (slug);
CREATE INDEX categories_active_sort_idx ON categories (is_active, sort_order);

CREATE TABLE products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid REFERENCES categories (id) ON DELETE SET NULL,
  name text NOT NULL,
  slug text NOT NULL,
  description text NOT NULL,
  status product_status NOT NULL DEFAULT 'draft',
  requires_shipping boolean NOT NULL DEFAULT false,
  seo_title text,
  seo_description text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX products_slug_unique ON products (slug);
CREATE INDEX products_catalog_idx ON products (status, category_id, created_at);

CREATE TABLE product_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products (id) ON DELETE CASCADE,
  url text NOT NULL,
  alt_text text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  is_primary boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT product_images_sort_order_non_negative CHECK (sort_order >= 0)
);
CREATE UNIQUE INDEX product_images_product_url_unique ON product_images (product_id, url);
CREATE UNIQUE INDEX product_images_one_primary_per_product
  ON product_images (product_id)
  WHERE is_primary = true;
CREATE INDEX product_images_product_sort_idx ON product_images (product_id, sort_order);

CREATE TABLE product_variants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products (id) ON DELETE CASCADE,
  sku text NOT NULL,
  name text NOT NULL,
  price_amount integer NOT NULL,
  compare_at_amount integer,
  cost_amount integer,
  currency varchar(3) NOT NULL DEFAULT 'IDR',
  weight_grams integer NOT NULL DEFAULT 0,
  attributes jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT product_variants_price_non_negative CHECK (price_amount >= 0),
  CONSTRAINT product_variants_compare_at_valid CHECK (
    compare_at_amount IS NULL OR compare_at_amount >= price_amount
  ),
  CONSTRAINT product_variants_cost_non_negative CHECK (
    cost_amount IS NULL OR cost_amount >= 0
  ),
  CONSTRAINT product_variants_weight_non_negative CHECK (weight_grams >= 0),
  CONSTRAINT product_variants_currency_uppercase CHECK (currency = upper(currency))
);
CREATE UNIQUE INDEX product_variants_sku_unique ON product_variants (sku);
CREATE INDEX product_variants_product_active_idx ON product_variants (product_id, is_active);

CREATE TABLE inventory (
  variant_id uuid PRIMARY KEY REFERENCES product_variants (id) ON DELETE CASCADE,
  on_hand integer NOT NULL DEFAULT 0,
  reserved integer NOT NULL DEFAULT 0,
  reorder_level integer NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT inventory_on_hand_non_negative CHECK (on_hand >= 0),
  CONSTRAINT inventory_reserved_non_negative CHECK (reserved >= 0),
  CONSTRAINT inventory_reserved_not_above_on_hand CHECK (reserved <= on_hand),
  CONSTRAINT inventory_reorder_non_negative CHECK (reorder_level >= 0)
);

CREATE TABLE shipping_methods (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL,
  name text NOT NULL,
  flat_rate_amount integer NOT NULL,
  free_above_amount integer,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT shipping_methods_flat_rate_non_negative CHECK (flat_rate_amount >= 0),
  CONSTRAINT shipping_methods_free_above_non_negative CHECK (
    free_above_amount IS NULL OR free_above_amount >= 0
  )
);
CREATE UNIQUE INDEX shipping_methods_code_unique ON shipping_methods (code);
CREATE INDEX shipping_methods_active_idx ON shipping_methods (is_active);

CREATE TABLE carts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid REFERENCES customers (id) ON DELETE SET NULL,
  session_token_hash text NOT NULL,
  status cart_status NOT NULL DEFAULT 'active',
  expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX carts_session_token_hash_unique ON carts (session_token_hash);
CREATE INDEX carts_customer_status_idx ON carts (customer_id, status);
CREATE INDEX carts_expiry_idx ON carts (status, expires_at);

CREATE TABLE cart_items (
  cart_id uuid NOT NULL REFERENCES carts (id) ON DELETE CASCADE,
  variant_id uuid NOT NULL REFERENCES product_variants (id) ON DELETE RESTRICT,
  quantity integer NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT cart_items_pk PRIMARY KEY (cart_id, variant_id),
  CONSTRAINT cart_items_quantity_valid CHECK (quantity BETWEEN 1 AND 99)
);
CREATE INDEX cart_items_variant_idx ON cart_items (variant_id);

CREATE TABLE orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number text NOT NULL,
  access_token_hash text NOT NULL,
  checkout_idempotency_key text NOT NULL,
  cart_id uuid REFERENCES carts (id) ON DELETE SET NULL,
  customer_id uuid REFERENCES customers (id) ON DELETE SET NULL,
  shipping_method_id uuid REFERENCES shipping_methods (id) ON DELETE SET NULL,
  email text NOT NULL,
  phone text,
  status order_status NOT NULL DEFAULT 'pending_payment',
  currency varchar(3) NOT NULL DEFAULT 'IDR',
  subtotal_amount integer NOT NULL,
  shipping_amount integer NOT NULL DEFAULT 0,
  discount_amount integer NOT NULL DEFAULT 0,
  total_amount integer NOT NULL,
  shipping_address jsonb,
  customer_note text,
  paid_at timestamptz,
  cancelled_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT orders_subtotal_non_negative CHECK (subtotal_amount >= 0),
  CONSTRAINT orders_shipping_non_negative CHECK (shipping_amount >= 0),
  CONSTRAINT orders_discount_non_negative CHECK (discount_amount >= 0),
  CONSTRAINT orders_total_consistent CHECK (
    total_amount = subtotal_amount + shipping_amount - discount_amount
    AND total_amount >= 0
  ),
  CONSTRAINT orders_currency_uppercase CHECK (currency = upper(currency))
);
CREATE UNIQUE INDEX orders_order_number_unique ON orders (order_number);
CREATE UNIQUE INDEX orders_checkout_idempotency_unique ON orders (checkout_idempotency_key);
CREATE UNIQUE INDEX orders_access_token_hash_unique ON orders (access_token_hash);
CREATE INDEX orders_customer_created_idx ON orders (customer_id, created_at);
CREATE INDEX orders_status_created_idx ON orders (status, created_at);

CREATE TABLE order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders (id) ON DELETE CASCADE,
  product_id uuid REFERENCES products (id) ON DELETE SET NULL,
  variant_id uuid REFERENCES product_variants (id) ON DELETE SET NULL,
  sku text NOT NULL,
  product_name text NOT NULL,
  variant_name text NOT NULL,
  attributes jsonb NOT NULL DEFAULT '{}'::jsonb,
  quantity integer NOT NULL,
  unit_price_amount integer NOT NULL,
  line_total_amount integer NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT order_items_quantity_positive CHECK (quantity > 0),
  CONSTRAINT order_items_unit_price_non_negative CHECK (unit_price_amount >= 0),
  CONSTRAINT order_items_line_total_consistent CHECK (
    line_total_amount = unit_price_amount * quantity
  )
);
CREATE INDEX order_items_order_idx ON order_items (order_id);
CREATE INDEX order_items_variant_idx ON order_items (variant_id);

CREATE TABLE payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders (id) ON DELETE CASCADE,
  provider text NOT NULL,
  provider_order_id text NOT NULL,
  provider_transaction_id text,
  status payment_status NOT NULL DEFAULT 'pending',
  amount integer NOT NULL,
  currency varchar(3) NOT NULL DEFAULT 'IDR',
  checkout_token text,
  checkout_url text,
  expires_at timestamptz,
  terminal_processed_at timestamptz,
  provider_response jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT payments_amount_non_negative CHECK (amount >= 0),
  CONSTRAINT payments_currency_uppercase CHECK (currency = upper(currency))
);
CREATE UNIQUE INDEX payments_provider_order_unique ON payments (provider, provider_order_id);
CREATE INDEX payments_order_created_idx ON payments (order_id, created_at);
CREATE INDEX payments_status_created_idx ON payments (status, created_at);

CREATE TABLE payment_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id uuid NOT NULL REFERENCES payments (id) ON DELETE CASCADE,
  provider text NOT NULL,
  event_fingerprint text NOT NULL,
  event_type text NOT NULL,
  payload_hash text NOT NULL,
  payload jsonb NOT NULL,
  processed_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX payment_events_provider_fingerprint_unique
  ON payment_events (provider, event_fingerprint);
CREATE INDEX payment_events_payment_processed_idx
  ON payment_events (payment_id, processed_at);

CREATE TABLE inventory_movements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  variant_id uuid NOT NULL REFERENCES product_variants (id) ON DELETE RESTRICT,
  order_id uuid REFERENCES orders (id) ON DELETE SET NULL,
  type inventory_movement_type NOT NULL,
  quantity_delta integer NOT NULL,
  reason text NOT NULL,
  actor text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT inventory_movements_delta_non_zero CHECK (quantity_delta <> 0)
);
CREATE INDEX inventory_movements_variant_created_idx
  ON inventory_movements (variant_id, created_at);
CREATE INDEX inventory_movements_order_idx ON inventory_movements (order_id);

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER customers_set_updated_at
BEFORE UPDATE ON customers
FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER categories_set_updated_at
BEFORE UPDATE ON categories
FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER products_set_updated_at
BEFORE UPDATE ON products
FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER product_variants_set_updated_at
BEFORE UPDATE ON product_variants
FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER inventory_set_updated_at
BEFORE UPDATE ON inventory
FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER shipping_methods_set_updated_at
BEFORE UPDATE ON shipping_methods
FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER carts_set_updated_at
BEFORE UPDATE ON carts
FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER cart_items_set_updated_at
BEFORE UPDATE ON cart_items
FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER orders_set_updated_at
BEFORE UPDATE ON orders
FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER payments_set_updated_at
BEFORE UPDATE ON payments
FOR EACH ROW EXECUTE FUNCTION set_updated_at();
