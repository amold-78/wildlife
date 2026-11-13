import React, { useState, useRef, useEffect } from 'react';
import { SAFARIS } from '../data/safaris';
import { WILDLIFE_DATA } from '../data/wildlife';
import { useBooking } from '../context/BookingContext';
import {
  Compass,
  Calendar,
  Users,
  Search,
  Star,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Heart,
  Eye,
  MapPin,
  Clock,
  Flame,
  Radio,
  ChevronDown,
  Check
} from 'lucide-react';

export default function HomePage({ onSelectSafari, onNavigate }) {
  const { wishlist, toggleWishlist, setSearchFilters } = useBooking();

  // Search Box Local States
  const [selectedDestination, setSelectedDestination] = useState("tadoba-andhari");
  const [selectedDate, setSelectedDate] = useState("2026-10-18");
  const [guestCount, setGuestCount] = useState(2);

  // Custom Dropdown Menus
  const [destOpen, setDestOpen] = useState(false);
  const [travelersOpen, setTravelersOpen] = useState(false);
  const destRef = useRef(null);
  const travelersRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (destRef.current && !destRef.current.contains(event.target)) {
        setDestOpen(false);
      }
      if (travelersRef.current && !travelersRef.current.contains(event.target)) {
        setTravelersOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentSafari = SAFARIS.find(s => s.id === selectedDestination) || SAFARIS[0];

  const handleHeroSearch = (e) => {
    e.preventDefault();
    const safari = SAFARIS.find(s => s.id === selectedDestination);
    if (safari) {
      onSelectSafari(safari.id);
    } else {
      onNavigate('explore');
    }
  };

  return (
    <div className="space-y-20 pb-20">
      
      {/* 1. HERO SECTION */}
      <section className="relative min-h-[640px] lg:min-h-[720px] flex items-center justify-center bg-[#0D2922] text-white overflow-hidden px-4 sm:px-6">
        
        {/* Immersive Background Image with cinematic overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1549480017-d76466a4b7e8?auto=format&fit=crop&w=2000&q=85"
            alt="Royal Bengal Tiger in Tadoba Forest"
            className="w-full h-full object-cover object-center brightness-75 scale-105 transform hover:scale-100 transition-transform duration-1000 ease-out"
          />
          {/* Subtle gradient scrim */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0D2922] via-[#0D2922]/50 to-black/30" />
        </div>

        {/* Content Container */}
        <div className="relative z-10 max-w-5xl mx-auto text-center pt-8 pb-16">
          
          {/* Live Field Sighting Pill */}
          <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-black/40 backdrop-blur-md border border-[#C99A4A]/40 text-[#E9DFC9] text-xs font-semibold mb-6 animate-pulse">
            <Radio className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-[#C99A4A]">LIVE REPORT:</span>
            <span>2 Tigers & Leopard spotted at Tadoba Telia Lake dawn patrol</span>
          </div>

          <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white mb-6 leading-[1.1]">
            Find your <span className="italic text-[#C99A4A]">wild.</span>
          </h1>

          <p className="max-w-2xl mx-auto text-base sm:text-lg text-[#E9DFC9]/90 font-light leading-relaxed mb-10">
            Experience India's most extraordinary jungle safaris. Official gate permits, live slot availability, and verified naturalist expeditions across India's premier tiger sanctuaries.
          </p>

          {/* Interactive Hero Search Engine Card */}
          <div className="max-w-4xl mx-auto bg-white/95 dark:bg-[#0D201A]/95 backdrop-blur-xl p-2 sm:p-3 rounded-3xl shadow-2xl border border-[#E9DFC9] dark:border-[#1E3F35] transition-all">
            <form onSubmit={handleHeroSearch} className="grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-3 items-center">
              
              {/* Where to go (Custom Luxury Dropdown) */}
              <div 
                ref={destRef}
                className="sm:col-span-4 text-left px-3.5 py-2.5 rounded-2xl hover:bg-[#FAF8F2] dark:hover:bg-white/5 transition cursor-pointer relative"
              >
                <div onClick={() => { setDestOpen(!destOpen); setTravelersOpen(false); }}>
                  <span className="block text-[10px] font-bold uppercase tracking-widest text-[#C99A4A] mb-1">
                    Destination
                  </span>
                  <div className="flex items-center justify-between gap-1">
                    <div className="flex items-center gap-2 min-w-0">
                      <MapPin className="w-4 h-4 text-[#C99A4A] shrink-0" />
                      <span className="font-bold text-stone-900 dark:text-[#F1F8F4] text-xs sm:text-sm truncate">
                        {currentSafari.name.replace(" Tiger Reserve", "").replace(" National Park", "")} · {currentSafari.state}
                      </span>
                    </div>
                    <ChevronDown className={`w-3.5 h-3.5 text-stone-400 shrink-0 transition-transform ${destOpen ? 'rotate-180' : ''}`} />
                  </div>
                </div>

                {/* Custom Options Popover */}
                {destOpen && (
                  <div className="absolute left-0 sm:left-auto sm:w-80 w-full top-full mt-2 bg-white dark:bg-[#0A1F18] border border-stone-200 dark:border-stone-700/80 rounded-2xl shadow-2xl p-1.5 z-50 text-left max-h-72 overflow-y-auto">
                    {SAFARIS.map((s) => {
                      const isSelected = s.id === selectedDestination;
                      return (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => {
                            setSelectedDestination(s.id);
                            setDestOpen(false);
                          }}
                          className={`w-full px-3 py-2.5 rounded-xl text-xs flex items-center justify-between transition cursor-pointer ${
                            isSelected
                              ? 'bg-emerald-50 dark:bg-emerald-950/70 text-emerald-900 dark:text-emerald-300 font-bold'
                              : 'text-stone-800 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800/80'
                          }`}
                        >
                          <div>
                            <div className="font-bold text-stone-900 dark:text-stone-100 text-xs">
                              {s.name}
                            </div>
                            <div className="text-[11px] text-stone-500 dark:text-stone-400">
                              {s.state} · {s.highlight}
                            </div>
                          </div>
                          {isSelected && <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 ml-2" />}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Date */}
              <div className="sm:col-span-3 text-left px-3.5 py-2.5 rounded-2xl hover:bg-[#FAF8F2] dark:hover:bg-white/5 transition border-t sm:border-t-0 sm:border-l border-stone-200 dark:border-[#1A382F]">
                <span className="block text-[10px] font-bold uppercase tracking-widest text-[#C99A4A] mb-1">
                  Expedition Date
                </span>
                <div className="flex items-center gap-2.5">
                  <Calendar className="w-4 h-4 text-[#C99A4A] flex-shrink-0" />
                  <input
                    type="date"
                    value={selectedDate}
                    min="2026-10-06"
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full bg-transparent font-bold text-stone-900 dark:text-[#F1F8F4] text-xs sm:text-sm focus:outline-none cursor-pointer border-none"
                  />
                </div>
              </div>

              {/* Travelers (Custom Luxury Dropdown) */}
              <div 
                ref={travelersRef}
                className="sm:col-span-2 text-left px-3.5 py-2.5 rounded-2xl hover:bg-[#FAF8F2] dark:hover:bg-white/5 transition border-t sm:border-t-0 sm:border-l border-stone-200 dark:border-[#1A382F] relative"
              >
                <div onClick={() => { setTravelersOpen(!travelersOpen); setDestOpen(false); }}>
                  <span className="block text-[10px] font-bold uppercase tracking-widest text-[#C99A4A] mb-1">
                    Travelers
                  </span>
                  <div className="flex items-center justify-between gap-1">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-[#C99A4A] flex-shrink-0" />
                      <span className="font-bold text-stone-900 dark:text-[#F1F8F4] text-xs sm:text-sm">
                        {guestCount === 1 ? '1 Guest' : guestCount === 6 ? '6 (Gypsy)' : `${guestCount} Guests`}
                      </span>
                    </div>
                    <ChevronDown className={`w-3.5 h-3.5 text-stone-400 shrink-0 transition-transform ${travelersOpen ? 'rotate-180' : ''}`} />
                  </div>
                </div>

                {/* Custom Options Popover */}
                {travelersOpen && (
                  <div className="absolute left-0 sm:left-auto sm:w-44 w-full top-full mt-2 bg-white dark:bg-[#0A1F18] border border-stone-200 dark:border-stone-700/80 rounded-2xl shadow-2xl p-1.5 z-50 text-left">
                    {[
                      { count: 1, label: '1 Guest' },
                      { count: 2, label: '2 Guests' },
                      { count: 4, label: '4 Guests' },
                      { count: 6, label: '6 (Full Gypsy)' }
                    ].map((opt) => {
                      const isSelected = guestCount === opt.count;
                      return (
                        <button
                          key={opt.count}
                          type="button"
                          onClick={() => {
                            setGuestCount(opt.count);
                            setTravelersOpen(false);
                          }}
                          className={`w-full px-3 py-2 rounded-xl text-xs font-medium flex items-center justify-between transition cursor-pointer ${
                            isSelected
                              ? 'bg-emerald-50 dark:bg-emerald-950/70 text-emerald-900 dark:text-emerald-300 font-bold'
                              : 'text-stone-800 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800/80'
                          }`}
                        >
                          <span>{opt.label}</span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* CTA Button */}
              <div className="sm:col-span-3 pt-2 sm:pt-0">
                <button
                  type="submit"
                  className="w-full h-12 rounded-2xl bg-[#0D2922] dark:bg-[#C99A4A] hover:bg-[#173F35] dark:hover:bg-[#B88939] text-white dark:text-[#0D2922] font-bold text-sm flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all active:scale-95"
                >
                  <span>Explore Safaris</span>
                  <ArrowRight className="w-4 h-4 text-[#C99A4A] dark:text-[#0D2922]" />
                </button>
              </div>

            </form>
          </div>

          {/* Key Quick Badges */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-[#E9DFC9]/80">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#C99A4A]" />
              Official Forest Dept Gate Permits
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#C99A4A]" />
              Govt-Licensed Forest Naturalists
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#C99A4A]" />
              Instant Confirmation & Passes
            </span>
          </div>

        </div>
      </section>

      {/* 2. POPULAR DESTINATIONS GRID */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#C99A4A] mb-2">
              <Flame className="w-4 h-4 text-[#C99A4A]" />
              <span>Prime Tiger Reserves</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#0D2922]">
              Popular Safari Destinations
            </h2>
          </div>
          <button
            onClick={() => onNavigate('explore')}
            className="mt-4 sm:mt-0 inline-flex items-center gap-2 text-sm font-bold text-[#173F35] hover:text-[#0D2922] group"
          >
            <span>View all 6 Tiger Reserves</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {SAFARIS.map((safari) => {
            const isSaved = wishlist.includes(safari.id);
            return (
              <div
                key={safari.id}
                className="group rounded-3xl bg-white border border-[#E9DFC9] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col"
              >
                {/* Image & Badges */}
                <div className="relative aspect-[16/10] overflow-hidden bg-stone-100">
                  <img
                    src={safari.heroImage}
                    alt={safari.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                    loading="lazy"
                  />
                  
                  {/* Top Badge */}
                  <div className="absolute top-3 left-3">
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#0D2922]/90 text-white backdrop-blur-md border border-white/20">
                      {safari.highlight}
                    </span>
                  </div>

                  {/* Wishlist Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleWishlist(safari.id);
                    }}
                    className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition ${
                      isSaved
                        ? 'bg-rose-500 text-white'
                        : 'bg-black/40 text-white hover:bg-black/60'
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
                  </button>

                  {/* Sighting Probability Pill */}
                  <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md rounded-xl px-3 py-1 text-[11px] text-[#E9DFC9] flex items-center gap-1.5 border border-white/10">
                    <span>🐅 Tiger Index:</span>
                    <span className="font-bold text-emerald-400">
                      {safari.wildlifeProbabilities[0]?.probability || "High"}
                    </span>
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between text-xs text-stone-500 mb-2">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-stone-400" />
                        {safari.state}, India
                      </span>
                      <div className="flex items-center gap-1 text-[#C99A4A] font-bold">
                        <Star className="w-3.5 h-3.5 fill-current" />
                        <span>{safari.rating}</span>
                        <span className="text-stone-400 font-normal">({safari.reviewCount})</span>
                      </div>
                    </div>

                    <h3 className="font-serif text-xl font-bold text-[#0D2922] group-hover:text-[#173F35] transition-colors line-clamp-1 mb-2">
                      {safari.name}
                    </h3>

                    <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed mb-4">
                      {safari.overview}
                    </p>
                  </div>

                  {/* Footer Price & Action */}
                  <div className="pt-4 border-t border-[#F0ECE1] flex items-center justify-between">
                    <div>
                      <p className="text-[10px] uppercase font-bold text-stone-400">Starting from</p>
                      <p className="text-lg font-bold text-[#0D2922]">
                        ₹{safari.pricePerPerson.toLocaleString('en-IN')}{" "}
                        <span className="text-xs font-normal text-stone-500">/ person</span>
                      </p>
                    </div>

                    <button
                      onClick={() => onSelectSafari(safari.id)}
                      className="px-4 py-2 rounded-xl bg-[#0D2922] dark:bg-[#C99A4A] hover:bg-[#173F35] dark:hover:bg-[#B88939] text-white dark:text-[#0D2922] text-xs font-bold transition flex items-center gap-1.5 group-hover:gap-2 shadow-sm"
                    >
                      <span>Explore</span>
                      <ArrowRight className="w-3.5 h-3.5 text-[#C99A4A] dark:text-[#0D2922]" />
                    </button>
                  </div>

                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. THE "SAFARI FINDER" HERO BANNER 🔥 */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl bg-gradient-to-br from-[#173F35] to-[#0D2922] text-white p-8 sm:p-14 overflow-hidden shadow-2xl border border-[#C99A4A]/30">
          
          {/* Subtle background graphics */}
          <div className="absolute right-0 top-0 bottom-0 w-1/2 opacity-15 pointer-events-none flex items-center justify-center">
            <span className="text-[280px]">🧭</span>
          </div>

          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#C99A4A]/20 border border-[#C99A4A]/40 text-[#C99A4A] text-xs font-bold uppercase tracking-wider mb-4">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Smart Recommendation Engine</span>
            </div>

            <h2 className="font-serif text-3xl sm:text-5xl font-extrabold text-white leading-tight mb-4">
              Not sure where to go?
            </h2>

            <p className="text-[#E9DFC9]/90 text-sm sm:text-base leading-relaxed mb-8">
              Tell us your wishlist animal, travel budget, and month. Our intelligent matching engine cross-references tiger sighting probabilities, vehicle accessibility, and seasonal weather to deliver your tailor-made expedition.
            </p>

            <div className="flex flex-wrap items-center gap-4">
              <button
                onClick={() => onNavigate('finder')}
                className="px-6 py-3.5 rounded-2xl bg-[#C99A4A] hover:bg-[#B88939] text-[#0D2922] font-bold text-sm flex items-center gap-2.5 shadow-xl transition-all active:scale-95"
              >
                <span>Launch Safari Finder Quiz</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="text-xs text-[#E9DFC9]/70 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>Takes less than 60 seconds · Instant match score</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. WILDLIFE DISCOVERY SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <p className="text-xs font-bold uppercase tracking-wider text-[#C99A4A] mb-2">
            Meet the Species
          </p>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#0D2922]">
            Iconic Wildlife of the Indian Jungles
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 mt-2">
            Discover the rare apex predators and megaherbivores protected within our certified national parks.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {WILDLIFE_DATA.slice(0, 4).map((animal) => (
            <div
              key={animal.id}
              className="bg-white rounded-3xl border border-[#E9DFC9] overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col"
            >
              <div className="aspect-square relative overflow-hidden bg-stone-100">
                <img
                  src={animal.image}
                  alt={animal.name}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                <div className="absolute top-3 left-3 w-8 h-8 rounded-full bg-[#0D2922]/80 backdrop-blur-md flex items-center justify-center text-lg">
                  {animal.icon}
                </div>
                <div className="absolute bottom-3 left-3 right-3 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 text-white text-[11px]">
                  <span className="text-stone-300">Status: </span>
                  <span className="font-semibold text-[#C99A4A]">{animal.conservationStatus}</span>
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-serif font-bold text-lg text-[#0D2922]">
                    {animal.name}
                  </h3>
                  <p className="text-[11px] italic text-stone-500 font-serif mb-3">
                    {animal.scientificName}
                  </p>
                  <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">
                    {animal.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-[#F0ECE1] text-[11px] text-stone-500">
                  <span className="font-semibold text-stone-700">Prime Habitat: </span>
                  {animal.topReserves.slice(0, 2).join(', ')}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-8">
          <button
            onClick={() => onNavigate('wildlife')}
            className="px-6 py-2.5 rounded-full border border-[#0D2922] text-[#0D2922] hover:bg-[#0D2922] hover:text-white text-xs font-bold transition inline-flex items-center gap-2"
          >
            <span>Explore Full Wildlife Encyclopedia</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </section>

      {/* 5. RESPONSIBLE TOURISM PLEDGE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#FAF8F2] border border-[#E9DFC9] rounded-3xl p-8 sm:p-12">
          <div className="max-w-3xl mx-auto text-center mb-10">
            <span className="text-3xl mb-3 block">🌿</span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#0D2922]">
              Leave only footprints. Take only photographs.
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 mt-2">
              Wildlife tourism succeeds only when we respect the tranquility of natural habitats. Every WildTrail traveler pledges to our core safari code:
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {[
              { icon: "🌱", title: "Respect the Wildlife", desc: "Never bait, tease, or shout to provoke animal reactions." },
              { icon: "🔇", title: "Radio Silence", desc: "Keep mobile phones silent. Whispering preserves natural bird alarms." },
              { icon: "🚯", title: "Zero Plastic", desc: "Take back every single wrapper. Leave zero litter in reserve zones." },
              { icon: "📸", title: "No Flash Photography", desc: "Flash blinds predators and causes dangerous territorial aggression." },
              { icon: "🚙", title: "Follow Ranger Guides", desc: "Always stay seated in your vehicle and respect the driver's safety call." }
            ].map((rule, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl p-5 border border-[#E9DFC9]/80 shadow-sm text-center flex flex-col items-center"
              >
                <div className="w-12 h-12 rounded-2xl bg-[#F8F7F2] flex items-center justify-center text-2xl mb-3">
                  {rule.icon}
                </div>
                <h4 className="font-bold text-xs text-[#0D2922] mb-1">{rule.title}</h4>
                <p className="text-[11px] text-stone-500 leading-relaxed">{rule.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}
