import React, { useState } from 'react';
import { getRecommendedSafaris } from '../utils/recommendationEngine';
import {
  ArrowRight,
  Check,
  RotateCcw,
  Star,
  MapPin,
  Trophy,
  Compass,
  Eye,
  Shield,
  Feather,
  Trees,
  Footprints,
} from 'lucide-react';

export default function SafariFinderPage({ onSelectSafari }) {
  const [step, setStep] = useState(1);
  const [preferences, setPreferences] = useState({
    wildlife: 'tiger',
    timeframe: 'next-month',
    budget: 5000,
    party: 'family',
    region: 'any',
  });

  const [results, setResults] = useState(null);
  const [isCalculating, setIsCalculating] = useState(false);

  const wildlifeOptions = [
    {
      id: 'tiger',
      label: 'Royal Bengal Tigers',
      Icon: Footprints,
      desc: 'Top priority territorial big-cat tracks & waterholes',
    },
    {
      id: 'elephant',
      label: 'Wild Asian Elephants',
      Icon: Trees,
      desc: 'Ramganga river valleys & matriarch herds',
    },
    {
      id: 'leopard',
      label: 'Indian Leopards',
      Icon: Eye,
      desc: 'Rocky escarpments & Sal canopy stealth zones',
    },
    {
      id: 'rhino',
      label: 'One-Horned Rhinos',
      Icon: Shield,
      desc: 'Brahmaputra floodplain tall-grass wetlands',
    },
    {
      id: 'deer',
      label: 'Hardground Barasingha',
      Icon: Compass,
      desc: 'Golden Kanha meadows & endemic cervids',
    },
    {
      id: 'bird',
      label: 'Avian Raptors & Macaws',
      Icon: Feather,
      desc: 'Canopy birding & riverine kingfisher corridors',
    },
  ];

  const partyOptions = [
    {
      id: 'family',
      label: 'Family with Elders / Kids',
      desc: 'Gentle routes, rest points, and comfortable open-top seating',
    },
    {
      id: 'photographer',
      label: 'Wildlife Photographer',
      desc: 'Unobstructed 4x4 Gypsies with prime golden-hour light angles',
    },
    {
      id: 'solo',
      label: 'Expedition Trackers & Friends',
      desc: 'Intense core-zone tracking and deep trail exploration',
    },
  ];

  const timeframeOptions = [
    { id: 'this-week', label: 'This Week', note: 'Immediate gate availability' },
    { id: 'this-month', label: 'Within 30 Days', note: 'Prime upcoming slots' },
    { id: 'next-month', label: 'Winter / Spring Peak', note: 'Highest sighting index' },
  ];

  const handleCalculate = () => {
    setIsCalculating(true);
    setTimeout(() => {
      const calculated = getRecommendedSafaris(preferences);
      setResults(calculated);
      setIsCalculating(false);
      setStep(4);
    }, 520);
  };

  const handleReset = () => {
    setStep(1);
    setResults(null);
  };

  return (
    <div className="min-h-screen">
      {/* Editorial Deep Canopy Emerald Header Strip */}
      <section className="bg-gradient-to-b from-[#09211A] to-[#0D2922] border-b border-[#265244] text-[#F4EBDA]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-12 text-center">
          <h1 className="font-serif text-3xl sm:text-5xl font-bold text-[#F8F3E8] tracking-tight">
            Safari Corridor Match Finder
          </h1>
          <p className="text-xs sm:text-sm text-[#C8D8D0] mt-2 max-w-xl mx-auto leading-relaxed">
            Calibrate three quick expedition preferences to cross-reference waterhole sighting indices, seasonal gate openings, and Gypsy permit fares.
          </p>

          {/* Step Indicator */}
          {step < 4 && (
            <div className="flex items-center justify-center gap-3 sm:gap-4 mt-8">
              {[
                { num: 1, label: 'Target Species' },
                { num: 2, label: 'Party & Season' },
                { num: 3, label: 'Permit Budget' },
              ].map((s) => (
                <div key={s.num} className="flex items-center gap-2.5">
                  <div
                    className={`w-8 h-8 rounded-full font-mono tabular-nums flex items-center justify-center text-xs font-bold transition-all ${
                      step === s.num
                        ? 'bg-[#C99A4A] text-[#0D2922] ring-4 ring-[#C99A4A]/25 scale-105'
                        : step > s.num
                        ? 'bg-[#173F35] text-[#86EFAC] border border-[#4ADE80]/40'
                        : 'bg-[#071713] text-[#9AB3A8] border border-[#265244]'
                    }`}
                  >
                    {step > s.num ? <Check className="w-4 h-4" /> : s.num}
                  </div>
                  <span
                    className={`hidden sm:inline text-xs font-medium ${
                      step === s.num ? 'text-[#F8F3E8] font-bold' : 'text-[#9AB3A8]'
                    }`}
                  >
                    {s.label}
                  </span>
                  {s.num < 3 && (
                    <div
                      className={`w-8 sm:w-12 h-0.5 rounded-full transition-colors ${
                        step > s.num ? 'bg-[#C99A4A]' : 'bg-[#265244]'
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
        {/* STEP 1: Wildlife Interest */}
        {step === 1 && (
          <div className="bg-[#FBF8F3] dark:bg-[#0B221B] rounded-2xl p-6 sm:p-10 border border-[#D8CEBE] dark:border-[#244E40] shadow-sm animate-fade-in">
            <div className="mb-6">
              <span className="text-xs font-mono uppercase tracking-wider text-[#B88428] dark:text-[#E4B865]">
                Step 01 of 03
              </span>
              <h2 className="font-serif text-2xl font-bold text-[#14261F] dark:text-[#F8F3E8] mt-0.5">
                Which wildlife encounter tops your field checklist?
              </h2>
              <p className="text-xs text-[#43564E] dark:text-[#9AB3A8] mt-1">
                Select your primary tracking priority to weight reserve sighting probabilities.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {wildlifeOptions.map((item) => {
                const isSelected = preferences.wildlife === item.id;
                const IconComponent = item.Icon;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setPreferences({ ...preferences, wildlife: item.id })}
                    className={`p-4 rounded-xl border text-left flex items-start gap-3.5 transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#EFE6D7] dark:bg-[#133329] border-[#0D2922] dark:border-[#C99A4A] ring-2 ring-[#0D2922] dark:ring-[#C99A4A] shadow-sm'
                        : 'border-[#D8CEBE] dark:border-[#244E40] hover:border-[#C99A4A] bg-white dark:bg-[#071713]'
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                        isSelected
                          ? 'bg-[#0D2922] text-[#E4B865] border-[#C99A4A]/50'
                          : 'bg-[#F5EFE6] dark:bg-[#0B221B] text-[#0D2922] dark:text-[#C99A4A] border-[#D8CEBE] dark:border-[#265244]'
                      }`}
                    >
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-[#14261F] dark:text-[#F8F3E8]">
                        {item.label}
                      </h3>
                      <p className="text-xs text-[#43564E] dark:text-[#B8CEC4] mt-0.5 leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="mt-8 flex justify-end">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-6 py-3 rounded-xl bg-[#C99A4A] hover:bg-[#D8AA5B] text-[#0D2922] font-bold text-xs sm:text-sm flex items-center gap-2 shadow-md transition-all cursor-pointer"
              >
                <span>Next: Travel Party &amp; Season</span>
                <ArrowRight className="w-4 h-4 text-[#0D2922]" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Travel Party & Timing */}
        {step === 2 && (
          <div className="bg-[#FBF8F3] dark:bg-[#0B221B] rounded-2xl p-6 sm:p-10 border border-[#D8CEBE] dark:border-[#244E40] shadow-sm animate-fade-in space-y-8">
            <div>
              <span className="text-xs font-mono uppercase tracking-wider text-[#B88428] dark:text-[#E4B865]">
                Step 02 of 03
              </span>
              <h2 className="font-serif text-2xl font-bold text-[#14261F] dark:text-[#F8F3E8] mt-0.5">
                Who is joining the expedition and when?
              </h2>
              <p className="text-xs text-[#43564E] dark:text-[#9AB3A8] mt-1">
                Helps us balance terrain comfort, zone distance, and seasonal foliage density.
              </p>
            </div>

            {/* Party Style */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#43564E] dark:text-[#B8CEC4] mb-3">
                Travel Party Style
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                {partyOptions.map((item) => {
                  const isSelected = preferences.party === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setPreferences({ ...preferences, party: item.id })}
                      className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#EFE6D7] dark:bg-[#133329] border-[#0D2922] dark:border-[#C99A4A] ring-2 ring-[#0D2922] dark:ring-[#C99A4A]'
                          : 'border-[#D8CEBE] dark:border-[#244E40] hover:border-[#C99A4A] bg-white dark:bg-[#071713]'
                      }`}
                    >
                      <p className="font-bold text-xs text-[#14261F] dark:text-[#F8F3E8]">
                        {item.label}
                      </p>
                      <p className="text-xs text-[#43564E] dark:text-[#B8CEC4] mt-1 leading-relaxed">
                        {item.desc}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Timing */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#43564E] dark:text-[#B8CEC4] mb-3">
                Preferred Expedition Window
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                {timeframeOptions.map((item) => {
                  const isSelected = preferences.timeframe === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setPreferences({ ...preferences, timeframe: item.id })}
                      className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#EFE6D7] dark:bg-[#133329] border-[#0D2922] dark:border-[#C99A4A] ring-2 ring-[#0D2922] dark:ring-[#C99A4A]'
                          : 'border-[#D8CEBE] dark:border-[#244E40] hover:border-[#C99A4A] bg-white dark:bg-[#071713]'
                      }`}
                    >
                      <p className="font-bold text-xs text-[#14261F] dark:text-[#F8F3E8]">
                        {item.label}
                      </p>
                      <p className="text-xs text-[#B88428] dark:text-[#E4B865] font-semibold mt-1">
                        {item.note}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-between pt-4 border-t border-[#E5DEC9] dark:border-[#1D4337]">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-5 py-2.5 rounded-xl border border-[#D8CEBE] dark:border-[#265244] text-[#43564E] dark:text-[#C8D8D0] text-xs font-bold hover:bg-[#EFE6D7] dark:hover:bg-white/5 transition cursor-pointer"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => setStep(3)}
                className="px-6 py-3 rounded-xl bg-[#C99A4A] hover:bg-[#D8AA5B] text-[#0D2922] font-bold text-xs sm:text-sm flex items-center gap-2 shadow-md transition-all cursor-pointer"
              >
                <span>Next: Permit Budget</span>
                <ArrowRight className="w-4 h-4 text-[#0D2922]" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Budget Slider */}
        {step === 3 && (
          <div className="bg-[#FBF8F3] dark:bg-[#0B221B] rounded-2xl p-6 sm:p-10 border border-[#D8CEBE] dark:border-[#244E40] shadow-sm animate-fade-in space-y-8">
            <div>
              <span className="text-xs font-mono uppercase tracking-wider text-[#B88428] dark:text-[#E4B865]">
                Step 03 of 03
              </span>
              <h2 className="font-serif text-2xl font-bold text-[#14261F] dark:text-[#F8F3E8] mt-0.5">
                Target Permit &amp; Gypsy Fare per Guest
              </h2>
              <p className="text-xs text-[#43564E] dark:text-[#9AB3A8] mt-1">
                Includes official state forest department gate entry and licensed naturalist guide.
              </p>
            </div>

            <div className="bg-white dark:bg-[#071713] p-6 rounded-2xl border border-[#D8CEBE] dark:border-[#265244] text-center">
              <p className="text-xs font-mono uppercase tracking-wider text-[#64776E] dark:text-[#9AB3A8] mb-1">
                Target Fare Ceiling
              </p>
              <p className="font-serif font-mono tabular-nums text-4xl font-bold text-[#0D2922] dark:text-[#E4B865]">
                ₹{preferences.budget.toLocaleString('en-IN')}
              </p>
              <p className="text-xs text-[#64776E] dark:text-[#9AB3A8] mt-1">per guest / safari shift</p>

              <div className="mt-7 px-4">
                <input
                  type="range"
                  min="1500"
                  max="8000"
                  step="500"
                  value={preferences.budget}
                  onChange={(e) => setPreferences({ ...preferences, budget: Number(e.target.value) })}
                  className="w-full accent-[#0D2922] dark:accent-[#C99A4A] cursor-pointer"
                />
                <div className="flex justify-between text-xs text-[#64776E] dark:text-[#88A398] mt-2 font-mono tabular-nums">
                  <span>₹1,500</span>
                  <span>₹4,000</span>
                  <span>₹8,000+</span>
                </div>
              </div>
            </div>

            <div className="flex justify-between pt-4 border-t border-[#E5DEC9] dark:border-[#1D4337]">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-5 py-2.5 rounded-xl border border-[#D8CEBE] dark:border-[#265244] text-[#43564E] dark:text-[#C8D8D0] text-xs font-bold hover:bg-[#EFE6D7] dark:hover:bg-white/5 transition cursor-pointer"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleCalculate}
                disabled={isCalculating}
                className="px-7 py-3 rounded-xl bg-[#C99A4A] hover:bg-[#D8AA5B] text-[#0D2922] font-bold text-xs sm:text-sm flex items-center gap-2 shadow-md transition cursor-pointer"
              >
                {isCalculating ? (
                  <>
                    <span className="w-4 h-4 border-2 border-[#0D2922] border-t-transparent rounded-full animate-spin" />
                    <span>Evaluating Corridors...</span>
                  </>
                ) : (
                  <>
                    <Compass className="w-4 h-4" />
                    <span>Match My Safari Corridor</span>
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
            <div className="relative bg-gradient-to-br from-[#09211A] to-[#0D2922] text-[#F4EBDA] rounded-2xl p-6 sm:p-10 border border-[#C99A4A]/55 shadow-2xl overflow-hidden">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <span className="px-3 py-1 rounded-lg text-xs font-bold bg-[#C99A4A] text-[#0D2922] uppercase tracking-wider inline-flex items-center gap-1.5 self-start">
                  <Trophy className="w-3.5 h-3.5" />
                  <span>Primary Corridor Match</span>
                </span>

                <div className="flex items-baseline gap-1.5 bg-[#071713]/80 px-4 py-2 rounded-xl border border-[#265244] self-start sm:self-auto">
                  <span className="font-mono tabular-nums text-2xl sm:text-3xl font-bold text-[#E4B865]">
                    {results[0].score}%
                  </span>
                  <span className="text-xs uppercase font-mono tracking-wider text-[#B8CEC4]">
                    Match Index
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                {/* Image Preview */}
                <div className="lg:col-span-5 aspect-[16/10] rounded-xl overflow-hidden shadow-lg border border-[#265244]">
                  <img
                    src={results[0].safari.heroImage}
                    alt={results[0].safari.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Park Info & Reasons */}
                <div className="lg:col-span-7 space-y-4">
                  <div>
                    <div className="flex items-center gap-2 text-xs text-[#C8D8D0] mb-1">
                      <MapPin className="w-3.5 h-3.5 text-[#C99A4A]" />
                      <span>{results[0].safari.state}, India</span>
                      <span>·</span>
                      <div className="flex items-center gap-1 text-[#E4B865] font-mono tabular-nums">
                        <Star className="w-3.5 h-3.5 fill-current" />
                        <span>
                          {results[0].safari.rating} ({results[0].safari.reviewCount} reviews)
                        </span>
                      </div>
                    </div>

                    <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#F8F3E8]">
                      {results[0].safari.name}
                    </h3>
                    <p className="text-xs text-[#C8D8D0] italic mt-0.5">
                      &ldquo;{results[0].safari.subtitle}&rdquo;
                    </p>
                  </div>

                  {/* Match Reasons */}
                  <div className="bg-[#071713]/75 rounded-xl p-4 border border-[#265244] space-y-2">
                    <p className="text-xs font-mono font-bold uppercase tracking-wider text-[#E4B865]">
                      Naturalist Telemetry Match Factors
                    </p>
                    {results[0].reasons.map((r, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs text-[#E9DFC9]">
                        <Check className="w-3.5 h-3.5 text-[#4ADE80] shrink-0 mt-0.5" />
                        <span>{r}</span>
                      </div>
                    ))}
                  </div>

                  {/* Pricing & CTA */}
                  <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
                    <div>
                      <span className="text-[11px] font-mono text-[#9AB3A8] uppercase tracking-wider">
                        Official Gate Fare
                      </span>
                      <p className="text-xl font-mono font-bold tabular-nums text-[#F8F3E8]">
                        ₹{results[0].safari.pricePerPerson.toLocaleString('en-IN')}{' '}
                        <span className="text-xs font-sans font-normal text-[#B8CEC4]">/ guest</span>
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => onSelectSafari(results[0].safari.id)}
                      className="px-6 py-3 rounded-xl bg-[#C99A4A] hover:bg-[#D8AA5B] text-[#0D2922] font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg transition cursor-pointer"
                    >
                      <span>Inspect Reserve &amp; Slots</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Runner-up Matches */}
            <div>
              <h3 className="font-serif text-xl font-bold text-[#14261F] dark:text-[#F8F3E8] mb-4">
                Alternative Strong Reserve Matches
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {results.slice(1, 3).map((item) => (
                  <div
                    key={item.safari.id}
                    className="bg-[#FBF8F3] dark:bg-[#0B221B] rounded-2xl p-5 border border-[#D8CEBE] dark:border-[#244E40] shadow-sm flex items-center justify-between gap-4 hover:border-[#C99A4A]/60 transition"
                  >
                    <div className="space-y-1">
                      <div className="inline-block px-2.5 py-0.5 rounded-md text-xs font-mono font-bold tabular-nums bg-[#C99A4A]/20 text-[#0D2922] dark:text-[#E4B865] border border-[#C99A4A]/40">
                        {item.score}% Match
                      </div>
                      <h4 className="font-serif font-bold text-base text-[#14261F] dark:text-[#F8F3E8]">
                        {item.safari.name}
                      </h4>
                      <p className="text-xs font-mono tabular-nums text-[#43564E] dark:text-[#B8CEC4]">
                        ₹{item.safari.pricePerPerson.toLocaleString('en-IN')} / guest · {item.safari.state}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => onSelectSafari(item.safari.id)}
                      className="px-4 py-2.5 rounded-xl bg-[#0D2922] hover:bg-[#173F35] dark:bg-[#173F35] dark:hover:bg-[#215448] text-[#F8F3E8] text-xs font-bold transition flex items-center gap-1.5 shrink-0 cursor-pointer"
                    >
                      <span>Details</span>
                      <ArrowRight className="w-3.5 h-3.5 text-[#C99A4A]" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Retake button */}
            <div className="text-center pt-2">
              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center gap-2 text-xs font-bold text-[#43564E] dark:text-[#B8CEC4] hover:text-[#0D2922] dark:hover:text-[#E4B865] transition cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Recalibrate Safari Preferences</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
