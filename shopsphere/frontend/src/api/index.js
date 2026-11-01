import api from './axios'

// Auth
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  forgotPassword: (data) => api.post('/auth/forgot-password', data),
  resetPassword: (data) => api.post('/auth/reset-password', data),
  changePassword: (data) => api.post('/auth/change-password', data),
}

// Products
export const productAPI = {
  getAll: (params) => api.get('/products', { params }),
  getById: (id) => api.get(`/products/${id}`),
  getBySlug: (slug) => api.get(`/products/slug/${slug}`),
  getFeatured: () => api.get('/products/featured'),
  getNewArrivals: () => api.get('/products/new-arrivals'),
  getTopRated: () => api.get('/products/top-rated'),
  getRelated: (id) => api.get(`/products/${id}/related`),
  getBrands: () => api.get('/products/brands'),
  getProducts: (params) => api.get('/products', { params }),
  scrapeFeed: (limit = 30) => api.post(`/products/scrape-feed?limit=${limit}`),
  scrapeUrl: (url) => api.post('/products/scrape-url', { url }),
  importAllWorld: () => api.post('/products/import-all-world'),
  create: (data) => api.post('/products', data),
  update: (id, data) => api.put(`/products/${id}`, data),
  delete: (id) => api.delete(`/products/${id}`),
}

// Categories
export const categoryAPI = {
  getAll: () => api.get('/categories'),
  getById: (id) => api.get(`/categories/${id}`),
  create: (data) => api.post('/categories', data),
  update: (id, data) => api.put(`/categories/${id}`, data),
  delete: (id) => api.delete(`/categories/${id}`),
}

// Cart
export const cartAPI = {
  get: () => api.get('/cart'),
  addItem: (data) => api.post('/cart/items', data),
  updateItem: (id, data) => api.put(`/cart/items/${id}`, data),
  removeItem: (id) => api.delete(`/cart/items/${id}`),
  clear: () => api.delete('/cart/clear'),
}

// Wishlist
export const wishlistAPI = {
  get: () => api.get('/wishlist'),
  add: (productId) => api.post(`/wishlist/${productId}`),
  remove: (productId) => api.delete(`/wishlist/${productId}`),
}

// Orders
export const orderAPI = {
  create: (data) => api.post('/orders', data),
  getAll: () => api.get('/orders'),
  getById: (id) => api.get(`/orders/${id}`),
  track: (orderNumber) => api.get(`/orders/track/${orderNumber}`),
  cancel: (id) => api.put(`/orders/${id}/cancel`),
  requestReturn: (data) => api.post('/orders/return', data),
}

// Payments
export const paymentAPI = {
  createOrder: (data) => api.post('/payments/create-order', data),
  verify: (data) => api.post('/payments/verify', data),
}

// Coupons
export const couponAPI = {
  apply: (data) => api.post('/coupons/apply', data),
  getAll: () => api.get('/coupons'),
  create: (data) => api.post('/coupons', data),
  update: (id, data) => api.put(`/coupons/${id}`, data),
  delete: (id) => api.delete(`/coupons/${id}`),
}

// Reviews
export const reviewAPI = {
  getByProduct: (productId) => api.get(`/reviews/product/${productId}`),
  create: (data) => api.post('/reviews', data),
  getAll: (params) => api.get('/reviews', { params }),
  delete: (id) => api.delete(`/reviews/${id}`),
}

// User Profile
export const userAPI = {
  getProfile: () => api.get('/user/profile'),
  updateProfile: (data) => api.put('/user/profile', data),
  getAddresses: () => api.get('/user/addresses'),
  addAddress: (data) => api.post('/user/addresses', data),
  updateAddress: (id, data) => api.put(`/user/addresses/${id}`, data),
  deleteAddress: (id) => api.delete(`/user/addresses/${id}`),
}

// Newsletter
export const newsletterAPI = {
  subscribe: (email) => api.post('/newsletter/subscribe', { email }),
}

// Admin
export const adminAPI = {
  getDashboard: () => api.get('/admin/dashboard'),
  getOrders: (params) => api.get('/admin/orders', { params }),
  updateOrderStatus: (id, data) => api.put(`/admin/orders/${id}/status`, data),
  getCustomers: (params) => api.get('/admin/customers', { params }),
  toggleCustomerStatus: (id) => api.put(`/admin/customers/${id}/toggle-status`),
  getInventoryTransactions: (params) => api.get('/admin/inventory/transactions', { params }),
  updateStock: (productId, data) => api.put(`/admin/inventory/${productId}`, data),
  getReturnRequests: (params) => api.get('/admin/returns', { params }),
  updateReturnRequest: (id, status) => api.put(`/admin/returns/${id}`, { status }),
}
