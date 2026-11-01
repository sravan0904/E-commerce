import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Loader2, ArrowLeft, CheckCircle } from 'lucide-react';
import { authAPI } from '../../api/index';
import { useToast } from '../../context/ToastContext';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const { showToast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) { showToast('Please enter your email', 'error'); return; }
    setLoading(true);
    try {
      await authAPI.forgotPassword(email);
      setSent(true);
    } catch (err) {
      showToast(err?.response?.data?.message || 'Failed to send reset email', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2">
            <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center">
              <ShoppingBag className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-bold text-gray-900">ShopSphere</span>
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          {sent ? (
            <div className="text-center">
              <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-gray-900">Check your email</h2>
              <p className="text-gray-500 mt-2 text-sm">
                We've sent a password reset link to <strong>{email}</strong>. Please check your inbox.
              </p>
              <Link
                to="/login"
                className="mt-6 inline-flex items-center gap-2 text-emerald-600 font-medium hover:text-emerald-700 text-sm"
              >
                <ArrowLeft className="w-4 h-4" /> Back to Sign In
              </Link>
            </div>
          ) : (
            <>
              <h2 className="text-xl font-bold text-gray-900 mb-1">Reset your password</h2>
              <p className="text-gray-500 text-sm mb-6">
                Enter your email and we'll send you a reset link.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Email address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors"
                >
                  {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending...</> : 'Send Reset Link'}
                </button>
              </form>

              <div className="mt-6 text-center">
                <Link to="/login" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
                  <ArrowLeft className="w-4 h-4" /> Back to Sign In
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
