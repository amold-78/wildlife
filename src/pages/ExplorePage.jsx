import React, { useState, useMemo, useRef, useEffect } from 'react';
import { SAFARIS } from '../data/safaris';
import { useBooking } from '../context/BookingContext';
import {
  Search,
  SlidersHorizontal,
  MapPin,
  Star,
  ArrowRight,
  Heart,
  X,
  Compass,
  RotateCcw,
  Sparkles,
  ChevronDown,
  Check
} from 'lucide-react';

export default function ExplorePage({ onSelectSafari }) {
  const { wishlist, toggleWishlist, showSavedOnly, setShowSavedOnly } = useBooking();

  // Instant filter states (updates without reloading)
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("All");
  const [selectedWildlife, setSelectedWildlife] = useState("All");
  const [maxPrice, setMaxPrice] = useState(3000);
  const [selectedVehicle, setSelectedVehicle] = useState("All");
  const [sortBy, setSortBy] = useState("rating");
  const [sortOpen, setSortOpen] = useState(false);
  const sortRef = useRef(null);

  const sortOptions = [
    { value: "rating", label: "Top Rated (Highest First)" },
    { value: "price-asc", label: "Price (Low to High)" },
    { value: "price-desc", label: "Price (High to Low)" },
    { value: "reviews", label: "Most Reviewed" }
  ];

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (sortRef.current && !sortRef.current.contains(e.target)) {
        setSortOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const regions = ["All", "Maharashtra", "Madhya Pradesh", "Rajasthan", "Uttarakhand", "Assam"];
  const wildlifeList = ["All", "Tiger", "Elephant", "Leopard", "Rhino", "Bear"];

  // Filtered and sorted safaris
  const filteredSafaris = useMemo(() => {
    return SAFARIS.filter((safari) => {
      // 0. Saved Safaris Only Filter
      if (showSavedOnly && !wishlist.includes(safari.id)) {
        return false;
      }

      // 1. Text Search (name, state, overview)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = safari.name.toLowerCase().includes(q);
        const matchesState = safari.state.toLowerCase().includes(q);
        const matchesOverview = safari.overview.toLowerCase().includes(q);
        if (!matchesName && !matchesState && !matchesOverview) return false;
      }

      // 2. Region Filter
      if (selectedRegion !== "All" && safari.state !== selectedRegion) {
        return false;
      }

      // 3. Wildlife Filter
      if (selectedWildlife !== "All") {
        const hasWildlife = safari.wildlifeProbabilities.some(wp =>
          wp.animal.toLowerCase().includes(selectedWildlife.toLowerCase())
        );
        if (!hasWildlife) return false;
      }

      // 4. Max Price Filter
      if (safari.pricePerPerson > maxPrice) {
        return false;
      }

      // 5. Vehicle Filter
      if (selectedVehicle !== "All") {
        const hasVehicle = safari.slots.some(s => s.type.toLowerCase().includes(selectedVehicle.toLowerCase()));
        if (!hasVehicle) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === "price-asc") return a.pricePerPerson - b.pricePerPerson;
      if (sortBy === "price-desc") return b.pricePerPerson - a.pricePerPerson;
      if (sortBy === "reviews") return b.reviewCount - a.reviewCount;
      return b.rating - a.rating; // default highest rated
    });
  }, [searchQuery, selectedRegion, selectedWildlife, maxPrice, selectedVehicle, sortBy, showSavedOnly, wishlist]);

  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedRegion("All");
    setSelectedWildlife("All");
    setMaxPrice(3000);
    setSelectedVehicle("All");
    setSortBy("rating");
  };

  const hasActiveFilters = searchQuery !== "" || selectedRegion !== "All" || selectedWildlife !== "All" || maxPrice < 3000 || selectedVehicle !== "All";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Page Title & Search Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#0D2922] dark:text-[#F1F8F4]">
            {showSavedOnly ? "Your Saved Safari Wishlist" : "Explore Certified Tiger Reserves"}
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 dark:text-[#92ABA0] mt-1">
            {showSavedOnly
              ? `Viewing your ${wishlist.length} bookmarked wildlife reserves.`
              : "Compare core zones, vehicle shifts, and real-time permit availability across India."}
          </p>
        </div>

        {/* View Switcher: All Reserves vs Saved Safaris */}
        <div className="flex items-center p-1 bg-stone-100 dark:bg-[#0D201A] rounded-2xl border border-stone-200 dark:border-[#1A382F] self-start md:self-auto">
          <button
            onClick={() => setShowSavedOnly(false)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              !showSavedOnly
                ? "bg-[#0D2922] text-white dark:bg-[#C99A4A] dark:text-[#0D2922] shadow-sm"
                : "text-stone-600 dark:text-[#A8C4B8] hover:text-[#0D2922] dark:hover:text-white"
            }`}
          >
            <span>All Reserves</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-black/15 dark:bg-black/30">
              {SAFARIS.length}
            </span>
          </button>
          <button
            onClick={() => setShowSavedOnly(true)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              showSavedOnly
                ? "bg-[#0D2922] text-white dark:bg-[#C99A4A] dark:text-[#0D2922] shadow-sm"
                : "text-stone-600 dark:text-[#A8C4B8] hover:text-[#0D2922] dark:hover:text-white"
            }`}
          >
            <Heart className={`w-3.5 h-3.5 ${wishlist.length > 0 ? "fill-current text-rose-500" : ""}`} />
            <span>Saved Safaris</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-black/15 dark:bg-black/30">
              {wishlist.length}
            </span>
          </button>
        </div>
      </div>

      {/* Main Grid: Filters Sidebar + Results Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* FILTERS SIDEBAR */}
        <div className="lg:col-span-3 bg-white rounded-3xl p-6 border border-[#E9DFC9] shadow-sm space-y-6 lg:sticky lg:top-28">
          
          <div className="flex items-center justify-between pb-3 border-b border-[#F0ECE1] dark:border-[#132E27]">
            <div className="flex items-center gap-2 text-stone-900 dark:text-white font-bold text-sm">
              <SlidersHorizontal className="w-4 h-4 text-[#C99A4A]" />
              <span>Filter Safaris</span>
            </div>
            {hasActiveFilters && (
              <button
                onClick={handleResetFilters}
                className="text-[11px] font-bold text-rose-600 dark:text-rose-400 border border-rose-300 dark:border-rose-900/60 px-2.5 py-1 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-1.5 transition"
              >
                <RotateCcw className="w-3 h-3" />
                Reset
              </button>
            )}
          </div>

          {/* Search Input */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-500 dark:text-[#728D81] mb-1.5">
              Search by Keyword
            </label>
            <div className="relative">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Tadoba, Corbett, tiger..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#FAF8F2] dark:bg-white/5 border border-[#E9DFC9] dark:border-[#1A382F] rounded-xl pl-9 pr-8 py-2 text-xs text-stone-900 dark:text-[#E2ECE6] placeholder:text-stone-400 focus:outline-none focus:border-[#C99A4A]"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-3 text-stone-400 hover:text-stone-600 dark:hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Region / State */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-500 dark:text-[#728D81] mb-2">
              Region / State
            </label>
            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {regions.map((reg) => (
                <button
                  key={reg}
                  onClick={() => setSelectedRegion(reg)}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition-all ${
                    selectedRegion === reg
                      ? 'bg-[#0D2922] text-white dark:bg-[#C99A4A] dark:text-[#0D2922] shadow-sm'
                      : 'text-stone-700 dark:text-[#C7D7D0] hover:bg-stone-200/60 dark:hover:bg-white/10 hover:text-stone-900 dark:hover:text-white'
                  }`}
                >
                  <span>{reg}</span>
                  {selectedRegion === reg && <span className="text-[#C99A4A] dark:text-[#0D2922] text-xs">●</span>}
                </button>
              ))}
            </div>
          </div>

          {/* Target Wildlife */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-500 dark:text-[#728D81] mb-2">
              Target Wildlife
            </label>
            <div className="flex flex-wrap gap-1.5">
              {wildlifeList.map((w) => (
                <button
                  key={w}
                  onClick={() => setSelectedWildlife(w)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                    selectedWildlife === w
                      ? 'bg-[#173F35] text-white dark:bg-[#C99A4A] dark:text-[#0D2922] shadow-sm'
                      : 'bg-[#FAF8F2] dark:bg-white/5 border border-[#E9DFC9] dark:border-[#1A382F] text-stone-700 dark:text-[#C7D7D0] hover:bg-stone-200/60 dark:hover:bg-white/10 hover:text-stone-900 dark:hover:text-white'
                  }`}
                >
                  {w}
                </button>
              ))}
            </div>
          </div>

          {/* Max Price Slider */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-[11px] font-bold uppercase tracking-wider text-stone-500 dark:text-[#728D81]">
                Max Price / Person
              </label>
              <span className="text-xs font-bold text-[#0D2922] dark:text-[#C99A4A]">
                ₹{maxPrice.toLocaleString('en-IN')}
              </span>
            </div>
            <input
              type="range"
              min="1500"
              max="3000"
              step="100"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full accent-[#0D2922] dark:accent-[#C99A4A] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-stone-400 mt-1 font-mono">
              <span>₹1,500</span>
              <span>₹3,000+</span>
            </div>
          </div>

          {/* Vehicle Preference */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-500 dark:text-[#728D81] mb-2">
              Safari Vehicle
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              {["All", "Gypsy", "Canter"].map((v) => (
                <button
                  key={v}
                  onClick={() => setSelectedVehicle(v)}
                  className={`py-2 text-xs font-semibold rounded-xl text-center transition-all ${
                    selectedVehicle === v
                      ? 'bg-[#0D2922] text-white dark:bg-[#C99A4A] dark:text-[#0D2922] shadow-sm'
                      : 'bg-[#FAF8F2] dark:bg-white/5 border border-[#E9DFC9] dark:border-[#1A382F] text-stone-700 dark:text-[#C7D7D0] hover:bg-stone-200/60 dark:hover:bg-white/10 hover:text-stone-900 dark:hover:text-white'
                  }`}
                >
                  {v === "All" ? "Any Type" : v}
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* RESULTS SECTION */}
        <div className="lg:col-span-9 space-y-6">
          
          {/* Top Results Bar */}
          <div className="bg-white dark:bg-[#0D201A] p-4 rounded-2xl border border-[#E9DFC9] dark:border-[#1A382F] flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-stone-600 dark:text-[#A8C4B8]">
              Showing <span className="font-bold text-[#0D2922] dark:text-[#F1F8F4]">{filteredSafaris.length}</span> of {SAFARIS.length} certified safari sanctuaries
            </div>

            {/* Custom Luxury Sort Dropdown */}
            <div className="relative flex items-center gap-2 self-end sm:self-auto" ref={sortRef}>
              <span className="text-xs text-stone-500 dark:text-[#728D81]">Sort by:</span>
              <button
                type="button"
                onClick={() => setSortOpen(!sortOpen)}
                className="bg-[#FAF8F2] dark:bg-[#071713] border border-[#E9DFC9] dark:border-[#1A382F] hover:border-[#C99A4A] dark:hover:border-[#C99A4A]/60 rounded-xl px-3.5 py-1.5 text-xs font-semibold text-stone-800 dark:text-stone-200 flex items-center gap-2 transition cursor-pointer shadow-sm"
              >
                <span>{sortOptions.find(o => o.value === sortBy)?.label || "Top Rated"}</span>
                <ChevronDown className={`w-3.5 h-3.5 text-[#C99A4A] transition-transform duration-200 ${sortOpen ? 'rotate-180' : ''}`} />
              </button>

              {sortOpen && (
                <div className="absolute right-0 top-full mt-1.5 w-56 bg-white dark:bg-[#0D201A] border border-[#E9DFC9] dark:border-[#1A382F] rounded-2xl shadow-2xl p-1.5 z-30 animate-fade-in">
                  {sortOptions.map((opt) => {
                    const isSelected = sortBy === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => {
                          setSortBy(opt.value);
                          setSortOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium flex items-center justify-between transition cursor-pointer ${
                          isSelected
                            ? 'bg-[#C99A4A]/15 text-[#8F651C] dark:text-[#E5B560] font-bold'
                            : 'text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-white/5'
                        }`}
                      >
                        <span>{opt.label}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-[#C99A4A]" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Results Cards List */}
          {filteredSafaris.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredSafaris.map((safari) => {
                const isSaved = wishlist.includes(safari.id);
                return (
                  <div
                    key={safari.id}
                    className="group bg-white rounded-3xl border border-[#E9DFC9] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col"
                  >
                    {/* Image Header */}
                    <div className="relative aspect-[16/10] overflow-hidden bg-stone-100">
                      <img
                        src={safari.heroImage}
                        alt={safari.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                      <div className="absolute top-3 left-3">
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#0D2922]/90 text-white backdrop-blur-md border border-white/20">
                          {safari.highlight}
                        </span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleWishlist(safari.id);
                        }}
                        className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition ${
                          isSaved ? 'bg-rose-500 text-white' : 'bg-black/40 text-white hover:bg-black/60'
                        }`}
                      >
                        <Heart className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
                      </button>
                      <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md rounded-xl px-2.5 py-1 text-[11px] text-[#E9DFC9] border border-white/10">
                        <span>🐅 Sighting Probability: </span>
                        <span className="font-bold text-emerald-400">
                          {safari.wildlifeProbabilities[0]?.probability || "High"}
                        </span>
                      </div>
                    </div>

                    {/* Info */}
                    <div className="p-6 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between text-xs text-stone-500 mb-1.5">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-stone-400" />
                            {safari.state}
                          </span>
                          <div className="flex items-center gap-1 text-[#C99A4A] font-bold">
                            <Star className="w-3.5 h-3.5 fill-current" />
                            <span>{safari.rating}</span>
                            <span className="text-stone-400 font-normal">({safari.reviewCount})</span>
                          </div>
                        </div>

                        <h3 className="font-serif text-xl font-bold text-[#0D2922] mb-1">
                          {safari.name}
                        </h3>
                        <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed mb-4">
                          {safari.overview}
                        </p>

                        {/* Slots indicator */}
                        <div className="bg-[#FAF8F2] rounded-2xl p-2.5 border border-[#E9DFC9]/80 flex items-center justify-between text-[11px] text-stone-600 mb-4">
                          <span>Upcoming Slots:</span>
                          <span className="font-semibold text-emerald-700">
                            {safari.slots.length} Shifts · Open Gypsies
                          </span>
                        </div>
                      </div>

                      {/* Footer Actions */}
                      <div className="pt-3 border-t border-[#F0ECE1] flex items-center justify-between">
                        <div>
                          <p className="text-[10px] uppercase font-bold text-stone-400">Permit & Gypsy</p>
                          <p className="text-lg font-bold text-[#0D2922]">
                            ₹{safari.pricePerPerson.toLocaleString('en-IN')}{" "}
                            <span className="text-xs font-normal text-stone-500">/ person</span>
                          </p>
                        </div>

                        <button
                          onClick={() => onSelectSafari(safari.id)}
                          className="px-4 py-2 rounded-xl bg-[#0D2922] dark:bg-[#C99A4A] hover:bg-[#173F35] dark:hover:bg-[#B88939] text-white dark:text-[#0D2922] text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
                        >
                          <span>Explore & Book</span>
                          <ArrowRight className="w-3.5 h-3.5 text-[#C99A4A] dark:text-[#0D2922]" />
                        </button>
                      </div>

                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Empty State */
            <div className="bg-white dark:bg-[#0D201A] rounded-3xl border border-[#E9DFC9] dark:border-[#1A382F] p-12 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-[#FAF8F2] dark:bg-[#071713] flex items-center justify-center text-3xl mx-auto">
                {showSavedOnly ? "❤️" : "🔍"}
              </div>
              <h3 className="font-serif text-xl font-bold text-[#0D2922] dark:text-[#F1F8F4]">
                {showSavedOnly ? "No Saved Safaris Found" : "No Safaris Found Matching Your Filters"}
              </h3>
              <p className="text-xs text-stone-500 dark:text-[#A8C4B8] max-w-md mx-auto">
                {showSavedOnly
                  ? "You haven't saved any safaris to your wishlist yet, or none match your active filters. Tap the heart icon on any reserve card to bookmark it!"
                  : "Try widening your price range, clearing the wildlife criteria, or choosing 'All Regions' to discover all available tiger reserves."}
              </p>
              <button
                onClick={() => {
                  setShowSavedOnly(false);
                  handleResetFilters();
                }}
                className="px-5 py-2.5 rounded-full bg-[#0D2922] dark:bg-[#C99A4A] text-white dark:text-[#0D2922] text-xs font-bold transition hover:bg-[#173F35] cursor-pointer"
              >
                {showSavedOnly ? "Explore All Reserves" : "Reset All Filters"}
              </button>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
