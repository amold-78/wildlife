export const SAFARIS = [
  {
    id: "tadoba-andhari",
    name: "Tadoba Andhari Tiger Reserve",
    subtitle: "The Jewel of Vidarbha & Tiger Capital",
    state: "Maharashtra",
    region: "Central India",
    pricePerPerson: 2499,
    rating: 4.9,
    reviewCount: 384,
    duration: "3.5 - 4 Hours",
    bestTime: "October – June (Peak sightings March–May)",
    featured: true,
    highlight: "Highest Tiger Sighting Index",
    heroImage: "https://images.unsplash.com/photo-1549480017-d76466a4b7e8?auto=format&fit=crop&w=1600&q=80",
    images: [
      "https://images.unsplash.com/photo-1549480017-d76466a4b7e8?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1561731216-c3a4d99437d5?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1534188753412-3e26d0d618d6?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1575550959106-5a7defe28b56?auto=format&fit=crop&w=1200&q=80"
    ],
    overview: "Tadoba Andhari is Maharashtra's oldest and largest national park, famously revered as 'The Land of Tigers'. Its deciduous teak forest, bamboo thickets, and perennial waterholes create unmatched visibility and frequent predator encounters even in dense vegetation.",
    zones: [
      { name: "Moharli Zone", entryGate: "Moharli Gate", status: "High Activity", permitsPerShift: 16 },
      { name: "Kolara Zone", entryGate: "Kolara Gate", status: "Prime Core", permitsPerShift: 12 },
      { name: "Navegaon Zone", entryGate: "Navegaon Gate", status: "Scenic Buffer", permitsPerShift: 10 },
      { name: "Khutwanda Zone", entryGate: "Khutwanda Gate", status: "Core Sighting", permitsPerShift: 8 }
    ],
    wildlifeProbabilities: [
      { animal: "Royal Bengal Tiger", probability: "Very High (88%)", level: "high" },
      { animal: "Indian Leopard", probability: "Moderate (55%)", level: "med" },
      { animal: "Sloth Bear", probability: "High (70%)", level: "high" },
      { animal: "Indian Gaur (Bison)", probability: "Very High (95%)", level: "high" },
      { animal: "Marsh Crocodile", probability: "High (75%)", level: "high" },
      { animal: "Dhole (Wild Dog)", probability: "Moderate (42%)", level: "med" }
    ],
    monthlySeason: [
      { month: "Oct", status: "excellent", label: "Lush & Open" },
      { month: "Nov", status: "excellent", label: "Cool & Pleasant" },
      { month: "Dec", status: "excellent", label: "Winter Peak" },
      { month: "Jan", status: "excellent", label: "Crisp Mornings" },
      { month: "Feb", status: "excellent", label: "Active Prey" },
      { month: "Mar", status: "peak", label: "Waterhole Action" },
      { month: "Apr", status: "peak", label: "High Sightings" },
      { month: "May", status: "peak", label: "Unrivaled Sighting" },
      { month: "Jun", status: "limited", label: "Pre-Monsoon" },
      { month: "Jul", status: "closed", label: "Core Closed" },
      { month: "Aug", status: "closed", label: "Monsoon Rest" },
      { month: "Sep", status: "closed", label: "Maintenance" }
    ],
    slots: [
      {
        id: "tadoba-morning",
        title: "Dawn Core Safari",
        time: "06:00 AM – 09:45 AM",
        type: "Open 4x4 Gypsy",
        price: 2499,
        seatsAvailable: 6,
        status: "Filling Fast",
        badge: "Highest Tiger Activity"
      },
      {
        id: "tadoba-evening",
        title: "Golden Hour Safari",
        time: "02:45 PM – 06:15 PM",
        type: "Open 4x4 Gypsy",
        price: 2299,
        seatsAvailable: 11,
        status: "Available",
        badge: "Best Sunset Photography"
      },
      {
        id: "tadoba-canter",
        title: "Buffer Eco-Canter",
        time: "06:15 AM – 10:00 AM",
        type: "20-Seater Open Canter",
        price: 1399,
        seatsAvailable: 18,
        status: "Good Availability",
        badge: "Budget Friendly"
      }
    ],
    amenities: [
      "Govt Certified Forest Naturalist",
      "Open 4x4 Gypsy with shock mounts",
      "Official Forest Department Permit Included",
      "Chilled Mineral Water & Emergency Medical Kit",
      "Binoculars on request"
    ],
    rules: [
      "Valid Government Photo ID (Aadhaar / Passport) is strictly mandatory at the gate",
      "Core zones prohibit plastic wrappers and single-use plastic bottles",
      "Wear camouflage tones: Olive green, beige, or earth browns"
    ]
  },
  {
    id: "pench-national-park",
    name: "Pench National Park",
    subtitle: "The Legendary Forest of Kipling's Jungle Book",
    state: "Madhya Pradesh",
    region: "Central India",
    pricePerPerson: 2199,
    rating: 4.8,
    reviewCount: 296,
    duration: "3.5 Hours",
    bestTime: "October – June",
    featured: true,
    highlight: "Rich Biodiversity & Birding",
    heroImage: "https://images.unsplash.com/photo-1561731216-c3a4d99437d5?auto=format&fit=crop&w=1600&q=80",
    images: [
      "https://images.unsplash.com/photo-1561731216-c3a4d99437d5?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1474511320723-9a56873867b5?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1534188753412-3e26d0d618d6?auto=format&fit=crop&w=1200&q=80"
    ],
    overview: "Nestled along the southern slopes of the Satpura Range, Pench is the immortalized setting of Rudyard Kipling's Mowgli. With meandering teak canopies, grassy meadows, and the glistening Pench River, this reserve boasts thriving tiger and leopard families.",
    zones: [
      { name: "Touria Gate", entryGate: "Touria Core", status: "Top Tiger Zone", permitsPerShift: 18 },
      { name: "Karmajhiri Gate", entryGate: "Karmajhiri", status: "Scenic & Serene", permitsPerShift: 10 },
      { name: "Jamtara Gate", entryGate: "Jamtara", status: "Low Congestion", permitsPerShift: 8 }
    ],
    wildlifeProbabilities: [
      { animal: "Royal Bengal Tiger", probability: "High (74%)", level: "high" },
      { animal: "Indian Leopard", probability: "High (65%)", level: "high" },
      { animal: "Indian Wild Dog (Dhole)", probability: "High (68%)", level: "high" },
      { animal: "Spotted Deer (Chital)", probability: "Abundant (98%)", level: "high" },
      { animal: "Malabar Pied Hornbill", probability: "Very High (82%)", level: "high" }
    ],
    monthlySeason: [
      { month: "Oct", status: "excellent", label: "Open & Green" },
      { month: "Nov", status: "excellent", label: "Great Light" },
      { month: "Dec", status: "excellent", label: "Mist & Drama" },
      { month: "Jan", status: "excellent", label: "Winter Chill" },
      { month: "Feb", status: "excellent", label: "Flourishing Fauna" },
      { month: "Mar", status: "peak", label: "Warm Mornings" },
      { month: "Apr", status: "peak", label: "Riverbed Sighting" },
      { month: "May", status: "peak", label: "Peak Heat Sighting" },
      { month: "Jun", status: "limited", label: "Pre-Monsoon" },
      { month: "Jul", status: "closed", label: "Monsoon Rest" },
      { month: "Aug", status: "closed", label: "Closed" },
      { month: "Sep", status: "closed", label: "Closed" }
    ],
    slots: [
      {
        id: "pench-morning",
        title: "Kipling Dawn Safari",
        time: "06:00 AM – 09:30 AM",
        type: "Open 4x4 Gypsy",
        price: 2199,
        seatsAvailable: 4,
        status: "Few Left",
        badge: "Prime Touria Gate"
      },
      {
        id: "pench-evening",
        title: "Pench River Evening Trail",
        time: "03:00 PM – 06:15 PM",
        type: "Open 4x4 Gypsy",
        price: 1999,
        seatsAvailable: 9,
        status: "Available",
        badge: "Riverbed Wildlife"
      }
    ],
    amenities: [
      "Naturalist storytelling Kipling tales",
      "Forest Department registered Gypsy",
      "Water bottles & dust bandanas",
      "Binoculars on hire"
    ],
    rules: [
      "No drone or mobile flash usage permitted",
      "Stay seated inside vehicle during predator tracks"
    ]
  },
  {
    id: "ranthambore",
    name: "Ranthambore Tiger Reserve",
    subtitle: "Historic Fort Ruins & Regal Predator Encounters",
    state: "Rajasthan",
    region: "North-West India",
    pricePerPerson: 2799,
    rating: 4.9,
    reviewCount: 512,
    duration: "3.5 Hours",
    bestTime: "October – June",
    featured: true,
    highlight: "Iconic Heritage Backdrop",
    heroImage: "https://images.unsplash.com/photo-1534188753412-3e26d0d618d6?auto=format&fit=crop&w=1600&q=80",
    images: [
      "https://images.unsplash.com/photo-1534188753412-3e26d0d618d6?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1549480017-d76466a4b7e8?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1575550959106-5a7defe28b56?auto=format&fit=crop&w=1200&q=80"
    ],
    overview: "Where medieval ruins merge with untamed wilderness. Ranthambore is legendary for tigresses stalking through thousand-year-old fort battlements and ancient banyan trees. Photographers travel globally for its dramatic lakes and diurnal predators.",
    zones: [
      { name: "Zone 1 to 5 (Core)", entryGate: "Main Ranthambore Gate", status: "Prime Lake & Fort", permitsPerShift: 20 },
      { name: "Zone 6 to 10 (Buffer)", entryGate: "Kalyanpura / Balas", status: "Rugged Hills", permitsPerShift: 16 }
    ],
    wildlifeProbabilities: [
      { animal: "Royal Bengal Tiger", probability: "Very High (82%)", level: "high" },
      { animal: "Indian Leopard", probability: "Moderate (48%)", level: "med" },
      { animal: "Marsh Crocodile", probability: "Very High (90%)", level: "high" },
      { animal: "Sambar Deer", probability: "Abundant (95%)", level: "high" },
      { animal: "Sloth Bear", probability: "Moderate (35%)", level: "med" }
    ],
    monthlySeason: [
      { month: "Oct", status: "excellent", label: "Gates Reopen" },
      { month: "Nov", status: "excellent", label: "Golden Sun" },
      { month: "Dec", status: "excellent", label: "Heritage Mist" },
      { month: "Jan", status: "excellent", label: "Cold Basking" },
      { month: "Feb", status: "excellent", label: "Superb Weather" },
      { month: "Mar", status: "peak", label: "Lake Patrols" },
      { month: "Apr", status: "peak", label: "High Sightings" },
      { month: "May", status: "peak", label: "Intense Predator Sightings" },
      { month: "Jun", status: "limited", label: "Pre-Monsoon" },
      { month: "Jul", status: "closed", label: "Monsoon Closed" },
      { month: "Aug", status: "closed", label: "Monsoon Closed" },
      { month: "Sep", status: "closed", label: "Monsoon Closed" }
    ],
    slots: [
      {
        id: "ranth-morning-core",
        title: "Heritage Lake Zone Gypsy",
        time: "06:30 AM – 10:00 AM",
        type: "Open 6-Seater Gypsy",
        price: 2799,
        seatsAvailable: 2,
        status: "Almost Full",
        badge: "Zones 1–5 Direct"
      },
      {
        id: "ranth-evening-core",
        title: "Fort Ramparts Sunset Gypsy",
        time: "02:30 PM – 06:00 PM",
        type: "Open 6-Seater Gypsy",
        price: 2799,
        seatsAvailable: 7,
        status: "Available",
        badge: "Optimal Lighting"
      },
      {
        id: "ranth-canter",
        title: "Ranthambore Canter Safari",
        time: "06:30 AM – 10:00 AM",
        type: "20-Seater Open Canter",
        price: 1499,
        seatsAvailable: 15,
        status: "Available",
        badge: "Great Group Value"
      }
    ],
    amenities: [
      "Expert local guide with 10+ yrs tracking experience",
      "Forest dept zone token confirmation",
      "Refillable safe drinking water",
      "Camera lens rain/dust guard sleeves"
    ],
    rules: [
      "Strict zone enforcement by Rajasthan Forest Department",
      "No disembarking from vehicle under any circumstance"
    ]
  },
  {
    id: "jim-corbett",
    name: "Jim Corbett National Park",
    subtitle: "India's First National Park in Himalayan Foothills",
    state: "Uttarakhand",
    region: "North India",
    pricePerPerson: 2299,
    rating: 4.8,
    reviewCount: 440,
    duration: "4 Hours",
    bestTime: "November – June (Dhikala opens Nov 15)",
    featured: true,
    highlight: "Wild Asian Elephants & Ramganga River",
    heroImage: "https://images.unsplash.com/photo-1557050543-4d5f4e07ef46?auto=format&fit=crop&w=1600&q=80",
    images: [
      "https://images.unsplash.com/photo-1557050543-4d5f4e07ef46?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1549480017-d76466a4b7e8?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1534188753412-3e26d0d618d6?auto=format&fit=crop&w=1200&q=80"
    ],
    overview: "Set in the Shivalik and Himalayan foothills, Corbett spans dense Sal forests, wide grasslands (chaurs), and the Ramganga river valley. Known for herds of wild Asian Elephants alongside Bengal Tigers.",
    zones: [
      { name: "Dhikala Zone", entryGate: "Dhangarhi Gate", status: "Crown Jewel Grasslands", permitsPerShift: 15 },
      { name: "Bijrani Zone", entryGate: "Amdanda Gate", status: "Prime Tiger Territory", permitsPerShift: 12 },
      { name: "Jhirna Zone", entryGate: "Jhirna Gate", status: "Open Year Round", permitsPerShift: 10 }
    ],
    wildlifeProbabilities: [
      { animal: "Asian Elephant Herds", probability: "Abundant (92%)", level: "high" },
      { animal: "Royal Bengal Tiger", probability: "High (65%)", level: "high" },
      { animal: "Gharial (Fish-eating Croc)", probability: "High (75%)", level: "high" },
      { animal: "Himalayan Black Bear", probability: "Rare (15%)", level: "low" },
      { animal: "King Cobra", probability: "Moderate (28%)", level: "med" }
    ],
    monthlySeason: [
      { month: "Oct", status: "limited", label: "Select Zones Only" },
      { month: "Nov", status: "peak", label: "Dhikala Opens" },
      { month: "Dec", status: "excellent", label: "Winter Mist" },
      { month: "Jan", status: "excellent", label: "Chilly Foothills" },
      { month: "Feb", status: "excellent", label: "Elephant Herds" },
      { month: "Mar", status: "excellent", label: "Vibrant Chaurs" },
      { month: "Apr", status: "peak", label: "Predator Sightings" },
      { month: "May", status: "peak", label: "Ramganga Basking" },
      { month: "Jun", status: "limited", label: "Closing Soon" },
      { month: "Jul", status: "closed", label: "Monsoon Closed" },
      { month: "Aug", status: "closed", label: "Monsoon Closed" },
      { month: "Sep", status: "closed", label: "Monsoon Closed" }
    ],
    slots: [
      {
        id: "corbett-dhikala-canter",
        title: "Dhikala Wilderness Canter",
        time: "06:00 AM – 11:00 AM",
        type: "Grassland Safari Canter",
        price: 2299,
        seatsAvailable: 8,
        status: "Available",
        badge: "Iconic Dhikala Chaur"
      },
      {
        id: "corbett-bijrani-gypsy",
        title: "Bijrani Core Gypsy Trail",
        time: "06:30 AM – 10:00 AM",
        type: "4x4 Gypsy",
        price: 2599,
        seatsAvailable: 3,
        status: "Few Left",
        badge: "Tiger Tracking Favorite"
      }
    ],
    amenities: [
      "Naturalist trained in Corbett river ecology",
      "Full Ramganga panoramic route",
      "Permits authenticated at Dhangarhi Gate",
      "Birding field guide booklet"
    ],
    rules: [
      "Advance biometric identity verification mandatory",
      "Smoking, alcohol, and music are criminal offenses in core forest"
    ]
  },
  {
    id: "kanha-tiger-reserve",
    name: "Kanha Tiger Reserve",
    subtitle: "Endless Meadows, Sal Woods & Barasingha Haven",
    state: "Madhya Pradesh",
    region: "Central India",
    pricePerPerson: 2399,
    rating: 4.9,
    reviewCount: 360,
    duration: "4 Hours",
    bestTime: "October – June",
    featured: false,
    highlight: "Home of the Hardground Barasingha",
    heroImage: "https://images.unsplash.com/photo-1575550959106-5a7defe28b56?auto=format&fit=crop&w=1600&q=80",
    images: [
      "https://images.unsplash.com/photo-1575550959106-5a7defe28b56?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1549480017-d76466a4b7e8?auto=format&fit=crop&w=1200&q=80"
    ],
    overview: "Kanha is celebrated worldwide as one of the best managed wildlife reserves on earth. The dramatic rolling grassland meadows surrounded by pure Sal forests host the endangered hard-ground Swamp Deer (Barasingha) and healthy, confident tigers.",
    zones: [
      { name: "Kanha Zone", entryGate: "Khatia Gate", status: "Historic Core", permitsPerShift: 14 },
      { name: "Kisli Zone", entryGate: "Khatia Gate", status: "Dense Sal Woods", permitsPerShift: 10 },
      { name: "Mukki Zone", entryGate: "Mukki Gate", status: "Meadow Panoramic", permitsPerShift: 12 }
    ],
    wildlifeProbabilities: [
      { animal: "Royal Bengal Tiger", probability: "High (78%)", level: "high" },
      { animal: "Hard-ground Barasingha", probability: "Abundant (96%)", level: "high" },
      { animal: "Indian Gaur (Bison)", probability: "Very High (90%)", level: "high" },
      { animal: "Indian Leopard", probability: "Moderate (52%)", level: "med" },
      { animal: "Dhole Pack", probability: "High (62%)", level: "high" }
    ],
    monthlySeason: [
      { month: "Oct", status: "excellent", label: "Vibrant Greens" },
      { month: "Nov", status: "excellent", label: "Crisp Air" },
      { month: "Dec", status: "excellent", label: "Frost on Meadows" },
      { month: "Jan", status: "excellent", label: "Winter Sun" },
      { month: "Feb", status: "excellent", label: "Barasingha Rut" },
      { month: "Mar", status: "peak", label: "Mahua Bloom" },
      { month: "Apr", status: "peak", label: "High Sightings" },
      { month: "May", status: "peak", label: "Active Waterholes" },
      { month: "Jun", status: "limited", label: "Early Showers" },
      { month: "Jul", status: "closed", label: "Monsoon Closed" },
      { month: "Aug", status: "closed", label: "Monsoon Closed" },
      { month: "Sep", status: "closed", label: "Monsoon Closed" }
    ],
    slots: [
      {
        id: "kanha-morning-mukki",
        title: "Mukki Meadow Morning Drive",
        time: "06:00 AM – 10:00 AM",
        type: "4x4 Gypsy",
        price: 2399,
        seatsAvailable: 5,
        status: "Available",
        badge: "Barasingha & Tiger Prime"
      },
      {
        id: "kanha-evening-kisli",
        title: "Kisli Sal Canopy Evening",
        time: "03:00 PM – 06:15 PM",
        type: "4x4 Gypsy",
        price: 2199,
        seatsAvailable: 9,
        status: "Available",
        badge: "Atmospheric Woods"
      }
    ],
    amenities: [
      "Tribal Baiga / Gond trained guide",
      "Certified 4x4 forest vehicle",
      "Breakfast pack permitted at center point"
    ],
    rules: [
      "Remain with your vehicle at all stops except designated center points",
      "Maintain quiet decorum in meadow territories"
    ]
  },
  {
    id: "kaziranga-national-park",
    name: "Kaziranga National Park",
    subtitle: "UNESCO World Heritage · Kingdom of the Rhino",
    state: "Assam",
    region: "North-East India",
    pricePerPerson: 2699,
    rating: 4.9,
    reviewCount: 310,
    duration: "3.5 Hours",
    bestTime: "November – April",
    featured: false,
    highlight: "World's Largest Rhino Sanctuary",
    heroImage: "https://images.unsplash.com/photo-1575550959106-5a7defe28b56?auto=format&fit=crop&w=1600&q=80",
    images: [
      "https://images.unsplash.com/photo-1575550959106-5a7defe28b56?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1557050543-4d5f4e07ef46?auto=format&fit=crop&w=1200&q=80"
    ],
    overview: "Set on the fertile floodplains of the Brahmaputra River in Assam, Kaziranga is home to two-thirds of the world's Great One-horned Rhinoceroses, along with massive herds of wild water buffalo, Asian elephants, and the highest density of tigers in protected areas.",
    zones: [
      { name: "Kohora (Central) Range", entryGate: "Kohora Gate", status: "Prime Rhino Sighting", permitsPerShift: 16 },
      { name: "Bagori (Western) Range", entryGate: "Bagori Gate", status: "Best Waterbody Views", permitsPerShift: 14 },
      { name: "Agoratoli (Eastern) Range", entryGate: "Agoratoli Gate", status: "Birding Paradise", permitsPerShift: 10 }
    ],
    wildlifeProbabilities: [
      { animal: "Great One-horned Rhino", probability: "Guaranteed (99%)", level: "high" },
      { animal: "Wild Water Buffalo", probability: "Abundant (94%)", level: "high" },
      { animal: "Asian Elephant", probability: "Very High (88%)", level: "high" },
      { animal: "Royal Bengal Tiger", probability: "Moderate (42%)", level: "med" },
      { animal: "Eastern Swamp Deer", probability: "High (80%)", level: "high" }
    ],
    monthlySeason: [
      { month: "Oct", status: "limited", label: "Partial Access" },
      { month: "Nov", status: "peak", label: "Full Open" },
      { month: "Dec", status: "peak", label: "Migratory Birds" },
      { month: "Jan", status: "peak", label: "Clear Morning Light" },
      { month: "Feb", status: "peak", label: "Grass Burning" },
      { month: "Mar", status: "peak", label: "Optimal Sighting" },
      { month: "Apr", status: "limited", label: "Pre-Monsoon" },
      { month: "May", status: "closed", label: "Flood Warning" },
      { month: "Jun", status: "closed", label: "Monsoon Flood" },
      { month: "Jul", status: "closed", label: "Park Inundated" },
      { month: "Aug", status: "closed", label: "Park Inundated" },
      { month: "Sep", status: "closed", label: "Flood Recovery" }
    ],
    slots: [
      {
        id: "kaziranga-central-jeep",
        title: "Kohora Central Rhino Jeep",
        time: "07:30 AM – 11:00 AM",
        type: "Open 4x4 Jeep",
        price: 2699,
        seatsAvailable: 6,
        status: "Available",
        badge: "Rhino Capital Drive"
      },
      {
        id: "kaziranga-western-jeep",
        title: "Bagori Range Wetland Safari",
        time: "02:00 PM – 05:00 PM",
        type: "Open 4x4 Jeep",
        price: 2499,
        seatsAvailable: 8,
        status: "Available",
        badge: "Elephants & Buffalo"
      }
    ],
    amenities: [
      "Forest Department approved pilot & naturalist",
      "Floodplain wetland binoculars kit",
      "Permits confirmed for foreign/domestic travelers"
    ],
    rules: [
      "Strict speed control (20 km/h) inside all ranges",
      "Binoculars recommended for safety buffer distance"
    ]
  }
];
