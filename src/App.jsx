import React, { useState } from 'react';
import { BookingProvider } from './context/BookingContext';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import Toast from './components/common/Toast';
import AuthModal from './components/auth/AuthModal';
import AskRangerModal from './components/ranger-ai/AskRangerModal';

import HomePage from './pages/HomePage';
import ExplorePage from './pages/ExplorePage';
import SafariFinderPage from './pages/SafariFinderPage';
import SafariDetailPage from './pages/SafariDetailPage';
import BookingFlowPage from './pages/BookingFlowPage';
import MySafariPage from './pages/MySafariPage';
import WildlifePage from './pages/WildlifePage';
import UserProfilePage from './pages/UserProfilePage';
import AdminDashboardPage from './pages/AdminDashboardPage';

export default function App() {
  const [activePage, setActivePage] = useState('home');
  const [selectedSafariId, setSelectedSafariId] = useState('tadoba-andhari');
  const [bookingSlot, setBookingSlot] = useState(null);

  const navigateTo = (pageId) => {
    setActivePage(pageId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectSafari = (id) => {
    setSelectedSafariId(id);
    setActivePage('safari-details');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStartBooking = (safariId, slot) => {
    setSelectedSafariId(safariId);
    setBookingSlot(slot);
    setActivePage('booking');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBookingCompleted = (bookingId) => {
    setActivePage('profile'); // Send directly to profile gate pass page on complete!
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <AuthProvider>
      <BookingProvider>
        <div className="min-h-screen flex flex-col bg-[#F8F7F2] dark:bg-[#071713] text-[#202724] dark:text-[#E2ECE6] transition-colors">
          
          {/* Navigation Bar */}
          <Navbar
            activePage={activePage}
            setActivePage={navigateTo}
            onSelectSafari={handleSelectSafari}
          />

          {/* Dynamic Page Router */}
          <main className="flex-1">
            {activePage === 'home' && (
              <HomePage
                onSelectSafari={handleSelectSafari}
                onNavigate={navigateTo}
              />
            )}

            {activePage === 'explore' && (
              <ExplorePage
                onSelectSafari={handleSelectSafari}
                onNavigate={navigateTo}
              />
            )}

            {activePage === 'finder' && (
              <SafariFinderPage
                onSelectSafari={handleSelectSafari}
                onNavigate={navigateTo}
              />
            )}

            {activePage === 'safari-details' && (
              <SafariDetailPage
                safariId={selectedSafariId}
                onBookSlot={handleStartBooking}
                onBack={() => navigateTo('explore')}
              />
            )}

            {activePage === 'booking' && (
              <BookingFlowPage
                safariId={selectedSafariId}
                initialSlot={bookingSlot}
                onBookingCompleted={handleBookingCompleted}
                onCancel={() => setActivePage('safari-details')}
              />
            )}

            {activePage === 'my-safari' && (
              <MySafariPage
                onExploreMore={() => navigateTo('explore')}
                onSelectSafari={handleSelectSafari}
              />
            )}

            {activePage === 'profile' && (
              <UserProfilePage
                onNavigate={navigateTo}
                onSelectSafari={handleSelectSafari}
              />
            )}

            {activePage === 'admin' && (
              <AdminDashboardPage
                onNavigate={navigateTo}
              />
            )}

            {activePage === 'wildlife' && (
              <WildlifePage
                onSelectSafari={handleSelectSafari}
                onNavigate={navigateTo}
              />
            )}
          </main>

          {/* Global Footer */}
          <Footer onNavigate={navigateTo} />

          {/* Global Floating Ranger AI Naturalist Drawer */}
          <AskRangerModal
            onSelectSafari={handleSelectSafari}
            onNavigate={navigateTo}
          />

          {/* Global Authentication Modal */}
          <AuthModal />

          {/* Action Toasts */}
          <Toast />

        </div>
      </BookingProvider>
    </AuthProvider>
  );
}
