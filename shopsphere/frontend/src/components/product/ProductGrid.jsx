import React from 'react';
import ProductCard from './ProductCard';
import EmptyState from '../common/EmptyState';
import { Package } from 'lucide-react';

const ProductGrid = ({ products = [], loading = false, skeletonCount = 8 }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <div key={i} className="bg-white rounded-2xl overflow-hidden border border-gray-100 animate-pulse">
            <div className="h-52 bg-gray-200" />
            <div className="p-4 space-y-3">
              <div className="h-3 bg-gray-200 rounded w-1/3" />
              <div className="h-4 bg-gray-200 rounded" />
              <div className="h-4 bg-gray-100 rounded w-3/4" />
              <div className="flex gap-2">
                <div className="h-6 bg-gray-200 rounded w-1/3" />
                <div className="h-6 bg-gray-100 rounded w-1/4" />
              </div>
              <div className="h-9 bg-gray-200 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!products.length) {
    return (
      <EmptyState
        icon={Package}
        title="No products found"
        description="Try adjusting your filters or search terms to find what you're looking for."
      />
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
};

export default ProductGrid;
