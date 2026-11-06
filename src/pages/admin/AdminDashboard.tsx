import React, { useState, useEffect, useRef } from 'react';
import {
  LayoutDashboard,
  Package,
  Layers,
  ShoppingBag,
  ShoppingCart,
  Bell,
  CreditCard,
  MessageSquare,
  Tag,
  Settings,
  Database,
  LogOut,
  Plus,
  Trash2,
  Edit,
  ExternalLink,
  Check,
  X,
  Upload,
  Download,
  Eye,
  MessageCircle,
  Truck,
  Sparkles,
  Search,
  CheckCircle,
  AlertCircle,
  Video,
  QrCode,
  RefreshCw,
  Copy,
  Save,
} from 'lucide-react';
import {
  Product,
  Category,
  Order,
  AbandonedCart,
  NotifyRequest,
  Coupon,
  Review,
  SiteSettings,
  OrderStatus,
  PaymentGatewayConfig,
} from '@/types';
import { INITIAL_SETTINGS } from '@/lib/seedData';
import {
  getProducts,
  saveProduct,
  deleteProduct,
  bulkMarkProductsSoldOut,
  getCategories,
  saveCategory,
  deleteCategory,
  getOrders,
  updateOrderStatus,
  getAbandonedCarts,
  markAbandonedCartReminded,
  getNotifyRequests,
  markNotifyRequestDone,
  getCoupons,
  saveCoupon,
  deleteCoupon,
  getReviews,
  saveReview,
  deleteReview,
  getSiteSettings,
  saveSiteSettings,
  compressAndProcessImage,
} from '@/lib/store';
import { getSupabase, getSupabaseConfig, isSupabaseConfigured } from '@/lib/supabase';

interface AdminDashboardProps {
  onLogout: () => void;
}

type TabType =
  | 'dashboard'
  | 'products'
  | 'categories'
  | 'orders'
  | 'abandoned'
  | 'notify'
  | 'payments'
  | 'reviews'
  | 'coupons'
  | 'settings'
  | 'supabase';

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');

  // Main state data
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [abandonedCarts, setAbandonedCarts] = useState<AbandonedCart[]>([]);
  const [notifyRequests, setNotifyRequests] = useState<NotifyRequest[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [siteSettings, setSiteSettings] = useState<SiteSettings | null>(null);

  // Selected filters / search
  const [orderFilter, setOrderFilter] = useState<string>('all');
  const [productSearch, setProductSearch] = useState<string>('');
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);

  // Modals state
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const [editingCategory, setEditingCategory] = useState<Partial<Category> | null>(null);
  const [editingReview, setEditingReview] = useState<Partial<Review> | null>(null);
  const [editingCoupon, setEditingCoupon] = useState<Partial<Coupon> | null>(null);
  const [selectedOrderDetails, setSelectedOrderDetails] = useState<Order | null>(null);
  const [selectedOrderForTracking, setSelectedOrderForTracking] = useState<Order | null>(null);
  const [viewingImageModal, setViewingImageModal] = useState<string | null>(null);

  // Packing proof & tracking form
  const [trackingNumberInput, setTrackingNumberInput] = useState('');
  const [courierNameInput, setCourierNameInput] = useState('Delhivery Express');
  const [packingProofFile, setPackingProofFile] = useState<File | null>(null);

  // Supabase Custom Config form
  const [customSbUrl, setCustomSbUrl] = useState('');
  const [customSbKey, setCustomSbKey] = useState('');
  const [sbStatusMsg, setSbStatusMsg] = useState('');

  // Upload loader
  const [isUploading, setIsUploading] = useState(false);
  const [isUploadingCategoryImg, setIsUploadingCategoryImg] = useState(false);
  const [showCategoryUrlInput, setShowCategoryUrlInput] = useState(false);
  const [uploadingGatewayId, setUploadingGatewayId] = useState<string | null>(null);
  const [savingGateways, setSavingGateways] = useState(false);
  const [gatewaySuccessMsg, setGatewaySuccessMsg] = useState<string>('');
  const [copiedUpiGatewayId, setCopiedUpiGatewayId] = useState<string | null>(null);

  // Settings tab feedback
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [settingsSuccessNotice, setSettingsSuccessNotice] = useState<string>('');
  const [isRefreshingOrders, setIsRefreshingOrders] = useState(false);

  const activeTabRef = useRef<TabType>(activeTab);
  useEffect(() => {
    activeTabRef.current = activeTab;
  }, [activeTab]);

  const loadAllAdminData = async (preserveSettings = false) => {
    const [prods, cats, ords, aban, notif, cpns, revs, sett] = await Promise.all([
      getProducts(),
      getCategories(),
      getOrders(),
      getAbandonedCarts(),
      getNotifyRequests(),
      getCoupons(),
      getReviews(),
      preserveSettings ? Promise.resolve(null) : getSiteSettings(),
    ]);

    setProducts(prods);
    setCategories(cats);
    setOrders(ords);
    setAbandonedCarts(aban);
    setNotifyRequests(notif);
    setCoupons(cpns);
    setReviews(revs);

    if (!preserveSettings && sett) {
      const safeSettings: SiteSettings = {
        ...INITIAL_SETTINGS,
        ...(sett || {}),
        payment_gateways: (sett?.payment_gateways && Array.isArray(sett.payment_gateways) && sett.payment_gateways.length > 0)
          ? sett.payment_gateways
          : INITIAL_SETTINGS.payment_gateways,
      };
      setSiteSettings(safeSettings);
    }
  };

  useEffect(() => {
    loadAllAdminData(false);
    const handleDataChanged = (e: Event) => {
      const customEvent = e as CustomEvent;
      const entity = customEvent.detail?.entity;
      // If user is viewing/editing Settings or Payments, preserve siteSettings in memory
      const isEditingSettings = activeTabRef.current === 'settings' || activeTabRef.current === 'payments';
      loadAllAdminData(isEditingSettings && entity === 'site_settings');
    };
    window.addEventListener('glim:data_changed', handleDataChanged);

    // 1. Supabase Realtime channel for live order updates across all devices
    let channel: any = null;
    const sb = getSupabase();
    if (sb && isSupabaseConfigured()) {
      try {
        channel = sb
          .channel('realtime:admin_orders')
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'orders' },
            () => {
              const isEditingSettings = activeTabRef.current === 'settings' || activeTabRef.current === 'payments';
              loadAllAdminData(isEditingSettings);
            }
          )
          .subscribe();
      } catch (e) {
        console.warn('Realtime subscription error:', e);
      }
    }

    // 2. Multi-device background poll every 10 seconds
    const pollInterval = setInterval(() => {
      const isEditingSettings = activeTabRef.current === 'settings' || activeTabRef.current === 'payments';
      loadAllAdminData(isEditingSettings);
    }, 10000);

    return () => {
      window.removeEventListener('glim:data_changed', handleDataChanged);
      clearInterval(pollInterval);
      if (channel && sb) {
        sb.removeChannel(channel);
      }
    };
  }, []);

  useEffect(() => {
    const config = getSupabaseConfig();
    setCustomSbUrl(config.url);
    setCustomSbKey(config.anonKey);
  }, []);

  // Quick stats
  const totalProducts = products.length;
  const inStockProducts = products.filter(p => p.stock > 0 && p.is_available).length;
  const soldOutProducts = products.filter(p => p.stock <= 0 || !p.is_available).length;

  const todayStr = new Date().toISOString().split('T')[0];
  const ordersToday = orders.filter(o => o.created_at.startsWith(todayStr)).length;
  const pendingPayments = orders.filter(o => o.status === 'pending_verification').length;
  const totalRevenue = orders
    .filter(o => o.status !== 'rejected')
    .reduce((sum, o) => sum + o.total, 0);

  // ==========================================
  // PRODUCTS HANDLERS
  // ==========================================
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct?.name || editingProduct.price === undefined) return;

    await saveProduct({
      ...editingProduct,
      name: editingProduct.name,
      price: Number(editingProduct.price),
      old_price: editingProduct.old_price ? Number(editingProduct.old_price) : undefined,
      stock: Number(editingProduct.stock || 0),
      category_id: editingProduct.category_id || categories[0]?.id || 'cat-chains',
      images: editingProduct.images && editingProduct.images.length > 0
        ? editingProduct.images
        : ['https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600'],
    } as any);

    setEditingProduct(null);
  };

  const handleMultipleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    setIsUploading(true);
    const files = Array.from(e.target.files);
    const uploadedUrls: string[] = [];

    for (const file of files) {
      const url = await compressAndProcessImage(file);
      uploadedUrls.push(url);
    }

    setEditingProduct(prev => ({
      ...prev,
      images: [...(prev?.images || []), ...uploadedUrls],
    }));
    setIsUploading(false);
  };

  const handleBulkSoldOut = async () => {
    if (selectedProductIds.length === 0) return;
    if (confirm(`Mark ${selectedProductIds.length} selected products as Sold Out?`)) {
      await bulkMarkProductsSoldOut(selectedProductIds);
      setSelectedProductIds([]);
    }
  };

  // ==========================================
  // ORDERS HANDLERS
  // ==========================================
  const handleUpdateOrderStatus = async (orderId: string, status: OrderStatus) => {
    await updateOrderStatus(orderId, status);
  };

  const handleSaveTrackingAndProof = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrderForTracking) return;

    let proofUrl = selectedOrderForTracking.packing_proof_url;
    if (packingProofFile) {
      proofUrl = await compressAndProcessImage(packingProofFile);
    }

    await updateOrderStatus(selectedOrderForTracking.id, selectedOrderForTracking.status, {
      tracking_number: trackingNumberInput.trim() || undefined,
      courier_name: courierNameInput.trim() || undefined,
      packing_proof_url: proofUrl,
    });

    setSelectedOrderForTracking(null);
    setPackingProofFile(null);
    setTrackingNumberInput('');
  };

  const handleExportOrdersCSV = () => {
    const headers = [
      'Order Number',
      'Date',
      'Customer Name',
      'Phone',
      'Address',
      'City',
      'Pincode',
      'Items Count',
      'Total Amount',
      'Payment Method',
      'UTR',
      'Status',
      'Tracking Number',
    ];

    const rows = orders.map(o => [
      o.order_number,
      new Date(o.created_at).toLocaleDateString(),
      `"${o.customer_name}"`,
      `'${o.customer_phone}`,
      `"${o.address}"`,
      `"${o.city}"`,
      o.pincode,
      o.items.reduce((s, i) => s + i.quantity, 0),
      o.total,
      o.payment_method,
      `'${o.utr_number}`,
      o.status,
      o.tracking_number || '',
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Glim_Accessories_Orders_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // WhatsApp status update message generator
  const sendWhatsAppUpdate = (order: Order) => {
    const msg = `Hi ${order.customer_name}! ✨
Status update regarding your Glim Accessories Order *#${order.order_number}*:

Current Status: *${order.status.toUpperCase().replace('_', ' ')}*
${order.tracking_number ? `Courier: ${order.courier_name || 'Express Delivery'}\nTracking Number: ${order.tracking_number}\n` : ''}
Track live progress & view your inspection packing proof video here:
https://glimaccessories.com/track?orderId=${order.order_number}&phone=${order.customer_phone}

Thank you for shopping with Glim Accessories Pondicherry! 💖`;

    window.open(`https://wa.me/91${order.customer_phone.replace(/\D/g, '').slice(-10)}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  // Abandoned cart reminder
  const sendAbandonedCartWhatsApp = (cart: AbandonedCart) => {
    const itemsText = cart.items.map(i => i.product_name).join(', ');
    const msg = `Hi ${cart.customer_name || 'there'}! ✨
You left these gorgeous items in your shopping bag at Glim Accessories:
${itemsText} (Total: ₹${cart.total})

Complete your order now with 10% off using coupon code *WELCOME10*!
Click here to finish checkout: https://glimaccessories.com/checkout

Shipped with care from our Pondicherry store 💖`;

    window.open(`https://wa.me/91${cart.phone.replace(/\D/g, '').slice(-10)}?text=${encodeURIComponent(msg)}`, '_blank');
    markAbandonedCartReminded(cart.id);
  };

  // Restock Notify WhatsApp
  const sendRestockWhatsApp = (notif: NotifyRequest) => {
    const msg = `Good news from Glim Accessories! ✨
The item you requested, *"${notif.product_name}"*, has just been RESTOCKED at our Pondicherry boutique!

Shop it now before it sells out again:
https://glimaccessories.com/products?search=${encodeURIComponent(notif.product_name)}

Have a beautiful day! 💖`;

    window.open(`https://wa.me/91${notif.phone.replace(/\D/g, '').slice(-10)}?text=${encodeURIComponent(msg)}`, '_blank');
    markNotifyRequestDone(notif.id);
  };

  return (
    <div className="min-h-screen bg-stone-100 dark:bg-stone-950 flex flex-col md:flex-row text-stone-800 dark:text-stone-200">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-white dark:bg-stone-900 border-r border-stone-200 dark:border-stone-800 flex-shrink-0 flex flex-col justify-between">
        <div className="p-4 sm:p-6 space-y-6">
          {/* Admin Header */}
          <div className="flex items-center gap-3">
            <img
              src="/glim-logo.jpg"
              alt="Glim Accessories"
              className="w-11 h-11 rounded-full object-cover ring-2 ring-pink-300 dark:ring-pink-700 shadow-sm flex-shrink-0"
            />
            <div>
              <h2 className="font-serif font-bold text-base text-stone-900 dark:text-stone-100 leading-tight">
                Glim Admin
              </h2>
              <span className="text-[10px] text-emerald-600 font-semibold uppercase flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live Sync Active
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1 text-xs font-medium">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
              { id: 'orders', label: `Orders (${orders.length})`, icon: <ShoppingBag className="w-4 h-4" /> },
              { id: 'products', label: `Products (${products.length})`, icon: <Package className="w-4 h-4" /> },
              { id: 'categories', label: `Categories (${categories.length})`, icon: <Layers className="w-4 h-4" /> },
              { id: 'abandoned', label: `Abandoned Carts (${abandonedCarts.length})`, icon: <ShoppingCart className="w-4 h-4" /> },
              { id: 'notify', label: `Restock Alerts (${notifyRequests.filter(n => !n.is_notified).length})`, icon: <Bell className="w-4 h-4" /> },
              { id: 'payments', label: 'UPI & QR Settings', icon: <CreditCard className="w-4 h-4" /> },
              { id: 'reviews', label: 'Customer Reviews', icon: <MessageSquare className="w-4 h-4" /> },
              { id: 'coupons', label: 'Coupons & Offers', icon: <Tag className="w-4 h-4" /> },
              { id: 'settings', label: 'Site & Shipping Settings', icon: <Settings className="w-4 h-4" /> },
              { id: 'supabase', label: 'Supabase Database', icon: <Database className="w-4 h-4" /> },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-colors text-left ${
                  activeTab === tab.id
                    ? 'bg-pink-600 text-white font-semibold shadow-sm'
                    : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Bottom Logout */}
        <div className="p-4 border-t border-stone-200 dark:border-stone-800">
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out Admin</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:p-8 overflow-y-auto max-h-screen">
        {/* ======================================================== */}
        {/* TAB 1: DASHBOARD OVERVIEW */}
        {/* ======================================================== */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8 animate-fadeIn">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 dark:text-stone-100">
                  Store Performance Dashboard
                </h1>
                <p className="text-xs text-stone-500 mt-1">
                  Real-time sales, order verification queue, and inventory alerts.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href="/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs font-semibold text-stone-700 dark:text-stone-300 hover:bg-stone-50 flex items-center gap-1.5"
                >
                  <span>Open Storefront</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              <div className="bg-white dark:bg-stone-900 p-5 rounded-2xl border border-pink-100 dark:border-stone-800 shadow-sm space-y-2">
                <span className="text-xs text-stone-500 uppercase font-semibold">Total Revenue</span>
                <p className="font-serif text-2xl sm:text-3xl font-bold text-pink-600 dark:text-pink-400">
                  ₹{totalRevenue.toLocaleString('en-IN')}
                </p>
                <p className="text-[11px] text-stone-400">Excluding rejected payments</p>
              </div>

              <div className="bg-white dark:bg-stone-900 p-5 rounded-2xl border border-pink-100 dark:border-stone-800 shadow-sm space-y-2">
                <span className="text-xs text-stone-500 uppercase font-semibold">Pending Verification</span>
                <p className="font-serif text-2xl sm:text-3xl font-bold text-amber-500">
                  {pendingPayments} orders
                </p>
                <button
                  onClick={() => {
                    setActiveTab('orders');
                    setOrderFilter('pending_verification');
                  }}
                  className="text-[11px] text-pink-600 font-semibold hover:underline"
                >
                  Review payments ➔
                </button>
              </div>

              <div className="bg-white dark:bg-stone-900 p-5 rounded-2xl border border-pink-100 dark:border-stone-800 shadow-sm space-y-2">
                <span className="text-xs text-stone-500 uppercase font-semibold">Today's Orders</span>
                <p className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 dark:text-stone-100">
                  {ordersToday}
                </p>
                <p className="text-[11px] text-stone-400">Placed today ({todayStr})</p>
              </div>

              <div className="bg-white dark:bg-stone-900 p-5 rounded-2xl border border-pink-100 dark:border-stone-800 shadow-sm space-y-2">
                <span className="text-xs text-stone-500 uppercase font-semibold">Abandoned Carts</span>
                <p className="font-serif text-2xl sm:text-3xl font-bold text-purple-600">
                  {abandonedCarts.length}
                </p>
                <button
                  onClick={() => setActiveTab('abandoned')}
                  className="text-[11px] text-purple-600 font-semibold hover:underline"
                >
                  Remind on WhatsApp ➔
                </button>
              </div>
            </div>

            {/* Inventory Status Bar */}
            <div className="bg-white dark:bg-stone-900 p-6 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-sm space-y-4">
              <h3 className="font-serif font-bold text-base text-stone-900 dark:text-stone-100">
                Inventory Health
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                <div className="p-4 rounded-xl bg-stone-50 dark:bg-stone-800">
                  <span className="text-xs text-stone-500">Total Products</span>
                  <p className="text-xl font-bold text-stone-900 dark:text-stone-100 mt-1">{totalProducts}</p>
                </div>
                <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300">
                  <span className="text-xs">In Stock</span>
                  <p className="text-xl font-bold mt-1">{inStockProducts}</p>
                </div>
                <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300">
                  <span className="text-xs">Sold Out</span>
                  <p className="text-xl font-bold mt-1">{soldOutProducts}</p>
                </div>
              </div>
            </div>

            {/* Recent Orders Overview */}
            <div className="bg-white dark:bg-stone-900 p-6 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-serif font-bold text-base text-stone-900 dark:text-stone-100">
                  Recent Orders
                </h3>
                <button
                  onClick={() => setActiveTab('orders')}
                  className="text-xs font-semibold text-pink-600 hover:underline"
                >
                  View All Orders
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-stone-50 dark:bg-stone-800 text-stone-600 dark:text-stone-400 uppercase font-semibold">
                    <tr>
                      <th className="p-3">Order ID</th>
                      <th className="p-3">Customer</th>
                      <th className="p-3">Amount</th>
                      <th className="p-3">Payment</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                    {orders.slice(0, 5).map(ord => (
                      <tr key={ord.id} className="hover:bg-pink-50/20">
                        <td className="p-3 font-mono font-bold text-pink-600">{ord.order_number}</td>
                        <td className="p-3">
                          <p className="font-medium text-stone-800 dark:text-stone-200">{ord.customer_name}</p>
                          <p className="text-stone-400">+91 {ord.customer_phone}</p>
                        </td>
                        <td className="p-3 font-bold">₹{ord.total}</td>
                        <td className="p-3">
                          <span className="uppercase text-[10px] bg-stone-100 dark:bg-stone-800 px-2 py-0.5 rounded font-mono">
                            {ord.payment_method}
                          </span>
                        </td>
                        <td className="p-3">
                          <span className="capitalize text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                            {ord.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="p-3">
                          <button
                            onClick={() => setSelectedOrderDetails(ord)}
                            className="text-pink-600 font-semibold hover:underline"
                          >
                            Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 2: PRODUCTS MANAGER */}
        {/* ======================================================== */}
        {activeTab === 'products' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 dark:text-stone-100">
                  Products Management
                </h1>
                <p className="text-xs text-stone-500 mt-1">
                  Changes made here update instantly on customer storefront.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {selectedProductIds.length > 0 && (
                  <button
                    onClick={handleBulkSoldOut}
                    className="px-4 py-2 bg-rose-600 text-white rounded-xl text-xs font-semibold hover:bg-rose-700 transition-colors shadow-sm"
                  >
                    Bulk Mark Sold Out ({selectedProductIds.length})
                  </button>
                )}

                <button
                  onClick={() =>
                    setEditingProduct({
                      name: '',
                      price: 199,
                      old_price: 399,
                      stock: 10,
                      category_id: categories[0]?.id || 'cat-chains',
                      is_anti_tarnish: true,
                      is_available: true,
                      images: [],
                      variants: [],
                      description: '',
                    })
                  }
                  className="px-4 py-2.5 bg-pink-600 hover:bg-pink-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add New Product</span>
                </button>
              </div>
            </div>

            {/* Search Filter */}
            <div className="relative max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-3 text-stone-400" />
              <input
                type="text"
                value={productSearch}
                onChange={e => setProductSearch(e.target.value)}
                placeholder="Search products by name or category..."
                className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 outline-none"
              />
            </div>

            {/* Products Table */}
            <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-stone-50 dark:bg-stone-800 text-stone-600 dark:text-stone-400 uppercase font-semibold">
                    <tr>
                      <th className="p-3 w-10">
                        <input
                          type="checkbox"
                          onChange={e => {
                            if (e.target.checked) setSelectedProductIds(products.map(p => p.id));
                            else setSelectedProductIds([]);
                          }}
                        />
                      </th>
                      <th className="p-3">Product</th>
                      <th className="p-3">Category</th>
                      <th className="p-3">Price</th>
                      <th className="p-3">Stock</th>
                      <th className="p-3">Anti-Tarnish</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                    {products
                      .filter(p =>
                        p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
                        p.category_name?.toLowerCase().includes(productSearch.toLowerCase())
                      )
                      .map(p => (
                        <tr key={p.id} className="hover:bg-pink-50/20">
                          <td className="p-3">
                            <input
                              type="checkbox"
                              checked={selectedProductIds.includes(p.id)}
                              onChange={e => {
                                if (e.target.checked) setSelectedProductIds(ids => [...ids, p.id]);
                                else setSelectedProductIds(ids => ids.filter(i => i !== p.id));
                              }}
                            />
                          </td>
                          <td className="p-3">
                            <div className="flex items-center gap-3">
                              <img
                                src={p.images[0] || 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=100'}
                                alt=""
                                className="w-10 h-10 object-cover rounded-lg bg-stone-100"
                              />
                              <div>
                                <p className="font-semibold text-stone-900 dark:text-stone-100">{p.name}</p>
                                {p.size_guide_type && (
                                  <span className="text-[10px] text-pink-500 font-medium capitalize">
                                    Size Guide: {p.size_guide_type}
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="p-3 text-stone-600 dark:text-stone-300">{p.category_name}</td>
                          <td className="p-3 font-bold text-stone-900 dark:text-stone-100">
                            ₹{p.price}
                            {p.old_price && <span className="line-through text-stone-400 font-normal ml-1">₹{p.old_price}</span>}
                          </td>
                          <td className="p-3">
                            <span
                              className={`font-semibold px-2 py-0.5 rounded text-[11px] ${
                                p.stock > 3
                                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                  : p.stock > 0
                                  ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                                  : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                              }`}
                            >
                              {p.stock} units
                            </span>
                          </td>
                          <td className="p-3">
                            {p.is_anti_tarnish ? (
                              <span className="text-amber-600 font-bold flex items-center gap-1">
                                <Sparkles className="w-3.5 h-3.5" /> Yes
                              </span>
                            ) : (
                              <span className="text-stone-400">No</span>
                            )}
                          </td>
                          <td className="p-3">
                            <button
                              onClick={() =>
                                saveProduct({
                                  ...p,
                                  is_available: !p.is_available,
                                  stock: !p.is_available && p.stock === 0 ? 5 : p.stock,
                                })
                              }
                              className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition-colors ${
                                p.is_available && p.stock > 0
                                  ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                                  : 'bg-stone-200 text-stone-700 hover:bg-stone-300'
                              }`}
                            >
                              {p.is_available && p.stock > 0 ? 'Available' : 'Sold Out'}
                            </button>
                          </td>
                          <td className="p-3 text-right space-x-2">
                            <button
                              onClick={() => setEditingProduct(p)}
                              className="text-stone-600 dark:text-stone-300 hover:text-pink-600 p-1"
                              title="Edit"
                            >
                              <Edit className="w-4 h-4 inline" />
                            </button>
                            <button
                              onClick={async () => {
                                if (confirm(`Delete product "${p.name}"?`)) {
                                  await deleteProduct(p.id);
                                }
                              }}
                              className="text-stone-400 hover:text-red-500 p-1"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4 inline" />
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 3: CATEGORIES MANAGER */}
        {/* ======================================================== */}
        {activeTab === 'categories' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 dark:text-stone-100">
                  Categories
                </h1>
                <p className="text-xs text-stone-500 mt-1">
                  Add, rename, reorder, change images and toggle visibility.
                </p>
              </div>

              <button
                onClick={() =>
                  setEditingCategory({
                    name: '',
                    image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600',
                    sort_order: categories.length + 1,
                    is_hidden: false,
                  })
                }
                className="px-4 py-2.5 bg-pink-600 hover:bg-pink-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Add Category</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map(cat => (
                <div
                  key={cat.id}
                  className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-4 shadow-sm flex items-center gap-4"
                >
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="w-16 h-16 rounded-xl object-cover bg-stone-100 flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-serif font-bold text-stone-900 dark:text-stone-100 text-sm truncate">
                      {cat.name}
                    </h4>
                    <p className="text-xs text-stone-400">Order: #{cat.sort_order}</p>
                    <span
                      className={`inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded ${
                        cat.is_hidden ? 'bg-stone-200 text-stone-700' : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {cat.is_hidden ? 'Hidden' : 'Visible'}
                    </span>
                  </div>

                  <div className="flex flex-col gap-1">
                    <button
                      onClick={() => setEditingCategory(cat)}
                      className="p-1.5 text-stone-500 hover:text-pink-600"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={async () => {
                        if (confirm(`Delete category "${cat.name}"?`)) {
                          await deleteCategory(cat.id);
                        }
                      }}
                      className="p-1.5 text-stone-400 hover:text-red-500"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 4: ORDERS MANAGER */}
        {/* ======================================================== */}
        {activeTab === 'orders' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 dark:text-stone-100">
                  Customer Orders
                </h1>
                <p className="text-xs text-stone-500 mt-1">
                  Verify UPI payments, attach packing proof video, and dispatch tracking details.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={async () => {
                    setIsRefreshingOrders(true);
                    const ords = await getOrders();
                    setOrders(ords);
                    setTimeout(() => setIsRefreshingOrders(false), 500);
                  }}
                  disabled={isRefreshingOrders}
                  className="px-3.5 py-2 bg-pink-50 hover:bg-pink-100 text-pink-700 dark:bg-pink-950/40 dark:text-pink-300 dark:hover:bg-pink-900/50 border border-pink-200 dark:border-pink-800 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
                  title="Force re-fetch orders directly from Supabase"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isRefreshingOrders ? 'animate-spin' : ''}`} />
                  <span>{isRefreshingOrders ? 'Syncing...' : 'Sync Orders'}</span>
                </button>
                <button
                  onClick={handleExportOrdersCSV}
                  className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
                >
                  <Download className="w-4 h-4" />
                  <span>Export CSV</span>
                </button>
              </div>
            </div>

            {/* Status Filter Tabs */}
            <div className="flex flex-wrap gap-2 border-b border-stone-200 dark:border-stone-800 pb-2">
              {[
                { id: 'all', label: 'All Orders' },
                { id: 'pending_verification', label: 'Pending Payment Verification' },
                { id: 'confirmed', label: 'Payment Confirmed' },
                { id: 'packed', label: 'Packed' },
                { id: 'shipped', label: 'Shipped' },
                { id: 'delivered', label: 'Delivered' },
                { id: 'rejected', label: 'Rejected' },
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setOrderFilter(f.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                    orderFilter === f.id
                      ? 'bg-pink-600 text-white'
                      : 'bg-white dark:bg-stone-900 text-stone-600 dark:text-stone-400 hover:bg-stone-100'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Orders List */}
            <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-stone-50 dark:bg-stone-800 text-stone-600 dark:text-stone-400 uppercase font-semibold">
                    <tr>
                      <th className="p-3">Order ID</th>
                      <th className="p-3">Customer &amp; Phone</th>
                      <th className="p-3">Address</th>
                      <th className="p-3">Total</th>
                      <th className="p-3">Payment &amp; UTR</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Tracking / Proof</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                    {orders
                      .filter(o => orderFilter === 'all' || o.status === orderFilter)
                      .map(o => (
                        <tr key={o.id} className="hover:bg-pink-50/20">
                          <td className="p-3 font-mono font-bold text-pink-600">{o.order_number}</td>
                          <td className="p-3">
                            <p className="font-semibold text-stone-900 dark:text-stone-100">{o.customer_name}</p>
                            <p className="text-stone-500 font-mono">+91 {o.customer_phone}</p>
                          </td>
                          <td className="p-3 max-w-xs truncate text-stone-600 dark:text-stone-400">
                            {o.address}, {o.city} ({o.pincode})
                          </td>
                          <td className="p-3 font-bold text-stone-900 dark:text-stone-100">₹{o.total}</td>
                          <td className="p-3">
                            <p className="font-bold text-[10px] uppercase">{o.payment_method}</p>
                            <p className="font-mono text-stone-500 text-[11px] truncate max-w-[120px]">
                              UTR: {o.utr_number}
                            </p>
                            {o.payment_screenshot_url && (
                              <button
                                onClick={() => setViewingImageModal(o.payment_screenshot_url!)}
                                className="text-[10px] text-pink-600 hover:underline flex items-center gap-1 font-semibold mt-0.5"
                              >
                                <Eye className="w-3 h-3" /> View Screenshot
                              </button>
                            )}
                          </td>
                          <td className="p-3">
                            <select
                              value={o.status}
                              onChange={e => handleUpdateOrderStatus(o.id, e.target.value as OrderStatus)}
                              className="py-1 px-2 rounded-lg border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-[11px] font-semibold"
                            >
                              <option value="pending_verification">Pending</option>
                              <option value="confirmed">Confirmed</option>
                              <option value="packed">Packed</option>
                              <option value="shipped">Shipped</option>
                              <option value="delivered">Delivered</option>
                              <option value="rejected">Rejected</option>
                            </select>
                          </td>
                          <td className="p-3">
                            {o.tracking_number ? (
                              <p className="font-mono text-[11px] text-emerald-600 font-bold truncate max-w-[120px]">
                                {o.tracking_number}
                              </p>
                            ) : (
                              <button
                                onClick={() => {
                                  setSelectedOrderForTracking(o);
                                  setTrackingNumberInput(o.tracking_number || '');
                                  setCourierNameInput(o.courier_name || 'Delhivery Express');
                                }}
                                className="text-[11px] text-pink-600 hover:underline font-semibold flex items-center gap-1"
                              >
                                <Truck className="w-3 h-3" /> Add Tracking
                              </button>
                            )}

                            {o.packing_proof_url && (
                              <button
                                onClick={() => setViewingImageModal(o.packing_proof_url!)}
                                className="text-[10px] text-purple-600 hover:underline flex items-center gap-1 mt-0.5 font-medium"
                              >
                                <Video className="w-3 h-3" /> View Proof
                              </button>
                            )}
                          </td>
                          <td className="p-3 text-right space-x-1.5 whitespace-nowrap">
                            <button
                              onClick={() => sendWhatsAppUpdate(o)}
                              className="p-1.5 rounded-lg bg-[#25D366]/20 text-[#25D366] hover:bg-[#25D366]/30"
                              title="Send Status to Customer via WhatsApp"
                            >
                              <MessageCircle className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setSelectedOrderDetails(o)}
                              className="p-1.5 text-stone-600 hover:text-pink-600"
                              title="Full Order Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 5: ABANDONED CARTS */}
        {/* ======================================================== */}
        {activeTab === 'abandoned' && (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 dark:text-stone-100">
                Abandoned Carts Tracker
              </h1>
              <p className="text-xs text-stone-500 mt-1">
                Saved whenever a customer enters their phone number at checkout without completing. Click to send prefilled WhatsApp recovery message.
              </p>
            </div>

            <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-stone-50 dark:bg-stone-800 text-stone-600 dark:text-stone-400 uppercase font-semibold">
                    <tr>
                      <th className="p-3">Customer Phone</th>
                      <th className="p-3">Customer Name</th>
                      <th className="p-3">Items in Bag</th>
                      <th className="p-3">Cart Total</th>
                      <th className="p-3">Time</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-right">Recovery Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                    {abandonedCarts.map(cart => (
                      <tr key={cart.id} className="hover:bg-pink-50/20">
                        <td className="p-3 font-mono font-bold text-stone-900 dark:text-stone-100">
                          +91 {cart.phone}
                        </td>
                        <td className="p-3 font-medium">{cart.customer_name || 'Anonymous Guest'}</td>
                        <td className="p-3">
                          <p className="truncate max-w-xs text-stone-600 dark:text-stone-300">
                            {cart.items.map(i => `${i.product_name} (x${i.quantity})`).join(', ')}
                          </p>
                        </td>
                        <td className="p-3 font-bold text-pink-600">₹{cart.total}</td>
                        <td className="p-3 text-stone-400">
                          {new Date(cart.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })},{' '}
                          {new Date(cart.created_at).toLocaleDateString()}
                        </td>
                        <td className="p-3">
                          {cart.is_reminded ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                              Reminded
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                              Pending
                            </span>
                          )}
                        </td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => sendAbandonedCartWhatsApp(cart)}
                            className="px-3 py-1.5 rounded-xl bg-[#25D366] hover:bg-[#20ba5a] text-white font-semibold text-xs inline-flex items-center gap-1.5 transition-colors shadow-sm"
                          >
                            <MessageCircle className="w-3.5 h-3.5 fill-white" />
                            <span>Remind on WhatsApp</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 6: RESTOCK NOTIFY REQUESTS */}
        {/* ======================================================== */}
        {activeTab === 'notify' && (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 dark:text-stone-100">
                Restock Notifications Queue
              </h1>
              <p className="text-xs text-stone-500 mt-1">
                Customers waiting for sold-out items to return in stock. Click to notify them on WhatsApp.
              </p>
            </div>

            <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-stone-50 dark:bg-stone-800 text-stone-600 dark:text-stone-400 uppercase font-semibold">
                    <tr>
                      <th className="p-3">Product Name</th>
                      <th className="p-3">Customer Phone</th>
                      <th className="p-3">Requested At</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                    {notifyRequests.map(req => (
                      <tr key={req.id} className="hover:bg-pink-50/20">
                        <td className="p-3 font-semibold text-stone-900 dark:text-stone-100">{req.product_name}</td>
                        <td className="p-3 font-mono font-medium">+91 {req.phone}</td>
                        <td className="p-3 text-stone-400">{new Date(req.created_at).toLocaleDateString()}</td>
                        <td className="p-3">
                          {req.is_notified ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                              Notified
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                              Waiting
                            </span>
                          )}
                        </td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => sendRestockWhatsApp(req)}
                            className="px-3 py-1.5 rounded-xl bg-pink-600 hover:bg-pink-700 text-white font-semibold text-xs inline-flex items-center gap-1.5 transition-colors"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            <span>Notify on WhatsApp</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 7: UPI & QR SETTINGS */}
        {/* ======================================================== */}
        {activeTab === 'payments' && (() => {
          const gatewaysList: PaymentGatewayConfig[] = (siteSettings?.payment_gateways && Array.isArray(siteSettings.payment_gateways) && siteSettings.payment_gateways.length > 0)
            ? siteSettings.payment_gateways
            : INITIAL_SETTINGS.payment_gateways;

          const handleGatewayToggle = (index: number, enabled: boolean) => {
            const current = [...gatewaysList];
            current[index] = { ...current[index], is_enabled: enabled };
            if (siteSettings) setSiteSettings({ ...siteSettings, payment_gateways: current });
            saveSiteSettings({ payment_gateways: current });
          };

          const handleGatewayUpiChange = (index: number, newUpi: string) => {
            const current = [...gatewaysList];
            current[index] = { ...current[index], upi_id: newUpi };
            if (siteSettings) setSiteSettings({ ...siteSettings, payment_gateways: current });
          };

          const handleGatewayNameChange = (index: number, newName: string) => {
            const current = [...gatewaysList];
            current[index] = { ...current[index], name: newName };
            if (siteSettings) setSiteSettings({ ...siteSettings, payment_gateways: current });
          };

          const handleGatewayQrUpload = async (index: number, file: File) => {
            const gwId = gatewaysList[index]?.id || String(index);
            setUploadingGatewayId(gwId);
            try {
              const newQrUrl = await compressAndProcessImage(file);
              const current = [...gatewaysList];
              current[index] = { ...current[index], qr_image: newQrUrl };
              if (siteSettings) setSiteSettings({ ...siteSettings, payment_gateways: current });
              await saveSiteSettings({ payment_gateways: current });
              setGatewaySuccessMsg(`✅ QR code for "${current[index].name}" uploaded and saved successfully!`);
              setTimeout(() => setGatewaySuccessMsg(''), 4500);
            } catch (err) {
              console.error('Error uploading QR:', err);
              alert('Failed to process image. Please try again with a valid JPG/PNG file.');
            } finally {
              setUploadingGatewayId(null);
            }
          };

          const handleGenerateAutoQr = async (index: number) => {
            const upi = gatewaysList[index]?.upi_id?.trim();
            if (!upi) {
              alert('Please enter a valid Merchant UPI ID first (e.g. 8523996310@paytm).');
              return;
            }
            const autoQr = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(`upi://pay?pa=${upi}&pn=Glim%20Accessories&mc=0000&mode=02&purpose=00`)}`;
            const current = [...gatewaysList];
            current[index] = { ...current[index], qr_image: autoQr };
            if (siteSettings) setSiteSettings({ ...siteSettings, payment_gateways: current });
            await saveSiteSettings({ payment_gateways: current });
            setGatewaySuccessMsg(`✅ Auto-generated QR Code for "${current[index].name}" using UPI ID: ${upi}`);
            setTimeout(() => setGatewaySuccessMsg(''), 4500);
          };

          const handleCopyUpiId = (index: number, upiId: string) => {
            navigator.clipboard.writeText(upiId);
            setCopiedUpiGatewayId(gatewaysList[index]?.id || String(index));
            setTimeout(() => setCopiedUpiGatewayId(null), 2000);
          };

          const handleSaveAllPaymentGateways = async () => {
            setSavingGateways(true);
            try {
              await saveSiteSettings({ payment_gateways: gatewaysList });
              setGatewaySuccessMsg('✅ All UPI & QR settings saved successfully and live on customer checkout!');
              setTimeout(() => setGatewaySuccessMsg(''), 5000);
            } catch (err) {
              console.error(err);
              alert('Error saving payment settings. Please try again.');
            } finally {
              setSavingGateways(false);
            }
          };

          const handleResetPaymentGateways = async () => {
            if (window.confirm('Reset all payment gateways back to standard PhonePe, Google Pay and Paytm defaults?')) {
              const defaults = [...INITIAL_SETTINGS.payment_gateways];
              if (siteSettings) setSiteSettings({ ...siteSettings, payment_gateways: defaults });
              await saveSiteSettings({ payment_gateways: defaults });
              setGatewaySuccessMsg('✅ Payment gateways reset to defaults successfully!');
              setTimeout(() => setGatewaySuccessMsg(''), 4500);
            }
          };

          const handleAddNewGateway = () => {
            const newId = `gateway_${Date.now()}`;
            const newGateway: PaymentGatewayConfig = {
              id: newId,
              name: 'BHIM / Any UPI QR',
              upi_id: '8523996310@paytm',
              qr_image: 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=upi://pay?pa=8523996310@paytm&pn=Glim%20Accessories&mc=0000&mode=02&purpose=00',
              is_enabled: true,
            };
            const current = [...gatewaysList, newGateway];
            if (siteSettings) setSiteSettings({ ...siteSettings, payment_gateways: current });
            saveSiteSettings({ payment_gateways: current });
            setGatewaySuccessMsg('✅ Added new payment gateway card! You can now upload your QR code image.');
            setTimeout(() => setGatewaySuccessMsg(''), 4500);
          };

          const handleDeleteGateway = (index: number) => {
            if (gatewaysList.length <= 1) {
              alert('You must have at least one payment gateway configured for checkout.');
              return;
            }
            if (window.confirm(`Delete payment option "${gatewaysList[index].name}"?`)) {
              const current = [...gatewaysList];
              current.splice(index, 1);
              if (siteSettings) setSiteSettings({ ...siteSettings, payment_gateways: current });
              saveSiteSettings({ payment_gateways: current });
              setGatewaySuccessMsg('Payment gateway removed.');
              setTimeout(() => setGatewaySuccessMsg(''), 3000);
            }
          };

          return (
            <div className="space-y-6 animate-fadeIn max-w-4xl">
              {/* Top Header & Actions */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2.5">
                    <QrCode className="w-7 h-7 text-pink-600" />
                    <span>UPI &amp; QR Payment Settings</span>
                  </h1>
                  <p className="text-xs text-stone-500 mt-1">
                    Upload your store's real PhonePe, Google Pay, or Paytm QR codes. Customers scan this QR to pay during checkout.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={handleResetPaymentGateways}
                    className="px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-700 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Reset Defaults</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleAddNewGateway}
                    className="px-3.5 py-2 rounded-xl border border-pink-200 dark:border-pink-900 bg-pink-50 dark:bg-pink-950/40 text-pink-700 dark:text-pink-300 hover:bg-pink-100 dark:hover:bg-pink-900/60 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add UPI Option</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleSaveAllPaymentGateways}
                    disabled={savingGateways}
                    className="px-4 py-2 rounded-xl bg-pink-600 hover:bg-pink-700 active:scale-95 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
                  >
                    {savingGateways ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-3.5 h-3.5" />
                        <span>Save All Changes</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Notification Banner */}
              {gatewaySuccessMsg && (
                <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs font-semibold text-emerald-800 dark:text-emerald-200 flex items-center gap-2 animate-fadeIn shadow-sm">
                  <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>{gatewaySuccessMsg}</span>
                </div>
              )}

              {/* Helpful Instructions Box */}
              <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 flex items-start gap-3 text-xs text-amber-900 dark:text-amber-200">
                <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-semibold">How to upload your store QR code:</p>
                  <p className="text-[11px] text-amber-800/90 dark:text-amber-300/80 leading-relaxed">
                    1. Open PhonePe, Google Pay, or Paytm on your mobile phone and take a screenshot of your personal or business QR code.<br />
                    2. Click <strong>"Upload QR Code Image"</strong> on the matching card below and select the screenshot from your photos.<br />
                    3. Enter your Merchant UPI ID (e.g. <code>8523996310@paytm</code> or <code>rekha@oksbi</code>) so customers can copy it if scanning fails.<br />
                    4. Click <strong>"Save All Changes"</strong> — your new QR code will instantly appear on customer checkout!
                  </p>
                </div>
              </div>

              {/* Gateway Cards List */}
              <div className="space-y-5">
                {gatewaysList.map((gw, idx) => {
                  const isUploadingThis = uploadingGatewayId === gw.id;
                  const isPhonePe = gw.id.includes('phonepe') || gw.name.toLowerCase().includes('phonepe');
                  const isGPay = gw.id.includes('gpay') || gw.name.toLowerCase().includes('google');
                  const isPaytm = gw.id.includes('paytm') || gw.name.toLowerCase().includes('paytm');

                  const badgeColor = isPhonePe
                    ? 'bg-purple-100 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300 border-purple-200'
                    : isGPay
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 border-blue-200'
                    : isPaytm
                    ? 'bg-cyan-100 text-cyan-800 dark:bg-cyan-950/50 dark:text-cyan-300 border-cyan-200'
                    : 'bg-pink-100 text-pink-700 dark:bg-pink-950/50 dark:text-pink-300 border-pink-200';

                  return (
                    <div
                      key={gw.id || idx}
                      className="bg-white dark:bg-stone-900 p-5 sm:p-6 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-sm transition-all hover:border-pink-200 dark:hover:border-stone-700"
                    >
                      {/* Gateway Card Header */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-stone-100 dark:border-stone-800 gap-3">
                        <div className="flex items-center gap-3">
                          <span className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg border ${badgeColor}`}>
                            {gw.name}
                          </span>

                          <input
                            type="text"
                            value={gw.name}
                            onChange={e => handleGatewayNameChange(idx, e.target.value)}
                            onBlur={() => saveSiteSettings({ payment_gateways: gatewaysList })}
                            className="text-sm font-semibold text-stone-800 dark:text-stone-200 bg-transparent border-b border-transparent hover:border-stone-300 focus:border-pink-500 focus:outline-none px-1"
                            placeholder="Gateway Name"
                          />
                        </div>

                        <div className="flex items-center gap-3">
                          {/* Active / Enabled Toggle */}
                          <label className="flex items-center gap-2 cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={gw.is_enabled}
                              onChange={e => handleGatewayToggle(idx, e.target.checked)}
                              className="sr-only"
                            />
                            <div className={`w-9 h-5 flex items-center rounded-full p-0.5 transition-colors ${gw.is_enabled ? 'bg-emerald-500' : 'bg-stone-300 dark:bg-stone-700'}`}>
                              <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${gw.is_enabled ? 'translate-x-4' : 'translate-x-0'}`} />
                            </div>
                            <span className={`text-xs font-semibold ${gw.is_enabled ? 'text-emerald-600 dark:text-emerald-400' : 'text-stone-400'}`}>
                              {gw.is_enabled ? 'Active at Checkout' : 'Disabled'}
                            </span>
                          </label>

                          {/* Delete Gateway */}
                          {gatewaysList.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleDeleteGateway(idx)}
                              className="p-1.5 rounded-lg text-stone-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                              title="Delete this gateway"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Gateway Card Body */}
                      <div className="mt-5 flex flex-col md:flex-row items-center md:items-start gap-6">
                        {/* QR Code Preview Box */}
                        <div className="flex flex-col items-center">
                          <div className="w-36 h-36 sm:w-40 sm:h-40 rounded-2xl border-2 border-dashed border-pink-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800/60 p-2.5 relative flex items-center justify-center overflow-hidden shadow-inner group">
                            {gw.qr_image ? (
                              <img
                                src={gw.qr_image}
                                alt={gw.name}
                                className="w-full h-full object-contain cursor-pointer hover:scale-105 transition-transform"
                                onClick={() => setViewingImageModal(gw.qr_image)}
                                title="Click to enlarge QR code"
                              />
                            ) : (
                              <div className="text-center p-2 text-stone-400">
                                <QrCode className="w-10 h-10 mx-auto text-stone-300 mb-1" />
                                <span className="text-[10px]">No QR set</span>
                              </div>
                            )}

                            {/* Uploading Spinner Overlay */}
                            {isUploadingThis && (
                              <div className="absolute inset-0 bg-white/95 dark:bg-stone-900/95 flex flex-col items-center justify-center p-3 text-center z-10">
                                <div className="w-7 h-7 border-3 border-pink-500 border-t-transparent rounded-full animate-spin mb-2" />
                                <span className="text-[11px] font-bold text-pink-600">Uploading QR...</span>
                                <span className="text-[9px] text-stone-400 mt-0.5">Optimizing &amp; Saving</span>
                              </div>
                            )}
                          </div>

                          {gw.qr_image && (
                            <button
                              type="button"
                              onClick={() => setViewingImageModal(gw.qr_image)}
                              className="text-[10px] text-pink-600 hover:text-pink-700 font-semibold mt-2 flex items-center gap-1"
                            >
                              <Eye className="w-3 h-3" />
                              <span>View Full Size</span>
                            </button>
                          )}
                        </div>

                        {/* Gateway Controls */}
                        <div className="flex-1 space-y-4 w-full">
                          {/* File Upload Button */}
                          <div>
                            <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1.5">
                              Upload QR Code Image
                            </label>

                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                              <label className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-pink-200 dark:border-pink-800 bg-pink-50/70 hover:bg-pink-100 dark:bg-pink-950/30 dark:hover:bg-pink-900/50 text-pink-700 dark:text-pink-300 cursor-pointer text-xs font-bold transition-all shadow-sm">
                                <Upload className="w-4 h-4 flex-shrink-0" />
                                <span>{isUploadingThis ? 'Processing...' : 'Upload Image File (PNG, JPG)'}</span>
                                <input
                                  type="file"
                                  accept="image/*"
                                  disabled={isUploadingThis}
                                  className="hidden"
                                  onChange={e => {
                                    if (e.target.files && e.target.files[0]) {
                                      handleGatewayQrUpload(idx, e.target.files[0]);
                                    }
                                  }}
                                />
                              </label>

                              <button
                                type="button"
                                onClick={() => handleGenerateAutoQr(idx)}
                                className="px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-sm whitespace-nowrap"
                                title="Generate QR code automatically using the UPI ID below"
                              >
                                <Sparkles className="w-3.5 h-3.5 text-pink-500" />
                                <span>Auto-Generate QR</span>
                              </button>
                            </div>
                            <p className="text-[11px] text-stone-400 mt-1">
                              Supports camera captures, phone screenshots, and scanned UPI QR codes.
                            </p>
                          </div>

                          {/* Merchant UPI ID Input */}
                          <div>
                            <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1.5">
                              Merchant UPI ID
                            </label>
                            <div className="flex items-center gap-2">
                              <input
                                type="text"
                                value={gw.upi_id}
                                placeholder="e.g. 8523996310@paytm or rekha@oksbi"
                                onChange={e => handleGatewayUpiChange(idx, e.target.value)}
                                onBlur={() => saveSiteSettings({ payment_gateways: gatewaysList })}
                                className="flex-1 px-3.5 py-2 text-xs font-mono rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-pink-500"
                              />

                              <button
                                type="button"
                                onClick={() => handleCopyUpiId(idx, gw.upi_id)}
                                className="px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-700 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
                                title="Copy UPI ID to test"
                              >
                                {copiedUpiGatewayId === (gw.id || String(idx)) ? (
                                  <>
                                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                                    <span className="text-[11px] text-emerald-600">Copied</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-3.5 h-3.5" />
                                    <span className="text-[11px]">Copy</span>
                                  </>
                                )}
                              </button>
                            </div>
                            <p className="text-[11px] text-stone-400 mt-1">
                              Customers can click to copy this UPI ID to make payment via any UPI app.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Bottom Sticky-style Save Action */}
              <div className="p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="text-xs text-stone-500">
                  <span className="font-semibold text-stone-800 dark:text-stone-200">Tip:</span> Any change saved here takes effect immediately for customers browsing your store!
                </div>

                <button
                  type="button"
                  onClick={handleSaveAllPaymentGateways}
                  disabled={savingGateways}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-pink-600 hover:bg-pink-700 active:scale-95 text-white text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-md"
                >
                  {savingGateways ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Saving Payment Settings...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Save All Payment Settings</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })()}

        {/* ======================================================== */}
        {/* TAB 8: CUSTOMER REVIEWS */}
        {/* ======================================================== */}
        {activeTab === 'reviews' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 dark:text-stone-100">
                  Customer Testimonials
                </h1>
                <p className="text-xs text-stone-500 mt-1">
                  Posted exclusively by admin. Appears on homepage with customer quotes &amp; proof pictures.
                </p>
              </div>

              <button
                onClick={() =>
                  setEditingReview({
                    customer_name: '',
                    city: 'Pondicherry',
                    rating: 5,
                    review_text: '',
                    product_name: '',
                    is_hidden: false,
                    sort_order: reviews.length + 1,
                  })
                }
                className="px-4 py-2.5 bg-pink-600 hover:bg-pink-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Add Review</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {reviews.map(rev => (
                <div
                  key={rev.id}
                  className="bg-white dark:bg-stone-900 p-5 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-sm space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-serif font-bold text-stone-900 dark:text-stone-100 text-sm">
                        {rev.customer_name}
                      </h4>
                      <p className="text-xs text-stone-400">{rev.city}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setEditingReview(rev)}
                        className="text-stone-400 hover:text-pink-600 p-1"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={async () => {
                          if (confirm('Delete review?')) await deleteReview(rev.id);
                        }}
                        className="text-stone-400 hover:text-red-500 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <p className="text-xs italic text-stone-600 dark:text-stone-300">"{rev.review_text}"</p>

                  {rev.photo_url && (
                    <img
                      src={rev.photo_url}
                      alt=""
                      className="w-16 h-16 rounded-xl object-cover border border-stone-200"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 9: COUPONS & OFFERS */}
        {/* ======================================================== */}
        {activeTab === 'coupons' && (
          <div className="space-y-8 animate-fadeIn max-w-4xl">
            {/* Automatic Offer: Buy 2 get 10% off */}
            {siteSettings && (
              <div className="bg-white dark:bg-stone-900 p-6 rounded-2xl border border-pink-200 dark:border-stone-800 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-pink-600" />
                    <h3 className="font-serif font-bold text-base text-stone-900 dark:text-stone-100">
                      Auto Offer: Buy 2 Get 10% OFF
                    </h3>
                  </div>
                  <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={siteSettings.buy2_get10_enabled}
                      onChange={e =>
                        saveSiteSettings({ buy2_get10_enabled: e.target.checked })
                      }
                    />
                    <span>{siteSettings.buy2_get10_enabled ? 'Active' : 'Disabled'}</span>
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-stone-600 dark:text-stone-400 mb-1">
                      Minimum Eligible Quantity
                    </label>
                    <input
                      type="number"
                      value={siteSettings.buy2_qty}
                      onChange={e =>
                        saveSiteSettings({ buy2_qty: Number(e.target.value) })
                      }
                      className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 dark:border-stone-700 bg-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-600 dark:text-stone-400 mb-1">
                      Discount Percentage (%)
                    </label>
                    <input
                      type="number"
                      value={siteSettings.buy2_percent}
                      onChange={e =>
                        saveSiteSettings({ buy2_percent: Number(e.target.value) })
                      }
                      className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 dark:border-stone-700 bg-transparent"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Coupons List */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-serif font-bold text-lg text-stone-900 dark:text-stone-100">
                  Promo Coupons
                </h3>
                <button
                  onClick={() =>
                    setEditingCoupon({
                      code: '',
                      discount_type: 'percentage',
                      discount_value: 10,
                      min_order_value: 299,
                      is_active: true,
                    })
                  }
                  className="px-4 py-2 bg-pink-600 text-white rounded-xl text-xs font-semibold flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Coupon</span>
                </button>
              </div>

              <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-sm overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-stone-50 dark:bg-stone-800 text-stone-600 dark:text-stone-400 uppercase font-semibold">
                    <tr>
                      <th className="p-3">Code</th>
                      <th className="p-3">Discount</th>
                      <th className="p-3">Min Order</th>
                      <th className="p-3">Times Used</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                    {coupons.map(cpn => (
                      <tr key={cpn.id} className="hover:bg-pink-50/20">
                        <td className="p-3 font-mono font-bold text-pink-600">{cpn.code}</td>
                        <td className="p-3 font-semibold">
                          {cpn.discount_type === 'percentage'
                            ? `${cpn.discount_value}% OFF`
                            : `₹${cpn.discount_value} FLAT OFF`}
                        </td>
                        <td className="p-3">₹{cpn.min_order_value}</td>
                        <td className="p-3 font-bold">{cpn.times_used || 0}</td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              cpn.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-200 text-stone-700'
                            }`}
                          >
                            {cpn.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <button
                            onClick={async () => {
                              if (confirm(`Delete coupon "${cpn.code}"?`)) await deleteCoupon(cpn.id);
                            }}
                            className="text-stone-400 hover:text-red-500 p-1"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 10: SITE & SHIPPING SETTINGS */}
        {/* ======================================================== */}
        {activeTab === 'settings' && (() => {
          const currentSettings = siteSettings || INITIAL_SETTINGS;

          const handleSaveSiteSettings = async () => {
            setIsSavingSettings(true);
            setSettingsSuccessNotice('');
            try {
              const saved = await saveSiteSettings(currentSettings);
              setSiteSettings(saved);
              setSettingsSuccessNotice('✅ Site and shipping settings updated live for all customers!');
              setTimeout(() => setSettingsSuccessNotice(''), 4500);
            } catch (err) {
              console.error('Failed to save settings:', err);
              alert('Failed to save settings. Please try again.');
            } finally {
              setIsSavingSettings(false);
            }
          };

          return (
            <div className="space-y-6 animate-fadeIn max-w-4xl">
              <div>
                <h1 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2.5">
                  <Settings className="w-7 h-7 text-pink-600" />
                  <span>Site &amp; Shipping Settings</span>
                </h1>
                <p className="text-xs text-stone-500 mt-1">
                  Customize announcement bar text, free shipping threshold, flat shipping fee, address, and WhatsApp contact. Changes reflect live on storefront.
                </p>
              </div>

              {/* Success Notification Alert */}
              {settingsSuccessNotice && (
                <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs font-semibold text-emerald-800 dark:text-emerald-200 flex items-center gap-2 animate-fadeIn shadow-sm">
                  <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>{settingsSuccessNotice}</span>
                </div>
              )}

              <div className="bg-white dark:bg-stone-900 p-6 sm:p-8 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-sm space-y-5">
                <div>
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1.5">
                    Top Announcement Bar Text
                  </label>
                  <input
                    type="text"
                    value={currentSettings.announcement_bar_text}
                    onChange={e =>
                      setSiteSettings(s => ({ ...(s || INITIAL_SETTINGS), announcement_bar_text: e.target.value }))
                    }
                    placeholder="e.g. Free shipping above Rs.999 📦 | No COD • No Returns • No Refunds"
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-pink-500 font-medium"
                  />
                  <p className="text-[11px] text-stone-400 mt-1">
                    Appears in the running banner at the top of every page for customer announcements.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1.5">
                      Free Shipping Threshold (₹)
                    </label>
                    <input
                      type="number"
                      value={currentSettings.free_shipping_threshold}
                      onChange={e =>
                        setSiteSettings(s => ({
                          ...(s || INITIAL_SETTINGS),
                          free_shipping_threshold: Number(e.target.value),
                        }))
                      }
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-pink-500 font-mono"
                    />
                    <p className="text-[10px] text-stone-400 mt-1">Default ₹999 — orders at or above this get free shipping</p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1.5">
                      Base Shipping Fee (₹)
                    </label>
                    <input
                      type="number"
                      value={currentSettings.flat_shipping_fee}
                      onChange={e =>
                        setSiteSettings(s => ({
                          ...(s || INITIAL_SETTINGS),
                          flat_shipping_fee: Number(e.target.value),
                        }))
                      }
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-pink-500 font-mono"
                    />
                    <p className="text-[10px] text-stone-400 mt-1">
                      Active rates: <strong>₹50</strong> for Tamil Nadu &amp; Pondicherry • <strong>₹80</strong> for South India • <strong>₹150</strong> for North India
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1.5">
                      Store WhatsApp Number
                    </label>
                    <input
                      type="text"
                      value={currentSettings.whatsapp_number}
                      onChange={e =>
                        setSiteSettings(s => ({ ...(s || INITIAL_SETTINGS), whatsapp_number: e.target.value }))
                      }
                      placeholder="+918523996310"
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-pink-500 font-mono"
                    />
                    <p className="text-[11px] text-stone-400 mt-1">Used for floating WhatsApp chat &amp; order updates</p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1.5">
                      Instagram Profile Link
                    </label>
                    <input
                      type="text"
                      value={currentSettings.instagram_url}
                      onChange={e =>
                        setSiteSettings(s => ({ ...(s || INITIAL_SETTINGS), instagram_url: e.target.value }))
                      }
                      placeholder="https://instagram.com/glim_accessories_"
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-pink-500"
                    />
                    <p className="text-[11px] text-stone-400 mt-1">Links to your Instagram page across headers &amp; footers</p>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1.5">
                    Physical Store Address
                  </label>
                  <input
                    type="text"
                    value={currentSettings.store_address}
                    onChange={e =>
                      setSiteSettings(s => ({ ...(s || INITIAL_SETTINGS), store_address: e.target.value }))
                    }
                    placeholder="Romand Rolland St, opp. Dune Cafe, Pondicherry"
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-pink-500"
                  />
                  <p className="text-[11px] text-stone-400 mt-1">Displayed in website footer &amp; contact sections</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1.5">
                    Google Maps URL
                  </label>
                  <input
                    type="text"
                    value={currentSettings.google_maps_url}
                    onChange={e =>
                      setSiteSettings(s => ({ ...(s || INITIAL_SETTINGS), google_maps_url: e.target.value }))
                    }
                    placeholder="https://maps.google.com/?q=..."
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-pink-500"
                  />
                  <p className="text-[11px] text-stone-400 mt-1">Customer map link in footer and store location card</p>
                </div>

                <div className="pt-3 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between">
                  <span className="text-[11px] text-stone-400">
                    Saves to database and applies live immediately.
                  </span>

                  <button
                    type="button"
                    disabled={isSavingSettings}
                    onClick={handleSaveSiteSettings}
                    className="px-6 py-2.5 rounded-xl bg-pink-600 hover:bg-pink-700 active:scale-95 disabled:opacity-50 text-white font-bold text-xs transition-all shadow-md flex items-center gap-2"
                  >
                    {isSavingSettings ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Saving Settings...</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-3.5 h-3.5" />
                        <span>Save Settings</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          );
        })()}

        {/* ======================================================== */}
        {/* TAB 11: SUPABASE STATUS & CONFIGURATION */}
        {/* ======================================================== */}
        {activeTab === 'supabase' && (
          <div className="space-y-6 animate-fadeIn max-w-4xl">
            <div>
              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 dark:text-stone-100">
                Supabase Backend Configuration
              </h1>
              <p className="text-xs text-stone-500 mt-1">
                PostgreSQL database, Storage Buckets, Row-Level-Security, and live sync.
              </p>
            </div>

            <div className="bg-white dark:bg-stone-900 p-6 sm:p-8 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-sm space-y-6">
              <div className="p-4 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-3.5 h-3.5 rounded-full ${
                      isSupabaseConfigured() ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                    }`}
                  />
                  <div>
                    <p className="font-semibold text-xs text-stone-900 dark:text-stone-100">
                      Backend Status:{' '}
                      {isSupabaseConfigured()
                        ? 'Connected to Live Supabase Postgres'
                        : 'Active with Resilient Realtime Engine'}
                    </p>
                    <p className="text-[11px] text-stone-500">
                      Changes are 100% reactive across windows and persisted reliably.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-serif font-bold text-sm text-stone-900 dark:text-stone-100">
                  Connect Your Supabase Project:
                </h4>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Supabase Project URL
                  </label>
                  <input
                    type="text"
                    value={customSbUrl}
                    onChange={e => setCustomSbUrl(e.target.value)}
                    placeholder="https://xyzcompany.supabase.co"
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-stone-300 dark:border-stone-700 bg-transparent font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Supabase Anon Public Key
                  </label>
                  <input
                    type="password"
                    value={customSbKey}
                    onChange={e => setCustomSbKey(e.target.value)}
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI..."
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-stone-300 dark:border-stone-700 bg-transparent font-mono"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => {
                    localStorage.setItem(
                      'glim_supabase_custom_keys',
                      JSON.stringify({ url: customSbUrl.trim(), anonKey: customSbKey.trim() })
                    );
                    setSbStatusMsg('Supabase project credentials saved! Reloading store client...');
                    setTimeout(() => window.location.reload(), 1000);
                  }}
                  className="px-5 py-2.5 bg-pink-600 hover:bg-pink-700 text-white rounded-xl text-xs font-semibold transition-colors"
                >
                  Save &amp; Connect Supabase
                </button>

                {sbStatusMsg && <p className="text-xs text-emerald-600 font-medium">{sbStatusMsg}</p>}
              </div>

              {/* SQL Schema Reference instructions */}
              <div className="pt-4 border-t border-stone-200 dark:border-stone-800 space-y-2">
                <h5 className="font-serif font-bold text-xs text-stone-900 dark:text-stone-100">
                  SQL Schema &amp; Storage Buckets
                </h5>
                <p className="text-xs text-stone-500 leading-relaxed">
                  The complete SQL migration script is saved in <code>supabase/schema.sql</code>. It includes all 17 categories, table schemas, Row-Level-Security policies, and automatic stock deduction triggers.
                </p>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ======================================================== */}
      {/* PRODUCT ADD / EDIT MODAL */}
      {/* ======================================================== */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-stone-900 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden border border-pink-100 dark:border-stone-800 max-h-[90vh] flex flex-col">
            <div className="p-5 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between">
              <h3 className="font-serif font-bold text-lg text-stone-900 dark:text-stone-100">
                {editingProduct.id ? 'Edit Product' : 'Add New Product'}
              </h3>
              <button onClick={() => setEditingProduct(null)} className="text-stone-400 hover:text-stone-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="p-6 overflow-y-auto space-y-4 text-xs">
              <div>
                <label className="block font-semibold mb-1">Product Name *</label>
                <input
                  type="text"
                  required
                  value={editingProduct.name || ''}
                  onChange={e => setEditingProduct(p => ({ ...p, name: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-transparent text-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Selling Price (₹) *</label>
                  <input
                    type="number"
                    required
                    value={editingProduct.price ?? ''}
                    onChange={e => setEditingProduct(p => ({ ...p, price: Number(e.target.value) }))}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-transparent"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">Old Strikethrough Price (₹)</label>
                  <input
                    type="number"
                    value={editingProduct.old_price ?? ''}
                    onChange={e => setEditingProduct(p => ({ ...p, old_price: Number(e.target.value) }))}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-transparent"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">Stock Count *</label>
                  <input
                    type="number"
                    required
                    value={editingProduct.stock ?? 10}
                    onChange={e => setEditingProduct(p => ({ ...p, stock: Number(e.target.value) }))}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Category *</label>
                  <select
                    value={editingProduct.category_id || categories[0]?.id}
                    onChange={e => setEditingProduct(p => ({ ...p, category_id: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-transparent"
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1">Size Guide Type (If Applicable)</label>
                  <select
                    value={editingProduct.size_guide_type || ''}
                    onChange={e =>
                      setEditingProduct(p => ({
                        ...p,
                        size_guide_type: (e.target.value as any) || undefined,
                      }))
                    }
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-transparent"
                  >
                    <option value="">None</option>
                    <option value="chain">Chain / Necklace (16", 18", 20")</option>
                    <option value="ring">Ring Size Chart</option>
                    <option value="kada">Kada / Bracelet Wrist Size</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Instagram Reel Link (Optional)</label>
                <input
                  type="text"
                  value={editingProduct.instagram_reel_url || ''}
                  onChange={e => setEditingProduct(p => ({ ...p, instagram_reel_url: e.target.value }))}
                  placeholder="https://instagram.com/reel/..."
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-transparent"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Description</label>
                <textarea
                  rows={3}
                  value={editingProduct.description || ''}
                  onChange={e => setEditingProduct(p => ({ ...p, description: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-transparent"
                />
              </div>

              {/* Anti-Tarnish Toggle */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="anti_tarnish_toggle"
                  checked={editingProduct.is_anti_tarnish || false}
                  onChange={e => setEditingProduct(p => ({ ...p, is_anti_tarnish: e.target.checked }))}
                />
                <label htmlFor="anti_tarnish_toggle" className="font-semibold cursor-pointer">
                  ✨ 100% Anti-Tarnish &amp; Waterproof Badge
                </label>
              </div>

              {/* Images Manager */}
              <div className="space-y-2 pt-2 border-t border-stone-200 dark:border-stone-800">
                <label className="block font-semibold">Upload Product Images (Compressed on upload)</label>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleMultipleImageUpload}
                  className="text-xs text-stone-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:bg-pink-100 file:text-pink-700"
                />
                {isUploading && <p className="text-pink-600 animate-pulse">Compressing and processing images...</p>}

                {editingProduct.images && editingProduct.images.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-2">
                    {editingProduct.images.map((img, i) => (
                      <div key={i} className="relative w-16 h-16 rounded-xl overflow-hidden border border-stone-200">
                        <img src={img} alt="" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() =>
                            setEditingProduct(p => ({
                              ...p,
                              images: p?.images?.filter((_, idx) => idx !== i),
                            }))
                          }
                          className="absolute top-1 right-1 bg-black/70 text-white rounded-full p-0.5"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="p-4 border-t border-stone-200 dark:border-stone-800 flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="px-4 py-2 border rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-pink-600 hover:bg-pink-700 text-white font-semibold rounded-xl"
                >
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* CATEGORY EDIT MODAL */}
      {/* ======================================================== */}
      {editingCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-stone-900 w-full max-w-md rounded-3xl p-6 space-y-4 shadow-2xl border border-stone-200 dark:border-stone-800">
            <div className="flex items-center justify-between pb-2 border-b border-stone-100 dark:border-stone-800">
              <h3 className="font-serif font-bold text-lg text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <Layers className="w-5 h-5 text-pink-600" />
                <span>{editingCategory.id ? 'Edit Category' : 'Add Category'}</span>
              </h3>
              <button
                type="button"
                onClick={() => setEditingCategory(null)}
                className="p-1.5 rounded-full text-stone-400 hover:text-stone-600 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1.5">
                Category Name
              </label>
              <input
                type="text"
                placeholder="e.g. Anti Tarnish Chains, Korean Earrings..."
                value={editingCategory.name || ''}
                onChange={e => setEditingCategory(c => ({ ...c, name: e.target.value }))}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-pink-500 font-medium"
              />
            </div>

            {/* Direct Image Upload Section */}
            <div>
              <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1.5">
                Category Image
              </label>

              {/* Uploading progress indicator */}
              {isUploadingCategoryImg && (
                <div className="p-3 mb-2 rounded-xl bg-pink-50 dark:bg-pink-950/40 border border-pink-200 dark:border-pink-900 flex items-center justify-center gap-2 text-xs font-semibold text-pink-600 animate-pulse">
                  <div className="w-4 h-4 border-2 border-pink-600 border-t-transparent rounded-full animate-spin" />
                  <span>Optimizing and uploading image from your device...</span>
                </div>
              )}

              {editingCategory.image ? (
                <div className="relative rounded-2xl overflow-hidden border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 group">
                  <div className="h-44 w-full overflow-hidden bg-stone-100 dark:bg-stone-800 flex items-center justify-center">
                    <img
                      src={editingCategory.image}
                      alt={editingCategory.name || 'Category'}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-3">
                    <label className="px-3.5 py-2 rounded-xl bg-white text-stone-800 text-xs font-bold shadow-lg cursor-pointer hover:bg-stone-50 flex items-center gap-1.5 transition-all">
                      <Upload className="w-3.5 h-3.5 text-pink-600" />
                      <span>Replace Photo</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        disabled={isUploadingCategoryImg}
                        onChange={async e => {
                          if (e.target.files && e.target.files[0]) {
                            setIsUploadingCategoryImg(true);
                            try {
                              const url = await compressAndProcessImage(e.target.files[0]);
                              setEditingCategory(c => ({ ...c, image: url }));
                            } catch (err) {
                              console.error(err);
                              alert('Failed to upload image. Please try again.');
                            } finally {
                              setIsUploadingCategoryImg(false);
                            }
                          }
                        }}
                      />
                    </label>

                    <button
                      type="button"
                      onClick={() => setEditingCategory(c => ({ ...c, image: '' }))}
                      className="px-3.5 py-2 rounded-xl bg-red-600 text-white text-xs font-bold shadow-lg hover:bg-red-700 flex items-center gap-1.5 transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove</span>
                    </button>
                  </div>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-pink-300 dark:border-pink-800/60 rounded-2xl bg-pink-50/40 dark:bg-pink-950/20 hover:bg-pink-50 dark:hover:bg-pink-900/30 cursor-pointer transition-all group text-center">
                  <div className="w-12 h-12 rounded-full bg-pink-100 dark:bg-pink-900/50 text-pink-600 dark:text-pink-400 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                    <Upload className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-bold text-stone-800 dark:text-stone-200">
                    Click to upload image directly from your device
                  </span>
                  <span className="text-[11px] text-stone-400 mt-1">
                    Select JPG, PNG or WEBP from phone gallery or computer
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={isUploadingCategoryImg}
                    onChange={async e => {
                      if (e.target.files && e.target.files[0]) {
                        setIsUploadingCategoryImg(true);
                        try {
                          const url = await compressAndProcessImage(e.target.files[0]);
                          setEditingCategory(c => ({ ...c, image: url }));
                        } catch (err) {
                          console.error(err);
                          alert('Failed to upload image. Please try again.');
                        } finally {
                          setIsUploadingCategoryImg(false);
                        }
                      }
                    }}
                  />
                </label>
              )}

              {/* Secondary Web URL fallback toggle */}
              <div className="mt-2.5">
                <button
                  type="button"
                  onClick={() => setShowCategoryUrlInput(v => !v)}
                  className="text-[11px] text-stone-500 hover:text-pink-600 underline font-medium flex items-center gap-1"
                >
                  {showCategoryUrlInput ? 'Hide manual image URL field' : 'Or paste an Image URL manually'}
                </button>

                {showCategoryUrlInput && (
                  <div className="mt-2 animate-fadeIn">
                    <input
                      type="text"
                      placeholder="https://..."
                      value={editingCategory.image || ''}
                      onChange={e => setEditingCategory(c => ({ ...c, image: e.target.value }))}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 dark:border-stone-700 bg-transparent font-mono"
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-stone-100 dark:border-stone-800">
              <button
                type="button"
                onClick={() => setEditingCategory(null)}
                className="px-4 py-2.5 text-xs font-semibold border border-stone-200 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-800 rounded-xl text-stone-700 dark:text-stone-300 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isUploadingCategoryImg || !editingCategory.name?.trim()}
                onClick={async () => {
                  if (editingCategory.name?.trim()) {
                    await saveCategory(editingCategory as any);
                    setEditingCategory(null);
                  }
                }}
                className="px-5 py-2.5 text-xs bg-pink-600 hover:bg-pink-700 active:scale-95 disabled:opacity-50 text-white rounded-xl font-bold transition-all shadow-sm flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Save Category</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TRACKING & PACKING PROOF MODAL */}
      {/* ======================================================== */}
      {selectedOrderForTracking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-stone-900 w-full max-w-md rounded-3xl p-6 space-y-4 border border-stone-200 dark:border-stone-800 shadow-xl">
            <div className="flex justify-between items-center">
              <h3 className="font-serif font-bold text-base text-stone-900 dark:text-stone-100">
                Dispatch Order #{selectedOrderForTracking.order_number}
              </h3>
              <button onClick={() => setSelectedOrderForTracking(null)}>
                <X className="w-5 h-5 text-stone-400" />
              </button>
            </div>

            <form onSubmit={handleSaveTrackingAndProof} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold mb-1">Courier Service Name</label>
                <input
                  type="text"
                  value={courierNameInput}
                  onChange={e => setCourierNameInput(e.target.value)}
                  placeholder="e.g. Delhivery / BlueDart / India Post"
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-transparent"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Tracking Number / AWB</label>
                <input
                  type="text"
                  value={trackingNumberInput}
                  onChange={e => setTrackingNumberInput(e.target.value)}
                  placeholder="e.g. 129482019482"
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-transparent font-mono uppercase"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">
                  Upload Packing Proof Video / Photo (Reduces disputes)
                </label>
                <input
                  type="file"
                  accept="image/*,video/*"
                  onChange={e => e.target.files && setPackingProofFile(e.target.files[0])}
                  className="text-xs text-stone-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:bg-pink-100 file:text-pink-700"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedOrderForTracking(null)}
                  className="px-4 py-2 border rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-pink-600 hover:bg-pink-700 text-white font-semibold rounded-xl"
                >
                  Save &amp; Update Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* ORDER DETAILS MODAL */}
      {/* ======================================================== */}
      {selectedOrderDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-stone-900 w-full max-w-2xl rounded-3xl p-6 sm:p-8 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-serif font-bold text-lg text-stone-900 dark:text-stone-100 font-mono">
                Order #{selectedOrderDetails.order_number}
              </h3>
              <button onClick={() => setSelectedOrderDetails(null)}>
                <X className="w-5 h-5 text-stone-400" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-stone-400">Customer Name &amp; Phone:</p>
                  <p className="font-bold text-sm text-stone-900 dark:text-stone-100">
                    {selectedOrderDetails.customer_name}
                  </p>
                  <p className="font-mono text-pink-600">+91 {selectedOrderDetails.customer_phone}</p>
                </div>
                <div>
                  <p className="text-stone-400">Payment Status:</p>
                  <p className="font-bold uppercase text-amber-600">{selectedOrderDetails.status}</p>
                  <p className="font-mono text-stone-600">UTR: {selectedOrderDetails.utr_number}</p>
                </div>
              </div>

              <div>
                <p className="text-stone-400">Delivery Address:</p>
                <p className="font-medium text-stone-800 dark:text-stone-200">
                  {selectedOrderDetails.address}, {selectedOrderDetails.city}, {selectedOrderDetails.state} -{' '}
                  {selectedOrderDetails.pincode}
                </p>
              </div>

              {selectedOrderDetails.gift_note && (
                <div className="p-3 bg-pink-50 dark:bg-stone-800 rounded-xl">
                  <p className="text-stone-400 font-semibold">💌 Handwritten Gift Note:</p>
                  <p className="italic text-stone-800 dark:text-stone-200">"{selectedOrderDetails.gift_note}"</p>
                </div>
              )}

              {/* Items */}
              <div className="divide-y divide-stone-100 dark:divide-stone-800 border-t border-b py-2">
                {selectedOrderDetails.items.map((it, idx) => (
                  <div key={idx} className="py-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <img src={it.product_image} alt="" className="w-10 h-10 object-cover rounded" />
                      <div>
                        <p className="font-semibold">{it.product_name}</p>
                        <p className="text-stone-400">Qty: {it.quantity}</p>
                      </div>
                    </div>
                    <span className="font-bold">₹{it.price * it.quantity}</span>
                  </div>
                ))}
              </div>

              <div className="flex justify-between font-bold text-sm">
                <span>Total Amount:</span>
                <span className="text-pink-600">₹{selectedOrderDetails.total}</span>
              </div>

              {selectedOrderDetails.payment_screenshot_url && (
                <div>
                  <p className="text-stone-400 font-semibold mb-1">Customer Payment Screenshot:</p>
                  <img
                    src={selectedOrderDetails.payment_screenshot_url}
                    alt="Payment screenshot"
                    className="max-h-60 rounded-xl border"
                  />
                </div>
              )}
            </div>

            <div className="pt-4 border-t flex justify-end">
              <button
                onClick={() => setSelectedOrderDetails(null)}
                className="px-5 py-2 bg-stone-900 text-white rounded-xl text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Preview Lightbox */}
      {viewingImageModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={() => setViewingImageModal(null)}
        >
          <div className="relative max-w-2xl max-h-[85vh] p-2 bg-white dark:bg-stone-900 rounded-2xl overflow-hidden shadow-2xl">
            <img src={viewingImageModal} alt="" className="w-full h-full object-contain rounded-xl" />
            <p className="text-center text-xs text-stone-500 py-2">Click anywhere to close</p>
          </div>
        </div>
      )}
    </div>
  );
};
