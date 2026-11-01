import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter, Sparkles, SlidersHorizontal, X } from 'lucide-react';
import { Product, Category } from '@/types';
import { getProducts, getCategories } from '@/lib/store';
import { ProductCard } from '@/components/ProductCard';

export const AllProductsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all');
  const [onlyAntiTarnish, setOnlyAntiTarnish] = useState(searchParams.get('antiTarnish') === 'true');
  const [priceFilter, setPriceFilter] = useState<string>(searchParams.get('maxPrice') || 'all');
  const [sortBy, setSortBy] = useState<string>('recommended');

  useEffect(() => {
    window.scrollTo(0, 0);
    Promise.all([getProducts(), getCategories()]).then(([prods, cats]) => {
      setProducts(prods);
      setCategories(cats);
    });

    const handleDataChanged = () => {
      Promise.all([getProducts(), getCategories()]).then(([prods, cats]) => {
        setProducts(prods);
        setCategories(cats);
      });
    };
    window.addEventListener('glim:data_changed', handleDataChanged);
    return () => window.removeEventListener('glim:data_changed', handleDataChanged);
  }, []);

  // Update query params
  useEffect(() => {
    const maxP = searchParams.get('maxPrice');
    if (maxP) setPriceFilter(maxP);
    const cat = searchParams.get('category');
    if (cat) setSelectedCategory(cat);
  }, [searchParams]);

  // Filter and sort products
  const filteredProducts = products.filter(p => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        p.name.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q) ||
        p.category_name?.toLowerCase().includes(q);
      if (!match) return false;
    }

    if (selectedCategory !== 'all') {
      const matchCat = p.category_id === selectedCategory || p.category_name?.toLowerCase().includes(selectedCategory.toLowerCase());
      if (!matchCat) return false;
    }

    if (onlyAntiTarnish && !p.is_anti_tarnish) {
      return false;
    }

    if (priceFilter !== 'all') {
      const maxPrice = parseFloat(priceFilter);
      if (!isNaN(maxPrice) && p.price > maxPrice) {
        return false;
      }
    }

    return true;
  });

  // Sorting
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    // In-stock items first rule
    const aInStock = a.stock > 0 && a.is_available ? 1 : 0;
    const bInStock = b.stock > 0 && b.is_available ? 1 : 0;
    if (aInStock !== bInStock) return bInStock - aInStock;

    if (sortBy === 'price-low') return a.price - b.price;
    if (sortBy === 'price-high') return b.price - a.price;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  const clearAllFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setOnlyAntiTarnish(false);
    setPriceFilter('all');
    setSortBy('recommended');
    setSearchParams({});
  };

  const hasActiveFilters =
    searchQuery || selectedCategory !== 'all' || onlyAntiTarnish || priceFilter !== 'all';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Header */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <span className="text-xs uppercase font-bold tracking-widest text-pink-600 dark:text-pink-400">
          Curated Catalog
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-stone-900 dark:text-stone-100 font-normal">
          All Products
        </h1>
        <p className="text-xs sm:text-sm text-stone-500 font-light">
          Explore all {products.length} aesthetic accessories, anti-tarnish waterproof pieces, Korean earrings, and customized hampers.
        </p>
      </div>

      {/* Search & Main Filter Controls */}
      <div className="bg-white dark:bg-stone-900 p-4 sm:p-6 rounded-2xl border border-pink-100 dark:border-stone-800 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-stone-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by jewellery name, material, or keyword..."
              className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50/50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 placeholder-stone-400 outline-none focus:ring-2 focus:ring-pink-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-3 text-stone-400 hover:text-stone-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Price Range Filter */}
          <div className="flex items-center gap-2">
            <select
              value={priceFilter}
              onChange={e => setPriceFilter(e.target.value)}
              className="py-2.5 px-3 text-xs sm:text-sm rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50/50 dark:bg-stone-800 text-stone-800 dark:text-stone-200 outline-none focus:ring-2 focus:ring-pink-500"
            >
              <option value="all">All Budgets</option>
              <option value="199">Under ₹199</option>
              <option value="299">Under ₹299</option>
              <option value="499">Under ₹499</option>
              <option value="999">Under ₹999</option>
            </select>

            {/* Sort by */}
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className="py-2.5 px-3 text-xs sm:text-sm rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50/50 dark:bg-stone-800 text-stone-800 dark:text-stone-200 outline-none focus:ring-2 focus:ring-pink-500"
            >
              <option value="recommended">In Stock First</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="newest">New Arrivals</option>
            </select>
          </div>
        </div>

        {/* Category Pills & Anti Tarnish Toggle */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-stone-100 dark:border-stone-800">
          <button
            onClick={() => setOnlyAntiTarnish(!onlyAntiTarnish)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all ${
              onlyAntiTarnish
                ? 'bg-amber-500 text-white shadow-sm ring-2 ring-amber-400'
                : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Anti-Tarnish Only</span>
          </button>

          <span className="h-4 w-px bg-stone-200 dark:bg-stone-700 mx-1 hidden sm:inline" />

          {/* Category Pills */}
          <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto py-1">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                selectedCategory === 'all'
                  ? 'bg-stone-900 text-white dark:bg-pink-600 font-semibold'
                  : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200'
              }`}
            >
              All
            </button>
            {categories.map(c => (
              <button
                key={c.id}
                onClick={() => setSelectedCategory(c.id)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors whitespace-nowrap ${
                  selectedCategory === c.id
                    ? 'bg-pink-600 text-white font-semibold shadow-sm'
                    : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-pink-50 hover:text-pink-600'
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>

          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="ml-auto text-xs text-red-500 hover:underline flex items-center gap-1 font-medium"
            >
              <X className="w-3.5 h-3.5" /> Clear filters
            </button>
          )}
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs text-stone-500">
        <span>Showing <strong>{sortedProducts.length}</strong> products</span>
        <span className="text-[11px]">In-stock items prioritized</span>
      </div>

      {/* Product Grid */}
      {sortedProducts.length === 0 ? (
        <div className="py-20 text-center space-y-3 bg-stone-50 dark:bg-stone-900 rounded-3xl p-8">
          <p className="text-lg font-serif font-medium text-stone-800 dark:text-stone-200">
            No products match your selected filters.
          </p>
          <p className="text-xs text-stone-500">Try clearing the price or category filters to see more results.</p>
          <button
            onClick={clearAllFilters}
            className="mt-3 px-6 py-2.5 bg-pink-600 text-white text-xs font-semibold rounded-xl hover:bg-pink-700 transition-colors"
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {sortedProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};
