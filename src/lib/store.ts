import imageCompression from 'browser-image-compression';
import { getSupabase, isSupabaseConfigured } from './supabase';
import {
  INITIAL_CATEGORIES,
  INITIAL_PRODUCTS,
  INITIAL_REVIEWS,
  INITIAL_COUPONS,
  INITIAL_SETTINGS,
} from './seedData';
import {
  Category,
  Product,
  Review,
  Order,
  AbandonedCart,
  NotifyRequest,
  Coupon,
  SiteSettings,
  OrderStatus,
  OrderItem,
} from '@/types';

const STORAGE_KEYS = {
  CATEGORIES: 'glim_categories',
  PRODUCTS: 'glim_products',
  REVIEWS: 'glim_reviews',
  ORDERS: 'glim_orders',
  ABANDONED_CARTS: 'glim_abandoned_carts',
  NOTIFY_REQUESTS: 'glim_notify_requests',
  COUPONS: 'glim_coupons',
  SETTINGS: 'glim_settings',
  WISHLIST: 'glim_wishlist',
  CART: 'glim_cart',
};

// Dispatch global event for instant reactivity across components
export const notifyDataChanged = (entity: string) => {
  window.dispatchEvent(new CustomEvent('glim:data_changed', { detail: { entity } }));
};

// Helper: Get local JSON
const getLocal = <T>(key: string, defaultValue: T): T => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(defaultValue));
      return defaultValue;
    }
    return JSON.parse(raw);
  } catch {
    return defaultValue;
  }
};

// Helper: Set local JSON
const setLocal = <T>(key: string, value: T) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error('Storage quota exceeded or error:', e);
  }
};

// Initialize seed data if empty
export const initializeStore = () => {
  if (!localStorage.getItem(STORAGE_KEYS.CATEGORIES)) {
    setLocal(STORAGE_KEYS.CATEGORIES, INITIAL_CATEGORIES);
  }
  if (!localStorage.getItem(STORAGE_KEYS.PRODUCTS)) {
    setLocal(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
  }
  if (!localStorage.getItem(STORAGE_KEYS.REVIEWS)) {
    setLocal(STORAGE_KEYS.REVIEWS, INITIAL_REVIEWS);
  }
  if (!localStorage.getItem(STORAGE_KEYS.COUPONS)) {
    setLocal(STORAGE_KEYS.COUPONS, INITIAL_COUPONS);
  }
  if (!localStorage.getItem(STORAGE_KEYS.SETTINGS)) {
    setLocal(STORAGE_KEYS.SETTINGS, INITIAL_SETTINGS);
  }
  if (!localStorage.getItem(STORAGE_KEYS.ORDERS)) {
    setLocal(STORAGE_KEYS.ORDERS, []);
  }
  if (!localStorage.getItem(STORAGE_KEYS.ABANDONED_CARTS)) {
    setLocal(STORAGE_KEYS.ABANDONED_CARTS, []);
  }
  if (!localStorage.getItem(STORAGE_KEYS.NOTIFY_REQUESTS)) {
    setLocal(STORAGE_KEYS.NOTIFY_REQUESTS, []);
  }
};

// Initialize immediately
initializeStore();

// ==========================================
// IMAGE COMPRESSION & UPLOAD UTILITY
// ==========================================
export const compressAndProcessImage = async (file: File): Promise<string> => {
  try {
    const options = {
      maxSizeMB: 0.8,
      maxWidthOrHeight: 1200,
      useWebWorker: true,
    };
    const compressedFile = await imageCompression(file, options);

    // If Supabase is configured and storage bucket exists, upload to bucket
    const supabase = getSupabase();
    if (supabase && isSupabaseConfigured()) {
      try {
        const fileExt = file.name.split('.').pop() || 'jpg';
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
        const filePath = `uploads/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('store-assets')
          .upload(filePath, compressedFile);

        if (!uploadError) {
          const { data } = supabase.storage.from('store-assets').getPublicUrl(filePath);
          if (data?.publicUrl) {
            return data.publicUrl;
          }
        }
      } catch (err) {
        console.warn('Supabase storage upload failed, falling back to compressed DataURL', err);
      }
    }

    // Fallback: Convert to Base64 Data URL
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(compressedFile);
    });
  } catch (error) {
    console.error('Error compressing image:', error);
    // Return original as DataURL
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }
};

// ==========================================
// CATEGORIES
// ==========================================
export const getCategories = async (): Promise<Category[]> => {
  const supabase = getSupabase();
  if (supabase && isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('sort_order', { ascending: true });
      if (!error && data && data.length > 0) {
        setLocal(STORAGE_KEYS.CATEGORIES, data);
        return data;
      }
    } catch (e) {
      console.warn('Using local categories fallback:', e);
    }
  }
  return getLocal<Category[]>(STORAGE_KEYS.CATEGORIES, INITIAL_CATEGORIES);
};

export const saveCategory = async (category: Partial<Category> & { name: string; image: string }): Promise<Category> => {
  const categories = await getCategories();
  const slug = category.slug || category.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  
  let updatedCategory: Category;
  if (category.id) {
    updatedCategory = {
      ...categories.find(c => c.id === category.id)!,
      ...category,
      slug,
    } as Category;
    const index = categories.findIndex(c => c.id === category.id);
    if (index !== -1) categories[index] = updatedCategory;
  } else {
    updatedCategory = {
      id: `cat-${Date.now()}`,
      sort_order: categories.length + 1,
      is_hidden: false,
      ...category,
      slug,
    };
    categories.push(updatedCategory);
  }

  setLocal(STORAGE_KEYS.CATEGORIES, categories);

  const supabase = getSupabase();
  if (supabase && isSupabaseConfigured()) {
    try {
      await supabase.from('categories').upsert(updatedCategory);
    } catch (e) {
      console.error('Supabase category upsert error:', e);
    }
  }

  notifyDataChanged('categories');
  return updatedCategory;
};

export const deleteCategory = async (id: string): Promise<void> => {
  const categories = (await getCategories()).filter(c => c.id !== id);
  setLocal(STORAGE_KEYS.CATEGORIES, categories);

  const supabase = getSupabase();
  if (supabase && isSupabaseConfigured()) {
    try {
      await supabase.from('categories').delete().eq('id', id);
    } catch (e) {
      console.error('Supabase category delete error:', e);
    }
  }

  notifyDataChanged('categories');
};

// ==========================================
// PRODUCTS
// ==========================================
export const getProducts = async (): Promise<Product[]> => {
  const supabase = getSupabase();
  if (supabase && isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error && data && data.length > 0) {
        setLocal(STORAGE_KEYS.PRODUCTS, data);
        return data;
      }
    } catch (e) {
      console.warn('Using local products fallback:', e);
    }
  }
  return getLocal<Product[]>(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
};

export const getProductById = async (id: string): Promise<Product | undefined> => {
  const products = await getProducts();
  return products.find(p => p.id === id || p.slug === id);
};

export const saveProduct = async (productData: Partial<Product> & { name: string; price: number; category_id: string }): Promise<Product> => {
  const products = await getProducts();
  const categories = await getCategories();
  const category = categories.find(c => c.id === productData.category_id);
  const slug = productData.slug || productData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  let updatedProduct: Product;
  if (productData.id) {
    const existingIndex = products.findIndex(p => p.id === productData.id);
    updatedProduct = {
      ...products[existingIndex],
      ...productData,
      category_name: category ? category.name : productData.category_name,
      slug,
      is_available: (productData.stock ?? products[existingIndex].stock) > 0,
    } as Product;
    if (existingIndex !== -1) {
      products[existingIndex] = updatedProduct;
    }
  } else {
    updatedProduct = {
      id: `prod-${Date.now()}`,
      slug,
      description: '',
      stock: 10,
      is_anti_tarnish: false,
      is_available: true,
      images: [],
      variants: [],
      created_at: new Date().toISOString(),
      ...productData,
      category_name: category?.name,
    };
    products.unshift(updatedProduct);
  }

  setLocal(STORAGE_KEYS.PRODUCTS, products);

  const supabase = getSupabase();
  if (supabase && isSupabaseConfigured()) {
    try {
      await supabase.from('products').upsert(updatedProduct);
    } catch (e) {
      console.error('Supabase product upsert error:', e);
    }
  }

  notifyDataChanged('products');
  return updatedProduct;
};

export const deleteProduct = async (id: string): Promise<void> => {
  const products = (await getProducts()).filter(p => p.id !== id);
  setLocal(STORAGE_KEYS.PRODUCTS, products);

  const supabase = getSupabase();
  if (supabase && isSupabaseConfigured()) {
    try {
      await supabase.from('products').delete().eq('id', id);
    } catch (e) {
      console.error('Supabase product delete error:', e);
    }
  }

  notifyDataChanged('products');
};

export const bulkMarkProductsSoldOut = async (productIds: string[]): Promise<void> => {
  const products = await getProducts();
  products.forEach(p => {
    if (productIds.includes(p.id)) {
      p.stock = 0;
      p.is_available = false;
    }
  });
  setLocal(STORAGE_KEYS.PRODUCTS, products);

  const supabase = getSupabase();
  if (supabase && isSupabaseConfigured()) {
    try {
      for (const id of productIds) {
        await supabase.from('products').update({ stock: 0, is_available: false }).eq('id', id);
      }
    } catch (e) {
      console.error('Supabase bulk mark sold out error:', e);
    }
  }

  notifyDataChanged('products');
};

// ==========================================
// REVIEWS
// ==========================================
export const getReviews = async (): Promise<Review[]> => {
  const supabase = getSupabase();
  if (supabase && isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .order('sort_order', { ascending: true });
      if (!error && data && data.length > 0) {
        setLocal(STORAGE_KEYS.REVIEWS, data);
        return data;
      }
    } catch (e) {
      console.warn('Reviews fallback:', e);
    }
  }
  return getLocal<Review[]>(STORAGE_KEYS.REVIEWS, INITIAL_REVIEWS);
};

export const saveReview = async (review: Partial<Review> & { customer_name: string; review_text: string }): Promise<Review> => {
  const reviews = await getReviews();
  let updatedReview: Review;

  if (review.id) {
    const idx = reviews.findIndex(r => r.id === review.id);
    updatedReview = { ...reviews[idx], ...review } as Review;
    if (idx !== -1) reviews[idx] = updatedReview;
  } else {
    updatedReview = {
      id: `rev-${Date.now()}`,
      city: 'India',
      rating: 5,
      is_hidden: false,
      sort_order: reviews.length + 1,
      created_at: new Date().toISOString(),
      ...review,
    };
    reviews.push(updatedReview);
  }

  setLocal(STORAGE_KEYS.REVIEWS, reviews);

  const supabase = getSupabase();
  if (supabase && isSupabaseConfigured()) {
    try {
      await supabase.from('reviews').upsert(updatedReview);
    } catch (e) {
      console.error('Supabase review upsert error:', e);
    }
  }

  notifyDataChanged('reviews');
  return updatedReview;
};

export const deleteReview = async (id: string): Promise<void> => {
  const reviews = (await getReviews()).filter(r => r.id !== id);
  setLocal(STORAGE_KEYS.REVIEWS, reviews);

  const supabase = getSupabase();
  if (supabase && isSupabaseConfigured()) {
    try {
      await supabase.from('reviews').delete().eq('id', id);
    } catch (e) {
      console.error('Supabase review delete error:', e);
    }
  }

  notifyDataChanged('reviews');
};

// ==========================================
// ORDERS
// ==========================================
export const getOrders = async (): Promise<Order[]> => {
  const supabase = getSupabase();
  if (supabase && isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error && data && data.length > 0) {
        setLocal(STORAGE_KEYS.ORDERS, data);
        return data;
      }
    } catch (e) {
      console.warn('Orders fallback:', e);
    }
  }
  return getLocal<Order[]>(STORAGE_KEYS.ORDERS, []);
};

export const getOrderByIdAndPhone = async (orderIdentifier: string, phone: string): Promise<Order | undefined> => {
  const cleanPhone = phone.trim().replace(/\D/g, '').slice(-10);
  const cleanId = orderIdentifier.trim().toLowerCase();

  const orders = await getOrders();
  return orders.find(o => {
    const oNum = o.order_number.toLowerCase();
    const oId = o.id.toLowerCase();
    const oPhone = o.customer_phone.replace(/\D/g, '').slice(-10);
    return (oNum === cleanId || oId === cleanId) && (oPhone === cleanPhone || !phone);
  });
};

export const createOrder = async (orderData: Omit<Order, 'id' | 'order_number' | 'created_at' | 'updated_at' | 'status'>): Promise<Order> => {
  const orderNumber = `GLIM-${Math.floor(1000 + Math.random() * 9000)}`;
  const newOrder: Order = {
    ...orderData,
    id: `ord-${Date.now()}`,
    order_number: orderNumber,
    status: 'pending_verification',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  // Reduce product stock automatically
  const products = await getProducts();
  for (const item of newOrder.items) {
    const product = products.find(p => p.id === item.product_id);
    if (product) {
      product.stock = Math.max(0, product.stock - item.quantity);
      if (product.stock === 0) {
        product.is_available = false;
      }
    }
  }
  setLocal(STORAGE_KEYS.PRODUCTS, products);

  // Save order locally
  const orders = await getOrders();
  orders.unshift(newOrder);
  setLocal(STORAGE_KEYS.ORDERS, orders);

  // Remove matching abandoned cart if any
  const abandoned = getLocal<AbandonedCart[]>(STORAGE_KEYS.ABANDONED_CARTS, []);
  const cleanPhone = newOrder.customer_phone.replace(/\D/g, '').slice(-10);
  const filteredAbandoned = abandoned.filter(a => a.phone.replace(/\D/g, '').slice(-10) !== cleanPhone);
  setLocal(STORAGE_KEYS.ABANDONED_CARTS, filteredAbandoned);

  notifyDataChanged('orders');
  notifyDataChanged('products');
  notifyDataChanged('abandoned_carts');

  // Sync to Supabase
  const supabase = getSupabase();
  if (supabase && isSupabaseConfigured()) {
    try {
      await supabase.from('orders').insert(newOrder);
      // Trigger in postgres reduces stock or sync
      for (const item of newOrder.items) {
        const prod = products.find(p => p.id === item.product_id);
        if (prod) {
          await supabase.from('products').update({ stock: prod.stock, is_available: prod.is_available }).eq('id', prod.id);
        }
      }
    } catch (e) {
      console.error('Supabase createOrder error:', e);
    }
  }

  return newOrder;
};

export const updateOrderStatus = async (
  orderId: string,
  status: OrderStatus,
  extra?: { tracking_number?: string; courier_name?: string; packing_proof_url?: string }
): Promise<Order | null> => {
  const orders = await getOrders();
  const index = orders.findIndex(o => o.id === orderId);
  if (index === -1) return null;

  orders[index] = {
    ...orders[index],
    status,
    ...extra,
    updated_at: new Date().toISOString(),
  };

  setLocal(STORAGE_KEYS.ORDERS, orders);

  const supabase = getSupabase();
  if (supabase && isSupabaseConfigured()) {
    try {
      await supabase.from('orders').update({
        status,
        ...extra,
        updated_at: orders[index].updated_at,
      }).eq('id', orderId);
    } catch (e) {
      console.error('Supabase update order error:', e);
    }
  }

  notifyDataChanged('orders');
  return orders[index];
};

// ==========================================
// ABANDONED CARTS
// ==========================================
export const getAbandonedCarts = async (): Promise<AbandonedCart[]> => {
  const supabase = getSupabase();
  if (supabase && isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('abandoned_carts')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error && data && data.length > 0) {
        setLocal(STORAGE_KEYS.ABANDONED_CARTS, data);
        return data;
      }
    } catch (e) {
      console.warn('Abandoned carts fallback:', e);
    }
  }
  return getLocal<AbandonedCart[]>(STORAGE_KEYS.ABANDONED_CARTS, []);
};

export const saveAbandonedCart = async (phone: string, customer_name: string, items: OrderItem[], total: number): Promise<void> => {
  if (!phone || phone.length < 10 || items.length === 0) return;

  const cleanPhone = phone.replace(/\D/g, '').slice(-10);
  const carts = await getAbandonedCarts();
  const existingIdx = carts.findIndex(c => c.phone.replace(/\D/g, '').slice(-10) === cleanPhone);

  const cartEntry: AbandonedCart = {
    id: existingIdx !== -1 ? carts[existingIdx].id : `ab-${Date.now()}`,
    phone,
    customer_name,
    items,
    total,
    is_reminded: existingIdx !== -1 ? carts[existingIdx].is_reminded : false,
    reminded_at: existingIdx !== -1 ? carts[existingIdx].reminded_at : undefined,
    created_at: existingIdx !== -1 ? carts[existingIdx].created_at : new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  if (existingIdx !== -1) {
    carts[existingIdx] = cartEntry;
  } else {
    carts.unshift(cartEntry);
  }

  setLocal(STORAGE_KEYS.ABANDONED_CARTS, carts);
  notifyDataChanged('abandoned_carts');

  const supabase = getSupabase();
  if (supabase && isSupabaseConfigured()) {
    try {
      await supabase.from('abandoned_carts').upsert(cartEntry);
    } catch (e) {
      console.error('Supabase save abandoned cart error:', e);
    }
  }
};

export const markAbandonedCartReminded = async (id: string): Promise<void> => {
  const carts = await getAbandonedCarts();
  const idx = carts.findIndex(c => c.id === id);
  if (idx !== -1) {
    carts[idx].is_reminded = true;
    carts[idx].reminded_at = new Date().toISOString();
    setLocal(STORAGE_KEYS.ABANDONED_CARTS, carts);
    notifyDataChanged('abandoned_carts');

    const supabase = getSupabase();
    if (supabase && isSupabaseConfigured()) {
      try {
        await supabase.from('abandoned_carts').update({
          is_reminded: true,
          reminded_at: carts[idx].reminded_at,
        }).eq('id', id);
      } catch (e) {
        console.error('Supabase mark reminded error:', e);
      }
    }
  }
};

// ==========================================
// NOTIFY REQUESTS (OUT OF STOCK)
// ==========================================
export const getNotifyRequests = async (): Promise<NotifyRequest[]> => {
  const supabase = getSupabase();
  if (supabase && isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('notify_requests')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error && data && data.length > 0) {
        setLocal(STORAGE_KEYS.NOTIFY_REQUESTS, data);
        return data;
      }
    } catch (e) {
      console.warn('Notify requests fallback:', e);
    }
  }
  return getLocal<NotifyRequest[]>(STORAGE_KEYS.NOTIFY_REQUESTS, []);
};

export const saveNotifyRequest = async (productId: string, productName: string, phone: string): Promise<NotifyRequest> => {
  const requests = await getNotifyRequests();
  const newReq: NotifyRequest = {
    id: `notif-${Date.now()}`,
    product_id: productId,
    product_name: productName,
    phone,
    is_notified: false,
    created_at: new Date().toISOString(),
  };

  requests.unshift(newReq);
  setLocal(STORAGE_KEYS.NOTIFY_REQUESTS, requests);
  notifyDataChanged('notify_requests');

  const supabase = getSupabase();
  if (supabase && isSupabaseConfigured()) {
    try {
      await supabase.from('notify_requests').insert(newReq);
    } catch (e) {
      console.error('Supabase notify insert error:', e);
    }
  }

  return newReq;
};

export const markNotifyRequestDone = async (id: string): Promise<void> => {
  const requests = await getNotifyRequests();
  const idx = requests.findIndex(r => r.id === id);
  if (idx !== -1) {
    requests[idx].is_notified = true;
    setLocal(STORAGE_KEYS.NOTIFY_REQUESTS, requests);
    notifyDataChanged('notify_requests');

    const supabase = getSupabase();
    if (supabase && isSupabaseConfigured()) {
      try {
        await supabase.from('notify_requests').update({ is_notified: true }).eq('id', id);
      } catch (e) {
        console.error('Supabase notify update error:', e);
      }
    }
  }
};

// ==========================================
// COUPONS & OFFERS
// ==========================================
export const getCoupons = async (): Promise<Coupon[]> => {
  const supabase = getSupabase();
  if (supabase && isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase.from('coupons').select('*');
      if (!error && data && data.length > 0) {
        setLocal(STORAGE_KEYS.COUPONS, data);
        return data;
      }
    } catch (e) {
      console.warn('Coupons fallback:', e);
    }
  }
  return getLocal<Coupon[]>(STORAGE_KEYS.COUPONS, INITIAL_COUPONS);
};

export const saveCoupon = async (coupon: Partial<Coupon> & { code: string; discount_value: number }): Promise<Coupon> => {
  const coupons = await getCoupons();
  let updated: Coupon;

  if (coupon.id) {
    const idx = coupons.findIndex(c => c.id === coupon.id);
    updated = { ...coupons[idx], ...coupon } as Coupon;
    if (idx !== -1) coupons[idx] = updated;
  } else {
    updated = {
      id: `cpn-${Date.now()}`,
      discount_type: 'percentage',
      min_order_value: 0,
      times_used: 0,
      is_active: true,
      ...coupon,
      code: coupon.code.toUpperCase().trim(),
    };
    coupons.push(updated);
  }

  setLocal(STORAGE_KEYS.COUPONS, coupons);
  notifyDataChanged('coupons');

  const supabase = getSupabase();
  if (supabase && isSupabaseConfigured()) {
    try {
      await supabase.from('coupons').upsert(updated);
    } catch (e) {
      console.error('Supabase coupon upsert error:', e);
    }
  }

  return updated;
};

export const deleteCoupon = async (id: string): Promise<void> => {
  const coupons = (await getCoupons()).filter(c => c.id !== id);
  setLocal(STORAGE_KEYS.COUPONS, coupons);
  notifyDataChanged('coupons');

  const supabase = getSupabase();
  if (supabase && isSupabaseConfigured()) {
    try {
      await supabase.from('coupons').delete().eq('id', id);
    } catch (e) {
      console.error('Supabase coupon delete error:', e);
    }
  }
};

// Check if customer phone has past orders (for WELCOME10 coupon)
export const checkCustomerFirstOrder = async (phone: string): Promise<boolean> => {
  if (!phone) return true;
  const clean = phone.replace(/\D/g, '').slice(-10);
  const orders = await getOrders();
  const pastOrders = orders.filter(o => o.customer_phone.replace(/\D/g, '').slice(-10) === clean && o.status !== 'rejected');
  return pastOrders.length === 0;
};

// Customer order count for Loyalty program
export const getCustomerDeliveredCount = async (phone: string): Promise<number> => {
  if (!phone) return 0;
  const clean = phone.replace(/\D/g, '').slice(-10);
  const orders = await getOrders();
  return orders.filter(o => o.customer_phone.replace(/\D/g, '').slice(-10) === clean && o.status === 'delivered').length;
};

// ==========================================
// SITE SETTINGS
// ==========================================
export const getSiteSettings = async (): Promise<SiteSettings> => {
  const supabase = getSupabase();
  if (supabase && isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase.from('site_settings').select('*').single();
      if (!error && data) {
        const hasGateways = Array.isArray(data.payment_gateways) && data.payment_gateways.length > 0;
        const normalized: SiteSettings = {
          ...INITIAL_SETTINGS,
          ...data,
          payment_gateways: hasGateways ? data.payment_gateways : INITIAL_SETTINGS.payment_gateways,
          hero_banners: (Array.isArray(data.hero_banners) && data.hero_banners.length > 0)
            ? data.hero_banners
            : INITIAL_SETTINGS.hero_banners,
        };
        // If Supabase row didn't have payment gateways, sync initial gateways
        if (!hasGateways) {
          try {
            await supabase.from('site_settings').update({ payment_gateways: INITIAL_SETTINGS.payment_gateways }).eq('id', normalized.id);
          } catch {
            // Ignore if RLS blocks update
          }
        }
        setLocal(STORAGE_KEYS.SETTINGS, normalized);
        return normalized;
      }
    } catch (e) {
      console.warn('Site settings fallback:', e);
    }
  }
  const local = getLocal<SiteSettings>(STORAGE_KEYS.SETTINGS, INITIAL_SETTINGS);
  if (!Array.isArray(local.payment_gateways) || local.payment_gateways.length === 0) {
    local.payment_gateways = INITIAL_SETTINGS.payment_gateways;
    setLocal(STORAGE_KEYS.SETTINGS, local);
  }
  return local;
};

export const saveSiteSettings = async (settings: Partial<SiteSettings>): Promise<SiteSettings> => {
  const current = await getSiteSettings();
  const updated: SiteSettings = {
    ...current,
    ...settings,
    updated_at: new Date().toISOString(),
  };

  setLocal(STORAGE_KEYS.SETTINGS, updated);
  notifyDataChanged('site_settings');

  const supabase = getSupabase();
  if (supabase && isSupabaseConfigured()) {
    try {
      await supabase.from('site_settings').upsert(updated);
    } catch (e) {
      console.error('Supabase site settings upsert error:', e);
    }
  }

  return updated;
};
