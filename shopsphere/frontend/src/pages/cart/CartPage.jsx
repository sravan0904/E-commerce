import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, Tag, Loader2 } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency } from '../../utils/helpers';
import EmptyState from '../../components/common/EmptyState';
import { couponAPI } from '../../api/index';
import { useToast } from '../../context/ToastContext';

const CartPage = () => {
  const { cart, updateQuantity, removeFromCart, loading } = useCart();
  const { isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [couponCode, setCouponCode] = React.useState('');
  const [couponLoading, setCouponLoading] = React.useState(false);
  const [appliedCoupon, setAppliedCoupon] = React.useState(null);

  const items = cart?.items || [];
  const subtotal = items.reduce((sum, item) => sum + (item.effectivePrice || item.price) * item.quantity, 0);
  const discount = appliedCoupon
    ? appliedCoupon.discountType === 'PERCENTAGE'
      ? subtotal * appliedCoupon.discountValue / 100
      : appliedCoupon.discountValue
    : 0;
  const shipping = subtotal - discount >= 499 ? 0 : 49;
  const total = subtotal - discount + shipping;

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    try {
      const r = await couponAPI.apply({ code: couponCode.trim(), orderAmount: subtotal });
      setAppliedCoupon(r.data);
      showToast(`Coupon applied! You save ${formatCurrency(r.data.discountAmount || discount)}`, 'success');
    } catch (err) {
      showToast(err?.response?.data?.message || 'Invalid coupon code', 'error');
    } finally {
      setCouponLoading(false);
    }
  };

  const handleCheckout = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: '/checkout' } } });
      return;
    }
    navigate('/checkout', { state: { appliedCoupon } });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-gray-200 border-t-emerald-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">
          Shopping Cart{items.length > 0 && <span className="text-base font-normal text-gray-500 ml-2">({items.length} items)</span>}
        </h1>

        {!items.length ? (
          <EmptyState
            icon={ShoppingBag}
            title="Your cart is empty"
            description="Add some products to your cart and they'll appear here."
            actionLabel="Start Shopping"
            actionTo="/products"
          />
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {items.map((item) => (
                <div key={item.id} className="bg-white rounded-2xl border border-gray-100 p-4 flex gap-4 hover:shadow-sm transition-shadow">
                  <Link to={`/products/${item.productId}`} className="flex-shrink-0">
                    <img
                      src={item.imageUrl || 'https://placehold.co/80x80?text=Product'}
                      alt={item.productName}
                      className="w-20 h-20 object-contain rounded-xl bg-gray-50"
                      onError={(e) => { e.target.src = 'https://placehold.co/80x80?text=Product'; }}
                    />
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link to={`/products/${item.productId}`}>
                      <h3 className="font-medium text-gray-900 hover:text-emerald-600 transition-colors line-clamp-2">{item.productName}</h3>
                    </Link>
                    <div className="mt-1 flex items-center gap-2">
                      <span className="text-emerald-600 font-semibold">{formatCurrency(item.effectivePrice || item.price)}</span>
                      {item.originalPrice && item.originalPrice > (item.effectivePrice || item.price) && (
                        <span className="text-xs text-gray-400 line-through">{formatCurrency(item.originalPrice)}</span>
                      )}
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
                        <button
                          onClick={() => item.quantity > 1 ? updateQuantity(item.id, item.quantity - 1) : removeFromCart(item.id)}
                          className="px-3 py-1.5 hover:bg-gray-50 transition-colors"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="px-3 py-1.5 text-sm font-medium min-w-[32px] text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="px-3 py-1.5 hover:bg-gray-50 transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-gray-900">
                          {formatCurrency((item.effectivePrice || item.price) * item.quantity)}
                        </span>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-gray-400 hover:text-red-500 transition-colors p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              <Link to="/products" className="inline-flex items-center gap-2 text-sm text-emerald-600 hover:text-emerald-700 font-medium mt-4">
                ← Continue Shopping
              </Link>
            </div>

            {/* Order Summary */}
            <div className="space-y-4">
              {/* Coupon */}
              <div className="bg-white rounded-2xl border border-gray-100 p-5">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Tag className="w-4 h-4 text-emerald-600" /> Apply Coupon
                </h3>
                {appliedCoupon ? (
                  <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3">
                    <div>
                      <span className="text-sm font-semibold text-emerald-700">{appliedCoupon.code}</span>
                      <p className="text-xs text-emerald-600">Coupon applied!</p>
                    </div>
                    <button onClick={() => { setAppliedCoupon(null); setCouponCode(''); }} className="text-xs text-red-500 hover:text-red-700">Remove</button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      placeholder="Enter code (try SAVE10)"
                      className="flex-1 px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      onKeyDown={(e) => e.key === 'Enter' && handleApplyCoupon()}
                    />
                    <button
                      onClick={handleApplyCoupon}
                      disabled={couponLoading || !couponCode.trim()}
                      className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-medium disabled:opacity-50 flex items-center gap-1"
                    >
                      {couponLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Apply'}
                    </button>
                  </div>
                )}
              </div>

              {/* Summary */}
              <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-3">
                <h3 className="font-semibold text-gray-900 mb-4">Order Summary</h3>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Subtotal ({items.length} items)</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-sm text-emerald-600">
                    <span>Discount</span>
                    <span>-{formatCurrency(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Shipping</span>
                  <span>{shipping === 0 ? <span className="text-emerald-600">FREE</span> : formatCurrency(shipping)}</span>
                </div>
                {shipping > 0 && (
                  <p className="text-xs text-gray-400">Add {formatCurrency(499 - (subtotal - discount))} more for free shipping</p>
                )}
                <div className="border-t border-gray-100 pt-3 flex justify-between font-bold text-gray-900">
                  <span>Total</span>
                  <span>{formatCurrency(total)}</span>
                </div>

                <button
                  onClick={handleCheckout}
                  className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors mt-2"
                >
                  Proceed to Checkout <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartPage;
