// src/types/commerce.ts

export interface Product {
  id: number;
  name: string;
  description?: string;
  price: number;
  image_url?: string;
  category_id: number;
}

export interface Category {
  id: number;
  name: string;
  products: Product[];
}

export interface Commerce {
  id: number;
  business_name: string;
  subdomain: string;
  logo_url?: string;
  banner_url?: string;
  business_category?: string;
  is_open?: boolean;
  delivery_time?: string;
  delivery_fee?: number;
  min_order_value?: number;
  accepts_delivery?: boolean;
  accepts_pickup?: boolean;
}

export interface CommerceData {
  commerce: Commerce;
  categories: Category[];
}