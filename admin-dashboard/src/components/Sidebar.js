import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  FaHome, FaList, FaPlusCircle, FaCalendarAlt,
  FaSignOutAlt, FaUserCircle, FaBars, FaTimes,
} from 'react-icons/fa';
import './Sidebar.css';

/**
 * Sidebar — left navigation panel for the Admin Dashboard.
 * Shows logo, nav links, and logged-in user info at the bottom.
 * Collapsible on mobile.
 */
const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { to: '/listings',     label: 'Listings',      icon: <FaList /> },
    { to: '/create',       label: 'Add Listing',   icon: <FaPlusCircle /> },
    { to: '/reservations', label: 'Reservations',  icon: <FaCalendarAlt /> },
  ];

  return (
    <aside className={`sidebar ${collapsed ? 'sidebar--collapsed' : ''}`}>
      {/* Toggle button (mobile / collapse) */}
      <button
        className="sidebar__toggle"
        onClick={() => setCollapsed(p => !p)}
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {collapsed ? <FaBars size={18} /> : <FaTimes size={18} />}
      </button>

      {/* Logo */}
      <div className="sidebar__logo" onClick={() => navigate('/listings')}>
        <svg viewBox="0 0 32 32" className="sidebar__logo-svg" aria-hidden="true">
          <path
            d="M16 1C7.716 1 1 7.716 1 16s6.716 15 15 15 15-6.716 15-15S24.284 1 16 1zm0 5.5c1.38 0 2.5 1.12 2.5 2.5S17.38 11.5 16 11.5 13.5 10.38 13.5 9s1.12-2.5 2.5-2.5zm6 14.25c0 .414-.336.75-.75.75H10.75a.75.75 0 01-.75-.75v-.5c0-.414.336-.75.75-.75H11v-5h-.25a.75.75 0 01-.75-.75v-.5c0-.414.336-.75.75-.75h4.5c.414 0 .75.336.75.75V20h.5v-6.25h-.25a.75.75 0 01-.75-.75v-.5c0-.414.336-.75.75-.75h4.5c.414 0 .75.336.75.75V20h.25c.414 0 .75.336.75.75v.5z"
            fill="#FF385C"
          />
        </svg>
        {!collapsed && <span className="sidebar__logo-text">Airbnb Admin</span>}
      </div>

      {/* Nav links */}
      <nav className="sidebar__nav" aria-label="Admin navigation">
        {navItems.map(({ to, label, icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`
            }
          >
            <span className="sidebar__link-icon">{icon}</span>
            {!collapsed && <span className="sidebar__link-label">{label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* User info + logout at bottom */}
      <div className="sidebar__footer">
        {user && (
          <>
            <div className="sidebar__user">
              <FaUserCircle size={28} color="#FF385C" className="sidebar__user-icon" />
              {!collapsed && (
                <div className="sidebar__user-info">
                  <span className="sidebar__user-name">{user.username}</span>
                  <span className="sidebar__user-role">{user.role}</span>
                </div>
              )}
            </div>
            <button className="sidebar__logout" onClick={handleLogout} aria-label="Log out">
              <FaSignOutAlt size={16} />
              {!collapsed && <span>Log Out</span>}
            </button>
          </>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
