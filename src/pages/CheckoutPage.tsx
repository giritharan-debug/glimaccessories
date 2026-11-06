import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ShieldAlert,
  Copy,
  Check,
  Upload,
  ArrowRight,
  Sparkles,
  QrCode,
  AlertCircle,
  FileText,
  Lock,
  ExternalLink,
  Clipboard,
  HelpCircle,
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import {
  createOrder,
  saveAbandonedCart,
  compressAndProcessImage,
  getSiteSettings,
  checkCustomerFirstOrder,
} from '@/lib/store';
import { PaymentGatewayConfig, SiteSettings } from '@/types';
import { INITIAL_SETTINGS } from '@/lib/seedData';

const INDIAN_STATES = [
  'Tamil Nadu',
  'Puducherry',
  'Karnataka',
  'Kerala',
  'Andhra Pradesh',
  'Telangana',
  'Delhi',
  'Maharashtra',
  'Uttar Pradesh',
  'Punjab',
  'Haryana',
  'Rajasthan',
  'Gujarat',
  'West Bengal',
  'Madhya Pradesh',
  'Bihar',
  'Assam',
  'Odisha',
  'Goa',
  'Jammu and Kashmir',
  'Uttarakhand',
  'Himachal Pradesh',
  'Jharkhand',
  'Chhattisgarh',
  'Chandigarh',
  'Tripura',
  'Manipur',
  'Meghalaya',
  'Nagaland',
  'Arunachal Pradesh',
  'Mizoram',
  'Sikkim',
  'Ladakh',
  'Andaman and Nicobar Islands',
  'Dadra and Nagar Haveli and Daman and Diu',
  'Lakshadweep',
];

export const getShippingZone = (stateName: string) => {
  const clean = stateName.trim();
  if (/tamil\s*nadu|tamilnadu|^tn$|puducherry|pondicherry/i.test(clean)) {
    return { fee: 50, zone: 'Tamil Nadu & Pondicherry', badge: '⚡ ₹50 TN Delivery' };
  }
  if (/karnataka|kerala|andhra|telangana/i.test(clean)) {
    return { fee: 80, zone: 'South India', badge: '📦 ₹80 South India' };
  }
  return { fee: 150, zone: 'North India', badge: '🚚 ₹150 North India' };
};

export const CheckoutPage: React.FC = () => {
  const {
    items,
    subtotal,
    discount,
    shippingFee,
    total,
    clearCart,
    appliedCoupon,
  } = useCart();
  const navigate = useNavigate();

  // Customer form fields
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('Tamil Nadu');
  const [pincode, setPincode] = useState('');
  const [giftNote, setGiftNote] = useState('');

  // Payment fields
  const [selectedGateway, setSelectedGateway] = useState<string>('phonepe');
  const [utrNumber, setUtrNumber] = useState('');
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState<string>('');
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [showUtrGuide, setShowUtrGuide] = useState(false);
  const [copiedFromClipboard, setCopiedFromClipboard] = useState(false);

  // Policy checkbox
  const [policyAccepted, setPolicyAccepted] = useState(false);

  // Status & validation
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [settings, setSettings] = useState<SiteSettings | null>(null);

  // Delivery Fee calculation based on State:
  // Tamil Nadu & Puducherry: ₹50, South India: ₹80, North India: ₹150, Free above threshold
  const freeThreshold = settings?.free_shipping_threshold ?? 999;
  const discountedSubtotal = subtotal - discount;
  const isFreeShipping = discountedSubtotal >= freeThreshold && items.length > 0;
  const shippingZone = getShippingZone(state);
  const effectiveShippingFee = items.length === 0 || isFreeShipping ? 0 : shippingZone.fee;
  const effectiveTotal = Math.max(0, discountedSubtotal + effectiveShippingFee);

  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    getSiteSettings().then(setSettings);
  }, []);

  // Redirect if cart is empty
  useEffect(() => {
    if (items.length === 0 && !isSubmitting) {
      navigate('/cart');
    }
  }, [items, isSubmitting, navigate]);

  // Debounced abandoned cart tracking when customer types phone
  useEffect(() => {
    if (phone.replace(/\D/g, '').length >= 10 && items.length > 0) {
      if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
      debounceTimeout.current = setTimeout(() => {
        saveAbandonedCart(phone, name, items, effectiveTotal);
      }, 1500);
    }
    return () => {
      if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    };
  }, [phone, name, items, effectiveTotal]);

  const rawGateways: PaymentGatewayConfig[] = (settings?.payment_gateways && settings.payment_gateways.length > 0)
    ? settings.payment_gateways
    : INITIAL_SETTINGS.payment_gateways;

  const enabledGateways = rawGateways.filter(g => g.is_enabled);
  const activeGateways: PaymentGatewayConfig[] = enabledGateways.length > 0 ? enabledGateways : rawGateways;

  const currentGateway =
    activeGateways.find(g => g.id === selectedGateway) || activeGateways[0];

  const handleCopyUpi = () => {
    if (currentGateway?.upi_id) {
      navigator.clipboard.writeText(currentGateway.upi_id);
      setCopiedUpi(true);
      setTimeout(() => setCopiedUpi(false), 2000);
    }
  };

  const handlePasteUtr = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        const cleaned = text.trim().replace(/[^a-zA-Z0-9]/g, '');
        setUtrNumber(cleaned);
        setCopiedFromClipboard(true);
        setTimeout(() => setCopiedFromClipboard(false), 2000);
      }
    } catch {
      // If clipboard permission is blocked, focus the input
      const el = document.getElementById('utr-input');
      if (el) el.focus();
    }
  };

  const handleScreenshotChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setScreenshotFile(file);
      const previewUrl = URL.createObjectURL(file);
      setScreenshotPreview(previewUrl);
    }
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    // Validation
    if (!name.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }
    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      setErrorMessage('Please enter a valid 10-digit WhatsApp phone number.');
      return;
    }
    if (!address.trim() || !city.trim() || !pincode.trim()) {
      setErrorMessage('Please enter your complete delivery address, city, and pincode.');
      return;
    }
    if (pincode.replace(/\D/g, '').length !== 6) {
      setErrorMessage('Pincode must be exactly 6 digits.');
      return;
    }
    if (!utrNumber.trim()) {
      setErrorMessage('Please enter your 12-digit UPI UTR / Transaction Reference ID.');
      return;
    }
    if (!policyAccepted) {
      setErrorMessage('You must acknowledge the No Returns / No Refunds policy to proceed.');
      return;
    }

    // Verify WELCOME10 coupon if used
    if (appliedCoupon?.code === 'WELCOME10') {
      const isFirst = await checkCustomerFirstOrder(cleanPhone);
      if (!isFirst) {
        setErrorMessage('Coupon WELCOME10 is valid only on a customer\'s first order with this phone number.');
        return;
      }
    }

    setIsSubmitting(true);

    try {
      let uploadedScreenshotUrl = '';
      if (screenshotFile) {
        try {
          uploadedScreenshotUrl = await compressAndProcessImage(screenshotFile);
        } catch (imgErr) {
          console.warn('Screenshot upload warning (continuing order creation):', imgErr);
        }
      }

      const newOrder = await createOrder({
        customer_name: name.trim(),
        customer_phone: cleanPhone,
        address: address.trim(),
        city: city.trim(),
        state: state.trim(),
        pincode: pincode.trim(),
        gift_note: giftNote.trim() || undefined,
        items,
        subtotal,
        discount,
        shipping_fee: effectiveShippingFee,
        total: effectiveTotal,
        payment_method: selectedGateway,
        upi_id: currentGateway.upi_id,
        utr_number: utrNumber.trim(),
        payment_screenshot_url: uploadedScreenshotUrl || undefined,
      });

      clearCart();

      // Prevent DataCloneError in History.pushState by avoiding huge data URLs in state
      const safeOrderState = {
        ...newOrder,
        payment_screenshot_url: newOrder.payment_screenshot_url?.startsWith('data:')
          ? undefined
          : newOrder.payment_screenshot_url,
      };

      navigate(`/order-success/${newOrder.id}`, { state: { order: safeOrderState } });
    } catch (err: any) {
      console.error('Error creating order:', err);
      setErrorMessage(
        err?.message ||
        'Something went wrong while placing your order. Please try again or message our WhatsApp support.'
      );
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Checkout Title */}
      <div className="text-center space-y-2">
        <span className="text-xs uppercase font-bold tracking-widest text-pink-600 dark:text-pink-400">
          Secure Direct Checkout
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl text-stone-900 dark:text-stone-100 font-normal">
          Complete Your Order
        </h1>
        <p className="text-xs sm:text-sm text-stone-500">
          100% Advance UPI Verification • Direct Dispatch from Pondicherry
        </p>
      </div>

      {/* Mandatory No Returns & No COD Top Alert */}
      <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200 flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div className="text-xs space-y-1">
          <p className="font-bold uppercase tracking-wide">
            IMPORTANT: NO COD • NO RETURNS • NO REFUNDS
          </p>
          <p className="leading-relaxed">
            We do NOT offer Cash on Delivery (COD). All orders are recorded on camera during packing to guarantee 100% item accuracy. Please verify your sizes and address carefully.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Col: Customer Shipping Details & Payment */}
        <div className="lg:col-span-7 space-y-8">
          {/* 1. Contact & Shipping Address */}
          <div className="bg-white dark:bg-stone-900 p-6 sm:p-8 rounded-3xl border border-pink-100 dark:border-stone-800 shadow-sm space-y-5">
            <h3 className="font-serif font-bold text-lg text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-pink-100 dark:bg-pink-950 text-pink-600 text-xs flex items-center justify-center font-bold">
                1
              </span>
              <span>Delivery Details</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Asliya Mary"
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-stone-300 dark:border-stone-700 bg-transparent text-stone-900 dark:text-stone-100 placeholder-stone-400 outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  WhatsApp Phone Number *
                </label>
                <div className="flex border border-stone-300 dark:border-stone-700 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-pink-500">
                  <span className="bg-stone-100 dark:bg-stone-800 px-3 py-2.5 text-xs text-stone-600 dark:text-stone-400 font-medium">
                    +91
                  </span>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="9876543210"
                    maxLength={10}
                    className="flex-1 px-3 py-2.5 text-sm bg-transparent text-stone-900 dark:text-stone-100 placeholder-stone-400 outline-none"
                  />
                </div>
                <p className="text-[10px] text-stone-400 mt-1">We send tracking updates &amp; packing proof video here.</p>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Flat / House No. / Street Address *
                </label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  placeholder="Flat 204, Rose Villa, 5th Cross..."
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-stone-300 dark:border-stone-700 bg-transparent text-stone-900 dark:text-stone-100 placeholder-stone-400 outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  City / Town *
                </label>
                <input
                  type="text"
                  required
                  value={city}
                  onChange={e => setCity(e.target.value)}
                  placeholder="e.g. Pondicherry / Chennai"
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-stone-300 dark:border-stone-700 bg-transparent text-stone-900 dark:text-stone-100 placeholder-stone-400 outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300">
                    State *
                  </label>
                  {!isFreeShipping && (
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      shippingZone.fee === 50
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                        : shippingZone.fee === 80
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300'
                        : 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300'
                    }`}>
                      {shippingZone.badge}
                    </span>
                  )}
                  {isFreeShipping && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                      🎉 Free Shipping
                    </span>
                  )}
                </div>
                <select
                  required
                  value={state}
                  onChange={e => setState(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 outline-none focus:ring-2 focus:ring-pink-500 cursor-pointer"
                >
                  {INDIAN_STATES.map(s => {
                    const zone = getShippingZone(s);
                    return (
                      <option key={s} value={s}>
                        {s} (₹{zone.fee} Delivery)
                      </option>
                    );
                  })}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  PIN Code (6 digits) *
                </label>
                <input
                  type="text"
                  required
                  value={pincode}
                  onChange={e => setPincode(e.target.value)}
                  maxLength={6}
                  placeholder="605001"
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-stone-300 dark:border-stone-700 bg-transparent text-stone-900 dark:text-stone-100 placeholder-stone-400 outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Free Handwritten Gift Note (Optional)
                </label>
                <input
                  type="text"
                  value={giftNote}
                  onChange={e => setGiftNote(e.target.value)}
                  placeholder="e.g. Happy Birthday Diya! Love you always."
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-stone-300 dark:border-stone-700 bg-transparent text-stone-900 dark:text-stone-100 placeholder-stone-400 outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>
            </div>
          </div>

          {/* 2. UPI Payment Method */}
          <div className="bg-white dark:bg-stone-900 p-6 sm:p-8 rounded-3xl border border-pink-100 dark:border-stone-800 shadow-sm space-y-6">
            <h3 className="font-serif font-bold text-lg text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-pink-100 dark:bg-pink-950 text-pink-600 text-xs flex items-center justify-center font-bold">
                2
              </span>
              <span>UPI Payment (No COD)</span>
            </h3>

            {/* Gateway Selector Tabs */}
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              {activeGateways.map(g => (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => setSelectedGateway(g.id)}
                  className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-1 ${
                    selectedGateway === g.id
                      ? 'border-pink-600 bg-pink-50/60 dark:bg-pink-950/40 text-pink-700 dark:text-pink-300 font-semibold ring-2 ring-pink-500'
                      : 'border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:bg-stone-50'
                  }`}
                >
                  <span className="text-xs sm:text-sm font-bold">{g.name}</span>
                </button>
              ))}
            </div>

            {/* QR Code & UPI ID Box */}
            <div className="p-5 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 text-center space-y-4">
              {/* 1-Click Pay via Mobile UPI App */}
              <div className="space-y-1.5">
                <a
                  href={`upi://pay?pa=${encodeURIComponent(currentGateway?.upi_id || '8523996310@paytm')}&pn=${encodeURIComponent('Glim Accessories')}&am=${effectiveTotal}&cu=INR&tn=${encodeURIComponent('Order Payment')}`}
                  className="w-full sm:max-w-xs mx-auto py-3 px-4 rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-rose-500 hover:opacity-95 text-white font-bold text-xs sm:text-sm shadow-md flex items-center justify-center gap-2 transition-all active:scale-95"
                >
                  <Sparkles className="w-4 h-4 text-amber-200" />
                  <span>⚡ Pay ₹{effectiveTotal} via UPI App</span>
                  <ExternalLink className="w-3.5 h-3.5 opacity-80" />
                </a>
                <p className="text-[10px] text-stone-500 dark:text-stone-400">
                  Tap above on mobile to open PhonePe, Google Pay, or Paytm with <strong>₹{effectiveTotal}</strong> pre-filled!
                </p>
              </div>

              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-stone-200 dark:border-stone-700"></div>
                <span className="flex-shrink mx-3 text-[10px] font-bold text-stone-400 uppercase tracking-wider">
                  OR SCAN QR CODE
                </span>
                <div className="flex-grow border-t border-stone-200 dark:border-stone-700"></div>
              </div>

              {/* Dynamic QR Code */}
              <div className="inline-block p-3 bg-white rounded-2xl shadow-md border border-stone-200">
                <img
                  src={
                    currentGateway?.qr_image ||
                    `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=upi://pay?pa=${currentGateway?.upi_id}&pn=Glim%20Accessories&am=${effectiveTotal}&cu=INR`
                  }
                  alt={`${currentGateway?.name} QR Code`}
                  className="w-44 h-44 sm:w-48 sm:h-48 object-contain mx-auto"
                />
                <p className="text-[11px] text-stone-800 font-bold mt-1.5">
                  Amount to Pay: <span className="text-pink-600">₹{effectiveTotal}</span>
                </p>
              </div>

              {/* UPI ID with 1-click Copy */}
              <div className="max-w-xs mx-auto flex items-center justify-between p-2 rounded-xl bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 text-xs">
                <span className="font-mono text-stone-800 dark:text-stone-200 font-semibold truncate pl-2">
                  {currentGateway?.upi_id}
                </span>
                <button
                  type="button"
                  onClick={handleCopyUpi}
                  className="px-3 py-1 bg-pink-600 text-white font-medium rounded-lg hover:bg-pink-700 flex items-center gap-1 transition-colors"
                >
                  {copiedUpi ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedUpi ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>

            {/* Transaction Verification Inputs */}
            <div className="space-y-4 pt-2">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300">
                    12-digit UTR / UPI Transaction ID *
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowUtrGuide(v => !v)}
                    className="text-[10px] text-pink-600 dark:text-pink-400 hover:underline flex items-center gap-1 font-semibold"
                  >
                    <HelpCircle className="w-3 h-3" />
                    <span>{showUtrGuide ? 'Hide Guide' : 'Where is my UTR?'}</span>
                  </button>
                </div>

                <div className="flex gap-2">
                  <input
                    id="utr-input"
                    type="text"
                    required
                    value={utrNumber}
                    onChange={e => setUtrNumber(e.target.value)}
                    placeholder="e.g. 431289012345"
                    className="flex-1 px-3.5 py-2.5 text-sm font-mono rounded-xl border border-stone-300 dark:border-stone-700 bg-transparent text-stone-900 dark:text-stone-100 placeholder-stone-400 outline-none focus:ring-2 focus:ring-pink-500 uppercase"
                  />
                  <button
                    type="button"
                    onClick={handlePasteUtr}
                    className="px-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 text-xs font-semibold flex items-center gap-1.5 transition-colors whitespace-nowrap shadow-sm active:scale-95"
                    title="Paste UTR from clipboard"
                  >
                    <Clipboard className="w-3.5 h-3.5 text-pink-600" />
                    <span>{copiedFromClipboard ? 'Pasted!' : 'Paste'}</span>
                  </button>
                </div>

                {/* Where is my UTR Guide Box */}
                {showUtrGuide && (
                  <div className="mt-2.5 p-3 rounded-xl bg-pink-50/70 dark:bg-pink-950/30 border border-pink-200 dark:border-pink-900/50 text-[11px] text-stone-700 dark:text-stone-300 space-y-1.5 animate-fadeIn">
                    <p className="font-bold text-pink-700 dark:text-pink-300">Find the 12-digit number in your payment receipt:</p>
                    <p>• <strong>PhonePe:</strong> Look for <strong>"UTR"</strong> (12 digits, e.g. <code>4310...</code>)</p>
                    <p>• <strong>Google Pay (GPay):</strong> Look for <strong>"UPI Transaction ID"</strong> (12 digits)</p>
                    <p>• <strong>Paytm:</strong> Look for <strong>"UPI Ref No"</strong> (12 digits)</p>
                  </div>
                )}
                <p className="text-[10px] text-stone-400 mt-1">Found in your payment receipt on GPay, PhonePe, or Paytm.</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Upload Payment Screenshot (Optional but speeds up confirmation)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleScreenshotChange}
                  className="text-xs text-stone-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-pink-100 file:text-pink-700 hover:file:bg-pink-200"
                />

                {screenshotPreview && (
                  <div className="mt-2.5 w-24 h-24 rounded-xl overflow-hidden border border-stone-200">
                    <img src={screenshotPreview} alt="Screenshot preview" className="w-full h-full object-cover" />
                  </div>
                )}
                <p className="text-[10px] text-stone-400 mt-1">
                  Tip: You can also place the order directly and send your screenshot via WhatsApp anytime!
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Order Summary & Mandatory Policy Checkbox */}
        <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-24">
          <div className="bg-white dark:bg-stone-900 p-6 rounded-3xl border border-pink-100 dark:border-stone-800 shadow-sm space-y-5">
            <h3 className="font-serif font-bold text-lg text-stone-900 dark:text-stone-100 border-b border-stone-100 dark:border-stone-800 pb-3">
              Order Summary ({items.reduce((s, i) => s + i.quantity, 0)} items)
            </h3>

            {/* Items scroll */}
            <div className="max-h-60 overflow-y-auto space-y-3 divide-y divide-stone-100 dark:divide-stone-800">
              {items.map((item, idx) => (
                <div key={idx} className="pt-3 first:pt-0 flex items-center gap-3">
                  <img
                    src={item.product_image}
                    alt={item.product_name}
                    className="w-14 h-14 object-cover rounded-xl bg-stone-100 flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-stone-900 dark:text-stone-100 truncate">
                      {item.product_name}
                    </p>
                    {item.selected_variant && (
                      <p className="text-[10px] text-stone-400">
                        {Object.values(item.selected_variant).join(', ')}
                      </p>
                    )}
                    <p className="text-xs text-stone-500">
                      Qty: {item.quantity} × ₹{item.price}
                    </p>
                  </div>
                  <span className="font-bold text-xs text-stone-900 dark:text-stone-100">
                    ₹{item.price * item.quantity}
                  </span>
                </div>
              ))}
            </div>

            {/* Calculations */}
            <div className="border-t border-stone-100 dark:border-stone-800 pt-3 space-y-2 text-xs text-stone-600 dark:text-stone-400">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-semibold text-stone-900 dark:text-stone-100">₹{subtotal}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>Discount &amp; Offers</span>
                  <span>-₹{discount}</span>
                </div>
              )}
              <div className="flex justify-between items-start">
                <div>
                  <span>Delivery Charges</span>
                  <span className="block text-[10px] text-stone-400">
                    {effectiveShippingFee === 0
                      ? 'Free shipping applied'
                      : isTamilNadu
                      ? 'Tamil Nadu & Pondicherry (₹50)'
                      : 'Out of Tamil Nadu (₹80)'}
                  </span>
                </div>
                <span>
                  {effectiveShippingFee === 0 ? (
                    <span className="text-emerald-600 font-bold uppercase text-[11px]">Free Shipping</span>
                  ) : (
                    <span className="font-semibold text-stone-900 dark:text-stone-100">₹{effectiveShippingFee}</span>
                  )}
                </span>
              </div>
              <div className="flex justify-between text-base font-bold text-stone-900 dark:text-stone-100 pt-2 border-t border-stone-200 dark:border-stone-800">
                <span>Total Payable</span>
                <span className="text-pink-600 dark:text-pink-400 text-xl">₹{effectiveTotal}</span>
              </div>
            </div>

            {/* MANDATORY CHECKBOX REQUIREMENT */}
            <div className="pt-2">
              <label className="flex items-start gap-2.5 p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800/70 cursor-pointer">
                <input
                  type="checkbox"
                  required
                  checked={policyAccepted}
                  onChange={e => setPolicyAccepted(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded text-pink-600 focus:ring-pink-500 border-stone-300"
                />
                <span className="text-xs text-amber-950 dark:text-amber-200 leading-snug">
                  <strong>I have checked the size and details and understand that there are no returns or refunds.</strong>
                </span>
              </label>
            </div>

            {errorMessage && (
              <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/60 border border-red-200 text-red-600 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Place Order CTA */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 rounded-xl bg-pink-600 hover:bg-pink-700 text-white font-semibold text-sm tracking-wide shadow-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              <Lock className="w-4 h-4" />
              <span>{isSubmitting ? 'Verifying & Submitting...' : `Place Order • ₹${effectiveTotal}`}</span>
            </button>

            <p className="text-[11px] text-center text-stone-400">
              After placing your order, you will receive your Order ID and an instant WhatsApp confirmation link!
            </p>
          </div>
        </div>
      </form>
    </div>
  );
};
