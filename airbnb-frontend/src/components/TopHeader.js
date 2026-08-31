import React, { useState } from 'react';

import { useNavigate, useLocation } from 'react-router-dom';

import { useAuth } from '../context/AuthContext';

import { FaSearch, FaUserCircle, FaBars } from 'react-icons/fa';

import { locations } from '../data/accommodations';

import './TopHeader.css';

/**
 * TopHeader — sticky top navigation bar for the Airbnb frontend.
 *
 * Contains:
 * - Airbnb logo
 * - Location filter/search
 * - Profile section
 * - Login / Signup dropdown when logged out
 * - Reservations / Logout dropdown when logged in
 */

const TopHeader = ({ onLoginClick, onSignupClick }) => {
  const { user, logout } = useAuth();

  const navigate = useNavigate();
  const location = useLocation();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [filterValue, setFilterValue] = useState('');

  // ===============================
  // LOCATION FILTER
  // ===============================

  const handleFilterSubmit = (e) => {
    e.preventDefault();

    if (filterValue.trim()) {
      navigate(
        `/location/${encodeURIComponent(filterValue.trim())}`
      );

      setFilterValue('');
    }
  };

  const handleLocationSelect = (loc) => {
    navigate(
      `/location/${encodeURIComponent(loc)}`
    );

    setFilterValue('');
  };

  // ===============================
  // LOGOUT
  // ===============================

  const handleLogout = () => {
    logout();

    setDropdownOpen(false);

    navigate('/');
  };

  // ===============================
  // HEADER STATE
  // ===============================

  const isHome = location.pathname === '/';

  return (
    <header
      className={`top-header ${
        isHome ? 'top-header--home' : ''
      }`}
    >

      <div className="top-header__inner">

        {/* ===============================
            LOGO
        =============================== */}

        <button
          className="top-header__logo"
          onClick={() => navigate('/')}
          aria-label="Go to home"
        >
          <svg
            viewBox="0 0 32 32"
            className="top-header__logo-svg"
            aria-hidden="true"
          >
            <path
              d="M16 1C7.716 1 1 7.716 1 16s6.716 15 15 15 15-6.716 15-15S24.284 1 16 1zm-.002 4.65c.9 0 1.63.73 1.63 1.63S16.898 8.91 16 8.91s-1.63-.73-1.63-1.63.73-1.63 1.628-1.63zM22 22.25H10a.75.75 0 010-1.5h1.5v-5H11a.75.75 0 010-1.5h4a.75.75 0 010 1.5h-.5v5h2v-6.25H16a.75.75 0 010-1.5h4a.75.75 0 010 1.5h-.5V20.75H21a.75.75 0 010 1.5z"
              fill="#FF385C"
            />
          </svg>

          <span className="top-header__logo-text">
            airbnb
          </span>
        </button>


        {/* ===============================
            LOCATION SEARCH
        =============================== */}

        <form
          className="top-header__search"
          onSubmit={handleFilterSubmit}
          role="search"
        >
          <div className="top-header__search-inner">

            <select
              className="top-header__search-select"
              value={filterValue}
              onChange={(e) => {
                setFilterValue(e.target.value);

                if (e.target.value) {
                  handleLocationSelect(e.target.value);
                }
              }}
              aria-label="Filter by location"
            >

              <option value="">
                Anywhere
              </option>

              {locations.map((loc) => (
                <option
                  key={loc}
                  value={loc}
                >
                  {loc}
                </option>
              ))}

            </select>

            <button
              type="submit"
              className="top-header__search-btn"
              aria-label="Search"
            >
              <FaSearch size={14} />
            </button>

          </div>
        </form>


        {/* ===============================
            PROFILE SECTION
        =============================== */}

        <div className="top-header__profile">

          {user ? (

            /* ===============================
               LOGGED-IN USER
            =============================== */

            <div className="top-header__user-menu">

              <button
                className="top-header__user-btn"
                onClick={() =>
                  setDropdownOpen((p) => !p)
                }
                aria-haspopup="true"
                aria-expanded={dropdownOpen}
              >
                <FaBars size={14} />

                <FaUserCircle
                  size={28}
                  color="#717171"
                />
              </button>


              {dropdownOpen && (

                <div
                  className="top-header__dropdown"
                  role="menu"
                >

                  <span className="top-header__dropdown-greeting">
                    Hi, {user.username}
                  </span>


                  <button
                    className="top-header__dropdown-item"
                    role="menuitem"
                    onClick={() => {
                      navigate('/reservations');
                      setDropdownOpen(false);
                    }}
                  >
                    My Reservations
                  </button>


                  <hr className="top-header__dropdown-divider" />


                  <button
                    className="top-header__dropdown-item top-header__dropdown-item--logout"
                    role="menuitem"
                    onClick={handleLogout}
                  >
                    Log Out
                  </button>

                </div>

              )}

            </div>

          ) : (

            /* ===============================
               LOGGED-OUT USER
            =============================== */

            <div className="top-header__user-menu">

              {/* PROFILE BUTTON */}

              <button
                className="top-header__user-btn"
                onClick={() =>
                  setDropdownOpen((p) => !p)
                }
                aria-haspopup="true"
                aria-expanded={dropdownOpen}
              >

                <FaBars size={14} />

                <FaUserCircle
                  size={28}
                  color="#717171"
                />

              </button>


              {/* LOGIN / SIGNUP DROPDOWN */}

              {dropdownOpen && (

                <div
                  className="top-header__dropdown"
                  role="menu"
                >

                  {/* LOGIN */}

                  <button
                    className="top-header__dropdown-item top-header__dropdown-item--bold"
                    role="menuitem"
                    onClick={() => {

                      if (onLoginClick) {
                        onLoginClick();
                      }

                      setDropdownOpen(false);

                    }}
                  >
                    Log In
                  </button>


                  {/* SIGN UP */}

                  <button
                    className="top-header__dropdown-item"
                    role="menuitem"
                    onClick={() => {

                      if (onSignupClick) {
                        onSignupClick();
                      }

                      setDropdownOpen(false);

                    }}
                  >
                    Sign Up
                  </button>

                </div>

              )}

            </div>

          )}

        </div>

      </div>

    </header>
  );
};

export default TopHeader;