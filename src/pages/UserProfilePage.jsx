import React, { useState, useEffect, useCallback } from 'react';
import { 
  User, Shield, Calendar, Clock, MapPin, Ticket, Award, 
  ChevronRight, Phone, Mail, AlertCircle, 
  ArrowLeft, QrCode, Printer, X, Compass 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useBooking } from '../context/BookingContext';
import { api } from '../services/api';

export default function UserProfilePage({ onNavigate }) {
  const { user, isAuthenticated, openAuthModal, quickDemoLogin, updateProfile } = useAuth();
  const { showToast } = useBooking();

  const [bookings, setBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [selectedPass, setSelectedPass] = useState(null);
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: '',
    phone: '',
    idProofNumber: ''
  });
  const [savingProfile, setSavingProfile] = useState(false);

  const fetchUserBookings = useCallback(async () => {
    setLoadingBookings(true);
    try {
      const res = await api.bookings.getMyBookings();
      if (res.success && res.bookings) {
        setBookings(res.bookings);
      }
    } catch (err) {
      console.warn('Could not fetch remote bookings, relying on local session:', err.message);
    } finally {
      setLoadingBookings(false);
    }
  }, []);

  // Sync profile form when user loads
  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name || '',
        phone: user.phone || '',
        idProofNumber: user.id_proof_number || ''
      });
    }
  }, [user]);

  // Fetch live bookings from API
  useEffect(() => {
    if (isAuthenticated) {
      fetchUserBookings();
    }
  }, [isAuthenticated, fetchUserBookings]);

  const handleCancelBooking = async (bookingId, bookingRef) => {
    try {
      const res = await api.bookings.cancel(bookingId);
      if (res.success) {
        showToast(`Permit ${bookingRef} has been cancelled.`, 'info');
        setBookings(prev =>
          prev.map(b => (b.id === bookingId ? { ...b, status: 'CANCELLED' } : b))
        );
      }
    } catch (err) {
      showToast(err.message || 'Failed to cancel permit', 'error');
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      await updateProfile(profileForm);
      showToast('Profile information updated successfully.', 'success');
      setEditingProfile(false);
    } catch (err) {
      showToast(err.message || 'Failed to update profile', 'error');
    } finally {
      setSavingProfile(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-16 bg-[#071713] text-[#F0ECE1]">
        <div className="max-w-md w-full text-center space-y-6 p-8 bg-[#0B221B] border border-[#265244] rounded-2xl shadow-xl">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-[#113127] border border-[#C99A4A]/50 flex items-center justify-center text-[#E4B865]">
            <User className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-2xl font-serif font-bold text-[#F8F3E8]">Traveler Authentication Required</h2>
            <p className="text-xs sm:text-sm text-[#B8CEC4] mt-2 leading-relaxed">
              Sign in to manage your official NTCA forest entry permits, verify ID details, and track your expedition history.
            </p>
          </div>

          <div className="space-y-3 pt-2">
            <button
              type="button"
              onClick={() => openAuthModal('login')}
              className="w-full py-3 px-4 bg-[#C99A4A] hover:bg-[#D8AA5B] font-bold text-[#0D2922] rounded-xl transition shadow-md cursor-pointer text-xs sm:text-sm"
            >
              Sign In to Your Account
            </button>
            <button
              type="button"
              onClick={async () => {
                await quickDemoLogin('user');
                showToast('Signed in as Demo Traveler (Sahil Verma)', 'success');
              }}
              className="w-full py-2.5 px-4 bg-[#113127] hover:bg-[#173F35] border border-[#265244] text-[#F4EBDA] text-xs font-semibold rounded-xl transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <Compass className="w-4 h-4 text-[#E4B865]" />
              <span>1-Click Demo Traveler Login</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  const upcomingCount = bookings.filter(b => b.status === 'CONFIRMED').length;
  const completedCount = bookings.filter(b => b.status === 'CHECKED_IN').length;

  return (
    <div className="min-h-screen bg-[#071713] text-[#F0ECE1] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-[#9AB3A8]">
          <button
            type="button"
            onClick={() => onNavigate('home')}
            className="hover:text-[#E4B865] flex items-center gap-1 transition cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-[#C99A4A]" /> Back to Safaris
          </button>
          <span>/</span>
          <span className="text-[#F8F3E8] font-medium">Traveler Profile &amp; Gate Permits</span>
        </div>

        {/* Profile Card Header */}
        <div className="bg-gradient-to-r from-[#09211A] via-[#0B221B] to-[#0D2922] border border-[#265244] rounded-2xl p-6 sm:p-8 shadow-xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="w-20 h-20 rounded-2xl bg-[#113227] flex items-center justify-center text-[#E4B865] font-bold text-2xl shadow-lg border border-[#C99A4A]/50">
                {user.name ? user.name.slice(0, 2).toUpperCase() : 'TR'}
              </div>
              <div>
                <div className="flex items-center gap-2.5">
                  <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-100">{user.name}</h1>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-900/60 text-emerald-300 border border-emerald-600/40">
                    <Award className="w-3 h-3" /> {user.tier || 'Eco Explorer'}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-stone-400 mt-2">
                  <span className="flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-stone-500" /> {user.email}
                  </span>
                  {user.phone && (
                    <span className="flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-stone-500" /> {user.phone}
                    </span>
                  )}
                  <span className="flex items-center gap-1 text-emerald-400 font-medium">
                    <Shield className="w-3.5 h-3.5" /> ID Verified ({user.id_proof_number || 'Aadhaar on file'})
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setEditingProfile(!editingProfile)}
              className="px-4 py-2 bg-stone-800/90 hover:bg-stone-700 border border-stone-700 text-xs font-medium rounded-xl text-stone-200 transition"
            >
              {editingProfile ? 'Cancel Edit' : 'Edit Contact Details'}
            </button>
          </div>

          {/* Edit Profile Form */}
          {editingProfile && (
            <form onSubmit={handleSaveProfile} className="mt-6 pt-6 border-t border-stone-800 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs text-stone-400 mb-1">Full Name</label>
                <input
                  type="text"
                  value={profileForm.name}
                  onChange={(e) => setProfileForm(p => ({ ...p, name: e.target.value }))}
                  className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-xs text-stone-100 focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs text-stone-400 mb-1">Mobile (+91)</label>
                <input
                  type="text"
                  value={profileForm.phone}
                  onChange={(e) => setProfileForm(p => ({ ...p, phone: e.target.value }))}
                  className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-xs text-stone-100 focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs text-stone-400 mb-1">Govt ID Number (Aadhaar / Passport)</label>
                <input
                  type="text"
                  value={profileForm.idProofNumber}
                  onChange={(e) => setProfileForm(p => ({ ...p, idProofNumber: e.target.value }))}
                  className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-xs text-stone-100 focus:outline-none focus:border-emerald-500 uppercase"
                />
              </div>
              <div className="sm:col-span-3 flex justify-end">
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-stone-950 text-xs font-bold rounded-xl transition"
                >
                  {savingProfile ? 'Saving...' : 'Save Profile Changes'}
                </button>
              </div>
            </form>
          )}

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-stone-800">
            <div className="bg-stone-950/60 p-3.5 rounded-2xl border border-stone-800/80">
              <span className="text-xs text-stone-400 block uppercase tracking-wider">Total Passes</span>
              <span className="text-xl font-bold text-stone-100 mt-1 block">{bookings.length}</span>
            </div>
            <div className="bg-stone-950/60 p-3.5 rounded-2xl border border-stone-800/80">
              <span className="text-xs text-emerald-400 block uppercase tracking-wider">Upcoming Core</span>
              <span className="text-xl font-bold text-emerald-400 mt-1 block">{upcomingCount}</span>
            </div>
            <div className="bg-stone-950/60 p-3.5 rounded-2xl border border-stone-800/80">
              <span className="text-xs text-amber-400 block uppercase tracking-wider">Completed</span>
              <span className="text-xl font-bold text-amber-400 mt-1 block">{completedCount}</span>
            </div>
            <div className="bg-stone-950/60 p-3.5 rounded-2xl border border-stone-800/80">
              <span className="text-xs text-stone-400 block uppercase tracking-wider">NTCA Eco Rank</span>
              <span className="text-xs font-bold text-stone-200 mt-2 block truncate">Level 2 Guardian</span>
            </div>
          </div>
        </div>

        {/* Gate Passes & Reservations Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-serif font-bold text-stone-100 flex items-center gap-2">
                <Ticket className="w-5 h-5 text-emerald-400" />
                Official NTCA Gate Permits & Expedition Passes
              </h2>
              <p className="text-xs text-stone-400 mt-1">
                Show these digital passes along with physical photo IDs at forest entry checkpoints.
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('explore')}
              className="text-xs font-medium text-[#E4B865] hover:text-white flex items-center gap-1 transition cursor-pointer"
            >
              Book New Safari <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {loadingBookings ? (
            <div className="p-12 text-center text-stone-500 text-sm">
              <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              Retrieving verified permits from central registry...
            </div>
          ) : bookings.length === 0 ? (
            <div className="p-10 text-center bg-[#0B221B] border border-[#265244] rounded-2xl space-y-3">
              <Ticket className="w-10 h-10 text-[#C99A4A] mx-auto" />
              <h3 className="text-base font-semibold text-[#F8F3E8]">No Safari Passes Found</h3>
              <p className="text-xs text-[#9AB3A8] max-w-sm mx-auto">
                You haven&apos;t reserved any national park expeditions yet. Explore core zones across Tadoba, Pench, Ranthambore, and Corbett.
              </p>
              <button
                type="button"
                onClick={() => onNavigate('explore')}
                className="mt-2 px-4 py-2 bg-[#C99A4A] hover:bg-[#D8AA5B] text-[#0D2922] font-bold text-xs rounded-xl transition cursor-pointer"
              >
                Browse Protected Reserves
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {bookings.map((booking) => (
                <div
                  key={booking.id}
                  className="bg-stone-900 border border-stone-800 rounded-2xl p-5 hover:border-stone-700 transition flex flex-col md:flex-row items-start md:items-center justify-between gap-5"
                >
                  <div className="flex items-start sm:items-center gap-4">
                    <img
                      src={booking.safariImage || 'https://images.unsplash.com/photo-1549480017-d76466a4b7e8?auto=format&fit=crop&w=400&q=80'}
                      alt={booking.safariName}
                      className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover shrink-0 border border-stone-700"
                    />
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs font-bold text-amber-300 bg-amber-950/50 border border-amber-800/40 px-2 py-0.5 rounded">
                          {booking.bookingRef}
                        </span>
                        <span
                          className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${
                            booking.status === 'CONFIRMED'
                              ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800/60'
                              : booking.status === 'CHECKED_IN'
                              ? 'bg-blue-950/60 text-blue-300 border-blue-800/60'
                              : 'bg-red-950/60 text-red-300 border-red-800/60'
                          }`}
                        >
                          {booking.status === 'CONFIRMED' && '✓ Valid Permit'}
                          {booking.status === 'CHECKED_IN' && '✓ Admitted at Gate'}
                          {booking.status === 'CANCELLED' && '✕ Permit Void / Cancelled'}
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-stone-100">{booking.safariName}</h3>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-stone-400">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-stone-500" /> {booking.zoneName} ({booking.entryGate || 'Gate 1'})
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-stone-500" /> {booking.date}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-stone-500" /> {booking.shiftTime}
                        </span>
                      </div>
                      <p className="text-xs text-stone-400">
                        Vehicle: <span className="text-stone-300 font-medium">{booking.vehicleType}</span> • Guests: <span className="text-stone-300 font-medium">{booking.guestsCount} Travelers</span> • Total Paid: <span className="text-emerald-400 font-medium">₹{booking.totalAmount.toLocaleString('en-IN')}</span>
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 w-full md:w-auto justify-end border-t md:border-t-0 pt-3 md:pt-0 border-stone-800">
                    <button
                      onClick={() => setSelectedPass(booking)}
                      className="px-3.5 py-2 bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <QrCode className="w-4 h-4" /> View Gate Permit
                    </button>
                    {booking.status === 'CONFIRMED' && (
                      <button
                        onClick={() => handleCancelBooking(booking.id, booking.bookingRef)}
                        className="px-3 py-2 bg-stone-800 hover:bg-red-950/60 hover:text-red-300 border border-stone-700 hover:border-red-800 text-stone-400 text-xs font-medium rounded-xl transition cursor-pointer"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Gate Permit Detail Modal (Authentic Boarding Voucher Layout) */}
        {selectedPass && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 p-4 sm:p-6 flex justify-center items-start">
            <div className="relative w-full max-w-xl bg-white dark:bg-[#081814] border border-stone-200 dark:border-stone-800 rounded-3xl overflow-hidden shadow-2xl text-stone-900 dark:text-stone-100 my-4 sm:my-8 print:my-0 print:border-none print:shadow-none">
              
              {/* Official Government / NTCA Header */}
              <div className="bg-gradient-to-r from-[#09211A] via-[#0D2922] to-[#09211A] text-white px-6 py-5 border-b border-[#C99A4A]/40 flex items-start justify-between">
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-xl bg-[#113227] border border-[#C99A4A]/55 flex items-center justify-center text-[#E4B865] shrink-0">
                    <Compass className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-xs tracking-widest uppercase font-bold text-amber-400 block">
                      National Tiger Conservation Authority · Government of India
                    </span>
                    <h2 className="text-lg sm:text-xl font-serif font-bold text-white tracking-wide mt-0.5">
                      Official Forest Gate Permit
                    </h2>
                    <p className="text-xs font-mono text-emerald-300 mt-0.5">
                      Permit Ref: <strong>{selectedPass.bookingRef}</strong>
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedPass(null)}
                  className="p-1.5 text-stone-300 hover:text-white hover:bg-white/10 rounded-xl transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Boarding Pass Body */}
              <div className="p-6 space-y-5 text-xs">
                
                {/* Status Bar */}
                <div className="flex items-center justify-between pb-3 border-b border-stone-200 dark:border-stone-800">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    <span className="font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider text-xs">
                      {selectedPass.status === 'CONFIRMED' ? 'Valid & Authorized Entry' : selectedPass.status}
                    </span>
                  </div>
                  <span className="text-stone-500 text-xs">
                    Issued: {new Date(selectedPass.createdAt || '2026-10-18').toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                </div>

                {/* Park & Destination Details */}
                <div className="space-y-1">
                  <span className="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-widest block">
                    Protected Tiger Sanctuary
                  </span>
                  <h3 className="text-xl font-serif font-bold text-stone-900 dark:text-white">
                    {selectedPass.safariName}
                  </h3>
                  <p className="text-stone-500 dark:text-stone-400 text-xs">
                    State Jurisdiction: {selectedPass.state || 'India'}
                  </p>
                </div>

                {/* 2-Column Permit Data Matrix */}
                <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-stone-50 dark:bg-stone-900/80 border border-stone-200 dark:border-stone-800">
                  <div>
                    <span className="text-stone-500 text-xs block">Core Zone & Gate:</span>
                    <strong className="text-stone-900 dark:text-stone-100 text-xs">
                      {selectedPass.zoneName} ({selectedPass.entryGate || 'Main Gate'})
                    </strong>
                  </div>
                  <div>
                    <span className="text-stone-500 text-xs block">Expedition Date:</span>
                    <strong className="text-stone-900 dark:text-stone-100 text-xs">
                      {selectedPass.date}
                    </strong>
                  </div>
                  <div>
                    <span className="text-stone-500 text-xs block">Safari Shift & Time:</span>
                    <strong className="text-stone-900 dark:text-stone-100 text-xs">
                      {selectedPass.shiftTime}
                    </strong>
                  </div>
                  <div>
                    <span className="text-stone-500 text-xs block">Assigned Vehicle:</span>
                    <strong className="text-stone-900 dark:text-stone-100 text-xs">
                      {selectedPass.vehicleType}
                    </strong>
                  </div>
                  <div>
                    <span className="text-stone-500 text-xs block">Lead Explorer:</span>
                    <strong className="text-stone-900 dark:text-stone-100 text-xs">
                      {selectedPass.leadGuest?.fullName || user.name}
                    </strong>
                  </div>
                  <div>
                    <span className="text-stone-500 text-xs block">Govt Photo ID:</span>
                    <strong className="text-amber-700 dark:text-amber-300 font-mono text-xs uppercase">
                      {selectedPass.leadGuest?.idNumber || user.id_proof_number || 'Aadhaar Verified'}
                    </strong>
                  </div>
                </div>

                {/* Accompanying Guests Manifest */}
                {selectedPass.accompanyingGuests && selectedPass.accompanyingGuests.length > 0 && (
                  <div className="p-3.5 bg-stone-50 dark:bg-stone-900/50 rounded-2xl border border-stone-200 dark:border-stone-800 space-y-1.5">
                    <span className="text-xs font-bold text-stone-600 dark:text-stone-400 block uppercase tracking-wider">
                      Accompanying Guests ({selectedPass.accompanyingGuests.length}):
                    </span>
                    <div className="divide-y divide-stone-200 dark:divide-stone-800">
                      {selectedPass.accompanyingGuests.map((g, idx) => (
                        <div key={idx} className="py-1 text-xs flex justify-between text-stone-700 dark:text-stone-300">
                          <span>{g.name}</span>
                          <span className="text-stone-400 text-xs">{g.gender || 'Adult'} · Age {g.age || 'N/A'}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Perforated Ticket Divider with Semicircle Notches */}
                <div className="relative py-2 my-1">
                  <div className="absolute -left-6 top-1/2 -translate-y-1/2 w-5 h-5 bg-black/80 rounded-full" />
                  <div className="border-t-2 border-dashed border-stone-300 dark:border-stone-700 w-full" />
                  <div className="absolute -right-6 top-1/2 -translate-y-1/2 w-5 h-5 bg-black/80 rounded-full" />
                </div>

                {/* Gate Scanner QR Code & Barcode Stub */}
                <div className="p-4 bg-stone-50 dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
                  <div className="w-24 h-24 bg-white p-2 rounded-xl border border-stone-300 dark:border-stone-700 flex items-center justify-center shrink-0 shadow-sm">
                    <QrCode className="w-20 h-20 text-stone-950" />
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-widest block">
                      Fast-Track Gate QR Clearance
                    </span>
                    <p className="text-stone-600 dark:text-stone-400 text-xs leading-relaxed">
                      Present this QR pass on arrival at {selectedPass.entryGate || 'Gate Entry'} for rapid biometric validation and driver allocation.
                    </p>
                    <div className="font-mono text-xs tracking-widest text-stone-400 pt-1">
                      ||| | ||||| || |||| ||| ||||| ||| | ||||| |||
                    </div>
                  </div>
                </div>

                {/* Expedition Schedule Timeline */}
                <div>
                  <h4 className="font-bold text-stone-800 dark:text-stone-200 mb-2">Expedition Schedule:</h4>
                  <div className="space-y-2 border-l-2 border-emerald-600/40 pl-3 ml-1 text-xs">
                    {selectedPass.itinerary?.map((item, idx) => (
                      <div key={idx} className="space-y-0.5">
                        <span className="text-emerald-700 dark:text-emerald-400 font-mono font-bold">{item.time}</span>
                        <span className="text-stone-800 dark:text-stone-200 font-medium ml-2">{item.title}</span>
                        <p className="text-stone-500 text-xs">{item.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Regulatory Notice */}
                <div className="p-3.5 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 rounded-2xl text-amber-900 dark:text-amber-200 text-xs flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
                  <span>
                    <strong>Mandatory Forest Protocol:</strong> All travelers must carry their original physical Government ID card (Aadhaar / Passport) matching the permit registration number.
                  </span>
                </div>

              </div>

              {/* Modal Action Footer */}
              <div className="p-4 bg-stone-50 dark:bg-stone-900 border-t border-stone-200 dark:border-stone-800 flex items-center justify-between">
                <span className="text-xs text-stone-500 font-mono">
                  Total Paid: ₹{selectedPass.totalAmount?.toLocaleString('en-IN') || '2,499'}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => window.print()}
                    className="px-4 py-2 bg-stone-200 hover:bg-stone-300 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 font-semibold rounded-xl text-xs flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" /> Print Permit
                  </button>
                  <button
                    onClick={() => setSelectedPass(null)}
                    className="px-4 py-2 bg-emerald-700 hover:bg-emerald-600 text-white font-semibold rounded-xl text-xs transition cursor-pointer"
                  >
                    Done
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}
