import React, { useState, useEffect } from 'react';
import { X, Lock, Mail, User, Eye, EyeOff, AlertCircle, Compass, Shield } from 'lucide-react';
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

  // Close on Escape key (R-26, R-32)
  useEffect(() => {
    if (!authModalOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        closeAuthModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [authModalOpen, closeAuthModal]);

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
        showToast(`Welcome back, ${user.name}. Your safari permits are ready.`, 'success');
      } else {
        const user = await register(formData);
        showToast(`Account created. Welcome to WildTrail, ${user.name}!`, 'success');
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
          ? `Authorized as Ranger Admin (${user.name})`
          : `Signed in as Demo Traveler (${user.name})`,
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
        className="fixed inset-0 bg-[#04100C]/80 transition-opacity"
        onClick={closeAuthModal}
      />

      {/* Expedition Field Journal Modal Card */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-modal-title"
        className="relative w-full max-w-md bg-[#FBF8F3] dark:bg-[#0B221B] border border-[#D8CEBE] dark:border-[#265244] rounded-2xl shadow-[0_24px_60px_-15px_rgba(3,12,9,0.75)] overflow-hidden z-10 text-[#14261F] dark:text-[#F0ECE1] my-8 animate-fade-in"
      >
        {/* Top Canopy Header Banner */}
        <div className="bg-[#09211A] text-[#F4EBDA] px-6 py-5 border-b border-[#265244] flex items-start justify-between">
          <div>
            <span className="text-[11px] font-mono uppercase tracking-widest text-[#C99A4A] block mb-1">
              WildTrail Permit Registry
            </span>
            <h2 id="auth-modal-title" className="text-xl font-bold font-serif text-[#F8F3E8]">
              {authModalTab === 'login' ? 'Sign In to Expedition Desk' : 'Create Traveler Account'}
            </h2>
            <p className="text-xs text-[#B7CEC4] mt-1">
              {authModalTab === 'login'
                ? 'Access your saved safari gate permits and itinerary passes.'
                : 'Register to reserve official NTCA core & buffer safari slots.'}
            </p>
          </div>
          <button
            type="button"
            onClick={closeAuthModal}
            aria-label="Close authentication modal"
            className="p-1.5 text-[#9AB3A8] hover:text-white rounded-lg hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Tab Switcher */}
          <div className="flex bg-[#EFE6D7] dark:bg-[#071713] p-1 rounded-xl border border-[#D8CEBE] dark:border-[#1D4337] text-xs font-semibold">
            <button
              type="button"
              onClick={() => { setAuthModalTab('login'); setError(''); }}
              className={`flex-1 py-2 rounded-lg transition-all cursor-pointer ${
                authModalTab === 'login'
                  ? 'bg-[#0D2922] text-[#F8F3E8] dark:bg-[#C99A4A] dark:text-[#0D2922] font-bold shadow-sm'
                  : 'text-[#43564E] dark:text-[#A8C2B7] hover:text-[#14261F] dark:hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setAuthModalTab('register'); setError(''); }}
              className={`flex-1 py-2 rounded-lg transition-all cursor-pointer ${
                authModalTab === 'register'
                  ? 'bg-[#0D2922] text-[#F8F3E8] dark:bg-[#C99A4A] dark:text-[#0D2922] font-bold shadow-sm'
                  : 'text-[#43564E] dark:text-[#A8C2B7] hover:text-[#14261F] dark:hover:text-white'
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {error && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800/60 rounded-xl text-rose-700 dark:text-rose-200 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {authModalTab === 'register' && (
              <div>
                <label className="block text-xs font-semibold text-[#43564E] dark:text-[#B8CEC4] mb-1">
                  Full Legal Name (as on Govt ID)
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 w-4 h-4 text-[#64776E]" />
                  <input
                    type="text"
                    name="name"
                    required
                    placeholder="e.g. Sahil Verma"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full pl-9 pr-3 py-2.5 bg-white dark:bg-[#071713] border border-[#D8CEBE] dark:border-[#265244] rounded-xl text-xs text-[#14261F] dark:text-[#F0ECE1] placeholder-[#64776E] focus:outline-none focus:border-[#C99A4A]"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-[#43564E] dark:text-[#B8CEC4] mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 w-4 h-4 text-[#64776E]" />
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-9 pr-3 py-2.5 bg-white dark:bg-[#071713] border border-[#D8CEBE] dark:border-[#265244] rounded-xl text-xs text-[#14261F] dark:text-[#F0ECE1] placeholder-[#64776E] focus:outline-none focus:border-[#C99A4A]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#43564E] dark:text-[#B8CEC4] mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 w-4 h-4 text-[#64776E]" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  required
                  minLength={6}
                  placeholder="At least 6 characters"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-9 pr-9 py-2.5 bg-white dark:bg-[#071713] border border-[#D8CEBE] dark:border-[#265244] rounded-xl text-xs text-[#14261F] dark:text-[#F0ECE1] placeholder-[#64776E] focus:outline-none focus:border-[#C99A4A]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(p => !p)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-3 top-2.5 text-[#64776E] hover:text-[#14261F] dark:hover:text-white cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-[#0D2922] dark:bg-[#C99A4A] hover:bg-[#173F35] dark:hover:bg-[#D8AA5B] text-[#F8F3E8] dark:text-[#0D2922] font-bold text-xs transition shadow-sm cursor-pointer disabled:opacity-50"
            >
              {submitting ? (
                <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin inline-block" />
              ) : authModalTab === 'login' ? (
                'Sign In to WildTrail'
              ) : (
                'Create Traveler Account'
              )}
            </button>

            {/* Sample Registry Accounts */}
            <div className="pt-4 border-t border-[#E6DEC8] dark:border-[#1D4337] text-center">
              <span className="text-[11px] font-mono uppercase tracking-wider text-[#64776E] dark:text-[#7E9E91] block mb-2.5">
                Pre-Registered NTCA Sandbox Accounts
              </span>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => handleQuickLogin('user')}
                  disabled={submitting}
                  className="px-3 py-2 text-xs font-semibold rounded-xl bg-[#EFE6D7] dark:bg-[#113127] hover:bg-[#E5D9C5] dark:hover:bg-[#173F35] text-[#0D2922] dark:text-[#F4EBDA] border border-[#D8CEBE] dark:border-[#265244] transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Compass className="w-3.5 h-3.5 text-[#C99A4A]" />
                  <span>Guest Pass (Sahil)</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickLogin('admin')}
                  disabled={submitting}
                  className="px-3 py-2 text-xs font-semibold rounded-xl bg-[#C99A4A]/15 hover:bg-[#C99A4A]/25 text-[#6E4D14] dark:text-[#E4B865] border border-[#C99A4A]/45 transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Shield className="w-3.5 h-3.5 text-[#C99A4A]" />
                  <span>Warden Desk</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
