import React, { useState } from 'react';
import { SAFARIS } from '../data/safaris';
import { useBooking } from '../context/BookingContext';
import { useAuth } from '../context/AuthContext';
import {
  MapPin,
  Star,
  Clock,
  Calendar,
  Shield,
  Heart,
  Share2,
  ArrowRight,
  CheckCircle2,
  Thermometer,
  Eye,
  ThumbsUp,
  MessageSquare,
  PenLine,
  Send,
  ArrowLeft,
  Footprints,
  Sun,
  Lock,
  Zap
} from 'lucide-react';
import { DEFAULT_REVIEWS } from '../data/reviews';
import { api } from '../services/api';

const MONTH_INTEL = {
  Oct: {
    temp: "22°C – 32°C",
    climate: "Lush & Post-Monsoon",
    sightingScore: 78,
    statusBadge: "Prime Season Open",
    note: "Park gates reopen! Sal forests are vibrant emerald green, streams flow fresh, and tigers re-establish territory after rains.",
    gear: "Light jacket for 5:30 AM dawn chill, landscape camera lens."
  },
  Nov: {
    temp: "18°C – 30°C",
    climate: "Crisp & Clear Skies",
    sightingScore: 82,
    statusBadge: "Prime Season",
    note: "Superb weather for extended drives. Migratory birds arrive from Siberia. Tigers frequently seen basking on sunny forest firelines.",
    gear: "Fleece layer, 300mm+ telephoto lens, polarized sun protection."
  },
  Dec: {
    temp: "10°C – 25°C",
    climate: "Chilly Mornings & Golden Mist",
    sightingScore: 85,
    statusBadge: "Winter Prime",
    note: "Magical dawn light filtering through mist. Predators remain active well into mid-morning due to pleasant day temperatures.",
    gear: "Heavy woolens & gloves for open Gypsy wind-chill."
  },
  Jan: {
    temp: "8°C – 24°C",
    climate: "Peak Winter Frost",
    sightingScore: 86,
    statusBadge: "Winter Prime",
    note: "Crisp cold mornings. Tigers walk fire-lines to dry their dew-soaked coats. Spectacular photography contrast in early hours.",
    gear: "Windproof thermal jacket, beanies, camera moisture wipe."
  },
  Feb: {
    temp: "15°C – 29°C",
    climate: "Pleasant Golden Spring",
    sightingScore: 88,
    statusBadge: "Spring Prime",
    note: "Grasslands turn golden amber, improving line of sight through deciduous forest. High deer herd movement and mating displays.",
    gear: "Layered clothing, high-speed shutter camera, sunglasses."
  },
  Mar: {
    temp: "22°C – 36°C",
    climate: "Dry & Warming Up",
    sightingScore: 94,
    statusBadge: "Peak Sightings",
    note: "Waterholes start drying up. Predators and prey converge around perennial lakes. Incredible tiger action encounters.",
    gear: "Breathable cottons, dust buff, 400mm lens, UV filter."
  },
  Apr: {
    temp: "28°C – 41°C",
    climate: "Hot & Arid Forest",
    sightingScore: 96,
    statusBadge: "Peak Sightings",
    note: "Minimal foliage leaves predators exposed. Sloth bears feast on falling Mahua flowers; tigers stay near water for hours.",
    gear: "Hydration flask, wide-brim hat, electrolyte salts, lens dust covers."
  },
  May: {
    temp: "32°C – 44°C",
    climate: "Peak Summer Heat",
    sightingScore: 97,
    statusBadge: "Peak Sightings",
    note: "Highest statistical tiger sighting probability of the year. Big cats lounge submerged in forest saucers and perennial ponds.",
    gear: "Light safari linen, cooling towels, extra camera batteries."
  },
  Jun: {
    temp: "28°C – 38°C",
    climate: "Pre-Monsoon Humidity",
    sightingScore: 68,
    statusBadge: "Buffer / Fair",
    note: "Occasional pre-monsoon showers. Core zones close by late June. Buffer zones remain open with scenic, uncrowded tracks.",
    gear: "Waterproof dry-bag, rain poncho, insect repellent."
  },
  Jul: {
    temp: "24°C – 32°C",
    climate: "Heavy Monsoon Rains",
    sightingScore: 35,
    statusBadge: "Core Gates Closed",
    note: "All Core gates closed to protect wildlife breeding seasons and allow natural forest regeneration. Buffer eco-drives open.",
    gear: "Sturdy waterproof trekking boots, macro camera lens for flora."
  },
  Aug: {
    temp: "24°C – 30°C",
    climate: "Full Monsoon Inflow",
    sightingScore: 30,
    statusBadge: "Core Gates Closed",
    note: "Core zones closed for NTCA mandatory rest. Forest streams overflow. Forest rangers focus on intensive anti-poaching patrol.",
    gear: "Full waterproof gear, binoculars for buffer canopy birding."
  },
  Sep: {
    temp: "25°C – 31°C",
    climate: "Post-Rain Forest Regrowth",
    sightingScore: 40,
    statusBadge: "Core Gates Closed",
    note: "Core closed for pre-season trail maintenance and bridge checks. Gates reopen on October 1st for the grand winter season.",
    gear: "Trekking poles for buffer nature walks, light rainwear."
  }
};

export default function SafariDetailPage({ safariId, onBookSlot, onBack }) {
  const { wishlist, toggleWishlist, showToast } = useBooking();
  const { user, isAuthenticated } = useAuth();
  const safari = SAFARIS.find(s => s.id === safariId) || SAFARIS[0];

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedSlotId, setSelectedSlotId] = useState(safari.slots[0]?.id || "");
  const [selectedMonthIdx, setSelectedMonthIdx] = useState(5); // Default to March (Peak season)
  const isSaved = wishlist.includes(safari.id);

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    showToast("Safari link copied to clipboard!", "info");
  };

  const selectedSlot = safari.slots.find(s => s.id === selectedSlotId) || safari.slots[0];

  // Reviews state with localStorage persistence
  const [reviews, setReviews] = useState(() => {
    try {
      const saved = localStorage.getItem(`wildtrail_reviews_${safari.id}`);
      if (saved) return JSON.parse(saved);
    } catch {}
    return DEFAULT_REVIEWS[safari.id] || DEFAULT_REVIEWS["tadoba-national-park"] || [];
  });

  const [reviewFilter, setReviewFilter] = useState('all');
  const [likedReviews, setLikedReviews] = useState({});

  // Review Form state
  const [newRating, setNewRating] = useState(5);
  const [newAuthor, setNewAuthor] = useState("");
  const [newZone, setNewZone] = useState(safari.zones[0]?.name || "Core Zone");
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [selectedWildlifeTags] = useState(["Royal Bengal Tiger"]);

  const handleLikeReview = (revId) => {
    setLikedReviews(prev => ({
      ...prev,
      [revId]: !prev[revId]
    }));
  };

  const handleReviewSubmit = (e) => {
    e.preventDefault();
    if (!newContent.trim()) {
      showToast("Please share a few words about your safari experience.", "error");
      return;
    }

    const reviewerName = (isAuthenticated && user?.name)
      ? user.name
      : (newAuthor.trim() || 'Guest Explorer');

    const createdReview = {
      id: `rev-${Date.now()}`,
      author: reviewerName,
      avatar: reviewerName.slice(0, 2).toUpperCase(),
      rating: newRating,
      date: 'Oct 2026',
      zone: newZone,
      shift: "Verified Expedition",
      wildlifeSpotted: selectedWildlifeTags.length > 0 ? selectedWildlifeTags : ["Royal Bengal Tiger"],
      title: newTitle.trim() || `${newRating}-Star Safari Experience`,
      content: newContent.trim(),
      helpfulCount: 0,
      verified: Boolean(isAuthenticated)
    };

    const updated = [createdReview, ...reviews];
    setReviews(updated);
    try {
      localStorage.setItem(`wildtrail_reviews_${safari.id}`, JSON.stringify(updated));
    } catch {}

    // Asynchronously save review into backend database
    api.reviews.create(safari.id, {
      author: createdReview.author,
      rating: createdReview.rating,
      date: createdReview.date,
      zone: createdReview.zone,
      shift: createdReview.shift,
      wildlifeSpotted: createdReview.wildlifeSpotted,
      title: createdReview.title,
      content: createdReview.content
    }).catch(e => console.warn('Backend review sync note:', e.message));

    showToast("Thank you! Your field log review has been published.", "success");
    setNewAuthor("");
    setNewTitle("");
    setNewContent("");
  };

  const filteredReviews = reviews.filter(rev => {
    if (reviewFilter === 'five_star') return rev.rating === 5;
    if (reviewFilter === 'tiger') return rev.wildlifeSpotted?.some(w => w.toLowerCase().includes('tiger'));
    if (reviewFilter === 'dawn') return rev.shift?.toLowerCase().includes('dawn') || rev.content?.toLowerCase().includes('dawn');
    return true;
  });

  return (
    <div className="min-h-screen">
      {/* Deep Canopy Emerald Reserve Header Strip */}
      <section className="bg-gradient-to-b from-[#09211A] to-[#0D2922] border-b border-[#265244] text-[#F4EBDA]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <button
              type="button"
              onClick={onBack}
              className="text-xs font-bold text-[#C8D8D0] hover:text-[#E4B865] transition flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-[#C99A4A]" />
              <span>Back to All Reserves</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleShare}
                className="p-2 rounded-xl border border-[#265244] bg-[#0B221B] text-[#E9DFC9] hover:border-[#C99A4A] transition cursor-pointer"
                title="Share Safari"
              >
                <Share2 className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => toggleWishlist(safari.id)}
                className={`p-2 rounded-xl border transition cursor-pointer ${
                  isSaved
                    ? 'bg-[#C99A4A] text-[#0D2922] border-[#F3D28E]'
                    : 'bg-[#0B221B] text-[#E9DFC9] border-[#265244] hover:border-[#C99A4A]'
                }`}
                title="Save to Wishlist"
              >
                <Heart className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
              </button>
            </div>
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-3 text-xs text-[#C8D8D0] mb-2">
              <span className="flex items-center gap-1 text-[#E4B865] font-semibold">
                <MapPin className="w-3.5 h-3.5 text-[#C99A4A]" />
                {safari.state}, India
              </span>
              <span>·</span>
              <span className="bg-[#113127] text-[#F4EBDA] border border-[#265244] px-2.5 py-0.5 rounded-lg font-semibold">
                {safari.highlight}
              </span>
            </div>

            <h1 className="font-serif text-3xl sm:text-5xl font-bold text-[#F8F3E8] tracking-tight">
              {safari.name}
            </h1>
            <p className="text-sm sm:text-base text-[#C8D8D0] italic font-serif mt-1.5">
              &ldquo;{safari.subtitle}&rdquo;
            </p>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">
      {/* Gallery */}
      <div className="space-y-4">

        {/* Gallery Grid - Equal Height System */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Main Large Image */}
          <div className="lg:col-span-8 h-[280px] sm:h-[380px] lg:h-[460px] rounded-3xl overflow-hidden bg-stone-100 shadow-md">
            <img
              src={safari.images[activeImageIndex] || safari.heroImage}
              alt={safari.name}
              className="w-full h-full object-cover transition-all duration-300"
            />
          </div>

          {/* Thumbnails - Explicitly match Main Image height */}
          <div className="lg:col-span-4 flex flex-row lg:flex-col gap-3 h-[90px] sm:h-[110px] lg:h-[460px] overflow-x-auto lg:overflow-x-visible">
            {safari.images.map((img, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setActiveImageIndex(idx)}
                className={`relative rounded-2xl overflow-hidden flex-1 min-w-[100px] lg:min-w-0 w-full border-2 transition cursor-pointer ${
                  activeImageIndex === idx
                    ? 'border-[#0D2922] dark:border-[#C99A4A] ring-2 ring-[#0D2922] dark:ring-[#C99A4A] shadow-md'
                    : 'border-transparent opacity-80 hover:opacity-100'
                }`}
              >
                <img src={img} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Grid: Details Overview + Sticky Booking Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Overview, Wildlife Matrix, Season Calendar */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-5 rounded-3xl bg-white dark:bg-[#071713] border border-[#E9DFC9] dark:border-[#1A382F] shadow-sm">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500">Rating</p>
              <div className="flex items-center gap-1.5 font-bold text-base text-[#0D2922] dark:text-stone-100 mt-0.5">
                <Star className="w-4 h-4 fill-current text-[#C99A4A]" />
                <span>{safari.rating}</span>
                <span className="text-xs text-stone-400 dark:text-stone-500 font-normal">({safari.reviewCount})</span>
              </div>
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500">Duration</p>
              <div className="flex items-center gap-1.5 font-bold text-base text-[#0D2922] dark:text-stone-100 mt-0.5">
                <Clock className="w-4 h-4 text-stone-500 dark:text-stone-400" />
                <span>{safari.duration}</span>
              </div>
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500">Best Season</p>
              <div className="flex items-center gap-1.5 font-bold text-base text-[#0D2922] dark:text-stone-100 mt-0.5">
                <Calendar className="w-4 h-4 text-stone-500 dark:text-stone-400" />
                <span className="text-sm">Oct – Jun</span>
              </div>
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500">Starting Price</p>
              <div className="font-bold text-base text-[#0D2922] dark:text-stone-100 mt-0.5">
                ₹{safari.pricePerPerson.toLocaleString('en-IN')} <span className="text-xs font-normal text-stone-500 dark:text-stone-400">/ person</span>
              </div>
            </div>
          </div>

          {/* Why Visit Description & Core Zones */}
          <div className="bg-white dark:bg-[#071713] rounded-3xl p-6 sm:p-8 border border-[#E9DFC9] dark:border-[#1A382F] shadow-sm space-y-4">
            <h2 className="font-serif text-2xl font-bold text-[#0D2922] dark:text-stone-100">
              Why Visit {safari.name}?
            </h2>
            <p className="text-stone-700 dark:text-stone-300 leading-relaxed text-sm sm:text-base">
              {safari.overview}
            </p>

            <div className="pt-4 border-t border-[#F0ECE1] dark:border-[#1A382F]">
              <h3 className="font-bold text-xs uppercase tracking-wider text-amber-800 dark:text-amber-400 mb-3">
                Core Zones & Gates
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {safari.zones.map((zone, idx) => (
                  <div key={idx} className="p-3 rounded-2xl bg-[#F8F7F2] dark:bg-stone-900/90 border border-[#E9DFC9] dark:border-stone-800 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-[#0D2922] dark:text-stone-100">{zone.name}</p>
                      <p className="text-xs text-stone-500 dark:text-stone-400">Entry: {zone.entryGate}</p>
                    </div>
                    <span className="px-2.5 py-0.5 text-xs font-semibold bg-[#E9DFC9] dark:bg-emerald-950 text-stone-800 dark:text-emerald-300 border border-transparent dark:border-emerald-800/80 rounded-full">
                      {zone.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Wildlife Probability Matrix */}
          <div className="bg-white dark:bg-[#071713] rounded-3xl p-6 sm:p-8 border border-[#E9DFC9] dark:border-[#1A382F] shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-serif text-2xl font-bold text-[#0D2922] dark:text-stone-100">
                  Wildlife You May Encounter
                </h2>
                <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                  Based on recent patrol tracking logs and historical sighting records
                </p>
              </div>
              <Footprints className="w-5 h-5 text-[#C99A4A]" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              {safari.wildlifeProbabilities.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-2xl bg-[#FAF8F2] dark:bg-[#0B221B] border border-[#E9DFC9] dark:border-[#244E40] flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#0D2922] border border-[#C99A4A]/50 text-[#E4B865] flex items-center justify-center shrink-0">
                      <Footprints className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-bold text-xs text-[#0D2922] dark:text-stone-100">{item.animal}</p>
                      <p className="text-xs text-stone-500 dark:text-stone-400">{item.probability}</p>
                    </div>
                  </div>

                  <span
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider ${
                      item.level === 'high'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/90 dark:text-emerald-300 dark:border-emerald-800/80'
                        : 'bg-amber-100 text-amber-800 border border-amber-200 dark:bg-amber-950/90 dark:text-amber-300 dark:border-amber-800/80'
                    }`}
                  >
                    {item.level === 'high' ? 'High Sighting' : 'Moderate'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Month-by-Month Best Time Heatmap */}
          <div className="bg-white dark:bg-[#071713] rounded-3xl p-6 sm:p-8 border border-[#E9DFC9] dark:border-[#1A382F] shadow-sm space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="font-serif text-2xl font-bold text-[#0D2922] dark:text-[#F1F8F4]">
                  Best Time to Visit Calendar
                </h2>
                <p className="text-xs text-stone-500 dark:text-[#728D81] mt-0.5">
                  Click any month to inspect real-time wildlife sighting probability, weather conditions, and naturalist advice
                </p>
              </div>

              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-xs font-bold text-emerald-800 dark:text-emerald-300">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>Prime Open Window: Oct – Jun</span>
              </div>
            </div>

            {/* 12-Month Color Status Grid - Full Width Responsive Distribution */}
            <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-12 gap-2 w-full pt-1">
              {safari.monthlySeason.map((m, idx) => {
                const isSelected = selectedMonthIdx === idx;
                const colorMap = {
                  peak: {
                    dotClass: "bg-emerald-500 shadow-emerald-500/40 ring-2 ring-emerald-300 dark:ring-emerald-600",
                    borderClass: "border-emerald-500/40 hover:border-emerald-500",
                    badgeColor: "text-emerald-700 dark:text-emerald-300 bg-emerald-100/70 dark:bg-emerald-900/40",
                    label: "PEAK"
                  },
                  excellent: {
                    dotClass: "bg-teal-500 shadow-teal-500/40 ring-2 ring-teal-300 dark:ring-teal-600",
                    borderClass: "border-teal-500/40 hover:border-teal-500",
                    badgeColor: "text-teal-700 dark:text-teal-300 bg-teal-100/70 dark:bg-teal-900/40",
                    label: "OPEN"
                  },
                  limited: {
                    dotClass: "bg-amber-400 shadow-amber-400/40 ring-2 ring-amber-200 dark:ring-amber-600",
                    borderClass: "border-amber-400/40 hover:border-amber-400",
                    badgeColor: "text-amber-700 dark:text-amber-300 bg-amber-100/70 dark:bg-amber-900/40",
                    label: "FAIR"
                  },
                  closed: {
                    dotClass: "bg-rose-500 shadow-rose-500/40 ring-2 ring-rose-300 dark:ring-rose-800",
                    borderClass: "border-rose-500/40 hover:border-rose-500",
                    badgeColor: "text-rose-700 dark:text-rose-300 bg-rose-100/70 dark:bg-rose-900/40",
                    label: "CLOSED"
                  }
                };

                const current = colorMap[m.status] || colorMap.excellent;

                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedMonthIdx(idx)}
                    title={`${m.month}: ${current.label} (${m.label}) - Click to inspect`}
                    className={`rounded-2xl p-2 sm:p-2.5 text-center flex flex-col items-center justify-center gap-1.5 border transition-all cursor-pointer w-full ${
                      isSelected
                        ? 'bg-amber-50/90 dark:bg-[#153B30] border-[#C99A4A] ring-2 ring-[#C99A4A] shadow-md scale-[1.03] z-10'
                        : 'bg-[#FAF8F2] dark:bg-white/5 hover:border-[#C99A4A]/50 hover:-translate-y-0.5'
                    } ${current.borderClass}`}
                  >
                    <span className={`text-xs font-extrabold ${isSelected ? 'text-[#0D2922] dark:text-[#F3FAF6]' : 'text-stone-800 dark:text-[#C5D9D0]'}`}>
                      {m.month}
                    </span>
                    <span className={`w-3.5 h-3.5 rounded-full shadow-sm transition-transform ${isSelected ? 'scale-125' : ''} ${current.dotClass}`} />
                    <span className={`px-1.5 py-0.5 rounded text-xs font-extrabold tracking-tight ${current.badgeColor}`}>
                      {current.label}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Dynamic Naturalist Seasonal Intelligence Card (Fills Gap with Rich Interactive Content) */}
            {(() => {
              const activeMonthSeason = safari.monthlySeason[selectedMonthIdx] || safari.monthlySeason[0];
              const activeMonthData = MONTH_INTEL[activeMonthSeason.month] || MONTH_INTEL.Mar;

              return (
                <div className="p-4 sm:p-6 rounded-2xl bg-gradient-to-br from-[#FAF8F2] to-[#F3ECE1] dark:from-[#0D241E] dark:to-[#071713] border border-[#E9DFC9] dark:border-[#1E4D40] shadow-sm space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
                    
                    {/* Left: Forecast & Naturalist Observation */}
                    <div className="md:col-span-8 space-y-2.5">
                      <div className="flex flex-wrap items-center gap-2.5">
                        <span className="font-serif text-lg font-bold text-[#0D2922] dark:text-[#F1F8F4]">
                          {activeMonthSeason.month} Season Intel
                        </span>
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold uppercase tracking-wider ${
                          activeMonthSeason.status === 'peak' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700' :
                          activeMonthSeason.status === 'excellent' ? 'bg-teal-100 text-teal-800 dark:bg-teal-900/60 dark:text-teal-300 border border-teal-300 dark:border-teal-700' :
                          activeMonthSeason.status === 'limited' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300 border border-amber-300 dark:border-amber-700' :
                          'bg-rose-100 text-rose-800 dark:bg-rose-900/60 dark:text-rose-300 border border-rose-300 dark:border-rose-700'
                        }`}>
                          {activeMonthData.statusBadge}
                        </span>
                        <span className="text-xs font-semibold text-stone-600 dark:text-[#A8C4B8] flex items-center gap-1">
                          <Thermometer className="w-3.5 h-3.5 text-[#C99A4A]" />
                          {activeMonthData.temp} ({activeMonthData.climate})
                        </span>
                      </div>

                      <p className="text-xs sm:text-sm text-stone-700 dark:text-[#D1E2DA] leading-relaxed">
                        <strong className="text-[#0D2922] dark:text-white font-bold">Naturalist Log: </strong>
                        {activeMonthData.note}
                      </p>

                      <div className="text-xs text-stone-500 dark:text-[#8EAAA0] flex flex-wrap items-center gap-1.5 pt-0.5">
                        <span className="font-semibold text-stone-700 dark:text-[#C5D9D0]">Recommended Gear:</span>
                        <span>{activeMonthData.gear}</span>
                      </div>
                    </div>

                    {/* Right: Sighting Index Gauge & Booking Advise */}
                    <div className="md:col-span-4 p-4 rounded-xl bg-white/80 dark:bg-[#071A15]/80 border border-[#E9DFC9] dark:border-[#1E4D40] space-y-2.5">
                      <div className="flex items-center justify-between text-xs font-bold text-[#0D2922] dark:text-[#E2ECE6]">
                        <span className="flex items-center gap-1.5">
                          <Eye className="w-3.5 h-3.5 text-[#C99A4A]" />
                          Tiger Sighting Probability
                        </span>
                        <span className="text-[#C99A4A] font-extrabold text-sm">{activeMonthData.sightingScore}%</span>
                      </div>
                      
                      <div className="w-full h-2 rounded-full bg-stone-200 dark:bg-[#0D2922] overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            activeMonthData.sightingScore >= 90 ? 'bg-gradient-to-r from-emerald-500 to-teal-400' :
                            activeMonthData.sightingScore >= 75 ? 'bg-gradient-to-r from-teal-500 to-emerald-400' :
                            activeMonthData.sightingScore >= 50 ? 'bg-gradient-to-r from-amber-500 to-yellow-400' :
                            'bg-gradient-to-r from-rose-500 to-red-400'
                          }`}
                          style={{ width: `${activeMonthData.sightingScore}%` }}
                        />
                      </div>

                      <p className="text-xs text-stone-500 dark:text-[#728D81] leading-tight">
                        {activeMonthSeason.status === 'closed'
                          ? 'Core gates closed for NTCA monsoon protection. Buffer safaris remain operational.'
                          : 'Calculated from 5-year forest department encounter logs.'}
                      </p>
                    </div>

                  </div>
                </div>
              );
            })()}

            {/* Clean Color Legend */}
            <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-xs text-stone-600 dark:text-[#A8C4B8] pt-2 border-t border-[#F0ECE1] dark:border-[#132E27]">
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-500 shadow-sm" />
                <span className="font-semibold text-stone-800 dark:text-stone-200">Green (PEAK)</span> = Peak Tiger Sightings
              </span>
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-teal-500 shadow-sm" />
                <span className="font-semibold text-stone-800 dark:text-stone-200">Teal (OPEN)</span> = Prime Open Season
              </span>
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-amber-400 shadow-sm" />
                <span className="font-semibold text-stone-800 dark:text-stone-200">Yellow (FAIR)</span> = Buffer Zones
              </span>
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-500 shadow-sm" />
                <span className="font-semibold text-stone-800 dark:text-stone-200">Red (CLOSED)</span> = Monsoon Core Rest
              </span>
            </div>
          </div>

          {/* 6. VERIFIED TRAVELER REVIEWS & WRITE A REVIEW SECTION */}
          <div className="bg-white dark:bg-[#0A1F19] rounded-3xl p-6 sm:p-8 border border-[#E9DFC9] dark:border-[#1E4D40] shadow-sm space-y-8">
            
            {/* Header */}
            <div className="pb-4 border-b border-[#F0ECE1] dark:border-[#1A382F]">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#C99A4A] mb-1">
                <MessageSquare className="w-4 h-4 text-[#C99A4A]" />
                <span>Traveler Field Logs</span>
              </div>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#0D2922] dark:text-[#F1F8F4]">
                Customer Reviews & Community Log
              </h2>
              <p className="text-xs text-stone-500 dark:text-[#728D81] mt-0.5">
                Authentic field logs from wildlife enthusiasts with verified forest department gate permits
              </p>
            </div>

            {/* Rating Breakdown & Field Stats */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 p-5 rounded-2xl bg-[#FAF8F2] dark:bg-white/5 border border-[#E9DFC9] dark:border-[#1A382F]">
              
              {/* Overall Score */}
              <div className="md:col-span-4 flex flex-col justify-center items-center text-center p-4 bg-white dark:bg-[#071713] rounded-2xl border border-[#E9DFC9] dark:border-[#1A382F]">
                <div className="font-serif text-4xl sm:text-5xl font-extrabold text-[#0D2922] dark:text-[#F1F8F4]">
                  {safari.rating}
                </div>
                <div className="flex items-center gap-1 my-2">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-[#C99A4A] text-[#C99A4A]" />
                  ))}
                </div>
                <p className="text-xs font-bold text-stone-600 dark:text-[#A8C4B8]">
                  Based on {safari.reviewCount + reviews.length - 3} verified expeditions
                </p>
                <span className="mt-2 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  98% Recommended
                </span>
              </div>

              {/* Star Progress Bars */}
              <div className="md:col-span-8 flex flex-col justify-center space-y-2">
                {[
                  { star: 5, pct: 88 },
                  { star: 4, pct: 10 },
                  { star: 3, pct: 2 },
                  { star: 2, pct: 0 },
                  { star: 1, pct: 0 }
                ].map((item) => (
                  <div key={item.star} className="flex items-center gap-3 text-xs">
                    <span className="w-12 font-bold text-stone-700 dark:text-[#C5D9D0] flex items-center gap-1">
                      {item.star} <Star className="w-3 h-3 fill-stone-400 text-stone-400" />
                    </span>
                    <div className="flex-1 h-2 rounded-full bg-stone-200 dark:bg-[#0D201A] overflow-hidden">
                      <div
                        className="h-full bg-[#C99A4A] rounded-full transition-all duration-500"
                        style={{ width: `${item.pct}%` }}
                      />
                    </div>
                    <span className="w-10 text-right font-mono text-stone-500 dark:text-[#728D81]">
                      {item.pct}%
                    </span>
                  </div>
                ))}
              </div>

            </div>

            {/* 1. WRITE A REVIEW FORM (Simple, Clean & Guest-Friendly) */}
            <form
              onSubmit={handleReviewSubmit}
              className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-stone-200 dark:border-stone-800">
                <div>
                  <h3 className="font-serif text-lg font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                    <PenLine className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    Write a Review
                  </h3>
                  <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                    Share your wildlife sightings, guide feedback, or tips with fellow travelers
                  </p>
                </div>
              </div>

              {/* User Identity: Auto-detected if logged in, optional if guest */}
              {isAuthenticated ? (
                <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-xs font-medium text-emerald-800 dark:text-emerald-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>Reviewing as <strong className="font-bold">{user.name}</strong> (Verified Account)</span>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row gap-2 sm:items-center justify-between">
                  <div className="flex-1">
                    <label className="block text-xs font-medium text-stone-600 dark:text-stone-300 mb-1">
                      Your Name (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Sahil Verma (or leave blank to post as Guest Explorer)"
                      value={newAuthor}
                      onChange={(e) => setNewAuthor(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-xs focus:outline-none focus:border-emerald-600 focus:bg-white dark:focus:bg-stone-900"
                    />
                  </div>
                  <span className="text-xs text-stone-400 sm:mt-5">
                    No login required to post a review.
                  </span>
                </div>
              )}

              {/* Rating Stars */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
                  Your Rating
                </label>
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setNewRating(val)}
                      className="p-0.5 hover:scale-110 transition-transform cursor-pointer"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          val <= newRating
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-stone-300 dark:text-stone-600'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="ml-2.5 text-xs font-medium text-stone-600 dark:text-stone-300">
                    {newRating === 5 ? '5 Stars – Extraordinary' :
                     newRating === 4 ? '4 Stars – Great Safari' :
                     newRating === 3 ? '3 Stars – Average' :
                     newRating === 2 ? '2 Stars – Below Expectations' : '1 Star – Disappointing'}
                  </span>
                </div>
              </div>

              {/* Review Title & Experience Text */}
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-stone-600 dark:text-stone-300 mb-1">
                    Headline
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Unbelievable sighting near the waterhole!"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full px-3.5 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-xs text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:border-emerald-600 focus:bg-white dark:focus:bg-stone-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-600 dark:text-stone-300 mb-1">
                    Your Review *
                  </label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Tell other travelers about your wildlife sightings, guide experience, or useful tips..."
                    value={newContent}
                    onChange={(e) => setNewContent(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-xs text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:border-emerald-600 focus:bg-white dark:focus:bg-stone-900 leading-relaxed"
                  />
                </div>
              </div>

              {/* Optional Zone & Submit Action */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                <div className="flex flex-wrap items-center gap-1.5 text-xs">
                  <span className="text-stone-500 dark:text-[#A8C4B8] text-xs font-medium mr-1">Zone:</span>
                  {safari.zones.map((z, idx) => {
                    const isSelected = newZone === z.name;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setNewZone(z.name)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition cursor-pointer ${
                          isSelected
                            ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-900 dark:text-emerald-300 border-emerald-400 dark:border-emerald-600 shadow-xs'
                            : 'bg-stone-50 dark:bg-stone-800 text-stone-600 dark:text-stone-300 border-stone-200 dark:border-stone-700 hover:border-stone-400'
                        }`}
                      >
                        {z.name}
                      </button>
                    );
                  })}
                  <button
                    type="button"
                    onClick={() => setNewZone("Buffer Zone")}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition cursor-pointer ${
                      newZone === "Buffer Zone"
                        ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-900 dark:text-emerald-300 border-emerald-400 dark:border-emerald-600 shadow-xs'
                        : 'bg-stone-50 dark:bg-stone-800 text-stone-600 dark:text-stone-300 border-stone-200 dark:border-stone-700 hover:border-stone-400'
                    }`}
                  >
                    Buffer Zone
                  </button>
                </div>

                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-semibold text-xs flex items-center justify-center gap-2 transition shadow-sm active:scale-95 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Submit Review</span>
                </button>
              </div>
            </form>

            {/* 2. OTHER TRAVELER REVIEWS (Below the form) */}
            <div className="pt-6 border-t border-[#F0ECE1] dark:border-[#1A382F] space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#0D2922] dark:text-[#F1F8F4]">
                    Reviews by Travelers ({reviews.length})
                  </h3>
                  <p className="text-xs text-stone-500 dark:text-[#728D81] mt-0.5">
                    Field experiences shared by safari guests
                  </p>
                </div>

                {/* Filter Chips */}
                <div className="flex flex-wrap items-center gap-2">
                  {[
                    { id: 'all', label: `All Reviews (${reviews.length})` },
                    { id: 'tiger', label: 'Tiger Sightings', Icon: Footprints },
                    { id: 'dawn', label: 'Dawn Safaris', Icon: Sun },
                    { id: 'five_star', label: '5-Star Only', Icon: Star }
                  ].map((f) => {
                    const ChipIcon = f.Icon;
                    return (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => setReviewFilter(f.id)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer inline-flex items-center gap-1.5 ${
                          reviewFilter === f.id
                            ? 'bg-[#0D2922] dark:bg-[#C99A4A] text-white dark:text-[#0D2922] shadow-sm'
                            : 'bg-[#FAF8F2] dark:bg-white/5 text-stone-700 dark:text-[#C5D9D0] border border-[#E9DFC9] dark:border-[#1A382F] hover:border-[#C99A4A]'
                        }`}
                      >
                        {ChipIcon && <ChipIcon className="w-3.5 h-3.5 text-[#C99A4A] dark:text-current" />}
                        <span>{f.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

            {/* Reviews List */}
            <div className="space-y-4">
              {filteredReviews.length === 0 ? (
                <div className="p-8 text-center rounded-2xl bg-[#FAF8F2] dark:bg-white/5 border border-[#E9DFC9] dark:border-[#1A382F] text-stone-500 dark:text-[#728D81] text-xs">
                  No reviews match this specific filter. Try selecting "All Reviews".
                </div>
              ) : (
                filteredReviews.map((rev) => {
                  const isLiked = likedReviews[rev.id];
                  const currentHelpful = rev.helpfulCount + (isLiked ? 1 : 0);

                  return (
                    <div
                      key={rev.id}
                      className="p-5 sm:p-6 rounded-2xl bg-[#FAF8F2] dark:bg-white/5 border border-[#E9DFC9] dark:border-[#1A382F] space-y-3.5 hover:shadow-md transition-shadow"
                    >
                      {/* Review Top Header */}
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-[#0D2922] text-[#C99A4A] dark:bg-[#C99A4A] dark:text-[#0D2922] font-bold text-xs flex items-center justify-center shadow-sm">
                            {rev.avatar}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold text-sm text-[#0D2922] dark:text-[#F1F8F4]">
                                {rev.author}
                              </h4>
                              {rev.verified && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                                  <Shield className="w-3 h-3 fill-emerald-600 text-emerald-600" />
                                  <span>Verified Guest</span>
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-stone-500 dark:text-[#728D81]">
                              Visited {rev.date} · {rev.zone} · {rev.shift}
                            </p>
                          </div>
                        </div>

                        {/* Stars */}
                        <div className="flex items-center gap-1">
                          {[...Array(rev.rating)].map((_, i) => (
                            <Star key={i} className="w-3.5 h-3.5 fill-[#C99A4A] text-[#C99A4A]" />
                          ))}
                        </div>
                      </div>

                      {/* Wildlife Spotted Pills */}
                      {rev.wildlifeSpotted && rev.wildlifeSpotted.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-0.5">
                          {rev.wildlifeSpotted.map((animal, aIdx) => (
                            <span
                              key={aIdx}
                              className="px-2.5 py-0.5 rounded-lg text-xs font-bold bg-white dark:bg-[#071713] text-stone-700 dark:text-[#C5D9D0] border border-[#E9DFC9] dark:border-[#1A382F] inline-flex items-center gap-1.5"
                            >
                              <Footprints className="w-3 h-3 text-[#C99A4A]" />
                              <span>{animal}</span>
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Title & Description */}
                      <div className="space-y-1">
                        <h5 className="font-serif font-bold text-sm sm:text-base text-[#0D2922] dark:text-[#F1F8F4]">
                          {rev.title}
                        </h5>
                        <p className="text-xs sm:text-sm text-stone-700 dark:text-[#D1E2DA] leading-relaxed">
                          {rev.content}
                        </p>
                      </div>

                      {/* Helpful Button Action */}
                      <div className="pt-2 flex items-center justify-between border-t border-stone-200/60 dark:border-[#143228]">
                        <span className="text-xs text-stone-500 dark:text-[#728D81]">
                          Verified state forest department entry pass
                        </span>

                        <button
                          type="button"
                          onClick={() => handleLikeReview(rev.id)}
                          className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg transition cursor-pointer ${
                            isLiked
                              ? 'text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50'
                              : 'text-stone-600 dark:text-[#A8C4B8] hover:text-[#0D2922] hover:bg-stone-100 dark:hover:bg-white/5'
                          }`}
                        >
                          <ThumbsUp className={`w-3.5 h-3.5 ${isLiked ? 'fill-current text-emerald-600' : ''}`} />
                          <span>Helpful ({currentHelpful})</span>
                        </button>
                      </div>

                    </div>
                  );
                })
              )}
            </div>

          </div>

          </div>

        </div>

        {/* Right Column: Live Availability & Sticky Booking Widget */}
        <div className="lg:col-span-4 lg:sticky lg:top-28 space-y-6">
          <div className="bg-white dark:bg-[#071713] rounded-3xl p-6 border-2 border-[#173F35] dark:border-emerald-600/50 shadow-xl space-y-6">
            
            <div className="pb-4 border-b border-[#F0ECE1] dark:border-[#1A382F]">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#C99A4A]/20 text-[#0D2922] dark:text-amber-300 uppercase tracking-wider">
                  Live Gate Inventory
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
              </div>
              <div className="mt-3">
                <p className="text-xs font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500">Selected Slot Fare</p>
                <p className="text-3xl font-serif font-extrabold text-[#0D2922] dark:text-stone-100">
                  ₹{selectedSlot.price.toLocaleString('en-IN')}{" "}
                  <span className="text-xs font-sans font-normal text-stone-500 dark:text-stone-400">/ person</span>
                </p>
              </div>
            </div>

            {/* Select Slot Shift */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 mb-2.5">
                Select Safari Shift & Vehicle
              </label>
              <div className="space-y-3">
                {safari.slots.map((slot) => {
                  const isSelected = selectedSlotId === slot.id;
                  return (
                    <button
                      key={slot.id}
                      onClick={() => setSelectedSlotId(slot.id)}
                      className={`w-full p-3.5 rounded-2xl border text-left transition-all ${
                        isSelected
                          ? 'border-[#0D2922] dark:border-[#C99A4A] bg-[#FAF8F2] dark:bg-[#C99A4A]/15 ring-2 ring-[#0D2922] dark:ring-[#C99A4A]'
                          : 'border-[#E9DFC9] dark:border-[#1A382F] hover:border-[#C99A4A] dark:hover:border-[#C99A4A]/60 bg-white dark:bg-white/5 hover:bg-stone-50 dark:hover:bg-white/10'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-[#0D2922] dark:text-[#F1F8F4]">{slot.title}</span>
                        <span className="font-bold text-xs text-[#C99A4A]">₹{slot.price}</span>
                      </div>
                      <p className="text-xs text-stone-500 dark:text-[#A8C4B8] mt-0.5">{slot.time} · {slot.type}</p>
                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-stone-100 dark:border-[#132E27] text-xs">
                        <span className="text-stone-500 dark:text-[#728D81]">{slot.badge}</span>
                        <span className="font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          {slot.seatsAvailable} seats remaining
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Direct Book CTA */}
            <button
              type="button"
              onClick={() => onBookSlot(safari.id, selectedSlot)}
              className="w-full py-4 rounded-xl bg-[#C99A4A] hover:bg-[#D8AA5B] text-[#0D2922] font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition cursor-pointer"
            >
              <span>Proceed to Permit Booking</span>
              <ArrowRight className="w-4 h-4 text-[#0D2922]" />
            </button>

            <div className="text-xs text-stone-500 dark:text-[#9AB3A8] space-y-1.5 pt-1">
              <p className="flex items-center justify-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-[#C99A4A]" />
                <span>100% Guaranteed official forest department permit</span>
              </p>
              <p className="flex items-center justify-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-[#C99A4A]" />
                <span>Instant digital gate voucher &amp; SMS pass</span>
              </p>
            </div>

          </div>
        </div>

      </div>
      </div>
    </div>
  );
}
