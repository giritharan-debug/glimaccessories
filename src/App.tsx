import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { CartProvider } from '@/context/CartContext';
import { WishlistProvider } from '@/context/WishlistContext';
import { ThemeProvider } from '@/context/ThemeContext';

import { AnnouncementBar } from '@/components/AnnouncementBar';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { CartDrawer } from '@/components/CartDrawer';
import { WhatsAppFloatingButton } from '@/components/WhatsAppFloatingButton';

import { HomePage } from '@/pages/HomePage';
import { AllProductsPage } from '@/pages/AllProductsPage';
import { ProductDetailPage } from '@/pages/ProductDetailPage';
import { CategoryPage } from '@/pages/CategoryPage';
import { MensPage } from '@/pages/MensPage';
import { GiftsPage } from '@/pages/GiftsPage';
import { WishlistPage } from '@/pages/WishlistPage';
import { TrackOrderPage } from '@/pages/TrackOrderPage';
import { CheckoutPage } from '@/pages/CheckoutPage';
import { OrderSuccessPage } from '@/pages/OrderSuccessPage';
import { SizeGuidesPage } from '@/pages/SizeGuidesPage';
import { RefundPolicyPage } from '@/pages/RefundPolicyPage';
import { ShippingPage } from '@/pages/ShippingPage';
import { TermsPage } from '@/pages/TermsPage';
import { PrivacyPage } from '@/pages/PrivacyPage';
import { AdminPage } from '@/pages/admin/AdminPage';

const AppLayout: React.FC = () => {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

  return (
    <div className="min-h-screen flex flex-col font-sans">
      {!isAdmin && <AnnouncementBar />}
      {!isAdmin && <Header />}

      <main className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/products" element={<AllProductsPage />} />
          <Route path="/product/:id" element={<ProductDetailPage />} />
          <Route path="/category/:slug" element={<CategoryPage />} />
          <Route path="/mens" element={<MensPage />} />
          <Route path="/gifts" element={<GiftsPage />} />
          <Route path="/wishlist" element={<WishlistPage />} />
          <Route path="/track" element={<TrackOrderPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/order-success/:id" element={<OrderSuccessPage />} />
          <Route path="/size-guides" element={<SizeGuidesPage />} />
          <Route path="/refund-policy" element={<RefundPolicyPage />} />
          <Route path="/shipping" element={<ShippingPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/admin" element={<AdminPage />} />
        </Routes>
      </main>

      {!isAdmin && <Footer />}
      {!isAdmin && <CartDrawer />}
      {!isAdmin && <WhatsAppFloatingButton />}
    </div>
  );
};

export function App() {
  return (
    <ThemeProvider>
      <CartProvider>
        <WishlistProvider>
          <BrowserRouter>
            <AppLayout />
          </BrowserRouter>
        </WishlistProvider>
      </CartProvider>
    </ThemeProvider>
  );
}

export default App;
