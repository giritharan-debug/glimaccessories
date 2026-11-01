import React from 'react';

export const PrivacyPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div className="text-center space-y-2">
        <h1 className="font-serif text-3xl sm:text-4xl text-stone-900 dark:text-stone-100 font-normal">
          Privacy Policy
        </h1>
        <p className="text-xs text-stone-500">Glim Accessories • Pondicherry</p>
      </div>

      <div className="bg-white dark:bg-stone-900 p-6 sm:p-10 rounded-3xl border border-pink-100 dark:border-stone-800 shadow-sm space-y-6 text-stone-700 dark:text-stone-300 text-sm leading-relaxed">
        <p>
          At Glim Accessories, we value your privacy. This Privacy Policy outlines the information we collect and how we use it to fulfill your orders and deliver exceptional customer care.
        </p>

        <section className="space-y-2">
          <h3 className="font-serif font-bold text-base text-stone-900 dark:text-stone-100">1. Information We Collect</h3>
          <p>
            When you place an order or create an inquiry, we collect your name, phone/WhatsApp number, delivery address, pincode, and payment verification details (UTR/transaction screenshot).
          </p>
        </section>

        <section className="space-y-2">
          <h3 className="font-serif font-bold text-base text-stone-900 dark:text-stone-100">2. How We Use Your Information</h3>
          <p>
            We use your phone number strictly for sending order updates, shipping tracking links via WhatsApp, and restock notifications requested by you. We never sell or share your personal data with third-party marketing companies.
          </p>
        </section>

        <section className="space-y-2">
          <h3 className="font-serif font-bold text-base text-stone-900 dark:text-stone-100">3. Security</h3>
          <p>
            Your information is transmitted securely. We use Supabase secure database infrastructure with Row Level Security (RLS) policies.
          </p>
        </section>
      </div>
    </div>
  );
};
