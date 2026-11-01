import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  DollarSign, ShoppingCart, Users, Package,
  AlertTriangle, TrendingUp, ArrowUpRight, Clock
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';
import { adminAPI } from '../../api/index';
import { formatCurrency, formatDate } from '../../utils/helpers';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const statusColors = {
  PLACED: '#3B82F6', CONFIRMED: '#6366F1', PROCESSING: '#F59E0B',
  SHIPPED: '#8B5CF6', OUT_FOR_DELIVERY: '#F97316', DELIVERED: '#10B981',
  CANCELLED: '#EF4444', RETURNED: '#6B7280',
};

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminAPI.getDashboard()
      .then((r) => setStats(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center h-96"><LoadingSpinner size="xl" /></div>;

  const statCards = [
    { label: 'Total Revenue', value: formatCurrency(stats?.totalRevenue || 0), icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-50', change: '+12.5%' },
    { label: 'Total Orders', value: (stats?.totalOrders || 0).toLocaleString(), icon: ShoppingCart, color: 'text-blue-600', bg: 'bg-blue-50', change: '+8.1%' },
    { label: 'Total Customers', value: (stats?.totalCustomers || 0).toLocaleString(), icon: Users, color: 'text-purple-600', bg: 'bg-purple-50', change: '+5.3%' },
    { label: 'Total Products', value: (stats?.totalProducts || 0).toLocaleString(), icon: Package, color: 'text-orange-600', bg: 'bg-orange-50', change: '+2.0%' },
  ];

  const pieData = stats?.orderStatusDistribution
    ? Object.entries(stats.orderStatusDistribution).map(([name, value]) => ({ name, value }))
    : [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Welcome back! Here's what's happening.</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        {statCards.map((card) => (
          <div key={card.label} className="bg-white rounded-2xl border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className={`${card.bg} ${card.color} p-3 rounded-xl`}>
                <card.icon className="w-6 h-6" />
              </div>
              <span className="text-xs font-semibold text-emerald-600 flex items-center gap-0.5">
                <ArrowUpRight className="w-3 h-3" /> {card.change}
              </span>
            </div>
            <div className="text-2xl font-bold text-gray-900">{card.value}</div>
            <div className="text-sm text-gray-500 mt-1">{card.label}</div>
          </div>
        ))}
      </div>

      {/* Alerts Row */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
          <div>
            <p className="font-semibold text-amber-800 text-sm">{stats?.lowStockCount || 0} Low Stock Products</p>
            <Link to="/admin/inventory" className="text-xs text-amber-600 hover:underline">Manage inventory →</Link>
          </div>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex items-center gap-3">
          <Clock className="w-5 h-5 text-blue-600 flex-shrink-0" />
          <div>
            <p className="font-semibold text-blue-800 text-sm">{stats?.pendingOrdersCount || 0} Pending Orders</p>
            <Link to="/admin/orders" className="text-xs text-blue-600 hover:underline">View orders →</Link>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid xl:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="xl:col-span-2 bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-600" /> Monthly Revenue
          </h2>
          {stats?.monthlyRevenue?.length ? (
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={stats.monthlyRevenue}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(v) => [formatCurrency(v), 'Revenue']} />
                <Line type="monotone" dataKey="revenue" stroke="#10B981" strokeWidth={2.5} dot={{ r: 4, fill: '#10B981' }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[280px] flex items-center justify-center text-gray-400 text-sm">No revenue data yet</div>
          )}
        </div>

        {/* Order Status Pie */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="font-semibold text-gray-900 mb-6">Order Status</h2>
          {pieData.length ? (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="45%" outerRadius={90} dataKey="value" label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`} labelLine={false}>
                  {pieData.map((entry) => (
                    <Cell key={entry.name} fill={statusColors[entry.name] || '#CBD5E1'} />
                  ))}
                </Pie>
                <Legend formatter={(v) => <span className="text-xs text-gray-600">{v.replace(/_/g, ' ')}</span>} />
                <Tooltip formatter={(v, name) => [v, name.replace(/_/g, ' ')]} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[280px] flex items-center justify-center text-gray-400 text-sm">No order data yet</div>
          )}
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-semibold text-gray-900">Recent Orders</h2>
          <Link to="/admin/orders" className="text-sm text-emerald-600 hover:text-emerald-700 font-medium">View all →</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b border-gray-100">
                <th className="pb-3 font-medium text-gray-500">Order</th>
                <th className="pb-3 font-medium text-gray-500">Customer</th>
                <th className="pb-3 font-medium text-gray-500">Amount</th>
                <th className="pb-3 font-medium text-gray-500">Status</th>
                <th className="pb-3 font-medium text-gray-500">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {(stats?.recentOrders || []).map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="py-3 font-medium text-gray-900">#{order.orderNumber || order.id}</td>
                  <td className="py-3 text-gray-600">{order.customerName || order.customerEmail}</td>
                  <td className="py-3 font-semibold text-gray-900">{formatCurrency(order.totalAmount)}</td>
                  <td className="py-3">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                      order.status === 'DELIVERED' ? 'bg-emerald-100 text-emerald-700' :
                      order.status === 'CANCELLED' ? 'bg-red-100 text-red-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {order.status?.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="py-3 text-gray-500">{formatDate(order.createdAt)}</td>
                </tr>
              ))}
              {!stats?.recentOrders?.length && (
                <tr><td colSpan={5} className="py-8 text-center text-gray-400">No recent orders</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
