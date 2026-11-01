import React from 'react';
import { Link } from 'react-router-dom';
import { SlidersHorizontal } from 'lucide-react';

const sortOptions = [
  { label: 'Relevance', value: '' },
  { label: 'Price: Low to High', value: 'price,asc' },
  { label: 'Price: High to Low', value: 'price,desc' },
  { label: 'Newest First', value: 'createdAt,desc' },
  { label: 'Top Rated', value: 'averageRating,desc' },
  { label: 'Most Popular', value: 'reviewCount,desc' },
];

const ProductSort = ({ sort, onSortChange, totalElements = 0, showFilterToggle = false, onFilterToggle }) => {
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="text-sm text-gray-500">
        {totalElements > 0 ? (
          <span>
            Showing <span className="font-medium text-gray-900">{totalElements}</span> products
          </span>
        ) : (
          <span>No products found</span>
        )}
      </div>

      <div className="flex items-center gap-3">
        {showFilterToggle && (
          <button
            onClick={onFilterToggle}
            className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors lg:hidden"
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters
          </button>
        )}

        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600 hidden sm:block">Sort:</label>
          <select
            value={sort}
            onChange={(e) => onSortChange(e.target.value)}
            className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          >
            {sortOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default ProductSort;
