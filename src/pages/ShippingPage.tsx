import React from 'react';
import { Truck, Clock, MapPin, ShieldCheck } from 'lucide-react';

export const ShippingPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      <div className="text-center space-y-3">
        <span className="text-xs uppercase font-bold tracking-widest text-pink-600 dark:text-pink-400">
          Delivery Details
        </span>
        <h1 className="font-serif text-3xl sm:text-5xl text-stone-900 dark:text-stone-100 font-normal">
          Shipping &amp; Delivery Policy
        </h1>
        <p className="text-stone-600 dark:text-stone-400 text-sm max-w-xl mx-auto font-light">
          Dispatched with care straight from our Pondicherry boutique.
        </p>
      </div>

      <div className="bg-white dark:bg-stone-900 p-6 sm:p-10 rounded-3xl border border-pink-100 dark:border-stone-800 shadow-sm space-y-8 text-stone-700 dark:text-stone-300 text-sm leading-relaxed">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
          <div className="p-4 rounded-2xl bg-pink-50/50 dark:bg-stone-800/60 border border-pink-100 dark:border-stone-800">
            <Clock className="w-6 h-6 text-pink-600 mx-auto mb-2" />
            <h4 className="font-serif font-bold text-stone-900 dark:text-stone-100">Processing Time</h4>
            <p className="text-xs text-stone-500 mt-1">Orders dispatched within 24 - 48 working hours after payment verification.</p>
          </div>

          <div className="p-4 rounded-2xl bg-pink-50/50 dark:bg-stone-800/60 border border-pink-100 dark:border-stone-800">
            <Truck className="w-6 h-6 text-pink-600 mx-auto mb-2" />
            <h4 className="font-serif font-bold text-stone-900 dark:text-stone-100">Transit Duration</h4>
            <p className="text-xs text-stone-500 mt-1">3 to 6 business days depending on location across India.</p>
          </div>

          <div className="p-4 rounded-2xl bg-pink-50/50 dark:bg-stone-800/60 border border-pink-100 dark:border-stone-800">
            <MapPin className="w-6 h-6 text-pink-600 mx-auto mb-2" />
            <h4 className="font-serif font-bold text-stone-900 dark:text-stone-100">Origin Hub</h4>
            <p className="text-xs text-stone-500 mt-1">Romand Rolland St, opp. Dune Cafe, Pondicherry - 605001.</p>
          </div>
        </div>

        <section className="space-y-3">
          <h3 className="font-serif font-bold text-lg text-stone-900 dark:text-stone-100">
            Shipping Charges
          </h3>
          <p>
            Orders of <strong>₹999 and above</strong> receive <strong>FREE Standard Shipping</strong> anywhere in India! For orders below ₹999:
          </p>
          <ul className="list-disc list-inside space-y-1 text-xs text-stone-600 dark:text-stone-400 pl-2">
            <li><strong>Tamil Nadu &amp; Puducherry:</strong> ₹50</li>
            <li><strong>South India (Karnataka, Kerala, Andhra Pradesh, Telangana):</strong> ₹80</li>
            <li><strong>North India &amp; Rest of India:</strong> ₹150</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h3 className="font-serif font-bold text-lg text-stone-900 dark:text-stone-100">
            Courier Partners &amp; Tracking
          </h3>
          <p>
            We partner with reliable express couriers including Delhivery, BlueDart, DTDC, and India Post Speed Post. Once your order is shipped, you will receive a tracking link via WhatsApp, and you can also track your shipment live on our <a href="/track" className="text-pink-600 underline">Track Order</a> page!
          </p>
        </section>
      </div>
    </div>
  );
};
