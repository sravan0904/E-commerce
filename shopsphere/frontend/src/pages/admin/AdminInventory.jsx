import React, { useEffect, useState } from 'react';
import { Search, Loader2, AlertTriangle, Edit3, ArrowUp, ArrowDown } from 'lucide-react';
import { adminAPI } from '../../api/index';
import { formatCurrency } from '../../utils/helpers';
import { useToast } from '../../context/ToastContext';
import Modal from '../../components/common/Modal';

const AdminInventory = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [lowStockOnly, setLowStockOnly] = useState(false);

  // Edit stock modal
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [stockChange, setStockChange] = useState('');
  const [reason, setReason] = useState('RESTOCK');
  const [updating, setUpdating] = useState(false);
  const { showToast } = useToast();

  const fetchInventory = (p = page, s = search, low = lowStockOnly) => {
    setLoading(true);
    const params = { page: p, size: 15 };
    if (s) params.search = s;
    if (low) params.lowStock = true;
    adminAPI.getInventory(params)
      .then((r) => {
        setProducts(r.data?.content || r.data || []);
        setTotalPages(r.data?.totalPages || 0);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchInventory(page, search, lowStockOnly);
  }, [page, lowStockOnly]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(0);
    fetchInventory(0, search, lowStockOnly);
  };

  const handleOpenStockModal = (product) => {
    setSelectedProduct(product);
    setStockChange(product.stockQuantity.toString());
    setReason('RESTOCK');
  };

  const handleUpdateStock = async () => {
    const newQty = parseInt(stockChange, 10);
    if (isNaN(newQty) || newQty < 0) {
      showToast('Please enter a valid stock quantity', 'error');
      return;
    }
    setUpdating(true);
    try {
      await adminAPI.updateInventory(selectedProduct.id, {
        stockQuantity: newQty,
        reason: reason,
      });
      showToast('Inventory updated successfully', 'success');
      setProducts((prev) =>
        prev.map((p) => (p.id === selectedProduct.id ? { ...p, stockQuantity: newQty } : p))
      );
      setSelectedProduct(null);
    } catch (err) {
      showToast(err?.response?.data?.message || 'Failed to update inventory', 'error');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inventory Management</h1>
          <p className="text-sm text-gray-500 mt-1">Track and adjust stock levels across your catalog</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <form onSubmit={handleSearch} className="flex gap-2 max-w-md flex-1">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search product inventory..."
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

        <button
          onClick={() => {
            setLowStockOnly((v) => !v);
            setPage(0);
          }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border transition-colors ${
            lowStockOnly
              ? 'bg-amber-50 border-amber-300 text-amber-700'
              : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
          }`}
        >
          <AlertTriangle className="w-4 h-4 text-amber-500" />
          Low Stock Only (≤ 10)
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-5 py-3.5 font-medium text-gray-500">Product</th>
                <th className="text-left px-5 py-3.5 font-medium text-gray-500">SKU / Brand</th>
                <th className="text-left px-5 py-3.5 font-medium text-gray-500">Unit Price</th>
                <th className="text-left px-5 py-3.5 font-medium text-gray-500">Current Stock</th>
                <th className="text-left px-5 py-3.5 font-medium text-gray-500">Stock Status</th>
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
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-400">
                    No products found
                  </td>
                </tr>
              ) : (
                products.map((p) => {
                  const isOutOfStock = p.stockQuantity <= 0;
                  const isLowStock = p.stockQuantity > 0 && p.stockQuantity <= 10;
                  return (
                    <tr key={p.id} className="hover:bg-gray-50">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={p.imageUrl || 'https://placehold.co/40x40?text=P'}
                            alt={p.name}
                            className="w-10 h-10 object-contain bg-gray-50 rounded-lg border border-gray-100"
                            onError={(e) => {
                              e.target.src = 'https://placehold.co/40x40?text=P';
                            }}
                          />
                          <div>
                            <div className="font-medium text-gray-900 line-clamp-1 max-w-xs">{p.name}</div>
                            <div className="text-xs text-gray-400">{p.categoryName || 'General'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-gray-600">{p.brand || '—'}</td>
                      <td className="px-5 py-4 font-medium text-gray-900">{formatCurrency(p.price)}</td>
                      <td className="px-5 py-4 font-bold text-gray-900 text-base">{p.stockQuantity}</td>
                      <td className="px-5 py-4">
                        {isOutOfStock ? (
                          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">
                            Out of Stock
                          </span>
                        ) : isLowStock ? (
                          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700 flex items-center gap-1 w-max">
                            <AlertTriangle className="w-3 h-3" /> Low Stock
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">
                            In Stock
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <button
                          onClick={() => handleOpenStockModal(p)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-gray-200 text-gray-700 hover:bg-gray-100 transition-colors"
                        >
                          <Edit3 className="w-3.5 h-3.5 text-gray-500" /> Adjust Stock
                        </button>
                      </td>
                    </tr>
                  );
                })
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

      {selectedProduct && (
        <Modal
          isOpen={Boolean(selectedProduct)}
          onClose={() => setSelectedProduct(null)}
          title={`Update Stock: ${selectedProduct.name}`}
          footer={
            <>
              <button
                onClick={() => setSelectedProduct(null)}
                className="px-4 py-2 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateStock}
                disabled={updating}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-medium transition-colors flex items-center gap-2"
              >
                {updating ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                Save Stock
              </button>
            </>
          }
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                New Stock Quantity
              </label>
              <input
                type="number"
                min="0"
                value={stockChange}
                onChange={(e) => setStockChange(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Adjustment Reason
              </label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
              >
                <option value="RESTOCK">Restock / New Shipment</option>
                <option value="INVENTORY_COUNT">Physical Inventory Audit</option>
                <option value="DAMAGED">Damaged Goods Removal</option>
                <option value="RETURN">Customer Return Restock</option>
                <option value="OTHER">Other Manual Adjustment</option>
              </select>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default AdminInventory;
