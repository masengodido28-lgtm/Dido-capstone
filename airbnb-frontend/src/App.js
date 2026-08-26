import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import TopHeader from './components/TopHeader';
import LoginModal from './components/LoginModal';
import HomePage from './pages/HomePage';
import LocationPage from './pages/LocationPage';
import LocationDetailsPage from './pages/LocationDetailsPage';
import UserReservationsPage from './pages/UserReservationsPage';
import './App.css';

/**
 * App — root component for the Airbnb Frontend Clone.
 *
 * Routes:
 *  /                           → HomePage
 *  /location/:location         → LocationPage (filtered cards)
 *  /location/:location/:id     → LocationDetailsPage (cost calculator)
 *  /reservations               → UserReservationsPage
 */
const App = () => {
  const [showLogin, setShowLogin] = useState(false);

  return (
    <AuthProvider>
      <Router>
        {/* Top Header — sticky, includes filter + profile */}
        <TopHeader onLoginClick={() => setShowLogin(true)} />

        {/* Login Modal — rendered at root level so it overlays everything */}
        {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}

        <main>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/location/:location" element={<LocationPage />} />
            <Route path="/location/:location/:id" element={<LocationDetailsPage />} />
            <Route path="/reservations" element={<UserReservationsPage />} />
            {/* Catch-all → home */}
            <Route path="*" element={<HomePage />} />
          </Routes>
        </main>
      </Router>
    </AuthProvider>
  );
};

export default App;
