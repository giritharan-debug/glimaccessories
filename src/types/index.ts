export type SizeGuideType = 'ring' | 'kada' | 'chain' | null;

export interface ProductVariant {
  id: string;
  name: string; // e.g. "Color", "Size", "Length"
  options: string[]; // e.g. ["Gold", "Silver"], ["16 inch", "18 inch"]
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  category_id: string;
  category_name?: string;
  price: number;
  old_price?: number;
  stock: number;
  is_anti_tarnish: boolean;
  is_available: boolean;
  images: string[];
  variants?: ProductVariant[];
  size_guide_type?: SizeGuideType;
  instagram_reel_url?: string;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  image: string;
  sort_order: number;
  is_hidden: boolean;
}

export interface Review {
  id: string;
  customer_name: string;
  city: string;
  rating: number;
  review_text: string;
  product_name?: string;
  photo_url?: string;
  is_hidden: boolean;
  sort_order: number;
  created_at: string;
}

export type OrderStatus = 'pending_verification' | 'confirmed' | 'packed' | 'shipped' | 'delivered' | 'rejected';

export interface OrderItem {
  product_id: string;
  product_name: string;
  product_image: string;
  price: number;
  quantity: number;
  selected_variant?: Record<string, string>;
  is_anti_tarnish?: boolean;
}

export interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  gift_note?: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  shipping_fee: number;
  total: number;
  payment_method: 'phonepe' | 'gpay' | 'paytm';
  upi_id: string;
  utr_number: string;
  payment_screenshot_url?: string;
  status: OrderStatus;
  tracking_number?: string;
  courier_name?: string;
  packing_proof_url?: string;
  created_at: string;
  updated_at: string;
}

export interface AbandonedCart {
  id: string;
  phone: string;
  customer_name?: string;
  items: OrderItem[];
  total: number;
  is_reminded: boolean;
  reminded_at?: string;
  created_at: string;
  updated_at: string;
}

export interface NotifyRequest {
  id: string;
  product_id: string;
  product_name: string;
  phone: string;
  is_notified: boolean;
  created_at: string;
}

export interface Coupon {
  id: string;
  code: string;
  discount_type: 'percentage' | 'flat';
  discount_value: number;
  min_order_value: number;
  max_discount?: number;
  expiry_date?: string;
  usage_limit?: number;
  times_used: number;
  is_active: boolean;
}

export interface PaymentGatewayConfig {
  id: 'phonepe' | 'gpay' | 'paytm';
  name: string;
  upi_id: string;
  qr_image: string;
  is_enabled: boolean;
}

export interface HeroBanner {
  id: string;
  title: string;
  subtitle: string;
  tag: string;
  image: string;
  link: string;
  button_text: string;
}

export interface SiteSettings {
  id: string;
  announcement_bar_text: string;
  free_shipping_threshold: number;
  flat_shipping_fee: number;
  whatsapp_number: string;
  instagram_url: string;
  store_address: string;
  google_maps_url: string;
  buy2_get10_enabled: boolean;
  buy2_qty: number;
  buy2_percent: number;
  hero_banners: HeroBanner[];
  payment_gateways: PaymentGatewayConfig[];
  updated_at: string;
}

export interface CartItem extends OrderItem {}
