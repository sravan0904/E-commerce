import React, { useEffect, useState } from 'react';
import { Search, Loader2, UserCheck, UserX, Shield } from 'lucide-react';
import { adminAPI } from '../../api/index';
import { formatDate } from '../../utils/helpers';
import { useToast } from '../../context/ToastContext';

const AdminCustomers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [togglingId, setTogglingId] = useState(null);
  const { showToast } = useToast();

  const fetchCustomers = (p = page, s = search) => {
    setLoading(true);
    const params = { page: p, size: 15 };
    if (s) params.search = s;
    adminAPI.getCustomers(params)
      .then((r) => {
        setCustomers(r.data?.content || r.data || []);
        setTotalPages(r.data?.totalPages || 0);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCustomers(page, search);
  }, [page]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(0);
    fetchCustomers(0, search);
  };

  const handleToggleStatus = async (customer) => {
    const newStatus = !customer.enabled;
    setTogglingId(customer.id);
    try {
      await adminAPI.updateCustomerStatus(customer.id, newStatus);
      setCustomers((prev) =>
        prev.map((c) => (c.id === customer.id ? { ...c, enabled: newStatus } : c))
      );
      showToast(`User ${newStatus ? 'enabled' : 'disabled'} successfully`, 'success');
    } catch (err) {
      showToast(err?.response?.data?.message || 'Failed to update user status', 'error');
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
          <p className="text-sm text-gray-500 mt-1">Manage registered customer accounts</p>
        </div>
      </div>

      <form onSubmit={handleSearch} className="flex gap-2 max-w-md">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <button
          type="submit"
          className="px-4 py-2.5 bg-gray-800 text-white rounded-xl text-sm font-medium hover:bg-gray-700"
        >
          Search
        </button>
      </form>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-5 py-3.5 font-medium text-gray-500">Customer</th>
                <th className="text-left px-5 py-3.5 font-medium text-gray-500">Phone</th>
                <th className="text-left px-5 py-3.5 font-medium text-gray-500">Roles</th>
                <th className="text-left px-5 py-3.5 font-medium text-gray-500">Joined</th>
                <th className="text-left px-5 py-3.5 font-medium text-gray-500">Status</th>
                <th className="text-right px-5 py-3.5 font-medium text-gray-500">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center">
                    <Loader2 className="w-6 h-6 animate-spin text-gray-400 mx-auto" />
                  </td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-400">
                    No customers found
                  </td>
                </tr>
              ) : (
                customers.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-700 font-semibold flex items-center justify-center text-sm">
                          {(c.firstName?.[0] || 'U').toUpperCase()}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">
                            {c.firstName} {c.lastName}
                          </div>
                          <div className="text-xs text-gray-400">{c.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-gray-600">{c.phone || '—'}</td>
                    <td className="px-5 py-4">
                      <div className="flex gap-1 flex-wrap">
                        {c.roles?.map((r) => (
                          <span
                            key={r}
                            className={`px-2 py-0.5 rounded text-xs font-medium ${
                              r === 'ROLE_ADMIN'
                                ? 'bg-purple-100 text-purple-700'
                                : 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            {r.replace('ROLE_', '')}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-gray-500">{formatDate(c.createdAt)}</td>
                    <td className="px-5 py-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                          c.enabled !== false
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {c.enabled !== false ? 'Active' : 'Disabled'}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button
                        onClick={() => handleToggleStatus(c)}
                        disabled={togglingId === c.id || c.roles?.includes('ROLE_ADMIN')}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                          c.enabled !== false
                            ? 'text-red-600 hover:bg-red-50 border border-red-200'
                            : 'text-emerald-600 hover:bg-emerald-50 border border-emerald-200'
                        } disabled:opacity-40 disabled:cursor-not-allowed`}
                      >
                        {togglingId === c.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : c.enabled !== false ? (
                          <>
                            <UserX className="w-3.5 h-3.5" /> Disable
                          </>
                        ) : (
                          <>
                            <UserCheck className="w-3.5 h-3.5" /> Enable
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="px-5 py-4 border-t border-gray-100 flex items-center justify-between text-sm">
            <span className="text-gray-500">
              Page {page + 1} of {totalPages}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                className="px-3 py-1.5 border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50"
              >
                Prev
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={page === totalPages - 1}
                className="px-3 py-1.5 border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminCustomers;
