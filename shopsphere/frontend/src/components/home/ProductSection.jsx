import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import ProductCard from '../product/ProductCard';
import LoadingSpinner from '../common/LoadingSpinner';

const ProductSection = ({ title, subtitle, products = [], loading = false, viewAllLink = '/products' }) => {
  if (loading) {
    return (
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10">
            <div className="h-8 bg-gray-200 rounded w-48 animate-pulse mb-2" />
            <div className="h-4 bg-gray-100 rounded w-72 animate-pulse" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden border border-gray-100">
                <div className="h-56 bg-gray-200 animate-pulse" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-gray-200 rounded animate-pulse" />
                  <div className="h-4 bg-gray-100 rounded w-2/3 animate-pulse" />
                  <div className="h-6 bg-gray-200 rounded w-1/2 animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!products.length) return null;

  return (
    <section className="py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-10">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">{title}</h2>
            {subtitle && <p className="text-gray-500 mt-2">{subtitle}</p>}
          </div>
          <Link
            to={viewAllLink}
            className="hidden sm:inline-flex items-center gap-1 text-emerald-600 font-medium hover:text-emerald-700 transition-colors group"
          >
            View all
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.slice(0, 8).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        <div className="mt-8 text-center sm:hidden">
          <Link
            to={viewAllLink}
            className="inline-flex items-center gap-1 text-emerald-600 font-medium hover:text-emerald-700"
          >
            View all <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default ProductSection;
