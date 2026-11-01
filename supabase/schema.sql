-- ========================================================
-- GLIM ACCESSORIES - SUPABASE COMPLETE IDEMPOTENT SCHEMA
-- Safe to run repeatedly without any 42710 policy errors!
-- ========================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Categories Table
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  image TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  is_hidden BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Products Table
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT DEFAULT '',
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  price NUMERIC(10, 2) NOT NULL,
  old_price NUMERIC(10, 2),
  stock INTEGER NOT NULL DEFAULT 10,
  is_anti_tarnish BOOLEAN DEFAULT FALSE,
  is_available BOOLEAN DEFAULT TRUE,
  images TEXT[] NOT NULL DEFAULT '{}',
  variants JSONB DEFAULT '[]'::jsonb,
  size_guide_type TEXT CHECK (size_guide_type IN ('ring', 'kada', 'chain', NULL)),
  instagram_reel_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Customer Reviews Table
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_name TEXT NOT NULL,
  city TEXT NOT NULL,
  rating INTEGER DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT NOT NULL,
  product_name TEXT,
  photo_url TEXT,
  is_hidden BOOLEAN DEFAULT FALSE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Orders Table
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number TEXT NOT NULL UNIQUE,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  pincode TEXT NOT NULL,
  gift_note TEXT,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  subtotal NUMERIC(10, 2) NOT NULL,
  discount NUMERIC(10, 2) DEFAULT 0,
  shipping_fee NUMERIC(10, 2) DEFAULT 0,
  total NUMERIC(10, 2) NOT NULL,
  payment_method TEXT NOT NULL CHECK (payment_method IN ('phonepe', 'gpay', 'paytm')),
  upi_id TEXT NOT NULL,
  utr_number TEXT NOT NULL,
  payment_screenshot_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending_verification' CHECK (status IN ('pending_verification', 'confirmed', 'packed', 'shipped', 'delivered', 'rejected')),
  tracking_number TEXT,
  courier_name TEXT,
  packing_proof_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Abandoned Carts Table
CREATE TABLE IF NOT EXISTS abandoned_carts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  phone TEXT NOT NULL,
  customer_name TEXT,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  total NUMERIC(10, 2) NOT NULL,
  is_reminded BOOLEAN DEFAULT FALSE,
  reminded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Notify Requests Table (when sold-out products get requested)
CREATE TABLE IF NOT EXISTS notify_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  product_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  is_notified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Coupons Table
CREATE TABLE IF NOT EXISTS coupons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT NOT NULL UNIQUE,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'flat')),
  discount_value NUMERIC(10, 2) NOT NULL,
  min_order_value NUMERIC(10, 2) DEFAULT 0,
  max_discount NUMERIC(10, 2),
  expiry_date TIMESTAMPTZ,
  usage_limit INTEGER,
  times_used INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Referrals Table
CREATE TABLE IF NOT EXISTS referrals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  referrer_phone TEXT NOT NULL,
  referral_code TEXT NOT NULL UNIQUE,
  friend_phone TEXT,
  friend_order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'rewarded')),
  reward_coupon_code TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Site Settings Table (Single-row configuration)
CREATE TABLE IF NOT EXISTS site_settings (
  id TEXT PRIMARY KEY DEFAULT 'primary_settings',
  announcement_bar_text TEXT DEFAULT 'Free shipping above Rs.999 📦 | No COD • No Returns • No Refunds',
  free_shipping_threshold NUMERIC(10, 2) DEFAULT 999,
  flat_shipping_fee NUMERIC(10, 2) DEFAULT 60,
  whatsapp_number TEXT DEFAULT '+918523996310',
  instagram_url TEXT DEFAULT 'https://instagram.com/glim_accessories_',
  store_address TEXT DEFAULT 'Romand Rolland St, opp. Dune Cafe, Pondicherry',
  google_maps_url TEXT DEFAULT 'https://maps.google.com/?q=Romand+Rolland+St,+opp.+Dune+Cafe,+Pondicherry',
  buy2_get10_enabled BOOLEAN DEFAULT TRUE,
  buy2_qty INTEGER DEFAULT 2,
  buy2_percent INTEGER DEFAULT 10,
  hero_banners JSONB DEFAULT '[]'::jsonb,
  payment_gateways JSONB DEFAULT '[]'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================================================
-- ENABLE ROW LEVEL SECURITY (RLS)
-- ========================================================

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE abandoned_carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE notify_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- ========================================================
-- DROP EXISTING POLICIES FIRST (AVOIDS 42710 ALREADY EXISTS ERROR)
-- ========================================================

DROP POLICY IF EXISTS "Public Read Categories" ON categories;
DROP POLICY IF EXISTS "Public Read Products" ON products;
DROP POLICY IF EXISTS "Public Read Reviews" ON reviews;
DROP POLICY IF EXISTS "Public Read Site Settings" ON site_settings;
DROP POLICY IF EXISTS "Public Read Coupons" ON coupons;
DROP POLICY IF EXISTS "Public Insert Orders" ON orders;
DROP POLICY IF EXISTS "Customer Read Own Order" ON orders;
DROP POLICY IF EXISTS "Public Upsert Abandoned Carts" ON abandoned_carts;
DROP POLICY IF EXISTS "Public Insert Notify Requests" ON notify_requests;
DROP POLICY IF EXISTS "Admin Full Categories" ON categories;
DROP POLICY IF EXISTS "Admin Full Products" ON products;
DROP POLICY IF EXISTS "Admin Full Reviews" ON reviews;
DROP POLICY IF EXISTS "Admin Full Orders" ON orders;
DROP POLICY IF EXISTS "Admin Full Abandoned" ON abandoned_carts;
DROP POLICY IF EXISTS "Admin Full Notify" ON notify_requests;
DROP POLICY IF EXISTS "Admin Full Coupons" ON coupons;
DROP POLICY IF EXISTS "Admin Full Site Settings" ON site_settings;
DROP POLICY IF EXISTS "Public Full Categories" ON categories;
DROP POLICY IF EXISTS "Public Full Products" ON products;
DROP POLICY IF EXISTS "Public Full Reviews" ON reviews;
DROP POLICY IF EXISTS "Public Full Site Settings" ON site_settings;
DROP POLICY IF EXISTS "Public Full Coupons" ON coupons;
DROP POLICY IF EXISTS "Public Full Orders" ON orders;

-- ========================================================
-- CREATE CLEAN IDEMPOTENT RLS POLICIES
-- ========================================================

-- Store data & configuration: Full access for smooth sync
CREATE POLICY "Public Full Categories" ON categories FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Full Products" ON products FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Full Reviews" ON reviews FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Full Site Settings" ON site_settings FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Full Coupons" ON coupons FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Full Orders" ON orders FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Upsert Abandoned Carts" ON abandoned_carts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Insert Notify Requests" ON notify_requests FOR INSERT WITH CHECK (true);

-- ========================================================
-- AUTOMATIC STOCK REDUCTION TRIGGER
-- ========================================================

CREATE OR REPLACE FUNCTION reduce_product_stock_on_order()
RETURNS TRIGGER AS $$
DECLARE
  item JSONB;
  prod_id UUID;
  qty INT;
BEGIN
  FOR item IN SELECT * FROM jsonb_array_elements(NEW.items)
  LOOP
    BEGIN
      prod_id := (item->>'product_id')::UUID;
      qty := (item->>'quantity')::INT;
      
      UPDATE products
      SET stock = GREATEST(0, stock - qty),
          is_available = CASE WHEN (stock - qty) <= 0 THEN FALSE ELSE is_available END
      WHERE id = prod_id;
    EXCEPTION WHEN OTHERS THEN
      -- Continue if non-uuid
    END;
  END LOOP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_reduce_stock ON orders;
CREATE TRIGGER trg_reduce_stock
AFTER INSERT ON orders
FOR EACH ROW
EXECUTE FUNCTION reduce_product_stock_on_order();

-- ========================================================
-- INITIAL SEED CATEGORIES (SAFE INSERT WITH ON CONFLICT)
-- ========================================================

INSERT INTO categories (name, slug, image, sort_order) VALUES
  ('Anti Tarnish Chains', 'anti-tarnish-chains', 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600', 1),
  ('Anti Tarnish Kadas', 'anti-tarnish-kadas', 'https://images.unsplash.com/photo-1611591475155-42e472621434?w=600', 2),
  ('Anti Tarnish Earrings', 'anti-tarnish-earrings', 'https://images.unsplash.com/photo-1630019852942-f89202989a59?w=600', 3),
  ('Clips', 'clips', 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600', 4),
  ('Keychains', 'keychains', 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=600', 5),
  ('Rings', 'rings', 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=600', 6),
  ('Second Studs', 'second-studs', 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600', 7),
  ('Anti Tarnish Bracelets', 'anti-tarnish-bracelets', 'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=600', 8),
  ('Korean Earrings', 'korean-earrings', 'https://images.unsplash.com/photo-1588444837495-c6cfeb53f32d?w=600', 9),
  ('Men''s Chains', 'mens-chains', 'https://images.unsplash.com/photo-1617038220319-276d3cfab638?w=600', 10),
  ('Men''s Earrings', 'mens-earrings', 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600', 11),
  ('Men''s Rings', 'mens-rings', 'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?w=600', 12),
  ('Jhumkas', 'jhumkas', 'https://images.unsplash.com/photo-1544441893-675973e31985?w=600', 13),
  ('Ear Cuffs', 'ear-cuffs', 'https://images.unsplash.com/photo-1635767798638-3e25273a8236?w=600', 14),
  ('Watches', 'watches', 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=600', 15),
  ('Scrunchies & Bows', 'scrunchies-and-bows', 'https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?w=600', 16),
  ('Combos & Hampers', 'combos-and-hampers', 'https://images.unsplash.com/photo-1513201099705-a9746e1e201f?w=600', 17)
ON CONFLICT (slug) DO NOTHING;

-- Initial Settings Insert
INSERT INTO site_settings (id, announcement_bar_text, free_shipping_threshold, flat_shipping_fee, whatsapp_number, store_address)
VALUES (
  'primary_settings',
  'Free shipping above Rs.999 📦 | No COD • No Returns • No Refunds',
  999,
  60,
  '+918523996310',
  'Romand Rolland St, opp. Dune Cafe, Pondicherry'
)
ON CONFLICT (id) DO NOTHING;
