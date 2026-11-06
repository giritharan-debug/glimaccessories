import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Star,
  Quote,
  ShieldCheck,
  Package,
  MapPin,
  Gift,
  ExternalLink,
  Heart,
  Eye,
  CheckCircle,
} from 'lucide-react';
import { Instagram } from '@/components/Icons';
import { Product, Category, Review } from '@/types';
import { getCategories, getProducts, getReviews, getSiteSettings } from '@/lib/store';
import { ProductCard } from '@/components/ProductCard';

export const HomePage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [settings, setSettings] = useState<any>(null);

  // Reviews carousel state
  const [currentReviewIndex, setCurrentReviewIndex] = useState(0);
  const [selectedReviewImage, setSelectedReviewImage] = useState<string | null>(null);

  // Category carousels pagination index mapping
  const [carouselIndices, setCarouselIndices] = useState<Record<string, number>>({});

  useEffect(() => {
    const loadAll = async () => {
      const [cats, prods, revs, sett] = await Promise.all([
        getCategories(),
        getProducts(),
        getReviews(),
        getSiteSettings(),
      ]);
      setCategories(cats);
      setProducts(prods);
      setReviews(revs);
      setSettings(sett);
    };

    loadAll();

    const handleDataChanged = () => loadAll();
    window.addEventListener('glim:data_changed', handleDataChanged);
    return () => window.removeEventListener('glim:data_changed', handleDataChanged);
  }, []);

  // Filter top categories to display carousels for (Anti Tarnish Chains, Kadas, Earrings, Rings, Korean, Men's, Combos)
  const featuredCategories = categories
    .filter(c => !c.is_hidden)
    .slice(0, 6);

  // Helper: sort in-stock items first, sold-out last
  const getSortedProductsForCategory = (catId: string) => {
    const list = products.filter(p => p.category_id === catId);
    return list.sort((a, b) => {
      const aInStock = a.stock > 0 && a.is_available ? 1 : 0;
      const bInStock = b.stock > 0 && b.is_available ? 1 : 0;
      return bInStock - aInStock; // 1 before 0
    });
  };

  const handleCarouselScroll = (catId: string, direction: 'prev' | 'next', totalItems: number) => {
    setCarouselIndices(prev => {
      const current = prev[catId] || 0;
      const nextIndex =
        direction === 'next'
          ? Math.min(totalItems - 1, current + 1)
          : Math.max(0, current - 1);
      return { ...prev, [catId]: nextIndex };
    });
  };

  const activeReviews = reviews.filter(r => !r.is_hidden);

  return (
    <div className="space-y-10 sm:space-y-14 pb-16 pt-2 sm:pt-4">
      {/* 1. CATEGORY CIRCULAR AVATARS & CATEGORIES (At the Top) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Round Avatar Highlights: All Jewellery, Anti-Tarnish, Men's, Gifts, Korean, Hair Claws */}
        <div className="flex items-center justify-start sm:justify-center gap-5 sm:gap-8 overflow-x-auto pb-4 pt-2 scrollbar-none">
          {[
            {
              title: 'All Jewellery',
              link: '/products',
              img: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=300&auto=format&fit=crop&q=80',
            },
            {
              title: 'Anti-Tarnish',
              link: '/category/anti-tarnish-chains',
              img: 'https://images.unsplash.com/photo-1599643477877-530eb83abc8e?w=300&auto=format&fit=crop&q=80',
            },
            {
              title: "Men's",
              link: '/mens',
              img: 'https://images.unsplash.com/photo-1617038220319-276d3cfab638?w=300&auto=format&fit=crop&q=80',
            },
            {
              title: 'Gifts & Hampers',
              link: '/gifts',
              img: 'https://images.unsplash.com/photo-1513201099705-a9746e1e201f?w=300&auto=format&fit=crop&q=80',
            },
            {
              title: 'Korean Style',
              link: '/category/korean-earrings',
              img: 'https://images.unsplash.com/photo-1588444837495-c6cfeb53f32d?w=300&auto=format&fit=crop&q=80',
            },
            {
              title: 'Hair Claws',
              link: '/category/clips',
              img: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=300&auto=format&fit=crop&q=80',
            },
          ].map((item, idx) => (
            <Link
              key={idx}
              to={item.link}
              className="group flex flex-col items-center flex-shrink-0 text-center space-y-2"
            >
              <div className="w-18 h-18 sm:w-22 sm:h-22 md:w-24 md:h-24 rounded-full p-1 border-2 border-pink-400 dark:border-pink-500/80 transition-transform duration-300 group-hover:scale-105 shadow-sm bg-white dark:bg-stone-900">
                <img
                  src={item.img}
                  alt={item.title}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=300&auto=format&fit=crop&q=80';
                  }}
                  className="w-full h-full object-cover rounded-full"
                />
              </div>
              <span className="font-serif text-xs sm:text-sm font-medium text-stone-800 dark:text-stone-200 group-hover:text-pink-600 transition-colors whitespace-nowrap">
                {item.title}
              </span>
            </Link>
          ))}
        </div>

        {/* Categories Section Heading */}
        <div className="mt-8 mb-6 flex items-center justify-between">
          <h2 className="font-serif text-2xl sm:text-3xl text-stone-900 dark:text-stone-100 font-normal">
            Categories
          </h2>
          <Link
            to="/products"
            className="text-xs sm:text-sm font-medium text-pink-600 dark:text-pink-400 hover:underline flex items-center gap-1"
          >
            <span>View all 17 categories</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {/* 2-Column / 4-Column Category Cards Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {categories.slice(0, 8).map(category => (
            <Link
              key={category.id}
              to={`/category/${category.slug}`}
              className="group relative rounded-2xl overflow-hidden bg-stone-100 dark:bg-stone-800 aspect-[4/5] flex flex-col justify-end p-4 border border-pink-100/60 dark:border-stone-800 shadow-sm hover:shadow-md transition-all duration-300"
            >
              <img
                src={category.image}
                alt={category.name}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&auto=format&fit=crop&q=80';
                }}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950/75 via-stone-950/20 to-transparent" />
              <div className="relative z-10 flex items-center justify-between">
                <h3 className="font-serif text-sm sm:text-base font-medium text-white group-hover:text-pink-200 transition-colors">
                  {category.name}
                </h3>
                <span className="text-white group-hover:translate-x-1 transition-transform">
                  ➔
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 2. HERO BANNER */}
      <section className="relative overflow-hidden bg-gradient-to-r from-pink-50 via-cream-100 to-rose-50 dark:from-stone-900 dark:via-stone-900 dark:to-stone-950 border-y border-pink-100 dark:border-stone-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 lg:py-20 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div className="space-y-6 text-center lg:text-left z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-pink-100 dark:bg-pink-950/80 text-pink-700 dark:text-pink-300 text-xs font-semibold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Pondicherry's Favourite Jewellery Haven</span>
            </div>

            <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl text-stone-900 dark:text-stone-50 font-normal tracking-tight leading-tight">
              Anti-Tarnish Staples &amp; <span className="font-cursive text-pink-600 dark:text-pink-400 block text-4xl sm:text-6xl lg:text-7xl mt-1">Aesthetic Jewellery</span>
            </h1>

            <p className="text-stone-600 dark:text-stone-300 text-sm sm:text-base max-w-xl mx-auto lg:mx-0 leading-relaxed font-light">
              Waterproof, sweatproof 18K gold-plated chains, kadas, statement rings, Korean earrings &amp; fairy-lit gift hampers. Wear daily without turning green.
            </p>

            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3.5 pt-2">
              <Link
                to="/products"
                className="px-6 sm:px-8 py-3.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white dark:bg-pink-600 dark:hover:bg-pink-700 text-xs sm:text-sm font-semibold tracking-wide transition-all shadow-md hover:shadow-lg flex items-center gap-2"
              >
                <span>Shop All Products</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/category/anti-tarnish-chains"
                className="px-6 sm:px-8 py-3.5 rounded-xl bg-white dark:bg-stone-800 hover:bg-pink-50 dark:hover:bg-stone-700 text-stone-900 dark:text-stone-100 text-xs sm:text-sm font-semibold border border-pink-200 dark:border-stone-700 transition-all flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>Anti-Tarnish Chains</span>
              </Link>
            </div>

            {/* Micro assurance tags */}
            <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-4 text-xs text-stone-500 dark:text-stone-400">
              <span className="flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-emerald-500" /> 100% Waterproof
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-emerald-500" /> Shipped with Packing Proof
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-emerald-500" /> From Pondicherry
              </span>
            </div>
          </div>

          {/* Hero Image Showcase */}
          <div className="relative flex justify-center lg:justify-end">
            <div className="relative w-full max-w-md aspect-square rounded-3xl overflow-hidden shadow-2xl border-4 border-white dark:border-stone-800">
              <img
                src="https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=1200&auto=format&fit=crop&q=85"
                alt="Glim Accessories Aesthetic Jewellery"
                className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent flex items-end p-6">
                <div className="text-white">
                  <span className="text-xs uppercase tracking-widest text-pink-300 font-semibold">
                    Starting at just ₹99
                  </span>
                  <p className="font-serif text-xl sm:text-2xl font-medium mt-0.5">
                    18K Gold Plated Luxury
                  </p>
                </div>
              </div>
            </div>

            {/* Floating Pink Badge */}
            <div className="absolute -bottom-4 -left-2 sm:left-4 bg-white dark:bg-stone-800 p-3.5 rounded-2xl shadow-xl border border-pink-100 dark:border-stone-700 flex items-center gap-3 animate-bounce">
              <div className="w-10 h-10 rounded-full bg-pink-100 dark:bg-pink-950 flex items-center justify-center text-pink-600 dark:text-pink-400 font-bold">
                ✨
              </div>
              <div>
                <p className="text-xs font-bold text-stone-900 dark:text-stone-100">Anti-Tarnish Tested</p>
                <p className="text-[10px] text-stone-500">Won't turn green or black</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. "SHOP BY PRICE" TILES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <span className="text-xs uppercase font-bold tracking-widest text-pink-600 dark:text-pink-400">
            Pocket Friendly Chic
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl text-stone-900 dark:text-stone-100 font-normal mt-1">
            Shop by Price
          </h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
          {[
            { label: 'Under ₹199', maxPrice: 199, desc: 'Clips, Studs & Cuffs', color: 'from-pink-50 to-pink-100' },
            { label: 'Under ₹299', maxPrice: 299, desc: 'Dainty Chains & Rings', color: 'from-rose-50 to-pink-50' },
            { label: 'Under ₹499', maxPrice: 499, desc: 'Heavy Kadas & Watches', color: 'from-amber-50 to-rose-50' },
            { label: 'Under ₹999', maxPrice: 999, desc: 'Gift Boxes & Hampers', color: 'from-purple-50 to-pink-50' },
          ].map((tile, i) => (
            <Link
              key={i}
              to={`/products?maxPrice=${tile.maxPrice}`}
              className="group p-5 rounded-2xl border border-pink-200 dark:border-stone-800 bg-gradient-to-br dark:from-stone-800 dark:to-stone-900 shadow-sm hover:shadow-md transition-all duration-300 text-center flex flex-col justify-between items-center"
            >
              <div>
                <span className="text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider block">
                  Budget Find
                </span>
                <h3 className="font-serif text-xl sm:text-2xl font-bold text-stone-900 dark:text-stone-100 group-hover:text-pink-600 dark:group-hover:text-pink-400 transition-colors mt-1">
                  {tile.label}
                </h3>
                <p className="text-xs text-stone-600 dark:text-stone-400 mt-1 font-light">
                  {tile.desc}
                </p>
              </div>

              <div className="mt-4 px-4 py-1.5 rounded-full bg-stone-900 dark:bg-stone-700 text-white text-[11px] font-semibold group-hover:bg-pink-600 transition-colors">
                Explore Now
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 4. MEN'S SECTION BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden shadow-xl border border-stone-800 bg-stone-900 text-white">
          <div className="grid grid-cols-1 md:grid-cols-2 items-center">
            <div className="p-8 sm:p-12 lg:p-16 space-y-5 z-10">
              <span className="inline-block text-xs uppercase tracking-widest text-pink-400 font-bold bg-pink-950/60 px-3 py-1 rounded-full border border-pink-800/40">
                Glim Men's Line
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-medium tracking-tight">
                Rugged Elegance for Him
              </h2>
              <p className="text-stone-300 text-sm sm:text-base leading-relaxed font-light">
                Discover heavy Cuban curb chains, titanium signet rings, stud earrings, and minimalist Roman dial mesh watches. Sweatproof and workout-friendly.
              </p>
              <div className="pt-2">
                <Link
                  to="/mens"
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-white hover:bg-pink-50 text-stone-900 font-semibold text-xs sm:text-sm tracking-wide transition-all shadow-md"
                >
                  <span>Explore Men's Collection</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            <div className="h-64 sm:h-80 md:h-full relative overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1617038220319-276d3cfab638?w=900&auto=format&fit=crop&q=80"
                alt="Men's Jewellery Collection"
                className="w-full h-full object-cover object-center transform hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-stone-900 via-stone-900/40 to-transparent md:block hidden" />
            </div>
          </div>
        </div>
      </section>

      {/* 5. GIFTS BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden shadow-xl border border-pink-200 dark:border-stone-800 bg-gradient-to-r from-pink-100 via-cream-100 to-rose-100 dark:from-stone-900 dark:to-stone-950">
          <div className="grid grid-cols-1 md:grid-cols-2 items-center">
            <div className="order-2 md:order-1 h-64 sm:h-80 md:h-full relative overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1513201099705-a9746e1e201f?w=900&auto=format&fit=crop&q=80"
                alt="Aesthetic Gift Hampers"
                className="w-full h-full object-cover object-center transform hover:scale-105 transition-transform duration-700"
              />
            </div>

            <div className="order-1 md:order-2 p-8 sm:p-12 lg:p-16 space-y-5 text-stone-900 dark:text-stone-100">
              <span className="inline-block text-xs uppercase tracking-widest text-pink-600 dark:text-pink-400 font-bold bg-pink-200/60 dark:bg-pink-950/60 px-3 py-1 rounded-full border border-pink-300 dark:border-pink-800/40">
                Gift Sets &amp; Hampers
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-medium tracking-tight">
                Celebrate Every Milestone
              </h2>
              <p className="text-stone-600 dark:text-stone-300 text-sm sm:text-base leading-relaxed font-light">
                Curated gift boxes for Birthdays, Besties, Anniversaries, and apologies. Complete with fairy lights, satin scrunchies, and a complimentary handwritten gift note!
              </p>
              <div className="pt-2">
                <Link
                  to="/gifts"
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-pink-600 hover:bg-pink-700 text-white font-semibold text-xs sm:text-sm tracking-wide transition-all shadow-md"
                >
                  <Gift className="w-4 h-4" />
                  <span>Shop Gift Hampers by Occasion</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. CATEGORY CAROUSELS (Matching Reference Screenshot e.g. "Chain Collections" with View All & In-stock first) */}
      <section className="space-y-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {featuredCategories.map(category => {
          const sortedProducts = getSortedProductsForCategory(category.id);
          if (sortedProducts.length === 0) return null;

          return (
            <div key={category.id} className="space-y-5">
              {/* Category Header with "View all" pill button matching screenshot */}
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-stone-200 dark:border-stone-800 pb-4">
                <div>
                  <span className="text-xs uppercase font-bold tracking-wider text-pink-600 dark:text-pink-400">
                    Curated Collection
                  </span>
                  <h3 className="font-serif text-2xl sm:text-3xl text-stone-900 dark:text-stone-100 font-normal mt-0.5">
                    {category.name}
                  </h3>
                </div>

                <div className="flex items-center gap-3">
                  <Link
                    to={`/category/${category.slug}`}
                    className="px-5 py-2 bg-stone-900 hover:bg-stone-800 text-white dark:bg-stone-100 dark:hover:bg-white dark:text-stone-900 text-xs font-semibold uppercase tracking-wider rounded-sm transition-colors"
                  >
                    View all
                  </Link>
                </div>
              </div>

              {/* Product Grid / Carousel: in-stock items first, sold-out last */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                {sortedProducts.slice(0, 4).map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {/* Bottom "View all" button if more items */}
              {sortedProducts.length > 4 && (
                <div className="text-center pt-2">
                  <Link
                    to={`/category/${category.slug}`}
                    className="inline-block px-8 py-2.5 bg-stone-900 hover:bg-stone-800 text-white dark:bg-stone-800 dark:hover:bg-stone-700 text-xs font-semibold uppercase tracking-wider rounded-sm transition-colors"
                  >
                    View all {sortedProducts.length} items in {category.name}
                  </Link>
                </div>
              )}
            </div>
          );
        })}
      </section>

      {/* 7. CUSTOMER REVIEWS (Matching Screenshot Style "What Our Customers Say (Click Image to view it full)") */}
      <section className="bg-stone-50 dark:bg-stone-900/60 py-16 border-y border-pink-100 dark:border-stone-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-6">
          <div>
            <h2 className="font-serif text-2xl sm:text-4xl text-stone-900 dark:text-stone-100 font-normal">
              What Our Customers Say
            </h2>
            <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-1">
              (Click Image to view it full)
            </p>
          </div>

          {activeReviews.length > 0 && (
            <div className="relative bg-white dark:bg-stone-900 rounded-3xl p-6 sm:p-10 shadow-lg border border-pink-100 dark:border-stone-800 transition-all duration-300">
              {/* Pink quotation icon matching screenshot */}
              <div className="flex justify-center text-pink-300 dark:text-pink-600 mb-3">
                <Quote className="w-10 h-10 fill-pink-200 dark:fill-pink-900 stroke-none" />
              </div>

              {/* Review Text in elegant italic/serif matching screenshot */}
              <blockquote className="font-serif italic text-base sm:text-xl text-stone-700 dark:text-stone-200 max-w-2xl mx-auto leading-relaxed">
                "{activeReviews[currentReviewIndex].review_text}"
              </blockquote>

              {/* Star Rating */}
              <div className="flex justify-center items-center gap-1 my-4">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < activeReviews[currentReviewIndex].rating
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-stone-300'
                    }`}
                  />
                ))}
              </div>

              {/* Square Image Thumbnail with Pink rounded border matching screenshot */}
              {activeReviews[currentReviewIndex].photo_url && (
                <div className="my-5 flex justify-center">
                  <div
                    onClick={() => setSelectedReviewImage(activeReviews[currentReviewIndex].photo_url!)}
                    className="cursor-pointer group relative p-1 rounded-2xl border-2 border-pink-400 dark:border-pink-600 hover:scale-105 transition-transform"
                    title="Click image to view full size"
                  >
                    <img
                      src={activeReviews[currentReviewIndex].photo_url}
                      alt="Customer review photo"
                      className="w-24 h-24 sm:w-28 sm:h-28 object-cover rounded-xl bg-stone-100"
                    />
                    <div className="absolute inset-0 bg-black/30 rounded-xl opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white">
                      <Eye className="w-5 h-5" />
                    </div>
                  </div>
                </div>
              )}

              {/* Customer Name & Location */}
              <div className="space-y-1">
                <h4 className="font-serif font-bold text-stone-900 dark:text-stone-100 text-sm sm:text-base">
                  {activeReviews[currentReviewIndex].customer_name}
                </h4>
                <p className="text-xs text-stone-500">
                  {activeReviews[currentReviewIndex].city}
                </p>
                {activeReviews[currentReviewIndex].product_name && (
                  <p className="text-xs text-pink-600 dark:text-pink-400 font-medium">
                    Verified purchase: {activeReviews[currentReviewIndex].product_name}
                  </p>
                )}
              </div>

              {/* Carousel navigation controls & dots matching screenshot */}
              <div className="flex items-center justify-center gap-4 mt-8">
                <button
                  onClick={() =>
                    setCurrentReviewIndex(prev => (prev - 1 + activeReviews.length) % activeReviews.length)
                  }
                  className="w-8 h-8 rounded-full border border-stone-300 dark:border-stone-700 flex items-center justify-center text-stone-600 dark:text-stone-300 hover:bg-pink-50 hover:text-pink-600 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {/* Dots indicator with active pink dot */}
                <div className="flex items-center gap-1.5">
                  {activeReviews.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentReviewIndex(idx)}
                      className={`h-2.5 rounded-full transition-all duration-300 ${
                        idx === currentReviewIndex
                          ? 'w-6 bg-pink-600'
                          : 'w-2.5 bg-stone-300 dark:bg-stone-700'
                      }`}
                      aria-label={`Go to slide ${idx + 1}`}
                    />
                  ))}
                </div>

                <button
                  onClick={() => setCurrentReviewIndex(prev => (prev + 1) % activeReviews.length)}
                  className="w-8 h-8 rounded-full border border-stone-300 dark:border-stone-700 flex items-center justify-center text-stone-600 dark:text-stone-300 hover:bg-pink-50 hover:text-pink-600 transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Review Image Modal */}
      {selectedReviewImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={() => setSelectedReviewImage(null)}
        >
          <div className="relative max-w-xl max-h-[85vh] p-2 bg-white dark:bg-stone-900 rounded-2xl overflow-hidden shadow-2xl">
            <img
              src={selectedReviewImage}
              alt="Full size customer proof"
              className="w-full h-full object-contain rounded-xl"
            />
            <p className="text-center text-xs text-stone-500 py-2">Click anywhere to close</p>
          </div>
        </div>
      )}

      {/* 8. "WHY GLIM" STRIP (anti-tarnish, packed with care, shipped from Pondicherry) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-pink-50 to-cream-100 dark:from-stone-900 dark:to-stone-950 border border-pink-200 dark:border-stone-800">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs uppercase font-bold tracking-widest text-pink-600 dark:text-pink-400">
              The Glim Standard
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl text-stone-900 dark:text-stone-100 font-normal mt-1">
              Why Customers Love Glim Accessories
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center sm:text-left">
            <div className="p-6 rounded-2xl bg-white dark:bg-stone-900 border border-pink-100 dark:border-stone-800 shadow-sm space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto sm:mx-0">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="font-serif font-semibold text-lg text-stone-900 dark:text-stone-100">
                100% Anti-Tarnish Guarantee
              </h3>
              <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed font-light">
                Our waterproof chains and kadas use thick 18K PVD gold coating over stainless steel. Resistant to water, sweat, lotion &amp; coastal moisture.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-stone-900 border border-pink-100 dark:border-stone-800 shadow-sm space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-pink-100 dark:bg-pink-950/80 text-pink-600 dark:text-pink-400 flex items-center justify-center mx-auto sm:mx-0">
                <Package className="w-6 h-6" />
              </div>
              <h3 className="font-serif font-semibold text-lg text-stone-900 dark:text-stone-100">
                Packed with Care &amp; Video Proof
              </h3>
              <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed font-light">
                Each parcel is lovingly packed with bubble protection, cute stickers, and an inspection proof video uploaded to your tracking page!
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-stone-900 border border-pink-100 dark:border-stone-800 shadow-sm space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto sm:mx-0">
                <MapPin className="w-6 h-6" />
              </div>
              <h3 className="font-serif font-semibold text-lg text-stone-900 dark:text-stone-100">
                Shipped Direct from Pondicherry
              </h3>
              <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed font-light">
                Dispatched directly from our heritage boutique located on Romand Rolland Street, opposite Dune Cafe in Pondicherry.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 9. VISIT OUR STORE SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl overflow-hidden border border-pink-100 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-xl grid grid-cols-1 lg:grid-cols-2">
          {/* Store Info */}
          <div className="p-8 sm:p-12 space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-1.5 text-xs uppercase font-bold tracking-widest text-pink-600 dark:text-pink-400">
                <MapPin className="w-4 h-4" />
                <span>Boutique Flagship</span>
              </div>
              <h2 className="font-serif text-3xl sm:text-4xl text-stone-900 dark:text-stone-100 font-normal">
                Visit Our Pondicherry Store
              </h2>
              <p className="text-stone-600 dark:text-stone-300 text-sm leading-relaxed font-light">
                Visiting French town Pondicherry? Drop by our physical boutique to try on chains, inspect anti-tarnish pieces in person, or pick up customized birthday hampers!
              </p>

              <div className="pt-2 space-y-2 text-sm text-stone-700 dark:text-stone-300">
                <p className="font-medium text-stone-900 dark:text-stone-100">
                  📍 Romand Rolland St, opp. Dune Cafe, Pondicherry - 605001
                </p>
                <p className="text-xs text-stone-500">
                  Timings: Monday - Sunday, 10:30 AM to 9:00 PM
                </p>
                <p className="text-xs text-stone-500">
                  Phone / WhatsApp: +91 8523996310
                </p>
              </div>
            </div>

            <div className="pt-4 flex flex-wrap gap-3">
              <a
                href={settings?.google_maps_url || 'https://maps.google.com/?q=Romand+Rolland+St,+opp.+Dune+Cafe,+Pondicherry'}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 rounded-xl bg-pink-600 hover:bg-pink-700 text-white font-semibold text-xs tracking-wide transition-all shadow-md flex items-center gap-2"
              >
                <span>Open in Google Maps</span>
                <ExternalLink className="w-4 h-4" />
              </a>
              <a
                href="https://instagram.com/glim_accessories_"
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 rounded-xl border border-stone-300 dark:border-stone-700 hover:bg-pink-50 dark:hover:bg-stone-800 text-stone-800 dark:text-stone-200 font-semibold text-xs tracking-wide transition-all flex items-center gap-2"
              >
                <Instagram className="w-4 h-4 text-pink-600" />
                <span>Follow on Instagram</span>
              </a>
            </div>
          </div>

          {/* Embedded Google Map */}
          <div className="h-72 sm:h-96 lg:h-full w-full bg-stone-100 dark:bg-stone-800 relative">
            <iframe
              title="Glim Accessories Pondicherry Map Location"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3903.652077977265!2d79.83279147573887!3d11.930985836881954!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a536170d1066cbb%3A0x6b8207d89063d810!2sRomain%20Rolland%20St%2C%20White%20Town%2C%20Puducherry!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"
              className="w-full h-full border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </section>

      {/* 10. INSTAGRAM LINK & FEED STRIP */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
        <a
          href="https://instagram.com/glim_accessories_"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-xs uppercase font-bold tracking-widest text-pink-600 dark:text-pink-400 hover:underline"
        >
          <Instagram className="w-4 h-4" />
          <span>Follow @glim_accessories_ on Instagram</span>
        </a>
        <h2 className="font-serif text-2xl sm:text-3xl text-stone-900 dark:text-stone-100 font-normal">
          Join Our Aesthetic Community
        </h2>
        <p className="text-xs text-stone-500 max-w-md mx-auto">
          Tag us in your unboxing reels &amp; daily styling photos for a chance to be featured on our feed!
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 pt-4">
          {[
            'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400&auto=format&fit=crop&q=80',
            'https://images.unsplash.com/photo-1611591475155-42e472621434?w=400&auto=format&fit=crop&q=80',
            'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=400&auto=format&fit=crop&q=80',
            'https://images.unsplash.com/photo-1513201099705-a9746e1e201f?w=400&auto=format&fit=crop&q=80',
            'https://images.unsplash.com/photo-1588444837495-c6cfeb53f32d?w=400&auto=format&fit=crop&q=80',
            'https://images.unsplash.com/photo-1617038220319-276d3cfab638?w=400&auto=format&fit=crop&q=80',
          ].map((imgUrl, i) => (
            <a
              key={i}
              href="https://instagram.com/glim_accessories_"
              target="_blank"
              rel="noopener noreferrer"
              className="group relative aspect-square rounded-2xl overflow-hidden bg-stone-100 block shadow-sm"
            >
              <img
                src={imgUrl}
                alt="Instagram look"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-pink-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                <Instagram className="w-6 h-6" />
              </div>
            </a>
          ))}
        </div>
      </section>
    </div>
  );
};
