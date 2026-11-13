import React, { useState } from 'react';
import { useBooking } from '../context/BookingContext';
import {
  CalendarCheck,
  MapPin,
  Clock,
  ShieldCheck,
  Download,
  Printer,
  Trash2,
  CheckCircle2,
  AlertCircle,
  QrCode,
  FileText,
  Compass,
  ArrowRight
} from 'lucide-react';

export default function MySafariPage({ onExploreMore, onSelectSafari }) {
  const { bookings, cancelBooking, showToast } = useBooking();
  const [activeBookingId, setActiveBookingId] = useState(bookings[0]?.id || null);

  const selectedBooking = bookings.find(b => b.id === activeBookingId) || bookings[0];

  const handlePrint = () => {
    window.print();
    showToast("Opening print dialogue for Official Forest Permit Pass", "info");
  };

  if (!bookings || bookings.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-20 h-20 rounded-full bg-[#FAF8F2] border border-[#E9DFC9] flex items-center justify-center text-4xl mx-auto">
          🐅
        </div>
        <h2 className="font-serif text-3xl font-bold text-[#0D2922]">
          No Upcoming Safaris Yet
        </h2>
        <p className="text-xs sm:text-sm text-stone-500 max-w-md mx-auto">
          You haven't reserved any jungle expeditions. Browse our verified reserves or take our quick Safari Finder quiz to reserve your gate permit.
        </p>
        <button
          onClick={onExploreMore}
          className="px-6 py-3 rounded-2xl bg-[#0D2922] text-white font-bold text-xs sm:text-sm inline-flex items-center gap-2 hover:bg-[#173F35] transition"
        >
          <span>Find & Book a Safari</span>
          <ArrowRight className="w-4 h-4 text-[#C99A4A]" />
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold uppercase tracking-wider mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Digital Permit Dashboard</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#0D2922]">
            My Safari Passes & Itinerary
          </h1>
        </div>

        <button
          onClick={handlePrint}
          className="px-4 py-2 rounded-xl bg-white border border-[#E9DFC9] text-xs font-bold text-stone-700 hover:bg-[#FAF8F2] flex items-center gap-2 self-start sm:self-auto shadow-sm"
        >
          <Printer className="w-4 h-4 text-[#C99A4A]" />
          <span>Print Gate Permit Slip</span>
        </button>
      </div>

      {/* Main Container: Ticket & Details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Boarding Pass Ticket View */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Boarding Pass Style Card */}
          <div className="bg-white rounded-3xl border-2 border-[#173F35] shadow-xl overflow-hidden relative">
            
            {/* Ticket Header */}
            <div className="bg-[#0D2922] text-white p-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#C99A4A] flex items-center justify-center text-xl">
                  🐅
                </div>
                <div>
                  <h3 className="font-serif font-bold text-lg text-white">WildTrail Forest Permit</h3>
                  <p className="text-[11px] text-[#E9DFC9]/80 font-mono">PASS #{selectedBooking.id}</p>
                </div>
              </div>

              <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-emerald-700/80 text-emerald-200 uppercase tracking-wider">
                Confirmed
              </span>
            </div>

            {/* Ticket Body */}
            <div className="p-6 sm:p-8 space-y-6">
              
              <div>
                <p className="text-xs uppercase font-bold text-[#C99A4A] tracking-wider">Sanctuary & Zone</p>
                <h2 className="font-serif text-2xl font-bold text-[#0D2922] mt-0.5">
                  {selectedBooking.safariName}
                </h2>
                <p className="text-xs text-stone-600 flex items-center gap-1.5 mt-1">
                  <MapPin className="w-3.5 h-3.5 text-stone-400" />
                  {selectedBooking.zone} · Entry Gate: {selectedBooking.gate}
                </p>
              </div>

              {/* Grid Info */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 p-4 rounded-2xl bg-[#FAF8F2] border border-[#E9DFC9]">
                <div>
                  <p className="text-[10px] uppercase font-bold text-stone-400">Date</p>
                  <p className="text-xs font-bold text-stone-800 mt-0.5">{selectedBooking.date}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-stone-400">Shift</p>
                  <p className="text-xs font-bold text-stone-800 mt-0.5">{selectedBooking.slot.title}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-stone-400">Reporting Time</p>
                  <p className="text-xs font-bold text-emerald-700 mt-0.5">05:15 AM Sharp</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-stone-400">Vehicle Type</p>
                  <p className="text-xs font-bold text-stone-800 mt-0.5">{selectedBooking.slot.type}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-stone-400">Travelers</p>
                  <p className="text-xs font-bold text-stone-800 mt-0.5">
                    {selectedBooking.adults} Adults {selectedBooking.children > 0 ? `, ${selectedBooking.children} Kids` : ''}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-stone-400">Total Paid</p>
                  <p className="text-xs font-bold text-[#0D2922] mt-0.5">₹{selectedBooking.totalAmount.toLocaleString('en-IN')}</p>
                </div>
              </div>

              {/* QR Code and Gate Verification Mock */}
              <div className="pt-4 border-t border-dashed border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 bg-stone-100 rounded-xl border border-stone-300 flex items-center justify-center p-2">
                    {/* SVG barcode/qr simulation */}
                    <div className="grid grid-cols-4 gap-1 w-full h-full">
                      <div className="bg-stone-800" />
                      <div className="bg-transparent" />
                      <div className="bg-stone-800" />
                      <div className="bg-stone-800" />
                      <div className="bg-transparent" />
                      <div className="bg-stone-800" />
                      <div className="bg-transparent" />
                      <div className="bg-stone-800" />
                      <div className="bg-stone-800" />
                      <div className="bg-stone-800" />
                      <div className="bg-transparent" />
                      <div className="bg-stone-800" />
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-mono font-bold text-stone-800">
                      {selectedBooking.permitNumber || "PERMIT-VERIFIED-2026"}
                    </p>
                    <p className="text-[11px] text-stone-500">Scan at Gate Security Terminal</p>
                  </div>
                </div>

                <div className="text-right">
                  <button
                    onClick={() => cancelBooking(selectedBooking.id)}
                    className="px-3.5 py-1.5 rounded-xl border border-rose-300 dark:border-rose-900/60 bg-rose-50/50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/40 text-xs font-bold flex items-center gap-1.5 transition shadow-sm active:scale-95"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Cancel Booking</span>
                  </button>
                </div>
              </div>

            </div>
          </div>

          {/* Packing & Gate Instructions */}
          <div className="bg-white rounded-3xl p-6 border border-[#E9DFC9] space-y-3">
            <h4 className="font-bold text-xs uppercase tracking-wider text-stone-700 dark:text-[#728D81]">
              Expedition Gate Checklist
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-stone-600 dark:text-[#A8C4B8]">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Original Government Photo IDs for all guests</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>E-pass or physical printed pass copy</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Warm jacket/fleece for dawn morning drive</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Camouflage/earth colored attire</span>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: Hour-by-Hour Itinerary Timeline */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-8 border border-[#E9DFC9] shadow-sm space-y-6">
          <div>
            <div className="inline-flex items-center gap-1.5 text-[#C99A4A] text-xs font-bold uppercase tracking-wider mb-1">
              <Clock className="w-3.5 h-3.5" />
              <span>Hour-by-Hour Schedule</span>
            </div>
            <h3 className="font-serif text-2xl font-bold text-[#0D2922] dark:text-[#F1F8F4]">
              Your Safari Itinerary
            </h3>
            <p className="text-xs text-stone-500 dark:text-[#728D81] mt-0.5">
              Strict timings enforced by State Forest Department regulations
            </p>
          </div>

          {/* Timeline steps */}
          <div className="relative space-y-6">
            {/* Continuous vertical line mathematically centered through dots */}
            <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-[#C99A4A]/40 dark:bg-[#C99A4A]/50 -translate-x-1/2 pointer-events-none" />

            {selectedBooking.itinerary?.map((step, idx) => (
              <div key={idx} className="flex items-start gap-3.5 relative group">
                {/* High contrast timeline marker dot - centered on the vertical line */}
                <div className="relative z-10 flex-shrink-0 w-[22px] h-[22px] flex items-center justify-center">
                  <div className="w-3.5 h-3.5 rounded-full bg-[#C99A4A] ring-4 ring-[#FAF8F2] dark:ring-[#0D201A] shadow-sm flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#0D2922] dark:bg-white" />
                  </div>
                </div>

                <div className="space-y-0.5 pt-0.5 min-w-0">
                  <span className="font-mono text-xs font-bold text-[#C99A4A] block">
                    {step.time}
                  </span>
                  <h4 className="font-bold text-xs sm:text-sm text-[#0D2922] dark:text-[#F1F8F4]">
                    {step.title}
                  </h4>
                  <p className="text-xs text-stone-600 dark:text-[#A8C4B8] leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 rounded-2xl bg-[#FAF8F2] dark:bg-white/5 border border-[#E9DFC9] dark:border-[#1A382F] text-xs text-stone-600 dark:text-[#C7D7D0] space-y-1">
            <p className="font-bold text-[#0D2922] dark:text-[#F1F8F4]">Have questions about your schedule?</p>
            <p>Click the 🦜 <strong className="text-[#C99A4A] font-bold">Ask Ranger</strong> assistant button below to speak directly with an active naturalist.</p>
          </div>
        </div>

      </div>

    </div>
  );
}
