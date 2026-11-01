import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  ShoppingCart, Heart, User, Search, Menu, X, ChevronDown, Package,
  LogOut, Settings, Shield, Smartphone, Laptop, Headphones, Shirt,
  Home as HomeIcon, Sparkles, Tag, ArrowRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const { cartCount } = useCart();
  const { wishlistCount } = useWishlist();
  const navigate = useNavigate();
  const location = useLocation();

  const [search, setSearch] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [userDropdown, setUserDropdown] = useState(false);
  const [categoryDropdown, setCategoryDropdown] = useState(false);
  const [brandDropdown, setBrandDropdown] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const dropdownRef = useRef(null);
  const categoryRef = useRef(null);
  const brandRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setUserDropdown(false);
      if (categoryRef.current && !categoryRef.current.contains(e.target)) setCategoryDropdown(false);
      if (brandRef.current && !brandRef.current.contains(e.target)) setBrandDropdown(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    setCategoryDropdown(false);
    setBrandDropdown(false);
  }, [location]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/products?search=${encodeURIComponent(search.trim())}`);
      setSearch('');
    }
  };

  const handleLogout = () => {
    logout();
    setUserDropdown(false);
    navigate('/');
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/95 backdrop-blur-md shadow-md border-b border-slate-200/80'
          : 'bg-white/95 backdrop-blur-sm border-b border-slate-100'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">

          {/* ── Brand Logo ── */}
          <Link
            to="/"
            className="flex items-center gap-2.5 flex-shrink-0 mr-4 sm:mr-8 group outline-none"
          >
            <div className="w-9 h-9 bg-gradient-to-br from-emerald-500 to-teal-700 rounded-xl flex items-center justify-center shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <span className="text-white font-black text-base tracking-tighter">S</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-extrabold text-slate-900 tracking-tight leading-none group-hover:text-emerald-700 transition-colors">
                ShopSphere
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-600 leading-none mt-0.5">
                Global Store
              </span>
            </div>
          </Link>

          {/* ── Desktop Navigation Links ── */}
          <nav className="hidden lg:flex items-center gap-7 text-sm font-semibold text-slate-600">
            {/* Single Home Link */}
            <Link
              to="/"
              className={`hover:text-emerald-600 transition-colors outline-none py-1.5 border-b-2 ${
                location.pathname === '/'
                  ? 'text-emerald-600 border-emerald-600 font-bold'
                  : 'border-transparent text-slate-700 hover:border-emerald-300'
              }`}
            >
              Home
            </Link>

            {/* All Products */}
            <Link
              to="/products"
              className={`hover:text-emerald-600 transition-colors outline-none py-1.5 border-b-2 ${
                location.pathname === '/products' && !location.search
                  ? 'text-emerald-600 border-emerald-600 font-bold'
                  : 'border-transparent text-slate-700 hover:border-emerald-300'
              }`}
            >
              All Products
            </Link>

            {/* Categories Dropdown */}
            <div className="relative" ref={categoryRef}>
              <button
                type="button"
                onClick={() => {
                  setCategoryDropdown((v) => !v);
                  setBrandDropdown(false);
                }}
                className={`flex items-center gap-1.5 py-1.5 transition-colors outline-none ${
                  categoryDropdown ? 'text-emerald-600 font-bold' : 'text-slate-700 hover:text-emerald-600'
                }`}
              >
                <span>Categories</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${
                    categoryDropdown ? 'rotate-180 text-emerald-600' : 'text-slate-400'
                  }`}
                />
              </button>

              {categoryDropdown && (
                <div className="absolute top-full left-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-100 p-2.5 animate-in fade-in slide-in-from-top-2 duration-150 z-50">
                  <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 mb-1">
                    Featured Categories
                  </div>
                  <div className="space-y-0.5">
                    {[
                      { name: 'Mobiles & Smartphones', catId: 85, icon: Smartphone, desc: 'iPhone, Redmi, Vivo, iQOO' },
                      { name: 'Laptops & Workstations', catId: 78, icon: Laptop, desc: 'MacBook, HP, Dell, Asus' },
                      { name: 'Electronics & Audio', catId: 1, icon: Headphones, desc: 'Headphones, Watch, PS5' },
                      { name: 'Fashion & Apparel', catId: 2, icon: Shirt, desc: 'Clothing, Shoes, Jackets' },
                      { name: 'Home & Living', catId: 3, icon: HomeIcon, desc: 'Decor, Kitchen & Living' },
                    ].map((item) => (
                      <Link
                        key={item.catId}
                        to={`/products?categoryId=${item.catId}`}
                        className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-emerald-50/60 transition-colors group"
                      >
                        <div className="w-8 h-8 rounded-lg bg-slate-100 group-hover:bg-emerald-100 text-slate-600 group-hover:text-emerald-700 flex items-center justify-center flex-shrink-0 transition-colors">
                          <item.icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-slate-900 group-hover:text-emerald-700 truncate">
                            {item.name}
                          </p>
                          <p className="text-[10px] text-slate-400 truncate">{item.desc}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                  <div className="pt-2 mt-1 border-t border-slate-100">
                    <Link
                      to="/products"
                      className="block text-center text-xs font-bold text-emerald-600 hover:text-emerald-700 py-1"
                    >
                      View All 32 Categories →
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Brands Dropdown */}
            <div className="relative" ref={brandRef}>
              <button
                type="button"
                onClick={() => {
                  setBrandDropdown((v) => !v);
                  setCategoryDropdown(false);
                }}
                className={`flex items-center gap-1.5 py-1.5 transition-colors outline-none ${
                  brandDropdown ? 'text-emerald-600 font-bold' : 'text-slate-700 hover:text-emerald-600'
                }`}
              >
                <span>Brands</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${
                    brandDropdown ? 'rotate-180 text-emerald-600' : 'text-slate-400'
                  }`}
                />
              </button>

              {brandDropdown && (
                <div className="absolute top-full left-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-100 p-3 animate-in fade-in slide-in-from-top-2 duration-150 z-50">
                  <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 mb-2">
                    Top Trending Brands (80+ in Store)
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    {[
                      { name: 'Apple', sub: 'iPhone, Mac, AirPods' },
                      { name: 'Samsung', sub: 'Galaxy S24, Watches' },
                      { name: 'HP', sub: 'OMEN, Spectre, Pavilion' },
                      { name: 'Dell', sub: 'XPS, Alienware, G15' },
                      { name: 'Asus', sub: 'ROG, Zenbook, TUF' },
                      { name: 'Lenovo', sub: 'Legion, ThinkPad' },
                      { name: 'Redmi', sub: 'Note 13 Pro+, 13C' },
                      { name: 'Realme', sub: 'GT 6, 12 Pro+' },
                      { name: 'Vivo', sub: 'X100 Pro, V30' },
                      { name: 'iQOO', sub: '12 5G, Neo 9 Pro' },
                      { name: 'Nike', sub: 'Air Jordan, Ultraboost' },
                      { name: 'Sony', sub: 'WH-1000XM5, PS5' },
                    ].map((b) => (
                      <Link
                        key={b.name}
                        to={`/products?brand=${encodeURIComponent(b.name)}`}
                        className="p-2 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-200 block"
                      >
                        <p className="text-xs font-bold text-slate-900">{b.name}</p>
                        <p className="text-[10px] text-slate-400 truncate">{b.sub}</p>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Direct Shortcut to Mobiles & Laptops */}
            <Link
              to="/products?categoryId=85"
              className="hover:text-emerald-600 transition-colors outline-none text-slate-700 py-1.5"
            >
              Mobiles
            </Link>
            <Link
              to="/products?categoryId=78"
              className="hover:text-emerald-600 transition-colors outline-none text-slate-700 py-1.5"
            >
              Laptops
            </Link>
          </nav>

          {/* ── Search Bar ── */}
          <form onSubmit={handleSearch} className="hidden md:flex items-center flex-1 max-w-sm mx-4">
            <div className="relative w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search iPhone, MacBook, Nike, Sony..."
                className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm border border-slate-200/90 rounded-full bg-slate-50/70 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white transition-all placeholder:text-slate-400"
              />
            </div>
          </form>

          {/* ── Right Icons ── */}
          <div className="flex items-center gap-2">
            {/* Wishlist */}
            {user && (
              <Link
                to="/wishlist"
                className="relative p-2.5 text-slate-600 hover:text-rose-600 hover:bg-rose-50/60 rounded-xl transition-all"
                title="Wishlist"
              >
                <Heart className="w-5 h-5" />
                {wishlistCount > 0 && (
                  <span className="absolute 1 top-1 right-1 bg-rose-500 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-bold shadow-sm">
                    {wishlistCount > 9 ? '9+' : wishlistCount}
                  </span>
                )}
              </Link>
            )}

            {/* Cart */}
            <Link
              to="/cart"
              className="relative p-2.5 text-slate-600 hover:text-emerald-600 hover:bg-emerald-50/60 rounded-xl transition-all"
              title="Cart"
            >
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute 1 top-1 right-1 bg-emerald-600 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-bold shadow-sm">
                  {cartCount > 9 ? '9+' : cartCount}
                </span>
              )}
            </Link>

            {/* User Dropdown */}
            {user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setUserDropdown(!userDropdown)}
                  className="flex items-center gap-2 pl-2 pr-1.5 py-1 bg-slate-100/80 hover:bg-slate-200/70 rounded-full text-slate-700 transition-colors"
                >
                  <div className="w-7 h-7 bg-emerald-600 text-white rounded-full flex items-center justify-center font-bold text-xs shadow-sm">
                    {user.firstName?.charAt(0)}{user.lastName?.charAt(0) || ''}
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-500 hidden sm:block mr-1" />
                </button>

                {userDropdown && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 animate-in fade-in slide-in-from-top-2 duration-150 z-50">
                    <div className="px-4 py-2.5 border-b border-slate-100">
                      <p className="text-xs font-bold text-slate-900 truncate">{user.firstName} {user.lastName}</p>
                      <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                      {isAdmin && (
                        <span className="inline-block mt-1 bg-indigo-50 text-indigo-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                          Admin Access
                        </span>
                      )}
                    </div>

                    <div className="py-1">
                      {isAdmin && (
                        <Link
                          to="/admin"
                          onClick={() => setUserDropdown(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                        >
                          <Shield className="w-4 h-4 text-indigo-600" /> Admin Dashboard
                        </Link>
                      )}
                      <Link
                        to="/orders"
                        onClick={() => setUserDropdown(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                      >
                        <Package className="w-4 h-4 text-emerald-600" /> My Orders
                      </Link>
                      <Link
                        to="/profile"
                        onClick={() => setUserDropdown(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                      >
                        <User className="w-4 h-4 text-slate-500" /> Profile Settings
                      </Link>
                    </div>

                    <div className="border-t border-slate-100 pt-1 mt-1">
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors w-full text-left"
                      >
                        <LogOut className="w-4 h-4" /> Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="text-xs font-bold text-slate-700 hover:text-emerald-600 transition-colors px-3 py-2 rounded-xl hover:bg-slate-100/70"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="text-xs font-bold bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-4 py-2 rounded-xl hover:from-emerald-700 hover:to-teal-700 transition-all shadow-sm shadow-emerald-500/20"
                >
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile Hamburger */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* ── Mobile Search ── */}
        <div className="md:hidden pb-3 pt-1">
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products..."
              className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-full bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </form>
        </div>

        {/* ── Mobile Menu ── */}
        {menuOpen && (
          <div className="lg:hidden pb-4 border-t border-slate-100 pt-3 animate-in fade-in">
            <nav className="flex flex-col gap-1">
              {[
                ['/', 'Home'],
                ['/products', 'All Products'],
                ['/products?categoryId=85', '📱 Mobiles & Smartphones'],
                ['/products?categoryId=78', '💻 Laptops & Ultrabooks'],
                ['/products?categoryId=1', '🎧 Electronics'],
                ['/products?categoryId=2', '👕 Fashion & Apparel'],
                ['/products?categoryId=3', '🏠 Home & Living'],
              ].map(([path, label]) => (
                <Link
                  key={path}
                  to={path}
                  className="block px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 rounded-xl transition-colors"
                >
                  {label}
                </Link>
              ))}
              {!user && (
                <div className="pt-2 mt-2 border-t border-slate-100 flex gap-2">
                  <Link
                    to="/login"
                    className="flex-1 py-2 text-center text-xs font-bold text-slate-700 bg-slate-100 rounded-xl"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="flex-1 py-2 text-center text-xs font-bold text-white bg-emerald-600 rounded-xl"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
