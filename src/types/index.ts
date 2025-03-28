// src/types/index.ts

// Interfaces para las opciones de productos
export interface OptionItem {
  id: number;
  item_id?: number; // Para compatibilidad con algunos usos
  name: string;
  item_name?: string; // Para compatibilidad con algunos usos
  price_addition: number;
  available?: boolean;
  image_url?: string;
  tags?: Tag[];
}

export interface SelectedOptionItem {
  item_id: number;
  item_name: string;
  price_addition: number;
}

export interface ProductOption {
  id: number;
  option_id?: number; // Para compatibilidad
  product_id?: number;
  name: string;
  required: boolean;
  multiple: boolean;
  max_selections?: number;
  items: OptionItem[];
  tags?: Tag[];
}

export interface SelectedOption {
  option_id: number;
  option_name: string;
  selected_items: SelectedOptionItem[];
}

export interface Tag {
  id: number;
  name: string;
  color: string;
  textColor?: string;
  discount?: number;
  disableSelection?: boolean;
  isRecommended?: boolean;
  priority?: number;
  visible?: boolean;
}

// Interfaces para productos
export interface Product {
  id: number;
  name: string;
  description?: string;
  price: number;
  image_url?: string;
  selected_options?: SelectedOption[];
  quantity: number;
  tags?: Tag[];
  options?: ProductOption[];
}

// Interfaces para direcciones y comercios
export interface DeliveryAddress {
  street: string;
  number: string;
  apartment?: string;
  city: string;
  reference?: string;
  neighborhood?: string;
}

export interface CommerceData {
  id: number;
  subdomain: string;
  business_name: string;
  logo_url?: string;
  address?: string;
  phone?: string;
  owner_name?: string;
  business_category?: string;
  banner_url?: string;
  is_open: boolean;
  delivery_time?: string;
  delivery_fee?: number;
  min_order_value?: number;
  accepts_delivery: boolean;
  accepts_pickup: boolean;
  contact_phone?: string;
  contact_email?: string;
  social_instagram?: string;
  social_facebook?: string;
  social_whatsapp?: string;
  working_hours?: string;
}

export interface StoreLocation {
  id: number;
  name: string;
  address: string;
  city: string;
  openHours: string;
  deliveryTime: string;
  image_url?: string;
}

// Interfaces para checkout y órdenes
export interface CustomerInfo {
  name: string;
  phone: string;
  email?: string;
}

export interface PickupInfo {
  storeId: number;
  store?: StoreLocation;
  date: string;
  time: string;
}

export interface OrderData {
  id?: string;
  date: string;
  items: Product[];
  customer: CustomerInfo;
  deliveryMethod: 'delivery' | 'pickup';
  paymentMethod: string;
  paymentStatus?: 'paid' | 'pending';
  total: number;
  subtotal?: number;
  shipping?: number;
  tax?: number;
  status: 'confirmed' | 'processing' | 'delivering' | 'completed' | 'cancelled';
  estimatedDelivery?: string;
  deliveryAddress?: DeliveryAddress;
  pickup?: PickupInfo;
  commerce?: {
    id: number;
    business_name: string;
    address?: string;
    contact_phone?: string;
    social_whatsapp?: string;
  };
  whatsappLink?: string;
}

export default {
  Product,
  SelectedOption,
  CommerceData,
  DeliveryAddress,
  OrderData
};