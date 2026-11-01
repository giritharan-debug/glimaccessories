import React, { useEffect, useState } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import {
  CheckCircle2,
  MessageCircle,
  Truck,
  Sparkles,
  Share2,
  Copy,
  Check,
  Package,
} from 'lucide-react';
import { Order } from '@/types';
import { getOrders } from '@/lib/store';

export const OrderSuccessPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const [order, setOrder] = useState<Order | null>((location.state as any)?.order || null);
  const [copiedCode, setCopiedCode] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);

    // Fire joyful celebratory confetti!
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#EC4899', '#F472B6', '#FBCFE8', '#F59E0B', '#10B981'],
    });

    if (!order && id) {
      getOrders().then(orders => {
        const found = orders.find(o => o.id === id || o.order_number === id);
        if (found) setOrder(found);
      });
    }
  }, [id, order]);

  if (!order) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <h2 className="font-serif text-2xl text-stone-900 dark:text-stone-100">Order Placed!</h2>
        <p className="text-stone-500 text-xs mt-2">Loading your order details...</p>
        <Link to="/" className="mt-4 inline-block px-5 py-2 rounded-xl bg-pink-600 text-white text-xs font-semibold">
          Return to Store
        </Link>
      </div>
    );
  }

  // Generate friendly customer referral code e.g. GLIM-{last4DigitsOfPhone}
  const referralCode = `GLIM-${order.customer_phone.slice(-4)}`;

  // Construct prefilled WhatsApp confirmation message
  const itemsSummary = order.items
    .map(i => `• ${i.product_name} (Qty: ${i.quantity}) - ₹${i.price * i.quantity}`)
    .join('\n');

  const waMessageText = `Hello Glim Accessories Pondicherry! ✨
I have placed order *#${order.order_number}* on your website.

*Customer Name:* ${order.customer_name}
*Phone:* +91 ${order.customer_phone}
*Delivery Address:* ${order.address}, ${order.city}, ${order.state} - ${order.pincode}
${order.gift_note ? `*Gift Note:* "${order.gift_note}"\n` : ''}
*Ordered Items:*
${itemsSummary}

*Total Payable:* ₹${order.total}
*Payment Method:* ${order.payment_method.toUpperCase()}
*UTR / Transaction ID:* ${order.utr_number}

Please confirm my payment and share my tracking number once packed with proof video. Thank you! 💖`;

  const waUrl = `https://wa.me/918523996310?text=${encodeURIComponent(waMessageText)}`;

  const handleCopyReferral = () => {
    navigator.clipboard.writeText(
      `Hey! Get 10% off aesthetic anti-tarnish jewellery at Glim Accessories Pondicherry with my special code: ${referralCode}`
    );
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8 animate-fadeIn">
      {/* Success Badge & Header */}
      <div className="text-center space-y-3">
        <div className="flex items-center justify-center gap-3">
          <img
            src="/glim-logo.jpg"
            alt="Glim Accessories"
            className="w-14 h-14 rounded-full object-cover ring-2 ring-pink-300 dark:ring-pink-700 shadow-md"
          />
          <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-950 text-emerald-600 rounded-full flex items-center justify-center shadow-inner">
            <CheckCircle2 className="w-7 h-7" />
          </div>
        </div>
        <span className="text-xs uppercase font-bold tracking-widest text-emerald-600 dark:text-emerald-400 block pt-1">
          Payment Submitted for Verification
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl text-stone-900 dark:text-stone-100 font-normal">
          Thank you, {order.customer_name}!
        </h1>
        <p className="text-sm text-stone-600 dark:text-stone-400 max-w-lg mx-auto leading-relaxed">
          Your order has been recorded with Order ID:{' '}
          <strong className="text-pink-600 dark:text-pink-400 font-mono text-base">{order.order_number}</strong>.
        </p>
      </div>

      {/* CONFIRM ON WHATSAPP BUTTON (MANDATORY REQUIREMENT) */}
      <div className="p-6 rounded-3xl bg-emerald-50 dark:bg-emerald-950/40 border-2 border-emerald-400 dark:border-emerald-700/60 text-center space-y-4 shadow-md">
        <div className="space-y-1">
          <h3 className="font-serif font-bold text-lg text-emerald-900 dark:text-emerald-100">
            Step 2: Confirm Instantly on WhatsApp
          </h3>
          <p className="text-xs text-emerald-800 dark:text-emerald-300 max-w-md mx-auto">
            Click below to send your prefilled order details &amp; UTR directly to our Pondicherry store team for instant payment verification!
          </p>
        </div>

        <a
          href={waUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold text-sm sm:text-base tracking-wide transition-all shadow-lg hover:scale-105"
        >
          <MessageCircle className="w-6 h-6 fill-white" />
          <span>Confirm on WhatsApp (wa.me/918523996310)</span>
        </a>
      </div>

      {/* Referral Code Box */}
      <div className="p-6 rounded-3xl bg-pink-50/70 dark:bg-stone-800/60 border border-pink-200 dark:border-stone-700 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-1.5 text-pink-600 dark:text-pink-400 font-bold text-xs uppercase tracking-wider">
            <Sparkles className="w-4 h-4" />
            <span>Customer Referral Reward</span>
          </div>
          <h4 className="font-serif font-semibold text-base text-stone-900 dark:text-stone-100">
            Share with friends &amp; earn rewards!
          </h4>
          <p className="text-xs text-stone-500 max-w-sm">
            Give a friend 10% off using your code. When their order is delivered, you'll receive a reward coupon for your next purchase!
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-4 py-2 rounded-xl bg-white dark:bg-stone-900 border border-pink-300 dark:border-stone-600 font-mono font-bold text-pink-600 dark:text-pink-400 text-sm">
            {referralCode}
          </div>
          <button
            onClick={handleCopyReferral}
            className="p-2.5 rounded-xl bg-stone-900 text-white dark:bg-pink-600 hover:opacity-90 transition-opacity"
            title="Copy referral link"
          >
            {copiedCode ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Order Details Breakdown Card */}
      <div className="bg-white dark:bg-stone-900 p-6 sm:p-8 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-sm space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-100 dark:border-stone-800 pb-4">
          <div>
            <p className="text-xs text-stone-400">Order Number</p>
            <p className="font-mono font-bold text-lg text-stone-900 dark:text-stone-100">{order.order_number}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-stone-400">Payment Status</p>
            <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
              Pending Verification
            </span>
          </div>
        </div>

        {/* Ordered items */}
        <div className="space-y-3">
          <h4 className="font-serif font-semibold text-sm text-stone-900 dark:text-stone-100">
            Items Ordered ({order.items.length})
          </h4>
          <div className="divide-y divide-stone-100 dark:divide-stone-800">
            {order.items.map((item, i) => (
              <div key={i} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3">
                  <img
                    src={item.product_image}
                    alt={item.product_name}
                    className="w-12 h-12 object-cover rounded-lg bg-stone-100"
                  />
                  <div>
                    <p className="font-medium text-stone-800 dark:text-stone-200">{item.product_name}</p>
                    {item.selected_variant && (
                      <p className="text-stone-400">{Object.values(item.selected_variant).join(' • ')}</p>
                    )}
                    <p className="text-stone-400">Qty: {item.quantity}</p>
                  </div>
                </div>
                <span className="font-semibold text-stone-800 dark:text-stone-200">
                  ₹{item.price * item.quantity}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Shipping address & payment summary */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-stone-100 dark:border-stone-800 text-xs">
          <div>
            <p className="font-semibold text-stone-900 dark:text-stone-100 mb-1">Shipping Address:</p>
            <p className="text-stone-600 dark:text-stone-400 leading-relaxed">
              {order.customer_name}<br />
              {order.address}, {order.city}<br />
              {order.state} - {order.pincode}<br />
              Phone: +91 {order.customer_phone}
            </p>
          </div>

          <div>
            <p className="font-semibold text-stone-900 dark:text-stone-100 mb-1">Payment Verification:</p>
            <p className="text-stone-600 dark:text-stone-400">Method: {order.payment_method.toUpperCase()}</p>
            <p className="text-stone-600 dark:text-stone-400 font-mono">UTR: {order.utr_number}</p>
            <p className="text-stone-900 dark:text-stone-100 font-bold text-sm mt-1">Total: ₹{order.total}</p>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
        <Link
          to={`/track?orderId=${order.order_number}&phone=${order.customer_phone}`}
          className="w-full sm:w-auto px-6 py-3 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-semibold text-xs tracking-wide transition-colors flex items-center justify-center gap-2"
        >
          <Truck className="w-4 h-4" />
          <span>Track Order Status</span>
        </Link>
        <Link
          to="/"
          className="w-full sm:w-auto px-6 py-3 rounded-xl border border-stone-300 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 font-semibold text-xs tracking-wide transition-colors text-center"
        >
          Back to Homepage
        </Link>
      </div>
    </div>
  );
};
