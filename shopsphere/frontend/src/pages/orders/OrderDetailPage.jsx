import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Package, MapPin, CreditCard, ChevronLeft, Loader2, RotateCcw, X } from 'lucide-react';
import { orderAPI } from '../../api/index';
import { formatCurrency, formatDate } from '../../utils/helpers';
import { useToast } from '../../context/ToastContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const STATUS_STEPS = ['PLACED', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED'];

const statusColors = {
  PLACED: 'bg-blue-100 text-blue-700',
  CONFIRMED: 'bg-indigo-100 text-indigo-700',
  PROCESSING: 'bg-yellow-100 text-yellow-700',
  SHIPPED: 'bg-purple-100 text-purple-700',
  OUT_FOR_DELIVERY: 'bg-orange-100 text-orange-700',
  DELIVERED: 'bg-emerald-100 text-emerald-700',
  CANCELLED: 'bg-red-100 text-red-700',
  RETURN_REQUESTED: 'bg-amber-100 text-amber-700',
  RETURNED: 'bg-gray-100 text-gray-700',
};

const OrderDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    orderAPI.getById(id)
      .then((r) => setOrder(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  const handleCancel = async () => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    setCancelling(true);
    try {
      await orderAPI.cancel(id);
      const r = await orderAPI.getById(id);
      setOrder(r.data);
      showToast('Order cancelled successfully', 'success');
    } catch (err) {
      showToast(err?.response?.data?.message || 'Cannot cancel this order', 'error');
    } finally {
      setCancelling(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><LoadingSpinner size="xl" /></div>;
  if (!order) return <div className="min-h-screen flex items-center justify-center text-gray-500">Order not found.</div>;

  const currentStep = STATUS_STEPS.indexOf(order.status);
  const canCancel = ['PLACED', 'CONFIRMED'].includes(order.status);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => navigate('/orders')} className="p-2 rounded-lg hover:bg-gray-200 transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Order #{order.orderNumber || order.id}</h1>
            <p className="text-sm text-gray-500">{formatDate(order.createdAt)}</p>
          </div>
          <span className={`ml-auto text-xs font-medium px-3 py-1.5 rounded-full ${statusColors[order.status] || 'bg-gray-100 text-gray-600'}`}>
            {order.status?.replace(/_/g, ' ')}
          </span>
        </div>

        {/* Status Timeline */}
        {!['CANCELLED', 'RETURN_REQUESTED', 'RETURNED'].includes(order.status) && (
          <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
            <h2 className="font-semibold text-gray-900 mb-6">Order Tracking</h2>
            <div className="flex items-center">
              {STATUS_STEPS.map((step, i) => (
                <React.Fragment key={step}>
                  <div className="flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                      i <= currentStep ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-400'
                    }`}>
                      {i < currentStep ? '✓' : i + 1}
                    </div>
                    <span className={`mt-2 text-xs text-center max-w-[60px] leading-tight ${i <= currentStep ? 'text-emerald-700 font-medium' : 'text-gray-400'}`}>
                      {step.replace(/_/g, ' ')}
                    </span>
                  </div>
                  {i < STATUS_STEPS.length - 1 && (
                    <div className={`flex-1 h-1 mx-2 rounded-full transition-all ${i < currentStep ? 'bg-emerald-500' : 'bg-gray-100'}`} />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-6">
          {/* Order Items */}
          <div className="md:col-span-2 space-y-4">
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2"><Package className="w-4 h-4 text-emerald-600" /> Items Ordered</h2>
              <div className="space-y-4">
                {order.items?.map((item) => (
                  <div key={item.id} className="flex gap-4">
                    <img
                      src={item.imageUrl || 'https://placehold.co/64x64?text=P'}
                      alt={item.productName}
                      className="w-16 h-16 object-contain bg-gray-50 rounded-xl border border-gray-100"
                      onError={(e) => { e.target.src = 'https://placehold.co/64x64?text=P'; }}
                    />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 text-sm">{item.productName}</p>
                      <p className="text-xs text-gray-500 mt-0.5">Qty: {item.quantity}</p>
                      <p className="text-sm font-semibold text-gray-900 mt-1">{formatCurrency(item.price * item.quantity)}</p>
                    </div>
                    <span className="text-sm text-gray-600">{formatCurrency(item.price)} each</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Delivery Address */}
            {order.shippingAddress && (
              <div className="bg-white rounded-2xl border border-gray-100 p-5">
                <h2 className="font-semibold text-gray-900 mb-3 flex items-center gap-2"><MapPin className="w-4 h-4 text-emerald-600" /> Delivery Address</h2>
                <div className="text-sm text-gray-700 space-y-1">
                  <p className="font-medium">{order.shippingAddress.fullName}</p>
                  <p>{order.shippingAddress.addressLine1}</p>
                  {order.shippingAddress.addressLine2 && <p>{order.shippingAddress.addressLine2}</p>}
                  <p>{order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}</p>
                  {order.shippingAddress.phone && <p className="text-gray-500">{order.shippingAddress.phone}</p>}
                </div>
              </div>
            )}
          </div>

          {/* Summary + Actions */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2"><CreditCard className="w-4 h-4 text-emerald-600" /> Payment</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-gray-600"><span>Method</span><span className="font-medium">{order.paymentMethod}</span></div>
                <div className="flex justify-between text-gray-600"><span>Subtotal</span><span>{formatCurrency(order.subtotalAmount || order.totalAmount)}</span></div>
                {order.discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-600"><span>Discount</span><span>-{formatCurrency(order.discountAmount)}</span></div>
                )}
                <div className="flex justify-between text-gray-600"><span>Shipping</span><span>{order.shippingAmount > 0 ? formatCurrency(order.shippingAmount) : 'FREE'}</span></div>
                <div className="flex justify-between font-bold text-gray-900 border-t border-gray-100 pt-2 mt-2">
                  <span>Total</span><span>{formatCurrency(order.totalAmount)}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            {canCancel && (
              <button
                onClick={handleCancel}
                disabled={cancelling}
                className="w-full py-3 border-2 border-red-200 text-red-600 hover:bg-red-50 font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-60"
              >
                {cancelling ? <Loader2 className="w-4 h-4 animate-spin" /> : <X className="w-4 h-4" />}
                Cancel Order
              </button>
            )}
            {order.status === 'DELIVERED' && (
              <button className="w-full py-3 border-2 border-orange-200 text-orange-600 hover:bg-orange-50 font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors">
                <RotateCcw className="w-4 h-4" /> Request Return
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailPage;
