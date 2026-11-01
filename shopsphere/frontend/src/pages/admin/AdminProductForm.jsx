import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Loader2, ArrowLeft, Save } from 'lucide-react';
import { adminAPI, categoryAPI } from '../../api/index';
import { useToast } from '../../context/ToastContext';

const AdminProductForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const isEdit = Boolean(id);

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: '', description: '', price: '', discountPrice: '', brand: '',
    stockQuantity: '', categoryId: '', imageUrl: '',
    images: '', specifications: '', featured: false, active: true,
  });

  useEffect(() => {
    categoryAPI.getAll().then((r) => setCategories(r.data?.content || r.data || [])).catch(() => {});
    if (isEdit) {
      setLoading(true);
      adminAPI.getProductById(id)
        .then((r) => {
          const p = r.data;
          setForm({
            name: p.name || '', description: p.description || '',
            price: p.price || '', discountPrice: p.discountPrice || '',
            brand: p.brand || '', stockQuantity: p.stockQuantity || '',
            categoryId: p.categoryId || '', imageUrl: p.imageUrl || '',
            images: p.images?.map((i) => i.imageUrl).join('\n') || '',
            specifications: p.specifications
              ? (typeof p.specifications === 'string' ? p.specifications : JSON.stringify(p.specifications, null, 2))
              : '',
            featured: p.featured || false, active: p.active !== false,
          });
        })
        .catch(() => showToast('Failed to load product', 'error'))
        .finally(() => setLoading(false));
    }
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((p) => ({ ...p, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.price || !form.stockQuantity || !form.categoryId) {
      showToast('Please fill in all required fields', 'error'); return;
    }
    setSaving(true);
    try {
      const payload = {
        name: form.name, description: form.description,
        price: parseFloat(form.price),
        discountPrice: form.discountPrice ? parseFloat(form.discountPrice) : null,
        brand: form.brand, stockQuantity: parseInt(form.stockQuantity),
        categoryId: parseInt(form.categoryId), imageUrl: form.imageUrl,
        imageUrls: form.images.split('\n').map((s) => s.trim()).filter(Boolean),
        specifications: form.specifications || null,
        featured: form.featured, active: form.active,
      };
      if (isEdit) {
        await adminAPI.updateProduct(id, payload);
        showToast('Product updated!', 'success');
      } else {
        await adminAPI.createProduct(payload);
        showToast('Product created!', 'success');
      }
      navigate('/admin/products');
    } catch (err) {
      showToast(err?.response?.data?.message || 'Failed to save product', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center h-96"><Loader2 className="w-8 h-8 animate-spin text-gray-400" /></div>;

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/admin/products')} className="p-2 rounded-lg hover:bg-gray-200 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-2xl font-bold text-gray-900">{isEdit ? 'Edit Product' : 'Add New Product'}</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
          <h2 className="font-semibold text-gray-900">Basic Information</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Product Name *</label>
            <input type="text" name="name" value={form.name} onChange={handleChange} required
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
            <textarea name="description" value={form.description} onChange={handleChange} rows={4}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Category *</label>
              <select name="categoryId" value={form.categoryId} onChange={handleChange} required
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
                <option value="">Select category</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Brand</label>
              <input type="text" name="brand" value={form.brand} onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
          <h2 className="font-semibold text-gray-900">Pricing & Inventory</h2>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Price (₹) *</label>
              <input type="number" name="price" value={form.price} onChange={handleChange} required min="0" step="0.01"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Discount Price (₹)</label>
              <input type="number" name="discountPrice" value={form.discountPrice} onChange={handleChange} min="0" step="0.01"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Stock Quantity *</label>
              <input type="number" name="stockQuantity" value={form.stockQuantity} onChange={handleChange} required min="0"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
          <h2 className="font-semibold text-gray-900">Images</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Primary Image URL</label>
            <input type="url" name="imageUrl" value={form.imageUrl} onChange={handleChange}
              placeholder="https://example.com/image.jpg"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Additional Image URLs (one per line)</label>
            <textarea name="images" value={form.images} onChange={handleChange} rows={3}
              placeholder="https://example.com/img1.jpg&#10;https://example.com/img2.jpg"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none font-mono" />
          </div>
          {form.imageUrl && (
            <img src={form.imageUrl} alt="Preview" className="w-24 h-24 object-contain bg-gray-50 rounded-xl border border-gray-100"
              onError={(e) => { e.target.style.display = 'none'; }} />
          )}
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
          <h2 className="font-semibold text-gray-900">Specifications & Settings</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Specifications (JSON format)</label>
            <textarea name="specifications" value={form.specifications} onChange={handleChange} rows={5}
              placeholder={'{\n  "Color": "Black",\n  "Material": "Cotton",\n  "Size": "M"\n}'}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none font-mono" />
          </div>
          <div className="flex gap-6">
            <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
              <input type="checkbox" name="featured" checked={form.featured} onChange={handleChange} className="accent-emerald-600 w-4 h-4" />
              Featured Product
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
              <input type="checkbox" name="active" checked={form.active} onChange={handleChange} className="accent-emerald-600 w-4 h-4" />
              Active (visible to customers)
            </label>
          </div>
        </div>

        <div className="flex gap-3">
          <button type="submit" disabled={saving}
            className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition-colors disabled:opacity-60">
            {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : <><Save className="w-4 h-4" /> {isEdit ? 'Update Product' : 'Create Product'}</>}
          </button>
          <button type="button" onClick={() => navigate('/admin/products')}
            className="px-6 py-3 border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminProductForm;
