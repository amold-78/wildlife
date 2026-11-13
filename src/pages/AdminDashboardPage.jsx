import React, { useState, useEffect, useCallback } from 'react';
import { 
  Shield, CheckCircle2, AlertTriangle, Search, Filter, 
  Users, DollarSign, Ticket, ArrowLeft, RefreshCw, 
  Sparkles, QrCode
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useBooking } from '../context/BookingContext';
import { api } from '../services/api';

export default function AdminDashboardPage({ onNavigate }) {
  const { user, isAdmin, isAuthenticated, openAuthModal, quickDemoLogin } = useAuth();
  const { showToast } = useBooking();

  const [stats, setStats] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('checkin'); // 'checkin' | 'bookings' | 'reviews'

  // Gate Check-in tool state
  const [scanRef, setScanRef] = useState('WT-2026-88421');
  const [verifying, setVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);

  // Filters for bookings master list
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const loadDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      const [statsRes, bookingsRes] = await Promise.all([
        api.admin.getStats(),
        api.admin.getBookings({ status: statusFilter, search: searchQuery })
      ]);

      if (statsRes.success) setStats(statsRes.stats);
      if (bookingsRes.success) setBookings(bookingsRes.bookings);
    } catch (err) {
      console.error('Failed to load admin data:', err);
      showToast('Error loading administrative data: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, searchQuery, showToast]);

  useEffect(() => {
    if (isAdmin) {
      loadDashboardData();
    }
  }, [isAdmin, loadDashboardData]);

  const handleVerifyGatePass = async (refToVerify) => {
    const targetRef = refToVerify || scanRef;
    if (!targetRef) return;

    setVerifying(true);
    setVerificationResult(null);

    try {
      const res = await api.admin.verifyGatePass(targetRef);
      setVerificationResult(res);
      showToast(res.message, res.alreadyCheckedIn ? 'info' : 'success');
      loadDashboardData(); // Refresh table & counters
    } catch (err) {
      setVerificationResult({
        success: false,
        status: 'ERROR',
        message: err.message || 'Verification failed. Permit may not exist.'
      });
      showToast(err.message || 'Verification failed', 'error');
    } finally {
      setVerifying(false);
    }
  };

  if (!isAuthenticated || !isAdmin) {
    return (
      <div className="min-h-[85vh] flex items-center justify-center px-4 py-16 bg-stone-950 text-stone-100">
        <div className="max-w-md w-full text-center space-y-6 p-8 bg-stone-900/90 border border-amber-800/40 rounded-3xl shadow-2xl">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-950/60 border border-amber-500/40 flex items-center justify-center text-amber-400">
            <Shield className="w-8 h-8" />
          </div>
          <div>
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-amber-400">Restricted Territory</span>
            <h2 className="text-2xl font-serif font-bold text-stone-100 mt-1">NTCA Ranger Admin Portal</h2>
            <p className="text-xs text-stone-400 mt-2 leading-relaxed">
              This administrative gate terminal requires authorized Forest Department credentials for park quota management and gate clearance.
            </p>
          </div>

          <div className="space-y-3 pt-2">
            <button
              onClick={async () => {
                await quickDemoLogin('admin');
                showToast('Authorized as Ranger Admin (NTCA Chief Warden)! 🛡️', 'success');
              }}
              className="w-full py-3 px-4 bg-amber-600 hover:bg-amber-500 font-bold text-stone-950 rounded-xl transition shadow-lg shadow-amber-950/50 flex items-center justify-center gap-2 cursor-pointer text-sm"
            >
              <Sparkles className="w-4 h-4" /> 1-Click Login as Ranger Admin
            </button>
            <button
              onClick={() => openAuthModal('login')}
              className="w-full py-2.5 px-4 bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-medium rounded-xl transition cursor-pointer"
            >
              Sign In with Custom Officer Credentials
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Top Header & Breadcrumb */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-stone-800 pb-6">
          <div>
            <div className="flex items-center gap-2 text-xs text-stone-400 mb-1">
              <button onClick={() => onNavigate('home')} className="hover:text-emerald-400 flex items-center gap-1 transition">
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Public Site
              </button>
              <span>/</span>
              <span className="text-amber-400 font-semibold">Forest Department Control Room</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-100 flex items-center gap-3">
              <Shield className="w-7 h-7 text-amber-400" />
              NTCA Ranger Operations Portal
            </h1>
            <p className="text-xs text-stone-400 mt-1">
              Active Officer: <strong className="text-stone-200">{user.name}</strong> • Station: <span className="text-emerald-400 font-mono">Central Tiger Conservation Node</span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={loadDashboardData}
              disabled={loading}
              className="p-2.5 bg-stone-900 hover:bg-stone-800 border border-stone-700 rounded-xl text-stone-300 hover:text-stone-100 transition"
              title="Refresh Operations Data"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <span className="px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-950/80 text-emerald-300 border border-emerald-700/50 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Live WAL Database
            </span>
          </div>
        </div>

        {/* Real-time KPI Stats Grid */}
        {stats && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-stone-900/90 border border-stone-800 p-5 rounded-2xl">
              <div className="flex items-center justify-between text-stone-400 mb-2">
                <span className="text-xs uppercase tracking-wider font-semibold">Total Permits</span>
                <Ticket className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-2xl font-bold text-stone-100">{stats.totalBookings}</div>
              <span className="text-[11px] text-emerald-400 mt-1 block">
                {stats.confirmedBookings} confirmed & valid
              </span>
            </div>

            <div className="bg-stone-900/90 border border-stone-800 p-5 rounded-2xl">
              <div className="flex items-center justify-between text-stone-400 mb-2">
                <span className="text-xs uppercase tracking-wider font-semibold">Park Revenue</span>
                <DollarSign className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-2xl font-bold text-amber-400">
                ₹{stats.totalRevenue.toLocaleString('en-IN')}
              </div>
              <span className="text-[11px] text-stone-400 mt-1 block">
                Allocated to Tiger Conservation Fund
              </span>
            </div>

            <div className="bg-stone-900/90 border border-stone-800 p-5 rounded-2xl">
              <div className="flex items-center justify-between text-stone-400 mb-2">
                <span className="text-xs uppercase tracking-wider font-semibold">Admitted at Gate</span>
                <CheckCircle2 className="w-4 h-4 text-blue-400" />
              </div>
              <div className="text-2xl font-bold text-blue-400">{stats.checkedInBookings}</div>
              <span className="text-[11px] text-stone-400 mt-1 block">
                Checked in via QR / Barcode
              </span>
            </div>

            <div className="bg-stone-900/90 border border-stone-800 p-5 rounded-2xl">
              <div className="flex items-center justify-between text-stone-400 mb-2">
                <span className="text-xs uppercase tracking-wider font-semibold">Registered Travelers</span>
                <Users className="w-4 h-4 text-purple-400" />
              </div>
              <div className="text-2xl font-bold text-purple-400">{stats.totalUsers}</div>
              <span className="text-[11px] text-stone-400 mt-1 block">
                Verified Government IDs on file
              </span>
            </div>
          </div>
        )}

        {/* Operations Navigation Tabs */}
        <div className="flex border-b border-stone-800 space-x-6 text-sm font-medium">
          <button
            onClick={() => setActiveTab('checkin')}
            className={`pb-3 transition-colors border-b-2 flex items-center gap-2 ${
              activeTab === 'checkin'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <QrCode className="w-4 h-4" /> Gate Pass Verification Tool
          </button>
          <button
            onClick={() => setActiveTab('bookings')}
            className={`pb-3 transition-colors border-b-2 flex items-center gap-2 ${
              activeTab === 'bookings'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <Ticket className="w-4 h-4" /> Master Bookings Registry ({bookings.length})
          </button>
        </div>

        {/* TAB 1: GATE PASS VERIFICATION TOOL */}
        {activeTab === 'checkin' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Input card */}
            <div className="lg:col-span-1 bg-stone-900 border border-stone-800 rounded-3xl p-6 space-y-5">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-400">
                  <Shield className="w-4 h-4" /> Park Gate Entry Checkpoint
                </div>
                <h3 className="text-lg font-bold text-stone-100">Scan or Enter Permit</h3>
                <p className="text-xs text-stone-400">
                  Enter the official NTCA voucher code (e.g. WT-2026-88421) presented by the traveler to grant gate barrier clearance.
                </p>
              </div>

              <div className="space-y-3">
                <label className="block text-xs text-stone-300 font-medium">Voucher Reference Code</label>
                <div className="relative">
                  <Ticket className="absolute left-3.5 top-3 w-4 h-4 text-stone-500" />
                  <input
                    type="text"
                    value={scanRef}
                    onChange={(e) => setScanRef(e.target.value.toUpperCase())}
                    placeholder="WT-2026-XXXXX"
                    className="w-full pl-10 pr-3 py-2.5 bg-stone-950 border border-stone-700 rounded-xl text-sm font-mono text-amber-300 uppercase tracking-wider focus:outline-none focus:border-amber-500"
                  />
                </div>

                <button
                  onClick={() => handleVerifyGatePass()}
                  disabled={verifying || !scanRef}
                  className="w-full py-3 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-stone-950 font-bold rounded-xl text-xs transition flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-amber-950/40"
                >
                  {verifying ? (
                    <span className="w-4 h-4 border-2 border-stone-950 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" /> Verify Permit & Admit Vehicle
                    </>
                  )}
                </button>
              </div>

              <div className="pt-4 border-t border-stone-800 space-y-2">
                <span className="text-[11px] text-stone-400 font-semibold uppercase tracking-wider block">
                  Quick Test Codes:
                </span>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => { setScanRef('WT-2026-88421'); handleVerifyGatePass('WT-2026-88421'); }}
                    className="text-xs px-2.5 py-1 bg-stone-950 border border-stone-700 hover:border-amber-500 rounded-lg text-amber-300 font-mono transition"
                  >
                    WT-2026-88421 (Tadoba)
                  </button>
                  {bookings.slice(0, 3).map((b) => (
                    <button
                      key={b.id}
                      onClick={() => { setScanRef(b.bookingRef); handleVerifyGatePass(b.bookingRef); }}
                      className="text-xs px-2.5 py-1 bg-stone-950 border border-stone-700 hover:border-amber-500 rounded-lg text-stone-300 font-mono transition"
                    >
                      {b.bookingRef}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Verification Result Inspection Card */}
            <div className="lg:col-span-2 bg-stone-900 border border-stone-800 rounded-3xl p-6 flex flex-col justify-between">
              {verificationResult ? (
                <div className="space-y-6">
                  {/* Status Banner */}
                  <div
                    className={`p-4 rounded-2xl border flex items-start gap-3 ${
                      verificationResult.success
                        ? verificationResult.alreadyCheckedIn
                          ? 'bg-blue-950/50 border-blue-800 text-blue-200'
                          : 'bg-emerald-950/60 border-emerald-600 text-emerald-200'
                        : 'bg-red-950/50 border-red-800 text-red-200'
                    }`}
                  >
                    {verificationResult.success ? (
                      <CheckCircle2 className="w-6 h-6 shrink-0 mt-0.5 text-emerald-400" />
                    ) : (
                      <AlertTriangle className="w-6 h-6 shrink-0 mt-0.5 text-red-400" />
                    )}
                    <div>
                      <h4 className="font-bold text-sm">
                        {verificationResult.success
                          ? verificationResult.alreadyCheckedIn
                            ? 'Gate Status: Traveler Already Admitted Earlier'
                            : 'Gate Status: PERMIT VERIFIED — ENTRY AUTHORIZED'
                          : 'Gate Status: ACCESS DENIED'}
                      </h4>
                      <p className="text-xs mt-0.5 opacity-90">{verificationResult.message}</p>
                    </div>
                  </div>

                  {/* Booking Manifest Data */}
                  {verificationResult.booking && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-stone-950 p-4 rounded-2xl border border-stone-800 text-xs">
                        <div>
                          <span className="text-stone-500 block">Tiger Reserve:</span>
                          <span className="font-bold text-stone-200">{verificationResult.booking.safariName}</span>
                        </div>
                        <div>
                          <span className="text-stone-500 block">Designated Zone:</span>
                          <span className="font-bold text-emerald-400">{verificationResult.booking.zoneName}</span>
                        </div>
                        <div>
                          <span className="text-stone-500 block">Entry Barrier Gate:</span>
                          <span className="font-bold text-stone-200">{verificationResult.booking.entryGate}</span>
                        </div>
                        <div>
                          <span className="text-stone-500 block">Date & Shift:</span>
                          <span className="font-bold text-stone-200">
                            {verificationResult.booking.date} ({verificationResult.booking.shiftTime})
                          </span>
                        </div>
                        <div>
                          <span className="text-stone-500 block">Vehicle Allocation:</span>
                          <span className="font-bold text-amber-300">{verificationResult.booking.vehicleType}</span>
                        </div>
                        <div>
                          <span className="text-stone-500 block">Traveler Count:</span>
                          <span className="font-bold text-stone-200">{verificationResult.booking.guestsCount} Persons</span>
                        </div>
                      </div>

                      {/* Traveler Manifest for Physical Verification */}
                      <div className="bg-stone-950 p-4 rounded-2xl border border-stone-800 space-y-2">
                        <span className="text-xs font-bold text-stone-300 block uppercase tracking-wider">
                          Physical ID Verification Manifest (Forest Gate Inspector Check):
                        </span>
                        <div className="space-y-1.5 text-xs">
                          <div className="p-2.5 bg-stone-900 rounded-xl border border-stone-800 flex items-center justify-between">
                            <div>
                              <strong className="text-stone-100">{verificationResult.booking.leadGuest?.fullName}</strong>
                              <span className="text-stone-400 ml-2">({verificationResult.booking.leadGuest?.idType || 'Aadhaar'})</span>
                            </div>
                            <span className="font-mono text-amber-300 font-bold">
                              {verificationResult.booking.leadGuest?.idNumber}
                            </span>
                          </div>
                          {verificationResult.booking.accompanyingGuests?.map((g, idx) => (
                            <div key={idx} className="p-2.5 bg-stone-900 rounded-xl border border-stone-800 flex items-center justify-between">
                              <span className="text-stone-300">{g.name} ({g.gender}, Age {g.age})</span>
                              <span className="text-stone-500 text-[11px]">Accompanying Guest</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center p-8 text-center text-stone-500 space-y-3">
                  <QrCode className="w-12 h-12 text-stone-700" />
                  <h4 className="text-sm font-semibold text-stone-400">Scanner Ready & Standby</h4>
                  <p className="text-xs max-w-sm">
                    Enter or scan any expedition gate permit voucher from the left panel to inspect lead traveler credentials and dispatch the assigned 4x4 Gypsy.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: MASTER BOOKINGS REGISTRY TABLE */}
        {activeTab === 'bookings' && (
          <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 w-4 h-4 text-stone-500" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && loadDashboardData()}
                    placeholder="Search by ref or guest..."
                    className="pl-9 pr-3 py-2 bg-stone-950 border border-stone-700 rounded-xl text-xs text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div className="flex items-center gap-2 text-xs text-stone-400">
                  <Filter className="w-3.5 h-3.5 text-amber-500" />
                  <div className="flex bg-stone-900 border border-stone-800 rounded-xl p-1 gap-1">
                    {[
                      { id: 'ALL', label: 'All' },
                      { id: 'CONFIRMED', label: 'Valid' },
                      { id: 'CHECKED_IN', label: 'Admitted' },
                      { id: 'CANCELLED', label: 'Void' }
                    ].map((st) => (
                      <button
                        key={st.id}
                        type="button"
                        onClick={() => setStatusFilter(st.id)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition cursor-pointer ${
                          statusFilter === st.id
                            ? 'bg-amber-600 text-stone-950 font-bold shadow-xs'
                            : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800'
                        }`}
                      >
                        {st.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <span className="text-xs text-stone-400">
                Displaying <strong>{bookings.length}</strong> recorded permits
              </span>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-stone-800 text-stone-400 uppercase tracking-wider text-[11px]">
                    <th className="pb-3 font-semibold">Permit Ref</th>
                    <th className="pb-3 font-semibold">Lead Guest</th>
                    <th className="pb-3 font-semibold">Reserve & Zone</th>
                    <th className="pb-3 font-semibold">Expedition Date</th>
                    <th className="pb-3 font-semibold">Vehicle</th>
                    <th className="pb-3 font-semibold">Amount</th>
                    <th className="pb-3 font-semibold">Status</th>
                    <th className="pb-3 font-semibold text-right">Gate Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-800/60">
                  {bookings.map((b) => (
                    <tr key={b.id} className="hover:bg-stone-800/40 transition">
                      <td className="py-3 font-mono font-bold text-amber-300">
                        {b.bookingRef}
                      </td>
                      <td className="py-3 text-stone-200 font-medium">
                        {b.leadGuest?.fullName || 'Traveler'}
                        <span className="block text-[11px] text-stone-500">{b.userEmail}</span>
                      </td>
                      <td className="py-3">
                        <span className="text-stone-200 font-medium">{b.safariName}</span>
                        <span className="block text-[11px] text-stone-500">{b.zoneName}</span>
                      </td>
                      <td className="py-3 text-stone-300">
                        {b.date}
                        <span className="block text-[11px] text-stone-500">{b.shiftTime?.split('–')[0]}</span>
                      </td>
                      <td className="py-3 text-stone-300">{b.vehicleType}</td>
                      <td className="py-3 font-semibold text-emerald-400">
                        ₹{b.totalAmount.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            b.status === 'CONFIRMED'
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/50'
                              : b.status === 'CHECKED_IN'
                              ? 'bg-blue-950 text-blue-400 border border-blue-800/50'
                              : 'bg-red-950 text-red-400 border border-red-800/50'
                          }`}
                        >
                          {b.status}
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        {b.status === 'CONFIRMED' ? (
                          <button
                            onClick={() => {
                              setScanRef(b.bookingRef);
                              setActiveTab('checkin');
                              handleVerifyGatePass(b.bookingRef);
                            }}
                            className="px-2.5 py-1 bg-amber-600/20 hover:bg-amber-600/40 border border-amber-600/40 text-amber-300 font-semibold rounded-lg text-[11px] transition cursor-pointer"
                          >
                            Check-In Pass
                          </button>
                        ) : (
                          <span className="text-stone-600 text-[11px]">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
