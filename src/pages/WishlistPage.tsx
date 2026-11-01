import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ArrowRight } from 'lucide-react';
import { useWishlist } from '@/context/WishlistContext';
import { ProductCard } from '@/components/ProductCard';

export const WishlistPage: React.FC = () => {
  const { wishlistProducts, wishlistCount } = useWishlist();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="text-center max-w-xl mx-auto space-y-2">
        <div className="w-12 h-12 bg-pink-100 dark:bg-pink-950 text-pink-600 rounded-full flex items-center justify-center mx-auto">
          <Heart className="w-6 h-6 fill-pink-500 stroke-none" />
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl text-stone-900 dark:text-stone-100 font-normal">
          My Saved Wishlist
        </h1>
        <p className="text-xs sm:text-sm text-stone-500">
          {wishlistCount} item{wishlistCount === 1 ? '' : 's'} saved to your device.
        </p>
      </div>

      {wishlistProducts.length === 0 ? (
        <div className="py-16 text-center space-y-4 bg-stone-50 dark:bg-stone-900/60 rounded-3xl p-8 max-w-md mx-auto">
          <p className="text-stone-600 dark:text-stone-400 text-sm">
            You haven't saved any pieces to your wishlist yet.
          </p>
          <Link
            to="/products"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-pink-600 hover:bg-pink-700 text-white font-semibold text-xs tracking-wide transition-colors"
          >
            <span>Explore Collections</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {wishlistProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};
