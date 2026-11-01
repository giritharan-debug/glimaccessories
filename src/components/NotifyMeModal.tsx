import React, { useState } from 'react';
import { X, Bell, MessageCircle, Check } from 'lucide-react';
import { Product } from '@/types';
import { saveNotifyRequest } from '@/lib/store';

interface NotifyMeModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export const NotifyMeModal: React.FC<NotifyMeModalProps> = ({ product, isOpen, onClose }) => {
  const [phone, setPhone] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !product) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPhone = phone.trim().replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      setError('Please enter a valid 10-digit WhatsApp number.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await saveNotifyRequest(product.id, product.name, cleanPhone);
      setSubmitted(true);
    } catch {
      setError('Failed to register notification. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSubmitted(false);
    setPhone('');
    setError('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-stone-900 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-pink-100 dark:border-stone-800 p-6 relative">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200"
        >
          <X className="w-5 h-5" />
        </button>

        {submitted ? (
          <div className="text-center py-6 space-y-4">
            <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-950 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <Check className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-serif font-bold text-stone-900 dark:text-stone-100">
              You're on the priority restock list!
            </h3>
            <p className="text-xs text-stone-500">
              We will send a personal WhatsApp message to <strong>+91 {phone.slice(-10)}</strong> as soon as{' '}
              <span className="text-stone-800 dark:text-stone-200 font-medium">"{product.name}"</span> is back in stock.
            </p>
            <button
              onClick={handleClose}
              className="mt-4 w-full py-2.5 rounded-xl bg-pink-600 hover:bg-pink-700 text-white font-semibold text-xs tracking-wide transition-colors"
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center gap-2 text-pink-600 dark:text-pink-400">
              <Bell className="w-5 h-5" />
              <span className="text-xs uppercase font-bold tracking-wider">Restock Alert</span>
            </div>

            <h3 className="text-lg font-serif font-bold text-stone-900 dark:text-stone-100">
              Get notified when back in stock
            </h3>

            <div className="flex items-center gap-3 p-2 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-800">
              <img
                src={product.images[0]}
                alt={product.name}
                className="w-12 h-12 object-cover rounded-lg bg-stone-200"
              />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-stone-900 dark:text-stone-100 truncate">{product.name}</p>
                <p className="text-xs text-pink-600 dark:text-pink-400 font-bold">₹{product.price}</p>
              </div>
            </div>

            <p className="text-xs text-stone-500">
              Drop your WhatsApp number below. Our team will message you the moment we restock this piece!
            </p>

            <div>
              <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1">
                WhatsApp Phone Number
              </label>
              <div className="flex items-center border border-stone-300 dark:border-stone-700 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-pink-500 focus-within:border-transparent">
                <span className="bg-stone-100 dark:bg-stone-800 px-3 py-2.5 text-xs text-stone-600 dark:text-stone-400 font-medium">
                  +91
                </span>
                <input
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="e.g. 9876543210"
                  maxLength={10}
                  className="flex-1 px-3 py-2.5 bg-transparent text-sm text-stone-900 dark:text-stone-100 placeholder-stone-400 outline-none"
                  autoFocus
                />
              </div>
              {error && <p className="text-red-500 text-xs mt-1.5">{error}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs tracking-wide flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
            >
              <MessageCircle className="w-4 h-4 fill-white" />
              {loading ? 'Subscribing...' : 'Notify Me on WhatsApp'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
