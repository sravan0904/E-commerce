import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import ProductGrid from '../../components/product/ProductGrid';
import ProductFilters from '../../components/product/ProductFilters';
import ProductSort from '../../components/product/ProductSort';
import Pagination from '../../components/common/Pagination';
import ProductScraperModal from '../../components/product/ProductScraperModal';
import { productAPI, categoryAPI } from '../../api/index';
import {
  SlidersHorizontal, X, Globe, Sparkles, ChevronRight, Home,
  RotateCcw, Tag
} from 'lucide-react';
import { formatCurrency } from '../../utils/helpers';

const ProductList = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [scraperOpen, setScraperOpen] = useState(false);

  // Filters state
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    categoryId: searchParams.get('categoryId') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    minRating: searchParams.get('minRating') || '',
    brand: searchParams.get('brand') || '',
    sort: searchParams.get('sort') || '',
    featured: searchParams.get('featured') || '',
  });

  useEffect(() => {
    setFilters((prev) => ({
      ...prev,
      search: searchParams.get('search') || '',
      categoryId: searchParams.get('categoryId') || '',
      brand: searchParams.get('brand') || '',
      featured: searchParams.get('featured') || '',
    }));
    setPage(0);
  }, [searchParams]);

  useEffect(() => {
    categoryAPI.getAll().then((r) => {
      const data = r.data?.data?.content || r.data?.data || r.data?.content || r.data || [];
      setCategories(Array.isArray(data) ? data : []);
    }).catch(() => {});
  }, []);

  const fetchProducts = useCallback(() => {
    setLoading(true);
    const params = { page, size: 12 };
    if (filters.search) params.search = filters.search;
    if (filters.categoryId) params.categoryId = filters.categoryId;
    if (filters.minPrice) params.minPrice = filters.minPrice;
    if (filters.maxPrice) params.maxPrice = filters.maxPrice;
    if (filters.minRating) params.minRating = filters.minRating;
    if (filters.brand) params.brand = filters.brand;
    if (filters.sort) params.sort = filters.sort;
    if (filters.featured) params.featured = filters.featured;

    productAPI.getAll(params)
      .then((r) => {
        const data = r.data?.data || r.data || {};
        const items = data.content || (Array.isArray(data) ? data : []);
        setProducts(items);
        setTotalPages(data.totalPages || 1);
        setTotalElements(data.totalElements ?? items.length);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [filters, page]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const handleFilterChange = (newFilters) => {
    setFilters((p) => ({ ...p, ...newFilters }));
    setPage(0);
  };

  const handleSortChange = (sort) => {
    setFilters((p) => ({ ...p, sort }));
    setPage(0);
  };

  const handleClearFilters = () => {
    setFilters({
      search: '', categoryId: '', minPrice: '', maxPrice: '',
      minRating: '', brand: '', sort: '', featured: ''
    });
    setPage(0);
    setSearchParams({});
  };

  const selectedCategoryObj = categories.find((c) => String(c.id) === String(filters.categoryId));

  const hasActiveFilters = Boolean(
    filters.categoryId || filters.brand || filters.minPrice ||
    (filters.maxPrice && Number(filters.maxPrice) < 350000) || filters.minRating || filters.search
  );

  return (
    <div className="min-h-screen bg-slate-50/60">
      {/* ── Breadcrumb Header (LuxeMira Style) ── */}
      <div className="bg-white border-b border-slate-100 py-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-2 text-xs font-medium text-slate-500">
            <Link to="/" className="hover:text-emerald-600 transition-colors flex items-center gap-1">
              <Home className="w-3.5 h-3.5" />
              <span>Home</span>
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
            <Link to="/products" className={`hover:text-emerald-600 transition-colors ${!selectedCategoryObj ? 'text-slate-900 font-bold' : ''}`}>
              All Products
            </Link>
            {selectedCategoryObj && (
              <>
                <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
                <span className="text-slate-900 font-bold">{selectedCategoryObj.name}</span>
              </>
            )}
            {filters.brand && (
              <>
                <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
                <span className="text-emerald-600 font-bold">{filters.brand}</span>
              </>
            )}
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ── Page Title & Global Sync Action ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {filters.search
                ? `Results for "${filters.search}"`
                : selectedCategoryObj
                ? selectedCategoryObj.name
                : filters.brand
                ? `${filters.brand} Store`
                : 'All Products & Collections'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Browse top branded smartphones, laptops, electronics & luxury fashion
            </p>
          </div>

          <button
            onClick={() => setScraperOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-bold rounded-xl text-xs sm:text-sm shadow-md shadow-emerald-500/20 hover:shadow-emerald-500/30 transition-all self-start sm:self-auto"
          >
            <Sparkles className="w-4 h-4" />
            <span>Import & Sync Online Items</span>
          </button>
        </div>

        <ProductScraperModal
          isOpen={scraperOpen}
          onClose={() => setScraperOpen(false)}
          onImportSuccess={fetchProducts}
        />

        {/* ── Main Layout: Sidebar Filters + Products Grid ── */}
        <div className="flex flex-col lg:flex-row gap-8">

          {/* Desktop Filter Sidebar */}
          <aside className="hidden lg:block w-72 flex-shrink-0">
            <div className="sticky top-24">
              <ProductFilters
                filters={filters}
                categories={categories}
                onFilterChange={handleFilterChange}
                onReset={handleClearFilters}
              />
            </div>
          </aside>

          {/* Mobile Filter Drawer */}
          {showFilters && (
            <div className="fixed inset-0 z-50 lg:hidden">
              <div
                className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
                onClick={() => setShowFilters(false)}
              />
              <div className="absolute left-0 top-0 bottom-0 w-80 bg-white overflow-y-auto shadow-2xl p-5 z-10">
                <div className="flex items-center justify-between mb-5 pb-3 border-b border-slate-100">
                  <h2 className="font-bold text-slate-900 text-base">Filter Products</h2>
                  <button
                    onClick={() => setShowFilters(false)}
                    className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <ProductFilters
                  filters={filters}
                  categories={categories}
                  onFilterChange={(f) => { handleFilterChange(f); setShowFilters(false); }}
                  onReset={() => { handleClearFilters(); setShowFilters(false); }}
                />
              </div>
            </div>
          )}

          {/* Products Column */}
          <main className="flex-1 min-w-0">

            {/* ── LuxeMira Style Applied Filter Chips Bar ── */}
            {hasActiveFilters && (
              <div className="bg-white rounded-2xl border border-slate-200/80 p-3.5 mb-6 flex flex-wrap items-center gap-2 shadow-sm animate-in fade-in duration-200">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mr-1 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-emerald-600" />
                  Applied:
                </span>

                {selectedCategoryObj && (
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1 rounded-full">
                    {selectedCategoryObj.name}
                    <button
                      onClick={() => handleFilterChange({ categoryId: '' })}
                      className="hover:text-emerald-900"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}

                {filters.brand && (
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1 rounded-full">
                    Brand: {filters.brand}
                    <button
                      onClick={() => handleFilterChange({ brand: '' })}
                      className="hover:text-blue-900"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}

                {filters.maxPrice && Number(filters.maxPrice) < 350000 && (
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200 px-3 py-1 rounded-full">
                    Under {formatCurrency(filters.maxPrice)}
                    <button
                      onClick={() => handleFilterChange({ maxPrice: '' })}
                      className="hover:text-purple-900"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}

                {filters.minRating && (
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 px-3 py-1 rounded-full">
                    {filters.minRating}★ & Above
                    <button
                      onClick={() => handleFilterChange({ minRating: '' })}
                      className="hover:text-amber-900"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}

                {filters.search && (
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold bg-slate-100 text-slate-700 px-3 py-1 rounded-full">
                    Search: "{filters.search}"
                    <button
                      onClick={() => handleFilterChange({ search: '' })}
                      className="hover:text-slate-900"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}

                <button
                  onClick={handleClearFilters}
                  className="text-xs font-bold text-rose-500 hover:text-rose-700 ml-auto flex items-center gap-1 transition-colors px-2 py-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  Clear All
                </button>
              </div>
            )}

            {/* Sort & Count Header */}
            <ProductSort
              sort={filters.sort}
              onSortChange={handleSortChange}
              totalElements={totalElements}
              showFilterToggle
              onFilterToggle={() => setShowFilters(true)}
            />

            {/* Product Grid */}
            <ProductGrid products={products} loading={loading} />

            {/* Pagination */}
            <div className="mt-8">
              <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default ProductList;
