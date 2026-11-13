import React, { useState, useRef, useEffect } from 'react';
import { useBooking } from '../../context/BookingContext';
import { useAuth } from '../../context/AuthContext';
import { 
  Heart, Menu, X, Sun, Moon, User, Shield, 
  LogOut, ChevronDown, Ticket
} from 'lucide-react';

export default function Navbar({ activePage, setActivePage }) {
  const { bookings, wishlist, darkMode, toggleDarkMode, setShowSavedOnly } = useBooking();
  const { user, isAuthenticated, isAdmin, openAuthModal, logout } = useAuth();
  
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const dropdownRef = useRef(null);

  const navLinks = [
    { id: 'explore', label: 'Explore Reserves' },
    { id: 'finder', label: 'Safari Finder' },
    { id: 'wildlife', label: 'Wildlife Guide' },
  ];

  // Close user dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNavClick = (pageId) => {
    setActivePage(pageId);
    setMobileMenuOpen(false);
    setUserMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-40 bg-[#FDFBF7]/90 dark:bg-[#081512]/90 backdrop-blur-md border-b border-stone-200/80 dark:border-stone-800/80 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
        
        {/* Brand Logo */}
        <button
          onClick={() => {
            setShowSavedOnly?.(false);
            handleNavClick('home');
          }}
          className="flex items-center gap-3 text-left group focus:outline-none cursor-pointer"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0F2D24] to-[#1E4D3E] dark:from-[#173F33] dark:to-[#0D261E] border border-amber-600/30 flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform">
            <span className="text-xl select-none">🐅</span>
          </div>
          <div>
            <span className="text-xl font-serif font-bold tracking-tight text-stone-900 dark:text-stone-100 group-hover:text-emerald-800 dark:group-hover:text-amber-400 transition-colors">
              WildTrail
            </span>
            <span className="block text-[10px] tracking-widest uppercase font-semibold text-amber-700 dark:text-amber-500">
              National Parks of India
            </span>
          </div>
        </button>

        {/* Center Navigation Links - Minimal, Clean & Elegant */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            const isActive = activePage === link.id;
            return (
              <button
                key={link.id}
                onClick={() => {
                  if (link.id === 'explore') {
                    setShowSavedOnly?.(false);
                  }
                  handleNavClick(link.id);
                }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer relative ${
                  isActive
                    ? 'text-emerald-900 dark:text-amber-400 font-semibold'
                    : 'text-stone-600 dark:text-stone-300 hover:text-stone-950 dark:hover:text-white hover:bg-stone-200/50 dark:hover:bg-stone-800/50'
                }`}
              >
                {link.label}
                {isActive && (
                  <span className="absolute bottom-0.5 left-4 right-4 h-0.5 bg-emerald-800 dark:bg-amber-400 rounded-full" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Right Consolidated Actions */}
        <div className="hidden md:flex items-center gap-2.5">
          
          {/* Wishlist Shortcut */}
          <button
            onClick={() => {
              setShowSavedOnly?.(true);
              handleNavClick('explore');
            }}
            title="Saved Safaris"
            className="relative p-2 rounded-lg text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-200/50 dark:hover:bg-stone-800/50 transition cursor-pointer"
          >
            <Heart className={`w-4 h-4 ${wishlist.length > 0 ? 'text-amber-500 fill-amber-500/20' : ''}`} />
            {wishlist.length > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-amber-600 rounded-full" />
            )}
          </button>

          {/* Day / Night Theme Toggle */}
          <button
            onClick={toggleDarkMode}
            title={darkMode ? "Switch to Day Mode" : "Switch to Night Safari Dark Mode"}
            className="p-2 rounded-lg text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-200/50 dark:hover:bg-stone-800/50 transition cursor-pointer"
          >
            {darkMode ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4" />
            )}
          </button>

          <div className="h-4 w-px bg-stone-300 dark:bg-stone-800 mx-1" />

          {/* User Account / Profile Area */}
          {isAuthenticated ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl border border-stone-300/80 dark:border-stone-800 bg-white/70 dark:bg-stone-900/70 hover:border-emerald-600/50 transition cursor-pointer shadow-sm"
              >
                <div className="w-6 h-6 rounded-lg bg-emerald-800 text-stone-100 flex items-center justify-center text-[11px] font-bold">
                  {user.name ? user.name.slice(0, 2).toUpperCase() : 'TR'}
                </div>
                <div className="text-left text-xs">
                  <span className="font-semibold text-stone-800 dark:text-stone-200 max-w-[90px] truncate block leading-tight">
                    {user.name?.split(' ')[0]}
                  </span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-stone-400 ml-0.5" />
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-60 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl shadow-xl py-2 z-50 text-stone-800 dark:text-stone-200">
                  <div className="px-4 py-2.5 border-b border-stone-100 dark:border-stone-800">
                    <p className="text-xs font-bold text-stone-900 dark:text-stone-100 truncate">{user.name}</p>
                    <p className="text-[11px] text-stone-500 truncate">{user.email}</p>
                    <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                      {isAdmin ? '🛡️ Ranger Admin' : user.tier || '🌿 Eco Explorer'}
                    </span>
                  </div>

                  <div className="py-1">
                    <button
                      onClick={() => handleNavClick('profile')}
                      className="w-full px-4 py-2 text-left text-xs hover:bg-stone-100 dark:hover:bg-stone-800 flex items-center justify-between transition"
                    >
                      <span className="flex items-center gap-2">
                        <Ticket className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        <span>My Gate Passes</span>
                      </span>
                      {bookings.length > 0 && (
                        <span className="px-1.5 py-0.2 bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold rounded">
                          {bookings.length}
                        </span>
                      )}
                    </button>

                    <button
                      onClick={() => handleNavClick('profile')}
                      className="w-full px-4 py-2 text-left text-xs hover:bg-stone-100 dark:hover:bg-stone-800 flex items-center gap-2 transition"
                    >
                      <User className="w-3.5 h-3.5 text-stone-500" />
                      <span>Profile & ID Status</span>
                    </button>

                    {isAdmin && (
                      <button
                        onClick={() => handleNavClick('admin')}
                        className="w-full px-4 py-2 text-left text-xs hover:bg-amber-50 dark:hover:bg-amber-950/30 flex items-center gap-2 text-amber-700 dark:text-amber-400 font-medium transition"
                      >
                        <Shield className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                        <span>Ranger Admin Desk</span>
                      </button>
                    )}
                  </div>

                  <div className="border-t border-stone-100 dark:border-stone-800 pt-1">
                    <button
                      onClick={() => { logout(); setUserMenuOpen(false); }}
                      className="w-full px-4 py-2 text-left text-xs hover:bg-red-50 dark:hover:bg-red-950/40 text-red-600 dark:text-red-400 flex items-center gap-2 transition"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => openAuthModal('login')}
                className="px-3.5 py-1.5 text-xs font-semibold text-stone-700 dark:text-stone-300 hover:text-stone-950 dark:hover:text-white transition cursor-pointer"
              >
                Sign In
              </button>
              <button
                onClick={() => handleNavClick('explore')}
                className="px-4 py-2 rounded-xl bg-[#0F2D24] dark:bg-emerald-600 hover:bg-[#163D31] dark:hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm transition active:scale-95 cursor-pointer"
              >
                Book Safari
              </button>
            </div>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex md:hidden items-center gap-1">
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-lg text-stone-600 dark:text-stone-300"
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>
          
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-stone-700 dark:text-stone-200 hover:bg-stone-200/50 dark:hover:bg-stone-800/50"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#FDFBF7] dark:bg-[#081512] border-b border-stone-200 dark:border-stone-800 px-4 py-4 space-y-1">
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => handleNavClick(link.id)}
              className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium ${
                activePage === link.id
                  ? 'bg-emerald-900/10 text-emerald-900 dark:text-amber-400 font-bold'
                  : 'text-stone-700 dark:text-stone-300'
              }`}
            >
              {link.label}
            </button>
          ))}

          <div className="border-t border-stone-200 dark:border-stone-800 pt-3 mt-2 space-y-2">
            {isAuthenticated ? (
              <>
                <button
                  onClick={() => handleNavClick('profile')}
                  className="w-full flex items-center justify-between px-3 py-2 text-sm text-stone-800 dark:text-stone-200"
                >
                  <span className="flex items-center gap-2">
                    <Ticket className="w-4 h-4 text-emerald-600" /> My Gate Passes
                  </span>
                  <span className="text-xs font-bold px-2 py-0.5 bg-emerald-100 dark:bg-emerald-950 text-emerald-800 rounded">
                    {bookings.length}
                  </span>
                </button>
                {isAdmin && (
                  <button
                    onClick={() => handleNavClick('admin')}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-amber-600 dark:text-amber-400 font-medium"
                  >
                    <Shield className="w-4 h-4" /> Ranger Admin Portal
                  </button>
                )}
                <button
                  onClick={() => { logout(); setMobileMenuOpen(false); }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 dark:text-red-400"
                >
                  <LogOut className="w-4 h-4" /> Sign Out ({user.name})
                </button>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  onClick={() => { openAuthModal('login'); setMobileMenuOpen(false); }}
                  className="py-2.5 px-3 border border-stone-300 dark:border-stone-700 text-stone-800 dark:text-stone-200 font-semibold text-xs rounded-xl text-center"
                >
                  Sign In
                </button>
                <button
                  onClick={() => { handleNavClick('explore'); setMobileMenuOpen(false); }}
                  className="py-2.5 px-3 bg-[#0F2D24] dark:bg-emerald-600 text-white font-semibold text-xs rounded-xl text-center"
                >
                  Book Safari
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
