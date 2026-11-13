import tadobaDawnImg from '../assets/images/hero_tadoba_tiger_1794551605341.jpg';
import penchRiverImg from '../assets/images/pench_teak_river_mist_1794554011791.jpg';
import ranthamboreFortImg from '../assets/images/ranthambore_fort_tiger_1794553944885.jpg';
import corbettElephantsImg from '../assets/images/corbett_ramganga_elephants_1794554011811.jpg';
import kanhaMeadowImg from '../assets/images/kanha_sal_meadow_1794553946090.jpg';
import kazirangaRhinoImg from '../assets/images/kaziranga_rhino_mist_1794553946000.jpg';
import nightCampImg from '../assets/images/camp_night_firelight_1794552953124.jpg';

export interface ReserveSlide {
  src: string;
  alt: string;
  caption: string;
}

const VERIFIED_TIGER_WALK =
  'https://images.unsplash.com/photo-1549480017-d76466a4b7e8?auto=format&fit=crop&w=1200&q=80';
const VERIFIED_TIGER_PORTRAIT =
  'https://images.unsplash.com/photo-1561731216-c3a4d99437d5?auto=format&fit=crop&w=1200&q=80';
const VERIFIED_ASIAN_ELEPHANT =
  'https://images.unsplash.com/photo-1557050543-4d5f4e07ef46?auto=format&fit=crop&w=1200&q=80';

export const RESERVE_GALLERY_MAP: Record<string, ReserveSlide[]> = {
  'tadoba-andhari': [
    {
      src: tadobaDawnImg,
      alt: 'Royal Bengal tiger striding down a misty laterite forest road in Tadoba Andhari',
      caption: 'Moharli Dawn Track',
    },
    {
      src: VERIFIED_TIGER_WALK,
      alt: 'Bengal tiger moving through sunlit bamboo cover in Tadoba',
      caption: 'Telia Bamboo Thicket',
    },
    {
      src: penchRiverImg,
      alt: 'Morning teak canopy and rocky stream corridor in Central India',
      caption: 'Kolara Waterhole Edge',
    },
    {
      src: nightCampImg,
      alt: 'Warm campfire lit beside an expedition 4x4 Jeep at WildTrail night base camp',
      caption: 'Moharli Base Camp',
    },
  ],
  'pench-national-park': [
    {
      src: penchRiverImg,
      alt: 'Spotted chital deer beside the rocky Pench River through misty golden teak forest',
      caption: 'Pench River Mist',
    },
    {
      src: VERIFIED_TIGER_PORTRAIT,
      alt: 'Royal Bengal tiger resting along sunlit Pench deciduous woodland',
      caption: 'Touria Core Corridor',
    },
    {
      src: kanhaMeadowImg,
      alt: 'Golden dawn mist drifting over grassy Satpura forest meadows',
      caption: 'Karmajhiri Chaur',
    },
    {
      src: nightCampImg,
      alt: 'Twilight safari camp illuminated by firelight in the teak corridor',
      caption: 'Jamtara Evening Camp',
    },
  ],
  ranthambore: [
    {
      src: ranthamboreFortImg,
      alt: 'Bengal tiger passing ancient weathered stone fort ramparts beside Padam Talao lake',
      caption: 'Padam Talao Ramparts',
    },
    {
      src: VERIFIED_TIGER_WALK,
      alt: 'Predator patrolling dry deciduous forest trails in Ranthambore',
      caption: 'Zones 1–5 Lake Route',
    },
    {
      src: tadobaDawnImg,
      alt: 'Golden morning light across dry laterite safari tracks',
      caption: 'Bakaula Banyan Track',
    },
    {
      src: nightCampImg,
      alt: 'Evening base camp campfire with expedition 4x4 parked under night canopy',
      caption: 'Sawai Madhopur Camp',
    },
  ],
  'jim-corbett': [
    {
      src: corbettElephantsImg,
      alt: 'Wild Asian elephant matriarch herd wading across the Ramganga river beneath Himalayan foothills',
      caption: 'Ramganga Elephant Ford',
    },
    {
      src: VERIFIED_ASIAN_ELEPHANT,
      alt: 'Asian elephant crossing dense riverside woodland in northern India',
      caption: 'Dhikala Riverbank',
    },
    {
      src: kanhaMeadowImg,
      alt: 'Misty Himalayan foothill grassland clearing at sunrise',
      caption: 'Dhikala Chaur Dawn',
    },
    {
      src: nightCampImg,
      alt: 'Shivalik foothill safari base camp glowing under warm lantern and campfire light',
      caption: 'Dhangarhi Base Camp',
    },
  ],
  'kanha-tiger-reserve': [
    {
      src: kanhaMeadowImg,
      alt: 'Endemic Hardground Barasingha swamp deer herd in misty golden Kanha Sal meadows',
      caption: 'Barasingha Maidan',
    },
    {
      src: VERIFIED_TIGER_PORTRAIT,
      alt: 'Bengal tiger emerging from tall Sal woods in Kanha core range',
      caption: 'Mukki Sal Territory',
    },
    {
      src: penchRiverImg,
      alt: 'Sunlit forest stream winding through tall Sal and bamboo groves',
      caption: 'Bamni Dadar Creek',
    },
    {
      src: nightCampImg,
      alt: 'Evening campfire beside open-top 4x4 safari Jeep at Kanha camp',
      caption: 'Kisli Forest Halt',
    },
  ],
  'kaziranga-national-park': [
    {
      src: kazirangaRhinoImg,
      alt: 'Great One-Horned Rhinoceros standing in misty tall elephant grass wetlands of Kaziranga',
      caption: 'Kohora Rhino Wetland',
    },
    {
      src: corbettElephantsImg,
      alt: 'Elephant herd crossing braided floodplain river channels at dawn',
      caption: 'Bagori River Channel',
    },
    {
      src: VERIFIED_ASIAN_ELEPHANT,
      alt: 'Wild Asian elephant foraging along dense tall Assam grassland',
      caption: 'Agoratoli Grasslands',
    },
    {
      src: nightCampImg,
      alt: 'Brahmaputra floodplain base camp lit by campfire beneath night sky',
      caption: 'Kohora Twilight Camp',
    },
  ],
};

export function getReserveGallery(safariId: string, fallbackHeroImage: string, safariName: string): ReserveSlide[] {
  const curated = RESERVE_GALLERY_MAP[safariId];
  if (curated && curated.length >= 2) {
    return curated;
  }
  return [
    {
      src: fallbackHeroImage,
      alt: `${safariName} landscape`,
      caption: 'Core Reserve Route',
    },
    {
      src: nightCampImg,
      alt: `${safariName} base camp`,
      caption: 'Evening Base Camp',
    },
  ];
}
