import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Package, Tag, ShoppingCart, Users,
  Warehouse, Ticket, Star, BarChart2, Menu, X,
  ShoppingBag, LogOut, ChevronLeft, ChevronRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const navItems = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/products', label: 'Products', icon: Package },
  { to: '/admin/categories', label: 'Categories', icon: Tag },
  { to: '/admin/orders', label: 'Orders', icon: ShoppingCart },
  { to: '/admin/customers', label: 'Customers', icon: Users },
  { to: '/admin/inventory', label: 'Inventory', icon: Warehouse },
  { to: '/admin/coupons', label: 'Coupons', icon: Ticket },
  { to: '/admin/reviews', label: 'Reviews', icon: Star },
];

const AdminSidebar = ({ collapsed, setCollapsed }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const SidebarContent = ({ onClose }) => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className={`flex items-center gap-3 px-4 py-5 border-b border-gray-800 ${collapsed && !onClose ? 'justify-center' : ''}`}>
        <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center flex-shrink-0">
          <ShoppingBag className="w-4 h-4 text-white" />
        </div>
        {(!collapsed || onClose) && <span className="font-bold text-white text-lg">ShopSphere</span>}
        {onClose && (
          <button onClick={onClose} className="ml-auto text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2.5 mx-2 rounded-xl transition-colors text-sm font-medium ${
                isActive ? 'bg-emerald-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800'
              } ${collapsed && !onClose ? 'justify-center px-2' : ''}`
            }
          >
            {({ isActive }) => (
              <>
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {(!collapsed || onClose) && <span>{item.label}</span>}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Bottom */}
      <div className="border-t border-gray-800 p-4">
        <button
          onClick={handleLogout}
          className={`flex items-center gap-3 text-gray-400 hover:text-red-400 transition-colors text-sm font-medium w-full ${collapsed && !onClose ? 'justify-center' : ''}`}
        >
          <LogOut className="w-5 h-5" />
          {(!collapsed || onClose) && 'Logout'}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <div className={`hidden lg:flex flex-col bg-gray-900 transition-all duration-300 ${collapsed ? 'w-16' : 'w-60'} h-screen sticky top-0 flex-shrink-0 relative`}>
        <SidebarContent />
        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed((v) => !v)}
          className="absolute -right-3 top-20 bg-gray-900 border border-gray-700 rounded-full p-1 text-gray-400 hover:text-white hidden lg:flex items-center justify-center"
        >
          {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Mobile toggle button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-40 bg-gray-900 text-white p-2.5 rounded-xl shadow-lg"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMobileOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-64 bg-gray-900 shadow-2xl">
            <SidebarContent onClose={() => setMobileOpen(false)} />
          </div>
        </div>
      )}
    </>
  );
};

export default AdminSidebar;
