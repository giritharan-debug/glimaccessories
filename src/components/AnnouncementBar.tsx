import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Sparkles, ShieldAlert, Truck } from 'lucide-react';
import { useCart } from '@/context/CartContext';

export const AnnouncementBar: React.FC = () => {
  const { settings } = useCart();
  const [currentIndex, setCurrentIndex] = useState(0);

  const customText = settings?.announcement_bar_text || 'Free shipping above Rs.999 📦 | No COD • No Returns • No Refunds';

  const announcements = [
    {
      text: customText,
      icon: <Truck className="w-3.5 h-3.5 inline mr-1 text-pink-300" />,
    },
    {
      text: '✨ STRICT NO-RETURN POLICY: All items are quality checked with packing proof videos ✨',
      icon: <ShieldAlert className="w-3.5 h-3.5 inline mr-1 text-amber-300" />,
    },
    {
      text: '💖 BUY 2 GET 10% OFF AUTO-APPLIED IN CART 💖',
      icon: <Sparkles className="w-3.5 h-3.5 inline mr-1 text-pink-300" />,
    },
    {
      text: '📍 Visit our Boutique: Romand Rolland St, opp. Dune Cafe, Pondicherry',
      icon: <Sparkles className="w-3.5 h-3.5 inline mr-1 text-pink-300" />,
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % announcements.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [announcements.length]);

  return (
    <div className="bg-[#1E1E1E] text-stone-100 text-xs sm:text-sm py-2 px-3 border-b border-stone-800 transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <button
          onClick={() => setCurrentIndex(prev => (prev - 1 + announcements.length) % announcements.length)}
          className="text-stone-400 hover:text-white p-0.5 transition-colors"
          aria-label="Previous announcement"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <div className="flex-1 text-center font-medium px-2 truncate flex items-center justify-center gap-1.5 animate-fadeIn">
          {announcements[currentIndex].icon}
          <span className="tracking-wide">{announcements[currentIndex].text}</span>
        </div>

        <button
          onClick={() => setCurrentIndex(prev => (prev + 1) % announcements.length)}
          className="text-stone-400 hover:text-white p-0.5 transition-colors"
          aria-label="Next announcement"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
