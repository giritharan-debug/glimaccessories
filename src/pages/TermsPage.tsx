import React from 'react';

export const TermsPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div className="text-center space-y-2">
        <h1 className="font-serif text-3xl sm:text-4xl text-stone-900 dark:text-stone-100 font-normal">
          Terms &amp; Conditions
        </h1>
        <p className="text-xs text-stone-500">Glim Accessories • Pondicherry</p>
      </div>

      <div className="bg-white dark:bg-stone-900 p-6 sm:p-10 rounded-3xl border border-pink-100 dark:border-stone-800 shadow-sm space-y-6 text-stone-700 dark:text-stone-300 text-sm leading-relaxed">
        <section className="space-y-2">
          <h3 className="font-serif font-bold text-base text-stone-900 dark:text-stone-100">1. Acceptance of Terms</h3>
          <p>
            By accessing and placing an order with Glim Accessories, you confirm that you are in agreement with and bound by the terms of service contained in the Terms &amp; Conditions outlined below.
          </p>
        </section>

        <section className="space-y-2">
          <h3 className="font-serif font-bold text-base text-stone-900 dark:text-stone-100">2. No Cash on Delivery (COD)</h3>
          <p>
            Glim Accessories operates strictly on 100% advance UPI payment verification (PhonePe, GPay, Paytm). No orders will be processed via Cash on Delivery.
          </p>
        </section>

        <section className="space-y-2">
          <h3 className="font-serif font-bold text-base text-stone-900 dark:text-stone-100">3. Non-Returnable Merchandise</h3>
          <p>
            All products sold on this website are non-returnable and non-refundable. Please review size specifications and measurements thoroughly before purchase.
          </p>
        </section>

        <section className="space-y-2">
          <h3 className="font-serif font-bold text-base text-stone-900 dark:text-stone-100">4. Jurisdiction</h3>
          <p>
            Any disputes arising in connection with orders placed on Glim Accessories are subject exclusively to the courts of Pondicherry, India.
          </p>
        </section>
      </div>
    </div>
  );
};
