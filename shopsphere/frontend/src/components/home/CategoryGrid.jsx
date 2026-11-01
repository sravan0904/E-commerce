import React from 'react';
import { Link } from 'react-router-dom';
import { Laptop, Shirt, Home, Dumbbell, BookOpen, Camera, Headphones, Watch } from 'lucide-react';
import LoadingSpinner from '../common/LoadingSpinner';

const iconMap = {
  electronics: Laptop,
  fashion: Shirt,
  home: Home,
  sports: Dumbbell,
  books: BookOpen,
  cameras: Camera,
  audio: Headphones,
  watches: Watch,
};

const colors = [
  'from-blue-500 to-blue-600',
  'from-purple-500 to-purple-600',
  'from-emerald-500 to-emerald-600',
  'from-orange-500 to-orange-600',
  'from-pink-500 to-pink-600',
  'from-amber-500 to-amber-600',
  'from-teal-500 to-teal-600',
  'from-red-500 to-red-600',
];

const CategoryGrid = ({ categories = [], loading = false }) => {
  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!categories.length) return null;

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900">Shop by Category</h2>
          <p className="text-gray-500 mt-2">Browse our wide range of product categories</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4">
          {categories.slice(0, 8).map((cat, i) => {
            const key = cat.name?.toLowerCase().replace(/\s+/g, '') || '';
            const Icon = iconMap[key] || BookOpen;
            const color = colors[i % colors.length];
            return (
              <Link
                key={cat.id}
                to={`/products?categoryId=${cat.id}`}
                className="group relative overflow-hidden bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 border border-gray-100"
              >
                <div className={`bg-gradient-to-br ${color} p-6 flex items-center justify-center`}>
                  <Icon className="w-10 h-10 text-white" />
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 text-sm group-hover:text-emerald-600 transition-colors">
                    {cat.name}
                  </h3>
                  {cat.description && (
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">{cat.description}</p>
                  )}
                </div>
              </Link>
            );
          })}
        </div>

        <div className="text-center mt-8">
          <Link
            to="/products"
            className="inline-flex items-center gap-2 text-emerald-600 font-medium hover:text-emerald-700 transition-colors"
          >
            View all categories →
          </Link>
        </div>
      </div>
    </section>
  );
};

export default CategoryGrid;
