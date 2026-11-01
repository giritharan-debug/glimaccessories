import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Sparkles, Filter } from 'lucide-react';
import { Product, Category } from '@/types';
import { getCategories, getProducts } from '@/lib/store';
import { ProductCard } from '@/components/ProductCard';

export const CategoryPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [category, setCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [sortBy, setSortBy] = useState<'recommended' | 'price-low' | 'price-high'>('recommended');

  useEffect(() => {
    window.scrollTo(0, 0);
    Promise.all([getCategories(), getProducts()]).then(([cats, prods]) => {
      const foundCat = cats.find(c => c.slug === slug || c.id === slug);
      if (foundCat) {
        setCategory(foundCat);
        const filtered = prods.filter(p => p.category_id === foundCat.id || p.category_name === foundCat.name);
        setProducts(filtered);
      }
    });
  }, [slug]);

  const sortedProducts = [...products].sort((a, b) => {
    const aInStock = a.stock > 0 && a.is_available ? 1 : 0;
    const bInStock = b.stock > 0 && b.is_available ? 1 : 0;
    if (aInStock !== bInStock) return bInStock - aInStock;

    if (sortBy === 'price-low') return a.price - b.price;
    if (sortBy === 'price-high') return b.price - a.price;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-stone-500">
        <Link to="/" className="hover:text-pink-600 transition-colors">
          Home
        </Link>
        <span>/</span>
        <Link to="/products" className="hover:text-pink-600 transition-colors">
          Categories
        </Link>
        <span>/</span>
        <span className="text-stone-800 dark:text-stone-200 font-medium">
          {category?.name || slug}
        </span>
      </nav>

      {/* Category Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-pink-100 via-cream-100 to-rose-100 dark:from-stone-900 dark:to-stone-950 p-8 sm:p-12 border border-pink-200 dark:border-stone-800 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-3 text-center md:text-left z-10">
          <span className="text-xs uppercase font-bold tracking-widest text-pink-600 dark:text-pink-400">
            Category Collection
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-stone-900 dark:text-stone-100 font-normal">
            {category?.name || slug}
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 max-w-lg font-light">
            Showing {products.length} exclusive pieces crafted for elegance and everyday confidence.
          </p>
        </div>

        {category?.image && (
          <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full overflow-hidden border-4 border-white dark:border-stone-800 shadow-xl flex-shrink-0">
            <img src={category.image} alt={category.name} className="w-full h-full object-cover" />
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between text-xs text-stone-500">
        <span>{sortedProducts.length} items found</span>
        <div className="flex items-center gap-2">
          <span>Sort by:</span>
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value as any)}
            className="py-1.5 px-3 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-200 outline-none"
          >
            <option value="recommended">In Stock First</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
          </select>
        </div>
      </div>

      {/* Products Grid */}
      {sortedProducts.length === 0 ? (
        <div className="py-20 text-center space-y-3 bg-stone-50 dark:bg-stone-900 rounded-3xl p-8">
          <p className="text-stone-600 dark:text-stone-400 text-sm">
            No products currently in this category.
          </p>
          <Link
            to="/products"
            className="inline-block px-5 py-2.5 rounded-xl bg-pink-600 text-white text-xs font-semibold"
          >
            Browse All Products
          </Link>
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
