import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaCalendarAlt, FaMapMarkerAlt, FaTrash } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import Footer from '../components/Footer';
import './UserReservationsPage.css';

/**
 * UserReservationsPage — shows all reservations for the logged-in user.
 * Displayed as a table with accommodation name, dates, guests, cost.
 * User can cancel their own reservations.
 */
const UserReservationsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (!user) { navigate('/'); return; }
    const fetchReservations = async () => {
      try {
        const { data } = await axios.get('/api/reservations/user');
        setReservations(data.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load reservations.');
      } finally {
        setLoading(false);
      }
    };
    fetchReservations();
  }, [user, navigate]);

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this reservation?')) return;
    setDeletingId(id);
    try {
      await axios.delete(`/api/reservations/${id}`);
      setReservations((prev) => prev.filter((r) => r._id !== id));
      setSuccessMsg('Reservation cancelled.');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to cancel.');
    } finally {
      setDeletingId(null);
    }
  };

  const fmt = (d) => new Date(d).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' });

  if (loading) return (
    <div className="ures-loading">
      <div className="spinner" /><p>Loading your reservations…</p>
    </div>
  );

  return (
    <div className="ures-page">
      <div className="ures-inner">
        <h1 className="ures-title">My Reservations</h1>
        <p className="ures-sub">{reservations.length} reservation{reservations.length !== 1 ? 's' : ''}</p>

        {error && <div className="ures-alert ures-alert--error">{error}</div>}
        {successMsg && <div className="ures-alert ures-alert--success">{successMsg}</div>}

        {reservations.length === 0 && !error ? (
          <div className="ures-empty">
            <p>You haven't made any reservations yet.</p>
            <button className="btn-primary" onClick={() => navigate('/')}>Browse Listings</button>
          </div>
        ) : (
          <div className="ures-table-wrap">
            <table className="ures-table" aria-label="My reservations">
              <thead>
                <tr>
                  <th>Property</th>
                  <th><FaCalendarAlt size={11} /> Check-In</th>
                  <th><FaCalendarAlt size={11} /> Check-Out</th>
                  <th>Nights</th>
                  <th>Guests</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {reservations.map((r) => (
                  <tr key={r._id}>
                    <td>
                      <div className="ures-property">
                        <strong>{r.accommodation?.title || 'N/A'}</strong>
                        <span>
                          <FaMapMarkerAlt size={10} color="#717171" />
                          {r.accommodation?.location}
                        </span>
                      </div>
                    </td>
                    <td>{fmt(r.checkIn)}</td>
                    <td>{fmt(r.checkOut)}</td>
                    <td>{r.totalNights}</td>
                    <td>{r.guests}</td>
                    <td><strong>${r.totalCost?.toFixed(2)}</strong></td>
                    <td>
                      <span className={`ures-status ures-status--${r.status}`}>{r.status}</span>
                    </td>
                    <td>
                      <button
                        className="ures-cancel-btn"
                        onClick={() => handleCancel(r._id)}
                        disabled={deletingId === r._id}
                        aria-label="Cancel reservation"
                      >
                        <FaTrash size={12} />
                        {deletingId === r._id ? '…' : ' Cancel'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default UserReservationsPage;
