import React, { useState, useEffect, useCallback } from 'react';
import api from '../api/axiosConfig';
import { useAuth } from '../context/AuthContext';
import { FaTrash, FaSearch, FaCalendarAlt, FaMapMarkerAlt } from 'react-icons/fa';
import './ReservationsPage.css';

/**
 * ReservationsPage — table of all reservations for the logged-in host.
 * Columns: Booked By | Property | Created | Check-Out | Nights | Total | Status | Actions
 * Includes live search filter.
 */
const ReservationsPage = () => {
  const { user } = useAuth();
  const [reservations, setReservations] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');

  const fetchReservations = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      // Admin sees all reservations; host sees only their own
      const endpoint =
        user?.role === 'admin'
          ? '/api/reservations/all'
          : '/api/reservations/host';
      const { data } = await api.get(endpoint);
      setReservations(data.data);
      setFiltered(data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load reservations.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { fetchReservations(); }, [fetchReservations]);

  /* Live search across property title and guest name */
  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(
      reservations.filter(r =>
        (r.accommodation?.title || '').toLowerCase().includes(q) ||
        (r.accommodation?.location || '').toLowerCase().includes(q) ||
        (r.user?.username || '').toLowerCase().includes(q) ||
        (r.user?.email || '').toLowerCase().includes(q)
      )
    );
  }, [search, reservations]);

  const handleDelete = async (id) => {
    if (!window.confirm('Cancel this reservation? This cannot be undone.')) return;
    setDeletingId(id);
    try {
      await api.delete(`/api/reservations/${id}`);
      // Backend soft-deletes (status → 'cancelled'), update in place
      setReservations(prev =>
        prev.map(r => r._id === id ? { ...r, status: 'cancelled' } : r)
      );
      setSuccessMsg('Reservation cancelled successfully.');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to cancel reservation.');
    } finally {
      setDeletingId(null);
    }
  };

  const fmt = d =>
    new Date(d).toLocaleDateString('en-ZA', {
      day: '2-digit', month: '2-digit', year: 'numeric',
    });

  if (loading) return (
    <div className="page-container">
      <div className="loading-spinner"><div className="spinner" /><p>Loading reservations…</p></div>
    </div>
  );

  return (
    <div className="page-container">

      {/* ── Top bar ── */}
      <div className="page-header">
        <div>
          <h1 className="page-title">My Reservations</h1>
          <p className="page-subtitle">
            {filtered.length} of {reservations.length} reservation{reservations.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* ── Search ── */}
      <div className="res-search">
        <FaSearch size={13} className="res-search__icon" />
        <input
          type="text"
          placeholder="Search by guest, property or location…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="res-search__input"
          aria-label="Search reservations"
        />
        {search && (
          <button className="res-search__clear" onClick={() => setSearch('')} aria-label="Clear">×</button>
        )}
      </div>

      {/* ── Feedback ── */}
      {error && (
        <div className="alert alert--error" role="alert">
          {error}
          <button className="alert__close" onClick={() => setError('')}>×</button>
        </div>
      )}
      {successMsg && <div className="alert alert--success" role="status">{successMsg}</div>}

      {/* ── Empty ── */}
      {filtered.length === 0 && !error && (
        <div className="empty-state">
          <p className="empty-state__text">
            {search ? `No reservations match "${search}".` : 'No reservations yet.'}
          </p>
        </div>
      )}

      {/* ── Table ── */}
      {filtered.length > 0 && (
        <div className="res-table-wrap">
          <table className="res-table" aria-label="Reservations">
            <thead>
              <tr>
                <th>Booked By</th>
                <th>Property</th>
                <th><FaCalendarAlt size={11} /> Created</th>
                <th><FaCalendarAlt size={11} /> Check-In</th>
                <th><FaCalendarAlt size={11} /> Check-Out</th>
                <th>Nights</th>
                <th>Total</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(r => (
                <tr key={r._id}>

                  {/* Booked By */}
                  <td>
                    <div className="res-guest">
                      <div className="res-guest__avatar">
                        {(r.user?.username?.[0] || '?').toUpperCase()}
                      </div>
                      <div className="res-guest__info">
                        <span className="res-guest__name">
                          {r.user?.username || 'Guest'}
                        </span>
                        <span className="res-guest__email">
                          {r.user?.email || ''}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Property */}
                  <td>
                    <div className="res-property">
                      <span className="res-property__title">
                        {r.accommodation?.title || 'N/A'}
                      </span>
                      <span className="res-property__loc">
                        <FaMapMarkerAlt size={10} /> {r.accommodation?.location || '—'}
                      </span>
                    </div>
                  </td>

                  {/* Created */}
                  <td className="res-date">{fmt(r.createdAt)}</td>

                  {/* Check-In */}
                  <td className="res-date">{fmt(r.checkIn)}</td>

                  {/* Check-Out */}
                  <td className="res-date">{fmt(r.checkOut)}</td>

                  {/* Nights */}
                  <td className="res-center">{r.totalNights}</td>

                  {/* Total */}
                  <td>
                    <span className="res-total">${r.totalCost?.toFixed(2)}</span>
                  </td>

                  {/* Status */}
                  <td>
                    <span className={`res-badge res-badge--${r.status}`}>
                      {r.status}
                    </span>
                  </td>

                  {/* Actions */}
                  <td>
                    <button
                      className="btn-danger"
                      onClick={() => handleDelete(r._id)}
                      disabled={deletingId === r._id}
                      aria-label="Cancel reservation"
                    >
                      <FaTrash size={11} />
                      {deletingId === r._id ? ' …' : ' Cancel'}
                    </button>
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

export default ReservationsPage;
