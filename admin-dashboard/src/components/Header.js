import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaUserCircle, FaChevronDown } from 'react-icons/fa';
import './Header.css';

/**
 * Header — top navigation bar for the Admin Dashboard.
 * Shows Airbnb logo + nav links.
 * When logged in: shows username greeting + dropdown (View Reservations / Logout).
 * When logged out: shows "Become a Host" link.
 */
const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    navigate('/login');
  };

  return (
    <header className="header">
      <div className="header__inner">
        {/* Logo */}
        <Link to="/" className="header__logo">
          <svg viewBox="0 0 32 32" className="header__logo-svg" aria-label="Airbnb">
            <path
              d="M16 1C7.716 1 1 7.716 1 16s6.716 15 15 15 15-6.716 15-15S24.284 1 16 1zm0 5.5c1.38 0 2.5 1.12 2.5 2.5S17.38 11.5 16 11.5 13.5 10.38 13.5 9s1.12-2.5 2.5-2.5zm6 14.25c0 .414-.336.75-.75.75H10.75a.75.75 0 01-.75-.75v-.5c0-.414.336-.75.75-.75H11v-5h-.25a.75.75 0 01-.75-.75v-.5c0-.414.336-.75.75-.75h4.5c.414 0 .75.336.75.75V20h.5v-6.25h-.25a.75.75 0 01-.75-.75v-.5c0-.414.336-.75.75-.75h4.5c.414 0 .75.336.75.75V20h.25c.414 0 .75.336.75.75v.5z"
              fill="#FF385C"
            />
          </svg>
          <span className="header__logo-text">airbnb admin</span>
        </Link>

        {/* Nav links */}
        <nav className="header__nav">
          {user && (
            <>
              <Link to="/" className="header__nav-link">Dashboard</Link>
              <Link to="/listings" className="header__nav-link">Listings</Link>
              <Link to="/create" className="header__nav-link header__nav-link--cta">
                + New Listing
              </Link>
            </>
          )}
        </nav>

        {/* Profile / Auth section */}
        <div className="header__profile">
          {user ? (
            <div className="header__user-menu">
              <button
                className="header__user-btn"
                onClick={() => setDropdownOpen((prev) => !prev)}
                aria-haspopup="true"
                aria-expanded={dropdownOpen}
              >
                <FaUserCircle size={28} color="#FF385C" />
                <span className="header__greeting">Hi, {user.username}</span>
                <FaChevronDown size={12} className={`header__chevron ${dropdownOpen ? 'open' : ''}`} />
              </button>

              {dropdownOpen && (
                <div className="header__dropdown" role="menu">
                  <Link
                    to="/reservations"
                    className="header__dropdown-item"
                    role="menuitem"
                    onClick={() => setDropdownOpen(false)}
                  >
                    View Reservations
                  </Link>
                  <button
                    className="header__dropdown-item header__dropdown-item--logout"
                    role="menuitem"
                    onClick={handleLogout}
                  >
                    Log Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="header__become-host">
              Become a Host
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
