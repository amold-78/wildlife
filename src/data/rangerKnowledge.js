export const RANGER_SUGGESTIONS = [
  "Which park has the highest tiger sighting right now?",
  "I am traveling with senior parents. What do you suggest?",
  "What is the difference between Gypsy and Canter safaris?",
  "What permits and documents do I need to enter the reserve?",
  "What should I wear and pack for a morning safari?"
];

export const RANGER_KNOWLEDGE_BASE = [
  {
    keywords: ["tadoba", "tiger", "best tiger", "highest sighting", "sighting"],
    title: "Tadoba Andhari & Tiger Sightings",
    reply: "Tadoba Andhari (Maharashtra) currently holds our highest tiger sighting index (88%), especially around Moharli and Kolara zones. March through May brings frequent predator activity near natural waterholes. If you want peak photography, book the **Dawn Core Gypsy** slot at 06:00 AM."
  },
  {
    keywords: ["parent", "family", "elderly", "senior", "kids", "children"],
    title: "Family & Senior-Friendly Recommendations",
    reply: "For families or travelers with seniors, **Pench National Park** or **Kanha Tiger Reserve** are the most comfortable choices. The tracks are well-graded, vehicle bumpiness is minimal, and the morning safaris are spaced out with comfortable mid-way rest stops at official center points."
  },
  {
    keywords: ["canter", "gypsy", "vehicle", "difference", "open jeep"],
    title: "Gypsy vs Canter Breakdown",
    reply: "• **Open 4x4 Gypsy (6-Seater)**: Unmatched maneuverability, faster tracking of alarm calls, lower vantage point for eye-level photography, and access to narrow core trails.\n• **Safari Canter (20-Seater)**: Higher elevated viewing platform (great for tall grassland scanning in Dhikala or Ranthambore) and budget-friendly for large groups."
  },
  {
    keywords: ["document", "permit", "id", "aadhaar", "passport", "rules"],
    title: "Mandatory Entry Documentation",
    reply: "Every guest must carry their **original Government Photo ID** (Aadhaar Card, Passport, or Voter ID) entered during booking. Forest gate rangers verify IDs against the digital permit pass before vehicles are flagged off. Discrepancies lead to immediate denial of entry."
  },
  {
    keywords: ["pack", "wear", "dress", "clothes", "what to bring", "camera"],
    title: "Safari Packing & Etiquette Checklist",
    reply: "1. **Colors**: Earth tones only (Olive green, khaki, muted brown, tan). Bright neon colors disturb territorial animals.\n2. **Layers**: Dawn departures (06:00 AM) can be very brisk in winter (8°C to 12°C). Carry a fleece or windbreaker.\n3. **Essentials**: Dust bandana/mask, UV sunglasses, 200mm+ telephoto lens, and refillable water flask."
  },
  {
    keywords: ["corbett", "elephant", "dhikala"],
    title: "Jim Corbett & Elephant Herds",
    reply: "Jim Corbett is world-renowned for its vast Ramganga riverbed and wild Asian elephant matriarch herds. The famous **Dhikala Zone** is open between mid-November and mid-June."
  },
  {
    keywords: ["ranthambore", "fort", "rajasthan", "lake"],
    title: "Ranthambore Royal Heritage",
    reply: "Ranthambore is incomparable for dramatic photography where tigers patrol 1,000-year-old fort ramparts and Padam Talao lake. Zones 1 to 5 are core lake zones with legendary predator history."
  }
];

export function getRangerReply(query) {
  const clean = query.toLowerCase().trim();

  for (const item of RANGER_KNOWLEDGE_BASE) {
    if (item.keywords.some(k => clean.includes(k))) {
      return {
        title: item.title,
        text: item.reply
      };
    }
  }

  return {
    title: "WildTrail Ranger Briefing",
    text: `Thanks for asking! Our official naturalist recommendation is to book morning slots for predator activity and check that your government ID matches your booking pass. Feel free to explore our reserve catalog or ask about specific parks like Tadoba, Pench, Ranthambore, or Corbett.`
  };
}
