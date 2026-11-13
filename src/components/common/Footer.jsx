import React from 'react';
import {
  Shield,
  Leaf,
  HeartHandshake,
  Award,
  Trash2,
  VolumeX,
  Compass,
  CameraOff,
  PhoneCall,
} from 'lucide-react';

export default function Footer({ onNavigate, onSelectSafari }) {
  const handleReserveSelect = (safariId) => {
    if (onSelectSafari) {
      onSelectSafari(safariId);
    } else if (onNavigate) {
      onNavigate('explore');
    }
  };

  return (
    <footer className="bg-[#09211A] text-[#E9DFC9] border-t border-[#265244]">
      {/* Responsible Tourism Banner */}
      <div className="border-b border-[#1D4337] bg-[#071A14]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-[#113127] border border-[#265244] text-[#C99A4A] shrink-0">
                <Leaf className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-serif text-lg text-[#F8F3E8] font-bold">
                  100% Eco-Certified Operators
                </h4>
                <p className="text-xs text-[#C8D8D0] mt-1 leading-relaxed">
                  Every safari booking complies strictly with National Tiger Conservation Authority (NTCA) carrying capacity limits.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-[#113127] border border-[#265244] text-[#C99A4A] shrink-0">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-serif text-lg text-[#F8F3E8] font-bold">
                  Official Gate Permits
                </h4>
                <p className="text-xs text-[#C8D8D0] mt-1 leading-relaxed">
                  Real forest department entry vouchers issued directly to your name with zero middleman markup.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-[#113127] border border-[#265244] text-[#C99A4A] shrink-0">
                <HeartHandshake className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-serif text-lg text-[#F8F3E8] font-bold">
                  Local Community Support
                </h4>
                <p className="text-xs text-[#C8D8D0] mt-1 leading-relaxed">
                  ₹150 from each booking directly funds tribal forest guide welfare and anti-poaching patrol equipment.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand Info */}
          <div className="space-y-4 md:col-span-1">
            <button
              type="button"
              onClick={() => onNavigate('home')}
              className="flex items-center gap-3 text-left group cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C99A4A] rounded-lg"
            >
              <div className="w-9 h-9 rounded-xl bg-[#113227] border border-[#C99A4A]/55 flex items-center justify-center shrink-0">
                <svg
                  viewBox="0 0 28 28"
                  fill="none"
                  className="w-5 h-5"
                  aria-hidden="true"
                >
                  <circle
                    cx="14"
                    cy="14"
                    r="11"
                    stroke="#C99A4A"
                    strokeWidth="1.25"
                    strokeDasharray="2 2.5"
                    opacity="0.75"
                  />
                  <path
                    d="M 10 22 C 8.5 18, 18.5 15.5, 14.5 11 C 12 8.5, 16.5 6.5, 18 5"
                    stroke="#E4B865"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <circle cx="18" cy="5.5" r="2" fill="#C99A4A" />
                </svg>
              </div>
              <span className="text-2xl font-serif font-bold text-[#F8F3E8] tracking-tight">
                WildTrail
              </span>
            </button>
            <p className="text-xs text-[#C8D8D0] leading-relaxed">
              India&apos;s premier ethical jungle safari booking platform. Experience authentic wildlife encounters while protecting fragile forest ecosystems.
            </p>
            <div className="pt-1 text-xs text-[#E4B865] flex items-center gap-2 font-medium">
              <Award className="w-4 h-4 shrink-0" />
              <span>Certified Sustainable Travel Partner</span>
            </div>
          </div>

          {/* Top Tiger Reserves */}
          <div>
            <h5 className="font-serif text-[#F8F3E8] font-semibold mb-4 text-sm tracking-wider uppercase">
              Top Tiger Reserves
            </h5>
            <ul className="space-y-2.5 text-xs text-[#C8D8D0]">
              <li>
                <button
                  type="button"
                  onClick={() => handleReserveSelect('tadoba-andhari')}
                  className="hover:text-[#E4B865] transition cursor-pointer"
                >
                  Tadoba Andhari, Maharashtra
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleReserveSelect('ranthambore')}
                  className="hover:text-[#E4B865] transition cursor-pointer"
                >
                  Ranthambore, Rajasthan
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleReserveSelect('pench')}
                  className="hover:text-[#E4B865] transition cursor-pointer"
                >
                  Pench National Park, MP
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleReserveSelect('corbett')}
                  className="hover:text-[#E4B865] transition cursor-pointer"
                >
                  Jim Corbett, Uttarakhand
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleReserveSelect('kanha')}
                  className="hover:text-[#E4B865] transition cursor-pointer"
                >
                  Kanha Tiger Reserve, MP
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleReserveSelect('kaziranga')}
                  className="hover:text-[#E4B865] transition cursor-pointer"
                >
                  Kaziranga National Park, Assam
                </button>
              </li>
            </ul>
          </div>

          {/* Explorer Tools */}
          <div>
            <h5 className="font-serif text-[#F8F3E8] font-semibold mb-4 text-sm tracking-wider uppercase">
              Explorer Suite
            </h5>
            <ul className="space-y-2.5 text-xs text-[#C8D8D0]">
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('finder')}
                  className="hover:text-[#E4B865] transition cursor-pointer"
                >
                  Smart Safari Recommendation Quiz
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('wildlife')}
                  className="hover:text-[#E4B865] transition cursor-pointer"
                >
                  Bengal Tiger &amp; Wildlife Encyclopedia
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('my-safari')}
                  className="hover:text-[#E4B865] transition cursor-pointer"
                >
                  My Safari Itinerary &amp; Passes
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('explore')}
                  className="hover:text-[#E4B865] transition cursor-pointer"
                >
                  Live Sighting Heatmaps
                </button>
              </li>
              <li className="pt-1 flex items-center gap-1.5 text-[#E4B865] font-mono">
                <PhoneCall className="w-3.5 h-3.5 shrink-0" />
                <span>Ranger SOS: 1800-WILD-911</span>
              </li>
            </ul>
          </div>

          {/* Forest Department Guidelines */}
          <div>
            <h5 className="font-serif text-[#F8F3E8] font-semibold mb-4 text-sm tracking-wider uppercase">
              Expedition Code
            </h5>
            <div className="bg-[#0D2922] border border-[#265244] rounded-xl p-4 text-xs space-y-2.5 text-[#E9DFC9]">
              <p className="flex items-center gap-2.5">
                <Trash2 className="w-3.5 h-3.5 text-[#C99A4A] shrink-0" />
                <span>Zero plastic waste policy</span>
              </p>
              <p className="flex items-center gap-2.5">
                <VolumeX className="w-3.5 h-3.5 text-[#C99A4A] shrink-0" />
                <span>Strict radio silence near big cat zones</span>
              </p>
              <p className="flex items-center gap-2.5">
                <Compass className="w-3.5 h-3.5 text-[#C99A4A] shrink-0" />
                <span>20 km/h speed threshold in core corridors</span>
              </p>
              <p className="flex items-center gap-2.5">
                <CameraOff className="w-3.5 h-3.5 text-[#C99A4A] shrink-0" />
                <span>No artificial flash photography</span>
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-[#1D4337] flex flex-col sm:flex-row items-center justify-between text-xs text-[#9AB3A8]">
          <p>© 2026 WildTrail Technologies Ltd. Discover the wild. Responsibly.</p>
          <p className="mt-2 sm:mt-0">NTCA Core &amp; Buffer Compliance · Official Reserve Gate Partner</p>
        </div>
      </div>
    </footer>
  );
}
