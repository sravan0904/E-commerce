import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { MapPin, Plus, CreditCard, Truck, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { userAPI, orderAPI, paymentAPI, couponAPI } from '../../api/index';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { formatCurrency } from '../../utils/helpers';

const CheckoutPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { cart, clearCartLocal } = useCart();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [loading, setLoading] = useState(false);
  const [loadingAddresses, setLoadingAddresses] = useState(true);
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(location.state?.appliedCoupon || null);
  const [couponLoading, setCouponLoading] = useState(false);

  const [newAddress, setNewAddress] = useState({
    fullName: '', phone: '', addressLine1: '', addressLine2: '',
    city: '', state: '', pincode: '', country: 'India', isDefault: false,
  });

  const items = cart?.items || [];
  const subtotal = items.reduce((s, i) => s + (i.effectivePrice || i.price) * i.quantity, 0);
  const discount = appliedCoupon
    ? appliedCoupon.discountType === 'PERCENTAGE'
      ? Math.min(subtotal * appliedCoupon.discountValue / 100, appliedCoupon.maxDiscount || Infinity)
      : appliedCoupon.discountValue
    : 0;
  const shipping = subtotal - discount >= 499 ? 0 : 49;
  const total = subtotal - discount + shipping;

  useEffect(() => {
    userAPI.getAddresses()
      .then((r) => {
        const addrs = r.data || [];
        setAddresses(addrs);
        const def = addrs.find((a) => a.isDefault) || addrs[0];
        if (def) setSelectedAddressId(def.id);
      })
      .catch(() => {})
      .finally(() => setLoadingAddresses(false));
  }, []);

  const handleApplyCoupon = async () => {
    setCouponLoading(true);
    try {
      const r = await couponAPI.apply({ code: couponCode.trim(), orderAmount: subtotal });
      setAppliedCoupon(r.data);
      showToast('Coupon applied!', 'success');
    } catch (err) {
      showToast(err?.response?.data?.message || 'Invalid coupon', 'error');
    } finally {
      setCouponLoading(false);
    }
  };

  const handleSaveAddress = async () => {
    if (!newAddress.fullName || !newAddress.addressLine1 || !newAddress.city || !newAddress.pincode) {
      showToast('Please fill required address fields', 'error'); return;
    }
    try {
      const r = await userAPI.addAddress(newAddress);
      setAddresses((p) => [...p, r.data]);
      setSelectedAddressId(r.data.id);
      setShowAddAddress(false);
      setNewAddress({ fullName: '', phone: '', addressLine1: '', addressLine2: '', city: '', state: '', pincode: '', country: 'India', isDefault: false });
      showToast('Address saved!', 'success');
    } catch {
      showToast('Failed to save address', 'error');
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddressId) { showToast('Please select a delivery address', 'error'); return; }
    if (!items.length) { showToast('Your cart is empty', 'error'); return; }

    setLoading(true);
    try {
      if (paymentMethod === 'COD') {
        const r = await orderAPI.create({
          addressId: selectedAddressId,
          paymentMethod: 'COD',
          couponCode: appliedCoupon?.code || null,
        });
        clearCartLocal && clearCartLocal();
        showToast('Order placed successfully! 🎉', 'success');
        navigate(`/checkout/confirmation/${r.data.id}`);
      } else {
        // Razorpay
        const payOrderRes = await paymentAPI.createOrder({
          amount: Math.round(total * 100),
          currency: 'INR',
        });
        const rzpOrder = payOrderRes.data;

        const options = {
          key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_shopsphere123',
          amount: rzpOrder.amount,
          currency: rzpOrder.currency,
          name: 'ShopSphere',
          description: 'Order Payment',
          order_id: rzpOrder.id,
          handler: async (response) => {
            try {
              const verRes = await paymentAPI.verify({
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
                addressId: selectedAddressId,
                couponCode: appliedCoupon?.code || null,
              });
              clearCartLocal && clearCartLocal();
              showToast('Payment successful! 🎉', 'success');
              navigate(`/checkout/confirmation/${verRes.data.orderId}`);
            } catch {
              showToast('Payment verification failed', 'error');
            }
          },
          prefill: { name: `${user?.firstName} ${user?.lastName}`, email: user?.email, contact: user?.phone },
          theme: { color: '#059669' },
        };
        const rzp = new window.Razorpay(options);
        rzp.open();
        rzp.on('payment.failed', () => showToast('Payment failed. Please try again.', 'error'));
      }
    } catch (err) {
      showToast(err?.response?.data?.message || 'Failed to place order', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">Checkout</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left: Address + Payment */}
          <div className="lg:col-span-2 space-y-6">
            {/* Delivery Address */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h2 className="font-semibold text-gray-900 mb-5 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-emerald-600" /> Delivery Address
              </h2>

              {loadingAddresses ? (
                <div className="flex justify-center py-4"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>
              ) : (
                <div className="space-y-3">
                  {addresses.map((addr) => (
                    <label
                      key={addr.id}
                      className={`flex gap-3 p-4 border-2 rounded-xl cursor-pointer transition-colors ${
                        selectedAddressId === addr.id ? 'border-emerald-500 bg-emerald-50' : 'border-gray-100 hover:border-gray-200'
                      }`}
                    >
                      <input
                        type="radio"
                        name="address"
                        value={addr.id}
                        checked={selectedAddressId === addr.id}
                        onChange={() => setSelectedAddressId(addr.id)}
                        className="mt-1 accent-emerald-600"
                      />
                      <div className="text-sm">
                        <div className="font-semibold text-gray-900">{addr.fullName}</div>
                        <div className="text-gray-600">{addr.addressLine1}{addr.addressLine2 ? `, ${addr.addressLine2}` : ''}</div>
                        <div className="text-gray-600">{addr.city}, {addr.state} - {addr.pincode}</div>
                        {addr.phone && <div className="text-gray-500">{addr.phone}</div>}
                        {addr.isDefault && <span className="text-xs text-emerald-600 font-medium">Default</span>}
                      </div>
                    </label>
                  ))}

                  <button
                    onClick={() => setShowAddAddress((v) => !v)}
                    className="flex items-center gap-2 text-sm text-emerald-600 hover:text-emerald-700 font-medium mt-2"
                  >
                    <Plus className="w-4 h-4" />
                    {showAddAddress ? 'Cancel' : 'Add New Address'}
                  </button>

                  {showAddAddress && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-xl space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs font-medium text-gray-600 mb-1 block">Full Name *</label>
                          <input type="text" value={newAddress.fullName} onChange={(e) => setNewAddress((p) => ({ ...p, fullName: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                        </div>
                        <div>
                          <label className="text-xs font-medium text-gray-600 mb-1 block">Phone</label>
                          <input type="tel" value={newAddress.phone} onChange={(e) => setNewAddress((p) => ({ ...p, phone: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                        </div>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-600 mb-1 block">Address Line 1 *</label>
                        <input type="text" value={newAddress.addressLine1} onChange={(e) => setNewAddress((p) => ({ ...p, addressLine1: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-600 mb-1 block">Address Line 2</label>
                        <input type="text" value={newAddress.addressLine2} onChange={(e) => setNewAddress((p) => ({ ...p, addressLine2: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <label className="text-xs font-medium text-gray-600 mb-1 block">City *</label>
                          <input type="text" value={newAddress.city} onChange={(e) => setNewAddress((p) => ({ ...p, city: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                        </div>
                        <div>
                          <label className="text-xs font-medium text-gray-600 mb-1 block">State</label>
                          <input type="text" value={newAddress.state} onChange={(e) => setNewAddress((p) => ({ ...p, state: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                        </div>
                        <div>
                          <label className="text-xs font-medium text-gray-600 mb-1 block">Pincode *</label>
                          <input type="text" value={newAddress.pincode} onChange={(e) => setNewAddress((p) => ({ ...p, pincode: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                        </div>
                      </div>
                      <label className="flex items-center gap-2 text-sm text-gray-700">
                        <input type="checkbox" checked={newAddress.isDefault} onChange={(e) => setNewAddress((p) => ({ ...p, isDefault: e.target.checked }))} className="accent-emerald-600" />
                        Set as default address
                      </label>
                      <button onClick={handleSaveAddress} className="px-5 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700">Save Address</button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h2 className="font-semibold text-gray-900 mb-5 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-emerald-600" /> Payment Method
              </h2>
              <div className="space-y-3">
                {[
                  { value: 'COD', label: 'Cash on Delivery', desc: 'Pay when your order arrives', icon: '💵' },
                  { value: 'RAZORPAY', label: 'Online Payment', desc: 'Cards, UPI, Netbanking & more via Razorpay', icon: '💳' },
                ].map((opt) => (
                  <label
                    key={opt.value}
                    className={`flex gap-4 p-4 border-2 rounded-xl cursor-pointer transition-colors ${
                      paymentMethod === opt.value ? 'border-emerald-500 bg-emerald-50' : 'border-gray-100 hover:border-gray-200'
                    }`}
                  >
                    <input type="radio" name="payment" value={opt.value} checked={paymentMethod === opt.value} onChange={() => setPaymentMethod(opt.value)} className="mt-1 accent-emerald-600" />
                    <div>
                      <div className="font-medium text-gray-900 flex items-center gap-2">{opt.icon} {opt.label}</div>
                      <div className="text-xs text-gray-500 mt-0.5">{opt.desc}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Order Summary */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <h3 className="font-semibold text-gray-900 mb-4">Order Summary ({items.length} items)</h3>
              <div className="space-y-3 max-h-60 overflow-y-auto mb-4">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-3">
                    <img src={item.imageUrl || 'https://placehold.co/48x48?text=P'} alt={item.productName} className="w-12 h-12 object-contain rounded-lg bg-gray-50 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-800 truncate">{item.productName}</p>
                      <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                    </div>
                    <span className="text-sm font-medium text-gray-900 flex-shrink-0">
                      {formatCurrency((item.effectivePrice || item.price) * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Coupon */}
              {!appliedCoupon ? (
                <div className="flex gap-2 mb-4">
                  <input
                    type="text" value={couponCode} onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    placeholder="Coupon code"
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <button onClick={handleApplyCoupon} disabled={couponLoading || !couponCode}
                    className="px-3 py-2 bg-emerald-600 text-white rounded-lg text-xs font-medium disabled:opacity-50 flex items-center gap-1">
                    {couponLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Apply'}
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-2 mb-4">
                  <span className="text-xs font-semibold text-emerald-700">🎉 {appliedCoupon.code}</span>
                  <button onClick={() => setAppliedCoupon(null)} className="text-xs text-red-500">Remove</button>
                </div>
              )}

              {/* Totals */}
              <div className="space-y-2 text-sm border-t border-gray-100 pt-4">
                <div className="flex justify-between text-gray-600"><span>Subtotal</span><span>{formatCurrency(subtotal)}</span></div>
                {discount > 0 && <div className="flex justify-between text-emerald-600"><span>Discount</span><span>-{formatCurrency(discount)}</span></div>}
                <div className="flex justify-between text-gray-600"><span>Shipping</span><span>{shipping === 0 ? 'FREE' : formatCurrency(shipping)}</span></div>
                <div className="flex justify-between font-bold text-gray-900 text-base border-t border-gray-100 pt-2 mt-2">
                  <span>Total</span><span>{formatCurrency(total)}</span>
                </div>
              </div>

              <button
                onClick={handlePlaceOrder}
                disabled={loading || !selectedAddressId || !items.length}
                className="w-full mt-5 py-3.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors"
              >
                {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Placing Order...</> : `Place Order • ${formatCurrency(total)}`}
              </button>

              <p className="text-xs text-center text-gray-400 mt-3 flex items-center justify-center gap-1">
                <span>🔒</span> Secure & encrypted checkout
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
