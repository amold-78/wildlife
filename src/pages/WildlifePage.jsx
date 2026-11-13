import React, { useState, useRef } from 'react';
import { WILDLIFE_DATA } from '../data/wildlife';
import { BLOG_POSTS } from '../data/blogs';
import { 
  ArrowRight, Sparkles, MapPin, Search, BookOpen, Clock, 
  Check, Bookmark, Compass, X, ChevronRight 
} from 'lucide-react';

const RESERVE_TO_SAFARI_ID = {
  "Tadoba Andhari": "tadoba-andhari",
  "Ranthambore": "ranthambore",
  "Bandhavgarh": "bandhavgarh",
  "Pench": "pench",
  "Kanha": "kanha",
  "Kaziranga": "kaziranga",
  "Jim Corbett": "corbett",
  "Corbett": "corbett"
};

export default function WildlifePage({ onSelectSafari, onNavigate }) {
  const [activeTab, setActiveTab] = useState("all"); // "all", "encyclopedia", "blogs"
  const [selectedAnimal, setSelectedAnimal] = useState(WILDLIFE_DATA[0]);
  const [filterQuery, setFilterQuery] = useState("");
  const [selectedBlog, setSelectedBlog] = useState(null);
  const [blogCategory, setBlogCategory] = useState("all");
  const [bookmarkedBlogs, setBookmarkedBlogs] = useState([]);
  const [toastMessage, setToastMessage] = useState("");

  const spotlightRef = useRef(null);
  const blogsSectionRef = useRef(null);

  const getStatusBadge = (status) => {
    const s = (status || "").toLowerCase();
    if (s.includes('endangered')) {
      return 'bg-rose-100 text-rose-950 border border-rose-300 dark:bg-rose-950/80 dark:text-rose-200 dark:border-rose-700/70';
    }
    if (s.includes('vulnerable') && !s.includes('success')) {
      return 'bg-amber-100 text-amber-950 border border-amber-300 dark:bg-amber-950/80 dark:text-amber-200 dark:border-amber-700/70';
    }
    return 'bg-emerald-100 text-emerald-950 border border-emerald-300 dark:bg-emerald-950/80 dark:text-emerald-200 dark:border-emerald-700/70';
  };

  const handleAnimalSelect = (animal) => {
    setSelectedAnimal(animal);
    if (spotlightRef.current) {
      spotlightRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const handleReserveClick = (parkName) => {
    const safariId = RESERVE_TO_SAFARI_ID[parkName];
    if (safariId && onSelectSafari) {
      onSelectSafari(safariId);
    } else if (onNavigate) {
      onNavigate('explore');
    }
  };

  const toggleBookmark = (blogId, e) => {
    e?.stopPropagation();
    if (bookmarkedBlogs.includes(blogId)) {
      setBookmarkedBlogs(bookmarkedBlogs.filter(id => id !== blogId));
      showToast("Article removed from saved dispatches");
    } else {
      setBookmarkedBlogs([...bookmarkedBlogs, blogId]);
      showToast("Dispatch bookmarked for offline reading");
    }
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 2800);
  };

  const filteredAnimals = WILDLIFE_DATA.filter(a =>
    a.name.toLowerCase().includes(filterQuery.toLowerCase()) ||
    a.scientificName.toLowerCase().includes(filterQuery.toLowerCase()) ||
    a.habitat.toLowerCase().includes(filterQuery.toLowerCase())
  );

  const filteredBlogs = BLOG_POSTS.filter(b => {
    if (blogCategory === "all") return true;
    return b.category.toLowerCase().includes(blogCategory.toLowerCase());
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0D2922] text-[#E9DFC9] px-4 py-2.5 rounded-2xl border border-[#C99A4A]/40 shadow-2xl text-xs font-semibold flex items-center gap-2 animate-bounce">
          <Sparkles className="w-3.5 h-3.5 text-[#C99A4A]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header & Section Navigation */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-[#E9DFC9] dark:border-[#1A382F]">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#173F35]/10 dark:bg-[#173F35]/30 text-[#173F35] dark:text-[#A3D8C8] text-xs font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5 text-[#C99A4A]" />
            <span>Official Naturalist Portal & Field Dispatches</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-5xl font-extrabold text-[#0D2922] dark:text-[#F1F8F4]">
            Wildlife Field Guide & Dispatches
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 dark:text-[#92ABA0] mt-2 leading-relaxed">
            Explore behavioral traits, sighting indices, and conservation lore from frontline forest rangers, accompanied by in-depth expedition articles.
          </p>
        </div>

        {/* View Mode Toggle Buttons */}
        <div className="flex items-center gap-2 p-1 bg-stone-100 dark:bg-[#0D201A] rounded-2xl border border-stone-200 dark:border-[#1A382F] self-start md:self-auto flex-shrink-0">
          <button
            onClick={() => setActiveTab("all")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === "all"
                ? "bg-[#0D2922] text-white dark:bg-[#C99A4A] dark:text-[#0D2922] shadow-sm"
                : "text-stone-600 dark:text-[#A8C4B8] hover:text-[#0D2922] dark:hover:text-white"
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Complete Guide</span>
          </button>
          <button
            onClick={() => setActiveTab("encyclopedia")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === "encyclopedia"
                ? "bg-[#0D2922] text-white dark:bg-[#C99A4A] dark:text-[#0D2922] shadow-sm"
                : "text-stone-600 dark:text-[#A8C4B8] hover:text-[#0D2922] dark:hover:text-white"
            }`}
          >
            <span>🐅 Species Guide</span>
          </button>
          <button
            onClick={() => setActiveTab("blogs")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === "blogs"
                ? "bg-[#0D2922] text-white dark:bg-[#C99A4A] dark:text-[#0D2922] shadow-sm"
                : "text-stone-600 dark:text-[#A8C4B8] hover:text-[#0D2922] dark:hover:text-white"
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Expedition Blogs ({BLOG_POSTS.length})</span>
          </button>
        </div>
      </div>

      {/* SECTION 1: SPECIES ENCYCLOPEDIA (Visible when activeTab is 'all' or 'encyclopedia') */}
      {(activeTab === "all" || activeTab === "encyclopedia") && (
        <div className="space-y-10 animate-fade-in">

          {/* Featured Animal Spotlight Banner */}
          {selectedAnimal && (
            <div 
              ref={spotlightRef}
              className="bg-white dark:bg-[#0D201A] rounded-3xl border border-[#E9DFC9] dark:border-[#1A382F] overflow-hidden shadow-xl grid grid-cols-1 lg:grid-cols-12 transition-all"
            >
              <div className="lg:col-span-5 aspect-[16/11] lg:aspect-auto relative bg-stone-100 dark:bg-[#071713] overflow-hidden">
                <img
                  src={selectedAnimal.image}
                  alt={selectedAnimal.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 left-4 w-12 h-12 rounded-2xl bg-black/60 backdrop-blur-md flex items-center justify-center text-3xl">
                  {selectedAnimal.icon}
                </div>
                
                <div className="absolute bottom-4 left-4 right-4 bg-black/75 backdrop-blur-md rounded-2xl p-3 border border-white/20 text-white text-xs flex items-center justify-between">
                  <span className="text-stone-300">Conservation Status:</span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${getStatusBadge(selectedAnimal.conservationStatus)}`}>
                    {selectedAnimal.conservationStatus}
                  </span>
                </div>
              </div>

              <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-between space-y-6">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <div className="flex items-center gap-2 text-xs text-[#C99A4A] font-bold uppercase tracking-wider">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Active Species Spotlight</span>
                    </div>
                    <span className="text-xs text-stone-400 font-mono">
                      Habitat: {selectedAnimal.habitat.split(',')[0]}
                    </span>
                  </div>

                  <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#0D2922] dark:text-[#F1F8F4]">
                    {selectedAnimal.name}
                  </h2>
                  <p className="text-xs sm:text-sm italic font-serif text-stone-500 dark:text-[#A8C4B8] mt-0.5">
                    Scientific name: {selectedAnimal.scientificName}
                  </p>

                  <p className="text-xs sm:text-sm text-stone-700 dark:text-[#BDCFC7] leading-relaxed mt-4">
                    {selectedAnimal.description}
                  </p>

                  {/* Data Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6">
                    <div className="p-3.5 rounded-2xl bg-[#FAF8F2] dark:bg-[#071713] border border-[#E9DFC9] dark:border-[#1A382F]">
                      <p className="text-[10px] uppercase font-bold text-stone-400 dark:text-[#728D81]">Diet</p>
                      <p className="text-xs font-semibold text-stone-800 dark:text-stone-200 mt-0.5">{selectedAnimal.diet}</p>
                    </div>
                    <div className="p-3.5 rounded-2xl bg-[#FAF8F2] dark:bg-[#071713] border border-[#E9DFC9] dark:border-[#1A382F]">
                      <p className="text-[10px] uppercase font-bold text-stone-400 dark:text-[#728D81]">Best Sighting Window</p>
                      <p className="text-xs font-semibold text-[#173F35] dark:text-[#A3D8C8] mt-0.5">{selectedAnimal.bestChance}</p>
                    </div>
                  </div>

                  {/* Naturalist Fact */}
                  <div className="mt-4 p-3.5 rounded-2xl bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-700/50 text-xs text-amber-950 dark:text-amber-200 flex items-start gap-2.5">
                    <span className="text-base select-none">💡</span>
                    <div>
                      <span className="font-bold">Naturalist Field Note: </span>
                      <span>{selectedAnimal.funFact}</span>
                    </div>
                  </div>
                </div>

                {/* Top Reserves Links */}
                <div className="pt-4 border-t border-[#F0ECE1] dark:border-[#132E27]">
                  <p className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-[#A8C4B8] mb-2.5">
                    Prime National Reserves to Spot {selectedAnimal.name}:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {selectedAnimal.topReserves.map((park, i) => (
                      <button
                        key={i}
                        onClick={() => handleReserveClick(park)}
                        className="px-3.5 py-1.5 rounded-xl bg-[#0D2922] hover:bg-[#173F35] dark:bg-[#173F35] dark:hover:bg-[#205244] text-white dark:text-emerald-100 border border-transparent dark:border-emerald-700/40 text-xs font-bold transition flex items-center gap-1.5 active:scale-95 cursor-pointer shadow-sm"
                      >
                        <MapPin className="w-3 h-3 text-[#C99A4A]" />
                        <span>{park}</span>
                        <ArrowRight className="w-3 h-3 text-[#C99A4A]" />
                      </button>
                    ))}
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* Grid of All Wildlife Cards */}
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="font-serif text-2xl font-bold text-[#0D2922] dark:text-[#F1F8F4]">
                  All Wildlife Species
                </h3>
                <p className="text-xs text-stone-500 dark:text-[#728D81] mt-0.5">
                  Click any species below to spotlight its full dossier and prime reserves
                </p>
              </div>

              {/* Filter Search */}
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type="text"
                  placeholder="Filter animals by name..."
                  value={filterQuery}
                  onChange={(e) => setFilterQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-stone-200 dark:border-[#1A382F] bg-white dark:bg-[#071713] text-stone-800 dark:text-stone-200 text-xs focus:outline-none focus:border-[#C99A4A]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredAnimals.map((animal) => {
                const isSelected = selectedAnimal?.id === animal.id;
                return (
                  <div
                    key={animal.id}
                    onClick={() => handleAnimalSelect(animal)}
                    className={`cursor-pointer rounded-3xl p-5 transition-all shadow-sm flex items-center justify-between gap-4 active:scale-98 ${
                      isSelected
                        ? 'bg-amber-50/70 dark:bg-[#C99A4A]/15 border-2 border-[#C99A4A] ring-2 ring-[#C99A4A]/40 shadow-md'
                        : 'bg-white dark:bg-[#0D201A] border border-[#E9DFC9] dark:border-[#1A382F] hover:border-[#C99A4A]/60 hover:shadow-md'
                    }`}
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="w-16 h-16 rounded-2xl overflow-hidden bg-stone-100 dark:bg-[#071713] flex-shrink-0 relative border border-stone-200 dark:border-stone-800">
                        <img src={animal.image} alt={animal.name} className="w-full h-full object-cover" />
                        <span className="absolute bottom-1 right-1 text-sm">{animal.icon}</span>
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h4 className="font-serif font-bold text-sm text-[#0D2922] dark:text-[#F1F8F4] truncate">
                            {animal.name}
                          </h4>
                        </div>
                        <p className="text-[11px] italic text-stone-500 dark:text-[#A8C4B8] truncate">
                          {animal.scientificName}
                        </p>
                        
                        {/* High Contrast Conservation Badge */}
                        <div className="mt-1.5 flex items-center gap-2">
                          <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${getStatusBadge(animal.conservationStatus)}`}>
                            {animal.conservationStatus}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex-shrink-0">
                      {isSelected ? (
                        <span className="w-7 h-7 rounded-full bg-[#C99A4A] text-[#0D2922] font-bold text-xs flex items-center justify-center shadow-sm">
                          ✓
                        </span>
                      ) : (
                        <span className="w-7 h-7 rounded-full bg-stone-100 dark:bg-white/5 text-stone-400 group-hover:text-stone-700 flex items-center justify-center text-xs">
                          <ChevronRight className="w-4 h-4" />
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      )}

      {/* SECTION 2: NATURALIST DISPATCHES & EXPEDITION BLOGS */}
      {(activeTab === "all" || activeTab === "blogs") && (
        <div ref={blogsSectionRef} className="pt-8 space-y-8 animate-fade-in">
          
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#E9DFC9] dark:border-[#1A382F] pb-4">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#C99A4A] uppercase tracking-wider mb-1">
                <BookOpen className="w-3.5 h-3.5" />
                <span>WildTrail Journal & Expedition Dispatches</span>
              </div>
              <h2 className="font-serif text-2xl sm:text-3xl font-extrabold text-[#0D2922] dark:text-[#F1F8F4]">
                Field Diaries, Tracking Lore & Park Insights
              </h2>
            </div>

            {/* Category Filter Chips */}
            <div className="flex flex-wrap gap-1.5">
              {["all", "Field Tracking", "Safari Planning", "Photography", "Conservation"].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setBlogCategory(cat)}
                  className={`px-3 py-1 rounded-xl text-xs font-semibold transition ${
                    blogCategory === cat
                      ? "bg-[#C99A4A] text-[#0D2922] font-bold shadow-sm"
                      : "bg-white dark:bg-[#0D201A] text-stone-600 dark:text-[#A8C4B8] border border-stone-200 dark:border-[#1A382F] hover:bg-stone-50"
                  }`}
                >
                  {cat === "all" ? "All Dispatches" : cat}
                </button>
              ))}
            </div>
          </div>

          {/* Blogs Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBlogs.map((blog) => {
              const isSaved = bookmarkedBlogs.includes(blog.id);
              return (
                <article
                  key={blog.id}
                  onClick={() => setSelectedBlog(blog)}
                  className="bg-white dark:bg-[#0D201A] rounded-3xl border border-[#E9DFC9] dark:border-[#1A382F] overflow-hidden shadow-sm hover:shadow-xl transition-all cursor-pointer flex flex-col group"
                >
                  {/* Card Cover Image */}
                  <div className="relative aspect-[16/10] overflow-hidden bg-stone-100 dark:bg-[#071713]">
                    <img
                      src={blog.coverImage}
                      alt={blog.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3">
                      <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-[#0D2922]/90 text-white backdrop-blur-md border border-white/20">
                        {blog.category}
                      </span>
                    </div>

                    <button
                      onClick={(e) => toggleBookmark(blog.id, e)}
                      className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition ${
                        isSaved
                          ? 'bg-[#C99A4A] text-[#0D2922]'
                          : 'bg-black/50 text-white hover:bg-black/70'
                      }`}
                      title={isSaved ? "Remove Bookmark" : "Save Dispatch"}
                    >
                      <Bookmark className="w-3.5 h-3.5 fill-current" />
                    </button>
                  </div>

                  {/* Card Body */}
                  <div className="p-6 flex flex-col flex-1 justify-between space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-[11px] text-stone-500 dark:text-[#A8C4B8]">
                        <Clock className="w-3.5 h-3.5 text-[#C99A4A]" />
                        <span>{blog.readTime}</span>
                        <span>·</span>
                        <span>{blog.publishDate}</span>
                      </div>

                      <h3 className="font-serif font-bold text-lg text-[#0D2922] dark:text-[#F1F8F4] group-hover:text-[#C99A4A] transition leading-snug">
                        {blog.title}
                      </h3>

                      <p className="text-xs text-stone-600 dark:text-[#BDCFC7] line-clamp-3 leading-relaxed">
                        {blog.excerpt}
                      </p>
                    </div>

                    {/* Author & Read Action */}
                    <div className="pt-4 border-t border-stone-100 dark:border-[#132E27] flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={blog.author.avatar}
                          alt={blog.author.name}
                          className="w-7 h-7 rounded-full object-cover border border-[#C99A4A]/50"
                        />
                        <div>
                          <p className="text-xs font-bold text-[#0D2922] dark:text-[#F1F8F4] leading-tight">
                            {blog.author.name}
                          </p>
                          <p className="text-[10px] text-stone-400 dark:text-[#728D81]">
                            {blog.author.role}
                          </p>
                        </div>
                      </div>

                      <span className="text-xs font-bold text-[#C99A4A] flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                        <span>Read</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>

                  </div>
                </article>
              );
            })}
          </div>

        </div>
      )}

      {/* FULL BLOG ARTICLE READING MODAL */}
      {selectedBlog && (
        <div 
          onClick={() => setSelectedBlog(null)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-start justify-center p-3 sm:p-6 overflow-y-auto animate-fade-in"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-[#0D201A] w-full max-w-3xl rounded-3xl border border-[#E9DFC9] dark:border-[#1A382F] shadow-2xl overflow-hidden my-4"
          >
            {/* Modal Header Cover */}
            <div className="relative aspect-[21/9] sm:aspect-[21/8] overflow-hidden bg-stone-900">
              <img
                src={selectedBlog.coverImage}
                alt={selectedBlog.title}
                className="w-full h-full object-cover opacity-85"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0D201A] via-transparent to-black/40" />

              {/* Close Button */}
              <button
                onClick={() => setSelectedBlog(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-black/60 hover:bg-black/90 text-white backdrop-blur-md transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="absolute bottom-4 left-6 right-6">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#C99A4A] text-[#0D2922] uppercase tracking-wider">
                  {selectedBlog.category}
                </span>
              </div>
            </div>

            {/* Modal Article Content */}
            <div className="p-6 sm:p-10 space-y-6">
              
              <div>
                <div className="flex items-center gap-3 text-xs text-stone-500 dark:text-[#A8C4B8] mb-2">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-[#C99A4A]" />
                    {selectedBlog.readTime}
                  </span>
                  <span>·</span>
                  <span>Published {selectedBlog.publishDate}</span>
                </div>

                <h1 className="font-serif text-2xl sm:text-4xl font-extrabold text-[#0D2922] dark:text-[#F1F8F4] leading-tight">
                  {selectedBlog.title}
                </h1>
                <p className="text-sm font-serif italic text-stone-600 dark:text-[#A8C4B8] mt-2">
                  {selectedBlog.subtitle}
                </p>
              </div>

              {/* Author Bio Box */}
              <div className="p-4 rounded-2xl bg-[#FAF8F2] dark:bg-[#071713] border border-[#E9DFC9] dark:border-[#1A382F] flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <img
                    src={selectedBlog.author.avatar}
                    alt={selectedBlog.author.name}
                    className="w-12 h-12 rounded-2xl object-cover border border-[#C99A4A]"
                  />
                  <div>
                    <h4 className="text-xs font-bold text-[#0D2922] dark:text-[#F1F8F4]">
                      {selectedBlog.author.name}
                    </h4>
                    <p className="text-[11px] text-stone-500 dark:text-[#A8C4B8]">
                      {selectedBlog.author.role} · {selectedBlog.author.experience}
                    </p>
                  </div>
                </div>

                <button
                  onClick={(e) => toggleBookmark(selectedBlog.id, e)}
                  className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition flex items-center gap-1.5 ${
                    bookmarkedBlogs.includes(selectedBlog.id)
                      ? "bg-[#C99A4A] text-[#0D2922] border-[#C99A4A]"
                      : "bg-white dark:bg-white/5 border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-300"
                  }`}
                >
                  <Bookmark className="w-3.5 h-3.5 fill-current" />
                  <span>{bookmarkedBlogs.includes(selectedBlog.id) ? "Saved" : "Save"}</span>
                </button>
              </div>

              {/* Key Takeaways Callout */}
              {selectedBlog.keyTakeaways && (
                <div className="p-5 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 space-y-2">
                  <p className="text-xs font-bold text-emerald-950 dark:text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#C99A4A]" />
                    Key Naturalist Field Takeaways:
                  </p>
                  <ul className="space-y-1.5 text-xs text-emerald-900 dark:text-emerald-200">
                    {selectedBlog.keyTakeaways.map((point, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Article Content Sections */}
              <div className="space-y-6 pt-2">
                {selectedBlog.sections.map((section, idx) => (
                  <div key={idx} className="space-y-2">
                    <h3 className="font-serif text-xl font-bold text-[#0D2922] dark:text-[#F1F8F4]">
                      {section.heading}
                    </h3>
                    <p className="text-xs sm:text-sm text-stone-700 dark:text-[#BDCFC7] leading-relaxed whitespace-pre-line">
                      {section.content}
                    </p>
                  </div>
                ))}
              </div>

              {/* Tags */}
              <div className="pt-4 border-t border-stone-200 dark:border-[#132E27] flex flex-wrap gap-2">
                {selectedBlog.tags.map((tag, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 rounded-xl text-[11px] font-semibold bg-stone-100 dark:bg-[#071713] text-stone-600 dark:text-[#A8C4B8] border border-stone-200 dark:border-[#1A382F]"
                  >
                    #{tag}
                  </span>
                ))}
              </div>

              {/* Modal Footer CTA */}
              <div className="pt-6 border-t border-[#F0ECE1] dark:border-[#132E27] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-bold text-[#0D2922] dark:text-[#F1F8F4]">
                    Inspired by this dispatch?
                  </p>
                  <p className="text-xs text-stone-500 dark:text-[#728D81]">
                    Book an official government gate permit to experience these trails.
                  </p>
                </div>

                <button
                  onClick={() => {
                    setSelectedBlog(null);
                    if (onNavigate) onNavigate('explore');
                  }}
                  className="px-6 py-3 rounded-2xl bg-[#C99A4A] hover:bg-[#B88939] text-[#0D2922] font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xl transition active:scale-95 cursor-pointer"
                >
                  <span>Explore National Reserves</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}
