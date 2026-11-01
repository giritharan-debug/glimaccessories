import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, Sparkles, Bell, Check } from 'lucide-react';
import { Product } from '@/types';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { NotifyMeModal } from './NotifyMeModal';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const [notifyModalOpen, setNotifyModalOpen] = useState(false);
  const [justAdded, setJustAdded] = useState(false);
  const navigate = useNavigate();

  const isFavorited = isInWishlist(product.id);
  const isSoldOut = product.stock <= 0 || !product.is_available;
  const isLowStock = product.stock > 0 && product.stock <= 3;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // If product has size guide or variants, redirect to product page to let them choose accurately
    if ((product.variants && product.variants.length > 0) || product.size_guide_type) {
      navigate(`/product/${product.id}`);
      return;
    }

    const success = addToCart(product, 1);
    if (success) {
      setJustAdded(true);
      setTimeout(() => setJustAdded(false), 1500);
    }
  };

  const handleNotifyMe = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setNotifyModalOpen(true);
  };

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
  };

  return (
    <>
      <div className="group relative flex flex-col bg-white dark:bg-stone-900 rounded-xl overflow-hidden border border-pink-100/70 dark:border-stone-800 transition-all duration-300 hover:shadow-lg">
        {/* Image Container */}
        <Link to={`/product/${product.id}`} className="relative aspect-square overflow-hidden bg-stone-100 dark:bg-stone-800 block">
          <img
            src={product.images[0] || 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600'}
            alt={product.name}
            className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${
              isSoldOut ? 'grayscale contrast-75 opacity-70' : ''
            }`}
            loading="lazy"
          />

          {/* Badges Overlay */}
          <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 items-start z-10">
            {product.is_anti_tarnish && (
              <span className="inline-flex items-center gap-1 bg-amber-500/95 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm tracking-wider uppercase">
                <Sparkles className="w-2.5 h-2.5 fill-white" /> Anti-Tarnish
              </span>
            )}
            {isLowStock && (
              <span className="inline-flex items-center bg-rose-600 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm tracking-wide animate-pulse">
                Only {product.stock} left!
              </span>
            )}
            {isSoldOut && (
              <span className="inline-flex items-center bg-stone-900/90 text-stone-200 text-[10px] font-bold px-2 py-0.5 rounded shadow-sm uppercase tracking-wider">
                Sold Out
              </span>
            )}
          </div>

          {/* Wishlist Heart Button */}
          <button
            onClick={handleWishlistClick}
            className={`absolute top-2.5 right-2.5 p-2 rounded-full transition-all duration-200 shadow-sm ${
              isFavorited
                ? 'bg-pink-600 text-white scale-110'
                : 'bg-white/80 dark:bg-stone-800/80 text-stone-700 dark:text-stone-200 hover:bg-white hover:text-pink-600'
            }`}
            aria-label="Save to wishlist"
          >
            <Heart className={`w-4 h-4 ${isFavorited ? 'fill-white stroke-none' : ''}`} />
          </button>
        </Link>

        {/* Content Section (Matching Screenshot Style) */}
        <div className="p-3.5 sm:p-4 flex flex-col flex-1 justify-between text-center">
          <div>
            <Link
              to={`/product/${product.id}`}
              className="text-stone-900 dark:text-stone-100 font-serif text-sm sm:text-base font-normal line-clamp-2 hover:text-pink-600 dark:hover:text-pink-400 transition-colors"
            >
              {product.name}
            </Link>

            {/* Price section matching screenshot (e.g. Rs. 89.00) */}
            <div className="mt-1.5 flex items-center justify-center gap-2">
              <span className="text-stone-900 dark:text-stone-100 font-semibold text-sm sm:text-base">
                Rs. {product.price.toFixed(2)}
              </span>
              {product.old_price && (
                <span className="text-stone-400 text-xs line-through">
                  Rs. {product.old_price.toFixed(2)}
                </span>
              )}
            </div>
          </div>

          {/* Button matching screenshot: Clean Bordered "Add to cart" or "Sold out" / "Notify me" */}
          <div className="mt-3">
            {isSoldOut ? (
              <button
                onClick={handleNotifyMe}
                className="w-full py-2 px-3 border border-stone-800 dark:border-stone-400 text-stone-800 dark:text-stone-200 hover:bg-stone-900 hover:text-white dark:hover:bg-stone-100 dark:hover:text-stone-900 text-xs sm:text-sm font-medium transition-colors flex items-center justify-center gap-1.5 rounded-sm"
              >
                <Bell className="w-3.5 h-3.5" /> Notify me
              </button>
            ) : (
              <button
                onClick={handleAddToCart}
                disabled={justAdded}
                className={`w-full py-2 px-3 border border-stone-900 dark:border-stone-100 text-stone-900 dark:text-stone-100 hover:bg-stone-900 hover:text-white dark:hover:bg-white dark:hover:text-stone-900 text-xs sm:text-sm font-medium transition-colors rounded-sm flex items-center justify-center gap-1 ${
                  justAdded ? 'bg-pink-600 text-white border-pink-600' : ''
                }`}
              >
                {justAdded ? (
                  <>
                    <Check className="w-4 h-4" /> Added!
                  </>
                ) : (product.variants && product.variants.length > 0) || product.size_guide_type ? (
                  'Select Options'
                ) : (
                  'Add to cart'
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      <NotifyMeModal
        product={product}
        isOpen={notifyModalOpen}
        onClose={() => setNotifyModalOpen(false)}
      />
    </>
  );
};
