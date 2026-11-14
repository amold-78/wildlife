import React, { useState, useRef, useEffect } from 'react';
import { useBooking } from '../../context/BookingContext';
import { useAuth } from '../../context/AuthContext';
import {
  Heart,
  Menu,
  X,
  Sun,
  Moon,
  User,
  Shield,
  LogOut,
  ChevronDown,
  Ticket,
  Compass,
} from 'lucide-react';

export default function Navbar({ activePage, setActivePage }) {
  const { bookings, wishlist, darkMode, toggleDarkMode, setShowSavedOnly } = useBooking();
  const { user, isAuthenticated, isAdmin, openAuthModal, logout } = useAuth();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const dropdownRef = useRef(null);

  const navLinks = [
    { id: 'explore', label: 'Explore Reserves' },
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
    <header className="sticky top-0 z-40 h-18 bg-[#09211A]/90 dark:bg-[#061510]/92 backdrop-blur-xl border-b border-[#265244]/85 text-[#F4EBDA] transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between gap-8">
        {/* Zone 1: Single-line Brand Wordmark + Authored Cartographic Compass Emblem */}
        <button
          type="button"
          onClick={() => {
            setShowSavedOnly?.(false);
            handleNavClick('home');
          }}
          className="flex items-center gap-3 text-left group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C99A4A] rounded-xl py-1 cursor-pointer whitespace-nowrap shrink-0"
        >
          <span
            aria-hidden="true"
            className="w-9 h-9 rounded-xl bg-[#103328] border border-[#C99A4A]/45 flex items-center justify-center transition-transform duration-200 group-hover:scale-105"
          >
            <svg viewBox="0 0 28 28" fill="none" className="w-5 h-5">
              {/* Outer Topographic Compass Ring */}
              <circle
                cx="14"
                cy="14"
                r="10.5"
                stroke="#C99A4A"
                strokeWidth="1.3"
                strokeDasharray="3 2"
              />
              {/* Winding S-Curve Trail Line inside Compass */}
              <path
                d="M 14 4.5 C 18.5 8, 9.5 13, 14 16.5 C 17.5 19.5, 11.5 21.5, 14 23.5"
                stroke="#E4B865"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
              {/* North Waypoint Diamond */}
              <polygon points="14,2 15.8,5 14,4.2 12.2,5" fill="#E4B865" />
            </svg>
          </span>
          <span className="font-serif text-xl font-bold tracking-tight text-[#F6F1E5] group-hover:text-[#E4B865] transition-colors whitespace-nowrap shrink-0">
            WildTrail
          </span>
        </button>

        {/* Zone 2: Clean Single-Line Editorial Navigation Links */}
        <nav aria-label="Primary navigation" className="hidden md:flex items-center gap-7">
          {navLinks.map((link) => {
            const isActive = activePage === link.id;
            return (
              <button
                key={link.id}
                type="button"
                onClick={() => {
                  if (link.id === 'explore') {
                    setShowSavedOnly?.(false);
                  }
                  handleNavClick(link.id);
                }}
                className={`relative py-2 text-sm font-medium transition-colors cursor-pointer whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C99A4A] rounded-md ${
                  isActive
                    ? 'text-[#E4B865] font-semibold'
                    : 'text-[#D0E0D8] hover:text-white'
                }`}
              >
                <span>{link.label}</span>
                {isActive && (
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-0 -bottom-0.5 h-0.5 bg-[#C99A4A] rounded-full"
                  />
                )}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Consolidated Expedition Controls & Primary CTA */}
        <div className="hidden md:flex items-center gap-2.5 shrink-0">
          {/* Saved Reserves Button */}
          <button
            type="button"
            onClick={() => {
              setShowSavedOnly?.(true);
              handleNavClick('explore');
            }}
            aria-label="Saved Safaris"
            title="Saved Safaris"
            className="inline-flex items-center gap-1.5 px-2.5 py-2 rounded-xl text-xs font-mono tabular-nums text-[#D0E0D8] hover:text-white hover:bg-[#13382C] border border-transparent hover:border-[#285948] transition-colors cursor-pointer whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C99A4A]"
          >
            <Heart
              className={`w-4 h-4 ${
                wishlist.length > 0 ? 'text-[#E4B865] fill-[#E4B865]/25' : ''
              }`}
            />
            {wishlist.length > 0 && <span>{wishlist.length}</span>}
          </button>

          {/* Day / Night Safari Theme Toggle */}
          <button
            type="button"
            onClick={toggleDarkMode}
            aria-label={darkMode ? 'Switch to Day Mode' : 'Switch to Night Safari Dark Mode'}
            title={darkMode ? 'Switch to Day Mode' : 'Switch to Night Safari Dark Mode'}
            className="p-2 rounded-xl text-[#D0E0D8] hover:text-white hover:bg-[#13382C] border border-transparent hover:border-[#285948] transition-colors cursor-pointer shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C99A4A]"
          >
            {darkMode ? (
              <Sun className="w-4 h-4 text-[#E4B865]" />
            ) : (
              <Moon className="w-4 h-4 text-[#D0E0D8]" />
            )}
          </button>

          <div aria-hidden="true" className="h-4 w-px bg-[#234D3E] mx-0.5" />

          {/* User Account / Auth Controls */}
          {isAuthenticated ? (
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                aria-expanded={userMenuOpen}
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl border border-[#2B5D4B] bg-[#102E24] hover:border-[#C99A4A]/70 text-[#F4EBDA] transition-colors cursor-pointer whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C99A4A]"
              >
                <span className="w-6 h-6 rounded-lg bg-[#1A4738] border border-[#C99A4A]/40 text-[#E4B865] flex items-center justify-center text-xs font-mono font-bold">
                  {user.name ? user.name.slice(0, 2).toUpperCase() : 'TR'}
                </span>
                <span className="text-xs font-semibold text-[#F4EBDA] max-w-[96px] truncate">
                  {user.name?.split(' ')[0]}
                </span>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-[#9EB7AC] transition-transform duration-200 ${
                    userMenuOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-60 bg-[#0A221B] border border-[#285948] rounded-2xl py-2 z-50 text-[#F4EBDA]">
                  <div className="px-4 py-2.5 border-b border-[#1D4235]">
                    <p className="text-xs font-bold text-white truncate">{user.name}</p>
                    <p className="text-xs text-[#9EB7AC] truncate">{user.email}</p>
                    <p className="mt-1 inline-flex items-center gap-1.5 text-xs font-medium text-[#E4B865]">
                      {isAdmin ? (
                        <>
                          <Shield className="w-3.5 h-3.5" />
                          <span>Ranger Admin</span>
                        </>
                      ) : (
                        <>
                          <Compass className="w-3.5 h-3.5" />
                          <span>{user.tier || 'Eco Explorer'}</span>
                        </>
                      )}
                    </p>
                  </div>

                  <div className="py-1">
                    <button
                      type="button"
                      onClick={() => handleNavClick('profile')}
                      className="w-full px-4 py-2 text-left text-xs text-[#E5EFEA] hover:bg-[#13382C] flex items-center justify-between transition-colors cursor-pointer"
                    >
                      <span className="flex items-center gap-2">
                        <Ticket className="w-3.5 h-3.5 text-[#E4B865]" />
                        <span>My Gate Passes</span>
                      </span>
                      {bookings.length > 0 && (
                        <span className="font-mono tabular-nums text-xs font-bold text-[#E4B865]">
                          {bookings.length}
                        </span>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleNavClick('profile')}
                      className="w-full px-4 py-2 text-left text-xs text-[#E5EFEA] hover:bg-[#13382C] flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      <User className="w-3.5 h-3.5 text-[#9EB7AC]" />
                      <span>Profile &amp; ID Status</span>
                    </button>

                    {isAdmin && (
                      <button
                        type="button"
                        onClick={() => handleNavClick('admin')}
                        className="w-full px-4 py-2 text-left text-xs hover:bg-[#13382C] flex items-center gap-2 text-[#E4B865] font-medium transition-colors cursor-pointer"
                      >
                        <Shield className="w-3.5 h-3.5 text-[#E4B865]" />
                        <span>Ranger Admin Desk</span>
                      </button>
                    )}
                  </div>

                  <div className="border-t border-[#1D4235] pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        logout();
                        setUserMenuOpen(false);
                      }}
                      className="w-full px-4 py-2 text-left text-xs hover:bg-rose-950/50 text-rose-300 flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              type="button"
              onClick={() => openAuthModal('login')}
              className="px-3 py-2 rounded-xl text-xs font-semibold text-[#D0E0D8] hover:text-white hover:bg-[#13382C] transition-colors cursor-pointer whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C99A4A]"
            >
              Sign In
            </button>
          )}

          {/* Primary Action CTA: Direct Permit Reservation */}
          <button
            type="button"
            onClick={() => handleNavClick('booking')}
            className="px-4 py-2 rounded-xl bg-[#C99A4A] hover:bg-[#B88939] text-[#0D2922] text-xs font-bold inline-flex items-center justify-center transition-colors active:scale-[0.98] cursor-pointer whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E4B865]"
          >
            <span>Reserve Permit</span>
          </button>
        </div>

        {/* Mobile Controls */}
        <div className="flex md:hidden items-center gap-1.5">
          <button
            type="button"
            onClick={toggleDarkMode}
            aria-label={darkMode ? 'Switch to Day Mode' : 'Switch to Night Safari Dark Mode'}
            className="p-2 rounded-xl text-[#D0E0D8] hover:text-white hover:bg-[#13382C]"
          >
            {darkMode ? (
              <Sun className="w-4 h-4 text-[#E4B865]" />
            ) : (
              <Moon className="w-4 h-4" />
            )}
          </button>

          <button
            type="button"
            aria-expanded={mobileMenuOpen}
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl text-[#F4EBDA] hover:bg-[#13382C]"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#081E17]/98 backdrop-blur-xl border-b border-[#265244] px-4 py-4 space-y-1">
          {navLinks.map((link) => {
            const isActive = activePage === link.id;
            return (
              <button
                key={link.id}
                type="button"
                onClick={() => handleNavClick(link.id)}
                className={`w-full text-left px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-[#13382C] text-[#E4B865] font-semibold'
                    : 'text-[#D0E0D8] hover:bg-[#102E24] hover:text-white'
                }`}
              >
                {link.label}
              </button>
            );
          })}

          <div className="border-t border-[#1D4235] pt-3 mt-2 space-y-2">
            {isAuthenticated ? (
              <>
                <button
                  type="button"
                  onClick={() => handleNavClick('profile')}
                  className="w-full flex items-center justify-between px-3.5 py-2 text-sm text-[#F4EBDA]"
                >
                  <span className="flex items-center gap-2">
                    <Ticket className="w-4 h-4 text-[#E4B865]" />
                    <span>My Gate Passes</span>
                  </span>
                  <span className="text-xs font-mono tabular-nums font-bold text-[#E4B865]">
                    {bookings.length}
                  </span>
                </button>
                {isAdmin && (
                  <button
                    type="button"
                    onClick={() => handleNavClick('admin')}
                    className="w-full flex items-center gap-2 px-3.5 py-2 text-sm text-[#E4B865] font-medium"
                  >
                    <Shield className="w-4 h-4" />
                    <span>Ranger Admin Desk</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-3.5 py-2 text-sm text-rose-300"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out ({user.name})</span>
                </button>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    openAuthModal('login');
                    setMobileMenuOpen(false);
                  }}
                  className="py-2.5 px-3 border border-[#2B5D4B] text-[#F4EBDA] font-semibold text-xs rounded-xl text-center"
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleNavClick('booking');
                    setMobileMenuOpen(false);
                  }}
                  className="py-2.5 px-3 bg-[#C99A4A] text-[#0D2922] font-bold text-xs rounded-xl text-center"
                >
                  Reserve Permit
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
