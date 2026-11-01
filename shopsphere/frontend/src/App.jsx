import React from 'react';
import { Routes, Route, Outlet } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { ToastProvider } from './context/ToastContext';

// Layout
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';

// Route Guards
import { ProtectedRoute, AdminRoute, GuestRoute } from './components/auth/ProtectedRoute';

// Storefront Pages
import Home from './pages/Home';
import ProductList from './pages/products/ProductList';
import ProductDetail from './pages/products/ProductDetail';
import CartPage from './pages/cart/CartPage';
import WishlistPage from './pages/wishlist/WishlistPage';
import CheckoutPage from './pages/checkout/CheckoutPage';
import OrderConfirmation from './pages/checkout/OrderConfirmation';
import OrdersPage from './pages/orders/OrdersPage';
import OrderDetailPage from './pages/orders/OrderDetailPage';
import ProfilePage from './pages/profile/ProfilePage';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';

// Admin Pages
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProducts from './pages/admin/AdminProducts';
import AdminProductForm from './pages/admin/AdminProductForm';
import AdminCategories from './pages/admin/AdminCategories';
import AdminOrders from './pages/admin/AdminOrders';
import AdminCustomers from './pages/admin/AdminCustomers';
import AdminInventory from './pages/admin/AdminInventory';
import AdminCoupons from './pages/admin/AdminCoupons';
import AdminReviews from './pages/admin/AdminReviews';

// Layout wrapper for customer storefront
const StoreLayout = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 pt-16">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

const NotFound = () => (
  <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
    <h1 className="text-6xl font-bold text-gray-900 mb-2">404</h1>
    <p className="text-gray-500 mb-6">Oops! The page you are looking for does not exist.</p>
    <a
      href="/"
      className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl transition-colors"
    >
      Return Home
    </a>
  </div>
);

function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <Routes>
              {/* Customer & Public Storefront */}
              <Route element={<StoreLayout />}>
                <Route path="/" element={<Home />} />
                <Route path="/products" element={<ProductList />} />
                <Route path="/products/:id" element={<ProductDetail />} />
                <Route path="/cart" element={<CartPage />} />

                {/* Protected Customer Routes */}
                <Route
                  path="/wishlist"
                  element={
                    <ProtectedRoute>
                      <WishlistPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/checkout"
                  element={
                    <ProtectedRoute>
                      <CheckoutPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/checkout/confirmation/:orderId"
                  element={
                    <ProtectedRoute>
                      <OrderConfirmation />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/orders"
                  element={
                    <ProtectedRoute>
                      <OrdersPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/orders/:id"
                  element={
                    <ProtectedRoute>
                      <OrderDetailPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <ProfilePage />
                    </ProtectedRoute>
                  }
                />
              </Route>

              {/* Guest Only Auth Routes */}
              <Route
                path="/login"
                element={
                  <GuestRoute>
                    <Login />
                  </GuestRoute>
                }
              />
              <Route
                path="/register"
                element={
                  <GuestRoute>
                    <Register />
                  </GuestRoute>
                }
              />
              <Route
                path="/forgot-password"
                element={
                  <GuestRoute>
                    <ForgotPassword />
                  </GuestRoute>
                }
              />

              {/* Admin Portal */}
              <Route
                path="/admin"
                element={
                  <AdminRoute>
                    <AdminLayout />
                  </AdminRoute>
                }
              >
                <Route index element={<AdminDashboard />} />
                <Route path="products" element={<AdminProducts />} />
                <Route path="products/new" element={<AdminProductForm />} />
                <Route path="products/:id/edit" element={<AdminProductForm />} />
                <Route path="categories" element={<AdminCategories />} />
                <Route path="orders" element={<AdminOrders />} />
                <Route path="customers" element={<AdminCustomers />} />
                <Route path="inventory" element={<AdminInventory />} />
                <Route path="coupons" element={<AdminCoupons />} />
                <Route path="reviews" element={<AdminReviews />} />
              </Route>

              {/* 404 Catch-All */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;
