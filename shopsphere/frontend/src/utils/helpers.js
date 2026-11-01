// Format currency in INR
export const formatCurrency = (amount) => {
  if (amount == null) return '₹0'
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount)
}

// Calculate discount percentage
export const getDiscountPercent = (price, discountPrice) => {
  if (!price || !discountPrice) return 0
  return Math.round(((price - discountPrice) / price) * 100)
}

// Get effective price
export const getEffectivePrice = (product) => {
  return product?.discountPrice || product?.price || 0
}

// Get primary image
export const getPrimaryImage = (product) => {
  if (!product?.images?.length) return 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&q=80'
  const primary = product.images.find(img => img.primary)
  return primary?.imageUrl || product.images[0]?.imageUrl || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&q=80'
}

// Truncate text
export const truncate = (text, length = 100) => {
  if (!text) return ''
  return text.length > length ? text.substring(0, length) + '...' : text
}

// Format date
export const formatDate = (dateStr) => {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

// Order status color
export const getStatusColor = (status) => {
  const map = {
    PLACED: 'bg-blue-100 text-blue-700',
    CONFIRMED: 'bg-indigo-100 text-indigo-700',
    PROCESSING: 'bg-yellow-100 text-yellow-700',
    SHIPPED: 'bg-orange-100 text-orange-700',
    OUT_FOR_DELIVERY: 'bg-purple-100 text-purple-700',
    DELIVERED: 'bg-emerald-100 text-emerald-700',
    CANCELLED: 'bg-red-100 text-red-700',
    RETURN_REQUESTED: 'bg-pink-100 text-pink-700',
    RETURNED: 'bg-gray-100 text-gray-700',
    PENDING: 'bg-yellow-100 text-yellow-700',
    COMPLETED: 'bg-emerald-100 text-emerald-700',
    FAILED: 'bg-red-100 text-red-700',
    REFUNDED: 'bg-blue-100 text-blue-700',
  }
  return map[status] || 'bg-gray-100 text-gray-700'
}

// Stars rendering
export const renderStars = (rating) => {
  const stars = []
  const full = Math.floor(rating || 0)
  const half = (rating || 0) - full > 0.4
  for (let i = 0; i < 5; i++) {
    if (i < full) stars.push('full')
    else if (i === full && half) stars.push('half')
    else stars.push('empty')
  }
  return stars
}

// Slugify
export const slugify = (text) => {
  return text.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-')
}

// Extract error message
export const getErrorMessage = (error) => {
  return error?.response?.data?.message || error?.message || 'Something went wrong'
}
