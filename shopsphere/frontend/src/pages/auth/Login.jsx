import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, ShoppingBag, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

const Login = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      showToast('Please fill in all fields', 'error');
      return;
    }
    setLoading(true);
    const result = await login(form.email, form.password);
    setLoading(false);
    if (result.success) {
      showToast('Welcome back!', 'success');
      // redirect admin to admin dashboard
      if (result.user?.roles?.includes('ROLE_ADMIN')) {
        navigate('/admin', { replace: true });
      } else {
        navigate(from, { replace: true });
      }
    } else {
      showToast(result.error || 'Login failed. Check your credentials.', 'error');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2">
            <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center">
              <ShoppingBag className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-bold text-gray-900">ShopSphere</span>
          </Link>
          <h1 className="mt-6 text-2xl font-bold text-gray-900">Welcome back</h1>
          <p className="text-gray-500 mt-1">Sign in to your account</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email address</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                autoComplete="email"
                placeholder="you@example.com"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm transition-shadow"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm transition-shadow"
                />
                <button
                  type="button"
                  onClick={() => setShowPass((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <div className="mt-2 text-right">
                <Link to="/forgot-password" className="text-xs text-emerald-600 hover:text-emerald-700 font-medium">
                  Forgot password?
                </Link>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Signing in...</> : 'Sign In'}
            </button>
          </form>

          {/* Demo credentials */}
          <div className="mt-5 p-4 bg-blue-50 border border-blue-100 rounded-xl text-xs text-blue-700 space-y-1">
            <p className="font-semibold">Demo Credentials:</p>
            <p>Customer: customer@shopsphere.com / Customer@123</p>
            <p>Admin: admin@shopsphere.com / Admin@123</p>
          </div>

          <p className="text-center text-sm text-gray-500 mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-emerald-600 font-medium hover:text-emerald-700">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
