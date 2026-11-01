import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, ArrowRight, Sparkles } from 'lucide-react';
import { Product } from '@/types';
import { getProducts } from '@/lib/store';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      getProducts().then(setProducts);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const filtered = query.trim()
    ? products.filter(p =>
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.description?.toLowerCase().includes(query.toLowerCase()) ||
        p.category_name?.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  const handleSelect = (product: Product) => {
    onClose();
    navigate(`/product/${product.id}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 px-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-stone-900 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden border border-pink-100 dark:border-stone-800">
        <div className="p-4 border-b border-stone-200 dark:border-stone-800 flex items-center gap-3">
          <Search className="w-5 h-5 text-pink-600 dark:text-pink-400" />
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search chains, kadas, anti-tarnish rings, combos..."
            className="flex-1 bg-transparent text-stone-900 dark:text-stone-100 placeholder-stone-400 outline-none text-base sm:text-lg"
            autoFocus
          />
          {query && (
            <button onClick={() => setQuery('')} className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-200">
              <X className="w-5 h-5" />
            </button>
          )}
          <button
            onClick={onClose}
            className="px-2.5 py-1 text-xs uppercase tracking-wider font-semibold text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 rounded-md bg-stone-100 dark:bg-stone-800"
          >
            ESC
          </button>
        </div>

        <div className="max-h-96 overflow-y-auto p-4 divide-y divide-stone-100 dark:divide-stone-800">
          {query.trim() === '' ? (
            <div className="py-6 text-center text-stone-400">
              <p className="text-sm">Popular searches:</p>
              <div className="mt-3 flex flex-wrap justify-center gap-2">
                {['Anti Tarnish Chains', 'Snake Chain', 'Croissant Ring', 'Combos & Hampers', 'Roman Kada'].map(tag => (
                  <button
                    key={tag}
                    onClick={() => setQuery(tag)}
                    className="text-xs px-3 py-1.5 rounded-full bg-pink-50 dark:bg-stone-800 text-pink-700 dark:text-pink-300 hover:bg-pink-100 transition-colors"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-8 text-center text-stone-500">
              No products found for "{query}". Try another keyword or browse our categories.
            </div>
          ) : (
            filtered.map(product => (
              <div
                key={product.id}
                onClick={() => handleSelect(product)}
                className="py-3 flex items-center gap-4 hover:bg-pink-50/50 dark:hover:bg-stone-800/60 p-2 rounded-xl cursor-pointer transition-colors"
              >
                <img
                  src={product.images[0] || 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=200'}
                  alt={product.name}
                  className="w-14 h-14 object-cover rounded-lg bg-stone-100"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-stone-900 dark:text-stone-100 truncate text-sm sm:text-base">
                      {product.name}
                    </h4>
                    {product.is_anti_tarnish && (
                      <span className="flex items-center gap-0.5 text-[10px] bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 font-bold px-1.5 py-0.5 rounded">
                        <Sparkles className="w-2.5 h-2.5" /> Anti-Tarnish
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-stone-500 capitalize">{product.category_name}</p>
                  <p className="text-sm font-semibold text-pink-600 dark:text-pink-400 mt-0.5">
                    ₹{product.price}
                    {product.old_price && (
                      <span className="text-xs text-stone-400 line-through ml-2 font-normal">
                        ₹{product.old_price}
                      </span>
                    )}
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 text-stone-400" />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
