import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Heart,
  Sparkles,
  ShieldAlert,
  Ruler,
  Droplet,
  Sun,
  Shield,
  Package,
  Plus,
  Minus,
  Check,
  Bell,
  ArrowLeft,
  Truck,
  ExternalLink,
} from 'lucide-react';
import { Instagram } from '@/components/Icons';
import { Product } from '@/types';
import { getProductById, getProducts } from '@/lib/store';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { SizeGuideModal } from '@/components/SizeGuideModal';
import { NotifyMeModal } from '@/components/NotifyMeModal';
import { ProductCard } from '@/components/ProductCard';

export const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});
  const [quantity, setQuantity] = useState(1);
  const [sizeModalOpen, setSizeModalOpen] = useState(false);
  const [notifyModalOpen, setNotifyModalOpen] = useState(false);
  const [validationError, setValidationError] = useState('');
  const [addedSuccess, setAddedSuccess] = useState(false);

  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  useEffect(() => {
    window.scrollTo(0, 0);
    if (!id) return;

    getProductById(id).then(prod => {
      if (prod) {
        setProduct(prod);
        setActiveImageIndex(0);
        // Pre-select first option of each variant if available
        if (prod.variants && prod.variants.length > 0) {
          const initial: Record<string, string> = {};
          prod.variants.forEach(v => {
            if (v.options && v.options.length > 0) {
              initial[v.name] = v.options[0];
            }
          });
          setSelectedVariants(initial);
        } else {
          setSelectedVariants({});
        }

        // Fetch related products (same category or anti-tarnish)
        getProducts().then(all => {
          const related = all
            .filter(p => p.id !== prod.id && (p.category_id === prod.category_id || (prod.is_anti_tarnish && p.is_anti_tarnish)))
            .slice(0, 4);
          setRelatedProducts(related);
        });
      }
    });
  }, [id]);

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <p className="text-stone-500">Loading product details...</p>
      </div>
    );
  }

  const isFavorited = isInWishlist(product.id);
  const isSoldOut = product.stock <= 0 || !product.is_available;
  const isLowStock = product.stock > 0 && product.stock <= 3;

  const handleAddToCart = () => {
    setValidationError('');

    // If product has size guide and size variant isn't picked
    if (product.size_guide_type) {
      const hasSizeOrLength = Object.keys(selectedVariants).some(
        k => k.toLowerCase().includes('size') || k.toLowerCase().includes('length') || k.toLowerCase().includes('wrist')
      );
      if (!hasSizeOrLength && product.variants && product.variants.length > 0) {
        setValidationError('Please select your size or length before adding to cart.');
        return;
      }
    }

    const success = addToCart(product, quantity, selectedVariants);
    if (success) {
      setAddedSuccess(true);
      setTimeout(() => setAddedSuccess(false), 2000);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-stone-500">
        <Link to="/" className="hover:text-pink-600 transition-colors">
          Home
        </Link>
        <span>/</span>
        <Link to="/products" className="hover:text-pink-600 transition-colors">
          Products
        </Link>
        <span>/</span>
        <span className="text-stone-800 dark:text-stone-200 font-medium truncate max-w-xs">
          {product.name}
        </span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14">
        {/* Left: Product Images Gallery */}
        <div className="space-y-4">
          <div className="relative aspect-square rounded-3xl overflow-hidden bg-stone-100 dark:bg-stone-800 border border-pink-100/80 dark:border-stone-800 shadow-sm">
            <img
              src={product.images[activeImageIndex] || product.images[0]}
              alt={product.name}
              className={`w-full h-full object-cover transition-opacity duration-300 ${
                isSoldOut ? 'grayscale contrast-75 opacity-80' : ''
              }`}
            />

            {/* Badges */}
            <div className="absolute top-4 left-4 flex flex-col gap-1.5 items-start">
              {product.is_anti_tarnish && (
                <span className="inline-flex items-center gap-1 bg-amber-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md tracking-wider uppercase">
                  <Sparkles className="w-3.5 h-3.5 fill-white" /> 100% Anti-Tarnish
                </span>
              )}
              {isLowStock && (
                <span className="inline-flex items-center bg-rose-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md animate-pulse">
                  Only {product.stock} left in stock!
                </span>
              )}
              {isSoldOut && (
                <span className="inline-flex items-center bg-stone-900 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md uppercase">
                  Sold Out
                </span>
              )}
            </div>

            {/* Wishlist toggle */}
            <button
              onClick={() => toggleWishlist(product)}
              className={`absolute top-4 right-4 p-3 rounded-full transition-all duration-200 shadow-md ${
                isFavorited
                  ? 'bg-pink-600 text-white'
                  : 'bg-white/90 dark:bg-stone-800/90 text-stone-700 dark:text-stone-200 hover:text-pink-600'
              }`}
            >
              <Heart className={`w-5 h-5 ${isFavorited ? 'fill-white stroke-none' : ''}`} />
            </button>
          </div>

          {/* Thumbnails */}
          {product.images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`w-20 h-20 rounded-xl overflow-hidden border-2 transition-all flex-shrink-0 ${
                    activeImageIndex === idx
                      ? 'border-pink-600 shadow-sm'
                      : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Product Details & Purchase Form */}
        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs uppercase font-bold tracking-widest text-pink-600 dark:text-pink-400">
                {product.category_name}
              </span>
              {product.is_anti_tarnish && (
                <span className="text-[11px] bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 font-semibold px-2 py-0.5 rounded">
                  Waterproof &amp; Sweatproof
                </span>
              )}
            </div>

            <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl text-stone-900 dark:text-stone-50 font-normal">
              {product.name}
            </h1>

            {/* Price block */}
            <div className="mt-3 flex items-baseline gap-3">
              <span className="text-2xl sm:text-3xl font-bold text-stone-900 dark:text-stone-100">
                ₹{product.price}
              </span>
              {product.old_price && (
                <>
                  <span className="text-base sm:text-lg text-stone-400 line-through">
                    ₹{product.old_price}
                  </span>
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded-full">
                    {Math.round(((product.old_price - product.price) / product.old_price) * 100)}% OFF
                  </span>
                </>
              )}
            </div>
            <p className="text-[11px] text-stone-400 mt-1">Inclusive of all taxes • No COD available</p>
          </div>

          <p className="text-stone-600 dark:text-stone-300 text-sm leading-relaxed font-light">
            {product.description}
          </p>

          {/* Instagram Reel Button if set */}
          {product.instagram_reel_url && (
            <div>
              <a
                href={product.instagram_reel_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-semibold hover:opacity-90 transition-opacity shadow-sm"
              >
                <Instagram className="w-4 h-4" />
                <span>Watch Styling Reel on Instagram</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          )}

          {/* Variants selection */}
          {product.variants && product.variants.length > 0 && (
            <div className="space-y-4 pt-2 border-t border-stone-200 dark:border-stone-800">
              {product.variants.map(variant => (
                <div key={variant.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-stone-900 dark:text-stone-100 uppercase tracking-wider">
                      {variant.name}:{' '}
                      <span className="font-normal text-pink-600 dark:text-pink-400">
                        {selectedVariants[variant.name] || 'Select'}
                      </span>
                    </label>

                    {/* Size Guide Trigger if relevant */}
                    {product.size_guide_type &&
                      (variant.name.toLowerCase().includes('size') ||
                        variant.name.toLowerCase().includes('length') ||
                        variant.name.toLowerCase().includes('wrist')) && (
                        <button
                          type="button"
                          onClick={() => setSizeModalOpen(true)}
                          className="text-xs text-pink-600 dark:text-pink-400 hover:underline flex items-center gap-1 font-medium"
                        >
                          <Ruler className="w-3.5 h-3.5" /> Size Guide
                        </button>
                      )}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {variant.options.map(opt => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() =>
                          setSelectedVariants(prev => ({ ...prev, [variant.name]: opt }))
                        }
                        className={`px-3.5 py-2 text-xs rounded-xl font-medium border transition-all ${
                          selectedVariants[variant.name] === opt
                            ? 'border-pink-600 bg-pink-50 dark:bg-pink-950/60 text-pink-700 dark:text-pink-300 font-semibold ring-1 ring-pink-600'
                            : 'border-stone-200 dark:border-stone-700 hover:border-stone-400 text-stone-700 dark:text-stone-300'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Standalone Size guide button if not inside variants */}
          {product.size_guide_type && (!product.variants || product.variants.length === 0) && (
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setSizeModalOpen(true)}
                className="text-xs text-pink-600 dark:text-pink-400 hover:underline flex items-center gap-1 font-semibold"
              >
                <Ruler className="w-4 h-4" /> View Size &amp; Length Guide
              </button>
            </div>
          )}

          {validationError && (
            <p className="text-xs text-red-500 font-medium bg-red-50 dark:bg-red-950/50 p-2.5 rounded-xl border border-red-200 dark:border-red-900">
              {validationError}
            </p>
          )}

          {/* Quantity & Add to Cart Controls */}
          <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
            {!isSoldOut && (
              <div className="flex items-center border border-stone-300 dark:border-stone-700 rounded-xl overflow-hidden bg-stone-50 dark:bg-stone-800 h-12 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="px-3.5 py-2 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-600 dark:text-stone-300"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="px-4 text-sm font-semibold text-stone-800 dark:text-stone-100">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}
                  className="px-3.5 py-2 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-600 dark:text-stone-300"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            )}

            {isSoldOut ? (
              <button
                type="button"
                onClick={() => setNotifyModalOpen(true)}
                className="flex-1 w-full h-12 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-semibold text-sm flex items-center justify-center gap-2 transition-colors"
              >
                <Bell className="w-4 h-4" />
                <span>Sold Out • Notify Me on WhatsApp</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={addedSuccess}
                className={`flex-1 w-full h-12 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg ${
                  addedSuccess
                    ? 'bg-emerald-600 text-white'
                    : 'bg-pink-600 hover:bg-pink-700 text-white'
                }`}
              >
                {addedSuccess ? (
                  <>
                    <Check className="w-5 h-5" /> Added to Cart!
                  </>
                ) : (
                  <>Add to Cart • ₹{product.price * quantity}</>
                )}
              </button>
            )}
          </div>

          {/* VERY VISIBLE NO-RETURN RULES NOTICE (MANDATORY REQUIREMENT) */}
          <div className="p-4 rounded-2xl bg-amber-50/90 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 space-y-2">
            <div className="flex items-center gap-2 text-amber-900 dark:text-amber-200 font-bold text-xs">
              <ShieldAlert className="w-4 h-4 text-amber-600 flex-shrink-0" />
              <span>STRICT STORE POLICY: NO COD • NO RETURNS • NO REFUNDS</span>
            </div>
            <p className="text-[11px] text-amber-800 dark:text-amber-300/90 leading-relaxed">
              Every parcel is recorded on camera during packing and verified against defects before shipping from our Pondicherry store. Please check sizes carefully before placing your order.
            </p>
          </div>

          {/* CARE TIPS BOX (MANDATORY REQUIREMENT) */}
          <div className="p-5 rounded-2xl bg-pink-50/50 dark:bg-stone-800/50 border border-pink-100 dark:border-stone-800 space-y-3">
            <h4 className="font-serif font-semibold text-sm text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-pink-600 dark:text-pink-400" />
              <span>Care Tips for Lasting Shine</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-stone-600 dark:text-stone-400">
              <div className="flex items-center gap-2">
                <span className="text-base">💧</span>
                <span>Keep dry after contact with water</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-base">🚿</span>
                <span>Remove before bathing or swimming</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-base">🧴</span>
                <span>Avoid direct perfume and lotion sprays</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-base">🎀</span>
                <span>Store in an airtight soft pouch</span>
              </div>
              <div className="flex items-center gap-2 sm:col-span-2">
                <span className="text-base">✨</span>
                <span>Wipe gently with a soft microfiber cloth</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* "YOU MAY ALSO LIKE" SECTION */}
      {relatedProducts.length > 0 && (
        <section className="pt-12 border-t border-stone-200 dark:border-stone-800 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs uppercase font-bold tracking-wider text-pink-600 dark:text-pink-400">
                Recommended for you
              </span>
              <h3 className="font-serif text-2xl text-stone-900 dark:text-stone-100 font-normal mt-0.5">
                You May Also Like
              </h3>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
            {relatedProducts.map(rel => (
              <ProductCard key={rel.id} product={rel} />
            ))}
          </div>
        </section>
      )}

      {/* Modals */}
      <SizeGuideModal
        type={product.size_guide_type || 'chain'}
        isOpen={sizeModalOpen}
        onClose={() => setSizeModalOpen(false)}
      />
      <NotifyMeModal
        product={product}
        isOpen={notifyModalOpen}
        onClose={() => setNotifyModalOpen(false)}
      />
    </div>
  );
};
