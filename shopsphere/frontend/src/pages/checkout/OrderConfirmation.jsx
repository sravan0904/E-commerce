import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle2, Package, Home, ShoppingBag, Truck, MapPin, Clock } from 'lucide-react';
import { orderAPI } from '../../api/index';
import { formatCurrency } from '../../utils/helpers';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const OrderConfirmation = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const isNum = /^\d+$/.test(orderId);
    const fetchCall = isNum ? orderAPI.getById(orderId) : orderAPI.track(orderId);

    fetchCall
      .then((r) => {
        const data = r.data?.data || r.data;
        setOrder(data);
      })
      .catch(() => {
        orderAPI.track(orderId)
          .then((r) => setOrder(r.data?.data || r.data))
          .catch(() => {});
      })
      .finally(() => setLoading(false));
  }, [orderId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="xl" />
      </div>
    );
  }

  const deliveryDate = () => {
    const d = new Date();
    d.setDate(d.getDate() + 5);
    return d.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 flex items-center justify-center px-4 py-12">
      {/* Animated background dots */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-emerald-200 opacity-20 animate-ping"
            style={{
              width: `${40 + i * 20}px`,
              height: `${40 + i * 20}px`,
              top: `${10 + i * 15}%`,
              left: `${5 + i * 17}%`,
              animationDelay: `${i * 0.4}s`,
              animationDuration: `${2 + i * 0.5}s`,
            }}
          />
        ))}
      </div>

      <div className="relative max-w-lg w-full">
        {/* Success Icon */}
        <div className="text-center mb-8">
          <div className="relative inline-flex">
            <div className="w-28 h-28 bg-emerald-100 rounded-full flex items-center justify-center shadow-xl shadow-emerald-200">
              <CheckCircle2 className="w-16 h-16 text-emerald-600" />
            </div>
            <div className="absolute inset-0 rounded-full border-4 border-emerald-300 animate-ping opacity-40" />
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mt-6">Order Placed! 🎉</h1>
          <p className="text-gray-500 mt-2 text-lg">Thank you for shopping with ShopSphere</p>
          {order && (
            <p className="text-sm text-emerald-600 font-semibold mt-2">
              Order #{order.orderNumber || order.id}
            </p>
          )}
        </div>

        {/* Order Details Card */}
        {order && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-lg overflow-hidden mb-6">
            {/* Status Banner */}
            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-4 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  <span className="font-semibold">Order Confirmed</span>
                </div>
                <span className="text-xs bg-white/20 px-2.5 py-1 rounded-full font-medium">
                  {order.status || 'PLACED'}
                </span>
              </div>
            </div>

            <div className="p-6 space-y-5">
              {/* Order Info Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-500 mb-1">Payment Method</p>
                  <p className="font-semibold text-gray-900 text-sm">{order.paymentMethod || 'COD'}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-500 mb-1">Total Amount</p>
                  <p className="font-bold text-emerald-600 text-sm">{formatCurrency(order.totalAmount)}</p>
                </div>
              </div>

              {/* Delivery estimate */}
              <div className="flex items-start gap-3 bg-blue-50 border border-blue-100 rounded-xl p-4">
                <Truck className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-blue-900">Estimated Delivery</p>
                  <p className="text-sm text-blue-700">{deliveryDate()}</p>
                </div>
              </div>

              {/* Items */}
              {order.items?.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <ShoppingBag className="w-4 h-4 text-gray-400" />
                    Items Ordered ({order.items.length})
                  </h3>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {order.items.map((item, i) => (
                      <div key={item.id || i} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                        <div className="w-8 h-8 bg-gray-100 rounded-lg flex-shrink-0 flex items-center justify-center text-xs text-gray-500 font-medium">
                          {item.quantity}×
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-800 truncate">{item.productName || `Item ${i + 1}`}</p>
                        </div>
                        <span className="text-sm font-semibold text-gray-900 flex-shrink-0">
                          {formatCurrency((item.price || item.unitPrice) * item.quantity)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Delivery Address */}
              {order.shippingAddress && (
                <div className="flex items-start gap-2 text-sm text-gray-600 bg-gray-50 rounded-xl p-3">
                  <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-800">{order.shippingAddress.fullName}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {order.shippingAddress.addressLine1}, {order.shippingAddress.city} - {order.shippingAddress.pincode}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            to="/orders"
            className="flex-1 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-colors shadow-lg shadow-emerald-200"
          >
            <Package className="w-4 h-4" /> Track My Order
          </Link>
          <Link
            to="/products"
            className="flex-1 py-3.5 bg-white border-2 border-gray-200 hover:border-gray-300 text-gray-700 font-bold rounded-xl flex items-center justify-center gap-2 transition-colors hover:bg-gray-50"
          >
            <ShoppingBag className="w-4 h-4" /> Continue Shopping
          </Link>
        </div>

        <Link
          to="/"
          className="flex items-center justify-center gap-1.5 mt-4 text-sm text-gray-400 hover:text-gray-600 transition-colors"
        >
          <Home className="w-3.5 h-3.5" /> Back to Home
        </Link>
      </div>
    </div>
  );
};

export default OrderConfirmation;
