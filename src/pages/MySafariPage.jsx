import React, { useState } from 'react';
import { useBooking } from '../context/BookingContext';
import {
  MapPin,
  Clock,
  Printer,
  Trash2,
  CheckCircle2,
  Compass,
} from 'lucide-react';

export default function MySafariPage({ onExploreMore }) {
  const { bookings, cancelBooking, showToast } = useBooking();
  const [activeBookingId] = useState(bookings[0]?.id || null);

  const selectedBooking = bookings.find((b) => b.id === activeBookingId) || bookings[0];

  const handlePrint = () => {
    window.print();
    showToast('Opening print dialogue for Official Forest Permit Pass', 'info');
  };

  if (!bookings || bookings.length === 0) {
    return (
      <div className="min-h-screen">
        <section className="bg-gradient-to-b from-[#09211A] to-[#0D2922] border-b border-[#265244] text-[#F4EBDA]">
          <div className="max-w-4xl mx-auto px-4 py-12 text-center">
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#F8F3E8]">
              My Safari Passes &amp; Itinerary
            </h1>
            <p className="text-xs sm:text-sm text-[#C8D8D0] mt-2">
              Official NTCA digital gate vouchers and reporting schedules
            </p>
          </div>
        </section>

        <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-5">
          <div className="w-16 h-16 rounded-2xl bg-[#0D2922] border border-[#C99A4A]/50 text-[#E4B865] flex items-center justify-center mx-auto">
            <Compass className="w-7 h-7" />
          </div>
          <h2 className="font-serif text-2xl font-bold text-[#14261F] dark:text-[#F8F3E8]">
            No Active Safari Permits Yet
          </h2>
          <p className="text-xs sm:text-sm text-[#43564E] dark:text-[#B8CEC4] max-w-md mx-auto leading-relaxed">
            You have not reserved any jungle expeditions yet. Browse our six certified reserves or launch the Safari Finder to secure your official gate pass.
          </p>
          <button
            type="button"
            onClick={onExploreMore}
            className="px-6 py-3 rounded-xl bg-[#C99A4A] hover:bg-[#D8AA5B] text-[#0D2922] font-bold text-xs sm:text-sm inline-flex items-center gap-2 transition cursor-pointer shadow-md"
          >
            <span>Browse National Reserves</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Editorial Deep Canopy Emerald Header Strip */}
      <section className="bg-gradient-to-b from-[#09211A] to-[#0D2922] border-b border-[#265244] text-[#F4EBDA]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-9 sm:py-11 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#F8F3E8] tracking-tight">
              My Safari Passes &amp; Itinerary
            </h1>
            <p className="text-xs sm:text-sm text-[#C8D8D0] mt-1">
              NTCA digital gate permit voucher &amp; reporting itinerary
            </p>
          </div>

          <button
            type="button"
            onClick={handlePrint}
            className="px-4 py-2.5 rounded-xl bg-[#113127] hover:bg-[#173F35] border border-[#C99A4A]/50 text-xs font-bold text-[#F4EBDA] flex items-center gap-2 self-start sm:self-auto shadow-sm cursor-pointer"
          >
            <Printer className="w-4 h-4 text-[#E4B865]" />
            <span>Print Gate Permit Slip</span>
          </button>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Main Container: Ticket & Details */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Boarding Pass Ticket View */}
          <div className="lg:col-span-7 space-y-6">
            {/* Boarding Pass Style Card */}
            <div className="bg-[#FBF8F3] dark:bg-[#0B221B] rounded-2xl border-2 border-[#0D2922] dark:border-[#C99A4A]/60 shadow-xl overflow-hidden relative">
              {/* Ticket Header */}
              <div className="bg-[#09211A] text-[#F4EBDA] p-6 flex items-center justify-between border-b border-[#265244]">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-[#113227] border border-[#C99A4A]/55 flex items-center justify-center shrink-0">
                    <Compass className="w-5 h-5 text-[#E4B865]" />
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-lg text-[#F8F3E8]">
                      WildTrail Forest Permit
                    </h3>
                    <p className="text-xs text-[#E4B865] font-mono tabular-nums">
                      PASS #{selectedBooking.id}
                    </p>
                  </div>
                </div>

                <span className="px-3 py-1 rounded-lg text-xs font-bold bg-[#173F35] text-[#86EFAC] border border-[#4ADE80]/40 uppercase tracking-wider">
                  Confirmed
                </span>
              </div>

              {/* Ticket Body */}
              <div className="p-6 sm:p-8 space-y-6">
                <div>
                  <p className="text-xs uppercase font-mono font-bold text-[#B88428] dark:text-[#E4B865] tracking-wider">
                    Sanctuary &amp; Designated Zone
                  </p>
                  <h2 className="font-serif text-2xl font-bold text-[#14261F] dark:text-[#F8F3E8] mt-0.5">
                    {selectedBooking.safariName}
                  </h2>
                  <p className="text-xs text-[#43564E] dark:text-[#B8CEC4] flex items-center gap-1.5 mt-1">
                    <MapPin className="w-3.5 h-3.5 text-[#C99A4A]" />
                    {selectedBooking.zone} · Entry Gate: {selectedBooking.gate}
                  </p>
                </div>

                {/* Grid Info */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 p-4 rounded-xl bg-white dark:bg-[#071713] border border-[#D8CEBE] dark:border-[#265244]">
                  <div>
                    <p className="text-[11px] font-mono uppercase tracking-wider text-[#64776E] dark:text-[#88A398]">
                      Date
                    </p>
                    <p className="text-xs font-mono tabular-nums font-bold text-[#14261F] dark:text-[#F8F3E8] mt-0.5">
                      {selectedBooking.date}
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] font-mono uppercase tracking-wider text-[#64776E] dark:text-[#88A398]">
                      Shift
                    </p>
                    <p className="text-xs font-bold text-[#14261F] dark:text-[#F8F3E8] mt-0.5">
                      {selectedBooking.slot.title}
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] font-mono uppercase tracking-wider text-[#64776E] dark:text-[#88A398]">
                      Reporting Time
                    </p>
                    <p className="text-xs font-mono tabular-nums font-bold text-emerald-700 dark:text-[#86EFAC] mt-0.5">
                      05:15 AM Sharp
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] font-mono uppercase tracking-wider text-[#64776E] dark:text-[#88A398]">
                      Vehicle Type
                    </p>
                    <p className="text-xs font-bold text-[#14261F] dark:text-[#F8F3E8] mt-0.5">
                      {selectedBooking.slot.type}
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] font-mono uppercase tracking-wider text-[#64776E] dark:text-[#88A398]">
                      Travelers
                    </p>
                    <p className="text-xs font-bold text-[#14261F] dark:text-[#F8F3E8] mt-0.5">
                      {selectedBooking.adults} Adults{' '}
                      {selectedBooking.children > 0 ? `, ${selectedBooking.children} Kids` : ''}
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] font-mono uppercase tracking-wider text-[#64776E] dark:text-[#88A398]">
                      Total Paid
                    </p>
                    <p className="text-xs font-mono tabular-nums font-bold text-[#0D2922] dark:text-[#E4B865] mt-0.5">
                      ₹{selectedBooking.totalAmount.toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>

                {/* QR Code and Gate Verification */}
                <div className="pt-4 border-t border-dashed border-[#D8CEBE] dark:border-[#265244] flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-16 bg-white rounded-xl border border-[#D8CEBE] flex items-center justify-center p-2">
                      <div className="grid grid-cols-4 gap-1 w-full h-full">
                        <div className="bg-[#0D2922]" />
                        <div className="bg-transparent" />
                        <div className="bg-[#0D2922]" />
                        <div className="bg-[#0D2922]" />
                        <div className="bg-transparent" />
                        <div className="bg-[#0D2922]" />
                        <div className="bg-transparent" />
                        <div className="bg-[#0D2922]" />
                        <div className="bg-[#0D2922]" />
                        <div className="bg-[#0D2922]" />
                        <div className="bg-transparent" />
                        <div className="bg-[#0D2922]" />
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-mono font-bold text-[#14261F] dark:text-[#F8F3E8]">
                        {selectedBooking.permitNumber || 'PERMIT-VERIFIED-2026'}
                      </p>
                      <p className="text-xs text-[#43564E] dark:text-[#9AB3A8]">
                        Scan at Forest Gate Security Terminal
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <button
                      type="button"
                      onClick={() => cancelBooking(selectedBooking.id)}
                      className="px-3.5 py-2 rounded-xl border border-rose-300 dark:border-rose-800/70 bg-rose-50/60 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900/40 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Cancel Permit</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Packing & Gate Instructions */}
            <div className="bg-[#FBF8F3] dark:bg-[#0B221B] rounded-2xl p-6 border border-[#D8CEBE] dark:border-[#244E40] space-y-3">
              <h4 className="font-bold text-xs uppercase tracking-wider text-[#43564E] dark:text-[#E4B865]">
                Mandatory Gate Entry Checklist
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-[#43564E] dark:text-[#C8D8D0]">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#C99A4A] shrink-0" />
                  <span>Original Government Photo IDs for all guests</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#C99A4A] shrink-0" />
                  <span>Digital QR pass or printed voucher slip</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#C99A4A] shrink-0" />
                  <span>Warm layer for 5:15 AM open-Gypsy drive</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#C99A4A] shrink-0" />
                  <span>Muted earth/olive safari attire</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Hour-by-Hour Itinerary Timeline */}
          <div className="lg:col-span-5 bg-[#FBF8F3] dark:bg-[#0B221B] rounded-2xl p-6 sm:p-8 border border-[#D8CEBE] dark:border-[#244E40] shadow-sm space-y-6">
            <div>
              <div className="inline-flex items-center gap-1.5 text-[#B88428] dark:text-[#E4B865] text-xs font-mono font-bold uppercase tracking-wider mb-1">
                <Clock className="w-3.5 h-3.5 text-[#C99A4A]" />
                <span>Hour-by-Hour Schedule</span>
              </div>
              <h3 className="font-serif text-2xl font-bold text-[#14261F] dark:text-[#F8F3E8]">
                Your Safari Itinerary
              </h3>
              <p className="text-xs text-[#43564E] dark:text-[#9AB3A8] mt-0.5">
                Strict gate timings enforced by State Forest Department regulations
              </p>
            </div>

            {/* Timeline steps */}
            <div className="relative space-y-6">
              <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-[#C99A4A]/45 -translate-x-1/2 pointer-events-none" />

              {selectedBooking.itinerary?.map((step, idx) => (
                <div key={idx} className="flex items-start gap-3.5 relative">
                  <div className="relative z-10 shrink-0 w-[22px] h-[22px] flex items-center justify-center">
                    <div className="w-3.5 h-3.5 rounded-full bg-[#C99A4A] ring-4 ring-[#FBF8F3] dark:ring-[#0B221B] shadow-sm flex items-center justify-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#0D2922]" />
                    </div>
                  </div>

                  <div className="space-y-0.5 pt-0.5 min-w-0">
                    <span className="font-mono tabular-nums text-xs font-bold text-[#B88428] dark:text-[#E4B865] block">
                      {step.time}
                    </span>
                    <h4 className="font-bold text-xs sm:text-sm text-[#14261F] dark:text-[#F8F3E8]">
                      {step.title}
                    </h4>
                    <p className="text-xs text-[#43564E] dark:text-[#B8CEC4] leading-relaxed">
                      {step.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 rounded-xl bg-[#EFE6D7] dark:bg-[#113127] border border-[#D8CEBE] dark:border-[#265244] text-xs text-[#43564E] dark:text-[#C8D8D0] space-y-1">
              <p className="font-bold text-[#14261F] dark:text-[#F8F3E8]">
                Have questions about your gate reporting time?
              </p>
              <p>
                Open the <strong className="text-[#B88428] dark:text-[#E4B865] font-bold">Ask Ranger</strong> field desk button in the bottom-right corner to consult our expedition naturalist.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
