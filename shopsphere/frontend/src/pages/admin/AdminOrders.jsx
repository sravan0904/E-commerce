import React, { useEffect, useState } from 'react';
import { Search, ChevronDown, Loader2 } from 'lucide-react';
import { adminAPI } from '../../api/index';
import { formatCurrency, formatDate } from '../../utils/helpers';
import { useToast } from '../../context/ToastContext';

const ALL_STATUSES = ['PLACED','CONFIRMED','PROCESSING','SHIPPED','OUT_FOR_DELIVERY','DELIVERED','CANCELLED','RETURN_REQUESTED','RETURNED'];

const statusColors = {
  PLACED: 'bg-blue-100 text-blue-700', CONFIRMED: 'bg-indigo-100 text-indigo-700',
  PROCESSING: 'bg-yellow-100 text-yellow-700', SHIPPED: 'bg-purple-100 text-purple-700',
  OUT_FOR_DELIVERY: 'bg-orange-100 text-orange-700', DELIVERED: 'bg-emerald-100 text-emerald-700',
  CANCELLED: 'bg-red-100 text-red-700', RETURN_REQUESTED: 'bg-amber-100 text-amber-700',
  RETURNED: 'bg-gray-100 text-gray-600',
};

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [updatingId, setUpdatingId] = useState(null);
  const { showToast } = useToast();

  const fetchOrders = (p = page) => {
    setLoading(true);
    const params = { page: p, size: 15 };
    if (search) params.search = search;
    if (statusFilter) params.status = statusFilter;
    adminAPI.getOrders(params)
      .then((r) => {
        setOrders(r.data?.content || r.data || []);
        setTotalPages(r.data?.totalPages || 0);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchOrders(); }, [page, statusFilter]);

  const handleSearch = (e) => { e.preventDefault(); setPage(0); fetchOrders(0); };

  const handleStatusChange = async (orderId, newStatus) => {
    setUpdatingId(orderId);
    try {
      await adminAPI.updateOrderStatus(orderId, { status: newStatus });
      setOrders((prev) => prev.map((o) => o.id === orderId ? { ...o, status: newStatus } : o));
      showToast('Order status updated', 'success');
    } catch {
      showToast('Failed to update status', 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Orders</h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by order# or email..."
              className="pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 w-64" />
          </div>
          <button type="submit" className="px-4 py-2.5 bg-gray-800 text-white rounded-xl text-sm font-medium hover:bg-gray-700">Search</button>
        </form>
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }}
          className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white">
          <option value="">All Statuses</option>
          {ALL_STATUSES.map((s) => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-5 py-3.5 font-medium text-gray-500">Order</th>
                <th className="text-left px-5 py-3.5 font-medium text-gray-500">Customer</th>
                <th className="text-left px-5 py-3.5 font-medium text-gray-500">Amount</th>
                <th className="text-left px-5 py-3.5 font-medium text-gray-500">Payment</th>
                <th className="text-left px-5 py-3.5 font-medium text-gray-500">Status</th>
                <th className="text-left px-5 py-3.5 font-medium text-gray-500">Date</th>
                <th className="text-left px-5 py-3.5 font-medium text-gray-500">Update Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={7} className="py-12 text-center"><Loader2 className="w-6 h-6 animate-spin text-gray-400 mx-auto" /></td></tr>
              ) : orders.length === 0 ? (
                <tr><td colSpan={7} className="py-12 text-center text-gray-400">No orders found</td></tr>
              ) : orders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-5 py-4 font-semibold text-gray-900">#{order.orderNumber || order.id}</td>
                  <td className="px-5 py-4 text-gray-700">{order.customerName || order.customerEmail}</td>
                  <td className="px-5 py-4 font-semibold text-gray-900">{formatCurrency(order.totalAmount)}</td>
                  <td className="px-5 py-4">
                    <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-lg font-medium">{order.paymentMethod}</span>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[order.status] || 'bg-gray-100 text-gray-600'}`}>
                      {order.status?.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-gray-500">{formatDate(order.createdAt)}</td>
                  <td className="px-5 py-4">
                    <div className="relative">
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        disabled={updatingId === order.id || ['DELIVERED','CANCELLED','RETURNED'].includes(order.status)}
                        className="pl-3 pr-8 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white disabled:opacity-50 appearance-none"
                      >
                        {ALL_STATUSES.map((s) => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
                      </select>
                      {updatingId === order.id
                        ? <Loader2 className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 animate-spin text-gray-400" />
                        : <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" />
                      }
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="px-5 py-4 border-t border-gray-100 flex items-center justify-between text-sm">
            <span className="text-gray-500">Page {page + 1} of {totalPages}</span>
            <div className="flex gap-2">
              <button onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0}
                className="px-3 py-1.5 border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50">Prev</button>
              <button onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))} disabled={page === totalPages - 1}
                className="px-3 py-1.5 border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50">Next</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminOrders;
