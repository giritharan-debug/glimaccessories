import React from 'react';
import { Link } from 'react-router-dom';
import {
  MapPin,
  Phone,
  ShieldAlert,
  Sparkles,
  Truck,
  HeartHandshake,
  ExternalLink,
} from 'lucide-react';
import { Instagram } from '@/components/Icons';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-stone-900 text-stone-300 pt-14 pb-10 border-t border-stone-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Why Glim Strip in Footer Top */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-12 border-b border-stone-800">
          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-pink-950/80 text-pink-400 border border-pink-900/50">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-serif font-semibold text-white text-base">Anti-Tarnish Guarantee</h4>
              <p className="text-xs text-stone-400 mt-1 leading-relaxed">
                Waterproof, sweatproof 18K gold-plated stainless steel made for everyday wear in Indian humidity.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-pink-950/80 text-pink-400 border border-pink-900/50">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-serif font-semibold text-white text-base">Packed with Love &amp; Proof</h4>
              <p className="text-xs text-stone-400 mt-1 leading-relaxed">
                Every single parcel is inspected and video-recorded during packing so you receive perfection.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-pink-950/80 text-pink-400 border border-pink-900/50">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-serif font-semibold text-white text-base">Shipped from Pondicherry</h4>
              <p className="text-xs text-stone-400 mt-1 leading-relaxed">
                Handcrafted &amp; dispatched directly from our White Town boutique on Romand Rolland Street.
              </p>
            </div>
          </div>
        </div>

        {/* Main Footer Links */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 py-12">
          {/* Brand Col */}
          <div className="space-y-4">
            <Link to="/" className="inline-flex items-center gap-3 group">
              <img
                src="/glim-logo.jpg"
                alt="Glim Accessories Logo"
                className="w-12 h-12 rounded-full object-cover ring-2 ring-pink-500/40 shadow-sm"
              />
              <div className="flex flex-col">
                <span className="font-cursive text-3xl sm:text-4xl text-pink-400 font-bold block leading-tight">
                  Glim Accessories
                </span>
                <span className="text-[10px] uppercase tracking-widest text-stone-400 font-medium">
                  Affordable Luxury • Pondicherry
                </span>
              </div>
            </Link>
            <p className="text-xs text-stone-400 leading-relaxed">
              Curated everyday aesthetic jewellery, waterproof anti-tarnish staples, trendy Korean earrings, and customized gift hampers.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <a
                href="https://instagram.com/glim_accessories_"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full bg-stone-800 text-stone-300 hover:text-pink-400 hover:bg-stone-700 transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="https://wa.me/918523996310"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full bg-[#25D366]/20 text-[#25D366] hover:bg-[#25D366]/30 transition-colors"
                aria-label="WhatsApp"
              >
                <Phone className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h5 className="font-serif font-semibold text-white text-sm mb-4 tracking-wide uppercase">
              Shop Collections
            </h5>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link to="/products" className="hover:text-pink-400 transition-colors">
                  All Products
                </Link>
              </li>
              <li>
                <Link to="/category/anti-tarnish-chains" className="hover:text-pink-400 transition-colors">
                  Anti-Tarnish Chains
                </Link>
              </li>
              <li>
                <Link to="/category/anti-tarnish-kadas" className="hover:text-pink-400 transition-colors">
                  Anti-Tarnish Kadas
                </Link>
              </li>
              <li>
                <Link to="/mens" className="hover:text-pink-400 transition-colors">
                  Men's Collection
                </Link>
              </li>
              <li>
                <Link to="/gifts" className="hover:text-pink-400 transition-colors">
                  Gifts &amp; Hampers
                </Link>
              </li>
              <li>
                <Link to="/category/scrunchies-and-bows" className="hover:text-pink-400 transition-colors">
                  Scrunchies &amp; Hair Claws
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Care & Policies */}
          <div>
            <h5 className="font-serif font-semibold text-white text-sm mb-4 tracking-wide uppercase">
              Help &amp; Policies
            </h5>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link to="/track" className="hover:text-pink-400 transition-colors flex items-center gap-1.5 font-medium text-pink-300">
                  <Truck className="w-3.5 h-3.5" /> Track Your Order
                </Link>
              </li>
              <li>
                <Link to="/size-guides" className="hover:text-pink-400 transition-colors">
                  Ring &amp; Chain Size Guides
                </Link>
              </li>
              <li>
                <Link to="/refund-policy" className="hover:text-pink-400 transition-colors flex items-center gap-1 text-rose-300 font-semibold">
                  <ShieldAlert className="w-3.5 h-3.5" /> No Returns / No Refunds Policy
                </Link>
              </li>
              <li>
                <Link to="/shipping" className="hover:text-pink-400 transition-colors">
                  Shipping &amp; Delivery Timeline
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-pink-400 transition-colors">
                  Terms &amp; Conditions
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="hover:text-pink-400 transition-colors">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Store Location */}
          <div>
            <h5 className="font-serif font-semibold text-white text-sm mb-4 tracking-wide uppercase">
              Visit Our Store
            </h5>
            <div className="space-y-3 text-xs text-stone-400">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-pink-400 flex-shrink-0 mt-0.5" />
                <span>
                  Romand Rolland St, opp. Dune Cafe, Pondicherry - 605001
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-pink-400 flex-shrink-0" />
                <a href="tel:+918523996310" className="hover:text-white transition-colors">
                  +91 8523996310
                </a>
              </div>
              <a
                href="https://maps.google.com/?q=Romand+Rolland+St,+opp.+Dune+Cafe,+Pondicherry"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-pink-400 hover:text-pink-300 font-semibold pt-1"
              >
                <span>View on Google Maps</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              {/* Strict No Returns Banner */}
              <div className="p-2.5 rounded-xl bg-stone-800/80 border border-stone-700/60 mt-3 text-[11px] text-stone-300">
                <p className="font-bold text-amber-400">⚠️ IMPORTANT NOTICE</p>
                <p className="mt-0.5 leading-snug">
                  We do NOT offer Cash on Delivery (COD). All orders must be prepaid via UPI. Strict No-Return / No-Refund policy applies.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Copyright & Payment Badges */}
        <div className="pt-8 border-t border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500">
          <p>© {new Date().getFullYear()} Glim Accessories Pondicherry. All rights reserved.</p>
          <div className="flex items-center gap-2 text-stone-400 text-xs">
            <span>Accepted Payments:</span>
            <span className="bg-stone-800 px-2 py-0.5 rounded text-white font-mono">PhonePe</span>
            <span className="bg-stone-800 px-2 py-0.5 rounded text-white font-mono">Google Pay</span>
            <span className="bg-stone-800 px-2 py-0.5 rounded text-white font-mono">Paytm UPI</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
