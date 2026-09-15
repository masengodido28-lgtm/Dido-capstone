import React from 'react';

import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate
} from 'react-router-dom';

import { AuthProvider } from './context/AuthContext';

import { useAuth } from './context/AuthContext';

import Sidebar from './components/Sidebar';

import PrivateRoute from './components/PrivateRoute';

import LoginPage from './pages/LoginPage';

import ViewListingsPage from './pages/ViewListingsPage';

import ListingForm from './pages/ListingForm';

import ReservationsPage from './pages/ReservationsPage';

import './App.css';

/**
 * AppLayout — renders the sidebar + main content area side by side.
 *
 * The sidebar is shown when a user is logged in.
 * Admin permissions are handled by the backend.
 */
const AppLayout = ({ children }) => {
  const { user } = useAuth();

  return (
    <div
      className={`app-layout ${
        user ? 'app-layout--with-sidebar' : ''
      }`}
    >
      {user && <Sidebar />}

      <main className="app-main">
        {children}
      </main>
    </div>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <AppLayout>
          <Routes>

            {/* ================================
                PUBLIC ROUTES
            ================================= */}

            <Route
              path="/login"
              element={<LoginPage />}
            />

            {/* ================================
                PROTECTED ADMIN ROUTES
            ================================= */}

            <Route
              path="/listings"
              element={
                <PrivateRoute>
                  <ViewListingsPage />
                </PrivateRoute>
              }
            />

            <Route
              path="/create"
              element={
                <PrivateRoute>
                  <ListingForm mode="create" />
                </PrivateRoute>
              }
            />

            <Route
              path="/edit/:id"
              element={
                <PrivateRoute>
                  <ListingForm mode="edit" />
                </PrivateRoute>
              }
            />

            <Route
              path="/reservations"
              element={
                <PrivateRoute>
                  <ReservationsPage />
                </PrivateRoute>
              }
            />

            {/* ================================
                DEFAULT ROUTES
            ================================= */}

            <Route
              path="/"
              element={<Navigate to="/listings" replace />}
            />

            <Route
              path="*"
              element={<Navigate to="/listings" replace />}
            />

          </Routes>
        </AppLayout>
      </Router>
    </AuthProvider>
  );
};

export default App;