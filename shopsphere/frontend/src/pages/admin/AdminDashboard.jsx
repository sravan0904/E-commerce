import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Search, ArrowUpRight, ArrowDownRight, MoreHorizontal,
  Download, Upload, ChevronDown, Package, ShoppingBag,
  TrendingUp, Eye, ArrowRight, CheckCircle2, Clock, AlertCircle
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { adminAPI } from '../../api/index';
import { formatCurrency, formatDate } from '../../utils/helpers';
import LoadingSpinner from '../../components/common/LoadingSpinner';

// Donut Chart Colors matching Ecomora
const DONUT_COLORS = ['#e2e8f0', '#0f172a', '#94a3b8', '#cbd5e1'];

// Monthly multi-bar data matching Ecomora
const BAR_DATA = [
  { month: 'Jan', revenue: 3400, profit: 7000 },
  { month: 'Feb', revenue: 2800, profit: 6200 },
  { month: 'Mar', revenue: 4000, profit: 5800 },
  { month: 'May', revenue: 2500, profit: 5200 },
  { month: 'Apr', revenue: 4500, profit: 6500 },
];

// Donut category distribution matching Ecomora
const DONUT_DATA = [
  { name: 'Furniture', value: 89532 },
  { name: 'Shoes', value: 188500 },
  { name: 'Electronics', value: 90231 },
  { name: 'Clothes', value: 88865 },
];

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    adminAPI
      .getDashboard()
      .then((r) => setStats(r.data?.data || r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="xl" />
      </div>
    );
  }

  // Recent Orders matching Image 3 (Ecomora)
  const defaultRecentOrders = [
    {
      id: '#202523',
      productName: 'Airpods Pro Max',
      category: 'Electronics',
      date: '28 Mar 2025',
      payment: 'Mastercard',
      amount: '$1,230.00',
      status: 'In Progress',
      img: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100&q=80',
    },
    {
      id: '#202522',
      productName: 'Summer Clothes',
      category: 'Fashion',
      date: '27 Mar 2025',
      payment: 'Paypal',
      amount: '$3,112.00',
      status: 'Complete',
      img: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=100&q=80',
    },
    {
      id: '#202521',
      productName: 'Nike Shoes',
      category: 'Footwear',
      date: '26 Mar 2025',
      payment: 'Mastercard',
      amount: '$1,211.00',
      status: 'Waiting',
      img: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=100&q=80',
    },
    {
      id: '#202520',
      productName: 'Front Table CSS',
      category: 'Furniture',
      date: '25 Mar 2025',
      payment: 'Visa',
      amount: '$42,121.00',
      status: 'In Progress',
      img: 'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?w=100&q=80',
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* ── Top Header Bar (Ecomora Style) ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Dashboard</h1>
        </div>

        {/* Search, Export CSV, Download Report */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search product..."
              className="pl-9 pr-4 py-2 bg-white rounded-full border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 w-48 sm:w-60 shadow-sm"
            />
          </div>

          <button
            onClick={() => alert('Exporting orders CSV...')}
            className="flex items-center gap-1.5 px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-full text-xs font-semibold text-slate-700 shadow-sm transition-colors"
          >
            <Upload className="w-3.5 h-3.5 text-slate-500" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => alert('Downloading analytics report PDF...')}
            className="flex items-center gap-1.5 px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-full text-xs font-semibold text-slate-700 shadow-sm transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Download Report</span>
          </button>
        </div>
      </div>

      {/* ── Middle Metrics Grid (3 columns matching Image 3) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Column 1 (Left): Two stacked cards */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          {/* Card 1: Total Products Sales */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm flex flex-col justify-between flex-1">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500">Total Products Sales</p>
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-3xl font-black text-slate-900 tracking-tight">
                    {stats?.totalOrders ? (stats.totalOrders * 850).toLocaleString() : '202,324'}
                  </span>
                  <span className="bg-[#bbf7d0]/80 text-[#166534] text-[11px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-0.5">
                    +10% <ArrowUpRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
              <div className="w-10 h-10 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-600 shadow-inner">
                <TrendingUp className="w-5 h-5" />
              </div>
            </div>

            <div className="pt-6 mt-4 border-t border-slate-100">
              <Link
                to="/admin/orders"
                className="text-xs font-bold text-slate-900 hover:text-emerald-600 flex items-center justify-between group transition-colors"
              >
                <span>View Sales Details</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

          {/* Card 2: Total Volume Of Products */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm flex flex-col justify-between flex-1">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500">Total Volume Of Products</p>
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-3xl font-black text-slate-900 tracking-tight">
                    {stats?.totalProducts ? (stats.totalProducts * 440).toLocaleString() : '123,726'}
                  </span>
                  <span className="bg-[#fecaca]/80 text-[#991b1b] text-[11px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-0.5">
                    -12% <ArrowDownRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
              <div className="w-10 h-10 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-600 shadow-inner">
                <Package className="w-5 h-5" />
              </div>
            </div>

            <div className="pt-6 mt-4 border-t border-slate-100">
              <Link
                to="/admin/products"
                className="text-xs font-bold text-slate-900 hover:text-emerald-600 flex items-center justify-between group transition-colors"
              >
                <span>View All Products</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>

        {/* Column 2 (Center): Total Products Sales Bar Chart Card */}
        <div className="lg:col-span-4 bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500">Total Products Sales</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-3xl font-black text-slate-900 tracking-tight">
                    {stats?.totalRevenue ? formatCurrency(stats.totalRevenue) : '$500,324'}
                  </span>
                  <span className="bg-[#bbf7d0]/80 text-[#166534] text-[11px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-0.5">
                    +45% <ArrowUpRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
              <button className="text-slate-400 hover:text-slate-600 p-1">
                <MoreHorizontal className="w-5 h-5" />
              </button>
            </div>

            {/* Legend */}
            <div className="flex items-center justify-end gap-4 mt-4 text-[11px] font-bold text-slate-600">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-950" />
                <span>Total Revenue</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                <span>Total Profit</span>
              </div>
            </div>
          </div>

          {/* Bar Chart Visual */}
          <div className="h-52 w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={BAR_DATA} barGap={4}>
                <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                <YAxis hide />
                <Tooltip
                  cursor={{ fill: 'transparent' }}
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '11px' }}
                />
                <Bar dataKey="revenue" fill="#0f172a" radius={[8, 8, 8, 8]} barSize={24} />
                <Bar dataKey="profit" fill="#e2e8f0" radius={[8, 8, 8, 8]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Column 3 (Right): Total Sales Statistics Donut Chart Card */}
        <div className="lg:col-span-4 bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-bold text-slate-800">Total Sales Statistics</h3>
            <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-500 bg-slate-50 px-2 py-1 rounded-lg border border-slate-200">
              <span>Monthly</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </div>
          </div>

          {/* Category Values Legend */}
          <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
            <div>
              <p className="text-slate-400 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-slate-300" /> Furniture
              </p>
              <p className="font-extrabold text-slate-800 mt-0.5">89,532</p>
            </div>
            <div className="text-right">
              <p className="text-slate-400 flex items-center justify-end gap-1">
                <span className="w-2 h-2 rounded-full bg-slate-900" /> Shoes
              </p>
              <p className="font-extrabold text-slate-800 mt-0.5">1,88,500</p>
            </div>
          </div>

          {/* Donut Chart with Center Metric */}
          <div className="relative h-44 w-full flex items-center justify-center my-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={DONUT_DATA}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={68}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {DONUT_DATA.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={DONUT_COLORS[index % DONUT_COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>

            {/* Centered Stat */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-base font-black text-slate-900">23,324</span>
              <span className="bg-[#bbf7d0]/80 text-[#166534] text-[9px] font-extrabold px-1.5 py-0.2 rounded-full mt-0.5">
                +45%
              </span>
            </div>
          </div>

          {/* Bottom Total */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
            <div>
              <p className="text-slate-400 text-[10px]">Total Number of Sales</p>
              <p className="font-black text-slate-900 text-sm">3,44,0031</p>
            </div>
            <div className="text-right">
              <p className="text-slate-400 text-[10px] flex items-center gap-1 justify-end">
                <span className="w-2 h-2 rounded-full bg-slate-400" /> Clothes
              </p>
              <p className="font-bold text-slate-700 text-xs">88,865</p>
            </div>
          </div>
        </div>

      </div>

      {/* ── Bottom Row: Recent Orders (Left) & Top Selling Products (Right) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

        {/* Recent Orders Table Card (Ecomora style) */}
        <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Recent Orders</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Keep track of recent order data and others information.
              </p>
            </div>
            <Link
              to="/admin/orders"
              className="text-xs font-bold text-slate-900 hover:text-emerald-600 flex items-center gap-1 transition-colors"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-left text-slate-400 border-b border-slate-100 pb-3">
                  <th className="font-semibold py-3">Order Id</th>
                  <th className="font-semibold py-3">Product Name</th>
                  <th className="font-semibold py-3">Date</th>
                  <th className="font-semibold py-3">Payment</th>
                  <th className="font-semibold py-3">Amount</th>
                  <th className="font-semibold py-3">Status</th>
                  <th className="font-semibold py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {defaultRecentOrders.map((ord) => {
                  let statusBadge = (
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-50 text-blue-600">
                      In Progress
                    </span>
                  );
                  if (ord.status === 'Complete') {
                    statusBadge = (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-600">
                        Complete
                      </span>
                    );
                  } else if (ord.status === 'Waiting') {
                    statusBadge = (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-600">
                        Waiting
                      </span>
                    );
                  }

                  return (
                    <tr key={ord.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 font-bold text-slate-800">{ord.id}</td>
                      <td className="py-3.5">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={ord.img}
                            alt={ord.productName}
                            className="w-7 h-7 rounded-lg object-cover bg-slate-100 border border-slate-200/60"
                          />
                          <span className="font-semibold text-slate-900">{ord.productName}</span>
                        </div>
                      </td>
                      <td className="py-3.5 text-slate-500">{ord.date}</td>
                      <td className="py-3.5 text-slate-600 font-medium">{ord.payment}</td>
                      <td className="py-3.5 font-bold text-slate-900">{ord.amount}</td>
                      <td className="py-3.5">{statusBadge}</td>
                      <td className="py-3.5 text-right">
                        <button className="text-slate-400 hover:text-slate-600 p-1">
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Selling Products Card (Ecomora style) */}
        <div className="lg:col-span-4 bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold text-slate-800">Top Selling Products</h3>
            <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-500 bg-slate-50 px-2 py-1 rounded-lg border border-slate-200">
              <span>Monthly</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </div>
          </div>

          {/* Featured Product Box */}
          <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/60 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src="https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=100&q=80"
                alt="Apple Watch"
                className="w-10 h-10 rounded-xl object-cover bg-white border border-slate-200 shadow-sm"
              />
              <div>
                <p className="text-xs font-bold text-slate-900">Apple Watch Series 10 46mm GPS</p>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Brand: Apple • <span className="font-semibold text-slate-700">10.2k Stock Available</span>
                </p>
                <p className="text-xs font-extrabold text-slate-900 mt-1">$799.00</p>
              </div>
            </div>
            <button className="text-slate-400 hover:text-slate-600">
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </div>

          {/* Weekly Sales Activity Columns */}
          <div className="pt-6 mt-4 border-t border-slate-100">
            <div className="grid grid-cols-4 gap-2 text-center">
              <div>
                <p className="text-xs font-bold text-slate-900">840</p>
                <div className="w-full bg-slate-100 rounded-lg h-16 mt-2 relative overflow-hidden">
                  <div className="absolute bottom-0 inset-x-0 bg-slate-300 rounded-lg h-8" />
                </div>
                <p className="text-[10px] text-slate-400 mt-2 font-semibold">Tue</p>
              </div>

              <div>
                <p className="text-xs font-bold text-slate-900">2000</p>
                <div className="w-full bg-slate-100 rounded-lg h-16 mt-2 relative overflow-hidden">
                  <div className="absolute bottom-0 inset-x-0 bg-slate-400 rounded-lg h-11" />
                </div>
                <p className="text-[10px] text-slate-400 mt-2 font-semibold">Wed</p>
              </div>

              <div>
                <p className="text-xs font-bold text-slate-900">6000</p>
                <div className="w-full bg-slate-100 rounded-lg h-16 mt-2 relative overflow-hidden">
                  <div className="absolute bottom-0 inset-x-0 bg-slate-950 rounded-lg h-16" />
                </div>
                <p className="text-[10px] text-slate-400 mt-2 font-semibold">Thu</p>
              </div>

              <div>
                <p className="text-xs font-bold text-slate-900">1200</p>
                <div className="w-full bg-slate-100 rounded-lg h-16 mt-2 relative overflow-hidden">
                  <div className="absolute bottom-0 inset-x-0 bg-slate-300 rounded-lg h-10" />
                </div>
                <p className="text-[10px] text-slate-400 mt-2 font-semibold">Fri</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
