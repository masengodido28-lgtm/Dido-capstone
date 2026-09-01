import React, { useState, useEffect, useCallback } from 'react';
import api from '../api/axiosConfig';
import { FaTrash, FaCalendarAlt, FaUsers, FaDollarSign } from 'react-icons/fa';
import './ReservationsPage.css';

/**
 * ReservationsPage — shows all reservations for the logged-in host.
 * Displays a table with guest details, dates, accommodation, and cost.
 * Allows the host to cancel (delete) reservations.
 */
const ReservationsPage = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');

  const fetchReservations = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const { data } = await api.get('/api/reservations/host');
      setReservations(data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load reservations.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReservations();
  }, [fetchReservations]);

  const handleDelete = async (id) => {
    if (!window.confirm('Cancel this reservation? This cannot be undone.')) return;
    setDeletingId(id);
    try {
      await api.delete(`/api/reservations/${id}`);
      setReservations((prev) => prev.filter((r) => r._id !== id));
      setSuccessMsg('Reservation cancelled successfully.');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to cancel reservation.');
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (d) =>
    new Date(d).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' });

  if (loading) return (
    <div className="page-container">
      <div className="loading-spinner"><div className="spinner" /><p>Loading reservations…</p></div>
    </div>
  );

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Reservations</h1>
          <p className="page-subtitle">{reservations.length} reservation{reservations.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      {error && <div className="alert alert--error" role="alert">{error}</div>}
      {successMsg && <div className="alert alert--success" role="status">{successMsg}</div>}

      {reservations.length === 0 && !error ? (
        <div className="empty-state">
          <p className="empty-state__text">No reservations found yet.</p>
        </div>
      ) : (
        <div className="reservations-table-wrap">
          <table className="reservations-table" aria-label="Reservations">
            <thead>
              <tr>
                <th>Property</th>
                <th><FaCalendarAlt size={12} /> Check-In</th>
                <th><FaCalendarAlt size={12} /> Check-Out</th>
                <th><FaUsers size={12} /> Guests</th>
                <th>Nights</th>
                <th><FaDollarSign size={12} /> Total</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {reservations.map((r) => (
                <tr key={r._id}>
                  <td>
                    <div className="res-property">
                      <strong>{r.accommodation?.title || 'N/A'}</strong>
                      <span>{r.accommodation?.location || ''}</span>
                    </div>
                  </td>
                  <td>{formatDate(r.checkIn)}</td>
                  <td>{formatDate(r.checkOut)}</td>
                  <td>{r.guests}</td>
                  <td>{r.totalNights}</td>
                  <td><strong>${r.totalCost?.toFixed(2)}</strong></td>
                  <td>
                    <span className={`status-badge status-badge--${r.status}`}>
                      {r.status}
                    </span>
                  </td>
                  <td>
                    <button
                      className="btn-danger"
                      onClick={() => handleDelete(r._id)}
                      disabled={deletingId === r._id}
                      aria-label="Cancel reservation"
                    >
                      <FaTrash size={12} />
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
