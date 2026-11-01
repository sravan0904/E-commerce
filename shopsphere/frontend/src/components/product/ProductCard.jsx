import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Star } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { formatCurrency, getDiscountPercent, getPrimaryImage, getEffectivePrice } from '../../utils/helpers';

// Aesthetic LuxeMira-style color palette swatches based on product brand or category
const getSwatches = (brand = '', category = '') => {
  const b = brand.toLowerCase();
  const c = category.toLowerCase();
  if (b.includes('apple') || b.includes('dell')) return ['#475569', '#0f172a', '#e2e8f0'];
  if (b.includes('samsung') || b.includes('asus')) return ['#1e293b', '#0284c7', '#f1f5f9'];
  if (c.includes('fashion') || c.includes('clothing') || c.includes('jacket') || c.includes('shacket')) return ['#78716c', '#1c1917', '#d6d3d1'];
  if (b.includes('redmi') || b.includes('poco')) return ['#f97316', '#0f172a', '#3b82f6'];
  return ['#334155', '#94a3b8', '#059669'];
};

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { isAuthenticated } = useAuth();
  const { showToast, toast } = useToast();
  const [cartLoading, setCartLoading] = React.useState(false);
  const [activeColorIdx, setActiveColorIdx] = React.useState(0);

  const inWishlist = isInWishlist(product.id);
  const primaryImg = getPrimaryImage(product);
  const effectivePrice = getEffectivePrice(product);
  const discountPct = getDiscountPercent(product.price, product.discountPrice);
  const categoryLabel = (product.categoryName || product.category?.name || product.brand || 'COLLECTION').toUpperCase();
  const swatches = getSwatches(product.brand, product.categoryName);

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (product.stockQuantity <= 0) {
      (toast?.error || showToast)('Product is out of stock', 'error');
      return;
    }
    setCartLoading(true);
    try {
      await addToCart(product.id, 1, product);
      (toast?.success || showToast)(`${product.name} added to cart! 🛒`, 'success');
    } catch (err) {
      (toast?.error || showToast)(err?.response?.data?.message || 'Failed to add to cart', 'error');
    } finally {
      setCartLoading(false);
    }
  };

  const handleWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      (toast?.info || showToast)('Please sign in to save to wishlist', 'info');
      return;
    }
    try {
      if (inWishlist) {
        await removeFromWishlist(product.id);
        (toast?.success || showToast)('Removed from wishlist', 'success');
      } else {
        await addToWishlist(product.id);
        (toast?.success || showToast)('Added to wishlist!', 'success');
      }
    } catch (err) {
      (toast?.error || showToast)(err?.response?.data?.message || 'Failed to update wishlist', 'error');
    }
  };

  return (
    <Link to={`/products/${product.id}`} className="group block text-left">
      <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden hover:shadow-xl hover:border-slate-300 transition-all duration-300 flex flex-col h-full">
        {/* Product Media Box (LuxeMira style aspect & clean neutral background) */}
        <div className="relative bg-slate-50/70 aspect-[4/4.5] overflow-hidden">
          <img
            src={primaryImg}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
            loading="lazy"
            onError={(e) => {
              e.target.src = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80';
            }}
          />

          {/* Badges: Lime-green "New" badge or Discount */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
            {product.featured && (
              <span className="bg-[#84cc16] text-white text-[11px] font-bold px-2.5 py-0.5 rounded-md shadow-sm uppercase tracking-wide">
                New
              </span>
            )}
            {discountPct > 0 && (
              <span className="bg-rose-500 text-white text-[11px] font-bold px-2 py-0.5 rounded-md shadow-sm">
                {discountPct}% OFF
              </span>
            )}
            {product.stockQuantity <= 0 && (
              <span className="bg-slate-900 text-white text-[11px] font-semibold px-2 py-0.5 rounded-md shadow-sm">
                Sold Out
              </span>
            )}
          </div>

          {/* Wishlist Button */}
          <button
            onClick={handleWishlist}
            aria-label="Wishlist"
            className={`absolute top-3 right-3 p-2 rounded-full transition-all duration-200 z-10 shadow-sm ${
              inWishlist
                ? 'bg-rose-500 text-white opacity-100 scale-100'
                : 'bg-white/90 text-slate-400 hover:text-rose-500 hover:bg-white opacity-0 group-hover:opacity-100'
            }`}
          >
            <Heart className={`w-4 h-4 ${inWishlist ? 'fill-current' : ''}`} />
          </button>

          {/* Quick Hover Add Action Bar */}
          <div className="absolute bottom-3 left-3 right-3 translate-y-3 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 z-10 flex gap-2">
            <button
              onClick={handleAddToCart}
              disabled={cartLoading || product.stockQuantity <= 0}
              className="flex-1 bg-slate-900 hover:bg-emerald-600 text-white text-xs font-bold py-2.5 px-3 rounded-xl transition-colors shadow-md flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              {cartLoading ? (
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <ShoppingCart className="w-3.5 h-3.5" />
                  <span>Add to Cart</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Product Details (LuxeMira clean aesthetic) */}
        <div className="p-4 flex flex-col flex-1 justify-between bg-white">
          <div>
            {/* Category Subtitle */}
            <p className="text-[11px] font-bold tracking-wider text-slate-400 uppercase mb-1 truncate">
              {categoryLabel}
            </p>

            {/* Product Title */}
            <h3 className="text-sm font-semibold text-slate-800 leading-snug line-clamp-2 group-hover:text-emerald-700 transition-colors">
              {product.name}
            </h3>

            {/* Rating */}
            <div className="flex items-center gap-1.5 mt-1.5">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-3 h-3 ${
                      i < Math.floor(product.rating || 4.5)
                        ? 'text-amber-400 fill-amber-400'
                        : 'text-slate-200 fill-slate-200'
                    }`}
                  />
                ))}
              </div>
              <span className="text-[11px] text-slate-400 font-medium">
                ({product.reviewCount || 120})
              </span>
            </div>
          </div>

          <div className="mt-3 pt-2.5 border-t border-slate-100">
            {/* Price */}
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-base font-bold text-slate-900">
                {formatCurrency(effectivePrice)}
              </span>
              {product.discountPrice && product.price > product.discountPrice && (
                <span className="text-xs text-slate-400 line-through">
                  {formatCurrency(product.price)}
                </span>
              )}
            </div>

            {/* Color Swatch Dots (LuxeMira signature style) */}
            <div className="flex items-center gap-1.5">
              {swatches.map((color, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setActiveColorIdx(idx);
                  }}
                  className={`w-3.5 h-3.5 rounded-full transition-transform border ${
                    activeColorIdx === idx
                      ? 'ring-2 ring-emerald-500 ring-offset-1 scale-110 border-white'
                      : 'border-slate-300 hover:scale-105'
                  }`}
                  style={{ backgroundColor: color }}
                  title={`Color variant ${idx + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

// Skeleton loader
export function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
      <div className="skeleton aspect-[4/4.5]" />
      <div className="p-4 space-y-2">
        <div className="skeleton h-3 w-16 rounded" />
        <div className="skeleton h-4 w-full rounded" />
        <div className="skeleton h-4 w-3/4 rounded" />
        <div className="skeleton h-5 w-20 rounded mt-3" />
      </div>
    </div>
  );
}
