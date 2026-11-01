import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Edit2, Trash2, ToggleLeft, ToggleRight, Loader2, Globe } from 'lucide-react';
import { adminAPI } from '../../api/index';
import { formatCurrency } from '../../utils/helpers';
import { useToast } from '../../context/ToastContext';
import ProductScraperModal from '../../components/product/ProductScraperModal';

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [scraperOpen, setScraperOpen] = useState(false);
  const { showToast } = useToast();

  const fetchProducts = (s = search, p = page) => {
    setLoading(true);
    const params = { page: p, size: 15 };
    if (s) params.search = s;
    adminAPI.getProducts(params)
      .then((r) => {
        const data = r.data?.data || r.data || {};
        setProducts(data.content || (Array.isArray(data) ? data : []));
        setTotalPages(data.totalPages || 0);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchProducts(); }, [page]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(0);
    fetchProducts(search, 0);
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete product "${name}"?`)) return;
    try {
      await adminAPI.deleteProduct(id);
      showToast('Product deleted', 'success');
      fetchProducts();
    } catch { showToast('Failed to delete product', 'error'); }
  };

  const handleToggle = async (id, current) => {
    try {
      await adminAPI.updateProduct(id, { active: !current });
      setProducts((p) => p.map((x) => x.id === id ? { ...x, active: !current } : x));
    } catch { showToast('Failed to update product', 'error'); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="text-xs text-gray-500 mt-1">Manage catalog or import live items from online platforms</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setScraperOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-gray-900 hover:bg-black text-white rounded-xl text-sm font-medium transition-colors"
          >
            <Globe className="w-4 h-4 text-emerald-400" /> Web Scrape & Import
          </button>
          <Link to="/admin/products/new" className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-medium transition-colors">
            <Plus className="w-4 h-4" /> Add Product
          </Link>
        </div>
      </div>

      <ProductScraperModal
        isOpen={scraperOpen}
        onClose={() => setScraperOpen(false)}
        onImportSuccess={() => fetchProducts(search, page)}
      />

      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products..."
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <button type="submit" className="px-4 py-2.5 bg-gray-800 text-white rounded-xl text-sm font-medium hover:bg-gray-700">Search</button>
      </form>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-5 py-3.5 font-medium text-gray-500">Product</th>
                <th className="text-left px-5 py-3.5 font-medium text-gray-500">Category</th>
                <th className="text-left px-5 py-3.5 font-medium text-gray-500">Price</th>
                <th className="text-left px-5 py-3.5 font-medium text-gray-500">Stock</th>
                <th className="text-left px-5 py-3.5 font-medium text-gray-500">Status</th>
                <th className="text-right px-5 py-3.5 font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={6} className="py-12 text-center"><Loader2 className="w-6 h-6 animate-spin text-gray-400 mx-auto" /></td></tr>
              ) : products.length === 0 ? (
                <tr><td colSpan={6} className="py-12 text-center text-gray-400">No products found</td></tr>
              ) : products.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={p.imageUrl || 'https://placehold.co/40x40?text=P'}
                        alt={p.name}
                        className="w-10 h-10 object-contain bg-gray-50 rounded-lg border border-gray-100"
                        onError={(e) => { e.target.src = 'https://placehold.co/40x40?text=P'; }}
                      />
                      <div>
                        <div className="font-medium text-gray-900 line-clamp-1 max-w-[200px]">{p.name}</div>
                        {p.brand && <div className="text-xs text-gray-400">{p.brand}</div>}
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-gray-600">{p.categoryName || '—'}</td>
                  <td className="px-5 py-4">
                    <div className="font-semibold text-gray-900">{formatCurrency(p.discountPrice || p.price)}</div>
                    {p.discountPrice && p.discountPrice < p.price && (
                      <div className="text-xs text-gray-400 line-through">{formatCurrency(p.price)}</div>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <span className={`font-medium ${p.stockQuantity <= 5 ? 'text-red-600' : p.stockQuantity <= 20 ? 'text-amber-600' : 'text-gray-900'}`}>
                      {p.stockQuantity}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <button onClick={() => handleToggle(p.id, p.active)} className="flex items-center gap-1.5 text-xs font-medium transition-colors">
                      {p.active !== false
                        ? <><ToggleRight className="w-5 h-5 text-emerald-500" /><span className="text-emerald-600">Active</span></>
                        : <><ToggleLeft className="w-5 h-5 text-gray-400" /><span className="text-gray-400">Inactive</span></>
                      }
                    </button>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <Link to={`/admin/products/${p.id}/edit`} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                        <Edit2 className="w-4 h-4" />
                      </Link>
                      <button onClick={() => handleDelete(p.id, p.name)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
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

export default AdminProducts;
