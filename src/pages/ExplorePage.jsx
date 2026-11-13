import React, { useState, useMemo, useRef, useEffect } from 'react';
import { SAFARIS } from '../data/safaris';
import { useBooking } from '../context/BookingContext';
import {
  Search,
  SlidersHorizontal,
  MapPin,
  Star,
  Heart,
  X,
  RotateCcw,
  ChevronDown,
  Check,
  Eye,
} from 'lucide-react';

export default function ExplorePage({ onSelectSafari }) {
  const { wishlist, toggleWishlist, showSavedOnly, setShowSavedOnly } = useBooking();

  // Instant filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('All');
  const [selectedWildlife, setSelectedWildlife] = useState('All');
  const [maxPrice, setMaxPrice] = useState(3000);
  const [selectedVehicle, setSelectedVehicle] = useState('All');
  const [sortBy, setSortBy] = useState('rating');
  const [sortOpen, setSortOpen] = useState(false);
  const sortRef = useRef(null);

  const sortOptions = [
    { value: 'rating', label: 'Top Rated (Highest First)' },
    { value: 'price-asc', label: 'Price (Low to High)' },
    { value: 'price-desc', label: 'Price (High to Low)' },
    { value: 'reviews', label: 'Most Reviewed' },
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

  const regions = ['All', 'Maharashtra', 'Madhya Pradesh', 'Rajasthan', 'Uttarakhand', 'Assam'];
  const wildlifeList = ['All', 'Tiger', 'Elephant', 'Leopard', 'Rhino', 'Bear'];

  // Filtered and sorted safaris
  const filteredSafaris = useMemo(() => {
    return SAFARIS.filter((safari) => {
      if (showSavedOnly && !wishlist.includes(safari.id)) {
        return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = safari.name.toLowerCase().includes(q);
        const matchesState = safari.state.toLowerCase().includes(q);
        const matchesOverview = safari.overview.toLowerCase().includes(q);
        if (!matchesName && !matchesState && !matchesOverview) return false;
      }

      if (selectedRegion !== 'All' && safari.state !== selectedRegion) {
        return false;
      }

      if (selectedWildlife !== 'All') {
        const hasWildlife = safari.wildlifeProbabilities.some((wp) =>
          wp.animal.toLowerCase().includes(selectedWildlife.toLowerCase()),
        );
        if (!hasWildlife) return false;
      }

      if (safari.pricePerPerson > maxPrice) {
        return false;
      }

      if (selectedVehicle !== 'All') {
        const hasVehicle = safari.slots.some((s) =>
          s.type.toLowerCase().includes(selectedVehicle.toLowerCase()),
        );
        if (!hasVehicle) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'price-asc') return a.pricePerPerson - b.pricePerPerson;
      if (sortBy === 'price-desc') return b.pricePerPerson - a.pricePerPerson;
      if (sortBy === 'reviews') return b.reviewCount - a.reviewCount;
      return b.rating - a.rating;
    });
  }, [
    searchQuery,
    selectedRegion,
    selectedWildlife,
    maxPrice,
    selectedVehicle,
    sortBy,
    showSavedOnly,
    wishlist,
  ]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedRegion('All');
    setSelectedWildlife('All');
    setMaxPrice(3000);
    setSelectedVehicle('All');
    setSortBy('rating');
  };

  const hasActiveFilters =
    searchQuery !== '' ||
    selectedRegion !== 'All' ||
    selectedWildlife !== 'All' ||
    maxPrice < 3000 ||
    selectedVehicle !== 'All';

  return (
    <div className="min-h-screen">
      {/* Editorial Deep Canopy Emerald Header Strip */}
      <section className="bg-gradient-to-b from-[#09211A] to-[#0D2922] border-b border-[#265244] text-[#F4EBDA]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-9 sm:py-11 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#F8F3E8] tracking-tight">
              {showSavedOnly ? 'Saved Safari Reserves' : 'NTCA Certified Tiger Reserves'}
            </h1>
            <p className="text-xs sm:text-sm text-[#C8D8D0] mt-1.5 max-w-2xl">
              {showSavedOnly
                ? `Reviewing your ${wishlist.length} bookmarked wildlife reserves and gate permit shifts.`
                : 'Compare core zones, open-top 4x4 Gypsy shifts, and live forest department permit availability across India.'}
            </p>
          </div>

          {/* View Switcher: All Reserves vs Saved Safaris */}
          <div className="flex items-center p-1 bg-[#071713] rounded-xl border border-[#265244] self-start md:self-auto shrink-0">
            <button
              type="button"
              onClick={() => setShowSavedOnly(false)}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                !showSavedOnly
                  ? 'bg-[#C99A4A] text-[#0D2922] shadow-sm'
                  : 'text-[#C8D8D0] hover:text-white'
              }`}
            >
              <span>All Reserves</span>
              <span className="font-mono tabular-nums text-[11px] px-1.5 py-0.5 rounded bg-black/20">
                {SAFARIS.length}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setShowSavedOnly(true)}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                showSavedOnly
                  ? 'bg-[#C99A4A] text-[#0D2922] shadow-sm'
                  : 'text-[#C8D8D0] hover:text-white'
              }`}
            >
              <Heart className={`w-3.5 h-3.5 ${wishlist.length > 0 ? 'fill-current text-[#E4B865]' : ''}`} />
              <span>Saved Safaris</span>
              <span className="font-mono tabular-nums text-[11px] px-1.5 py-0.5 rounded bg-black/20">
                {wishlist.length}
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* Main Content Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* FILTERS SIDEBAR */}
          <aside className="lg:col-span-3 bg-[#FBF8F3] dark:bg-[#0B221B] rounded-2xl p-6 border border-[#D8CEBE] dark:border-[#244E40] shadow-sm space-y-6 lg:sticky lg:top-24">
            <div className="flex items-center justify-between pb-3 border-b border-[#E5DEC9] dark:border-[#1D4337]">
              <div className="flex items-center gap-2 text-[#14261F] dark:text-[#F8F3E8] font-bold text-sm">
                <SlidersHorizontal className="w-4 h-4 text-[#C99A4A]" />
                <span>Filter Reserves</span>
              </div>
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="text-xs font-semibold text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800/70 px-2.5 py-1 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-1.5 transition cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset</span>
                </button>
              )}
            </div>

            {/* Search Input */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#43564E] dark:text-[#9AB3A8] mb-1.5">
                Search by Keyword
              </label>
              <div className="relative">
                <Search className="w-4 h-4 text-[#64776E] absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Tadoba, Corbett, tiger..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white dark:bg-[#071713] border border-[#D8CEBE] dark:border-[#265244] rounded-xl pl-9 pr-8 py-2 text-xs text-[#14261F] dark:text-[#F0ECE1] placeholder:text-[#64776E] focus:outline-none focus:border-[#C99A4A]"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    aria-label="Clear search query"
                    className="absolute right-3 top-2.5 text-[#64776E] hover:text-[#14261F] dark:hover:text-white cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Region / State */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#43564E] dark:text-[#9AB3A8] mb-2">
                Region / State
              </label>
              <div className="space-y-1.5">
                {regions.map((reg) => {
                  const active = selectedRegion === reg;
                  return (
                    <button
                      key={reg}
                      type="button"
                      onClick={() => setSelectedRegion(reg)}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition-all cursor-pointer ${
                        active
                          ? 'bg-[#0D2922] text-[#F8F3E8] dark:bg-[#C99A4A] dark:text-[#0D2922] shadow-sm'
                          : 'text-[#43564E] dark:text-[#C8D8D0] hover:bg-[#EFE6D7] dark:hover:bg-white/5 hover:text-[#14261F] dark:hover:text-white'
                      }`}
                    >
                      <span>{reg}</span>
                      {active && <Check className="w-3.5 h-3.5 text-[#C99A4A] dark:text-[#0D2922]" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Target Wildlife */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#43564E] dark:text-[#9AB3A8] mb-2">
                Target Wildlife
              </label>
              <div className="flex flex-wrap gap-1.5">
                {wildlifeList.map((w) => {
                  const active = selectedWildlife === w;
                  return (
                    <button
                      key={w}
                      type="button"
                      onClick={() => setSelectedWildlife(w)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        active
                          ? 'bg-[#0D2922] text-[#F8F3E8] dark:bg-[#C99A4A] dark:text-[#0D2922] shadow-sm'
                          : 'bg-[#EFE6D7] dark:bg-[#071713] border border-[#D8CEBE] dark:border-[#265244] text-[#43564E] dark:text-[#C8D8D0] hover:border-[#C99A4A]'
                      }`}
                    >
                      {w}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Max Price Slider */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-[#43564E] dark:text-[#9AB3A8]">
                  Max Fare / Guest
                </label>
                <span className="text-xs font-mono font-bold tabular-nums text-[#0D2922] dark:text-[#E4B865]">
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
              <div className="flex justify-between text-[11px] text-[#64776E] dark:text-[#88A398] mt-1 font-mono tabular-nums">
                <span>₹1,500</span>
                <span>₹3,000+</span>
              </div>
            </div>

            {/* Vehicle Preference */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#43564E] dark:text-[#9AB3A8] mb-2">
                Safari Vehicle
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {['All', 'Gypsy', 'Canter'].map((v) => {
                  const active = selectedVehicle === v;
                  return (
                    <button
                      key={v}
                      type="button"
                      onClick={() => setSelectedVehicle(v)}
                      className={`py-2 text-xs font-semibold rounded-xl text-center transition-all cursor-pointer ${
                        active
                          ? 'bg-[#0D2922] text-[#F8F3E8] dark:bg-[#C99A4A] dark:text-[#0D2922] shadow-sm'
                          : 'bg-[#EFE6D7] dark:bg-[#071713] border border-[#D8CEBE] dark:border-[#265244] text-[#43564E] dark:text-[#C8D8D0] hover:border-[#C99A4A]'
                      }`}
                    >
                      {v === 'All' ? 'Any' : v}
                    </button>
                  );
                })}
              </div>
            </div>
          </aside>

          {/* RESULTS SECTION */}
          <div className="lg:col-span-9 space-y-6">
            {/* Top Results Bar */}
            <div className="bg-[#FBF8F3] dark:bg-[#0B221B] p-4 rounded-2xl border border-[#D8CEBE] dark:border-[#244E40] flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs text-[#43564E] dark:text-[#B8CEC4]">
                Showing{' '}
                <span className="font-mono font-bold tabular-nums text-[#0D2922] dark:text-[#F8F3E8]">
                  {filteredSafaris.length}
                </span>{' '}
                of <span className="font-mono tabular-nums">{SAFARIS.length}</span> certified safari sanctuaries
              </div>

              {/* Sort Dropdown */}
              <div className="relative flex items-center gap-2 self-end sm:self-auto" ref={sortRef}>
                <span className="text-xs text-[#64776E] dark:text-[#9AB3A8]">Sort by:</span>
                <button
                  type="button"
                  onClick={() => setSortOpen(!sortOpen)}
                  className="bg-white dark:bg-[#071713] border border-[#D8CEBE] dark:border-[#265244] hover:border-[#C99A4A] rounded-xl px-3.5 py-1.5 text-xs font-semibold text-[#14261F] dark:text-[#F0ECE1] flex items-center gap-2 transition cursor-pointer shadow-sm"
                >
                  <span>{sortOptions.find((o) => o.value === sortBy)?.label || 'Top Rated'}</span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 text-[#C99A4A] transition-transform duration-200 ${
                      sortOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {sortOpen && (
                  <div className="absolute right-0 top-full mt-1.5 w-56 bg-[#FBF8F3] dark:bg-[#0B221B] border border-[#D8CEBE] dark:border-[#265244] rounded-xl shadow-2xl p-1.5 z-30 animate-fade-in">
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
                          className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium flex items-center justify-between transition cursor-pointer ${
                            isSelected
                              ? 'bg-[#C99A4A]/20 text-[#0D2922] dark:text-[#E4B865] font-bold'
                              : 'text-[#43564E] dark:text-[#C8D8D0] hover:bg-[#EFE6D7] dark:hover:bg-white/5'
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
                    <article
                      key={safari.id}
                      className="group bg-[#FBF8F3] dark:bg-[#0B221B] rounded-2xl border border-[#D8CEBE] dark:border-[#244E40] overflow-hidden shadow-sm hover:border-[#C99A4A]/70 hover:shadow-xl transition-all duration-300 flex flex-col"
                    >
                      {/* Image Header */}
                      <div className="relative aspect-[16/10] overflow-hidden bg-[#0D2922]">
                        <img
                          src={safari.heroImage}
                          alt={safari.name}
                          width="800"
                          height="500"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          loading="lazy"
                        />
                        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/75 via-black/30 to-transparent pointer-events-none" />

                        <div className="absolute top-3 left-3">
                          <span className="px-3 py-1 rounded-lg text-xs font-semibold bg-[#09211A] text-[#F4EBDA] border border-[#C99A4A]/45">
                            {safari.highlight}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleWishlist(safari.id);
                          }}
                          aria-label={isSaved ? `Remove ${safari.name} from saved` : `Save ${safari.name}`}
                          className={`absolute top-3 right-3 w-9 h-9 rounded-lg flex items-center justify-center border transition cursor-pointer ${
                            isSaved
                              ? 'bg-[#C99A4A] text-[#0D2922] border-[#F3D28E]'
                              : 'bg-[#09211A]/85 text-white border-white/25 hover:bg-[#09211A]'
                          }`}
                        >
                          <Heart className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
                        </button>
                        <div className="absolute bottom-3 left-3 bg-[#09211A] rounded-lg px-2.5 py-1 text-xs text-[#F4EBDA] border border-[#265244] flex items-center gap-1.5">
                          <Eye className="w-3.5 h-3.5 text-[#E4B865]" />
                          <span>Sighting Index:</span>
                          <span className="font-bold text-[#86EFAC]">
                            {safari.wildlifeProbabilities[0]?.probability || 'High'}
                          </span>
                        </div>
                      </div>

                      {/* Info */}
                      <div className="p-6 flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between text-xs text-[#43564E] dark:text-[#9AB3A8] mb-1.5">
                            <span className="flex items-center gap-1 font-medium">
                              <MapPin className="w-3.5 h-3.5 text-[#C99A4A]" />
                              {safari.state}
                            </span>
                            <div className="flex items-center gap-1 text-[#B88428] dark:text-[#E4B865] font-mono font-bold tabular-nums">
                              <Star className="w-3.5 h-3.5 fill-[#C99A4A] text-[#C99A4A]" />
                              <span>{safari.rating}</span>
                              <span className="text-[#64776E] dark:text-[#88A398] font-normal">
                                ({safari.reviewCount})
                              </span>
                            </div>
                          </div>

                          <h3 className="font-serif text-xl font-bold text-[#14261F] dark:text-[#F8F3E8] mb-1.5">
                            {safari.name}
                          </h3>
                          <p className="text-xs text-[#43564E] dark:text-[#B8CEC4] line-clamp-2 leading-relaxed mb-4">
                            {safari.overview}
                          </p>

                          {/* Slots indicator */}
                          <div className="bg-[#EFE6D7]/70 dark:bg-[#071713] rounded-xl px-3 py-2 border border-[#D8CEBE] dark:border-[#1D4337] flex items-center justify-between text-xs text-[#43564E] dark:text-[#B8CEC4] mb-4">
                            <span>Daily Gate Shifts</span>
                            <span className="font-mono font-semibold tabular-nums text-[#0D2922] dark:text-[#86EFAC]">
                              {safari.slots.length} Shifts · Open 4x4 Gypsy
                            </span>
                          </div>
                        </div>

                        {/* Footer Actions */}
                        <div className="pt-3.5 border-t border-[#E5DEC9] dark:border-[#1D4337] flex items-center justify-between">
                          <div>
                            <p className="text-[11px] uppercase tracking-wider font-mono text-[#64776E] dark:text-[#88A398]">
                              Permit &amp; 4x4 Seat
                            </p>
                            <p className="text-lg font-mono font-bold tabular-nums text-[#14261F] dark:text-[#F8F3E8]">
                              ₹{safari.pricePerPerson.toLocaleString('en-IN')}{' '}
                              <span className="text-xs font-sans font-normal text-[#64776E] dark:text-[#9AB3A8]">
                                / guest
                              </span>
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={() => onSelectSafari(safari.id)}
                            className="px-4 py-2.5 rounded-xl bg-[#0D2922] dark:bg-[#C99A4A] hover:bg-[#173F35] dark:hover:bg-[#D8AA5B] text-[#F8F3E8] dark:text-[#0D2922] text-xs font-bold transition flex items-center gap-1.5 shadow-sm cursor-pointer"
                          >
                            <span>View Gate &amp; Permits</span>
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            ) : (
              /* Empty State */
              <div className="bg-[#FBF8F3] dark:bg-[#0B221B] rounded-2xl border border-[#D8CEBE] dark:border-[#244E40] p-12 text-center space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-[#0D2922] border border-[#C99A4A]/50 text-[#E4B865] flex items-center justify-center mx-auto">
                  {showSavedOnly ? <Heart className="w-6 h-6" /> : <Search className="w-6 h-6" />}
                </div>
                <h3 className="font-serif text-xl font-bold text-[#14261F] dark:text-[#F8F3E8]">
                  {showSavedOnly ? 'No Saved Safaris Found' : 'No Reserves Match Your Filters'}
                </h3>
                <p className="text-xs text-[#43564E] dark:text-[#B8CEC4] max-w-md mx-auto leading-relaxed">
                  {showSavedOnly
                    ? 'You have not bookmarked any reserves yet, or none match your active filter criteria. Tap the heart icon on any reserve card to save it.'
                    : 'Try widening your maximum budget, clearing the target species filter, or selecting All Regions.'}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setShowSavedOnly(false);
                    handleResetFilters();
                  }}
                  className="px-5 py-2.5 rounded-xl bg-[#C99A4A] hover:bg-[#D8AA5B] text-[#0D2922] text-xs font-bold transition cursor-pointer"
                >
                  {showSavedOnly ? 'Explore All Reserves' : 'Reset All Filters'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
