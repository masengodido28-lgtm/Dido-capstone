import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';
import {
  FaEdit, FaTrash, FaStar, FaMapMarkerAlt,
  FaBed, FaBath, FaUsers, FaSearch, FaPlus,
} from 'react-icons/fa';
import './ViewListingsPage.css';

/**
 * ViewListingsPage — table view of all property listings.
 * Columns: Image | Title & Location | Type | Bedrooms | Price | Rating | Actions
 * Includes live search filter, add button, delete with confirm.
 */
const ViewListingsPage = () => {
  const navigate = useNavigate();
  const [listings, setListings] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');

  const fetchListings = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const { data } = await api.get('/api/accommodations');
      setListings(data.data);
      setFiltered(data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load listings. Is the backend running?');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchListings(); }, [fetchListings]);

  // Live search filter
  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(
      listings.filter(
        (l) =>
          l.title.toLowerCase().includes(q) ||
          l.location.toLowerCase().includes(q) ||
          l.type.toLowerCase().includes(q)
      )
    );
  }, [search, listings]);

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) return;
    setDeletingId(id);
    try {
      await api.delete(`/api/accommodations/${id}`);
      setListings((prev) => prev.filter((l) => l._id !== id));
      setSuccessMsg(`"${title}" deleted successfully.`);
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setError(err.response?.data?.message || 'Delete failed. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  const imgSrc = (listing) => {
    if (!listing.images || listing.images.length === 0) return null;
    const img = listing.images[0];
    return img.startsWith('http') ? img : `http://localhost:5000${img}`;
  };

  return (
    <div className="page-container">
      {/* ── Top bar ── */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Listings</h1>
          <p className="page-subtitle">
            {filtered.length} of {listings.length} propert{listings.length !== 1 ? 'ies' : 'y'}
          </p>
        </div>
        <Link to="/create" className="btn-primary">
          <FaPlus size={12} /> Add Listing
        </Link>
      </div>

      {/* ── Search ── */}
      <div className="listings-search">
        <FaSearch size={14} className="listings-search__icon" />
        <input
          type="text"
          placeholder="Search by title, location or type…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="listings-search__input"
          aria-label="Search listings"
        />
        {search && (
          <button
            className="listings-search__clear"
            onClick={() => setSearch('')}
            aria-label="Clear search"
          >×</button>
        )}
      </div>

      {/* ── Feedback ── */}
      {error && (
        <div className="alert alert--error" role="alert">
          {error}
          <button className="alert__close" onClick={() => setError('')}>×</button>
        </div>
      )}
      {successMsg && (
        <div className="alert alert--success" role="status">{successMsg}</div>
      )}

      {/* ── Loading ── */}
      {loading && (
        <div className="loading-spinner">
          <div className="spinner" />
          <p>Loading listings…</p>
        </div>
      )}

      {/* ── Empty ── */}
      {!loading && filtered.length === 0 && !error && (
        <div className="empty-state">
          <p className="empty-state__text">
            {search ? `No listings match "${search}".` : 'No listings yet.'}
          </p>
          {!search && <Link to="/create" className="btn-primary">Create your first listing</Link>}
        </div>
      )}

      {/* ── Table ── */}
      {!loading && filtered.length > 0 && (
        <div className="listings-table-wrap">
          <table className="listings-table" aria-label="Property listings">
            <thead>
              <tr>
                <th style={{ width: 72 }}></th>
                <th>Property</th>
                <th>Type</th>
                <th><FaBed size={11} /> Beds</th>
                <th><FaBath size={11} /> Baths</th>
                <th><FaUsers size={11} /> Guests</th>
                <th>Price</th>
                <th><FaStar size={11} /> Rating</th>
                <th style={{ width: 120 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((listing) => (
                <tr key={listing._id}>
                  {/* Thumbnail */}
                  <td>
                    <div className="lt-thumb">
                      {imgSrc(listing) ? (
                        <img
                          src={imgSrc(listing)}
                          alt={listing.title}
                          className="lt-thumb__img"
                          onError={(e) => { e.target.style.display = 'none'; }}
                        />
                      ) : (
                        <div className="lt-thumb__placeholder">—</div>
                      )}
                    </div>
                  </td>

                  {/* Title + location */}
                  <td>
                    <div className="lt-property">
                      <span className="lt-property__title">{listing.title}</span>
                      <span className="lt-property__location">
                        <FaMapMarkerAlt size={10} /> {listing.location}
                      </span>
                    </div>
                  </td>

                  <td><span className="lt-badge">{listing.type}</span></td>
                  <td className="lt-center">{listing.bedrooms}</td>
                  <td className="lt-center">{listing.bathrooms}</td>
                  <td className="lt-center">{listing.guests}</td>

                  {/* Price */}
                  <td>
                    <span className="lt-price">${listing.price}</span>
                    <span className="lt-price-unit">/night</span>
                  </td>

                  {/* Rating */}
                  <td>
                    {listing.rating > 0 ? (
                      <span className="lt-rating">
                        <FaStar size={11} color="#FF385C" /> {listing.rating.toFixed(1)}
                      </span>
                    ) : (
                      <span className="lt-muted">—</span>
                    )}
                  </td>

                  {/* Actions */}
                  <td>
                    <div className="lt-actions">
                      <button
                        className="btn-secondary"
                        onClick={() => navigate(`/edit/${listing._id}`)}
                        aria-label={`Edit ${listing.title}`}
                      >
                        <FaEdit size={13} /> Edit
                      </button>
                      <button
                        className="btn-danger"
                        onClick={() => handleDelete(listing._id, listing.title)}
                        disabled={deletingId === listing._id}
                        aria-label={`Delete ${listing.title}`}
                      >
                        <FaTrash size={11} />
                        {deletingId === listing._id ? '…' : 'Del'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ViewListingsPage;
