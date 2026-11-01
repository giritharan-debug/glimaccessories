import React from 'react';
import { MessageCircle } from 'lucide-react';
import { useCart } from '@/context/CartContext';

export const WhatsAppFloatingButton: React.FC = () => {
  const { settings } = useCart();
  const rawNumber = settings?.whatsapp_number || '+918523996310';
  const cleanNumber = rawNumber.replace(/\D/g, '');

  const defaultMsg = encodeURIComponent(
    'Hi Glim Accessories! ✨ I am looking at your website and have an enquiry.'
  );
  const whatsappUrl = `https://wa.me/${cleanNumber}?text=${defaultMsg}`;

  return (
    <aside aria-label="Support chat" className="fixed bottom-6 right-5 z-40 flex items-center group">
      {/* Tooltip on hover */}
      <div className="hidden sm:block mr-3 bg-stone-900/90 text-white text-xs font-medium py-1.5 px-3 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap backdrop-blur-sm pointer-events-none">
        Chat with Glim on WhatsApp
      </div>

      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat on WhatsApp"
        className="relative bg-[#25D366] hover:bg-[#20ba5a] text-white p-3.5 sm:p-4 rounded-full shadow-xl transition-all duration-300 hover:scale-110 flex items-center justify-center"
      >
        <span className="absolute -inset-1 rounded-full bg-[#25D366] opacity-30 animate-ping pointer-events-none" />
        <MessageCircle className="w-6 h-6 sm:w-7 sm:h-7 fill-white stroke-none" />
      </a>
    </aside>
  );
};
