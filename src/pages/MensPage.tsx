import React, { useState, useEffect } from 'react';
import { Sparkles, Shield, Watch, Gem } from 'lucide-react';
import { Product } from '@/types';
import { getProducts } from '@/lib/store';
import { ProductCard } from '@/components/ProductCard';

export const MensPage: React.FC = () => {
  const [mensProducts, setMensProducts] = useState<Product[]>([]);
  const [filterType, setFilterType] = useState<'all' | 'chains' | 'rings' | 'earrings' | 'watches'>('all');

  useEffect(() => {
    window.scrollTo(0, 0);
    getProducts().then(all => {
      const filtered = all.filter(p => {
        const cat = p.category_name?.toLowerCase() || '';
        const name = p.name.toLowerCase();
        return (
          cat.includes("men") ||
          cat.includes("watch") ||
          name.includes("men's") ||
          name.includes("mens") ||
          name.includes("cuban")
        );
      });
      setMensProducts(filtered);
    });
  }, []);

  const displayedProducts = mensProducts.filter(p => {
    const cat = (p.category_name || '').toLowerCase();
    const name = p.name.toLowerCase();
    if (filterType === 'chains') return cat.includes('chain') || name.includes('chain');
    if (filterType === 'rings') return cat.includes('ring') || name.includes('ring');
    if (filterType === 'earrings') return cat.includes('earring') || name.includes('earring') || name.includes('stud');
    if (filterType === 'watches') return cat.includes('watch') || name.includes('watch');
    return true;
  });

  return (
    <div className="space-y-12 pb-16">
      {/* Men's Collection Hero Banner */}
      <section className="relative overflow-hidden bg-stone-950 text-white py-16 sm:py-24 border-b border-stone-800">
        <div className="absolute inset-0 opacity-25">
          <img
            src="https://images.unsplash.com/photo-1617038220319-276d3cfab638?w=1600&auto=format&fit=crop&q=80"
            alt="Men's Collection background"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <span className="inline-block px-3 py-1 rounded-full bg-stone-800 text-pink-400 text-xs font-bold uppercase tracking-widest border border-stone-700">
            For Him • Everyday Durability
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-normal">
            Glim Men's Collection
          </h1>
          <p className="text-stone-300 text-sm sm:text-base max-w-2xl mx-auto font-light leading-relaxed">
            Engineered with 316L titanium steel &amp; waterproof finishes. Explore heavy Cuban curb chains, signet rings, minimal studs, and sleek mesh watches.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4 text-xs text-stone-400">
            <span className="flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-pink-400" /> Sweatproof &amp; Gym-Friendly
            </span>
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-pink-400" /> 100% Anti-Tarnish Steel
            </span>
          </div>
        </div>
      </section>

      {/* Filter Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-center border-b border-stone-200 dark:border-stone-800 pb-4">
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'all', label: "All Men's" },
              { id: 'chains', label: "Chains & Pendants" },
              { id: 'rings', label: "Signet Rings" },
              { id: 'watches', label: "Watches" },
              { id: 'earrings', label: "Studs & Hoops" },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setFilterType(tab.id as any)}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                  filterType === tab.id
                    ? 'bg-stone-900 text-white dark:bg-pink-600 shadow-md'
                    : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Products Grid */}
        <div className="mt-8">
          {displayedProducts.length === 0 ? (
            <div className="text-center py-16 text-stone-500">
              No products found in this category.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {displayedProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
