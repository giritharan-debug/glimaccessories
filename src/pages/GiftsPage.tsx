import React, { useState, useEffect } from 'react';
import { Gift, Heart, Sparkles, Cake, Smile, PartyPopper, Flame } from 'lucide-react';
import { Product } from '@/types';
import { getProducts } from '@/lib/store';
import { ProductCard } from '@/components/ProductCard';

export const GiftsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedOccasion, setSelectedOccasion] = useState<string>('all');
  const [selectedBudget, setSelectedBudget] = useState<string>('all');

  useEffect(() => {
    window.scrollTo(0, 0);
    getProducts().then(all => {
      // Prioritize Combos & Hampers and gifting items
      const giftItems = all.filter(p => {
        const cat = p.category_name?.toLowerCase() || '';
        const name = p.name.toLowerCase();
        return cat.includes('combo') || cat.includes('hamper') || name.includes('hamper') || name.includes('box') || name.includes('duo') || name.includes('set') || p.is_anti_tarnish;
      });
      setProducts(giftItems.length > 0 ? giftItems : all);
    });
  }, []);

  const occasions = [
    { id: 'all', label: 'All Occasions', icon: <Gift className="w-3.5 h-3.5" /> },
    { id: 'birthday', label: 'Birthday Surprise', icon: <Cake className="w-3.5 h-3.5 text-pink-500" /> },
    { id: 'bestie', label: 'Bestie BFF Duo', icon: <Heart className="w-3.5 h-3.5 text-rose-500" /> },
    { id: 'anniversary', label: 'Anniversary Love', icon: <Sparkles className="w-3.5 h-3.5 text-amber-500" /> },
    { id: 'valentine', label: "Valentine's", icon: <Heart className="w-3.5 h-3.5 text-red-500" /> },
    { id: 'diwali', label: 'Diwali Festive', icon: <Flame className="w-3.5 h-3.5 text-orange-500" /> },
    { id: 'sorry', label: 'Saying "Sorry"', icon: <Smile className="w-3.5 h-3.5 text-purple-500" /> },
  ];

  const filteredProducts = products.filter(p => {
    if (selectedBudget !== 'all') {
      const budget = parseFloat(selectedBudget);
      if (p.price > budget) return false;
    }
    return true;
  });

  return (
    <div className="space-y-12 pb-16">
      {/* Gifts Hero Banner */}
      <section className="relative overflow-hidden bg-gradient-to-r from-pink-100 via-cream-100 to-rose-100 dark:from-stone-900 dark:to-stone-950 py-16 sm:py-20 border-b border-pink-200 dark:border-stone-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-200 dark:bg-pink-950 text-pink-700 dark:text-pink-300 text-xs font-bold uppercase tracking-wider">
            <Gift className="w-3.5 h-3.5" />
            Curated Gift Hampers &amp; Keepsakes
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl text-stone-900 dark:text-stone-100 font-normal">
            Gifts Made with Pure Love
          </h1>
          <p className="text-stone-600 dark:text-stone-300 text-sm sm:text-base max-w-2xl mx-auto font-light leading-relaxed">
            Every hamper arrives in our signature keepsake box wrapped in soft satin ribbon, complete with warm fairy lights and your personalized handwritten message.
          </p>

          <div className="pt-2">
            <div className="inline-block p-3 rounded-2xl bg-white/90 dark:bg-stone-800/90 shadow-sm border border-pink-100 dark:border-stone-700 text-xs text-stone-700 dark:text-stone-300 max-w-md">
              💌 <strong>Free Gift Note:</strong> You can enter your personalized message during checkout, and our calligraphy team will handwrite it on a luxury art card!
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Occasions Tabs */}
        <div>
          <h3 className="text-center font-serif text-lg font-medium text-stone-800 dark:text-stone-200 mb-4">
            Shop by Occasion
          </h3>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {occasions.map(occ => (
              <button
                key={occ.id}
                onClick={() => setSelectedOccasion(occ.id)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold transition-all ${
                  selectedOccasion === occ.id
                    ? 'bg-pink-600 text-white shadow-md'
                    : 'bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700 hover:bg-pink-50'
                }`}
              >
                {occ.icon}
                <span>{occ.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Budget Filters */}
        <div className="flex items-center justify-center gap-2 pt-2">
          <span className="text-xs text-stone-500 font-medium">Filter by Budget:</span>
          {[
            { id: 'all', label: 'All Budgets' },
            { id: '199', label: 'Under ₹199' },
            { id: '499', label: 'Under ₹499' },
            { id: '999', label: 'Under ₹999' },
          ].map(b => (
            <button
              key={b.id}
              onClick={() => setSelectedBudget(b.id)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                selectedBudget === b.id
                  ? 'bg-stone-900 text-white dark:bg-pink-600'
                  : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200'
              }`}
            >
              {b.label}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 pt-4">
          {filteredProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </div>
  );
};
