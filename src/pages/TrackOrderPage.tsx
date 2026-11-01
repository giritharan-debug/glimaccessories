import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Search,
  Truck,
  CheckCircle2,
  Clock,
  Package,
  ShieldCheck,
  Video,
  ExternalLink,
  MessageCircle,
  Gift,
  AlertCircle,
} from 'lucide-react';
import { Order, OrderStatus } from '@/types';
import { getOrderByIdAndPhone, getCustomerDeliveredCount } from '@/lib/store';

export const TrackOrderPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [orderId, setOrderId] = useState(searchParams.get('orderId') || '');
  const [phone, setPhone] = useState(searchParams.get('phone') || '');
  const [order, setOrder] = useState<Order | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [deliveredOrdersCount, setDeliveredOrdersCount] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!orderId.trim()) {
      setError('Please enter your Order ID / Number (e.g. GLIM-1001).');
      return;
    }

    setLoading(true);
    setError('');
    setHasSearched(true);

    try {
      const found = await getOrderByIdAndPhone(orderId, phone);
      if (found) {
        setOrder(found);
        if (found.customer_phone) {
          const count = await getCustomerDeliveredCount(found.customer_phone);
          setDeliveredOrdersCount(count);
        }
      } else {
        setOrder(null);
        setError('No order found matching this Order Number and Phone. Please check and try again.');
      }
    } catch {
      setError('An error occurred while tracking. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (searchParams.get('orderId')) {
      handleSearch();
    }
  }, []);

  const timelineSteps: { status: OrderStatus; label: string; desc: string }[] = [
    { status: 'pending_verification', label: 'Payment Verification', desc: 'Our team is verifying your UPI UTR' },
    { status: 'confirmed', label: 'Order Confirmed', desc: 'Payment approved! Reserved from stock' },
    { status: 'packed', label: 'Packed with Proof', desc: 'Inspection & packing video recorded' },
    { status: 'shipped', label: 'Shipped from Pondicherry', desc: 'In transit with courier partner' },
    { status: 'delivered', label: 'Delivered', desc: 'Arrived safely at your doorstep' },
  ];

  const getStepState = (stepStatus: OrderStatus, currentStatus: OrderStatus) => {
    const orderRanks: Record<OrderStatus, number> = {
      pending_verification: 0,
      confirmed: 1,
      packed: 2,
      shipped: 3,
      delivered: 4,
      rejected: -1,
    };

    if (currentStatus === 'rejected') {
      return stepStatus === 'pending_verification' ? 'rejected' : 'upcoming';
    }

    const currentRank = orderRanks[currentStatus] ?? 0;
    const stepRank = orderRanks[stepStatus] ?? 0;

    if (currentRank > stepRank) return 'completed';
    if (currentRank === stepRank) return 'current';
    return 'upcoming';
  };

  // Loyalty calculations: every 3 orders gives reward coupon
  const currentStreak = deliveredOrdersCount % 3;
  const ordersNeeded = 3 - currentStreak;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      <div className="text-center space-y-2">
        <span className="text-xs uppercase font-bold tracking-widest text-pink-600 dark:text-pink-400">
          Live Status Tracker
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl text-stone-900 dark:text-stone-100 font-normal">
          Track Your Glim Parcel
        </h1>
        <p className="text-xs sm:text-sm text-stone-500 font-light">
          Enter your Order Number and WhatsApp Phone to view fulfillment milestones &amp; packing proof.
        </p>
      </div>

      {/* Search Input Box */}
      <form
        onSubmit={handleSearch}
        className="bg-white dark:bg-stone-900 p-6 sm:p-8 rounded-3xl border border-pink-100 dark:border-stone-800 shadow-sm space-y-4"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
              Order ID / Number *
            </label>
            <input
              type="text"
              required
              value={orderId}
              onChange={e => setOrderId(e.target.value)}
              placeholder="e.g. GLIM-1001"
              className="w-full px-4 py-2.5 text-sm uppercase font-mono rounded-xl border border-stone-300 dark:border-stone-700 bg-transparent text-stone-900 dark:text-stone-100 outline-none focus:ring-2 focus:ring-pink-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
              WhatsApp Phone Number
            </label>
            <input
              type="tel"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="e.g. 9876543210"
              maxLength={10}
              className="w-full px-4 py-2.5 text-sm rounded-xl border border-stone-300 dark:border-stone-700 bg-transparent text-stone-900 dark:text-stone-100 outline-none focus:ring-2 focus:ring-pink-500"
            />
          </div>
        </div>

        {error && (
          <p className="text-xs text-red-500 bg-red-50 dark:bg-red-950/40 p-2.5 rounded-xl border border-red-200 dark:border-red-900">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-xl bg-pink-600 hover:bg-pink-700 text-white font-semibold text-xs tracking-wide shadow-md flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
        >
          <Search className="w-4 h-4" />
          <span>{loading ? 'Searching...' : 'Track My Shipment'}</span>
        </button>
      </form>

      {/* Result Card */}
      {order && (
        <div className="bg-white dark:bg-stone-900 rounded-3xl border border-pink-100 dark:border-stone-800 shadow-md overflow-hidden divide-y divide-stone-100 dark:divide-stone-800 animate-fadeIn">
          {/* Header */}
          <div className="p-6 sm:p-8 bg-pink-50/40 dark:bg-stone-800/40 flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="text-xs text-stone-400">Order ID</span>
              <h3 className="font-serif font-bold text-xl text-stone-900 dark:text-stone-100 font-mono">
                {order.order_number}
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">
                Placed on {new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
              </p>
            </div>

            <div className="text-right">
              <span className="text-xs text-stone-400">Current Status</span>
              <div className="mt-1">
                {order.status === 'rejected' ? (
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300">
                    Payment Rejected
                  </span>
                ) : order.status === 'delivered' ? (
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                    Delivered
                  </span>
                ) : (
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-pink-100 text-pink-800 dark:bg-pink-950 dark:text-pink-300 capitalize">
                    {order.status.replace('_', ' ')}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Timeline visualization */}
          <div className="p-6 sm:p-8 space-y-6">
            <h4 className="font-serif font-semibold text-base text-stone-900 dark:text-stone-100">
              Shipment Milestones
            </h4>

            <div className="space-y-6">
              {timelineSteps.map((step, idx) => {
                const state = getStepState(step.status, order.status);
                return (
                  <div key={idx} className="flex items-start gap-4">
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-colors ${
                          state === 'completed'
                            ? 'bg-emerald-500 text-white'
                            : state === 'current'
                            ? 'bg-pink-600 text-white ring-4 ring-pink-100 dark:ring-pink-950 animate-pulse'
                            : state === 'rejected'
                            ? 'bg-red-500 text-white'
                            : 'bg-stone-100 dark:bg-stone-800 text-stone-400'
                        }`}
                      >
                        {state === 'completed' ? (
                          <CheckCircle2 className="w-5 h-5" />
                        ) : (
                          <span>{idx + 1}</span>
                        )}
                      </div>
                      {idx < timelineSteps.length - 1 && (
                        <div
                          className={`w-0.5 h-10 my-1 ${
                            state === 'completed' ? 'bg-emerald-400' : 'bg-stone-200 dark:bg-stone-700'
                          }`}
                        />
                      )}
                    </div>

                    <div className="pt-1 flex-1">
                      <p
                        className={`font-serif text-sm font-semibold ${
                          state === 'current'
                            ? 'text-pink-600 dark:text-pink-400 font-bold'
                            : state === 'completed'
                            ? 'text-stone-900 dark:text-stone-100'
                            : 'text-stone-400'
                        }`}
                      >
                        {step.label}
                      </p>
                      <p className="text-xs text-stone-500 mt-0.5">{step.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Tracking Number & Courier Partner */}
          {order.tracking_number && (
            <div className="p-6 sm:p-8 bg-pink-50/20 dark:bg-stone-800/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs text-stone-400">Courier Partner</span>
                <p className="font-semibold text-stone-900 dark:text-stone-100 text-sm">
                  {order.courier_name || 'Express Courier (Delhivery / BlueDart / India Post)'}
                </p>
                <p className="text-xs font-mono text-pink-600 dark:text-pink-400 font-bold mt-0.5">
                  Tracking No: {order.tracking_number}
                </p>
              </div>

              <a
                href={`https://www.google.com/search?q=${encodeURIComponent(order.tracking_number + ' courier tracking')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-xl bg-stone-900 text-white dark:bg-pink-600 text-xs font-semibold flex items-center gap-1.5 hover:opacity-90 transition-opacity"
              >
                <span>Track on Courier Portal</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          )}

          {/* PACKING PROOF PHOTO/VIDEO ATTACHMENT DISPLAY (MANDATORY REQUIREMENT) */}
          <div className="p-6 sm:p-8 space-y-4">
            <div className="flex items-center gap-2">
              <Video className="w-5 h-5 text-pink-600 dark:text-pink-400" />
              <h4 className="font-serif font-semibold text-base text-stone-900 dark:text-stone-100">
                Official Packing Proof Guarantee
              </h4>
            </div>

            {order.packing_proof_url ? (
              <div className="space-y-3">
                <p className="text-xs text-stone-600 dark:text-stone-400">
                  Our dispatch staff recorded this proof during the inspection and sealing of parcel #{order.order_number}:
                </p>
                <div className="max-w-md rounded-2xl overflow-hidden border border-stone-200 dark:border-stone-700 shadow-md">
                  {order.packing_proof_url.endsWith('.mp4') || order.packing_proof_url.endsWith('.webm') ? (
                    <video src={order.packing_proof_url} controls className="w-full h-auto" />
                  ) : (
                    <img
                      src={order.packing_proof_url}
                      alt="Official Packing Proof"
                      className="w-full h-64 object-cover"
                    />
                  )}
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-800 text-xs text-stone-500 flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-stone-400 flex-shrink-0" />
                <span>
                  Packing proof photo/video is uploaded by our Pondicherry dispatch team as soon as your items enter the final packaging station.
                </span>
              </div>
            )}
          </div>

          {/* LOYALTY REWARD PROGRESS DISPLAY (MANDATORY REQUIREMENT) */}
          <div className="p-6 sm:p-8 bg-gradient-to-r from-pink-50 to-cream-100 dark:from-stone-800 dark:to-stone-900 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-pink-100 dark:bg-pink-950 text-pink-600 dark:text-pink-400 flex items-center justify-center flex-shrink-0">
              <Gift className="w-6 h-6" />
            </div>
            <div className="flex-1 min-w-0">
              <h5 className="font-serif font-semibold text-sm text-stone-900 dark:text-stone-100">
                Glim Loyalty Rewards
              </h5>
              <p className="text-xs text-stone-600 dark:text-stone-400 mt-0.5">
                {ordersNeeded === 1
                  ? '✨ Only 1 more delivered order to unlock your ₹50 OFF reward coupon!'
                  : `🎁 ${ordersNeeded} more delivered orders to unlock your exclusive ₹50 OFF coupon!`}
              </p>
              <div className="w-full bg-stone-200 dark:bg-stone-700 h-1.5 rounded-full mt-2 overflow-hidden">
                <div
                  className="bg-pink-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${(currentStreak / 3) * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* Need help footer */}
          <div className="p-6 bg-stone-50 dark:bg-stone-900/60 flex items-center justify-between text-xs text-stone-600 dark:text-stone-400">
            <span>Have questions regarding your order?</span>
            <a
              href={`https://wa.me/918523996310?text=${encodeURIComponent(`Hi Glim support, inquiring about my order #${order.order_number}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#25D366] hover:underline font-semibold flex items-center gap-1"
            >
              <MessageCircle className="w-4 h-4 fill-[#25D366]" /> Chat on WhatsApp
            </a>
          </div>
        </div>
      )}
    </div>
  );
};
