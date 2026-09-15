import React, { useState, useEffect, useCallback } from 'react';
import api from '../api/axiosConfig';
import { FaTrash, FaSearch, FaCalendarAlt, FaMapMarkerAlt } from 'react-icons/fa';
import './ReservationsPage.css';

/**
 * ReservationsPage
 *
 * Admin page for viewing all reservations.
 * Includes search and reservation cancellation.
 */
const ReservationsPage = () => {
  const [reservations, setReservations] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');

  /**
   * Fetch ALL reservations.
   *
   * This is the admin dashboard, so we always use
   * the admin endpoint instead of /host.
   */
  const fetchReservations = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      const { data } = await api.get('/api/reservations/all');

      const reservationData = data.data || [];

      setReservations(reservationData);
      setFiltered(reservationData);
    } catch (err) {
      console.error('Failed to load reservations:', err);

      setError(
        err.response?.data?.message ||
        'Failed to load reservations.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReservations();
  }, [fetchReservations]);

  /**
   * Live search across:
   * - property title
   * - location
   * - guest username
   * - guest email
   */
  useEffect(() => {
    const q = search.toLowerCase();

    setFiltered(
      reservations.filter((r) =>
        (r.accommodation?.title || '')
          .toLowerCase()
          .includes(q) ||

        (r.accommodation?.location || '')
          .toLowerCase()
          .includes(q) ||

        (r.user?.username || '')
          .toLowerCase()
          .includes(q) ||

        (r.user?.email || '')
          .toLowerCase()
          .includes(q)
      )
    );
  }, [search, reservations]);

  /**
   * Cancel reservation.
   */
  const handleDelete = async (id) => {
    if (
      !window.confirm(
        'Cancel this reservation? This cannot be undone.'
      )
    ) {
      return;
    }

    setDeletingId(id);

    try {
      await api.delete(`/api/reservations/${id}`);

      // Update the reservation locally to cancelled
      setReservations((prev) =>
        prev.map((r) =>
          r._id === id
            ? { ...r, status: 'cancelled' }
            : r
        )
      );

      setSuccessMsg(
        'Reservation cancelled successfully.'
      );

      setTimeout(() => {
        setSuccessMsg('');
      }, 4000);

    } catch (err) {
      console.error('Failed to cancel reservation:', err);

      setError(
        err.response?.data?.message ||
        'Failed to cancel reservation.'
      );
    } finally {
      setDeletingId(null);
    }
  };

  /**
   * Format dates for South Africa.
   */
  const fmt = (d) => {
    if (!d) return '—';

    return new Date(d).toLocaleDateString('en-ZA', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  /**
   * Loading state.
   */
  if (loading) {
    return (
      <div className="page-container">
        <div className="loading-spinner">
          <div className="spinner" />
          <p>Loading reservations…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">

      {/* ================================
          HEADER
      ================================= */}

      <div className="page-header">
        <div>
          <h1 className="page-title">
            My Reservations
          </h1>

          <p className="page-subtitle">
            {filtered.length} of {reservations.length}{' '}
            reservation
            {reservations.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* ================================
          SEARCH
      ================================= */}

      <div className="res-search">

        <FaSearch
          size={13}
          className="res-search__icon"
        />

        <input
          type="text"
          placeholder="Search by guest, property or location…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="res-search__input"
          aria-label="Search reservations"
        />

        {search && (
          <button
            className="res-search__clear"
            onClick={() => setSearch('')}
            aria-label="Clear"
          >
            ×
          </button>
        )}

      </div>

      {/* ================================
          ERROR MESSAGE
      ================================= */}

      {error && (
        <div
          className="alert alert--error"
          role="alert"
        >
          {error}

          <button
            className="alert__close"
            onClick={() => setError('')}
          >
            ×
          </button>
        </div>
      )}

      {/* ================================
          SUCCESS MESSAGE
      ================================= */}

      {successMsg && (
        <div
          className="alert alert--success"
          role="status"
        >
          {successMsg}
        </div>
      )}

      {/* ================================
          EMPTY STATE
      ================================= */}

      {filtered.length === 0 && !error && (
        <div className="empty-state">

          <p className="empty-state__text">
            {search
              ? `No reservations match "${search}".`
              : 'No reservations yet.'}
          </p>

        </div>
      )}

      {/* ================================
          RESERVATIONS TABLE
      ================================= */}

      {filtered.length > 0 && (
        <div className="res-table-wrap">

          <table
            className="res-table"
            aria-label="Reservations"
          >

            <thead>
              <tr>

                <th>Booked By</th>

                <th>Property</th>

                <th>
                  <FaCalendarAlt size={11} /> Created
                </th>

                <th>
                  <FaCalendarAlt size={11} /> Check-In
                </th>

                <th>
                  <FaCalendarAlt size={11} /> Check-Out
                </th>

                <th>Nights</th>

                <th>Total</th>

                <th>Status</th>

                <th>Actions</th>

              </tr>
            </thead>

            <tbody>

              {filtered.map((r) => (

                <tr key={r._id}>

                  {/* ================================
                      GUEST
                  ================================= */}

                  <td>

                    <div className="res-guest">

                      <div className="res-guest__avatar">
                        {(r.user?.username?.[0] || '?')
                          .toUpperCase()}
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

                  {/* ================================
                      PROPERTY
                  ================================= */}

                  <td>

                    <div className="res-property">

                      <span className="res-property__title">
                        {r.accommodation?.title || 'N/A'}
                      </span>

                      <span className="res-property__loc">

                        <FaMapMarkerAlt size={10} />

                        {r.accommodation?.location || '—'}

                      </span>

                    </div>

                  </td>

                  {/* CREATED */}

                  <td className="res-date">
                    {fmt(r.createdAt)}
                  </td>

                  {/* CHECK-IN */}

                  <td className="res-date">
                    {fmt(r.checkIn)}
                  </td>

                  {/* CHECK-OUT */}

                  <td className="res-date">
                    {fmt(r.checkOut)}
                  </td>

                  {/* NIGHTS */}

                  <td className="res-center">
                    {r.totalNights ?? '—'}
                  </td>

                  {/* TOTAL */}

                  <td>

                    <span className="res-total">
                      $
                      {typeof r.totalCost === 'number'
                        ? r.totalCost.toFixed(2)
                        : '0.00'}
                    </span>

                  </td>

                  {/* STATUS */}

                  <td>

                    <span
                      className={`res-badge res-badge--${
                        r.status || 'pending'
                      }`}
                    >
                      {r.status || 'pending'}
                    </span>

                  </td>

                  {/* ACTIONS */}

                  <td>

                    <button
                      className="btn-danger"
                      onClick={() =>
                        handleDelete(r._id)
                      }
                      disabled={
                        deletingId === r._id
                      }
                      aria-label="Cancel reservation"
                    >

                      <FaTrash size={11} />

                      {deletingId === r._id
                        ? ' …'
                        : ' Cancel'}

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