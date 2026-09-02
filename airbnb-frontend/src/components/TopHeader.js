import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaSearch, FaUserCircle, FaBars, FaTimes } from 'react-icons/fa';
import { locations } from '../data/accommodations';
import './TopHeader.css';

/**
 * TopHeader — sticky navigation bar for the Airbnb frontend.
 *
 * Search bar: real text input with live autocomplete suggestions.
 * Typing filters the known locations and shows a dropdown.
 * Pressing Enter or clicking a suggestion navigates to that location page.
 *
 * Profile section: login/signup dropdown when logged out,
 * username + reservations/logout when logged in.
 */
const TopHeader = ({ onLoginClick, onSignupClick }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);   // keyboard nav

  const inputRef = useRef(null);
  const wrapRef = useRef(null);

  // Close suggestion list when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setShowSuggestions(false);
        setActiveIdx(-1);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Close profile dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (!e.target.closest('.top-header__profile')) setProfileOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Filter suggestions as the user types
  const handleQueryChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    setActiveIdx(-1);
    if (val.trim().length === 0) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    const matched = locations.filter(loc =>
      loc.toLowerCase().includes(val.toLowerCase())
    );
    setSuggestions(matched);
    setShowSuggestions(matched.length > 0);
  };

  // Navigate on submit
  const handleSubmit = (e) => {
    e.preventDefault();
    const dest = activeIdx >= 0 ? suggestions[activeIdx] : query.trim();
    if (dest) {
      navigate(`/location/${encodeURIComponent(dest)}`);
      setQuery('');
      setSuggestions([]);
      setShowSuggestions(false);
      setActiveIdx(-1);
      inputRef.current?.blur();
    }
  };

  // Pick a suggestion
  const handleSuggestionClick = (loc) => {
    navigate(`/location/${encodeURIComponent(loc)}`);
    setQuery('');
    setSuggestions([]);
    setShowSuggestions(false);
    setActiveIdx(-1);
  };

  // Keyboard navigation inside the suggestion list
  const handleKeyDown = (e) => {
    if (!showSuggestions) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIdx(i => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIdx(i => Math.max(i - 1, -1));
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      setActiveIdx(-1);
    }
  };

  const handleLogout = () => {
    logout();
    setProfileOpen(false);
    navigate('/');
  };

  const isHome = location.pathname === '/';

  return (
    <header className={`top-header ${isHome ? 'top-header--home' : ''}`}>
      <div className="top-header__inner">

        {/* ── Logo ── */}
        <button
          className="top-header__logo"
          onClick={() => navigate('/')}
          aria-label="Go to home"
        >
          <svg viewBox="0 0 32 32" className="top-header__logo-svg" aria-hidden="true">
            <path
              d="M16 1C7.716 1 1 7.716 1 16s6.716 15 15 15 15-6.716 15-15S24.284 1 16 1zm-.002 4.65c.9 0 1.63.73 1.63 1.63S16.898 8.91 16 8.91s-1.63-.73-1.63-1.63.73-1.63 1.628-1.63zM22 22.25H10a.75.75 0 010-1.5h1.5v-5H11a.75.75 0 010-1.5h4a.75.75 0 010 1.5h-.5v5h2v-6.25H16a.75.75 0 010-1.5h4a.75.75 0 010 1.5h-.5V20.75H21a.75.75 0 010 1.5z"
              fill="#FF385C"
            />
          </svg>
          <span className="top-header__logo-text">airbnb</span>
        </button>

        {/* ── Search ── */}
        <div className="top-header__search-wrap" ref={wrapRef}>
          <form
            className="top-header__search"
            onSubmit={handleSubmit}
            role="search"
            aria-label="Search locations"
          >
            <div className={`top-header__search-inner ${showSuggestions ? 'top-header__search-inner--open' : ''}`}>
              <FaSearch size={14} className="top-header__search-icon" aria-hidden="true" />

              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={handleQueryChange}
                onKeyDown={handleKeyDown}
                onFocus={() => query.trim() && setShowSuggestions(suggestions.length > 0)}
                placeholder="Search destinations…"
                className="top-header__search-input"
                aria-label="Search destinations"
                aria-autocomplete="list"
                aria-expanded={showSuggestions}
                autoComplete="off"
              />

              {/* Clear button — only visible when there's text */}
              {query && (
                <button
                  type="button"
                  className="top-header__search-clear"
                  onClick={() => { setQuery(''); setSuggestions([]); setShowSuggestions(false); inputRef.current?.focus(); }}
                  aria-label="Clear search"
                >
                  <FaTimes size={12} />
                </button>
              )}

              <button
                type="submit"
                className="top-header__search-btn"
                aria-label="Search"
              >
                <FaSearch size={13} />
              </button>
            </div>
          </form>

          {/* Autocomplete dropdown */}
          {showSuggestions && (
            <ul
              className="top-header__suggestions"
              role="listbox"
              aria-label="Location suggestions"
            >
              {suggestions.map((loc, idx) => (
                <li
                  key={loc}
                  role="option"
                  aria-selected={idx === activeIdx}
                  className={`top-header__suggestion ${idx === activeIdx ? 'top-header__suggestion--active' : ''}`}
                  onMouseDown={() => handleSuggestionClick(loc)}
                >
                  <FaSearch size={11} className="top-header__suggestion-icon" />
                  {/* Highlight the matching part */}
                  <span>
                    {(() => {
                      const q = query.toLowerCase();
                      const start = loc.toLowerCase().indexOf(q);
                      if (start === -1) return loc;
                      return (
                        <>
                          {loc.slice(0, start)}
                          <strong>{loc.slice(start, start + query.length)}</strong>
                          {loc.slice(start + query.length)}
                        </>
                      );
                    })()}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* ── Profile ── */}
        <div className="top-header__profile">
          <div className="top-header__user-menu">
            <button
              className="top-header__user-btn"
              onClick={() => setProfileOpen(p => !p)}
              aria-haspopup="true"
              aria-expanded={profileOpen}
              aria-label="Profile menu"
            >
              <FaBars size={14} />
              <FaUserCircle size={28} color="#717171" />
            </button>

            {profileOpen && (
              <div className="top-header__dropdown" role="menu">
                {user ? (
                  <>
                    <span className="top-header__dropdown-greeting">
                      Hi, {user.username}
                    </span>
                    <button
                      className="top-header__dropdown-item"
                      role="menuitem"
                      onClick={() => { navigate('/reservations'); setProfileOpen(false); }}
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
                  </>
                ) : (
                  <>
                    <button
                      className="top-header__dropdown-item top-header__dropdown-item--bold"
                      role="menuitem"
                      onClick={() => { onLoginClick?.(); setProfileOpen(false); }}
                    >
                      Log In
                    </button>
                    <button
                      className="top-header__dropdown-item"
                      role="menuitem"
                      onClick={() => { onSignupClick?.(); setProfileOpen(false); }}
                    >
                      Sign Up
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

      </div>
    </header>
  );
};

export default TopHeader;
