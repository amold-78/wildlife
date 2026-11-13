import React, { useState, useRef } from 'react';
import { WILDLIFE_DATA } from '../data/wildlife';
import { BLOG_POSTS } from '../data/blogs';
import {
  ArrowRight,
  MapPin,
  Search,
  BookOpen,
  Clock,
  Check,
  Bookmark,
  Compass,
  X,
  ChevronRight,
  Lightbulb,
  Footprints,
} from 'lucide-react';

const RESERVE_TO_SAFARI_ID = {
  'Tadoba Andhari': 'tadoba-andhari',
  Ranthambore: 'ranthambore',
  Bandhavgarh: 'kanha',
  Pench: 'pench',
  Kanha: 'kanha',
  Kaziranga: 'kaziranga',
  'Jim Corbett': 'corbett',
  Corbett: 'corbett',
};

export default function WildlifePage({ onSelectSafari, onNavigate }) {
  const [activeTab, setActiveTab] = useState('all'); // "all", "encyclopedia", "blogs"
  const [selectedAnimal, setSelectedAnimal] = useState(WILDLIFE_DATA[0]);
  const [filterQuery, setFilterQuery] = useState('');
  const [selectedBlog, setSelectedBlog] = useState(null);
  const [blogCategory, setBlogCategory] = useState('all');
  const [bookmarkedBlogs, setBookmarkedBlogs] = useState([]);
  const [toastMessage, setToastMessage] = useState('');

  const spotlightRef = useRef(null);
  const blogsSectionRef = useRef(null);

  const getStatusBadge = (status) => {
    const s = (status || '').toLowerCase();
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
      setBookmarkedBlogs(bookmarkedBlogs.filter((id) => id !== blogId));
      showToast('Article removed from saved dispatches');
    } else {
      setBookmarkedBlogs([...bookmarkedBlogs, blogId]);
      showToast('Dispatch bookmarked for field reading');
    }
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 2800);
  };

  const filteredAnimals = WILDLIFE_DATA.filter(
    (a) =>
      a.name.toLowerCase().includes(filterQuery.toLowerCase()) ||
      a.scientificName.toLowerCase().includes(filterQuery.toLowerCase()) ||
      a.habitat.toLowerCase().includes(filterQuery.toLowerCase()),
  );

  const filteredBlogs = BLOG_POSTS.filter((b) => {
    if (blogCategory === 'all') return true;
    return b.category.toLowerCase().includes(blogCategory.toLowerCase());
  });

  return (
    <div className="min-h-screen">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-20 right-6 z-50 bg-[#0B221B] text-[#F4EBDA] px-4 py-2.5 rounded-xl border border-[#C99A4A]/50 shadow-2xl text-xs font-semibold flex items-center gap-2 transition-all duration-300">
          <Footprints className="w-3.5 h-3.5 text-[#C99A4A]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Editorial Deep Canopy Emerald Header Strip */}
      <section className="bg-gradient-to-b from-[#09211A] to-[#0D2922] border-b border-[#265244] text-[#F4EBDA]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-9 sm:py-11 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="max-w-3xl">
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#F8F3E8] tracking-tight">
              Wildlife Field Guide &amp; Dispatches
            </h1>
            <p className="text-xs sm:text-sm text-[#C8D8D0] mt-1.5 leading-relaxed">
              Behavioral traits, sighting windows, and conservation dispatches from frontline forest rangers across six protected sanctuaries.
            </p>
          </div>

          {/* View Mode Toggle Buttons */}
          <div className="flex items-center gap-1.5 p-1 bg-[#071713] rounded-xl border border-[#265244] self-start md:self-auto shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab('all')}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'all'
                  ? 'bg-[#C99A4A] text-[#0D2922] shadow-sm'
                  : 'text-[#C8D8D0] hover:text-white'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Complete Guide</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('encyclopedia')}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'encyclopedia'
                  ? 'bg-[#C99A4A] text-[#0D2922] shadow-sm'
                  : 'text-[#C8D8D0] hover:text-white'
              }`}
            >
              <Footprints className="w-3.5 h-3.5" />
              <span>Species Guide</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('blogs')}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'blogs'
                  ? 'bg-[#C99A4A] text-[#0D2922] shadow-sm'
                  : 'text-[#C8D8D0] hover:text-white'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Dispatches ({BLOG_POSTS.length})</span>
            </button>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
        {/* SECTION 1: SPECIES ENCYCLOPEDIA */}
        {(activeTab === 'all' || activeTab === 'encyclopedia') && (
          <div className="space-y-10 animate-fade-in">
            {/* Featured Animal Spotlight Banner */}
            {selectedAnimal && (
              <div
                ref={spotlightRef}
                className="bg-[#FBF8F3] dark:bg-[#0B221B] rounded-2xl border border-[#D8CEBE] dark:border-[#244E40] overflow-hidden shadow-xl grid grid-cols-1 lg:grid-cols-12 transition-all"
              >
                <div className="lg:col-span-5 aspect-[16/11] lg:aspect-auto relative bg-[#0D2922] overflow-hidden">
                  <img
                    src={selectedAnimal.image}
                    alt={selectedAnimal.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-4 left-4 w-11 h-11 rounded-xl bg-[#09211A] border border-[#C99A4A]/50 flex items-center justify-center text-[#E4B865]">
                    <Footprints className="w-5 h-5" />
                  </div>

                  <div className="absolute bottom-4 left-4 right-4 bg-[#09211A] rounded-xl p-3 border border-[#265244] text-[#F4EBDA] text-xs flex items-center justify-between">
                    <span className="text-[#B8CEC4]">IUCN Status:</span>
                    <span
                      className={`px-2.5 py-0.5 rounded-md text-xs font-bold ${getStatusBadge(
                        selectedAnimal.conservationStatus,
                      )}`}
                    >
                      {selectedAnimal.conservationStatus}
                    </span>
                  </div>
                </div>

                <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-between space-y-6">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <div className="flex items-center gap-2 text-xs text-[#B88428] dark:text-[#E4B865] font-mono font-bold uppercase tracking-wider">
                        <Footprints className="w-3.5 h-3.5 text-[#C99A4A]" />
                        <span>Active Species Dossier</span>
                      </div>
                      <span className="text-xs text-[#64776E] dark:text-[#9AB3A8] font-mono">
                        Habitat: {selectedAnimal.habitat.split(',')[0]}
                      </span>
                    </div>

                    <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#14261F] dark:text-[#F8F3E8]">
                      {selectedAnimal.name}
                    </h2>
                    <p className="text-xs sm:text-sm italic font-serif text-[#43564E] dark:text-[#B8CEC4] mt-0.5">
                      Taxonomy: {selectedAnimal.scientificName}
                    </p>

                    <p className="text-xs sm:text-sm text-[#14261F] dark:text-[#D8E6DF] leading-relaxed mt-4">
                      {selectedAnimal.description}
                    </p>

                    {/* Data Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6">
                      <div className="p-3.5 rounded-xl bg-white dark:bg-[#071713] border border-[#D8CEBE] dark:border-[#265244]">
                        <p className="text-[11px] font-mono uppercase tracking-wider text-[#64776E] dark:text-[#88A398]">
                          Primary Diet
                        </p>
                        <p className="text-xs font-semibold text-[#14261F] dark:text-[#F0ECE1] mt-1">
                          {selectedAnimal.diet}
                        </p>
                      </div>
                      <div className="p-3.5 rounded-xl bg-white dark:bg-[#071713] border border-[#D8CEBE] dark:border-[#265244]">
                        <p className="text-[11px] font-mono uppercase tracking-wider text-[#64776E] dark:text-[#88A398]">
                          Optimal Sighting Window
                        </p>
                        <p className="text-xs font-semibold text-[#0D2922] dark:text-[#86EFAC] mt-1">
                          {selectedAnimal.bestChance}
                        </p>
                      </div>
                    </div>

                    {/* Naturalist Fact */}
                    <div className="mt-4 p-3.5 rounded-xl bg-[#EFE6D7] dark:bg-[#113127] border border-[#C99A4A]/45 text-xs text-[#14261F] dark:text-[#F4EBDA] flex items-start gap-2.5">
                      <Lightbulb className="w-4 h-4 text-[#C99A4A] shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-[#0D2922] dark:text-[#E4B865]">
                          Naturalist Field Note:{' '}
                        </span>
                        <span>{selectedAnimal.funFact}</span>
                      </div>
                    </div>
                  </div>

                  {/* Top Reserves Links */}
                  <div className="pt-4 border-t border-[#E5DEC9] dark:border-[#1D4337]">
                    <p className="text-xs font-bold uppercase tracking-wider text-[#43564E] dark:text-[#B8CEC4] mb-2.5">
                      Prime National Reserves to Track {selectedAnimal.name}:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {selectedAnimal.topReserves.map((park, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => handleReserveClick(park)}
                          className="px-3.5 py-2 rounded-xl bg-[#0D2922] hover:bg-[#173F35] dark:bg-[#173F35] dark:hover:bg-[#215448] text-[#F8F3E8] border border-[#265244] text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm"
                        >
                          <MapPin className="w-3.5 h-3.5 text-[#C99A4A]" />
                          <span>{park}</span>
                          <ArrowRight className="w-3.5 h-3.5 text-[#C99A4A]" />
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
                  <h3 className="font-serif text-2xl font-bold text-[#14261F] dark:text-[#F8F3E8]">
                    Subcontinent Fauna Index
                  </h3>
                  <p className="text-xs text-[#43564E] dark:text-[#9AB3A8] mt-0.5">
                    Select any species below to inspect its tracking dossier and reserve habitats
                  </p>
                </div>

                {/* Filter Search */}
                <div className="relative w-full sm:w-64">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#64776E]" />
                  <input
                    type="text"
                    placeholder="Filter species by name..."
                    value={filterQuery}
                    onChange={(e) => setFilterQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#D8CEBE] dark:border-[#265244] bg-[#FBF8F3] dark:bg-[#0B221B] text-[#14261F] dark:text-[#F0ECE1] text-xs focus:outline-none focus:border-[#C99A4A]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredAnimals.map((animal) => {
                  const isSelected = selectedAnimal?.id === animal.id;
                  return (
                    <button
                      key={animal.id}
                      type="button"
                      onClick={() => handleAnimalSelect(animal)}
                      className={`w-full text-left cursor-pointer rounded-2xl p-4 transition-all shadow-sm flex items-center justify-between gap-4 ${
                        isSelected
                          ? 'bg-[#EFE6D7] dark:bg-[#133329] border-2 border-[#C99A4A] ring-2 ring-[#C99A4A]/35 shadow-md'
                          : 'bg-[#FBF8F3] dark:bg-[#0B221B] border border-[#D8CEBE] dark:border-[#244E40] hover:border-[#C99A4A]/60 hover:shadow-md'
                      }`}
                    >
                      <div className="flex items-center gap-4 min-w-0">
                        <div className="w-16 h-16 rounded-xl overflow-hidden bg-[#0D2922] shrink-0 relative border border-[#D8CEBE] dark:border-[#265244]">
                          <img
                            src={animal.image}
                            alt={animal.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-serif font-bold text-sm text-[#14261F] dark:text-[#F8F3E8] truncate">
                            {animal.name}
                          </h4>
                          <p className="text-xs italic text-[#43564E] dark:text-[#9AB3A8] truncate">
                            {animal.scientificName}
                          </p>
                          <div className="mt-1.5 flex items-center gap-2">
                            <span
                              className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold ${getStatusBadge(
                                animal.conservationStatus,
                              )}`}
                            >
                              {animal.conservationStatus}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="shrink-0">
                        {isSelected ? (
                          <span className="w-7 h-7 rounded-full bg-[#C99A4A] text-[#0D2922] font-bold text-xs flex items-center justify-center shadow-sm">
                            <Check className="w-4 h-4" />
                          </span>
                        ) : (
                          <span className="w-7 h-7 rounded-full bg-[#EFE6D7] dark:bg-white/5 text-[#43564E] dark:text-[#9AB3A8] flex items-center justify-center text-xs">
                            <ChevronRight className="w-4 h-4" />
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* SECTION 2: NATURALIST DISPATCHES & EXPEDITION BLOGS */}
        {(activeTab === 'all' || activeTab === 'blogs') && (
          <div ref={blogsSectionRef} className="pt-4 space-y-8 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#D8CEBE] dark:border-[#244E40] pb-4">
              <div>
                <div className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-[#B88428] dark:text-[#E4B865] uppercase tracking-wider mb-1">
                  <BookOpen className="w-3.5 h-3.5 text-[#C99A4A]" />
                  <span>WildTrail Journal &amp; Expedition Dispatches</span>
                </div>
                <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#14261F] dark:text-[#F8F3E8]">
                  Field Diaries, Tracking Lore &amp; Park Insights
                </h2>
              </div>

              {/* Category Filter Chips */}
              <div className="flex flex-wrap gap-1.5">
                {['all', 'Field Tracking', 'Safari Planning', 'Photography', 'Conservation'].map(
                  (cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setBlogCategory(cat)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                        blogCategory === cat
                          ? 'bg-[#C99A4A] text-[#0D2922] font-bold shadow-sm'
                          : 'bg-[#FBF8F3] dark:bg-[#0B221B] text-[#43564E] dark:text-[#C8D8D0] border border-[#D8CEBE] dark:border-[#244E40] hover:border-[#C99A4A]'
                      }`}
                    >
                      {cat === 'all' ? 'All Dispatches' : cat}
                    </button>
                  ),
                )}
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
                    className="bg-[#FBF8F3] dark:bg-[#0B221B] rounded-2xl border border-[#D8CEBE] dark:border-[#244E40] overflow-hidden shadow-sm hover:border-[#C99A4A]/70 hover:shadow-xl transition-all cursor-pointer flex flex-col group"
                  >
                    {/* Card Cover Image */}
                    <div className="relative aspect-[16/10] overflow-hidden bg-[#0D2922]">
                      <img
                        src={blog.coverImage}
                        alt={blog.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-3 left-3">
                        <span className="px-3 py-1 rounded-lg text-xs font-semibold bg-[#09211A] text-[#F4EBDA] border border-[#C99A4A]/45">
                          {blog.category}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => toggleBookmark(blog.id, e)}
                        className={`absolute top-3 right-3 p-2 rounded-lg transition cursor-pointer ${
                          isSaved
                            ? 'bg-[#C99A4A] text-[#0D2922]'
                            : 'bg-[#09211A]/85 text-white hover:bg-[#09211A]'
                        }`}
                        title={isSaved ? 'Remove Bookmark' : 'Save Dispatch'}
                      >
                        <Bookmark className="w-3.5 h-3.5 fill-current" />
                      </button>
                    </div>

                    {/* Card Body */}
                    <div className="p-6 flex flex-col flex-1 justify-between space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-xs text-[#43564E] dark:text-[#9AB3A8]">
                          <Clock className="w-3.5 h-3.5 text-[#C99A4A]" />
                          <span>{blog.readTime}</span>
                          <span>·</span>
                          <span>{blog.publishDate}</span>
                        </div>

                        <h3 className="font-serif font-bold text-lg text-[#14261F] dark:text-[#F8F3E8] group-hover:text-[#B88428] dark:group-hover:text-[#E4B865] transition leading-snug">
                          {blog.title}
                        </h3>

                        <p className="text-xs text-[#43564E] dark:text-[#B8CEC4] line-clamp-3 leading-relaxed">
                          {blog.excerpt}
                        </p>
                      </div>

                      {/* Author & Read Action */}
                      <div className="pt-4 border-t border-[#E5DEC9] dark:border-[#1D4337] flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={blog.author.avatar}
                            alt={blog.author.name}
                            className="w-7 h-7 rounded-full object-cover border border-[#C99A4A]/50"
                          />
                          <div>
                            <p className="text-xs font-bold text-[#14261F] dark:text-[#F8F3E8] leading-tight">
                              {blog.author.name}
                            </p>
                            <p className="text-[11px] text-[#64776E] dark:text-[#9AB3A8]">
                              {blog.author.role}
                            </p>
                          </div>
                        </div>

                        <span className="text-xs font-bold text-[#B88428] dark:text-[#E4B865] flex items-center gap-1 group-hover:translate-x-1 transition-transform">
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
      </div>

      {/* FULL BLOG ARTICLE READING MODAL */}
      {selectedBlog && (
        <div
          onClick={() => setSelectedBlog(null)}
          className="fixed inset-0 z-50 bg-[#04100C]/85 flex items-start justify-center p-3 sm:p-6 overflow-y-auto animate-fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-[#FBF8F3] dark:bg-[#0B221B] w-full max-w-3xl rounded-2xl border border-[#D8CEBE] dark:border-[#265244] shadow-2xl overflow-hidden my-4"
          >
            {/* Modal Header Cover */}
            <div className="relative aspect-[21/9] sm:aspect-[21/8] overflow-hidden bg-[#09211A]">
              <img
                src={selectedBlog.coverImage}
                alt={selectedBlog.title}
                className="w-full h-full object-cover opacity-85"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#09211A] via-transparent to-black/40" />

              {/* Close Button */}
              <button
                type="button"
                onClick={() => setSelectedBlog(null)}
                aria-label="Close article"
                className="absolute top-4 right-4 p-2 rounded-lg bg-[#09211A]/90 hover:bg-[#09211A] text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="absolute bottom-4 left-6 right-6">
                <span className="px-3 py-1 rounded-lg text-xs font-bold bg-[#C99A4A] text-[#0D2922] uppercase tracking-wider">
                  {selectedBlog.category}
                </span>
              </div>
            </div>

            {/* Modal Article Content */}
            <div className="p-6 sm:p-10 space-y-6">
              <div>
                <div className="flex items-center gap-3 text-xs text-[#43564E] dark:text-[#9AB3A8] mb-2">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-[#C99A4A]" />
                    {selectedBlog.readTime}
                  </span>
                  <span>·</span>
                  <span>Published {selectedBlog.publishDate}</span>
                </div>

                <h1 className="font-serif text-2xl sm:text-4xl font-bold text-[#14261F] dark:text-[#F8F3E8] leading-tight">
                  {selectedBlog.title}
                </h1>
                <p className="text-sm font-serif italic text-[#43564E] dark:text-[#B8CEC4] mt-2">
                  {selectedBlog.subtitle}
                </p>
              </div>

              {/* Author Bio Box */}
              <div className="p-4 rounded-xl bg-white dark:bg-[#071713] border border-[#D8CEBE] dark:border-[#265244] flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <img
                    src={selectedBlog.author.avatar}
                    alt={selectedBlog.author.name}
                    className="w-11 h-11 rounded-xl object-cover border border-[#C99A4A]"
                  />
                  <div>
                    <h4 className="text-xs font-bold text-[#14261F] dark:text-[#F8F3E8]">
                      {selectedBlog.author.name}
                    </h4>
                    <p className="text-xs text-[#43564E] dark:text-[#9AB3A8]">
                      {selectedBlog.author.role} · {selectedBlog.author.experience}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={(e) => toggleBookmark(selectedBlog.id, e)}
                  className={`px-3.5 py-1.5 rounded-xl border text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                    bookmarkedBlogs.includes(selectedBlog.id)
                      ? 'bg-[#C99A4A] text-[#0D2922] border-[#C99A4A]'
                      : 'bg-[#FBF8F3] dark:bg-[#0B221B] border-[#D8CEBE] dark:border-[#265244] text-[#14261F] dark:text-[#F0ECE1]'
                  }`}
                >
                  <Bookmark className="w-3.5 h-3.5 fill-current" />
                  <span>{bookmarkedBlogs.includes(selectedBlog.id) ? 'Saved' : 'Save'}</span>
                </button>
              </div>

              {/* Key Takeaways Callout */}
              {selectedBlog.keyTakeaways && (
                <div className="p-5 rounded-xl bg-[#EFE6D7] dark:bg-[#113127] border border-[#C99A4A]/45 space-y-2">
                  <p className="text-xs font-bold text-[#0D2922] dark:text-[#E4B865] uppercase tracking-wider flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-[#C99A4A]" />
                    <span>Key Naturalist Field Takeaways</span>
                  </p>
                  <ul className="space-y-1.5 text-xs text-[#14261F] dark:text-[#F4EBDA]">
                    {selectedBlog.keyTakeaways.map((point, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <Check className="w-3.5 h-3.5 text-[#0D2922] dark:text-[#4ADE80] shrink-0 mt-0.5" />
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
                    <h3 className="font-serif text-xl font-bold text-[#14261F] dark:text-[#F8F3E8]">
                      {section.heading}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#14261F] dark:text-[#D8E6DF] leading-relaxed whitespace-pre-line">
                      {section.content}
                    </p>
                  </div>
                ))}
              </div>

              {/* Tags */}
              <div className="pt-4 border-t border-[#E5DEC9] dark:border-[#1D4337] flex flex-wrap gap-2">
                {selectedBlog.tags.map((tag, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 rounded-lg text-xs font-mono bg-[#EFE6D7] dark:bg-[#071713] text-[#43564E] dark:text-[#B8CEC4] border border-[#D8CEBE] dark:border-[#265244]"
                  >
                    #{tag}
                  </span>
                ))}
              </div>

              {/* Modal Footer CTA */}
              <div className="pt-6 border-t border-[#E5DEC9] dark:border-[#1D4337] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-bold text-[#14261F] dark:text-[#F8F3E8]">
                    Inspired by this field dispatch?
                  </p>
                  <p className="text-xs text-[#43564E] dark:text-[#9AB3A8]">
                    Book an official government gate permit to experience these trails.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedBlog(null);
                    if (onNavigate) onNavigate('explore');
                  }}
                  className="px-6 py-3 rounded-xl bg-[#C99A4A] hover:bg-[#D8AA5B] text-[#0D2922] font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg transition cursor-pointer"
                >
                  <span>Browse National Reserves</span>
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
