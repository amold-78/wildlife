import React, { useState } from 'react';
import { SAFARIS } from '../data/safaris';
import { useBooking } from '../context/BookingContext';
import confetti from 'canvas-confetti';
import {
  Calendar,
  Clock,
  Users,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  CreditCard,
  AlertCircle,
  Check
} from 'lucide-react';

export default function BookingFlowPage({ safariId, initialSlot, onBookingCompleted, onCancel }) {
  const { addBooking } = useBooking();
  const safari = SAFARIS.find(s => s.id === safariId) || SAFARIS[0];

  // Multi-step booking state
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState("2026-10-18");
  const [selectedSlot, setSelectedSlot] = useState(initialSlot || safari.slots[0]);
  const [selectedZone, setSelectedZone] = useState(safari.zones[0]?.name || "Moharli Zone");
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);

  // Traveler info
  const [primaryTraveler, setPrimaryTraveler] = useState({
    name: "Sahil Verma",
    email: "sahil@wildtrail.dev",
    phone: "+91 98765 43210",
    idType: "Aadhaar Card",
    idNumber: "4829-1920-5812"
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Calculations
  const pricePerAdult = selectedSlot.price;
  const pricePerChild = Math.round(selectedSlot.price * 0.6);
  const baseTotal = (adults * pricePerAdult) + (children * pricePerChild);
  const conservationCess = 450;
  const grandTotal = baseTotal + conservationCess;

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (e) {
      // fallback
    }
  };

  const handleConfirmBooking = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      const confirmed = addBooking({
        safariId: safari.id,
        safariName: safari.name,
        zone: selectedZone,
        gate: safari.zones.find(z => z.name === selectedZone)?.entryGate || "Main Core Gate",
        date: selectedDate,
        slot: selectedSlot,
        adults,
        children,
        baseFare: baseTotal,
        taxes: conservationCess,
        totalAmount: grandTotal,
        travelers: [
          { name: primaryTraveler.name, age: 28, idType: primaryTraveler.idType, idNumber: primaryTraveler.idNumber }
        ]
      });

      triggerConfetti();
      setIsSubmitting(false);
      onBookingCompleted(confirmed.id);
    }, 700);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      
      {/* Wizard Header */}
      <div className="text-center mb-8">
        <button
          onClick={onCancel}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-500 hover:text-[#0D2922] transition mb-3"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Cancel and Return to Safari Details</span>
        </button>

        <h1 className="font-serif text-3xl font-bold text-[#0D2922] dark:text-[#F1F8F4]">
          Reserve Your Safari Permit
        </h1>
        <p className="text-xs sm:text-sm text-stone-600 dark:text-[#92ABA0] mt-1">
          {safari.name} · {safari.state}
        </p>

        {/* 4 Step Badges */}
        <div className="flex items-center justify-center gap-2 sm:gap-4 mt-6">
          {[
            { num: 1, label: "Date & Zone" },
            { num: 2, label: "Slot & Vehicle" },
            { num: 3, label: "Travelers" },
            { num: 4, label: "Summary" }
          ].map((st) => (
            <div key={st.num} className="flex items-center gap-2">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  currentStep === st.num
                    ? 'bg-[#0D2922] text-[#F7F5EF] dark:bg-[#C99A4A] dark:text-[#0D2922] ring-4 ring-[#C99A4A]/30 scale-105 font-black shadow-md'
                    : currentStep > st.num
                    ? 'bg-emerald-700 dark:bg-emerald-600 text-white shadow-sm'
                    : 'bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-200 border border-stone-300 dark:border-stone-700'
                }`}
              >
                {currentStep > st.num ? '✓' : st.num}
              </div>
              <span
                className={`hidden sm:inline text-xs transition-colors ${
                  currentStep === st.num
                    ? 'font-bold text-[#0D2922] dark:text-[#F1F8F4]'
                    : currentStep > st.num
                    ? 'font-semibold text-emerald-800 dark:text-emerald-400'
                    : 'font-medium text-stone-500 dark:text-stone-400'
                }`}
              >
                {st.label}
              </span>
              {st.num < 4 && <span className="text-stone-300 dark:text-stone-700 font-bold">›</span>}
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white dark:bg-[#0D201A] rounded-3xl p-6 sm:p-10 border border-[#E9DFC9] dark:border-[#1A382F] shadow-lg">
        
        {/* STEP 1: Date & Zone */}
        {currentStep === 1 && (
          <div className="space-y-6 animate-fade-in">
            <h2 className="font-serif text-2xl font-bold text-[#0D2922] dark:text-[#F1F8F4]">
              Step 1 — Choose Date & Core Zone
            </h2>

            {/* Date selection */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-2">
                Expedition Date
              </label>
              <div className="flex items-center gap-3 max-w-sm bg-[#FAF8F2] p-3 rounded-2xl border border-[#E9DFC9]">
                <Calendar className="w-5 h-5 text-[#C99A4A]" />
                <input
                  type="date"
                  value={selectedDate}
                  min="2026-10-06"
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="bg-transparent font-bold text-sm text-stone-800 focus:outline-none w-full cursor-pointer"
                />
              </div>
              <p className="text-[11px] text-emerald-700 font-semibold mt-1.5 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Core zone gate permits open for selected date
              </p>
            </div>

            {/* Zone selection */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-2">
                Select Reserve Zone
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {safari.zones.map((zone) => (
                  <button
                    key={zone.name}
                    onClick={() => setSelectedZone(zone.name)}
                    className={`p-4 rounded-2xl border text-left transition ${
                      selectedZone === zone.name
                        ? 'border-[#0D2922] dark:border-[#C99A4A] bg-[#FAF8F2] dark:bg-[#C99A4A]/15 ring-2 ring-[#0D2922] dark:ring-[#C99A4A]'
                        : 'border-[#E9DFC9] dark:border-[#1A382F] hover:border-[#C99A4A] dark:hover:border-[#C99A4A]/60 bg-white dark:bg-white/5 hover:bg-stone-50 dark:hover:bg-white/10'
                    }`}
                  >
                    <p className="font-bold text-xs text-[#0D2922] dark:text-[#F1F8F4]">{zone.name}</p>
                    <p className="text-[11px] text-stone-500 dark:text-[#A8C4B8] mt-0.5">Gate: {zone.entryGate}</p>
                    <div className="mt-2 text-[10px] font-bold text-[#C99A4A]">
                      {zone.status} · {zone.permitsPerShift} Daily permits
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-[#F0ECE1] dark:border-[#132E27] flex justify-end">
              <button
                onClick={() => setCurrentStep(2)}
                className="px-7 py-3.5 rounded-2xl bg-[#0D2922] dark:bg-[#C99A4A] text-white dark:text-[#0D2922] hover:bg-[#173F35] dark:hover:bg-[#B88939] font-extrabold text-xs sm:text-sm flex items-center gap-2 shadow-lg hover:shadow-xl transition-all active:scale-95"
              >
                <span>Continue to Slots</span>
                <ArrowRight className="w-4 h-4 text-[#C99A4A] dark:text-[#0D2922]" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Slots */}
        {currentStep === 2 && (
          <div className="space-y-6 animate-fade-in">
            <h2 className="font-serif text-2xl font-bold text-[#0D2922] dark:text-[#F1F8F4]">
              Step 2 — Select Shift & Vehicle
            </h2>

            <div className="space-y-3">
              {safari.slots.map((slot) => {
                const isSelected = selectedSlot.id === slot.id;
                return (
                  <button
                    key={slot.id}
                    onClick={() => setSelectedSlot(slot)}
                    className={`w-full p-4 rounded-2xl border text-left transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      isSelected
                        ? 'border-[#0D2922] dark:border-[#C99A4A] bg-[#FAF8F2] dark:bg-[#C99A4A]/15 ring-2 ring-[#0D2922] dark:ring-[#C99A4A]'
                        : 'border-[#E9DFC9] dark:border-[#1A382F] hover:border-[#C99A4A] dark:hover:border-[#C99A4A]/60 bg-white dark:bg-white/5 hover:bg-stone-50 dark:hover:bg-white/10'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-[#0D2922] dark:text-[#F1F8F4]">{slot.title}</span>
                        <span className="px-2 py-0.5 text-[10px] font-bold bg-[#E9DFC9] dark:bg-white/10 text-stone-800 dark:text-stone-200 rounded-full">
                          {slot.badge}
                        </span>
                      </div>
                      <p className="text-xs text-stone-500 dark:text-[#A8C4B8] mt-1">{slot.time} · {slot.type}</p>
                    </div>

                    <div className="text-left sm:text-right">
                      <p className="font-serif font-bold text-lg text-[#0D2922] dark:text-[#F1F8F4]">
                        ₹{slot.price} <span className="text-xs font-normal text-stone-500 dark:text-[#A8C4B8]">/ person</span>
                      </p>
                      <p className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400">
                        ● {slot.seatsAvailable} seats available
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="pt-4 border-t border-[#F0ECE1] dark:border-[#132E27] flex justify-between">
              <button
                onClick={() => setCurrentStep(1)}
                className="px-5 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-300 text-xs font-bold hover:bg-stone-50 dark:hover:bg-white/10 transition"
              >
                Back
              </button>
              <button
                onClick={() => setCurrentStep(3)}
                className="px-7 py-3.5 rounded-2xl bg-[#0D2922] dark:bg-[#C99A4A] text-white dark:text-[#0D2922] hover:bg-[#173F35] dark:hover:bg-[#B88939] font-extrabold text-xs sm:text-sm flex items-center gap-2 shadow-lg hover:shadow-xl transition-all active:scale-95"
              >
                <span>Continue to Guests</span>
                <ArrowRight className="w-4 h-4 text-[#C99A4A] dark:text-[#0D2922]" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Travelers */}
        {currentStep === 3 && (
          <div className="space-y-6 animate-fade-in">
            <h2 className="font-serif text-2xl font-bold text-[#0D2922] dark:text-[#F1F8F4]">
              Step 3 — Travelers & Mandatory Permits
            </h2>

            {/* Guest Counters */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-[#FAF8F2] dark:bg-white/5 border border-[#E9DFC9] dark:border-[#1A382F] flex items-center justify-between">
                <div>
                  <p className="font-bold text-xs text-[#0D2922] dark:text-[#F1F8F4]">Adults (12+ Yrs)</p>
                  <p className="text-[11px] text-stone-500 dark:text-[#A8C4B8]">₹{pricePerAdult} per person</p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setAdults(Math.max(1, adults - 1))}
                    className="w-8 h-8 rounded-full bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 font-bold hover:bg-stone-100 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 flex items-center justify-center cursor-pointer"
                  >
                    -
                  </button>
                  <span className="font-bold text-sm text-stone-900 dark:text-stone-100">{adults}</span>
                  <button
                    onClick={() => setAdults(Math.min(6, adults + 1))}
                    className="w-8 h-8 rounded-full bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 font-bold hover:bg-stone-100 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 flex items-center justify-center cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#FAF8F2] dark:bg-white/5 border border-[#E9DFC9] dark:border-[#1A382F] flex items-center justify-between">
                <div>
                  <p className="font-bold text-xs text-[#0D2922] dark:text-[#F1F8F4]">Children (5–11 Yrs)</p>
                  <p className="text-[11px] text-stone-500 dark:text-[#A8C4B8]">₹{pricePerChild} (40% discount)</p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setChildren(Math.max(0, children - 1))}
                    className="w-8 h-8 rounded-full bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 font-bold hover:bg-stone-100 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 flex items-center justify-center cursor-pointer"
                  >
                    -
                  </button>
                  <span className="font-bold text-sm text-stone-900 dark:text-stone-100">{children}</span>
                  <button
                    onClick={() => setChildren(Math.min(4, children + 1))}
                    className="w-8 h-8 rounded-full bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 font-bold hover:bg-stone-100 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 flex items-center justify-center cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Primary Guest Permit Details */}
            <div className="p-5 rounded-2xl bg-white border border-[#E9DFC9] space-y-4">
              <h3 className="font-bold text-xs uppercase tracking-wider text-stone-500 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#C99A4A]" />
                Lead Traveler Permit Identification
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-stone-600 mb-1">Full Legal Name (as on ID)</label>
                  <input
                    type="text"
                    value={primaryTraveler.name}
                    onChange={(e) => setPrimaryTraveler({ ...primaryTraveler, name: e.target.value })}
                    className="w-full bg-[#FAF8F2] border border-[#E9DFC9] rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-[#0D2922]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-stone-600 mb-1">Mobile (for Forest SMS pass)</label>
                  <input
                    type="text"
                    value={primaryTraveler.phone}
                    onChange={(e) => setPrimaryTraveler({ ...primaryTraveler, phone: e.target.value })}
                    className="w-full bg-[#FAF8F2] border border-[#E9DFC9] rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-[#0D2922]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold text-stone-600 dark:text-[#A8C4B8] mb-1.5">
                    Government Photo ID Document Type *
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {["Aadhaar Card", "Passport", "Voter ID", "Driving License"].map((type) => {
                      const isSelected = primaryTraveler.idType === type;
                      return (
                        <button
                          key={type}
                          type="button"
                          onClick={() => setPrimaryTraveler({ ...primaryTraveler, idType: type })}
                          className={`py-2 px-3 rounded-xl text-xs font-semibold border text-center transition cursor-pointer flex items-center justify-center gap-1.5 ${
                            isSelected
                              ? 'bg-[#C99A4A]/20 border-[#C99A4A] text-[#8F651C] dark:text-[#E5B560] font-bold shadow-sm'
                              : 'bg-[#FAF8F2] dark:bg-[#071713] border-[#E9DFC9] dark:border-[#1A382F] text-stone-700 dark:text-stone-300 hover:border-[#C99A4A]/50'
                          }`}
                        >
                          {isSelected && <Check className="w-3.5 h-3.5 text-[#C99A4A] flex-shrink-0" />}
                          <span>{type}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-stone-600 mb-1">ID Document Number</label>
                  <input
                    type="text"
                    value={primaryTraveler.idNumber}
                    onChange={(e) => setPrimaryTraveler({ ...primaryTraveler, idNumber: e.target.value })}
                    className="w-full bg-[#FAF8F2] border border-[#E9DFC9] rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-[#0D2922]"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-[#F0ECE1] dark:border-[#132E27] flex justify-between">
              <button
                onClick={() => setCurrentStep(2)}
                className="px-5 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-300 text-xs font-bold hover:bg-stone-50 dark:hover:bg-white/10 transition"
              >
                Back
              </button>
              <button
                onClick={() => setCurrentStep(4)}
                className="px-7 py-3.5 rounded-2xl bg-[#0D2922] dark:bg-[#C99A4A] text-white dark:text-[#0D2922] hover:bg-[#173F35] dark:hover:bg-[#B88939] font-extrabold text-xs sm:text-sm flex items-center gap-2 shadow-lg hover:shadow-xl transition-all active:scale-95"
              >
                <span>Review Summary & Confirm</span>
                <ArrowRight className="w-4 h-4 text-[#C99A4A] dark:text-[#0D2922]" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: Confirm Summary */}
        {currentStep === 4 && (
          <div className="space-y-6 animate-fade-in">
            <h2 className="font-serif text-2xl font-bold text-[#0D2922] dark:text-[#F1F8F4]">
              Step 4 — Final Booking Summary
            </h2>

            {/* Safari Details Card */}
            <div className="bg-[#FAF8F2] dark:bg-white/5 p-5 rounded-2xl border border-[#E9DFC9] dark:border-[#1A382F] space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-serif font-bold text-lg text-[#0D2922] dark:text-[#F1F8F4]">{safari.name}</h3>
                  <p className="text-xs text-stone-600 dark:text-[#A8C4B8]">{selectedZone} · {selectedDate}</p>
                </div>
                <span className="px-2.5 py-1 text-[10px] font-bold bg-[#173F35] dark:bg-[#C99A4A] text-white dark:text-[#0D2922] rounded-full">
                  Official Forest Permit
                </span>
              </div>

              <div className="text-xs text-stone-600 dark:text-[#C7D7D0] grid grid-cols-2 gap-2 pt-2 border-t border-[#E9DFC9]/60 dark:border-[#132E27]">
                <div>Shift: <span className="font-bold text-stone-800 dark:text-white">{selectedSlot.title} ({selectedSlot.time})</span></div>
                <div>Vehicle: <span className="font-bold text-stone-800 dark:text-white">{selectedSlot.type}</span></div>
                <div>Travelers: <span className="font-bold text-stone-800 dark:text-white">{adults} Adults {children > 0 ? `, ${children} Child` : ''}</span></div>
                <div>Lead: <span className="font-bold text-stone-800 dark:text-white">{primaryTraveler.name}</span></div>
              </div>
            </div>

            {/* Price Breakdown */}
            <div className="p-5 rounded-2xl bg-white dark:bg-white/5 border border-[#E9DFC9] dark:border-[#1A382F] space-y-2 text-xs">
              <div className="flex justify-between text-stone-600 dark:text-[#A8C4B8]">
                <span>Adult Safari Seat ({adults} × ₹{pricePerAdult})</span>
                <span>₹{(adults * pricePerAdult).toLocaleString('en-IN')}</span>
              </div>
              {children > 0 && (
                <div className="flex justify-between text-stone-600 dark:text-[#A8C4B8]">
                  <span>Child Seat ({children} × ₹{pricePerChild})</span>
                  <span>₹{(children * pricePerChild).toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="flex justify-between text-stone-600 dark:text-[#A8C4B8]">
                <span>Forest Dept Conservation Cess & Entry Taxes</span>
                <span>₹{conservationCess.toLocaleString('en-IN')}</span>
              </div>
              <div className="pt-3 border-t border-[#F0ECE1] dark:border-[#132E27] flex justify-between font-bold text-base text-[#0D2922] dark:text-[#C99A4A]">
                <span>Total Amount</span>
                <span>₹{grandTotal.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div className="pt-4 border-t border-[#F0ECE1] dark:border-[#132E27] flex justify-between items-center">
              <button
                onClick={() => setCurrentStep(3)}
                className="px-5 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-300 text-xs font-bold hover:bg-stone-50 dark:hover:bg-white/10 transition"
              >
                Back
              </button>

              <button
                onClick={handleConfirmBooking}
                disabled={isSubmitting}
                className="px-8 py-4 rounded-2xl bg-[#0D2922] dark:bg-[#C99A4A] hover:bg-[#173F35] dark:hover:bg-[#B88939] text-white dark:text-[#0D2922] font-extrabold text-sm flex items-center gap-2 shadow-xl hover:shadow-2xl transition active:scale-95"
              >
                {isSubmitting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white dark:border-[#0D2922] border-t-transparent rounded-full animate-spin" />
                    <span>Issuing Forest Permit Pass...</span>
                  </>
                ) : (
                  <>
                    <span>Confirm & Generate Permit Pass</span>
                    <ArrowRight className="w-4 h-4 text-[#C99A4A] dark:text-[#0D2922]" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}

      </div>

    </div>
  );
}
