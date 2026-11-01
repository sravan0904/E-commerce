import React, { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { ShoppingCart, Heart, User, Search, Menu, X, ChevronDown, Package, LogOut, Settings, Shield } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useCart } from '../../context/CartContext'
import { useWishlist } from '../../context/WishlistContext'

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth()
  const { cartCount } = useCart()
  const { wishlistCount } = useWishlist()
  const navigate = useNavigate()
  const location = useLocation()
  const [search, setSearch] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)
  const [userDropdown, setUserDropdown] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const dropdownRef = useRef(null)

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setUserDropdown(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => { setMenuOpen(false) }, [location])

  const handleSearch = (e) => {
    e.preventDefault()
    if (search.trim()) {
      navigate(`/products?search=${encodeURIComponent(search.trim())}`)
      setSearch('')
    }
  }

  const handleLogout = () => {
    logout()
    setUserDropdown(false)
    navigate('/')
  }

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white shadow-md' : 'bg-white/95 backdrop-blur-sm border-b border-gray-100'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 flex-shrink-0">
            <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">S</span>
            </div>
            <span className="text-xl font-bold text-gray-900 tracking-tight">ShopSphere</span>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-600">
            <Link to="/" className={`hover:text-emerald-600 transition-colors ${location.pathname === '/' ? 'text-emerald-600' : ''}`}>Home</Link>
            <Link to="/products" className={`hover:text-emerald-600 transition-colors ${location.pathname === '/products' ? 'text-emerald-600' : ''}`}>Products</Link>
            <Link to="/products?categoryId=1" className="hover:text-emerald-600 transition-colors">Electronics</Link>
            <Link to="/products?categoryId=2" className="hover:text-emerald-600 transition-colors">Fashion</Link>
            <Link to="/products?categoryId=3" className="hover:text-emerald-600 transition-colors">Home</Link>
          </nav>

          {/* Search */}
          <form onSubmit={handleSearch} className="hidden md:flex items-center max-w-xs w-full mx-4">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products..."
                className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-full bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
              />
            </div>
          </form>

          {/* Right Icons */}
          <div className="flex items-center gap-2">
            {/* Wishlist */}
            {user && (
              <Link to="/wishlist" className="relative p-2 text-gray-600 hover:text-emerald-600 transition-colors">
                <Heart className="w-5 h-5" />
                {wishlistCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-bold">
                    {wishlistCount > 9 ? '9+' : wishlistCount}
                  </span>
                )}
              </Link>
            )}

            {/* Cart */}
            <Link to="/cart" className="relative p-2 text-gray-600 hover:text-emerald-600 transition-colors">
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-emerald-600 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-bold">
                  {cartCount > 9 ? '9+' : cartCount}
                </span>
              )}
            </Link>

            {/* User */}
            {user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setUserDropdown(!userDropdown)}
                  className="flex items-center gap-2 p-2 text-gray-600 hover:text-emerald-600 transition-colors"
                >
                  <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                    <span className="text-emerald-700 font-semibold text-xs">
                      {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
                    </span>
                  </div>
                  <ChevronDown className="w-4 h-4 hidden sm:block" />
                </button>
                {userDropdown && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 animate-fade-in">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-semibold text-gray-900">{user.firstName} {user.lastName}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                    <Link to="/profile" onClick={() => setUserDropdown(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                      <User className="w-4 h-4" /> My Profile
                    </Link>
                    <Link to="/orders" onClick={() => setUserDropdown(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                      <Package className="w-4 h-4" /> My Orders
                    </Link>
                    {isAdmin && (
                      <Link to="/admin" onClick={() => setUserDropdown(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-emerald-700 hover:bg-emerald-50 transition-colors">
                        <Shield className="w-4 h-4" /> Admin Panel
                      </Link>
                    )}
                    <hr className="my-1 border-gray-100" />
                    <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors w-full text-left">
                      <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="text-sm font-medium text-gray-600 hover:text-emerald-600 transition-colors px-3 py-2">Sign In</Link>
                <Link to="/register" className="text-sm font-semibold bg-emerald-600 text-white px-4 py-2 rounded-xl hover:bg-emerald-700 transition-colors">Sign Up</Link>
              </div>
            )}

            {/* Mobile Hamburger */}
            <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden p-2 text-gray-600">
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Search */}
        <div className="md:hidden pb-3">
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products..."
              className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-full bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </form>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden pb-4 border-t border-gray-100 pt-4 animate-fade-in">
            <nav className="flex flex-col gap-1">
              {[['/', 'Home'], ['/products', 'All Products'], ['/products?categoryId=1', 'Electronics'], ['/products?categoryId=2', 'Fashion'], ['/products?categoryId=3', 'Home & Living']].map(([path, label]) => (
                <Link key={path} to={path} className="block px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg">{label}</Link>
              ))}
              {!user && <Link to="/login" className="block px-4 py-2.5 text-sm font-medium text-emerald-600">Sign In</Link>}
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
