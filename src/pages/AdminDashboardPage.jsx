import React, { useState, useEffect, useCallback } from 'react';
import { 
  Shield, CheckCircle2, AlertTriangle, Search, Filter, 
  Users, DollarSign, Ticket, ArrowLeft, RefreshCw, 
  QrCode
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
      <div className="min-h-[85vh] flex items-center justify-center px-4 py-16 bg-[#071713] text-[#F0ECE1]">
        <div className="max-w-md w-full text-center space-y-6 p-8 bg-[#0B221B] border border-[#C99A4A]/45 rounded-2xl shadow-2xl">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-[#113127] border border-[#C99A4A]/50 flex items-center justify-center text-[#E4B865]">
            <Shield className="w-8 h-8" />
          </div>
          <div>
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#E4B865]">Restricted Territory</span>
            <h2 className="text-2xl font-serif font-bold text-[#F8F3E8] mt-1">NTCA Ranger Admin Portal</h2>
            <p className="text-xs text-[#B8CEC4] mt-2 leading-relaxed">
              This administrative gate terminal requires authorized Forest Department credentials for park quota management and gate clearance.
            </p>
          </div>

          <div className="space-y-3 pt-2">
            <button
              type="button"
              onClick={async () => {
                await quickDemoLogin('admin');
                showToast('Authorized as Chief Warden (NTCA Gate Desk)', 'success');
              }}
              className="w-full py-3 px-4 bg-[#C99A4A] hover:bg-[#D8AA5B] font-bold text-[#0D2922] rounded-xl transition shadow-md flex items-center justify-center gap-2 cursor-pointer text-sm"
            >
              <Shield className="w-4 h-4" /> Enter Chief Warden Gate Terminal
            </button>
            <button
              type="button"
              onClick={() => openAuthModal('login')}
              className="w-full py-2.5 px-4 bg-[#113127] hover:bg-[#173F35] border border-[#265244] text-[#F4EBDA] text-xs font-medium rounded-xl transition cursor-pointer"
            >
              Sign In with Custom Officer Credentials
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#071713] text-[#F0ECE1] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Top Header & Breadcrumb */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#265244] pb-6">
          <div>
            <div className="flex items-center gap-2 text-xs text-[#9AB3A8] mb-1">
              <button
                type="button"
                onClick={() => onNavigate('home')}
                className="hover:text-[#E4B865] flex items-center gap-1 transition cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5 text-[#C99A4A]" /> Back to Public Site
              </button>
              <span>/</span>
              <span className="text-[#E4B865] font-semibold">Forest Department Control Room</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#F8F3E8] flex items-center gap-3">
              <Shield className="w-7 h-7 text-[#C99A4A]" />
              NTCA Ranger Operations Portal
            </h1>
            <p className="text-xs text-[#9AB3A8] mt-1">
              Active Officer: <strong className="text-[#F4EBDA]">{user.name}</strong> · Station:{' '}
              <span className="text-[#86EFAC] font-mono">Central Tiger Conservation Node</span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={loadDashboardData}
              disabled={loading}
              className="p-2.5 bg-[#0B221B] hover:bg-[#113127] border border-[#265244] rounded-xl text-[#C8D8D0] hover:text-white transition cursor-pointer"
              title="Refresh Operations Data"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <span className="px-3 py-1.5 rounded-full text-xs font-semibold bg-[#113227] text-[#86EFAC] border border-[#2A5949] flex items-center gap-1.5 font-mono">
              <span className="w-2 h-2 rounded-full bg-[#86EFAC]" /> Live Registry
            </span>
          </div>
        </div>

        {/* Real-time KPI Stats Grid */}
        {stats && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-[#0B221B] border border-[#265244] p-5 rounded-2xl shadow-sm">
              <div className="flex items-center justify-between text-[#9AB3A8] mb-2">
                <span className="text-xs uppercase tracking-wider font-semibold font-mono">Total Permits</span>
                <Ticket className="w-4 h-4 text-[#86EFAC]" />
              </div>
              <div className="text-2xl font-bold font-mono tabular-nums text-[#F8F3E8]">{stats.totalBookings}</div>
              <span className="text-xs text-[#86EFAC] mt-1 block">
                {stats.confirmedBookings} confirmed and valid
              </span>
            </div>

            <div className="bg-[#0B221B] border border-[#265244] p-5 rounded-2xl shadow-sm">
              <div className="flex items-center justify-between text-[#9AB3A8] mb-2">
                <span className="text-xs uppercase tracking-wider font-semibold font-mono">Park Revenue</span>
                <DollarSign className="w-4 h-4 text-[#C99A4A]" />
              </div>
              <div className="text-2xl font-bold font-mono tabular-nums text-[#E4B865]">
                ₹{stats.totalRevenue.toLocaleString('en-IN')}
              </div>
              <span className="text-xs text-[#9AB3A8] mt-1 block">
                Allocated to Tiger Conservation Fund
              </span>
            </div>

            <div className="bg-[#0B221B] border border-[#265244] p-5 rounded-2xl shadow-sm">
              <div className="flex items-center justify-between text-[#9AB3A8] mb-2">
                <span className="text-xs uppercase tracking-wider font-semibold font-mono">Admitted at Gate</span>
                <CheckCircle2 className="w-4 h-4 text-[#7CD6D3]" />
              </div>
              <div className="text-2xl font-bold font-mono tabular-nums text-[#7CD6D3]">{stats.checkedInBookings}</div>
              <span className="text-xs text-[#9AB3A8] mt-1 block">
                Checked in via QR or Voucher Code
              </span>
            </div>

            <div className="bg-[#0B221B] border border-[#265244] p-5 rounded-2xl shadow-sm">
              <div className="flex items-center justify-between text-[#9AB3A8] mb-2">
                <span className="text-xs uppercase tracking-wider font-semibold font-mono">Registered Travelers</span>
                <Users className="w-4 h-4 text-[#C99A4A]" />
              </div>
              <div className="text-2xl font-bold font-mono tabular-nums text-[#E4B865]">{stats.totalUsers}</div>
              <span className="text-xs text-[#9AB3A8] mt-1 block">
                Verified government IDs on file
              </span>
            </div>
          </div>
        )}

        {/* Operations Navigation Tabs */}
        <div className="flex border-b border-[#265244] space-x-6 text-sm font-medium">
          <button
            type="button"
            onClick={() => setActiveTab('checkin')}
            className={`pb-3 transition-colors border-b-2 flex items-center gap-2 cursor-pointer ${
              activeTab === 'checkin'
                ? 'border-[#C99A4A] text-[#E4B865] font-bold'
                : 'border-transparent text-[#9AB3A8] hover:text-[#F4EBDA]'
            }`}
          >
            <QrCode className="w-4 h-4" /> Gate Pass Verification Tool
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('bookings')}
            className={`pb-3 transition-colors border-b-2 flex items-center gap-2 cursor-pointer ${
              activeTab === 'bookings'
                ? 'border-[#C99A4A] text-[#E4B865] font-bold'
                : 'border-transparent text-[#9AB3A8] hover:text-[#F4EBDA]'
            }`}
          >
            <Ticket className="w-4 h-4" /> Master Bookings Registry ({bookings.length})
          </button>
        </div>

        {/* TAB 1: GATE PASS VERIFICATION TOOL */}
        {activeTab === 'checkin' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Input card */}
            <div className="lg:col-span-1 bg-[#0B221B] border border-[#265244] rounded-2xl p-6 space-y-5 shadow-sm">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#E4B865] font-mono">
                  <Shield className="w-4 h-4" /> Park Gate Entry Checkpoint
                </div>
                <h2 className="text-lg font-bold font-serif text-[#F8F3E8]">Scan or Enter Permit</h2>
                <p className="text-xs text-[#9AB3A8]">
                  Enter the official NTCA voucher code (such as WT-2026-88421) presented by the traveler to grant gate barrier clearance.
                </p>
              </div>

              <div className="space-y-3">
                <label htmlFor="gate-voucher-code" className="block text-xs text-[#C8D8D0] font-medium">Voucher Reference Code</label>
                <div className="relative">
                  <Ticket className="absolute left-3.5 top-3 w-4 h-4 text-[#9AB3A8]" />
                  <input
                    id="gate-voucher-code"
                    type="text"
                    value={scanRef}
                    onChange={(e) => setScanRef(e.target.value.toUpperCase())}
                    placeholder="WT-2026-XXXXX"
                    className="w-full pl-10 pr-3 py-2.5 bg-[#071713] border border-[#265244] rounded-xl text-sm font-mono text-[#E4B865] uppercase tracking-wider focus:outline-none focus:border-[#C99A4A]"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => handleVerifyGatePass()}
                  disabled={verifying || !scanRef}
                  className="w-full py-3 bg-[#C99A4A] hover:bg-[#D8AA5B] disabled:opacity-50 text-[#0D2922] font-bold rounded-xl text-xs transition flex items-center justify-center gap-2 cursor-pointer shadow-md"
                >
                  {verifying ? (
                    <span className="w-4 h-4 border-2 border-[#0D2922] border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" /> Verify Permit &amp; Admit Vehicle
                    </>
                  )}
                </button>
              </div>

              <div className="pt-4 border-t border-[#265244] space-y-2">
                <span className="text-xs text-[#9AB3A8] font-semibold uppercase tracking-wider block font-mono">
                  Quick Test Codes:
                </span>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => { setScanRef('WT-2026-88421'); handleVerifyGatePass('WT-2026-88421'); }}
                    className="text-xs px-2.5 py-1 bg-[#071713] border border-[#265244] hover:border-[#C99A4A] rounded-lg text-[#E4B865] font-mono transition cursor-pointer"
                  >
                    WT-2026-88421 (Tadoba)
                  </button>
                  {bookings.slice(0, 3).map((b) => (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => { setScanRef(b.bookingRef); handleVerifyGatePass(b.bookingRef); }}
                      className="text-xs px-2.5 py-1 bg-[#071713] border border-[#265244] hover:border-[#C99A4A] rounded-lg text-[#C8D8D0] font-mono transition cursor-pointer"
                    >
                      {b.bookingRef}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Verification Result Inspection Card */}
            <div className="lg:col-span-2 bg-[#0B221B] border border-[#265244] rounded-2xl p-6 flex flex-col justify-between shadow-sm">
              {verificationResult ? (
                <div className="space-y-6">
                  {/* Status Banner */}
                  <div
                    className={`p-4 rounded-xl border flex items-start gap-3 ${
                      verificationResult.success
                        ? verificationResult.alreadyCheckedIn
                          ? 'bg-[#0D2922] border-[#2A5949] text-[#7CD6D3]'
                          : 'bg-[#113227] border-[#2E6852] text-[#86EFAC]'
                        : 'bg-rose-950/50 border-rose-800 text-rose-200'
                    }`}
                  >
                    {verificationResult.success ? (
                      <CheckCircle2 className="w-6 h-6 shrink-0 mt-0.5 text-[#86EFAC]" />
                    ) : (
                      <AlertTriangle className="w-6 h-6 shrink-0 mt-0.5 text-rose-400" />
                    )}
                    <div>
                      <h3 className="font-bold text-sm">
                        {verificationResult.success
                          ? verificationResult.alreadyCheckedIn
                            ? 'Gate Status: Traveler Already Admitted Earlier'
                            : 'Gate Status: PERMIT VERIFIED (ENTRY AUTHORIZED)'
                          : 'Gate Status: ACCESS DENIED'}
                      </h3>
                      <p className="text-xs mt-0.5 opacity-90">{verificationResult.message}</p>
                    </div>
                  </div>

                  {/* Booking Manifest Data */}
                  {verificationResult.booking && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-[#071713] p-4 rounded-xl border border-[#265244] text-xs">
                        <div>
                          <span className="text-[#9AB3A8] block">Tiger Reserve:</span>
                          <span className="font-bold text-[#F8F3E8]">{verificationResult.booking.safariName}</span>
                        </div>
                        <div>
                          <span className="text-[#9AB3A8] block">Designated Zone:</span>
                          <span className="font-bold text-[#86EFAC]">{verificationResult.booking.zoneName}</span>
                        </div>
                        <div>
                          <span className="text-[#9AB3A8] block">Entry Barrier Gate:</span>
                          <span className="font-bold text-[#F8F3E8]">{verificationResult.booking.entryGate}</span>
                        </div>
                        <div>
                          <span className="text-[#9AB3A8] block">Date &amp; Shift:</span>
                          <span className="font-bold text-[#F8F3E8]">
                            {verificationResult.booking.date} ({verificationResult.booking.shiftTime})
                          </span>
                        </div>
                        <div>
                          <span className="text-[#9AB3A8] block">Vehicle Allocation:</span>
                          <span className="font-bold text-[#E4B865]">{verificationResult.booking.vehicleType}</span>
                        </div>
                        <div>
                          <span className="text-[#9AB3A8] block">Traveler Count:</span>
                          <span className="font-bold text-[#F8F3E8]">{verificationResult.booking.guestsCount} Persons</span>
                        </div>
                      </div>

                      {/* Traveler Manifest for Physical Verification */}
                      <div className="bg-[#071713] p-4 rounded-xl border border-[#265244] space-y-2">
                        <span className="text-xs font-bold text-[#C8D8D0] block uppercase tracking-wider font-mono">
                          Physical ID Verification Manifest (Forest Gate Inspector Check):
                        </span>
                        <div className="space-y-1.5 text-xs">
                          <div className="p-2.5 bg-[#0B221B] rounded-xl border border-[#265244] flex items-center justify-between">
                            <div>
                              <strong className="text-[#F8F3E8]">{verificationResult.booking.leadGuest?.fullName}</strong>
                              <span className="text-[#9AB3A8] ml-2">({verificationResult.booking.leadGuest?.idType || 'Aadhaar'})</span>
                            </div>
                            <span className="font-mono text-[#E4B865] font-bold">
                              {verificationResult.booking.leadGuest?.idNumber}
                            </span>
                          </div>
                          {verificationResult.booking.accompanyingGuests?.map((g, idx) => (
                            <div key={idx} className="p-2.5 bg-[#0B221B] rounded-xl border border-[#265244] flex items-center justify-between">
                              <span className="text-[#C8D8D0]">{g.name} ({g.gender}, Age {g.age})</span>
                              <span className="text-[#9AB3A8] text-xs">Accompanying Guest</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center p-8 text-center text-[#9AB3A8] space-y-3">
                  <QrCode className="w-12 h-12 text-[#265244]" />
                  <h4 className="text-sm font-semibold text-[#C8D8D0]">Scanner Ready &amp; Standby</h4>
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
          <div className="bg-[#0B221B] border border-[#265244] rounded-2xl p-6 space-y-6 shadow-sm">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 w-4 h-4 text-[#9AB3A8]" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && loadDashboardData()}
                    placeholder="Search by ref or guest..."
                    className="pl-9 pr-3 py-2 bg-[#071713] border border-[#265244] rounded-xl text-xs text-[#F8F3E8] placeholder-[#9AB3A8] focus:outline-none focus:border-[#C99A4A]"
                  />
                </div>
                <div className="flex items-center gap-2 text-xs text-[#9AB3A8]">
                  <Filter className="w-3.5 h-3.5 text-[#C99A4A]" />
                  <div className="flex bg-[#071713] border border-[#265244] rounded-xl p-1 gap-1">
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
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                          statusFilter === st.id
                            ? 'bg-[#C99A4A] text-[#0D2922] font-bold shadow-xs'
                            : 'text-[#9AB3A8] hover:text-[#F8F3E8] hover:bg-[#113127]'
                        }`}
                      >
                        {st.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <span className="text-xs text-[#9AB3A8]">
                Displaying <strong>{bookings.length}</strong> recorded permits
              </span>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#265244] text-[#9AB3A8] uppercase tracking-wider text-xs font-mono">
                    <th className="pb-3 font-semibold">Permit Ref</th>
                    <th className="pb-3 font-semibold">Lead Guest</th>
                    <th className="pb-3 font-semibold">Reserve &amp; Zone</th>
                    <th className="pb-3 font-semibold">Expedition Date</th>
                    <th className="pb-3 font-semibold">Vehicle</th>
                    <th className="pb-3 font-semibold">Amount</th>
                    <th className="pb-3 font-semibold">Status</th>
                    <th className="pb-3 font-semibold text-right">Gate Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#265244]/60">
                  {bookings.map((b) => (
                    <tr key={b.id} className="hover:bg-[#113127]/50 transition">
                      <td className="py-3 font-mono font-bold text-[#E4B865]">
                        {b.bookingRef}
                      </td>
                      <td className="py-3 text-[#F8F3E8] font-medium">
                        {b.leadGuest?.fullName || 'Traveler'}
                        <span className="block text-xs text-[#9AB3A8]">{b.userEmail}</span>
                      </td>
                      <td className="py-3">
                        <span className="text-[#F8F3E8] font-medium">{b.safariName}</span>
                        <span className="block text-xs text-[#9AB3A8]">{b.zoneName}</span>
                      </td>
                      <td className="py-3 text-[#C8D8D0] font-mono tabular-nums">
                        {b.date}
                        <span className="block text-xs text-[#9AB3A8]">{b.shiftTime?.split('–')[0]}</span>
                      </td>
                      <td className="py-3 text-[#C8D8D0]">{b.vehicleType}</td>
                      <td className="py-3 font-semibold font-mono tabular-nums text-[#86EFAC]">
                        ₹{b.totalAmount.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3">
                        <span
                          className={`px-2 py-0.5 rounded text-xs font-bold ${
                            b.status === 'CONFIRMED'
                              ? 'bg-[#113227] text-[#86EFAC] border border-[#2A5949]'
                              : b.status === 'CHECKED_IN'
                              ? 'bg-[#0D2922] text-[#7CD6D3] border border-[#1A4B4A]'
                              : 'bg-rose-950/60 text-rose-300 border border-rose-800/60'
                          }`}
                        >
                          {b.status}
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        {b.status === 'CONFIRMED' ? (
                          <button
                            type="button"
                            onClick={() => {
                              setScanRef(b.bookingRef);
                              setActiveTab('checkin');
                              handleVerifyGatePass(b.bookingRef);
                            }}
                            className="px-2.5 py-1 bg-[#C99A4A]/20 hover:bg-[#C99A4A]/40 border border-[#C99A4A]/50 text-[#E4B865] font-semibold rounded-lg text-xs transition cursor-pointer"
                          >
                            Check-In Pass
                          </button>
                        ) : (
                          <span className="text-[#9AB3A8] text-xs">Cleared</span>
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
