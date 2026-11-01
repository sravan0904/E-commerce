import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { SlidersHorizontal, ChevronDown, ChevronUp, X } from 'lucide-react'
import { categoryAPI, productAPI } from '../../api'
import { formatCurrency } from '../../utils/helpers'

export default function ProductFilters({ filters = {}, onFilterChange, onChange, onReset, categories: propCategories }) {
  const [categories, setCategories] = useState(propCategories || [])
  const [brands, setBrands] = useState([])
  const [openSections, setOpenSections] = useState({ category: true, price: true, brand: true, rating: true })

  const notifyChange = (newFilters) => {
    if (onFilterChange) onFilterChange(newFilters)
    if (onChange) onChange(newFilters)
  }

  useEffect(() => {
    if (propCategories && propCategories.length > 0) {
      setCategories(propCategories)
    } else {
      categoryAPI.getAll().then(res => {
        const data = res.data?.data?.content || res.data?.data || res.data?.content || res.data || []
        setCategories(Array.isArray(data) ? data : [])
      }).catch(() => {})
    }
    productAPI.getBrands().then(res => {
      const data = res.data?.data || res.data || []
      setBrands(Array.isArray(data) ? data : [])
    }).catch(() => {})
  }, [propCategories])

  const toggle = (section) => setOpenSections(prev => ({ ...prev, [section]: !prev[section] }))

  const Section = ({ title, name, children }) => (
    <div className="border-b border-gray-100 pb-5 mb-5">
      <button onClick={() => toggle(name)} className="flex items-center justify-between w-full text-sm font-semibold text-gray-900 mb-3">
        {title}
        {openSections[name] ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>
      {openSections[name] && children}
    </div>
  )

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2 text-gray-900 font-bold">
          <SlidersHorizontal className="w-4 h-4" />
          Filters
        </div>
        <button onClick={onReset} className="text-xs text-emerald-600 font-medium hover:underline flex items-center gap-1">
          <X className="w-3 h-3" /> Clear all
        </button>
      </div>

      <Section title="Category" name="category">
        <div className="space-y-2">
          {categories.map(cat => (
            <label key={cat.id} className="flex items-center gap-2 cursor-pointer group">
              <input
                type="radio"
                name="category"
                checked={filters.categoryId === String(cat.id)}
                onChange={() => notifyChange({ ...filters, categoryId: String(cat.id) })}
                className="accent-emerald-600"
              />
              <span className="text-sm text-gray-700 group-hover:text-emerald-600 transition-colors">{cat.name}</span>
            </label>
          ))}
          {filters.categoryId && (
            <button onClick={() => notifyChange({ ...filters, categoryId: '' })} className="text-xs text-gray-400 hover:text-red-500 mt-1">Clear</button>
          )}
        </div>
      </Section>

      <Section title="Price Range" name="price">
        <div className="space-y-3">
          <div className="flex justify-between text-xs text-gray-500">
            <span>{formatCurrency(filters.minPrice || 0)}</span>
            <span>{formatCurrency(filters.maxPrice || 100000)}</span>
          </div>
          <input
            type="range"
            min="0"
            max="100000"
            step="500"
            value={filters.maxPrice || 100000}
            onChange={e => notifyChange({ ...filters, maxPrice: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              placeholder="Min ₹"
              value={filters.minPrice || ''}
              onChange={e => notifyChange({ ...filters, minPrice: e.target.value })}
              className="input text-xs py-2"
            />
            <input
              type="number"
              placeholder="Max ₹"
              value={filters.maxPrice || ''}
              onChange={e => notifyChange({ ...filters, maxPrice: e.target.value })}
              className="input text-xs py-2"
            />
          </div>
        </div>
      </Section>

      <Section title="Brand" name="brand">
        <div className="space-y-2 max-h-40 overflow-y-auto">
          {brands.map(brand => (
            <label key={brand} className="flex items-center gap-2 cursor-pointer group">
              <input
                type="radio"
                name="brand"
                checked={filters.brand === brand}
                onChange={() => notifyChange({ ...filters, brand })}
                className="accent-emerald-600"
              />
              <span className="text-sm text-gray-700 group-hover:text-emerald-600">{brand}</span>
            </label>
          ))}
          {filters.brand && (
            <button onClick={() => notifyChange({ ...filters, brand: '' })} className="text-xs text-gray-400 hover:text-red-500">Clear</button>
          )}
        </div>
      </Section>

      <Section title="Minimum Rating" name="rating">
        <div className="space-y-2">
          {[4, 3, 2, 1].map(r => (
            <label key={r} className="flex items-center gap-2 cursor-pointer group">
              <input
                type="radio"
                name="rating"
                checked={filters.minRating === String(r)}
                onChange={() => notifyChange({ ...filters, minRating: String(r) })}
                className="accent-emerald-600"
              />
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className={`text-xs ${i < r ? 'text-yellow-400' : 'text-gray-200'}`}>★</span>
                ))}
                <span className="text-xs text-gray-500">& above</span>
              </div>
            </label>
          ))}
          {filters.minRating && (
            <button onClick={() => notifyChange({ ...filters, minRating: '' })} className="text-xs text-gray-400 hover:text-red-500">Clear</button>
          )}
        </div>
      </Section>
    </div>
  )
}
