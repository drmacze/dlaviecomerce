export type VipLevel = 'free' | 'silver' | 'gold' | 'platinum' | 'black';

export type Profile = {
  id: string;
  email: string | null;
  display_name: string | null;
  avatar_url: string | null;
  role: 'customer' | 'admin';
  is_vip: boolean;
  vip_level?: VipLevel | string | null;
  vip_tier?: VipLevel | string | null;
  d_balance?: number | null;
  d_points?: number | null;
  l_points: number;
  security_score?: number | null;
  referral_code?: string | null;
  referral_earnings?: number | null;
  affiliate_enabled?: boolean | null;
  affiliate_rank?: string | null;
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
export type WalletTransaction = { id: string; user_id: string; type: string; amount: number; status: string; provider?: string | null; reference?: string | null; metadata?: Record<string, unknown> | null; created_at: string };
export type ReferralRow = { id: string; referrer_id: string; referred_user_id?: string | null; status: string; reward_points: number; created_at: string };
