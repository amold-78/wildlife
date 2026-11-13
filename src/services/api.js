/**
 * WildTrail Pure Frontend In-Browser API & State Engine
 * 
 * Runs 100% on the client side using localStorage.
 * No backend server or external database required.
 */

import { SAFARIS } from '../data/safaris';
import { DEFAULT_REVIEWS } from '../data/reviews';

const STORAGE_KEYS = {
  USERS: 'wildtrail_users',
  BOOKINGS: 'wildtrail_bookings',
  ACTIVE_USER: 'wildtrail_user',
  TOKEN: 'wildtrail_token',
  REVIEWS_PREFIX: 'wildtrail_reviews_'
};

// Seed initial users if none exist
function getStoredUsers() {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.USERS);
    if (data) return JSON.parse(data);
  } catch (e) {}

  const defaultUsers = [
    {
      id: 1,
      name: 'Chief Ranger Vikram Rao',
      email: 'admin@wildtrail.com',
      phone: '+91 98200 11223',
      role: 'admin',
      id_proof_number: 'NTCA-AUTH-2026'
    },
    {
      id: 2,
      name: 'Sahil Verma',
      email: 'demo@wildtrail.com',
      phone: '+91 98765 43210',
      role: 'user',
      id_proof_number: 'ABCD1234E'
    }
  ];

  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(defaultUsers));
  return defaultUsers;
}

// Seed initial bookings if none exist
function getStoredBookings() {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.BOOKINGS);
    if (data) return JSON.parse(data);
  } catch (e) {}

  const defaultBookings = [
    {
      id: 'WT-2026-88421',
      booking_reference: 'WT-2026-88421',
      bookingRef: 'WT-2026-88421',
      safari_id: 'tadoba-andhari',
      safariId: 'tadoba-andhari',
      safari_name: 'Tadoba Andhari Tiger Reserve',
      safariName: 'Tadoba Andhari Tiger Reserve',
      zone_name: 'Moharli Zone',
      zone: 'Moharli Zone',
      entry_gate: 'Moharli Gate',
      gate: 'Moharli Gate',
      date: '2026-11-15',
      shift_time: '06:00 AM – 09:45 AM',
      slot: {
        title: 'Dawn Core Safari',
        time: '06:00 AM – 09:45 AM',
        type: 'Open 4x4 Gypsy'
      },
      vehicle_type: 'Open 4x4 Gypsy',
      lead_guest: {
        fullName: 'Sahil Verma',
        name: 'Sahil Verma',
        email: 'demo@wildtrail.com',
        phone: '+91 98765 43210',
        idType: 'Government ID',
        idNumber: 'ABCD1234E'
      },
      travelers: [
        { name: 'Sahil Verma', age: 28, idType: 'Government ID', idNumber: 'ABCD1234E' },
        { name: 'Pooja Verma', age: 26, idType: 'Passport', idNumber: 'Z9482103' }
      ],
      guests_count: 2,
      adults: 2,
      children: 0,
      total_amount: 4998,
      totalAmount: 4998,
      status: 'CONFIRMED',
      permitNumber: 'MH-TAD-2026-CORE-0928',
      checked_in: false,
      created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
      itinerary: [
        { time: '05:00 AM', title: 'Report to Moharli Gate', desc: 'Arrive 45 mins prior with physical original photo IDs.' },
        { time: '05:30 AM', title: 'Permit Authorization', desc: 'Permit slip verified by Forest Department staff.' },
        { time: '06:00 AM', title: 'Expedition Commences 🐅', desc: 'Enter Moharli Zone with assigned driver and certified naturalist.' },
        { time: '09:30 AM', title: 'Return to Gate', desc: 'Debrief and sighting log entry.' }
      ]
    }
  ];

  localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(defaultBookings));
  return defaultBookings;
}

// Simulates network delay (fast 30ms) for realistic UX
const delay = (ms = 30) => new Promise(res => setTimeout(res, ms));

export const api = {
  // Authentication & Profile Endpoints
  auth: {
    login: async ({ email, password }) => {
      await delay();
      const users = getStoredUsers();
      const normEmail = (email || '').trim().toLowerCase();
      
      let user = users.find(u => u.email.toLowerCase() === normEmail);

      // If logging in as admin or demo, auto-provide user profile
      if (!user) {
        if (normEmail.includes('admin')) {
          user = users.find(u => u.role === 'admin') || users[0];
        } else {
          user = {
            id: Date.now(),
            name: email.split('@')[0],
            email: normEmail,
            role: 'user',
            phone: '+91 98000 00000',
            id_proof_number: 'ABCD1234E'
          };
          users.push(user);
          localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
        }
      }

      const token = `client-jwt-${user.id}-${Date.now()}`;
      localStorage.setItem(STORAGE_KEYS.TOKEN, token);
      localStorage.setItem(STORAGE_KEYS.ACTIVE_USER, JSON.stringify(user));

      return {
        success: true,
        message: 'Signed in successfully',
        token,
        user
      };
    },

    register: async (userData) => {
      await delay();
      const users = getStoredUsers();
      const normEmail = (userData.email || '').trim().toLowerCase();

      let existing = users.find(u => u.email.toLowerCase() === normEmail);
      if (existing) {
        return {
          success: true,
          token: `client-jwt-${existing.id}-${Date.now()}`,
          user: existing
        };
      }

      const newUser = {
        id: Date.now(),
        name: userData.name || userData.fullName || 'Traveler',
        email: normEmail,
        phone: userData.phone || '+91 98000 00000',
        role: normEmail.includes('admin') ? 'admin' : 'user',
        id_proof_number: userData.id_proof_number || 'GOVT-ID-789'
      };

      users.push(newUser);
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));

      const token = `client-jwt-${newUser.id}-${Date.now()}`;
      localStorage.setItem(STORAGE_KEYS.TOKEN, token);
      localStorage.setItem(STORAGE_KEYS.ACTIVE_USER, JSON.stringify(newUser));

      return {
        success: true,
        message: 'Account created successfully',
        token,
        user: newUser
      };
    },

    getMe: async () => {
      await delay();
      const rawUser = localStorage.getItem(STORAGE_KEYS.ACTIVE_USER);
      if (!rawUser) {
        return { success: false, message: 'No active session' };
      }
      return {
        success: true,
        user: JSON.parse(rawUser)
      };
    },

    updateProfile: async (profileData) => {
      await delay();
      const rawUser = localStorage.getItem(STORAGE_KEYS.ACTIVE_USER);
      const user = rawUser ? JSON.parse(rawUser) : getStoredUsers()[1];

      const updatedUser = {
        ...user,
        name: profileData.name || user.name,
        phone: profileData.phone || user.phone,
        id_proof_number: profileData.idProofNumber || profileData.id_proof_number || user.id_proof_number
      };

      localStorage.setItem(STORAGE_KEYS.ACTIVE_USER, JSON.stringify(updatedUser));

      // Update in stored users array
      const users = getStoredUsers().map(u => u.id === updatedUser.id ? updatedUser : u);
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));

      return {
        success: true,
        message: 'Profile updated successfully',
        user: updatedUser
      };
    }
  },

  // Safaris Catalog Endpoints
  safaris: {
    getAll: async (params = {}) => {
      await delay();
      let results = [...SAFARIS];
      if (params.region && params.region !== 'All') {
        results = results.filter(s => s.region.toLowerCase() === params.region.toLowerCase());
      }
      if (params.search) {
        const q = params.search.toLowerCase();
        results = results.filter(s => s.name.toLowerCase().includes(q) || s.state.toLowerCase().includes(q));
      }
      return {
        success: true,
        count: results.length,
        safaris: results
      };
    },

    getById: async (id) => {
      await delay();
      const safari = SAFARIS.find(s => s.id === id) || SAFARIS[0];
      return {
        success: true,
        safari
      };
    }
  },

  // Bookings & Gate Passes
  bookings: {
    create: async (bookingData) => {
      await delay();
      const bookings = getStoredBookings();
      const safari = SAFARIS.find(s => s.id === bookingData.safariId) || SAFARIS[0];

      const bookingRef = `WT-2026-${Math.floor(10000 + Math.random() * 90000)}`;
      const permitNumber = `${safari.state.substring(0, 2).toUpperCase()}-${safari.id.substring(0, 3).toUpperCase()}-2026-CORE-${Math.floor(1000 + Math.random() * 9000)}`;

      const newBooking = {
        id: bookingRef,
        booking_reference: bookingRef,
        bookingRef: bookingRef,
        safari_id: bookingData.safariId,
        safariId: bookingData.safariId,
        safari_name: safari.name,
        safariName: safari.name,
        zone_name: bookingData.zoneName || bookingData.zone || 'Core Zone',
        zone: bookingData.zoneName || bookingData.zone || 'Core Zone',
        entry_gate: bookingData.entryGate || bookingData.gate || 'Main Gate',
        gate: bookingData.entryGate || bookingData.gate || 'Main Gate',
        date: bookingData.date || new Date().toISOString().split('T')[0],
        shift_time: bookingData.shiftTime || '06:00 AM – 09:45 AM',
        vehicle_type: bookingData.vehicleType || 'Open 4x4 Gypsy',
        lead_guest: bookingData.leadGuest || {
          fullName: 'Traveler',
          email: 'traveler@wildtrail.com',
          phone: '+91 98765 43210',
          idNumber: 'ABCD1234E'
        },
        travelers: bookingData.travelers || [
          { name: bookingData.leadGuest?.fullName || 'Traveler', idType: 'Government ID', idNumber: 'ABCD1234E' }
        ],
        guests_count: bookingData.guestsCount || 2,
        total_amount: bookingData.totalAmount || 4998,
        totalAmount: bookingData.totalAmount || 4998,
        status: 'CONFIRMED',
        permitNumber: permitNumber,
        checked_in: false,
        created_at: new Date().toISOString(),
        itinerary: [
          { time: '05:00 AM', title: `Report to ${bookingData.entryGate || 'Main Gate'}`, desc: 'Arrive 45 mins prior with physical original photo IDs.' },
          { time: '05:30 AM', title: 'Permit Authorization', desc: 'Permit slip verified by Forest Department staff.' },
          { time: '06:00 AM', title: 'Expedition Commences 🐅', desc: `Enter ${bookingData.zoneName || 'Core Zone'} with assigned driver and certified naturalist.` },
          { time: '09:30 AM', title: 'Return to Gate', desc: 'Debrief and sighting log entry.' }
        ]
      };

      bookings.unshift(newBooking);
      localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(bookings));

      return {
        success: true,
        message: 'Gate pass generated successfully',
        booking: newBooking
      };
    },

    getMyBookings: async () => {
      await delay();
      const bookings = getStoredBookings();
      return {
        success: true,
        count: bookings.length,
        bookings
      };
    },

    getByRef: async (ref) => {
      await delay();
      const bookings = getStoredBookings();
      const booking = bookings.find(b => b.booking_reference === ref || b.id === ref || b.bookingRef === ref);
      if (!booking) {
        return { success: false, message: 'Permit reference not found' };
      }
      return { success: true, booking };
    },

    cancel: async (id) => {
      await delay();
      const bookings = getStoredBookings();
      const updated = bookings.map(b => (b.id === id || b.booking_reference === id) ? { ...b, status: 'CANCELLED' } : b);
      localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(updated));
      return {
        success: true,
        message: 'Permit has been cancelled successfully'
      };
    }
  },

  // Traveler Reviews
  reviews: {
    getBySafari: async (safariId) => {
      await delay();
      try {
        const stored = localStorage.getItem(`${STORAGE_KEYS.REVIEWS_PREFIX}${safariId}`);
        if (stored) {
          return { success: true, reviews: JSON.parse(stored) };
        }
      } catch (e) {}

      const initial = DEFAULT_REVIEWS[safariId] || DEFAULT_REVIEWS['tadoba-national-park'] || [];
      return {
        success: true,
        reviews: initial
      };
    },

    create: async (safariId, reviewData) => {
      await delay();
      const key = `${STORAGE_KEYS.REVIEWS_PREFIX}${safariId}`;
      let current = [];
      try {
        const stored = localStorage.getItem(key);
        current = stored ? JSON.parse(stored) : (DEFAULT_REVIEWS[safariId] || []);
      } catch (e) {}

      const newReview = {
        id: `rev-${Date.now()}`,
        author: reviewData.authorName || reviewData.author || 'Verified Traveler',
        rating: reviewData.rating || 5,
        date: 'Just now',
        zone: reviewData.zone || 'Core Zone',
        sightings: reviewData.sightings || ['Tiger'],
        comment: reviewData.comment || '',
        helpfulCount: 0,
        verifiedVisit: true
      };

      const updated = [newReview, ...current];
      localStorage.setItem(key, JSON.stringify(updated));

      return {
        success: true,
        message: 'Review published successfully',
        review: newReview
      };
    },

    voteHelpful: async (id) => {
      await delay();
      return {
        success: true,
        message: 'Thank you for your vote'
      };
    }
  },

  // Admin & Ranger Operations
  admin: {
    getStats: async () => {
      await delay();
      const bookings = getStoredBookings();
      const confirmed = bookings.filter(b => b.status === 'CONFIRMED' || b.status?.includes('Confirmed'));
      const totalRevenue = confirmed.reduce((acc, b) => acc + (b.total_amount || b.totalAmount || 0), 0);
      const verifiedPasses = bookings.filter(b => b.checked_in).length;

      return {
        success: true,
        stats: {
          totalBookings: bookings.length,
          confirmedBookings: confirmed.length,
          totalRevenue: totalRevenue,
          verifiedPasses: verifiedPasses,
          activeReserves: SAFARIS.length,
          todayArrivals: confirmed.length
        }
      };
    },

    getBookings: async (params = {}) => {
      await delay();
      let bookings = getStoredBookings();

      if (params.status && params.status !== 'ALL') {
        bookings = bookings.filter(b => b.status === params.status);
      }
      if (params.search) {
        const q = params.search.toLowerCase();
        bookings = bookings.filter(b =>
          (b.booking_reference || '').toLowerCase().includes(q) ||
          (b.lead_guest?.fullName || '').toLowerCase().includes(q) ||
          (b.safari_name || '').toLowerCase().includes(q)
        );
      }

      return {
        success: true,
        count: bookings.length,
        bookings
      };
    },

    verifyGatePass: async (bookingRef) => {
      await delay();
      const bookings = getStoredBookings();
      const cleanRef = (bookingRef || '').trim().toUpperCase();

      const bookingIndex = bookings.findIndex(b => 
        (b.booking_reference || b.bookingRef || b.id || '').toUpperCase() === cleanRef
      );

      if (bookingIndex === -1) {
        return {
          success: false,
          status: 'INVALID_PERMIT',
          message: `Permit ${bookingRef} not found in official NTCA Registry.`
        };
      }

      const booking = bookings[bookingIndex];

      if (booking.checked_in) {
        return {
          success: true,
          alreadyCheckedIn: true,
          status: 'ALREADY_CHECKED_IN',
          message: `Gate Pass ${booking.booking_reference} was already verified and admitted.`,
          booking
        };
      }

      // Mark as verified & checked in
      booking.checked_in = true;
      booking.checked_in_at = new Date().toISOString();
      bookings[bookingIndex] = booking;
      localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(bookings));

      return {
        success: true,
        alreadyCheckedIn: false,
        status: 'VERIFIED',
        message: `Clearance Granted! ${booking.lead_guest?.fullName || 'Traveler'} admitted at ${booking.entry_gate || 'Moharli Gate'}.`,
        booking
      };
    },

    moderateReview: async (id, action) => {
      await delay();
      return {
        success: true,
        message: `Review ${action} action recorded successfully`
      };
    }
  }
};
