import React, { useState, useEffect, useRef } from 'react';
import {
  SlidersHorizontal, ChevronDown, ChevronUp, X, Search, Check,
  Sparkles, Smartphone, Laptop, Shirt, Home, Headphones, Watch, Tag, Star
} from 'lucide-react';
import { categoryAPI, productAPI } from '../../api';
import { formatCurrency } from '../../utils/helpers';

const categoryIcons = {
  smartphones: Smartphone,
  laptops: Laptop,
  electronics: Headphones,
  fashion: Shirt,
  'fashion-apparel': Shirt,
  'mens-clothing': Shirt,
  'womens-clothing': Shirt,
  home: Home,
  'home-living': Home,
  'home-decoration': Home,
  watches: Watch,
  'mens-watches': Watch,
  'womens-watches': Watch,
};

const popularBrands = [
  'Apple', 'Samsung', 'HP', 'Dell', 'Lenovo', 'Asus',
  'OnePlus', 'Redmi', 'Realme', 'Poco', 'Vivo', 'iQOO', 'Motorola', 'Sony', 'Nike'
];

export default function ProductFilters({
  filters = {},
  onFilterChange,
  onChange,
  onReset,
  categories: propCategories = []
}) {
  const [categories, setCategories] = useState(propCategories || []);
  const [brands, setBrands] = useState([]);
  const [brandSearch, setBrandSearch] = useState('');
  const [categorySearch, setCategorySearch] = useState('');

  // Dropdown open states
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const [brandDropdownOpen, setBrandDropdownOpen] = useState(false);
  const [openSections, setOpenSections] = useState({ price: true, rating: true });

  const categoryRef = useRef(null);
  const brandRef = useRef(null);

  const notifyChange = (newFilters) => {
    if (onFilterChange) onFilterChange(newFilters);
    if (onChange) onChange(newFilters);
  };

  useEffect(() => {
    if (propCategories && propCategories.length > 0) {
      setCategories(propCategories);
    } else {
      categoryAPI.getAll().then((res) => {
        const data = res.data?.data?.content || res.data?.data || res.data?.content || res.data || [];
        setCategories(Array.isArray(data) ? data : []);
      }).catch(() => {});
    }

    productAPI.getBrands().then((res) => {
      const data = res.data?.data || res.data || [];
      setBrands(Array.isArray(data) ? data : []);
    }).catch(() => {});
  }, [propCategories]);

  // Click outside to close dropdowns
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (categoryRef.current && !categoryRef.current.contains(e.target)) {
        setCategoryDropdownOpen(false);
      }
      if (brandRef.current && !brandRef.current.contains(e.target)) {
        setBrandDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const toggleSection = (name) => {
    setOpenSections((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  const selectedCategoryObj = categories.find((c) => String(c.id) === String(filters.categoryId));
  const selectedBrand = filters.brand;

  const filteredCategories = categories.filter((c) =>
    c.name.toLowerCase().includes(categorySearch.toLowerCase())
  );

  const filteredBrands = brands.filter((b) =>
    b.toLowerCase().includes(brandSearch.toLowerCase())
  );

  const activeFiltersCount = [
    filters.categoryId,
    filters.brand,
    filters.minPrice,
    filters.maxPrice,
    filters.minRating
  ].filter(Boolean).length;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 space-y-6">
      {/* Filter Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2 text-slate-900 font-bold text-sm tracking-tight">
          <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <SlidersHorizontal className="w-4 h-4" />
          </div>
          <span>Filter Products</span>
          {activeFiltersCount > 0 && (
            <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-[10px] font-bold flex items-center justify-center">
              {activeFiltersCount}
            </span>
          )}
        </div>
        {activeFiltersCount > 0 && (
          <button
            onClick={onReset}
            className="text-xs text-rose-500 hover:text-rose-600 font-semibold flex items-center gap-1 transition-colors"
          >
            <X className="w-3.5 h-3.5" /> Clear all
          </button>
        )}
      </div>

      {/* ── 1. CATEGORY DROPDOWN ── */}
      <div className="relative" ref={categoryRef}>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Category
          </label>
          {filters.categoryId && (
            <button
              onClick={() => notifyChange({ ...filters, categoryId: '' })}
              className="text-[11px] text-slate-400 hover:text-rose-500 transition-colors"
            >
              Reset
            </button>
          )}
        </div>

        {/* Dropdown Trigger Button */}
        <button
          type="button"
          onClick={() => setCategoryDropdownOpen((prev) => !prev)}
          className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl border text-sm font-medium transition-all ${
            categoryDropdownOpen
              ? 'border-emerald-500 ring-2 ring-emerald-100 bg-white'
              : selectedCategoryObj
              ? 'border-emerald-300 bg-emerald-50/50 text-emerald-900'
              : 'border-slate-200 bg-slate-50 hover:bg-slate-100/80 text-slate-700'
          }`}
        >
          <span className="truncate">
            {selectedCategoryObj ? selectedCategoryObj.name : 'All Categories'}
          </span>
          <ChevronDown
            className={`w-4 h-4 text-slate-400 transition-transform duration-200 flex-shrink-0 ${
              categoryDropdownOpen ? 'rotate-180 text-emerald-600' : ''
            }`}
          />
        </button>

        {/* Dropdown Menu Popover */}
        {categoryDropdownOpen && (
          <div className="absolute left-0 right-0 z-30 mt-2 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
            {/* Search within Category */}
            <div className="p-2.5 border-b border-slate-100 bg-slate-50/50">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  placeholder="Search categories..."
                  value={categorySearch}
                  onChange={(e) => setCategorySearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* Options List */}
            <div className="max-h-56 overflow-y-auto p-1.5 space-y-0.5">
              <button
                type="button"
                onClick={() => {
                  notifyChange({ ...filters, categoryId: '' });
                  setCategoryDropdownOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 text-xs rounded-lg font-medium transition-colors ${
                  !filters.categoryId
                    ? 'bg-emerald-50 text-emerald-700 font-bold'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span>All Categories</span>
                {!filters.categoryId && <Check className="w-3.5 h-3.5 text-emerald-600" />}
              </button>

              {filteredCategories.map((cat) => {
                const isSelected = String(filters.categoryId) === String(cat.id);
                const IconComponent = categoryIcons[cat.slug] || categoryIcons[cat.name?.toLowerCase()] || Tag;

                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => {
                      notifyChange({ ...filters, categoryId: String(cat.id) });
                      setCategoryDropdownOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 text-xs rounded-lg font-medium transition-colors ${
                      isSelected
                        ? 'bg-emerald-50 text-emerald-700 font-bold'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <IconComponent className={`w-3.5 h-3.5 ${isSelected ? 'text-emerald-600' : 'text-slate-400'}`} />
                      <span className="truncate">{cat.name}</span>
                    </div>
                    {isSelected && <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />}
                  </button>
                );
              })}

              {filteredCategories.length === 0 && (
                <div className="py-4 text-center text-xs text-slate-400">
                  No matching categories
                </div>
              )}
            </div>
          </div>
        )}

        {/* Quick Category Chips for Frequent Browsing */}
        <div className="flex flex-wrap gap-1.5 mt-2.5">
          {categories
            .filter((c) => ['smartphones', 'laptops', 'electronics', 'fashion', 'home-living'].includes(c.slug))
            .slice(0, 5)
            .map((cat) => {
              const isSelected = String(filters.categoryId) === String(cat.id);
              return (
                <button
                  key={cat.id}
                  onClick={() => notifyChange({ ...filters, categoryId: isSelected ? '' : String(cat.id) })}
                  className={`text-[11px] px-2.5 py-1 rounded-lg font-medium transition-colors ${
                    isSelected
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80 hover:text-slate-900'
                  }`}
                >
                  {cat.name.replace('& Living', '').replace('& Apparel', '').trim()}
                </button>
              );
            })}
        </div>
      </div>

      {/* ── 2. BRAND DROPDOWN ── */}
      <div className="relative pt-4 border-t border-slate-100" ref={brandRef}>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Brand
          </label>
          {selectedBrand && (
            <button
              onClick={() => notifyChange({ ...filters, brand: '' })}
              className="text-[11px] text-slate-400 hover:text-rose-500 transition-colors"
            >
              Reset
            </button>
          )}
        </div>

        {/* Dropdown Trigger Button */}
        <button
          type="button"
          onClick={() => setBrandDropdownOpen((prev) => !prev)}
          className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl border text-sm font-medium transition-all ${
            brandDropdownOpen
              ? 'border-emerald-500 ring-2 ring-emerald-100 bg-white'
              : selectedBrand
              ? 'border-emerald-300 bg-emerald-50/50 text-emerald-900'
              : 'border-slate-200 bg-slate-50 hover:bg-slate-100/80 text-slate-700'
          }`}
        >
          <span className="truncate">
            {selectedBrand ? selectedBrand : 'All Brands (80+ available)'}
          </span>
          <ChevronDown
            className={`w-4 h-4 text-slate-400 transition-transform duration-200 flex-shrink-0 ${
              brandDropdownOpen ? 'rotate-180 text-emerald-600' : ''
            }`}
          />
        </button>

        {/* Dropdown Menu Popover */}
        {brandDropdownOpen && (
          <div className="absolute left-0 right-0 z-30 mt-2 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
            {/* Search within Brands */}
            <div className="p-2.5 border-b border-slate-100 bg-slate-50/50">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  placeholder="Search brand (e.g. Apple, Dell, Nike)..."
                  value={brandSearch}
                  onChange={(e) => setBrandSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* Popular Brand Pills Row inside Dropdown */}
            <div className="px-3 py-2 bg-slate-50/30 border-b border-slate-100">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Popular Brands
              </p>
              <div className="flex flex-wrap gap-1">
                {popularBrands.map((pb) => {
                  const isSelected = filters.brand === pb;
                  return (
                    <button
                      key={pb}
                      type="button"
                      onClick={() => {
                        notifyChange({ ...filters, brand: isSelected ? '' : pb });
                        setBrandDropdownOpen(false);
                      }}
                      className={`text-[10px] px-2 py-0.5 rounded font-medium transition-colors ${
                        isSelected
                          ? 'bg-emerald-600 text-white'
                          : 'bg-white border border-slate-200 text-slate-700 hover:border-emerald-400'
                      }`}
                    >
                      {pb}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* All Brands Scrollable List */}
            <div className="max-h-52 overflow-y-auto p-1.5 space-y-0.5">
              <button
                type="button"
                onClick={() => {
                  notifyChange({ ...filters, brand: '' });
                  setBrandDropdownOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-1.5 text-xs rounded-lg font-medium transition-colors ${
                  !filters.brand
                    ? 'bg-emerald-50 text-emerald-700 font-bold'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span>All Brands</span>
                {!filters.brand && <Check className="w-3.5 h-3.5 text-emerald-600" />}
              </button>

              {filteredBrands.map((b) => {
                const isSelected = filters.brand === b;
                return (
                  <button
                    key={b}
                    type="button"
                    onClick={() => {
                      notifyChange({ ...filters, brand: b });
                      setBrandDropdownOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-1.5 text-xs rounded-lg font-medium transition-colors ${
                      isSelected
                        ? 'bg-emerald-50 text-emerald-700 font-bold'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span>{b}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />}
                  </button>
                );
              })}

              {filteredBrands.length === 0 && (
                <div className="py-4 text-center text-xs text-slate-400">
                  No matching brand
                </div>
              )}
            </div>
          </div>
        )}

        {/* Quick Brand Badges Underneath */}
        <div className="flex flex-wrap gap-1.5 mt-2.5">
          {['Apple', 'HP', 'Dell', 'Asus', 'Nike', 'Sony'].map((b) => {
            const isSelected = filters.brand === b;
            return (
              <button
                key={b}
                onClick={() => notifyChange({ ...filters, brand: isSelected ? '' : b })}
                className={`text-[11px] px-2.5 py-1 rounded-lg font-medium transition-colors ${
                  isSelected
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80 hover:text-slate-900'
                }`}
              >
                {b}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── 3. PRICE RANGE SECTION ── */}
      <div className="pt-4 border-t border-slate-100">
        <button
          type="button"
          onClick={() => toggleSection('price')}
          className="flex items-center justify-between w-full text-xs font-bold uppercase tracking-wider text-slate-500 mb-3"
        >
          <span>Price Range (INR)</span>
          {openSections.price ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>

        {openSections.price && (
          <div className="space-y-3.5">
            <div className="flex justify-between items-center text-xs font-bold text-slate-900">
              <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-700">
                {formatCurrency(filters.minPrice || 0)}
              </span>
              <span className="text-slate-400">—</span>
              <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-700">
                {formatCurrency(filters.maxPrice || 350000)}
              </span>
            </div>

            <input
              type="range"
              min="0"
              max="350000"
              step="1000"
              value={filters.maxPrice || 350000}
              onChange={(e) => notifyChange({ ...filters, maxPrice: e.target.value })}
              className="w-full accent-emerald-600 cursor-pointer h-1.5 bg-slate-200 rounded-lg"
            />

            {/* Quick Price Buttons */}
            <div className="grid grid-cols-2 gap-1.5">
              {[
                { label: 'Under ₹2,000', max: 2000 },
                { label: 'Under ₹20,000', max: 20000 },
                { label: 'Under ₹50,000', max: 50000 },
                { label: 'Under ₹1,50,000', max: 150000 },
              ].map((tier) => (
                <button
                  key={tier.label}
                  type="button"
                  onClick={() => notifyChange({ ...filters, maxPrice: tier.max })}
                  className={`text-[10px] py-1 px-2 rounded-lg border text-center transition-colors ${
                    Number(filters.maxPrice) === tier.max
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-800 font-bold'
                      : 'border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  {tier.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── 4. MINIMUM RATING SECTION ── */}
      <div className="pt-4 border-t border-slate-100">
        <button
          type="button"
          onClick={() => toggleSection('rating')}
          className="flex items-center justify-between w-full text-xs font-bold uppercase tracking-wider text-slate-500 mb-3"
        >
          <span>Customer Rating</span>
          {openSections.rating ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>

        {openSections.rating && (
          <div className="space-y-1.5">
            {[4, 3, 2].map((r) => {
              const isSelected = String(filters.minRating) === String(r);
              return (
                <label
                  key={r}
                  className={`flex items-center justify-between p-2 rounded-xl cursor-pointer transition-colors ${
                    isSelected ? 'bg-amber-50/60 border border-amber-200' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="rating"
                      checked={isSelected}
                      onChange={() => notifyChange({ ...filters, minRating: isSelected ? '' : String(r) })}
                      className="accent-emerald-600"
                    />
                    <div className="flex items-center gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3.5 h-3.5 ${
                            i < r ? 'text-amber-400 fill-amber-400' : 'text-slate-200'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <span className="text-xs text-slate-500 font-medium">& above</span>
                </label>
              );
            })}
            {filters.minRating && (
              <button
                onClick={() => notifyChange({ ...filters, minRating: '' })}
                className="text-[11px] text-slate-400 hover:text-rose-500 mt-1"
              >
                Clear rating filter
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
