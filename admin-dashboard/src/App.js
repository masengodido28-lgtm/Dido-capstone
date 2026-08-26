import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Header from './components/Header';
import PrivateRoute from './components/PrivateRoute';
import LoginPage from './pages/LoginPage';
import ViewListingsPage from './pages/ViewListingsPage';
import ListingForm from './pages/ListingForm';
import ReservationsPage from './pages/ReservationsPage';
import './App.css';

/**
 * App — root component.
 * Sets up AuthProvider (global auth state) and react-router routes.
 *
 * Routes:
 *  /login            → LoginPage (public)
 *  /listings         → ViewListingsPage (protected)
 *  /create           → ListingForm (create mode, protected)
 *  /edit/:id         → ListingForm (edit mode, protected)
 *  /reservations     → ReservationsPage (protected)
 *  /                 → redirect to /listings
 */
const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Header />
        <main>
          <Routes>
            {/* Public */}
            <Route path="/login" element={<LoginPage />} />

            {/* Protected */}
            <Route
              path="/listings"
              element={<PrivateRoute><ViewListingsPage /></PrivateRoute>}
            />
            <Route
              path="/create"
              element={<PrivateRoute><ListingForm mode="create" /></PrivateRoute>}
            />
            <Route
              path="/edit/:id"
              element={<PrivateRoute><ListingForm mode="edit" /></PrivateRoute>}
            />
            <Route
              path="/reservations"
              element={<PrivateRoute><ReservationsPage /></PrivateRoute>}
            />

            {/* Default redirect */}
            <Route path="/" element={<Navigate to="/listings" replace />} />
            <Route path="*" element={<Navigate to="/listings" replace />} />
          </Routes>
        </main>
      </Router>
    </AuthProvider>
  );
};

export default App;
