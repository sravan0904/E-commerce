import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, ShoppingBag, Loader2, Check, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

const passwordRules = [
  { label: 'At least 8 characters', test: (p) => p.length >= 8 },
  { label: 'Uppercase letter', test: (p) => /[A-Z]/.test(p) },
  { label: 'Lowercase letter', test: (p) => /[a-z]/.test(p) },
  { label: 'Number', test: (p) => /\d/.test(p) },
];

const Register = () => {
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', phone: '', password: '', confirmPassword: '',
  });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.firstName || !form.lastName || !form.email || !form.password) {
      showToast('Please fill in all required fields', 'error');
      return;
    }
    if (form.password !== form.confirmPassword) {
      showToast('Passwords do not match', 'error');
      return;
    }
    const failedRules = passwordRules.filter((r) => !r.test(form.password));
    if (failedRules.length) {
      showToast('Password does not meet requirements', 'error');
      return;
    }
    setLoading(true);
    const result = await register({
      firstName: form.firstName,
      lastName: form.lastName,
      email: form.email,
      phone: form.phone,
      password: form.password,
    });
    setLoading(false);
    if (result.success) {
      showToast('Account created! Welcome to ShopSphere 🎉', 'success');
      navigate('/', { replace: true });
    } else {
      showToast(result.error || 'Registration failed', 'error');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2">
            <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center">
              <ShoppingBag className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-bold text-gray-900">ShopSphere</span>
          </Link>
          <h1 className="mt-6 text-2xl font-bold text-gray-900">Create your account</h1>
          <p className="text-gray-500 mt-1">Join thousands of happy shoppers</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">First Name *</label>
                <input
                  type="text" name="firstName" value={form.firstName} onChange={handleChange}
                  placeholder="John"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Last Name *</label>
                <input
                  type="text" name="lastName" value={form.lastName} onChange={handleChange}
                  placeholder="Doe"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email address *</label>
              <input
                type="email" name="email" value={form.email} onChange={handleChange}
                placeholder="you@example.com"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone Number</label>
              <input
                type="tel" name="phone" value={form.phone} onChange={handleChange}
                placeholder="+91 9876543210"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Password *</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'} name="password" value={form.password} onChange={handleChange}
                  placeholder="Create a strong password"
                  className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                />
                <button type="button" onClick={() => setShowPass((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  {showPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {/* Password strength */}
              {form.password && (
                <div className="mt-2 grid grid-cols-2 gap-1">
                  {passwordRules.map((r) => {
                    const ok = r.test(form.password);
                    return (
                      <div key={r.label} className={`flex items-center gap-1 text-xs ${ok ? 'text-emerald-600' : 'text-gray-400'}`}>
                        {ok ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                        {r.label}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm Password *</label>
              <input
                type="password" name="confirmPassword" value={form.confirmPassword} onChange={handleChange}
                placeholder="Repeat your password"
                className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm ${
                  form.confirmPassword && form.password !== form.confirmPassword ? 'border-red-300 bg-red-50' : 'border-gray-200'
                }`}
              />
              {form.confirmPassword && form.password !== form.confirmPassword && (
                <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
              )}
            </div>

            <button
              type="submit" disabled={loading}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 mt-2"
            >
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating account...</> : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-emerald-600 font-medium hover:text-emerald-700">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
