import React, { useState, useEffect } from 'react';
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
import { getSupabaseConfig, isSupabaseConfigured } from '@/lib/supabase';

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
  const [uploadingGatewayId, setUploadingGatewayId] = useState<string | null>(null);
  const [savingGateways, setSavingGateways] = useState(false);
  const [gatewaySuccessMsg, setGatewaySuccessMsg] = useState<string>('');
  const [copiedUpiGatewayId, setCopiedUpiGatewayId] = useState<string | null>(null);

  const loadAllAdminData = async () => {
    const [prods, cats, ords, aban, notif, cpns, revs, sett] = await Promise.all([
      getProducts(),
      getCategories(),
      getOrders(),
      getAbandonedCarts(),
      getNotifyRequests(),
      getCoupons(),
      getReviews(),
      getSiteSettings(),
    ]);

    setProducts(prods);
    setCategories(cats);
    setOrders(ords);
    setAbandonedCarts(aban);
    setNotifyRequests(notif);
    setCoupons(cpns);
    setReviews(revs);

    const safeSettings: SiteSettings = {
      ...INITIAL_SETTINGS,
      ...(sett || {}),
      payment_gateways: (sett?.payment_gateways && Array.isArray(sett.payment_gateways) && sett.payment_gateways.length > 0)
        ? sett.payment_gateways
        : INITIAL_SETTINGS.payment_gateways,
    };
    setSiteSettings(safeSettings);
  };

  useEffect(() => {
    loadAllAdminData();
    const handleDataChanged = () => loadAllAdminData();
    window.addEventListener('glim:data_changed', handleDataChanged);
    return () => window.removeEventListener('glim:data_changed', handleDataChanged);
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
        {activeTab === 'payments' && siteSettings && (
          <div className="space-y-6 animate-fadeIn max-w-4xl">
            <div>
              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 dark:text-stone-100">
                Payment Gateways &amp; QR Settings
              </h1>
              <p className="text-xs text-stone-500 mt-1">
                Upload or replace QR codes, change UPI IDs, and enable/disable PhonePe, GPay, or Paytm separately.
              </p>
            </div>

            <div className="space-y-6">
              {siteSettings.payment_gateways.map((gw, idx) => (
                <div
                  key={gw.id}
                  className="bg-white dark:bg-stone-900 p-6 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-sm flex flex-col sm:flex-row items-center gap-6"
                >
                  <div className="w-32 h-32 rounded-xl border border-stone-200 p-2 bg-stone-50 flex-shrink-0 flex items-center justify-center">
                    <img src={gw.qr_image} alt={gw.name} className="w-full h-full object-contain" />
                  </div>

                  <div className="flex-1 space-y-3 w-full">
                    <div className="flex items-center justify-between">
                      <h4 className="font-serif font-bold text-base text-stone-900 dark:text-stone-100">
                        {gw.name}
                      </h4>
                      <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold">
                        <input
                          type="checkbox"
                          checked={gw.is_enabled}
                          onChange={e => {
                            const updated = [...siteSettings.payment_gateways];
                            updated[idx].is_enabled = e.target.checked;
                            saveSiteSettings({ payment_gateways: updated });
                          }}
                        />
                        <span>{gw.is_enabled ? 'Active at Checkout' : 'Disabled'}</span>
                      </label>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-stone-600 dark:text-stone-400 mb-1">
                        Merchant UPI ID
                      </label>
                      <input
                        type="text"
                        value={gw.upi_id}
                        onChange={e => {
                          const updated = [...siteSettings.payment_gateways];
                          updated[idx].upi_id = e.target.value;
                          setSiteSettings(s => ({ ...s!, payment_gateways: updated }));
                        }}
                        onBlur={() => saveSiteSettings({ payment_gateways: siteSettings.payment_gateways })}
                        className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-stone-300 dark:border-stone-700 bg-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-stone-600 dark:text-stone-400 mb-1">
                        Replace QR Code Image
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={async e => {
                          if (e.target.files && e.target.files[0]) {
                            const newQrUrl = await compressAndProcessImage(e.target.files[0]);
                            const updated = [...siteSettings.payment_gateways];
                            updated[idx].qr_image = newQrUrl;
                            saveSiteSettings({ payment_gateways: updated });
                          }
                        }}
                        className="text-xs text-stone-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:bg-pink-100 file:text-pink-700"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

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
        {activeTab === 'settings' && siteSettings && (
          <div className="space-y-6 animate-fadeIn max-w-4xl">
            <div>
              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 dark:text-stone-100">
                Site &amp; Shipping Settings
              </h1>
              <p className="text-xs text-stone-500 mt-1">
                Customize announcement text, free shipping threshold, address, and WhatsApp contact.
              </p>
            </div>

            <div className="bg-white dark:bg-stone-900 p-6 sm:p-8 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-sm space-y-5">
              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Top Announcement Bar Text
                </label>
                <input
                  type="text"
                  value={siteSettings.announcement_bar_text}
                  onChange={e =>
                    setSiteSettings(s => ({ ...s!, announcement_bar_text: e.target.value }))
                  }
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-stone-300 dark:border-stone-700 bg-transparent"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Free Shipping Threshold (₹)
                  </label>
                  <input
                    type="number"
                    value={siteSettings.free_shipping_threshold}
                    onChange={e =>
                      setSiteSettings(s => ({ ...s!, free_shipping_threshold: Number(e.target.value) }))
                    }
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-stone-300 dark:border-stone-700 bg-transparent"
                  />
                  <p className="text-[10px] text-stone-400 mt-1">Default ₹999</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Flat Shipping Fee (₹)
                  </label>
                  <input
                    type="number"
                    value={siteSettings.flat_shipping_fee}
                    onChange={e =>
                      setSiteSettings(s => ({ ...s!, flat_shipping_fee: Number(e.target.value) }))
                    }
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-stone-300 dark:border-stone-700 bg-transparent"
                  />
                  <p className="text-[10px] text-stone-400 mt-1">Charged when order is below threshold</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Store WhatsApp Number
                  </label>
                  <input
                    type="text"
                    value={siteSettings.whatsapp_number}
                    onChange={e =>
                      setSiteSettings(s => ({ ...s!, whatsapp_number: e.target.value }))
                    }
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-stone-300 dark:border-stone-700 bg-transparent font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Instagram Profile Link
                  </label>
                  <input
                    type="text"
                    value={siteSettings.instagram_url}
                    onChange={e =>
                      setSiteSettings(s => ({ ...s!, instagram_url: e.target.value }))
                    }
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-stone-300 dark:border-stone-700 bg-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Physical Store Address
                </label>
                <input
                  type="text"
                  value={siteSettings.store_address}
                  onChange={e =>
                    setSiteSettings(s => ({ ...s!, store_address: e.target.value }))
                  }
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-stone-300 dark:border-stone-700 bg-transparent"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Google Maps URL
                </label>
                <input
                  type="text"
                  value={siteSettings.google_maps_url}
                  onChange={e =>
                    setSiteSettings(s => ({ ...s!, google_maps_url: e.target.value }))
                  }
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-stone-300 dark:border-stone-700 bg-transparent"
                />
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => {
                    saveSiteSettings(siteSettings);
                    alert('Site settings updated live for all customers!');
                  }}
                  className="px-6 py-2.5 rounded-xl bg-pink-600 hover:bg-pink-700 text-white font-semibold text-xs transition-colors shadow-sm"
                >
                  Save Settings
                </button>
              </div>
            </div>
          </div>
        )}

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
          <div className="bg-white dark:bg-stone-900 w-full max-w-md rounded-3xl p-6 space-y-4">
            <h3 className="font-serif font-bold text-lg text-stone-900 dark:text-stone-100">
              {editingCategory.id ? 'Edit Category' : 'Add Category'}
            </h3>

            <div>
              <label className="block text-xs font-semibold mb-1">Category Name</label>
              <input
                type="text"
                value={editingCategory.name || ''}
                onChange={e => setEditingCategory(c => ({ ...c, name: e.target.value }))}
                className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 dark:border-stone-700 bg-transparent"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1">Image URL</label>
              <input
                type="text"
                value={editingCategory.image || ''}
                onChange={e => setEditingCategory(c => ({ ...c, image: e.target.value }))}
                className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 dark:border-stone-700 bg-transparent"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEditingCategory(null)}
                className="px-4 py-2 text-xs border rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  if (editingCategory.name) {
                    await saveCategory(editingCategory as any);
                    setEditingCategory(null);
                  }
                }}
                className="px-4 py-2 text-xs bg-pink-600 text-white rounded-xl font-semibold"
              >
                Save Category
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
