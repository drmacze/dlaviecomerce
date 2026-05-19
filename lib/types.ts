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
};
