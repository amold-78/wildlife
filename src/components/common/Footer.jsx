import React from 'react';
import { Shield, Leaf, HeartHandshake, PhoneCall, Award, ExternalLink } from 'lucide-react';

export default function Footer({ onNavigate }) {
  return (
    <footer className="bg-[#0D2922] text-[#E9DFC9] border-t border-[#173F35]">
      
      {/* Responsible Tourism Banner */}
      <div className="border-b border-[#173F35] bg-[#0A221C]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
            
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-2xl bg-[#173F35] text-[#C99A4A]">
                <Leaf className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-serif text-lg text-white font-bold">100% Eco-Certified Operators</h4>
                <p className="text-xs text-[#E9DFC9]/70 mt-1 leading-relaxed">
                  Every safari booking complies strictly with National Tiger Conservation Authority (NTCA) carrying capacity limits.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-3 rounded-2xl bg-[#173F35] text-[#C99A4A]">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-serif text-lg text-white font-bold">Official Gate Permits</h4>
                <p className="text-xs text-[#E9DFC9]/70 mt-1 leading-relaxed">
                  Real forest department entry vouchers issued directly to your name with zero middleman markup.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-3 rounded-2xl bg-[#173F35] text-[#C99A4A]">
                <HeartHandshake className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-serif text-lg text-white font-bold">Local Community Support</h4>
                <p className="text-xs text-[#E9DFC9]/70 mt-1 leading-relaxed">
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
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-[#C99A4A] flex items-center justify-center text-xl">
                🐅
              </div>
              <span className="text-2xl font-serif font-bold text-white tracking-tight">WildTrail</span>
            </div>
            <p className="text-xs text-[#E9DFC9]/80 leading-relaxed">
              India's premier ethical jungle safari booking platform. Experience authentic wildlife encounters while protecting fragile forest ecosystems.
            </p>
            <div className="pt-2 text-xs text-[#C99A4A] flex items-center gap-2">
              <Award className="w-4 h-4" />
              <span>Certified Sustainable Travel Partner</span>
            </div>
          </div>

          {/* Top Tiger Reserves */}
          <div>
            <h5 className="font-serif text-white font-semibold mb-4 text-sm tracking-wider uppercase">
              Top Tiger Reserves
            </h5>
            <ul className="space-y-2 text-xs text-[#E9DFC9]/75">
              <li><button onClick={() => onNavigate('explore')} className="hover:text-[#C99A4A] transition">Tadoba Andhari, Maharashtra</button></li>
              <li><button onClick={() => onNavigate('explore')} className="hover:text-[#C99A4A] transition">Ranthambore, Rajasthan</button></li>
              <li><button onClick={() => onNavigate('explore')} className="hover:text-[#C99A4A] transition">Pench National Park, MP</button></li>
              <li><button onClick={() => onNavigate('explore')} className="hover:text-[#C99A4A] transition">Jim Corbett, Uttarakhand</button></li>
              <li><button onClick={() => onNavigate('explore')} className="hover:text-[#C99A4A] transition">Kanha Tiger Reserve, MP</button></li>
              <li><button onClick={() => onNavigate('explore')} className="hover:text-[#C99A4A] transition">Kaziranga National Park, Assam</button></li>
            </ul>
          </div>

          {/* Explorer Tools */}
          <div>
            <h5 className="font-serif text-white font-semibold mb-4 text-sm tracking-wider uppercase">
              Explorer Suite
            </h5>
            <ul className="space-y-2 text-xs text-[#E9DFC9]/75">
              <li><button onClick={() => onNavigate('finder')} className="hover:text-[#C99A4A] transition">Smart Safari Recommendation Quiz</button></li>
              <li><button onClick={() => onNavigate('wildlife')} className="hover:text-[#C99A4A] transition">Bengal Tiger & Wildlife Encyclopedia</button></li>
              <li><button onClick={() => onNavigate('my-safari')} className="hover:text-[#C99A4A] transition">My Safari Itinerary & Passes</button></li>
              <li><button onClick={() => onNavigate('explore')} className="hover:text-[#C99A4A] transition">Live Sighting Heatmaps</button></li>
              <li><span className="text-[#C99A4A]">Ranger Emergency SOS: 1800-WILD-911</span></li>
            </ul>
          </div>

          {/* Forest Department Guidelines */}
          <div>
            <h5 className="font-serif text-white font-semibold mb-4 text-sm tracking-wider uppercase">
              Expedition Code
            </h5>
            <div className="bg-[#173F35]/50 border border-[#173F35] rounded-xl p-4 text-xs space-y-2 text-[#E9DFC9]/90">
              <p>🚯 Zero plastic waste policy</p>
              <p>🔇 Strict radio silence near big cat zones</p>
              <p>🚙 20 km/h speed threshold in core corridors</p>
              <p>📸 No artificial flash photography</p>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-[#173F35] flex flex-col sm:flex-row items-center justify-between text-xs text-[#E9DFC9]/60">
          <p>© 2026 WildTrail Technologies Ltd. Discover the wild. Responsibly.</p>
          <p className="mt-2 sm:mt-0">Built with modern React, Tailwind & NTCA Wildlife Guidelines</p>
        </div>
      </div>
    </footer>
  );
}
