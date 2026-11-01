import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem, Product, Coupon, SiteSettings } from '@/types';
import { getSiteSettings, getCoupons } from '@/lib/store';

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, quantity?: number, selectedVariant?: Record<string, string>) => boolean;
  updateQuantity: (productId: string, quantity: number, selectedVariant?: Record<string, string>) => void;
  removeFromCart: (productId: string, selectedVariant?: Record<string, string>) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  appliedCoupon: Coupon | null;
  applyCoupon: (code: string, phone?: string) => Promise<{ success: boolean; message: string }>;
  removeCoupon: () => void;
  subtotal: number;
  discount: number;
  buy2Discount: number;
  shippingFee: number;
  total: number;
  totalCount: number;
  freeShippingThreshold: number;
  freeShippingRemaining: number;
  settings: SiteSettings | null;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'glim_cart';
const COUPON_STORAGE_KEY = 'glim_applied_coupon';

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(() => {
    try {
      const saved = localStorage.getItem(COUPON_STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [settings, setSettings] = useState<SiteSettings | null>(null);

  // Load site settings
  useEffect(() => {
    getSiteSettings().then(setSettings);
    const handleDataChanged = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail?.entity === 'site_settings') {
        getSiteSettings().then(setSettings);
      }
    };
    window.addEventListener('glim:data_changed', handleDataChanged);
    return () => window.removeEventListener('glim:data_changed', handleDataChanged);
  }, []);

  // Save cart changes
  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    if (appliedCoupon) {
      localStorage.setItem(COUPON_STORAGE_KEY, JSON.stringify(appliedCoupon));
    } else {
      localStorage.removeItem(COUPON_STORAGE_KEY);
    }
  }, [appliedCoupon]);

  const generateVariantKey = (variant?: Record<string, string>) => {
    if (!variant || Object.keys(variant).length === 0) return '';
    return Object.entries(variant).sort().map(([k, v]) => `${k}:${v}`).join('|');
  };

  const addToCart = (product: Product, quantity = 1, selectedVariant?: Record<string, string>): boolean => {
    if (product.stock <= 0 || !product.is_available) {
      return false;
    }

    const targetKey = generateVariantKey(selectedVariant);

    setItems(prevItems => {
      const existingIdx = prevItems.findIndex(
        item => item.product_id === product.id && generateVariantKey(item.selected_variant) === targetKey
      );

      if (existingIdx !== -1) {
        const currentQty = prevItems[existingIdx].quantity;
        const newQty = Math.min(product.stock, currentQty + quantity);
        const updated = [...prevItems];
        updated[existingIdx] = { ...updated[existingIdx], quantity: newQty };
        return updated;
      }

      return [
        ...prevItems,
        {
          product_id: product.id,
          product_name: product.name,
          product_image: product.images[0] || 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600',
          price: product.price,
          quantity: Math.min(product.stock, quantity),
          selected_variant: selectedVariant,
          is_anti_tarnish: product.is_anti_tarnish,
        },
      ];
    });

    setIsCartOpen(true);
    return true;
  };

  const updateQuantity = (productId: string, quantity: number, selectedVariant?: Record<string, string>) => {
    const targetKey = generateVariantKey(selectedVariant);
    if (quantity <= 0) {
      removeFromCart(productId, selectedVariant);
      return;
    }

    setItems(prevItems =>
      prevItems.map(item => {
        if (item.product_id === productId && generateVariantKey(item.selected_variant) === targetKey) {
          return { ...item, quantity };
        }
        return item;
      })
    );
  };

  const removeFromCart = (productId: string, selectedVariant?: Record<string, string>) => {
    const targetKey = generateVariantKey(selectedVariant);
    setItems(prevItems =>
      prevItems.filter(
        item => !(item.product_id === productId && generateVariantKey(item.selected_variant) === targetKey)
      )
    );
  };

  const clearCart = () => {
    setItems([]);
    setAppliedCoupon(null);
  };

  const totalCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Buy 2 get 10% off (Admin editable)
  const isBuy2Enabled = settings?.buy2_get10_enabled ?? true;
  const buy2RequiredQty = settings?.buy2_qty ?? 2;
  const buy2Percent = settings?.buy2_percent ?? 10;

  let buy2Discount = 0;
  if (isBuy2Enabled && totalCount >= buy2RequiredQty && subtotal > 0) {
    buy2Discount = Math.round((subtotal * buy2Percent) / 100);
  }

  // Coupon discount calculation
  let couponDiscount = 0;
  if (appliedCoupon && subtotal >= appliedCoupon.min_order_value) {
    if (appliedCoupon.discount_type === 'percentage') {
      const raw = (subtotal * appliedCoupon.discount_value) / 100;
      couponDiscount = appliedCoupon.max_discount ? Math.min(raw, appliedCoupon.max_discount) : raw;
    } else {
      couponDiscount = appliedCoupon.discount_value;
    }
  }

  const discount = Math.min(subtotal, Math.round(buy2Discount + couponDiscount));

  // Shipping threshold calculation
  const freeShippingThreshold = settings?.free_shipping_threshold ?? 999;
  const flatShippingFee = settings?.flat_shipping_fee ?? 60;
  const discountedSubtotal = subtotal - discount;
  const shippingFee = (discountedSubtotal >= freeShippingThreshold || items.length === 0) ? 0 : flatShippingFee;
  const freeShippingRemaining = Math.max(0, freeShippingThreshold - discountedSubtotal);

  const total = Math.max(0, discountedSubtotal + shippingFee);

  const applyCoupon = async (code: string, phone?: string): Promise<{ success: boolean; message: string }> => {
    const upperCode = code.trim().toUpperCase();
    const coupons = await getCoupons();
    const coupon = coupons.find(c => c.code === upperCode && c.is_active);

    if (!coupon) {
      return { success: false, message: 'Invalid or expired coupon code.' };
    }

    if (subtotal < coupon.min_order_value) {
      return { success: false, message: `Minimum order value for ${upperCode} is ₹${coupon.min_order_value}.` };
    }

    if (coupon.code === 'WELCOME10') {
      if (!phone || phone.length < 10) {
        // Allow applying now, will re-check at phone verification
      }
    }

    setAppliedCoupon(coupon);
    return { success: true, message: `Coupon ${coupon.code} applied successfully!` };
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
  };

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        isCartOpen,
        setIsCartOpen,
        appliedCoupon,
        applyCoupon,
        removeCoupon,
        subtotal,
        discount,
        buy2Discount,
        shippingFee,
        total,
        totalCount,
        freeShippingThreshold,
        freeShippingRemaining,
        settings,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
