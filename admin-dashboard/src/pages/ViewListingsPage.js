import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaEdit, FaTrash, FaStar, FaMapMarkerAlt, FaBed, FaBath, FaUsers } from 'react-icons/fa';
import './ViewListingsPage.css';

/**
 * ViewListingsPage — displays all accommodation listings with
 * key details and options to update or delete each one.
 */
const ViewListingsPage = () => {
  const navigate = useNavigate();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');

  /** Fetch all listings from the backend */
  const fetchListings = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const { data } = await axios.get('/api/accommodations');
      setListings(data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load listings. Is the backend running?');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  /** Delete a listing after confirmation */
  const handleDelete = async (id, title) => {
    if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) return;

    setDeletingId(id);
    try {
      await axios.delete(`/api/accommodations/${id}`);
      setListings((prev) => prev.filter((l) => l._id !== id));
      setSuccessMsg(`"${title}" deleted successfully.`);
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setError(err.response?.data?.message || 'Delete failed. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading-spinner" aria-label="Loading listings">
          <div className="spinner" />
          <p>Loading listings…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      {/* Page header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Property Listings</h1>
          <p className="page-subtitle">{listings.length} listing{listings.length !== 1 ? 's' : ''} total</p>
        </div>
        <Link to="/create" className="btn-primary">
          + Add New Listing
        </Link>
      </div>

      {/* Feedback banners */}
      {error && (
        <div className="alert alert--error" role="alert">
          {error}
          <button className="alert__close" onClick={() => setError('')} aria-label="Dismiss">×</button>
        </div>
      )}
      {successMsg && (
        <div className="alert alert--success" role="status">
          {successMsg}
        </div>
      )}

      {/* Empty state */}
      {listings.length === 0 && !error && (
        <div className="empty-state">
          <p className="empty-state__text">No listings yet.</p>
          <Link to="/create" className="btn-primary">Create your first listing</Link>
        </div>
      )}

      {/* Listings grid */}
      {listings.length > 0 && (
        <div className="listings-grid">
          {listings.map((listing) => (
            <div key={listing._id} className="listing-card">
              {/* Image */}
              <div className="listing-card__img-wrap">
                {listing.images && listing.images.length > 0 ? (
                  <img
                    src={listing.images[0].startsWith('http') ? listing.images[0] : `http://localhost:5000${listing.images[0]}`}
                    alt={listing.title}
                    className="listing-card__img"
                    onError={(e) => { e.target.src = 'https://via.placeholder.com/400x260?text=No+Image'; }}
                  />
                ) : (
                  <div className="listing-card__img-placeholder">No Image</div>
                )}
                <span className="listing-card__type">{listing.type}</span>
              </div>

              {/* Body */}
              <div className="listing-card__body">
                <h2 className="listing-card__title">{listing.title}</h2>

                <div className="listing-card__location">
                  <FaMapMarkerAlt size={12} color="#717171" />
                  <span>{listing.location}</span>
                </div>

                <div className="listing-card__meta">
                  <span><FaBed size={12} /> {listing.bedrooms} bed{listing.bedrooms !== 1 ? 's' : ''}</span>
                  <span><FaBath size={12} /> {listing.bathrooms} bath{listing.bathrooms !== 1 ? 's' : ''}</span>
                  <span><FaUsers size={12} /> {listing.guests} guest{listing.guests !== 1 ? 's' : ''}</span>
                </div>

                {listing.rating > 0 && (
                  <div className="listing-card__rating">
                    <FaStar size={12} color="#FF385C" />
                    <span>{listing.rating.toFixed(1)}</span>
                    <span className="listing-card__reviews">({listing.reviews} reviews)</span>
                  </div>
                )}

                <div className="listing-card__price">
                  <span className="listing-card__price-amount">${listing.price}</span>
                  <span className="listing-card__price-unit"> / night</span>
                </div>
              </div>

              {/* Actions */}
              <div className="listing-card__actions">
                <button
                  className="btn-secondary listing-card__btn"
                  onClick={() => navigate(`/edit/${listing._id}`)}
                  aria-label={`Edit ${listing.title}`}
                >
                  <FaEdit size={14} /> Edit
                </button>
                <button
                  className="btn-danger listing-card__btn"
                  onClick={() => handleDelete(listing._id, listing.title)}
                  disabled={deletingId === listing._id}
                  aria-label={`Delete ${listing.title}`}
                >
                  <FaTrash size={14} />
                  {deletingId === listing._id ? 'Deleting…' : 'Delete'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ViewListingsPage;
