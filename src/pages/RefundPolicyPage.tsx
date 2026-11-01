import React from 'react';
import { ShieldAlert, Video, PackageCheck, AlertCircle } from 'lucide-react';

export const RefundPolicyPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      <div className="text-center space-y-3">
        <div className="w-14 h-14 bg-red-100 dark:bg-red-950/80 text-red-600 rounded-full flex items-center justify-center mx-auto">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <span className="text-xs uppercase font-bold tracking-widest text-red-600 dark:text-red-400">
          Strict Store Policy
        </span>
        <h1 className="font-serif text-3xl sm:text-5xl text-stone-900 dark:text-stone-100 font-normal">
          No Returns &amp; No Refunds Policy
        </h1>
        <p className="text-stone-600 dark:text-stone-400 text-sm max-w-xl mx-auto font-light">
          Last Updated: 2026. Please read this policy carefully before placing your order on Glim Accessories.
        </p>
      </div>

      <div className="bg-white dark:bg-stone-900 p-6 sm:p-10 rounded-3xl border border-red-200 dark:border-red-900/60 shadow-sm space-y-6 text-stone-700 dark:text-stone-300 text-sm leading-relaxed">
        <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-900 dark:text-red-200">
          <p className="font-bold text-base flex items-center gap-2">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            SUMMARY: NO COD • NO RETURNS • NO REFUNDS • NO EXCHANGES
          </p>
          <p className="text-xs mt-1">
            Due to the delicate nature of personal jewellery, health &amp; hygiene considerations, and our ultra-affordable wholesale-direct pricing, <strong>all sales made through Glim Accessories are strictly final.</strong>
          </p>
        </div>

        <section className="space-y-3">
          <h3 className="font-serif font-bold text-lg text-stone-900 dark:text-stone-100 flex items-center gap-2">
            <Video className="w-5 h-5 text-pink-600" />
            1. Packing Proof Video Guarantee
          </h3>
          <p>
            To completely eliminate disputes and ensure our customers receive exactly what they paid for:
          </p>
          <ul className="list-disc list-inside space-y-1.5 text-xs sm:text-sm pl-2">
            <li>Every parcel is carefully inspected for clasps, shine, stones, and quality.</li>
            <li>Our dispatch team records an official <strong>Packing Proof Video / Photo</strong> showing each item being placed into your shipping envelope.</li>
            <li>This packing proof is securely linked to your Order ID and can be viewed directly on our <strong>Track Order</strong> page once your parcel is packed!</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h3 className="font-serif font-bold text-lg text-stone-900 dark:text-stone-100 flex items-center gap-2">
            <PackageCheck className="w-5 h-5 text-pink-600" />
            2. Customer Mandatory 360° Unboxing Video Requirement
          </h3>
          <p>
            In the extremely rare event that an item is damaged during transit by the courier service:
          </p>
          <ul className="list-disc list-inside space-y-1.5 text-xs sm:text-sm pl-2">
            <li>
              You <strong>MUST</strong> record an uncut, continuous 360-degree unboxing video from the moment the outer courier bag is sealed, clearly showing the shipping label, until the jewellery is taken out of its pouch.
            </li>
            <li>Any video that is paused, edited, or recorded after opening the outer packet will <strong>NOT</strong> be accepted under any circumstances.</li>
            <li>Claims must be submitted to our WhatsApp support (+91 8523996310) within <strong>24 hours</strong> of tracking delivery.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h3 className="font-serif font-bold text-lg text-stone-900 dark:text-stone-100">
            3. Size Discrepancies
          </h3>
          <p>
            We provide full millimeter sizing charts and video guides for rings, kadas, and chains on our <a href="/size-guides" className="text-pink-600 underline">Size Guides</a> page. Please verify your measurements before placing an order. We cannot process returns or exchanges if an incorrect size was ordered by the customer.
          </p>
        </section>

        <section className="space-y-3">
          <h3 className="font-serif font-bold text-lg text-stone-900 dark:text-stone-100">
            4. Order Cancellations
          </h3>
          <p>
            Once an order is confirmed and verified with your payment transaction ID (UTR), orders cannot be cancelled as our fulfillment team immediately begins packing and reserving inventory.
          </p>
        </section>
      </div>
    </div>
  );
};
