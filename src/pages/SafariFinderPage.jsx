import React, { useState } from 'react';
import { getRecommendedSafaris } from '../utils/recommendationEngine';
import { Sparkles, ArrowRight, Check, RotateCcw, Star, ShieldCheck, MapPin, IndianRupee, Trophy, Flame } from 'lucide-react';

export default function SafariFinderPage({ onSelectSafari, onNavigate }) {
  // Wizard state
  const [step, setStep] = useState(1);
  const [preferences, setPreferences] = useState({
    wildlife: "tiger",
    timeframe: "next-month",
    budget: 5000,
    party: "family",
    region: "any"
  });

  const [results, setResults] = useState(null);
  const [isCalculating, setIsCalculating] = useState(false);

  const wildlifeOptions = [
    { id: "tiger", label: "Royal Bengal Tigers", icon: "🐅", desc: "Top priority big cat sightings" },
    { id: "elephant", label: "Wild Asian Elephants", icon: "🐘", desc: "River valleys & matriarch herds" },
    { id: "leopard", label: "Indian Leopards", icon: "🐆", desc: "Rocky ledges & canopy climbers" },
    { id: "rhino", label: "One-horned Rhinos", icon: "🦏", desc: "Floodplain prehistoric grazers" },
    { id: "deer", label: "Swamp Deer & Antelopes", icon: "🦌", desc: "Golden meadows & Barasingha rut" },
    { id: "bird", label: "Avian Raptors & Hornbills", icon: "🦜", desc: "Wetland migratory birding" }
  ];

  const partyOptions = [
    { id: "family", label: "Family with Elders / Kids", desc: "Gentle routes, center rest points, comfortable seats" },
    { id: "photographer", label: "Wildlife Photographer", desc: "Unobstructed 4x4 open gypsies with camera shock mounts" },
    { id: "solo", label: "Solo Adventurer / Friends", desc: "Intense core zone tracking and deep trail exploration" }
  ];

  const timeframeOptions = [
    { id: "this-week", label: "This Week", note: "Immediate availability" },
    { id: "this-month", label: "Within 30 Days", note: "Great upcoming slots" },
    { id: "next-month", label: "Winter / Spring Peak", note: "Prime weather & sightings" }
  ];

  const handleCalculate = () => {
    setIsCalculating(true);
    setTimeout(() => {
      const calculated = getRecommendedSafaris(preferences);
      setResults(calculated);
      setIsCalculating(false);
      setStep(4);
    }, 600);
  };

  const handleReset = () => {
    setStep(1);
    setResults(null);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      
      {/* Quiz Header */}
      <div className="text-center max-w-2xl mx-auto mb-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#173F35]/10 text-[#173F35] text-xs font-bold uppercase tracking-wider mb-3">
          <Sparkles className="w-4 h-4 text-[#C99A4A]" />
          <span>Interactive Safari Recommendation Engine</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-5xl font-extrabold text-[#0D2922]">
          Safari Match Finder
        </h1>
        <p className="text-xs sm:text-sm text-stone-600 mt-2">
          Answer 3 quick preferences. Our algorithm cross-evaluates sighting indices, season viability, and budget to find your ideal tiger reserve.
        </p>

        {/* Step indicator */}
        {step < 4 && (
          <div className="flex items-center justify-center gap-3 sm:gap-4 my-8">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center gap-2">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all shadow-sm ${
                    step === s
                      ? 'bg-[#0D2922] text-white dark:bg-[#C99A4A] dark:text-[#0D2922] ring-4 ring-[#C99A4A]/30 scale-110 font-extrabold'
                      : step > s
                      ? 'bg-emerald-600 text-white'
                      : 'bg-[#E9DFC9] dark:bg-white/10 text-stone-700 dark:text-stone-300 border border-transparent dark:border-white/20'
                  }`}
                >
                  {step > s ? <Check className="w-4 h-4" /> : s}
                </div>
                {s < 3 && (
                  <div
                    className={`w-10 sm:w-16 h-1 rounded-full transition-colors ${
                      step > s ? 'bg-emerald-600' : 'bg-[#E9DFC9] dark:bg-white/15'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* STEP 1: Wildlife Interest */}
      {step === 1 && (
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-[#E9DFC9] shadow-sm animate-fade-in mt-6">
          <div className="mb-6">
            <h2 className="font-serif text-2xl font-bold text-[#0D2922] dark:text-[#F1F8F4]">
              1. What wildlife encounter are you dreaming of?
            </h2>
            <p className="text-xs text-stone-500 dark:text-[#728D81] mt-1">Select your primary expedition focus</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {wildlifeOptions.map((item) => {
              const isSelected = preferences.wildlife === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setPreferences({ ...preferences, wildlife: item.id })}
                  className={`p-4 rounded-2xl border text-left flex items-start gap-3.5 transition-all ${
                    isSelected
                      ? 'bg-[#FAF8F2] dark:bg-[#C99A4A]/15 border-[#0D2922] dark:border-[#C99A4A] ring-2 ring-[#0D2922] dark:ring-[#C99A4A] shadow-md'
                      : 'border-[#E9DFC9] dark:border-[#1A382F] hover:border-[#C99A4A] dark:hover:border-[#C99A4A]/60 bg-white dark:bg-white/5 hover:bg-stone-50 dark:hover:bg-white/10'
                  }`}
                >
                  <span className="text-3xl select-none">{item.icon}</span>
                  <div>
                    <h3 className="font-bold text-sm text-[#0D2922] dark:text-[#F1F8F4]">{item.label}</h3>
                    <p className="text-xs text-stone-500 dark:text-[#A8C4B8] mt-0.5">{item.desc}</p>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="mt-8 flex justify-end">
            <button
              onClick={() => setStep(2)}
              className="px-7 py-3.5 rounded-2xl bg-[#C99A4A] hover:bg-[#B88939] text-[#0D2922] font-extrabold text-xs sm:text-sm flex items-center gap-2.5 shadow-lg hover:shadow-xl transition-all active:scale-95"
            >
              <span>Next: Travel Party & Dates</span>
              <ArrowRight className="w-4 h-4 text-[#0D2922]" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: Travel Party & Timing */}
      {step === 2 && (
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-[#E9DFC9] shadow-sm animate-fade-in space-y-8 mt-6">
          <div>
            <h2 className="font-serif text-2xl font-bold text-[#0D2922] dark:text-[#F1F8F4] mb-1">
              2. Who is traveling and when?
            </h2>
            <p className="text-xs text-stone-500 dark:text-[#728D81]">Helps us calibrate comfort levels and track conditions</p>
          </div>

          {/* Party Style */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-[#A8C4B8] mb-3">
              Travel Party Style
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {partyOptions.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setPreferences({ ...preferences, party: item.id })}
                  className={`p-4 rounded-2xl border text-left transition-all ${
                    preferences.party === item.id
                      ? 'bg-[#FAF8F2] dark:bg-[#C99A4A]/15 border-[#0D2922] dark:border-[#C99A4A] ring-2 ring-[#0D2922] dark:ring-[#C99A4A] shadow-md'
                      : 'border-[#E9DFC9] dark:border-[#1A382F] hover:border-[#C99A4A] dark:hover:border-[#C99A4A]/60 bg-white dark:bg-white/5 hover:bg-stone-50 dark:hover:bg-white/10'
                  }`}
                >
                  <p className="font-bold text-xs text-[#0D2922] dark:text-[#F1F8F4]">{item.label}</p>
                  <p className="text-[11px] text-stone-500 dark:text-[#A8C4B8] mt-1">{item.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Timing */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-[#A8C4B8] mb-3">
              When are you planning to visit?
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {timeframeOptions.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setPreferences({ ...preferences, timeframe: item.id })}
                  className={`p-3.5 rounded-2xl border text-left transition-all ${
                    preferences.timeframe === item.id
                      ? 'bg-[#FAF8F2] dark:bg-[#C99A4A]/15 border-[#0D2922] dark:border-[#C99A4A] ring-2 ring-[#0D2922] dark:ring-[#C99A4A] shadow-md'
                      : 'border-[#E9DFC9] dark:border-[#1A382F] hover:border-[#C99A4A] dark:hover:border-[#C99A4A]/60 bg-white dark:bg-white/5 hover:bg-stone-50 dark:hover:bg-white/10'
                  }`}
                >
                  <p className="font-bold text-xs text-[#0D2922] dark:text-[#F1F8F4]">{item.label}</p>
                  <p className="text-[10px] text-[#C99A4A] font-bold mt-0.5">{item.note}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-between pt-4 border-t border-[#F0ECE1] dark:border-[#132E27]">
            <button
              onClick={() => setStep(1)}
              className="px-5 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-300 text-xs font-bold hover:bg-stone-50 dark:hover:bg-white/10 transition"
            >
              Back
            </button>
            <button
              onClick={() => setStep(3)}
              className="px-7 py-3.5 rounded-2xl bg-[#C99A4A] hover:bg-[#B88939] text-[#0D2922] font-extrabold text-xs sm:text-sm flex items-center gap-2.5 shadow-lg hover:shadow-xl transition-all active:scale-95"
            >
              <span>Next: Budget & Match</span>
              <ArrowRight className="w-4 h-4 text-[#0D2922]" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Budget Slider */}
      {step === 3 && (
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-[#E9DFC9] shadow-sm animate-fade-in space-y-8">
          <div>
            <h2 className="font-serif text-2xl font-bold text-[#0D2922] mb-1">
              3. Target Budget per Person
            </h2>
            <p className="text-xs text-stone-500">Including official gate permit and open safari vehicle</p>
          </div>

          <div className="bg-[#FAF8F2] p-6 rounded-3xl border border-[#E9DFC9] text-center">
            <p className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-1">Target Budget</p>
            <p className="font-serif text-4xl font-extrabold text-[#0D2922]">
              ₹{preferences.budget.toLocaleString('en-IN')}
            </p>
            <p className="text-xs text-stone-500 mt-1">per person / shift</p>

            <div className="mt-8 px-4">
              <input
                type="range"
                min="1500"
                max="8000"
                step="500"
                value={preferences.budget}
                onChange={(e) => setPreferences({ ...preferences, budget: Number(e.target.value) })}
                className="w-full accent-[#0D2922] dark:accent-[#C99A4A] cursor-pointer"
              />
              <div className="flex justify-between text-xs text-stone-400 dark:text-stone-500 mt-2 font-mono">
                <span>₹1,500</span>
                <span>₹4,000</span>
                <span>₹8,000+</span>
              </div>
            </div>
          </div>

          <div className="flex justify-between pt-4 border-t border-[#F0ECE1] dark:border-[#132E27]">
            <button
              onClick={() => setStep(2)}
              className="px-5 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-300 text-xs font-bold hover:bg-stone-50 dark:hover:bg-white/10 transition"
            >
              Back
            </button>
            <button
              onClick={handleCalculate}
              disabled={isCalculating}
              className="px-8 py-3.5 rounded-2xl bg-[#C99A4A] hover:bg-[#B88939] text-[#0D2922] font-extrabold text-xs sm:text-sm flex items-center gap-2.5 shadow-lg transition active:scale-95"
            >
              {isCalculating ? (
                <>
                  <span className="w-4 h-4 border-2 border-[#0D2922] border-t-transparent rounded-full animate-spin" />
                  <span>Calculating Wildlife Matches...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Find My Safari →</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: RECOMMENDATION RESULTS */}
      {step === 4 && results && (
        <div className="space-y-8 animate-fade-in">
          
          {/* Top Recommendation Banner */}
          <div className="relative bg-gradient-to-br from-[#0D2922] to-[#173F35] text-white rounded-3xl p-6 sm:p-10 border border-[#C99A4A]/50 shadow-2xl overflow-hidden">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#C99A4A] text-[#0D2922] uppercase tracking-wider flex items-center gap-1.5">
                  <Trophy className="w-3.5 h-3.5" />
                  Top Match For You
                </span>
              </div>

              {/* Match Score Badge */}
              <div className="flex items-baseline gap-1 bg-white/10 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/20 self-start sm:self-auto">
                <span className="font-serif text-3xl font-extrabold text-[#C99A4A]">
                  {results[0].score}%
                </span>
                <span className="text-xs uppercase font-bold text-[#E9DFC9]">Match</span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              
              {/* Image Preview */}
              <div className="lg:col-span-5 aspect-[16/10] rounded-2xl overflow-hidden shadow-lg border border-white/20">
                <img
                  src={results[0].safari.heroImage}
                  alt={results[0].safari.name}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Park Info & Reasons */}
              <div className="lg:col-span-7 space-y-4">
                <div>
                  <div className="flex items-center gap-2 text-xs text-[#E9DFC9]/80 mb-1">
                    <MapPin className="w-3.5 h-3.5 text-[#C99A4A]" />
                    <span>{results[0].safari.state}, India</span>
                    <span>·</span>
                    <div className="flex items-center gap-1 text-[#C99A4A]">
                      <Star className="w-3.5 h-3.5 fill-current" />
                      <span>{results[0].safari.rating} ({results[0].safari.reviewCount} reviews)</span>
                    </div>
                  </div>

                  <h3 className="font-serif text-2xl sm:text-3xl font-bold text-white">
                    {results[0].safari.name}
                  </h3>
                  <p className="text-xs text-[#E9DFC9]/80 italic mt-0.5">
                    "{results[0].safari.subtitle}"
                  </p>
                </div>

                {/* Match Reasons */}
                <div className="bg-black/30 rounded-2xl p-4 border border-white/10 space-y-2">
                  <p className="text-xs font-bold uppercase tracking-wider text-[#C99A4A]">
                    Why our engine recommends this:
                  </p>
                  {results[0].reasons.map((r, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-[#E9DFC9]/90">
                      <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                      <span>{r}</span>
                    </div>
                  ))}
                </div>

                {/* Pricing & CTA */}
                <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
                  <div>
                    <span className="text-[11px] text-stone-300 uppercase font-semibold">Available from</span>
                    <p className="text-xl font-bold text-white">
                      ₹{results[0].safari.pricePerPerson.toLocaleString('en-IN')}{" "}
                      <span className="text-xs font-normal text-[#E9DFC9]/70">/ person</span>
                    </p>
                  </div>

                  <button
                    onClick={() => onSelectSafari(results[0].safari.id)}
                    className="px-6 py-3 rounded-2xl bg-[#C99A4A] hover:bg-[#B88939] text-[#0D2922] font-bold text-xs sm:text-sm flex items-center gap-2 shadow-xl transition active:scale-95"
                  >
                    <span>View Safari & Reserve Slot</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

              </div>

            </div>
          </div>

          {/* Runner-up Matches */}
          <div>
            <h3 className="font-serif text-xl font-bold text-[#0D2922] dark:text-[#F1F8F4] mb-4">
              Alternative Strong Matches
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {results.slice(1, 3).map((item) => (
                <div
                  key={item.safari.id}
                  className="bg-white dark:bg-[#0D201A] rounded-2xl p-5 border border-[#E9DFC9] dark:border-[#1A382F] shadow-sm flex items-center justify-between gap-4 hover:shadow-md transition"
                >
                  <div className="space-y-1">
                    <div className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-950 border border-amber-300 dark:bg-[#C99A4A]/20 dark:text-[#E5B560] dark:border-[#C99A4A]/40">
                      {item.score}% Match
                    </div>
                    <h4 className="font-serif font-bold text-base text-[#0D2922] dark:text-[#F1F8F4]">
                      {item.safari.name}
                    </h4>
                    <p className="text-xs text-stone-500 dark:text-[#A8C4B8]">
                      ₹{item.safari.pricePerPerson.toLocaleString('en-IN')} / person · {item.safari.state}
                    </p>
                  </div>

                  <button
                    onClick={() => onSelectSafari(item.safari.id)}
                    className="px-4 py-2 rounded-xl bg-[#0D2922] hover:bg-[#173F35] dark:bg-[#173F35] dark:hover:bg-[#205244] text-white dark:text-emerald-100 border border-transparent dark:border-emerald-700/40 text-xs font-bold transition flex items-center gap-1.5 flex-shrink-0"
                  >
                    <span>Details</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Retake button */}
          <div className="text-center pt-4">
            <button
              onClick={handleReset}
              className="inline-flex items-center gap-2 text-xs font-bold text-stone-600 hover:text-[#0D2922] transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Retake Preference Quiz</span>
            </button>
          </div>

        </div>
      )}

    </div>
  );
}
