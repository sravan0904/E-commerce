import React from 'react'
import { Link } from 'react-router-dom'
import { Heart, ShoppingCart, Star } from 'lucide-react'
import { useCart } from '../../context/CartContext'
import { useWishlist } from '../../context/WishlistContext'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { formatCurrency, getDiscountPercent, getPrimaryImage, getEffectivePrice } from '../../utils/helpers'

export default function ProductCard({ product }) {
  const { addToCart } = useCart()
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist()
  const { isAuthenticated } = useAuth()
  const { showToast, toast } = useToast()
  const [cartLoading, setCartLoading] = React.useState(false)

  const inWishlist = isInWishlist(product.id)
  const primaryImg = getPrimaryImage(product)
  const effectivePrice = getEffectivePrice(product)
  const discountPct = getDiscountPercent(product.price, product.discountPrice)

  const handleAddToCart = async (e) => {
    e.preventDefault()
    if (product.stockQuantity <= 0) {
      (toast?.error || showToast)('Product is out of stock', 'error')
      return
    }
    setCartLoading(true)
    try {
      await addToCart(product.id, 1, product)
      ;(toast?.success || showToast)(`${product.name} added to cart!`, 'success')
    } catch (err) {
      ;(toast?.error || showToast)(err?.response?.data?.message || 'Failed to add to cart', 'error')
    } finally { setCartLoading(false) }
  }

  const handleWishlist = async (e) => {
    e.preventDefault()
    if (!isAuthenticated) {
      ;(toast?.info || showToast)('Please sign in to save to wishlist', 'info')
      return
    }
    try {
      if (inWishlist) {
        await removeFromWishlist(product.id)
        ;(toast?.success || showToast)('Removed from wishlist', 'success')
      } else {
        await addToWishlist(product.id)
        ;(toast?.success || showToast)('Added to wishlist!', 'success')
      }
    } catch (err) {
      ;(toast?.error || showToast)('Failed to update wishlist', 'error')
    }
  }

  return (
    <Link to={`/products/${product.id}`} className="group block">
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl hover:border-gray-200 transition-all duration-300">
        {/* Image */}
        <div className="relative product-image-container bg-gray-50 aspect-square">
          <img
            src={primaryImg}
            alt={product.name}
            className="w-full h-full object-cover"
            loading="lazy"
            onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&q=80' }}
          />

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            {discountPct > 0 && (
              <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-lg">{discountPct}% OFF</span>
            )}
            {product.featured && (
              <span className="bg-emerald-600 text-white text-xs font-bold px-2 py-1 rounded-lg">Featured</span>
            )}
            {product.stockQuantity <= 0 && (
              <span className="bg-gray-800 text-white text-xs font-bold px-2 py-1 rounded-lg">Out of Stock</span>
            )}
          </div>

          {/* Wishlist Button */}
          <button
            onClick={handleWishlist}
            className={`absolute top-3 right-3 p-2 rounded-full transition-all duration-200 opacity-0 group-hover:opacity-100 shadow-sm
              ${inWishlist ? 'bg-red-500 text-white' : 'bg-white text-gray-400 hover:text-red-500'}`}
          >
            <Heart className={`w-4 h-4 ${inWishlist ? 'fill-current' : ''}`} />
          </button>

          {/* Add to Cart overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
            <button
              onClick={handleAddToCart}
              disabled={cartLoading || product.stockQuantity <= 0}
              className="w-full bg-gray-900 text-white font-semibold text-sm py-2.5 rounded-xl hover:bg-emerald-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {cartLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <><ShoppingCart className="w-4 h-4" /> Add to Cart</>
              )}
            </button>
          </div>
        </div>

        {/* Info */}
        <div className="p-4">
          <p className="text-xs text-emerald-600 font-medium mb-1">{product.brand}</p>
          <h3 className="text-sm font-semibold text-gray-900 leading-tight line-clamp-2 mb-2 group-hover:text-emerald-700 transition-colors">
            {product.name}
          </h3>

          {/* Rating */}
          <div className="flex items-center gap-1.5 mb-3">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className={`w-3.5 h-3.5 ${i < Math.floor(product.rating || 0) ? 'text-yellow-400 fill-current' : 'text-gray-200 fill-current'}`} />
              ))}
            </div>
            <span className="text-xs text-gray-500">({product.reviewCount || 0})</span>
          </div>

          {/* Price & Action */}
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-50">
            <div>
              <span className="text-base font-bold text-gray-900">{formatCurrency(effectivePrice)}</span>
              {product.discountPrice && product.price > product.discountPrice && (
                <span className="text-xs text-gray-400 line-through block">{formatCurrency(product.price)}</span>
              )}
            </div>
            <button
              onClick={handleAddToCart}
              disabled={cartLoading || product.stockQuantity <= 0}
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm disabled:opacity-50"
              title="Add to Cart"
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
          </div>
        </div>
      </div>
    </Link>
  )
}

// Skeleton loader
export function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      <div className="skeleton aspect-square" />
      <div className="p-4 space-y-2">
        <div className="skeleton h-3 w-16 rounded" />
        <div className="skeleton h-4 w-full rounded" />
        <div className="skeleton h-4 w-3/4 rounded" />
        <div className="skeleton h-5 w-20 rounded mt-3" />
      </div>
    </div>
  )
}
