import React, { useState } from 'react';
import { SAFARIS } from '../data/safaris';
import { useBooking } from '../context/BookingContext';
import confetti from 'canvas-confetti';
import {
  Calendar,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Check,
} from 'lucide-react';

export default function BookingFlowPage({ safariId, initialSlot, onBookingCompleted, onCancel }) {
  const { addBooking } = useBooking();
  const safari = SAFARIS.find((s) => s.id === safariId) || SAFARIS[0];

  const [currentStep, setCurrentStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState('2026-10-18');
  const [selectedSlot, setSelectedSlot] = useState(initialSlot || safari.slots[0]);
  const [selectedZone, setSelectedZone] = useState(safari.zones[0]?.name || 'Moharli Zone');
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);

  const [primaryTraveler, setPrimaryTraveler] = useState({
    name: 'Sahil Verma',
    email: 'sahil@wildtrail.dev',
    phone: '+91 98765 43210',
    idType: 'Aadhaar Card',
    idNumber: '4829-1920-5812',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const pricePerAdult = selectedSlot.price;
  const pricePerChild = Math.round(selectedSlot.price * 0.6);
  const baseTotal = adults * pricePerAdult + children * pricePerChild;
  const conservationCess = 450;
  const grandTotal = baseTotal + conservationCess;

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch {
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
        gate: safari.zones.find((z) => z.name === selectedZone)?.entryGate || 'Main Core Gate',
        date: selectedDate,
        slot: selectedSlot,
        adults,
        children,
        baseFare: baseTotal,
        taxes: conservationCess,
        totalAmount: grandTotal,
        travelers: [
          {
            name: primaryTraveler.name,
            age: 28,
            idType: primaryTraveler.idType,
            idNumber: primaryTraveler.idNumber,
          },
        ],
      });

      triggerConfetti();
      setIsSubmitting(false);
      onBookingCompleted(confirmed.id);
    }, 650);
  };

  return (
    <div className="min-h-screen">
      {/* Editorial Deep Canopy Emerald Header Strip */}
      <section className="bg-gradient-to-b from-[#09211A] to-[#0D2922] border-b border-[#265244] text-[#F4EBDA]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-9 sm:py-11 text-center">
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#C8D8D0] hover:text-[#E4B865] transition mb-3 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-[#C99A4A]" />
            <span>Return to Reserve Dossier</span>
          </button>

          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#F8F3E8] tracking-tight">
            Reserve Your Safari Permit
          </h1>
          <p className="text-xs sm:text-sm text-[#C8D8D0] mt-1">
            {safari.name} · {safari.state}
          </p>

          {/* 4 Step Badges */}
          <div className="flex items-center justify-center gap-2 sm:gap-4 mt-7">
            {[
              { num: 1, label: 'Date & Zone' },
              { num: 2, label: 'Shift & Vehicle' },
              { num: 3, label: 'Traveler IDs' },
              { num: 4, label: 'Confirm Pass' },
            ].map((st) => (
              <div key={st.num} className="flex items-center gap-2">
                <div
                  className={`w-7 h-7 rounded-full font-mono tabular-nums flex items-center justify-center text-xs font-bold transition-all ${
                    currentStep === st.num
                      ? 'bg-[#C99A4A] text-[#0D2922] ring-4 ring-[#C99A4A]/25 scale-105'
                      : currentStep > st.num
                      ? 'bg-[#173F35] text-[#86EFAC] border border-[#4ADE80]/40'
                      : 'bg-[#071713] text-[#9AB3A8] border border-[#265244]'
                  }`}
                >
                  {currentStep > st.num ? <Check className="w-3.5 h-3.5" /> : st.num}
                </div>
                <span
                  className={`hidden sm:inline text-xs transition-colors ${
                    currentStep === st.num
                      ? 'font-bold text-[#F8F3E8]'
                      : currentStep > st.num
                      ? 'font-semibold text-[#86EFAC]'
                      : 'font-medium text-[#9AB3A8]'
                  }`}
                >
                  {st.label}
                </span>
                {st.num < 4 && <span className="text-[#265244] font-bold">›</span>}
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
        <div className="bg-[#FBF8F3] dark:bg-[#0B221B] rounded-2xl p-6 sm:p-10 border border-[#D8CEBE] dark:border-[#244E40] shadow-lg">
          {/* STEP 1: Date & Zone */}
          {currentStep === 1 && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <span className="text-xs font-mono uppercase tracking-wider text-[#B88428] dark:text-[#E4B865]">
                  Step 01 of 04
                </span>
                <h2 className="font-serif text-2xl font-bold text-[#14261F] dark:text-[#F8F3E8] mt-0.5">
                  Choose Expedition Date &amp; Core Zone
                </h2>
              </div>

              {/* Date selection */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#43564E] dark:text-[#B8CEC4] mb-2">
                  Expedition Date
                </label>
                <div className="flex items-center gap-3 max-w-sm bg-white dark:bg-[#071713] p-3 rounded-xl border border-[#D8CEBE] dark:border-[#265244]">
                  <Calendar className="w-5 h-5 text-[#C99A4A]" />
                  <input
                    type="date"
                    value={selectedDate}
                    min="2026-10-06"
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="bg-transparent font-mono tabular-nums font-bold text-sm text-[#14261F] dark:text-[#F0ECE1] focus:outline-none w-full cursor-pointer"
                  />
                </div>
                <p className="text-xs text-[#0D2922] dark:text-[#86EFAC] font-semibold mt-2 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#C99A4A]" />
                  <span>Core zone gate permits open for selected date</span>
                </p>
              </div>

              {/* Zone selection */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#43564E] dark:text-[#B8CEC4] mb-2">
                  Select Reserve Gate &amp; Zone
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {safari.zones.map((zone) => {
                    const active = selectedZone === zone.name;
                    return (
                      <button
                        key={zone.name}
                        type="button"
                        onClick={() => setSelectedZone(zone.name)}
                        className={`p-4 rounded-xl border text-left transition cursor-pointer ${
                          active
                            ? 'border-[#0D2922] dark:border-[#C99A4A] bg-[#EFE6D7] dark:bg-[#133329] ring-2 ring-[#0D2922] dark:ring-[#C99A4A]'
                            : 'border-[#D8CEBE] dark:border-[#244E40] hover:border-[#C99A4A] bg-white dark:bg-[#071713]'
                        }`}
                      >
                        <p className="font-bold text-xs text-[#14261F] dark:text-[#F8F3E8]">
                          {zone.name}
                        </p>
                        <p className="text-xs text-[#43564E] dark:text-[#B8CEC4] mt-0.5">
                          Gate: {zone.entryGate}
                        </p>
                        <div className="mt-2 text-xs font-mono font-bold text-[#B88428] dark:text-[#E4B865]">
                          {zone.status} · {zone.permitsPerShift} Daily permits
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-4 border-t border-[#E5DEC9] dark:border-[#1D4337] flex justify-end">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="px-6 py-3 rounded-xl bg-[#C99A4A] hover:bg-[#D8AA5B] text-[#0D2922] font-bold text-xs sm:text-sm flex items-center gap-2 shadow-md transition-all cursor-pointer"
                >
                  <span>Continue to Shift &amp; Vehicle</span>
                  <ArrowRight className="w-4 h-4 text-[#0D2922]" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Slots */}
          {currentStep === 2 && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <span className="text-xs font-mono uppercase tracking-wider text-[#B88428] dark:text-[#E4B865]">
                  Step 02 of 04
                </span>
                <h2 className="font-serif text-2xl font-bold text-[#14261F] dark:text-[#F8F3E8] mt-0.5">
                  Select Safari Shift &amp; Vehicle
                </h2>
              </div>

              <div className="space-y-3">
                {safari.slots.map((slot) => {
                  const isSelected = selectedSlot.id === slot.id;
                  return (
                    <button
                      key={slot.id}
                      type="button"
                      onClick={() => setSelectedSlot(slot)}
                      className={`w-full p-4 rounded-xl border text-left transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer ${
                        isSelected
                          ? 'border-[#0D2922] dark:border-[#C99A4A] bg-[#EFE6D7] dark:bg-[#133329] ring-2 ring-[#0D2922] dark:ring-[#C99A4A]'
                          : 'border-[#D8CEBE] dark:border-[#244E40] hover:border-[#C99A4A] bg-white dark:bg-[#071713]'
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-[#14261F] dark:text-[#F8F3E8]">
                            {slot.title}
                          </span>
                          <span className="px-2 py-0.5 text-xs font-bold bg-[#0D2922] text-[#E4B865] rounded-md">
                            {slot.badge}
                          </span>
                        </div>
                        <p className="text-xs text-[#43564E] dark:text-[#B8CEC4] mt-1">
                          {slot.time} · {slot.type}
                        </p>
                      </div>

                      <div className="text-left sm:text-right">
                        <p className="font-mono tabular-nums font-bold text-lg text-[#14261F] dark:text-[#F8F3E8]">
                          ₹{slot.price.toLocaleString('en-IN')}{' '}
                          <span className="text-xs font-sans font-normal text-[#43564E] dark:text-[#9AB3A8]">
                            / guest
                          </span>
                        </p>
                        <p className="text-xs font-mono tabular-nums font-bold text-emerald-700 dark:text-[#86EFAC]">
                          ● {slot.seatsAvailable} seats available
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="pt-4 border-t border-[#E5DEC9] dark:border-[#1D4337] flex justify-between">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="px-5 py-2.5 rounded-xl border border-[#D8CEBE] dark:border-[#265244] text-[#43564E] dark:text-[#C8D8D0] text-xs font-bold hover:bg-[#EFE6D7] dark:hover:bg-white/5 transition cursor-pointer"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentStep(3)}
                  className="px-6 py-3 rounded-xl bg-[#C99A4A] hover:bg-[#D8AA5B] text-[#0D2922] font-bold text-xs sm:text-sm flex items-center gap-2 shadow-md transition-all cursor-pointer"
                >
                  <span>Continue to Traveler IDs</span>
                  <ArrowRight className="w-4 h-4 text-[#0D2922]" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Travelers */}
          {currentStep === 3 && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <span className="text-xs font-mono uppercase tracking-wider text-[#B88428] dark:text-[#E4B865]">
                  Step 03 of 04
                </span>
                <h2 className="font-serif text-2xl font-bold text-[#14261F] dark:text-[#F8F3E8] mt-0.5">
                  Travelers &amp; Mandatory Govt ID Registration
                </h2>
              </div>

              {/* Guest Counters */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-white dark:bg-[#071713] border border-[#D8CEBE] dark:border-[#265244] flex items-center justify-between">
                  <div>
                    <p className="font-bold text-xs text-[#14261F] dark:text-[#F8F3E8]">
                      Adults (12+ Yrs)
                    </p>
                    <p className="text-xs font-mono tabular-nums text-[#43564E] dark:text-[#9AB3A8]">
                      ₹{pricePerAdult.toLocaleString('en-IN')} per guest
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setAdults(Math.max(1, adults - 1))}
                      className="w-8 h-8 rounded-lg bg-[#EFE6D7] dark:bg-[#113127] border border-[#D8CEBE] dark:border-[#265244] font-bold hover:border-[#C99A4A] text-[#14261F] dark:text-[#F8F3E8] flex items-center justify-center cursor-pointer"
                    >
                      -
                    </button>
                    <span className="font-mono tabular-nums font-bold text-sm text-[#14261F] dark:text-[#F8F3E8]">
                      {adults}
                    </span>
                    <button
                      type="button"
                      onClick={() => setAdults(Math.min(6, adults + 1))}
                      className="w-8 h-8 rounded-lg bg-[#EFE6D7] dark:bg-[#113127] border border-[#D8CEBE] dark:border-[#265244] font-bold hover:border-[#C99A4A] text-[#14261F] dark:text-[#F8F3E8] flex items-center justify-center cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-white dark:bg-[#071713] border border-[#D8CEBE] dark:border-[#265244] flex items-center justify-between">
                  <div>
                    <p className="font-bold text-xs text-[#14261F] dark:text-[#F8F3E8]">
                      Children (5–11 Yrs)
                    </p>
                    <p className="text-xs font-mono tabular-nums text-[#43564E] dark:text-[#9AB3A8]">
                      ₹{pricePerChild.toLocaleString('en-IN')} (40% concession)
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setChildren(Math.max(0, children - 1))}
                      className="w-8 h-8 rounded-lg bg-[#EFE6D7] dark:bg-[#113127] border border-[#D8CEBE] dark:border-[#265244] font-bold hover:border-[#C99A4A] text-[#14261F] dark:text-[#F8F3E8] flex items-center justify-center cursor-pointer"
                    >
                      -
                    </button>
                    <span className="font-mono tabular-nums font-bold text-sm text-[#14261F] dark:text-[#F8F3E8]">
                      {children}
                    </span>
                    <button
                      type="button"
                      onClick={() => setChildren(Math.min(4, children + 1))}
                      className="w-8 h-8 rounded-lg bg-[#EFE6D7] dark:bg-[#113127] border border-[#D8CEBE] dark:border-[#265244] font-bold hover:border-[#C99A4A] text-[#14261F] dark:text-[#F8F3E8] flex items-center justify-center cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              {/* Primary Guest Permit Details */}
              <div className="p-5 rounded-xl bg-white dark:bg-[#071713] border border-[#D8CEBE] dark:border-[#265244] space-y-4">
                <h3 className="font-bold text-xs uppercase tracking-wider text-[#43564E] dark:text-[#E4B865] flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-[#C99A4A]" />
                  <span>Lead Traveler Permit Identification</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#43564E] dark:text-[#B8CEC4] mb-1">
                      Full Legal Name (as on ID)
                    </label>
                    <input
                      type="text"
                      value={primaryTraveler.name}
                      onChange={(e) =>
                        setPrimaryTraveler({ ...primaryTraveler, name: e.target.value })
                      }
                      className="w-full bg-[#FBF8F3] dark:bg-[#0B221B] border border-[#D8CEBE] dark:border-[#265244] rounded-xl px-3 py-2 text-xs font-semibold text-[#14261F] dark:text-[#F0ECE1] focus:outline-none focus:border-[#C99A4A]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#43564E] dark:text-[#B8CEC4] mb-1">
                      Mobile (for Forest SMS Pass)
                    </label>
                    <input
                      type="text"
                      value={primaryTraveler.phone}
                      onChange={(e) =>
                        setPrimaryTraveler({ ...primaryTraveler, phone: e.target.value })
                      }
                      className="w-full bg-[#FBF8F3] dark:bg-[#0B221B] border border-[#D8CEBE] dark:border-[#265244] rounded-xl px-3 py-2 text-xs font-mono font-semibold text-[#14261F] dark:text-[#F0ECE1] focus:outline-none focus:border-[#C99A4A]"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-[#43564E] dark:text-[#B8CEC4] mb-1.5">
                      Government Photo ID Document Type *
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {['Aadhaar Card', 'Passport', 'Voter ID', 'Driving License'].map((type) => {
                        const isSelected = primaryTraveler.idType === type;
                        return (
                          <button
                            key={type}
                            type="button"
                            onClick={() => setPrimaryTraveler({ ...primaryTraveler, idType: type })}
                            className={`py-2 px-3 rounded-xl text-xs font-semibold border text-center transition cursor-pointer flex items-center justify-center gap-1.5 ${
                              isSelected
                                ? 'bg-[#C99A4A]/20 border-[#C99A4A] text-[#0D2922] dark:text-[#E4B865] font-bold shadow-sm'
                                : 'bg-[#FBF8F3] dark:bg-[#0B221B] border-[#D8CEBE] dark:border-[#265244] text-[#43564E] dark:text-[#C8D8D0] hover:border-[#C99A4A]/50'
                            }`}
                          >
                            {isSelected && <Check className="w-3.5 h-3.5 text-[#C99A4A] shrink-0" />}
                            <span>{type}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#43564E] dark:text-[#B8CEC4] mb-1">
                      ID Document Number
                    </label>
                    <input
                      type="text"
                      value={primaryTraveler.idNumber}
                      onChange={(e) =>
                        setPrimaryTraveler({ ...primaryTraveler, idNumber: e.target.value })
                      }
                      className="w-full bg-[#FBF8F3] dark:bg-[#0B221B] border border-[#D8CEBE] dark:border-[#265244] rounded-xl px-3 py-2 text-xs font-mono font-semibold text-[#14261F] dark:text-[#F0ECE1] focus:outline-none focus:border-[#C99A4A]"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-[#E5DEC9] dark:border-[#1D4337] flex justify-between">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="px-5 py-2.5 rounded-xl border border-[#D8CEBE] dark:border-[#265244] text-[#43564E] dark:text-[#C8D8D0] text-xs font-bold hover:bg-[#EFE6D7] dark:hover:bg-white/5 transition cursor-pointer"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentStep(4)}
                  className="px-6 py-3 rounded-xl bg-[#C99A4A] hover:bg-[#D8AA5B] text-[#0D2922] font-bold text-xs sm:text-sm flex items-center gap-2 shadow-md transition-all cursor-pointer"
                >
                  <span>Review Permit Summary</span>
                  <ArrowRight className="w-4 h-4 text-[#0D2922]" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: Confirm Summary */}
          {currentStep === 4 && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <span className="text-xs font-mono uppercase tracking-wider text-[#B88428] dark:text-[#E4B865]">
                  Step 04 of 04
                </span>
                <h2 className="font-serif text-2xl font-bold text-[#14261F] dark:text-[#F8F3E8] mt-0.5">
                  Final Permit Verification &amp; Fare Summary
                </h2>
              </div>

              {/* Safari Details Card */}
              <div className="bg-[#EFE6D7] dark:bg-[#113127] p-5 rounded-xl border border-[#D8CEBE] dark:border-[#265244] space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-serif font-bold text-lg text-[#14261F] dark:text-[#F8F3E8]">
                      {safari.name}
                    </h3>
                    <p className="text-xs font-mono text-[#43564E] dark:text-[#B8CEC4]">
                      {selectedZone} · {selectedDate}
                    </p>
                  </div>
                  <span className="px-2.5 py-1 text-xs font-bold bg-[#0D2922] text-[#E4B865] border border-[#C99A4A]/45 rounded-lg">
                    Official Forest Permit
                  </span>
                </div>

                <div className="text-xs text-[#43564E] dark:text-[#C8D8D0] grid grid-cols-1 sm:grid-cols-2 gap-2 pt-3 border-t border-[#D8CEBE] dark:border-[#265244]">
                  <div>
                    Shift:{' '}
                    <span className="font-bold text-[#14261F] dark:text-white">
                      {selectedSlot.title} ({selectedSlot.time})
                    </span>
                  </div>
                  <div>
                    Vehicle:{' '}
                    <span className="font-bold text-[#14261F] dark:text-white">
                      {selectedSlot.type}
                    </span>
                  </div>
                  <div>
                    Travelers:{' '}
                    <span className="font-bold text-[#14261F] dark:text-white">
                      {adults} Adults {children > 0 ? `, ${children} Child` : ''}
                    </span>
                  </div>
                  <div>
                    Lead Guest:{' '}
                    <span className="font-bold text-[#14261F] dark:text-white">
                      {primaryTraveler.name}
                    </span>
                  </div>
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="p-5 rounded-xl bg-white dark:bg-[#071713] border border-[#D8CEBE] dark:border-[#265244] space-y-2.5 text-xs">
                <div className="flex justify-between text-[#43564E] dark:text-[#B8CEC4]">
                  <span>
                    Adult Safari Seat ({adults} × ₹{pricePerAdult.toLocaleString('en-IN')})
                  </span>
                  <span className="font-mono tabular-nums">
                    ₹{(adults * pricePerAdult).toLocaleString('en-IN')}
                  </span>
                </div>
                {children > 0 && (
                  <div className="flex justify-between text-[#43564E] dark:text-[#B8CEC4]">
                    <span>
                      Child Seat ({children} × ₹{pricePerChild.toLocaleString('en-IN')})
                    </span>
                    <span className="font-mono tabular-nums">
                      ₹{(children * pricePerChild).toLocaleString('en-IN')}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-[#43564E] dark:text-[#B8CEC4]">
                  <span>Forest Dept Conservation Cess &amp; Gate Taxes</span>
                  <span className="font-mono tabular-nums">
                    ₹{conservationCess.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="pt-3 border-t border-[#E5DEC9] dark:border-[#1D4337] flex justify-between font-bold text-base text-[#14261F] dark:text-[#E4B865]">
                  <span>Total Payable</span>
                  <span className="font-mono tabular-nums">
                    ₹{grandTotal.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              <div className="pt-4 border-t border-[#E5DEC9] dark:border-[#1D4337] flex justify-between items-center">
                <button
                  type="button"
                  onClick={() => setCurrentStep(3)}
                  className="px-5 py-2.5 rounded-xl border border-[#D8CEBE] dark:border-[#265244] text-[#43564E] dark:text-[#C8D8D0] text-xs font-bold hover:bg-[#EFE6D7] dark:hover:bg-white/5 transition cursor-pointer"
                >
                  Back
                </button>

                <button
                  type="button"
                  onClick={handleConfirmBooking}
                  disabled={isSubmitting}
                  className="px-7 py-3.5 rounded-xl bg-[#C99A4A] hover:bg-[#D8AA5B] text-[#0D2922] font-bold text-sm flex items-center gap-2 shadow-lg transition cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <span className="w-4 h-4 border-2 border-[#0D2922] border-t-transparent rounded-full animate-spin" />
                      <span>Issuing Forest Permit Pass...</span>
                    </>
                  ) : (
                    <>
                      <span>Confirm &amp; Generate Permit Pass</span>
                      <ArrowRight className="w-4 h-4 text-[#0D2922]" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
