export type Profile = {
  id: string;
  email: string | null;
  display_name: string | null;
  avatar_url: string | null;
  role: 'customer' | 'admin';
  is_vip: boolean;
  l_points: number;
  created_at: string;
};

export type Product = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  category: string;
  image_url: string | null;
  file_path: string | null;
  is_published: boolean;
  created_at: string;
  release_date?: string | null;
  stock?: number | null;
  badge?: string | null;
  mood_color?: string | null;
};

export type Order = { id: string; buyer_email: string; total_amount: number; status: 'pending' | 'paid' | 'fulfilled' | 'cancelled'; created_at: string };
export type OrderItem = { id: string; order_id: string; product_id: string; qty: number; price: number; created_at: string };
export type DPointLedger = { id: string; user_id: string; amount: number; reason: string; created_at: string };
export type LPointLedger = DPointLedger;
export type DailyCheckIn = { id: string; user_id: string; checkin_date: string; points_awarded: number; created_at: string };
export type Coupon = { id: string; code: string; discount_type: 'percent' | 'fixed'; amount: number; min_amount: number; usage_limit: number | null; redeemed_count: number; is_active: boolean; expires_at: string | null; created_at: string };
