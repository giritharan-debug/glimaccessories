import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Menu,
  X,
  Search,
  Heart,
  ShoppingBag,
  Truck,
  Sun,
  Moon,
  ChevronRight,
  ShieldCheck,
  User,
} from 'lucide-react';
import { Instagram } from '@/components/Icons';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { useTheme } from '@/context/ThemeContext';
import { SearchModal } from './SearchModal';

export const Header: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const { totalCount, setIsCartOpen } = useCart();
  const { wishlistCount } = useWishlist();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-stone-900/95 backdrop-blur-md border-b border-pink-100 dark:border-stone-800 transition-colors shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Left: Mobile Menu & Search Icon */}
            <div className="flex items-center gap-2 sm:gap-4">
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="p-2 text-stone-700 dark:text-stone-300 hover:text-pink-600 dark:hover:text-pink-400 focus:outline-none"
                aria-label="Open menu"
              >
                <Menu className="w-6 h-6" />
              </button>

              <button
                onClick={() => setSearchModalOpen(true)}
                className="p-2 text-stone-700 dark:text-stone-300 hover:text-pink-600 dark:hover:text-pink-400 focus:outline-none"
                aria-label="Search"
              >
                <Search className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>

              {/* Desktop Nav Links */}
              <nav className="hidden md:flex items-center space-x-6 text-sm font-medium text-stone-700 dark:text-stone-200">
                <Link to="/products" className="hover:text-pink-600 transition-colors">
                  All Products
                </Link>
                <Link to="/mens" className="hover:text-pink-600 transition-colors">
                  Men's
                </Link>
                <Link to="/gifts" className="hover:text-pink-600 transition-colors">
                  Gifts & Hampers
                </Link>
                <Link to="/track" className="hover:text-pink-600 transition-colors flex items-center gap-1">
                  <Truck className="w-4 h-4 text-pink-500" /> Track Order
                </Link>
              </nav>
            </div>

            {/* Center: Aesthetic Logo */}
            <div className="flex items-center justify-center text-center">
              <Link to="/" className="group flex items-center gap-2 sm:gap-3">
                <img
                  src="/glim-logo.jpg"
                  alt="Glim Accessories Official Logo"
                  className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover shadow-sm ring-2 ring-pink-200 dark:ring-pink-900/60 group-hover:scale-105 transition-all flex-shrink-0"
                />
                <div className="flex flex-col items-start text-left">
                  <span className="font-cursive text-2xl sm:text-3xl text-pink-600 dark:text-pink-400 group-hover:text-pink-700 transition-colors tracking-wide font-bold leading-tight">
                    Glim Accessories
                  </span>
                  <span className="text-[9px] sm:text-[10px] uppercase tracking-widest text-stone-500 dark:text-stone-400 font-medium -mt-0.5">
                    Aesthetic Store • Pondicherry
                  </span>
                </div>
              </Link>
            </div>

            {/* Right: Theme Toggle, Wishlist, Cart & Admin */}
            <div className="flex items-center gap-1.5 sm:gap-3">
              {/* Theme toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 text-stone-600 dark:text-stone-300 hover:text-pink-600 transition-colors"
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-300" /> : <Moon className="w-5 h-5 text-stone-600" />}
              </button>

              {/* Wishlist */}
              <Link
                to="/wishlist"
                className="relative p-2 text-stone-700 dark:text-stone-300 hover:text-pink-600 dark:hover:text-pink-400 transition-colors"
                aria-label="Wishlist"
              >
                <Heart className="w-5 h-5 sm:w-6 sm:h-6" />
                {wishlistCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 text-[10px] font-bold bg-pink-500 text-white rounded-full flex items-center justify-center animate-pulse">
                    {wishlistCount}
                  </span>
                )}
              </Link>

              {/* Cart Button */}
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative p-2 text-stone-700 dark:text-stone-300 hover:text-pink-600 dark:hover:text-pink-400 transition-colors"
                aria-label="Cart"
              >
                <ShoppingBag className="w-5 h-5 sm:w-6 sm:h-6" />
                {totalCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 text-[10px] font-bold bg-pink-600 text-white rounded-full flex items-center justify-center">
                    {totalCount}
                  </span>
                )}
              </button>

              {/* Admin Portal Shortcut */}
              <Link
                to="/admin"
                className="p-2 text-stone-600 dark:text-stone-400 hover:text-pink-600 transition-colors hidden sm:block"
                title="Admin Portal"
              >
                <User className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Drawer (Matching Reference Screenshot Design) */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Drawer content */}
          <div className="relative w-full max-w-xs bg-white dark:bg-stone-900 h-full shadow-2xl flex flex-col justify-between z-10 animate-slideRight">
            <div>
              {/* Drawer Top Header */}
              <div className="p-4 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between">
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1 text-stone-700 dark:text-stone-300 hover:text-pink-600"
                  aria-label="Close menu"
                >
                  <X className="w-6 h-6" />
                </button>

                <div className="flex items-center gap-2">
                  <img
                    src="/glim-logo.jpg"
                    alt="Glim Accessories"
                    className="w-8 h-8 rounded-full object-cover ring-1 ring-pink-200"
                  />
                  <span className="font-cursive text-2xl text-pink-600 dark:text-pink-400 font-bold">
                    Glim Accessories
                  </span>
                </div>

                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setSearchModalOpen(true);
                  }}
                  className="p-1 text-stone-700 dark:text-stone-300"
                  aria-label="Search"
                >
                  <Search className="w-5 h-5" />
                </button>
              </div>

              {/* Navigation list */}
              <nav className="p-4 space-y-1 divide-y divide-stone-100 dark:divide-stone-800">
                <div className="py-2">
                  <Link
                    to="/products"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-between py-2 text-base font-serif font-medium text-stone-800 dark:text-stone-100 hover:text-pink-600"
                  >
                    <span>All products</span>
                    <ChevronRight className="w-4 h-4 text-stone-400" />
                  </Link>
                </div>

                <div className="py-2">
                  <Link
                    to="/gifts"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-between py-2 text-base font-serif font-medium text-stone-800 dark:text-stone-100 hover:text-pink-600"
                  >
                    <span>Gifts &amp; Hampers</span>
                    <ChevronRight className="w-4 h-4 text-stone-400" />
                  </Link>
                </div>

                <div className="py-2">
                  <Link
                    to="/mens"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-between py-2 text-base font-serif font-medium text-stone-800 dark:text-stone-100 hover:text-pink-600"
                  >
                    <span>Men's Collection</span>
                    <ChevronRight className="w-4 h-4 text-stone-400" />
                  </Link>
                </div>

                <div className="py-2">
                  <Link
                    to="/category/anti-tarnish-chains"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-between py-2 text-base font-serif font-medium text-stone-800 dark:text-stone-100 hover:text-pink-600"
                  >
                    <span>Anti-Tarnish Jewellery</span>
                    <ChevronRight className="w-4 h-4 text-stone-400" />
                  </Link>
                </div>

                <div className="py-2">
                  <Link
                    to="/track"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-between py-2 text-base font-serif font-medium text-stone-800 dark:text-stone-100 hover:text-pink-600"
                  >
                    <span className="flex items-center gap-2">
                      <Truck className="w-4 h-4 text-pink-500" /> Track Order
                    </span>
                    <ChevronRight className="w-4 h-4 text-stone-400" />
                  </Link>
                </div>

                <div className="py-2">
                  <Link
                    to="/wishlist"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-between py-2 text-base font-serif font-medium text-stone-800 dark:text-stone-100 hover:text-pink-600"
                  >
                    <span className="flex items-center gap-2">
                      <Heart className="w-4 h-4 text-pink-500" /> Wishlist ({wishlistCount})
                    </span>
                    <ChevronRight className="w-4 h-4 text-stone-400" />
                  </Link>
                </div>

                <div className="py-2">
                  <Link
                    to="/size-guides"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-between py-2 text-base font-serif font-medium text-stone-800 dark:text-stone-100 hover:text-pink-600"
                  >
                    <span>Size Guides</span>
                    <ChevronRight className="w-4 h-4 text-stone-400" />
                  </Link>
                </div>

                <div className="py-2">
                  <Link
                    to="/refund-policy"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-between py-2 text-sm text-red-600 dark:text-red-400 font-semibold"
                  >
                    <span className="flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4" /> No Returns / No Refunds Policy
                    </span>
                    <ChevronRight className="w-4 h-4 text-stone-400" />
                  </Link>
                </div>

                <div className="py-2">
                  <Link
                    to="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-between py-2 text-sm text-pink-600 dark:text-pink-400 font-semibold"
                  >
                    <span className="flex items-center gap-1.5">
                      <User className="w-4 h-4" /> Admin Portal
                    </span>
                    <ChevronRight className="w-4 h-4 text-stone-400" />
                  </Link>
                </div>
              </nav>
            </div>

            {/* Bottom info & Socials matching screenshot */}
            <div className="p-4 border-t border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900/60">
              <div className="flex items-center justify-between text-stone-600 dark:text-stone-400">
                <a
                  href="https://instagram.com/glim_accessories_"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 hover:text-pink-600 transition-colors"
                >
                  <Instagram className="w-5 h-5" />
                </a>
                <span className="text-xs text-stone-400">Pondicherry, India</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Global Search Modal */}
      <SearchModal isOpen={searchModalOpen} onClose={() => setSearchModalOpen(false)} />
    </>
  );
};
