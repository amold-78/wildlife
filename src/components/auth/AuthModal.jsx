import React, { useState } from 'react';
import { X, Lock, Mail, User, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useBooking } from '../../context/BookingContext';

export default function AuthModal() {
  const { authModalOpen, authModalTab, closeAuthModal, setAuthModalTab, login, register, quickDemoLogin } = useAuth();
  const { showToast } = useBooking();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!authModalOpen) return null;

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      if (authModalTab === 'login') {
        const user = await login(formData.email, formData.password);
        showToast(`Welcome back, ${user.name}! 🌲`, 'success');
      } else {
        const user = await register(formData);
        showToast(`Account created! Welcome, ${user.name}! 🐅`, 'success');
      }
    } catch (err) {
      setError(err.message || 'Authentication failed. Please check your details.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickLogin = async (role) => {
    setSubmitting(true);
    setError('');
    try {
      const user = await quickDemoLogin(role);
      showToast(
        role === 'admin'
          ? `Logged in as Ranger Admin (${user.name}) 🛡️`
          : `Logged in as Demo Traveler (${user.name}) 🌿`,
        'success'
      );
    } catch (err) {
      setError(err.message || 'Demo login failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      {/* Dim Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={closeAuthModal}
      />

      {/* Clean, Simple Modal Card */}
      <div className="relative w-full max-w-sm bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl shadow-xl overflow-hidden z-10 text-stone-900 dark:text-stone-100 my-8">
        
        {/* Top Header */}
        <div className="p-6 pb-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold font-serif text-stone-900 dark:text-white">
              {authModalTab === 'login' ? 'Sign In' : 'Create Account'}
            </h2>
            <button
              onClick={closeAuthModal}
              className="p-1.5 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
            {authModalTab === 'login'
              ? 'Access your saved safari gate permits and history.'
              : 'Join WildTrail to reserve protected core safari slots.'}
          </p>

          {/* Simple Tab Switcher */}
          <div className="flex bg-stone-100 dark:bg-stone-800 p-1 rounded-xl mt-4 text-xs font-semibold">
            <button
              type="button"
              onClick={() => { setAuthModalTab('login'); setError(''); }}
              className={`flex-1 py-1.5 rounded-lg transition-all ${
                authModalTab === 'login'
                  ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-white shadow-sm'
                  : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setAuthModalTab('register'); setError(''); }}
              className={`flex-1 py-1.5 rounded-lg transition-all ${
                authModalTab === 'register'
                  ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-white shadow-sm'
                  : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
              }`}
            >
              Create Account
            </button>
          </div>
        </div>

        {/* Clean Form */}
        <form onSubmit={handleSubmit} className="px-6 pb-6 space-y-3.5">
          {error && (
            <div className="p-2.5 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/50 rounded-xl text-red-600 dark:text-red-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {authModalTab === 'register' && (
            <div>
              <label className="block text-xs font-medium text-stone-600 dark:text-stone-300 mb-1">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 w-4 h-4 text-stone-400" />
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="e.g. Sahil Verma"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full pl-9 pr-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-xs text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:border-emerald-600 focus:bg-white dark:focus:bg-stone-900"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-stone-600 dark:text-stone-300 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 w-4 h-4 text-stone-400" />
              <input
                type="email"
                name="email"
                required
                placeholder="name@example.com"
                value={formData.email}
                onChange={handleChange}
                className="w-full pl-9 pr-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-xs text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:border-emerald-600 focus:bg-white dark:focus:bg-stone-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-stone-600 dark:text-stone-300 mb-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 w-4 h-4 text-stone-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                required
                minLength={6}
                placeholder="At least 6 characters"
                value={formData.password}
                onChange={handleChange}
                className="w-full pl-9 pr-9 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-xs text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:border-emerald-600 focus:bg-white dark:focus:bg-stone-900"
              />
              <button
                type="button"
                onClick={() => setShowPassword(p => !p)}
                className="absolute right-3 top-2.5 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full mt-2 py-2.5 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-semibold text-xs transition shadow-sm cursor-pointer disabled:opacity-50"
          >
            {submitting ? (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin inline-block" />
            ) : authModalTab === 'login' ? (
              'Sign In'
            ) : (
              'Create Account'
            )}
          </button>

          {/* Quick Demo Login Bar (Minimal & Friendly) */}
          <div className="pt-3 border-t border-stone-100 dark:border-stone-800 text-center">
            <span className="text-[11px] text-stone-400 block mb-2">
              Fast 1-click test login:
            </span>
            <div className="flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('user')}
                disabled={submitting}
                className="px-3 py-1.5 text-[11px] font-medium rounded-lg bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 transition"
              >
                🌿 Demo Traveler
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('admin')}
                disabled={submitting}
                className="px-3 py-1.5 text-[11px] font-medium rounded-lg bg-amber-50 dark:bg-amber-950/50 hover:bg-amber-100 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60 transition"
              >
                🛡️ Ranger Admin
              </button>
            </div>
          </div>
        </form>

      </div>
    </div>
  );
}
