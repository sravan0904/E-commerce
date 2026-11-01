import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, ChevronRight } from 'lucide-react';
import { orderAPI } from '../../api/index';
import { formatCurrency, formatDate } from '../../utils/helpers';
import EmptyState from '../../components/common/EmptyState';
import LoadingSpinner from '../../components/common/LoadingSpinner';

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

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    orderAPI.getAll()
      .then((r) => setOrders(r.data?.content || r.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><LoadingSpinner size="xl" /></div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">My Orders</h1>

        {!orders.length ? (
          <EmptyState
            icon={Package}
            title="No orders yet"
            description="You haven't placed any orders. Start shopping to see them here."
            actionLabel="Shop Now"
            actionTo="/products"
          />
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <Link
                key={order.id}
                to={`/orders/${order.id}`}
                className="block bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-shadow group"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <span className="font-semibold text-gray-900">Order #{order.orderNumber || order.id}</span>
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusColors[order.status] || 'bg-gray-100 text-gray-600'}`}>
                        {order.status?.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">{formatDate(order.createdAt)}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-gray-900">{formatCurrency(order.totalAmount)}</span>
                    <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-emerald-600 transition-colors" />
                  </div>
                </div>

                {/* Items preview */}
                {order.items?.length > 0 && (
                  <div className="mt-4 flex gap-3 overflow-hidden">
                    {order.items.slice(0, 4).map((item) => (
                      <img
                        key={item.id}
                        src={item.imageUrl || 'https://placehold.co/60x60?text=P'}
                        alt={item.productName}
                        className="w-14 h-14 object-contain bg-gray-50 rounded-xl border border-gray-100"
                        onError={(e) => { e.target.src = 'https://placehold.co/60x60?text=P'; }}
                      />
                    ))}
                    {order.items.length > 4 && (
                      <div className="w-14 h-14 bg-gray-100 rounded-xl flex items-center justify-center text-xs text-gray-500 font-medium border border-gray-100">
                        +{order.items.length - 4}
                      </div>
                    )}
                  </div>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersPage;
