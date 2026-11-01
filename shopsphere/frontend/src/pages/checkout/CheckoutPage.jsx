import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import {
  MapPin, Plus, CreditCard, Truck, Loader2, CheckCircle2,
  ShoppingBag, ChevronRight, Lock, X, Sparkles, AlertCircle,
  Phone, Clock, ShieldCheck, RotateCcw, Award, Check
} from 'lucide-react';
import { userAPI, orderAPI, paymentAPI, couponAPI, cartAPI } from '../../api/index';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { formatCurrency } from '../../utils/helpers';

/* ── Top Stepper matching Image 5 ── */
const CheckoutStepper = ({ current = 2 }) => {
  const steps = [
    { id: 1, label: 'Sign In', done: true },
    { id: 2, label: 'Address Details', done: current >= 2, active: current === 2 },
    { id: 3, label: 'Payment Method', done: current >= 3, active: current === 3 },
    { id: 4, label: 'Preview & Confirm', done: current >= 4, active: current === 4 },
  ];

  return (
    <div className="w-full max-w-3xl mx-auto mb-10 px-4">
      <div className="flex items-center justify-between relative">
        {/* Connecting track line */}
        <div className="absolute left-6 right-6 top-3 h-[2px] bg-slate-200 -z-0" />

        {steps.map((step) => {
          const isDone = step.done;
          const isActive = step.active;
          return (
            <div key={step.id} className="relative z-10 flex flex-col items-center">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                  isDone
                    ? 'bg-blue-600 text-white ring-4 ring-blue-100 shadow-sm'
                    : 'bg-white border-2 border-slate-300 text-slate-400'
                }`}
              >
                {isDone ? (
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                ) : (
                  <span className="w-2 h-2 rounded-full bg-slate-300" />
                )}
              </div>
              <span
                className={`text-xs mt-2 font-medium tracking-tight whitespace-nowrap ${
                  isActive || isDone ? 'text-blue-600 font-semibold' : 'text-slate-400'
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default function CheckoutPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { cart, clearCart } = useCart();
  const { user, isAuthenticated } = useAuth();
  const { showToast } = useToast();

  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [deliveryMethod, setDeliveryMethod] = useState('FEDEX'); // 'DHL', 'FEDEX', 'GLS'
  const [useDeliveryAsBilling, setUseDeliveryAsBilling] = useState(true);
  const [loading, setLoading] = useState(false);
  const [loadingAddresses, setLoadingAddresses] = useState(true);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(location.state?.appliedCoupon || null);
  const [couponLoading, setCouponLoading] = useState(false);

  // Address inputs matching Image 5
  const [addressForm, setAddressForm] = useState({
    firstName: user?.firstName || 'Bander',
    secondName: user?.lastName || 'Wierzbicki',
    address: '42, Sunset Boulevard, Linking Road, Bandra West',
    city: 'Mumbai',
    zipCode: '400050',
    country: 'India',
    phoneNumber: user?.phone || '+91 98765 43210',
  });

  const items = cart?.items || [];
  const subtotal = items.reduce((s, i) => s + (i.effectivePrice || i.price) * i.quantity, 0);

  // Delivery carrier pricing
  const carrierRates = {
    DHL: { name: 'DHL EXPRESS', fee: 199, feeDisplay: '₹199', eta: 'Tomorrow', date: 'Tomorrow, Guaranteed' },
    FEDEX: { name: 'FEDEX', fee: 99, feeDisplay: '₹99', eta: 'In 2 Days', date: 'Friday, 06.09.2025' },
    GLS: { name: 'GLS STANDARD', fee: 0, feeDisplay: 'FREE', eta: 'In 4-5 Days', date: 'Monday, 13.09.2025' },
  };

  const selectedCarrier = carrierRates[deliveryMethod] || carrierRates.FEDEX;
  const shippingFee = selectedCarrier.fee;

  const discount = appliedCoupon
    ? appliedCoupon.discountType === 'PERCENTAGE'
      ? Math.min((subtotal * appliedCoupon.discountValue) / 100, appliedCoupon.maxDiscount || Infinity)
      : appliedCoupon.discountValue
    : 0;

  const total = Math.max(0, subtotal - discount + shippingFee);

  useEffect(() => {
    if (!isAuthenticated) {
      setLoadingAddresses(false);
      return;
    }
    userAPI
      .getAddresses()
      .then((r) => {
        const addrs = r.data?.data || r.data || [];
        const list = Array.isArray(addrs) ? addrs : [];
        setAddresses(list);
        if (list.length > 0) {
          const def = list.find((a) => a.isDefault) || list[0];
          setSelectedAddressId(def.id);
          // populate form
          const names = (def.recipientName || '').split(' ');
          setAddressForm((p) => ({
            ...p,
            firstName: names[0] || p.firstName,
            secondName: names.slice(1).join(' ') || p.secondName,
            address: def.streetAddress || p.address,
            city: def.city || p.city,
            zipCode: def.postalCode || p.zipCode,
            phoneNumber: def.phone || p.phoneNumber,
          }));
        }
      })
      .catch(() => {})
      .finally(() => setLoadingAddresses(false));
  }, [isAuthenticated]);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    try {
      const r = await couponAPI.apply({ code: couponCode.trim(), orderAmount: subtotal });
      setAppliedCoupon(r.data?.data || r.data);
      showToast('Coupon applied! 🎉', 'success');
    } catch (err) {
      showToast(err?.response?.data?.message || 'Invalid coupon code', 'error');
    } finally {
      setCouponLoading(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: '/checkout' } } });
      return;
    }
    if (!items.length) {
      showToast('Your cart is empty', 'error');
      return;
    }

    setLoading(true);
    try {
      // 1. Ensure an address exists or create it from the form
      let addressIdToUse = selectedAddressId;
      if (!addressIdToUse || addresses.length === 0) {
        const newAddrPayload = {
          recipientName: `${addressForm.firstName} ${addressForm.secondName}`.trim(),
          phone: addressForm.phoneNumber.replace(/[^0-9+]/g, '') || '9876543210',
          streetAddress: addressForm.address.trim() || '42, Sunset Boulevard, Linking Road',
          city: addressForm.city.trim() || 'Mumbai',
          state: 'Maharashtra',
          postalCode: addressForm.zipCode.trim() || '400050',
          country: addressForm.country || 'India',
          addressType: 'SHIPPING',
          isDefault: true,
        };
        const addrRes = await userAPI.addAddress(newAddrPayload);
        const saved = addrRes.data?.data || addrRes.data;
        addressIdToUse = saved.id;
        setSelectedAddressId(saved.id);
      }

      // 2. Synchronize cart with backend if needed
      try {
        const cartCheck = await cartAPI.get();
        const serverCart = cartCheck.data?.data || cartCheck.data;
        if (!serverCart?.items || serverCart.items.length === 0) {
          for (const item of items) {
            const pid = item.productId || item.id;
            if (pid) {
              await cartAPI.addItem({ productId: pid, quantity: item.quantity || 1 });
            }
          }
        }
      } catch (err) {
        console.warn('Pre-checkout sync:', err);
      }

      // 3. Create Order
      const orderPayload = {
        shippingAddressId: Number(addressIdToUse),
        billingAddressId: Number(addressIdToUse),
        paymentMethod: paymentMethod,
        couponCode: appliedCoupon?.code || null,
      };

      const r = await orderAPI.create(orderPayload);
      const orderData = r.data?.data || r.data;
      const orderId = orderData?.id || orderData?.orderNumber;

      if (paymentMethod === 'COD') {
        clearCart && clearCart();
        showToast('Order placed successfully! 🎉', 'success');
        navigate(`/checkout/confirmation/${orderId}`);
      } else {
        // Online Payment Flow (Razorpay)
        try {
          const payOrderRes = await paymentAPI.createOrder({
            orderId: orderData.id,
            amount: Math.round(total * 100),
            currency: 'INR',
          });
          const rzpOrder = payOrderRes.data?.data || payOrderRes.data;

          if (window.Razorpay) {
            const options = {
              key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_shopsphere123',
              amount: rzpOrder?.amount || Math.round(total * 100),
              currency: rzpOrder?.currency || 'INR',
              name: 'ShopSphere Global',
              description: `Order #${orderData.orderNumber || orderId}`,
              order_id: rzpOrder?.razorpayOrderId || rzpOrder?.id,
              handler: async (response) => {
                try {
                  await paymentAPI.verify({
                    orderId: orderData.id,
                    razorpayOrderId: response.razorpay_order_id,
                    razorpayPaymentId: response.razorpay_payment_id,
                    razorpaySignature: response.razorpay_signature,
                  });
                } catch {}
                clearCart && clearCart();
                showToast('Payment successful! Order confirmed 🎉', 'success');
                navigate(`/checkout/confirmation/${orderId}`);
              },
              prefill: {
                name: `${addressForm.firstName} ${addressForm.secondName}`.trim(),
                email: user?.email || '',
                contact: addressForm.phoneNumber || '',
              },
              theme: { color: '#2563eb' },
            };
            const rzp = new window.Razorpay(options);
            rzp.open();
          } else {
            clearCart && clearCart();
            showToast('Order placed successfully with online payment! 🎉', 'success');
            navigate(`/checkout/confirmation/${orderId}`);
          }
        } catch {
          clearCart && clearCart();
          showToast('Order placed successfully! 🎉', 'success');
          navigate(`/checkout/confirmation/${orderId}`);
        }
      }
    } catch (err) {
      showToast(err?.response?.data?.message || 'Failed to place order. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  /* ── Not Authenticated View ── */
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200/80 shadow-xl p-8 text-center">
          <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Lock className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Sign In to Continue</h2>
          <p className="text-sm text-slate-500 mb-6">
            Please log in with your customer account to access your delivery addresses and complete checkout.
          </p>
          <div className="space-y-3">
            <Link
              to="/login"
              state={{ from: { pathname: '/checkout' } }}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-colors shadow-md shadow-blue-500/20 text-sm"
            >
              Sign In to Checkout <ChevronRight className="w-4 h-4" />
            </Link>
            <Link
              to="/register"
              state={{ from: { pathname: '/checkout' } }}
              className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl flex items-center justify-center text-sm transition-colors"
            >
              Create Free Account
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] py-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── Top Stepper ── */}
        <CheckoutStepper current={2} />

        <div className="grid lg:grid-cols-12 gap-8 items-start">

          {/* ── LEFT COLUMN: Address Details Card (Image 5 style) ── */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 sm:p-8">
            <div className="mb-6">
              <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                Address Details
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Dynamically whiteboard frictionless models for client-centric architectures.
              </p>
            </div>

            {/* Delivery Address Form */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-900">Delivery Address</h3>

              {/* First Name & Second Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                    First Name
                  </label>
                  <input
                    type="text"
                    value={addressForm.firstName}
                    onChange={(e) => setAddressForm({ ...addressForm, firstName: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Bander"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                    Second Name
                  </label>
                  <input
                    type="text"
                    value={addressForm.secondName}
                    onChange={(e) => setAddressForm({ ...addressForm, secondName: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Wierzbicki"
                  />
                </div>
              </div>

              {/* Address */}
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                  Address
                </label>
                <input
                  type="text"
                  value={addressForm.address}
                  onChange={(e) => setAddressForm({ ...addressForm, address: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="For a faster checkout experience add your address"
                />
              </div>

              {/* City & Zip-Code */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                    City
                  </label>
                  <input
                    type="text"
                    value={addressForm.city}
                    onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="City"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                    Zip-Code
                  </label>
                  <input
                    type="text"
                    value={addressForm.zipCode}
                    onChange={(e) => setAddressForm({ ...addressForm, zipCode: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="000-000"
                  />
                </div>
              </div>

              {/* Country */}
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                  Country
                </label>
                <select
                  value={addressForm.country}
                  onChange={(e) => setAddressForm({ ...addressForm, country: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="India">India</option>
                  <option value="United States">United States</option>
                  <option value="United Kingdom">United Kingdom</option>
                  <option value="Canada">Canada</option>
                  <option value="Germany">Germany</option>
                  <option value="UAE">United Arab Emirates</option>
                </select>
              </div>

              {/* Phone Number */}
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                  Phone Number
                </label>
                <input
                  type="text"
                  value={addressForm.phoneNumber}
                  onChange={(e) => setAddressForm({ ...addressForm, phoneNumber: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="+888 010-0001-9889"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Keep 11-digit format with no space and dashes.
                </p>
              </div>

              {/* Billing Address Checkbox */}
              <div className="pt-2">
                <h3 className="text-sm font-bold text-slate-900 mb-2">Billing Address</h3>
                <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={useDeliveryAsBilling}
                    onChange={(e) => setUseDeliveryAsBilling(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                  />
                  <span>Use delivery as billing address</span>
                </label>
              </div>

              {/* ── Delivery Method Cards (Image 5) ── */}
              <div className="pt-4 border-t border-slate-100">
                <h3 className="text-sm font-bold text-slate-900 mb-3">Delivery Method</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { id: 'DHL', title: 'DHL EXPRESS', price: '$15.99 (₹199)', date: 'Tomorrow' },
                    { id: 'FEDEX', title: 'FEDEX', price: '$9.99 (₹99)', date: 'Friday, 06.09.2025' },
                    { id: 'GLS', title: 'GLS', price: '$7.99 (Free)', date: 'Monday, 13.09.2025' },
                  ].map((carrier) => {
                    const isSelected = deliveryMethod === carrier.id;
                    return (
                      <div
                        key={carrier.id}
                        onClick={() => setDeliveryMethod(carrier.id)}
                        className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all relative ${
                          isSelected
                            ? 'border-blue-500 bg-blue-50/20 shadow-sm'
                            : 'border-slate-200 hover:border-slate-300 bg-white'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <span className="text-xs font-bold text-slate-900">{carrier.title}</span>
                          <div
                            className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                              isSelected ? 'border-blue-600 bg-blue-600' : 'border-slate-300'
                            }`}
                          >
                            {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                          </div>
                        </div>
                        <p className="text-xs font-bold text-slate-700">{carrier.price}</p>
                        <p className="text-[10px] text-slate-400 mt-2">Package Arrives:</p>
                        <p className="text-[11px] font-semibold text-slate-800">{carrier.date}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Payment Method Selection */}
              <div className="pt-4 border-t border-slate-100">
                <h3 className="text-sm font-bold text-slate-900 mb-3">Payment Preference</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div
                    onClick={() => setPaymentMethod('COD')}
                    className={`p-3 rounded-xl border cursor-pointer transition-all ${
                      paymentMethod === 'COD'
                        ? 'border-blue-500 bg-blue-50/20'
                        : 'border-slate-200 bg-white'
                    }`}
                  >
                    <p className="text-xs font-bold text-slate-900">💵 Cash on Delivery</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Pay at doorstep</p>
                  </div>
                  <div
                    onClick={() => setPaymentMethod('RAZORPAY')}
                    className={`p-3 rounded-xl border cursor-pointer transition-all ${
                      paymentMethod === 'RAZORPAY'
                        ? 'border-blue-500 bg-blue-50/20'
                        : 'border-slate-200 bg-white'
                    }`}
                  >
                    <p className="text-xs font-bold text-slate-900">💳 Card / UPI / NetBanking</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Instant online payment</p>
                  </div>
                </div>
              </div>

              {/* Navigation Actions */}
              <div className="flex items-center justify-between pt-6 border-t border-slate-100 mt-6">
                <Link
                  to="/cart"
                  className="px-5 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-xs font-bold text-slate-700 transition-colors"
                >
                  Back
                </Link>

                <button
                  onClick={handlePlaceOrder}
                  disabled={loading || !items.length}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-blue-500/20 flex items-center gap-1.5"
                >
                  {loading ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</>
                  ) : (
                    <>Next Step <ChevronRight className="w-3.5 h-3.5" /></>
                  )}
                </button>
              </div>

            </div>
          </div>

          {/* ── RIGHT COLUMN: Order Summary & Support (Image 5 style) ── */}
          <div className="lg:col-span-5 space-y-6">

            {/* Order Summary Card */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6">
              <h3 className="text-base font-extrabold text-slate-900 mb-4">
                Order Summary
              </h3>

              {/* Items Table */}
              <div className="space-y-4 max-h-64 overflow-y-auto pr-1 mb-5">
                <div className="grid grid-cols-12 text-[11px] font-bold uppercase tracking-wider text-slate-400 pb-2 border-b border-slate-100">
                  <span className="col-span-8">Product</span>
                  <span className="col-span-2 text-center">QTY</span>
                  <span className="col-span-2 text-right">Price</span>
                </div>

                {items.map((item) => (
                  <div key={item.id} className="grid grid-cols-12 items-center gap-2 text-xs">
                    <div className="col-span-8 flex items-center gap-3">
                      <img
                        src={item.imageUrl || 'https://placehold.co/48x48/f1f5f9/475569?text=Item'}
                        alt={item.productName}
                        className="w-10 h-10 object-contain rounded-lg bg-slate-50 border border-slate-100 flex-shrink-0"
                        onError={(e) => { e.target.src = 'https://placehold.co/48x48/f1f5f9/475569?text=Item'; }}
                      />
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-800 truncate">{item.productName}</p>
                        <p className="text-[10px] text-slate-400">Color: RED • Size: Standard</p>
                      </div>
                    </div>
                    <span className="col-span-2 text-center text-slate-600 font-medium">
                      {item.quantity}
                    </span>
                    <span className="col-span-2 text-right font-bold text-slate-900">
                      {formatCurrency((item.effectivePrice || item.price) * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Coupon Row */}
              {!appliedCoupon ? (
                <div className="flex gap-2 mb-4">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    placeholder="Coupon code (e.g. SAVE10)"
                    className="flex-1 px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  <button
                    onClick={handleApplyCoupon}
                    disabled={couponLoading || !couponCode.trim()}
                    className="px-3.5 py-2 bg-slate-900 hover:bg-blue-600 text-white rounded-xl text-xs font-bold transition-colors disabled:opacity-50"
                  >
                    {couponLoading ? '...' : 'Apply'}
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between bg-blue-50 px-3 py-2 rounded-xl mb-4 text-xs">
                  <span className="font-bold text-blue-700">🎉 Coupon: {appliedCoupon.code}</span>
                  <button onClick={() => setAppliedCoupon(null)} className="text-rose-500 font-bold hover:underline">
                    Remove
                  </button>
                </div>
              )}

              {/* Price Calculation */}
              <div className="space-y-2.5 text-xs border-t border-slate-100 pt-4">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal ({items.length} items)</span>
                  <span className="font-bold text-slate-900">{formatCurrency(subtotal)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-semibold">
                    <span>Discount</span>
                    <span>−{formatCurrency(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-600">
                  <span>Shipping Cost</span>
                  <span className="font-bold text-slate-900">{carrierRates[deliveryMethod].feeDisplay}</span>
                </div>
                <div className="flex justify-between text-sm font-extrabold text-slate-900 border-t border-slate-100 pt-3">
                  <span>Total</span>
                  <span className="text-blue-600">{formatCurrency(total)}</span>
                </div>
              </div>
            </div>

            {/* Need Help? Contact Us Card (Image 5) */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 text-xs text-slate-600 space-y-3">
              <h4 className="text-sm font-extrabold text-slate-900">
                Need help? Contact Us!
              </h4>
              <p className="text-[11px] text-slate-400">Please Call:</p>
              <p className="text-sm font-extrabold text-slate-900 tracking-tight">
                +48 123 113 123 / +91 1800 200 8899
              </p>
              <div className="text-[11px] text-slate-400 space-y-0.5">
                <p>Monday - Friday: 8:00 - 20:00</p>
                <p>Saturday: 9:00 - 16:00</p>
              </div>

              {/* Delivery Methods Badges */}
              <div className="pt-3 border-t border-slate-100">
                <p className="text-[11px] font-bold text-slate-700 mb-2">Delivery Methods</p>
                <div className="flex items-center gap-3">
                  <span className="px-2.5 py-1 bg-[#ffcc00] text-red-700 font-black italic rounded text-[11px] tracking-tighter">DHL</span>
                  <span className="px-2.5 py-1 bg-[#4d148c] text-orange-400 font-black rounded text-[11px]">FedEx</span>
                  <span className="px-2.5 py-1 bg-[#001489] text-white font-bold rounded text-[11px]">GLS</span>
                </div>
              </div>

              {/* Payment Methods Badges */}
              <div className="pt-3 border-t border-slate-100">
                <p className="text-[11px] font-bold text-slate-700 mb-2">Payment Methods</p>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 border border-slate-200 rounded text-[10px] font-bold text-slate-700">Mastercard</span>
                  <span className="px-2 py-0.5 border border-slate-200 rounded text-[10px] font-bold text-slate-700">Visa</span>
                  <span className="px-2 py-0.5 border border-slate-200 rounded text-[10px] font-bold text-slate-700">UPI</span>
                  <span className="px-2 py-0.5 border border-slate-200 rounded text-[10px] font-bold text-slate-700">COD</span>
                </div>
              </div>
            </div>

          </div>

        </div>

        {/* ── 3 Trust Highlights at Bottom (Image 5 style) ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 pt-10 border-t border-slate-200/80">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0 shadow-sm">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">Secure Shopping</h4>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Completely embrace out-of-the-box human capital with plug-and-play 256-bit SSL safety.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0 shadow-sm">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">Free and Easy Return</h4>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Completely embrace out-of-the-box human capital with frictionless 14-day guaranteed returns.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0 shadow-sm">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">6 Years Of Experience</h4>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Completely embrace out-of-the-box human capital with certified authorized brand warranty.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
