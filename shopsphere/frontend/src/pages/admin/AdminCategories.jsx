import React, { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, Loader2, Check, X } from 'lucide-react';
import { adminAPI } from '../../api/index';
import { useToast } from '../../context/ToastContext';

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();

  const emptyForm = { name: '', description: '', imageUrl: '', active: true };
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const fetchCategories = () => {
    setLoading(true);
    adminAPI.getCategories()
      .then((r) => setCategories(r.data?.content || r.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchCategories(); }, []);

  const handleEdit = (cat) => {
    setEditId(cat.id);
    setForm({ name: cat.name || '', description: cat.description || '', imageUrl: cat.imageUrl || '', active: cat.active !== false });
    setShowForm(true);
  };

  const handleAdd = () => {
    setEditId(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { showToast('Category name is required', 'error'); return; }
    setSaving(true);
    try {
      if (editId) {
        await adminAPI.updateCategory(editId, form);
        showToast('Category updated!', 'success');
      } else {
        await adminAPI.createCategory(form);
        showToast('Category created!', 'success');
      }
      setShowForm(false);
      fetchCategories();
    } catch (err) {
      showToast(err?.response?.data?.message || 'Failed to save category', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete category "${name}"? This may affect existing products.`)) return;
    try {
      await adminAPI.deleteCategory(id);
      showToast('Category deleted', 'success');
      fetchCategories();
    } catch (err) {
      showToast(err?.response?.data?.message || 'Failed to delete category', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
        <button onClick={handleAdd} className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-medium transition-colors">
          <Plus className="w-4 h-4" /> Add Category
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="font-semibold text-gray-900 mb-5">{editId ? 'Edit Category' : 'New Category'}</h2>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Name *</label>
                <input type="text" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} required
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Image URL</label>
                <input type="url" value={form.imageUrl} onChange={(e) => setForm((p) => ({ ...p, imageUrl: e.target.value }))}
                  placeholder="https://example.com/image.jpg"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
              <textarea value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} rows={2}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none" />
            </div>
            <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
              <input type="checkbox" checked={form.active} onChange={(e) => setForm((p) => ({ ...p, active: e.target.checked }))} className="accent-emerald-600 w-4 h-4" />
              Active (visible to customers)
            </label>
            <div className="flex gap-3">
              <button type="submit" disabled={saving}
                className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl text-sm disabled:opacity-60 transition-colors">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                {editId ? 'Update' : 'Create'}
              </button>
              <button type="button" onClick={() => setShowForm(false)}
                className="flex items-center gap-2 px-5 py-2.5 border border-gray-200 text-gray-700 font-medium rounded-xl text-sm hover:bg-gray-50 transition-colors">
                <X className="w-4 h-4" /> Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left px-5 py-3.5 font-medium text-gray-500">Category</th>
              <th className="text-left px-5 py-3.5 font-medium text-gray-500">Description</th>
              <th className="text-left px-5 py-3.5 font-medium text-gray-500">Status</th>
              <th className="text-right px-5 py-3.5 font-medium text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              <tr><td colSpan={4} className="py-12 text-center"><Loader2 className="w-6 h-6 animate-spin text-gray-400 mx-auto" /></td></tr>
            ) : categories.length === 0 ? (
              <tr><td colSpan={4} className="py-12 text-center text-gray-400">No categories found</td></tr>
            ) : categories.map((cat) => (
              <tr key={cat.id} className="hover:bg-gray-50">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    {cat.imageUrl && (
                      <img src={cat.imageUrl} alt={cat.name} className="w-10 h-10 object-cover rounded-lg bg-gray-50 border border-gray-100"
                        onError={(e) => { e.target.style.display = 'none'; }} />
                    )}
                    <span className="font-medium text-gray-900">{cat.name}</span>
                  </div>
                </td>
                <td className="px-5 py-4 text-gray-500 max-w-xs truncate">{cat.description || '—'}</td>
                <td className="px-5 py-4">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${cat.active !== false ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                    {cat.active !== false ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center justify-end gap-2">
                    <button onClick={() => handleEdit(cat)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(cat.id, cat.name)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminCategories;
