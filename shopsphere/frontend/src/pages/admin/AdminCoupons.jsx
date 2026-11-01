import React, { useEffect, useState } from 'react';
import { Plus, Trash2, Edit2, Loader2, Tag, Check, X, Calendar } from 'lucide-react';
import { adminAPI } from '../../api/index';
import { formatCurrency, formatDate } from '../../utils/helpers';
import { useToast } from '../../context/ToastContext';
import Modal from '../../components/common/Modal';

const AdminCoupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();

  const initialForm = {
    code: '',
    discountType: 'PERCENTAGE',
    discountValue: '',
    minimumOrderAmount: '',
    maxDiscountAmount: '',
    startDate: '',
    endDate: '',
    usageLimit: '',
    active: true,
  };

  const [form, setForm] = useState(initialForm);

  const fetchCoupons = () => {
    setLoading(true);
    adminAPI.getCoupons()
      .then((r) => setCoupons(r.data?.content || r.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleOpenCreate = () => {
    setEditId(null);
    setForm(initialForm);
    setModalOpen(true);
  };

  const handleOpenEdit = (c) => {
    setEditId(c.id);
    setForm({
      code: c.code || '',
      discountType: c.discountType || 'PERCENTAGE',
      discountValue: c.discountValue?.toString() || '',
      minimumOrderAmount: c.minimumOrderAmount?.toString() || '',
      maxDiscountAmount: c.maxDiscountAmount?.toString() || '',
      startDate: c.startDate ? c.startDate.slice(0, 10) : '',
      endDate: c.endDate ? c.endDate.slice(0, 10) : '',
      usageLimit: c.usageLimit?.toString() || '',
      active: c.active !== false,
    });
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.code.trim() || !form.discountValue) {
      showToast('Please provide a coupon code and discount value', 'error');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        code: form.code.trim().toUpperCase(),
        discountType: form.discountType,
        discountValue: parseFloat(form.discountValue),
        minimumOrderAmount: form.minimumOrderAmount ? parseFloat(form.minimumOrderAmount) : 0,
        maxDiscountAmount: form.maxDiscountAmount ? parseFloat(form.maxDiscountAmount) : null,
        startDate: form.startDate ? `${form.startDate}T00:00:00` : null,
        endDate: form.endDate ? `${form.endDate}T23:59:59` : null,
        usageLimit: form.usageLimit ? parseInt(form.usageLimit, 10) : null,
        active: form.active,
      };

      if (editId) {
        await adminAPI.updateCoupon(editId, payload);
        showToast('Coupon updated!', 'success');
      } else {
        await adminAPI.createCoupon(payload);
        showToast('Coupon created!', 'success');
      }
      setModalOpen(false);
      fetchCoupons();
    } catch (err) {
      showToast(err?.response?.data?.message || 'Failed to save coupon', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, code) => {
    if (!window.confirm(`Delete coupon "${code}"?`)) return;
    try {
      await adminAPI.deleteCoupon(id);
      showToast('Coupon deleted', 'success');
      fetchCoupons();
    } catch (err) {
      showToast(err?.response?.data?.message || 'Failed to delete coupon', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Coupons & Discounts</h1>
          <p className="text-sm text-gray-500 mt-1">Configure promotional offers and discounts</p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" /> Add Coupon
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-5 py-3.5 font-medium text-gray-500">Code</th>
                <th className="text-left px-5 py-3.5 font-medium text-gray-500">Discount</th>
                <th className="text-left px-5 py-3.5 font-medium text-gray-500">Min Order</th>
                <th className="text-left px-5 py-3.5 font-medium text-gray-500">Validity</th>
                <th className="text-left px-5 py-3.5 font-medium text-gray-500">Usage</th>
                <th className="text-left px-5 py-3.5 font-medium text-gray-500">Status</th>
                <th className="text-right px-5 py-3.5 font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center">
                    <Loader2 className="w-6 h-6 animate-spin text-gray-400 mx-auto" />
                  </td>
                </tr>
              ) : coupons.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-400">
                    No promotional coupons configured
                  </td>
                </tr>
              ) : (
                coupons.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50">
                    <td className="px-5 py-4 font-bold text-emerald-700">
                      <span className="bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg">
                        {c.code}
                      </span>
                    </td>
                    <td className="px-5 py-4 font-semibold text-gray-900">
                      {c.discountType === 'PERCENTAGE'
                        ? `${c.discountValue}%`
                        : formatCurrency(c.discountValue)}
                      {c.maxDiscountAmount ? (
                        <span className="text-xs text-gray-400 block font-normal">
                          Max: {formatCurrency(c.maxDiscountAmount)}
                        </span>
                      ) : null}
                    </td>
                    <td className="px-5 py-4 text-gray-600">
                      {c.minimumOrderAmount ? formatCurrency(c.minimumOrderAmount) : 'None'}
                    </td>
                    <td className="px-5 py-4 text-xs text-gray-500">
                      {c.startDate ? formatDate(c.startDate) : 'Start: Any'}
                      <br />
                      {c.endDate ? `Expires: ${formatDate(c.endDate)}` : 'No expiry'}
                    </td>
                    <td className="px-5 py-4 text-gray-600 text-xs">
                      {c.usageCount || 0}
                      {c.usageLimit ? ` / ${c.usageLimit}` : ' used'}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                          c.active ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        {c.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenEdit(c)}
                          className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(c.id, c.code)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editId ? 'Edit Coupon' : 'Create New Coupon'}
        footer={
          <>
            <button
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-medium transition-colors flex items-center gap-2"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {editId ? 'Update' : 'Create'}
            </button>
          </>
        }
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Coupon Code *</label>
              <input
                type="text"
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                placeholder="e.g. FESTIVE20"
                required
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Discount Type</label>
              <select
                value={form.discountType}
                onChange={(e) => setForm({ ...form, discountType: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
              >
                <option value="PERCENTAGE">Percentage (%)</option>
                <option value="FIXED_AMOUNT">Fixed Amount (₹)</option>
              </select>
            </div>
          </div>

          <div className="grid sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Value *</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.discountValue}
                onChange={(e) => setForm({ ...form, discountValue: e.target.value })}
                placeholder={form.discountType === 'PERCENTAGE' ? '10%' : '₹100'}
                required
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Min Order (₹)</label>
              <input
                type="number"
                min="0"
                value={form.minimumOrderAmount}
                onChange={(e) => setForm({ ...form, minimumOrderAmount: e.target.value })}
                placeholder="0"
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Max Cap (₹)</label>
              <input
                type="number"
                min="0"
                value={form.maxDiscountAmount}
                onChange={(e) => setForm({ ...form, maxDiscountAmount: e.target.value })}
                placeholder="Optional"
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Start Date</label>
              <input
                type="date"
                value={form.startDate}
                onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">End Date</label>
              <input
                type="date"
                value={form.endDate}
                onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Usage Limit</label>
            <input
              type="number"
              min="0"
              value={form.usageLimit}
              onChange={(e) => setForm({ ...form, usageLimit: e.target.value })}
              placeholder="Total times this coupon can be redeemed"
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <label className="flex items-center gap-2 text-sm text-gray-700 pt-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.active}
              onChange={(e) => setForm({ ...form, active: e.target.checked })}
              className="accent-emerald-600 w-4 h-4"
            />
            Active coupon
          </label>
        </form>
      </Modal>
    </div>
  );
};

export default AdminCoupons;
