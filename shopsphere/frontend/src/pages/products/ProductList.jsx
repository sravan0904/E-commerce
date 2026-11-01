import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductGrid from '../../components/product/ProductGrid';
import ProductFilters from '../../components/product/ProductFilters';
import ProductSort from '../../components/product/ProductSort';
import Pagination from '../../components/common/Pagination';
import ProductScraperModal from '../../components/product/ProductScraperModal';
import { productAPI, categoryAPI } from '../../api/index';
import { SlidersHorizontal, X, Globe, Sparkles } from 'lucide-react';

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
    setFilters({ search: '', categoryId: '', minPrice: '', maxPrice: '', minRating: '', brand: '', sort: '', featured: '' });
    setPage(0);
    setSearchParams({});
  };

  const activeFilterCount = [filters.categoryId, filters.minPrice, filters.maxPrice, filters.minRating, filters.brand].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {filters.search ? `Results for "${filters.search}"` : 'All Products'}
            </h1>
            <p className="text-xs text-gray-500 mt-1">
              Browse top electronics, fashion, home essentials & trending picks
            </p>
          </div>
          <button
            onClick={() => setScraperOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-medium rounded-xl text-sm shadow-sm hover:shadow transition-all"
          >
            <Globe className="w-4 h-4" />
            <span>Scrape & Import Online Items</span>
          </button>
        </div>

        <ProductScraperModal
          isOpen={scraperOpen}
          onClose={() => setScraperOpen(false)}
          onImportSuccess={fetchProducts}
        />

        <div className="flex gap-8">
          {/* Sidebar Filters (desktop) */}
          <div className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-24">
              <ProductFilters
                filters={filters}
                categories={categories}
                onFilterChange={handleFilterChange}
                onReset={handleClearFilters}
              />
            </div>
          </div>

          {/* Mobile Filter Drawer */}
          {showFilters && (
            <div className="fixed inset-0 z-40 lg:hidden">
              <div className="absolute inset-0 bg-black/50" onClick={() => setShowFilters(false)} />
              <div className="absolute left-0 top-0 bottom-0 w-80 bg-white overflow-y-auto shadow-xl p-5">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="font-semibold text-gray-900">Filters</h2>
                  <button onClick={() => setShowFilters(false)}><X className="w-5 h-5" /></button>
                </div>
                <ProductFilters filters={filters} categories={categories} onFilterChange={(f) => { handleFilterChange(f); setShowFilters(false); }} />
              </div>
            </div>
          )}

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            <ProductSort
              sort={filters.sort}
              onSortChange={handleSortChange}
              totalElements={totalElements}
              showFilterToggle
              onFilterToggle={() => setShowFilters(true)}
            />
            <ProductGrid products={products} loading={loading} />
            <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductList;
