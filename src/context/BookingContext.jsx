import React, { createContext, useContext, useState, useEffect } from 'react';
import { SAFARIS } from '../data/safaris';
import { api } from '../services/api';

const BookingContext = createContext();

const INITIAL_BOOKINGS = [
  {
    id: "WT-82931",
    safariId: "tadoba-andhari",
    safariName: "Tadoba Andhari Tiger Reserve",
    zone: "Moharli Zone (Core)",
    gate: "Moharli Gate",
    date: "2026-10-18",
    slot: {
      title: "Dawn Core Safari",
      time: "06:00 AM – 09:45 AM",
      type: "Open 4x4 Gypsy"
    },
    travelers: [
      { name: "Sahil Verma", age: 28, idType: "Aadhaar Card", idNumber: "XXXX-XXXX-4912" },
      { name: "Pooja Verma", age: 26, idType: "Passport", idNumber: "Z9482103" }
    ],
    adults: 2,
    children: 0,
    baseFare: 4998,
    taxes: 450,
    totalAmount: 5448,
    status: "Confirmed & Gate Permit Issued",
    permitNumber: "MH-TAD-2026-CORE-0928",
    bookedOn: "2026-10-05T18:30:00.000Z",
    itinerary: [
      { time: "05:00 AM", title: "Arrive at Moharli Gate", desc: "Report at entry security with original Government Photo IDs." },
      { time: "05:30 AM", title: "Biometric & Permit Verification", desc: "Forest Ranger verifies digital permit and assigns certified naturalist." },
      { time: "06:00 AM", title: "Dawn Core Safari Begins 🐅", desc: "4x4 Gypsy enters Moharli Core lake tracks for morning predator patrol." },
      { time: "08:15 AM", title: "Mid-trail Naturalist Briefing", desc: "Short pause at Telia Lake watch point for birding and waterhole observation." },
      { time: "09:45 AM", title: "Safari Concludes & Debrief", desc: "Return to gate, log wildlife sightings in official register." }
    ]
  }
];

export function BookingProvider({ children }) {
  // Load from localStorage or defaults
  const [bookings, setBookings] = useState(() => {
    try {
      const saved = localStorage.getItem('wildtrail_bookings');
      return saved ? JSON.parse(saved) : INITIAL_BOOKINGS;
    } catch {
      return INITIAL_BOOKINGS;
    }
  });

  const [wishlist, setWishlist] = useState(() => {
    try {
      const saved = localStorage.getItem('wildtrail_wishlist');
      return saved ? JSON.parse(saved) : ["tadoba-andhari", "ranthambore"];
    } catch {
      return ["tadoba-andhari", "ranthambore"];
    }
  });

  const [showSavedOnly, setShowSavedOnly] = useState(false);

  const [searchFilters, setSearchFilters] = useState({
    query: "",
    region: "All",
    wildlife: "All",
    maxPrice: 3500,
    duration: "All"
  });

  const [toast, setToast] = useState(null);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // Dark Mode State with HTML root synchronization
  const [darkMode, setDarkMode] = useState(() => {
    try {
      const saved = localStorage.getItem('wildtrail_darkmode');
      return saved !== null ? JSON.parse(saved) : false;
    } catch {
      return false;
    }
  });

  useEffect(() => {
    localStorage.setItem('wildtrail_darkmode', JSON.stringify(darkMode));
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode(prev => {
      const next = !prev;
      showToast(next ? "Night Safari Mode enabled 🌙" : "Daylight Mode restored ☀️", "info");
      return next;
    });
  };


  const toggleWishlist = (safariId) => {
    setWishlist(prev => {
      const exists = prev.includes(safariId);
      const updated = exists ? prev.filter(id => id !== safariId) : [...prev, safariId];
      showToast(exists ? "Removed from saved safaris" : "Saved to your safari wishlist ❤️", "info");
      return updated;
    });
  };

  const addBooking = (bookingData) => {
    const bookingId = `WT-2026-${Math.floor(10000 + Math.random() * 90000)}`;
    const safari = SAFARIS.find(s => s.id === bookingData.safariId) || SAFARIS[0];

    const newBooking = {
      ...bookingData,
      id: bookingId,
      bookingRef: bookingId,
      status: "Confirmed & Gate Permit Issued",
      permitNumber: `${safari.state.substring(0, 2).toUpperCase()}-${safari.id.substring(0, 3).toUpperCase()}-2026-CORE-${Math.floor(1000 + Math.random() * 9000)}`,
      bookedOn: new Date().toISOString(),
      itinerary: [
        { time: "05:00 AM", title: `Report to ${bookingData.gate || 'Main Gate'}`, desc: "Arrive 45 mins prior with physical original photo IDs." },
        { time: "05:30 AM", title: "Permit Authorization", desc: "Permit slip verified by Forest Department staff." },
        { time: "06:00 AM", title: "Expedition Commences 🐅", desc: `Enter ${bookingData.zone || 'Core Zone'} with assigned driver and certified naturalist.` },
        { time: "09:30 AM", title: "Return to Gate", desc: "Debrief and sighting log entry." }
      ]
    };

    setBookings(prev => {
      const updated = [newBooking, ...prev];
      try {
        localStorage.setItem('wildtrail_bookings', JSON.stringify(updated));
      } catch {}
      return updated;
    });

    // Asynchronously sync with SQLite backend API
    api.bookings.create({
      safariId: bookingData.safariId,
      date: bookingData.date,
      slotId: bookingData.slot?.id || 'standard-slot',
      slotTitle: bookingData.slot?.title || 'Standard Slot',
      shiftTime: bookingData.slot?.time || '06:00 AM – 09:30 AM',
      vehicleType: bookingData.slot?.type || 'Open 4x4 Gypsy',
      zoneName: bookingData.zone,
      entryGate: bookingData.gate,
      guestsCount: (bookingData.adults || 1) + (bookingData.children || 0),
      leadGuest: {
        fullName: bookingData.travelers?.[0]?.name || 'Sahil Verma',
        email: 'demo@wildtrail.com',
        phone: '+91 98765 43210',
        idType: bookingData.travelers?.[0]?.idType || 'Aadhaar Card',
        idNumber: bookingData.travelers?.[0]?.idNumber || 'ABCD1234E'
      },
      accompanyingGuests: bookingData.travelers?.slice(1) || [],
      totalAmount: bookingData.totalAmount || 4998
    }).catch(err => console.warn('[Booking Sync] Backend sync notice:', err.message));

    showToast(`Booking ${bookingId} confirmed! Gate voucher issued.`, "success");
    return newBooking;
  };

  const cancelBooking = (bookingId) => {
    setBookings(prev => {
      const updated = prev.filter(b => b.id !== bookingId);
      try {
        localStorage.setItem('wildtrail_bookings', JSON.stringify(updated));
      } catch {}
      return updated;
    });
    showToast(`Booking ${bookingId} has been cancelled.`, "info");
  };

  return (
    <BookingContext.Provider
      value={{
        bookings,
        wishlist,
        toggleWishlist,
        addBooking,
        cancelBooking,
        searchFilters,
        setSearchFilters,
        toast,
        showToast,
        darkMode,
        toggleDarkMode,
        showSavedOnly,
        setShowSavedOnly
      }}
    >
      {children}
    </BookingContext.Provider>
  );
}

export function useBooking() {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error("useBooking must be used within a BookingProvider");
  }
  return context;
}
