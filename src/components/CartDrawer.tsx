import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  X,
  Plus,
  Minus,
  Trash2,
  Sparkles,
  Truck,
  ShieldAlert,
  ArrowRight,
  Gift,
  Tag,
} from 'lucide-react';
import { useCart } from '@/context/CartContext';

export const CartDrawer: React.FC = () => {
  const {
    items,
    updateQuantity,
    removeFromCart,
    isCartOpen,
    setIsCartOpen,
    subtotal,
    discount,
    buy2Discount,
    shippingFee,
    total,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    freeShippingThreshold,
    freeShippingRemaining,
    settings,
  } = useCart();

  const [couponCode, setCouponCode] = useState('');
  const [couponMsg, setCouponMsg] = useState<{ text: string; error?: boolean } | null>(null);
  const [isApplying, setIsApplying] = useState(false);
  const navigate = useNavigate();

  if (!isCartOpen) return null;

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;

    setIsApplying(true);
    setCouponMsg(null);
    const res = await applyCoupon(couponCode);
    setIsApplying(false);

    setCouponMsg({ text: res.message, error: !res.success });
    if (res.success) {
      setCouponCode('');
    }
  };

  const handleProceedToCheckout = () => {
    setIsCartOpen(false);
    navigate('/checkout');
  };

  const progressPercent = Math.min(100, Math.round(((subtotal - discount) / freeShippingThreshold) * 100));

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={() => setIsCartOpen(false)}
      />

      {/* Drawer */}
      <div className="relative w-full max-w-md bg-white dark:bg-stone-900 h-full shadow-2xl flex flex-col justify-between z-10 animate-slideLeft">
        {/* Header */}
        <div className="p-4 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-serif font-bold text-lg text-stone-900 dark:text-stone-100">
              Shopping Cart
            </span>
            <span className="text-xs bg-pink-100 dark:bg-pink-950 text-pink-700 dark:text-pink-300 px-2 py-0.5 rounded-full font-semibold">
              {items.reduce((s, i) => s + i.quantity, 0)} items
            </span>
          </div>
          <button
            onClick={() => setIsCartOpen(false)}
            className="p-1.5 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Free Shipping Progress Bar */}
        <div className="p-3 bg-pink-50/60 dark:bg-stone-800/60 border-b border-pink-100 dark:border-stone-800 text-xs">
          <div className="flex items-center justify-between mb-1.5 font-medium">
            <span className="flex items-center gap-1.5 text-stone-800 dark:text-stone-200">
              <Truck className="w-4 h-4 text-pink-600 dark:text-pink-400" />
              {freeShippingRemaining > 0 ? (
                <span>
                  Add <strong className="text-pink-600 dark:text-pink-400">₹{freeShippingRemaining}</strong> more for{' '}
                  <strong>FREE Delivery!</strong>
                </span>
              ) : (
                <span className="text-emerald-700 dark:text-emerald-400 font-bold">
                  🎉 Congratulations! You qualify for FREE Shipping!
                </span>
              )}
            </span>
            <span className="text-stone-500 font-semibold">{progressPercent}%</span>
          </div>
          <div className="w-full bg-stone-200 dark:bg-stone-700 h-2 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-pink-500 to-rose-500 h-full transition-all duration-500 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* No Return Rule Notice Banner */}
        <div className="px-4 py-2 bg-amber-50 dark:bg-amber-950/40 border-b border-amber-200 dark:border-amber-800 flex items-center gap-2 text-xs text-amber-900 dark:text-amber-200">
          <ShieldAlert className="w-4 h-4 text-amber-600 flex-shrink-0" />
          <span>
            <strong>NO COD • NO RETURNS • NO REFUNDS.</strong> Packing proof videos recorded before dispatch.
          </span>
        </div>

        {/* Items List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 divide-y divide-stone-100 dark:divide-stone-800">
          {items.length === 0 ? (
            <div className="py-16 text-center space-y-4">
              <div className="w-16 h-16 bg-pink-50 dark:bg-stone-800 text-pink-400 rounded-full flex items-center justify-center mx-auto">
                <Gift className="w-8 h-8" />
              </div>
              <h4 className="font-serif font-semibold text-lg text-stone-900 dark:text-stone-100">
                Your cart is empty
              </h4>
              <p className="text-xs text-stone-500 max-w-xs mx-auto">
                Discover our aesthetic anti-tarnish chains, Korean earrings and gift hampers!
              </p>
              <button
                onClick={() => {
                  setIsCartOpen(false);
                  navigate('/products');
                }}
                className="mt-2 px-6 py-2.5 rounded-xl bg-pink-600 hover:bg-pink-700 text-white text-xs font-semibold tracking-wide transition-colors"
              >
                Start Shopping
              </button>
            </div>
          ) : (
            items.map((item, idx) => (
              <div key={`${item.product_id}-${idx}`} className="pt-4 first:pt-0 flex gap-3">
                <img
                  src={item.product_image}
                  alt={item.product_name}
                  className="w-18 h-18 sm:w-20 sm:h-20 object-cover rounded-xl bg-stone-100 flex-shrink-0"
                />
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start gap-2">
                      <h5 className="font-serif font-medium text-sm text-stone-900 dark:text-stone-100 line-clamp-1">
                        {item.product_name}
                      </h5>
                      <button
                        onClick={() => removeFromCart(item.product_id, item.selected_variant)}
                        className="text-stone-400 hover:text-red-500 transition-colors p-0.5"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {item.selected_variant && Object.keys(item.selected_variant).length > 0 && (
                      <p className="text-[11px] text-stone-500 mt-0.5">
                        {Object.entries(item.selected_variant)
                          .map(([k, v]) => `${k}: ${v}`)
                          .join(' • ')}
                      </p>
                    )}

                    {item.is_anti_tarnish && (
                      <span className="inline-flex items-center gap-0.5 text-[9px] bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-bold px-1.5 py-0.2 rounded mt-1">
                        <Sparkles className="w-2.5 h-2.5" /> Anti-Tarnish
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between mt-2">
                    <span className="font-bold text-sm text-pink-600 dark:text-pink-400">
                      ₹{item.price * item.quantity}
                    </span>

                    {/* Quantity controls */}
                    <div className="flex items-center border border-stone-200 dark:border-stone-700 rounded-lg overflow-hidden bg-stone-50 dark:bg-stone-800">
                      <button
                        onClick={() => updateQuantity(item.product_id, item.quantity - 1, item.selected_variant)}
                        className="p-1 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-600 dark:text-stone-300"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="px-2.5 text-xs font-semibold text-stone-800 dark:text-stone-100">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.product_id, item.quantity + 1, item.selected_variant)}
                        className="p-1 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-600 dark:text-stone-300"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer & Checkout Area */}
        {items.length > 0 && (
          <div className="p-4 border-t border-stone-200 dark:border-stone-800 bg-stone-50/80 dark:bg-stone-900/90 space-y-3">
            {/* Auto Applied Offer notification */}
            {buy2Discount > 0 && (
              <div className="p-2 rounded-xl bg-pink-100/70 dark:bg-pink-950/50 text-pink-800 dark:text-pink-200 text-xs flex items-center justify-between">
                <span className="flex items-center gap-1.5 font-medium">
                  <Sparkles className="w-4 h-4 text-pink-600" />
                  Offer Applied: Buy {settings?.buy2_qty ?? 2}+ get {settings?.buy2_percent ?? 10}% OFF!
                </span>
                <span className="font-bold">-₹{buy2Discount}</span>
              </div>
            )}

            {/* Coupon Code Input */}
            <form onSubmit={handleApplyCoupon} className="flex gap-2">
              <div className="relative flex-1">
                <Tag className="w-4 h-4 absolute left-3 top-2.5 text-stone-400" />
                <input
                  type="text"
                  value={couponCode}
                  onChange={e => setCouponCode(e.target.value)}
                  placeholder="Coupon code (e.g. WELCOME10)"
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 placeholder-stone-400 uppercase outline-none focus:ring-1 focus:ring-pink-500"
                />
              </div>
              <button
                type="submit"
                disabled={isApplying || !couponCode.trim()}
                className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white dark:bg-pink-600 dark:hover:bg-pink-700 rounded-xl text-xs font-semibold transition-colors disabled:opacity-40"
              >
                Apply
              </button>
            </form>

            {couponMsg && (
              <p className={`text-xs ${couponMsg.error ? 'text-red-500' : 'text-emerald-600 font-medium'}`}>
                {couponMsg.text}
              </p>
            )}

            {appliedCoupon && (
              <div className="flex items-center justify-between text-xs bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 p-2 rounded-lg border border-emerald-200 dark:border-emerald-800">
                <span>Code <strong>{appliedCoupon.code}</strong> applied</span>
                <button
                  onClick={removeCoupon}
                  className="text-stone-400 hover:text-red-500 text-xs underline"
                >
                  Remove
                </button>
              </div>
            )}

            {/* Price Calculations */}
            <div className="space-y-1.5 text-xs text-stone-600 dark:text-stone-400 pt-1">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-semibold text-stone-900 dark:text-stone-100">₹{subtotal}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-medium">
                  <span>Total Savings &amp; Offers</span>
                  <span>-₹{discount}</span>
                </div>
              )}
              <div className="flex justify-between items-center">
                <span>Shipping Fee</span>
                <span>
                  {shippingFee === 0 ? (
                    <span className="text-emerald-600 font-bold uppercase text-[11px]">Free</span>
                  ) : (
                    <span className="text-xs font-semibold text-stone-900 dark:text-stone-100">
                      ₹50 <span className="text-[10px] font-normal text-stone-400">(TN) / ₹80 (South) / ₹150 (North)</span>
                    </span>
                  )}
                </span>
              </div>
              <div className="flex justify-between text-base font-bold text-stone-900 dark:text-stone-100 pt-1.5 border-t border-stone-200 dark:border-stone-800">
                <span>Total Amount</span>
                <span className="text-pink-600 dark:text-pink-400">₹{total}</span>
              </div>
            </div>

            {/* Checkout Action Button */}
            <button
              onClick={handleProceedToCheckout}
              className="w-full py-3.5 rounded-xl bg-pink-600 hover:bg-pink-700 text-white font-semibold text-sm tracking-wide shadow-md flex items-center justify-center gap-2 transition-all duration-200 hover:shadow-lg"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
