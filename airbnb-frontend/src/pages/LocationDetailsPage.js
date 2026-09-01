import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import {
  FaStar, FaMapMarkerAlt, FaBed, FaBath, FaUsers, FaChevronLeft,
  FaShieldAlt, FaKey, FaBroom, FaWifi, FaParking, FaSwimmingPool,
  FaUtensils, FaDumbbell, FaFireExtinguisher,
} from 'react-icons/fa';
import { accommodations } from '../data/accommodations';
import { useAuth } from '../context/AuthContext';
import api from '../api/axiosConfig';
import Footer from '../components/Footer';
import './LocationDetailsPage.css';

/**
 * LocationDetailsPage — full detail view for a single accommodation.
 * Sections:
 *  - Heading (type + location) + Subheading (rating, reviews, location)
 *  - Image Gallery (1 large + 4 small)
 *  - Two-column layout:
 *      Left: accommodation details, where you'll sleep, what this place offers,
 *            7 nights info, reviews, host details, house rules
 *      Right: Cost Calculator (dynamic: date pickers, guest count, cost breakdown)
 *  - Static footer
 */

const amenityIcons = {
  wifi: <FaWifi />, kitchen: <FaUtensils />, pool: <FaSwimmingPool />,
  gym: <FaDumbbell />, 'free parking': <FaParking />, 'air conditioning': '❄️',
  barbecue: '🍖', fireplace: '🔥', balcony: '🏙️', 'beach access': '🏖️',
  'hiking trails': '🥾', 'shared kitchen': <FaUtensils />, 'tube nearby': '🚇',
  'parking': <FaParking />, 'mountain view': '⛰️', 'ocean view': '🌊',
};

const LocationDetailsPage = () => {
  const { location, id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [listing, setListing] = useState(null);
  const [checkIn, setCheckIn] = useState(null);
  const [checkOut, setCheckOut] = useState(null);
  const [guests, setGuests] = useState(1);
  const [reserving, setReserving] = useState(false);
  const [reservationMsg, setReservationMsg] = useState('');
  const [reservationError, setReservationError] = useState('');
  const [activeImg, setActiveImg] = useState(0);

  useEffect(() => {
    // Try static data first; backend would be called here in production
    const found = accommodations.find((a) => a._id === id);
    if (found) {
      setListing(found);
    } else {
      // Fallback: fetch from backend
      api.get(`/api/accommodations/${id}`)
        .then(({ data }) => setListing(data))
        .catch(() => setListing(null));
    }
  }, [id]);

  // ── Cost calculation ──────────────────────────────────────────────────────
  const totalNights = checkIn && checkOut
    ? Math.max(1, Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24)))
    : 0;

  const basePrice = listing ? listing.price * totalNights : 0;
  const weeklyDiscountAmt = listing && totalNights >= 7
    ? (basePrice * (listing.weeklyDiscount || 0)) / 100
    : 0;
  const cleaningFee = listing?.cleaningFee || 0;
  const serviceFee = listing?.serviceFee || 0;
  const occupancyTaxes = listing?.occupancyTaxes || 0;
  const totalCost = basePrice - weeklyDiscountAmt + cleaningFee + serviceFee + occupancyTaxes;

  // ── Reservation submission ────────────────────────────────────────────────
  const handleReserve = async () => {
    if (!user) {
      setReservationError('Please log in to make a reservation.');
      return;
    }
    if (!checkIn || !checkOut) {
      setReservationError('Please select check-in and check-out dates.');
      return;
    }
    if (checkOut <= checkIn) {
      setReservationError('Check-out must be after check-in.');
      return;
    }

    setReserving(true);
    setReservationError('');
    setReservationMsg('');

    try {
      await api.post('/api/reservations', {
        accommodationId: listing._id,
        checkIn: checkIn.toISOString(),
        checkOut: checkOut.toISOString(),
        guests,
      });
      setReservationMsg(`🎉 Reservation confirmed! Total: $${totalCost.toFixed(2)}`);
      setCheckIn(null);
      setCheckOut(null);
    } catch (err) {
      setReservationError(err.response?.data?.message || 'Reservation failed. Please try again.');
    } finally {
      setReserving(false);
    }
  };

  if (!listing) {
    return (
      <div className="details-loading">
        <div className="spinner" />
        <p>Loading property details…</p>
      </div>
    );
  }

  const avgRating = listing.specificRatings
    ? (Object.values(listing.specificRatings).reduce((a, b) => a + b, 0) / 6).toFixed(2)
    : listing.rating;

  return (
    <div className="details-page">
      <div className="details-page__inner">

        {/* ── Back button ──────────────────────────────────────────── */}
        <button
          className="details-page__back"
          onClick={() => navigate(`/location/${encodeURIComponent(location)}`)}
        >
          <FaChevronLeft size={13} /> Back to {decodeURIComponent(location)}
        </button>

        {/* ── Heading ──────────────────────────────────────────────── */}
        <div className="details-heading">
          <h1 className="details-heading__title">{listing.title}</h1>
          <div className="details-heading__sub">
            <span className="details-heading__type">{listing.type}</span>
            <span className="details-heading__dot">·</span>
            <FaStar size={13} color="#FF385C" />
            <span className="details-heading__rating">{listing.rating}</span>
            <span className="details-heading__reviews">({listing.reviews} reviews)</span>
            <span className="details-heading__dot">·</span>
            <FaMapMarkerAlt size={13} color="#FF385C" />
            <span className="details-heading__location">{listing.location}</span>
          </div>
        </div>

        {/* ── Image Gallery ────────────────────────────────────────── */}
        <div className="details-gallery">
          {/* Large image */}
          <div className="details-gallery__main">
            <img
              src={listing.images[activeImg] || listing.images[0]}
              alt={listing.title}
              className="details-gallery__main-img"
              onError={(e) => { e.target.src = 'https://via.placeholder.com/800x500?text=No+Image'; }}
            />
          </div>

          {/* 4 small images stacked 2 over 2 */}
          <div className="details-gallery__grid">
            {listing.images.slice(1, 5).map((img, i) => (
              <button
                key={i}
                className={`details-gallery__thumb-btn ${activeImg === i + 1 ? 'details-gallery__thumb-btn--active' : ''}`}
                onClick={() => setActiveImg(i + 1)}
                aria-label={`View image ${i + 2}`}
              >
                <img
                  src={img}
                  alt={`${listing.title} ${i + 2}`}
                  className="details-gallery__thumb"
                  onError={(e) => { e.target.src = 'https://via.placeholder.com/200x150?text=No+Image'; }}
                />
              </button>
            ))}
          </div>
        </div>

        {/* ── Two-column layout ────────────────────────────────────── */}
        <div className="details-layout">

          {/* ── LEFT COLUMN ─────────────────────────────────────────── */}
          <div className="details-left">

            {/* Accommodation details */}
            <section className="details-section">
              <div className="details-host-row">
                <div>
                  <h2 className="details-section__title">
                    {listing.type} hosted by {listing.host}
                  </h2>
                  <div className="details-capacity">
                    <span><FaUsers size={14} /> {listing.guests} guests</span>
                    <span><FaBed size={14} /> {listing.bedrooms} bedrooms</span>
                    <span><FaBath size={14} /> {listing.bathrooms} bathrooms</span>
                  </div>
                </div>
                <div className="details-host-avatar" aria-hidden="true">
                  {listing.host?.[0]?.toUpperCase()}
                </div>
              </div>
            </section>

            <hr className="details-divider" />

            {/* Highlights */}
            <section className="details-section">
              {listing.selfCheckIn && (
                <div className="details-highlight">
                  <FaKey size={22} className="details-highlight__icon" />
                  <div>
                    <strong>Self check-in</strong>
                    <p>Check yourself in with the key lockbox.</p>
                  </div>
                </div>
              )}
              {listing.enhancedCleaning && (
                <div className="details-highlight">
                  <FaBroom size={22} className="details-highlight__icon" />
                  <div>
                    <strong>Enhanced Clean</strong>
                    <p>This host follows Airbnb's 5-step enhanced cleaning process.</p>
                  </div>
                </div>
              )}
              <div className="details-highlight">
                <FaShieldAlt size={22} className="details-highlight__icon" />
                <div>
                  <strong>AirCover</strong>
                  <p>Every booking includes free protection from Host cancellations.</p>
                </div>
              </div>
            </section>

            <hr className="details-divider" />

            {/* Description */}
            <section className="details-section">
              <p className="details-description">{listing.description}</p>
            </section>

            <hr className="details-divider" />

            {/* Where you'll sleep */}
            <section className="details-section" aria-labelledby="sleep-heading">
              <h2 id="sleep-heading" className="details-section__title">Where you'll sleep</h2>
              <div className="details-sleep-cards">
                {Array.from({ length: listing.bedrooms || 1 }).map((_, i) => (
                  <div key={i} className="details-sleep-card">
                    <FaBed size={28} color="#555" />
                    <strong>Bedroom {i + 1}</strong>
                    <span>1 double bed</span>
                  </div>
                ))}
              </div>
            </section>

            <hr className="details-divider" />

            {/* What this place offers */}
            <section className="details-section" aria-labelledby="offers-heading">
              <h2 id="offers-heading" className="details-section__title">What this place offers</h2>
              <div className="details-amenities">
                {listing.amenities.map((amenity) => (
                  <div key={amenity} className="details-amenity">
                    <span className="details-amenity__icon">
                      {amenityIcons[amenity] || '✓'}
                    </span>
                    <span className="details-amenity__label">{amenity}</span>
                  </div>
                ))}
              </div>
            </section>

            <hr className="details-divider" />

            {/* 7 nights in [location] */}
            <section className="details-section" aria-labelledby="stay-heading">
              <h2 id="stay-heading" className="details-section__title">
                {totalNights > 0 ? `${totalNights} nights in ${listing.location}` : `7 nights in ${listing.location}`}
              </h2>
              <p className="details-stay-info">
                {checkIn && checkOut
                  ? `${checkIn.toLocaleDateString()} – ${checkOut.toLocaleDateString()}`
                  : 'Select your dates to see availability.'}
              </p>
            </section>

            <hr className="details-divider" />

            {/* Reviews */}
            <section className="details-section" aria-labelledby="reviews-heading">
              <h2 id="reviews-heading" className="details-section__title">
                <FaStar size={16} color="#FF385C" /> {avgRating} · {listing.reviews} reviews
              </h2>
              {listing.specificRatings && (
                <div className="details-ratings-grid">
                  {Object.entries(listing.specificRatings).map(([key, val]) => (
                    <div key={key} className="details-rating-row">
                      <span className="details-rating-row__label">
                        {key.charAt(0).toUpperCase() + key.slice(1)}
                      </span>
                      <div className="details-rating-row__bar">
                        <div
                          className="details-rating-row__fill"
                          style={{ width: `${(val / 5) * 100}%` }}
                          role="progressbar"
                          aria-valuenow={val}
                          aria-valuemin={0}
                          aria-valuemax={5}
                        />
                      </div>
                      <span className="details-rating-row__val">{val}</span>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <hr className="details-divider" />

            {/* Host details */}
            <section className="details-section" aria-labelledby="host-heading">
              <h2 id="host-heading" className="details-section__title">About your host</h2>
              <div className="details-host-card">
                <div className="details-host-card__avatar">{listing.host?.[0]?.toUpperCase()}</div>
                <div>
                  <strong>{listing.host}</strong>
                  <p>Host · Member since 2020</p>
                  <p>Response rate: 100% · Response time: within an hour</p>
                </div>
              </div>
            </section>

            <hr className="details-divider" />

            {/* House Rules, Safety, Cancellation */}
            <section className="details-section details-rules" aria-labelledby="rules-heading">
              <h2 id="rules-heading" className="details-section__title">Things to know</h2>
              <div className="details-rules__grid">
                <div>
                  <strong>House rules</strong>
                  <ul>
                    <li>Check-in: after 3:00 PM</li>
                    <li>Check-out: before 11:00 AM</li>
                    <li>No smoking</li>
                    <li>No pets</li>
                    <li>No parties or events</li>
                  </ul>
                </div>
                <div>
                  <strong>Health &amp; safety</strong>
                  <ul>
                    <li>Airbnb's social-distancing guidelines apply</li>
                    <li>Carbon monoxide alarm installed</li>
                    <li>Smoke alarm installed</li>
                  </ul>
                </div>
                <div>
                  <strong>Cancellation policy</strong>
                  <ul>
                    <li>Free cancellation before check-in</li>
                    <li>After that, the first night is non-refundable</li>
                  </ul>
                </div>
              </div>
            </section>
          </div>

          {/* ── RIGHT COLUMN: Cost Calculator ────────────────────────── */}
          <aside className="details-right" aria-label="Cost calculator">
            <div className="cost-calculator">
              <div className="cost-calc__header">
                <span className="cost-calc__price">
                  <strong>${listing.price}</strong> / night
                </span>
                <span className="cost-calc__rating">
                  <FaStar size={12} color="#FF385C" /> {listing.rating} ({listing.reviews})
                </span>
              </div>

              {/* Date pickers */}
              <div className="cost-calc__dates">
                <div className="cost-calc__date-field">
                  <label className="cost-calc__label">CHECK-IN</label>
                  <DatePicker
                    selected={checkIn}
                    onChange={(date) => {
                      setCheckIn(date);
                      if (checkOut && date >= checkOut) setCheckOut(null);
                    }}
                    selectsStart
                    startDate={checkIn}
                    endDate={checkOut}
                    minDate={new Date()}
                    placeholderText="Add date"
                    className="cost-calc__date-input"
                    dateFormat="dd/MM/yyyy"
                    aria-label="Check-in date"
                  />
                </div>
                <div className="cost-calc__date-field">
                  <label className="cost-calc__label">CHECKOUT</label>
                  <DatePicker
                    selected={checkOut}
                    onChange={(date) => setCheckOut(date)}
                    selectsEnd
                    startDate={checkIn}
                    endDate={checkOut}
                    minDate={checkIn ? new Date(checkIn.getTime() + 86400000) : new Date()}
                    placeholderText="Add date"
                    className="cost-calc__date-input"
                    dateFormat="dd/MM/yyyy"
                    aria-label="Check-out date"
                  />
                </div>
              </div>

              {/* Guest count */}
              <div className="cost-calc__guests">
                <label className="cost-calc__label">GUESTS</label>
                <div className="cost-calc__guests-row">
                  <button
                    className="cost-calc__guest-btn"
                    onClick={() => setGuests((g) => Math.max(1, g - 1))}
                    aria-label="Remove guest"
                    disabled={guests <= 1}
                  >−</button>
                  <span className="cost-calc__guest-count">{guests} guest{guests !== 1 ? 's' : ''}</span>
                  <button
                    className="cost-calc__guest-btn"
                    onClick={() => setGuests((g) => Math.min(listing.guests, g + 1))}
                    aria-label="Add guest"
                    disabled={guests >= listing.guests}
                  >+</button>
                </div>
                <p className="cost-calc__guest-max">Max {listing.guests} guests</p>
              </div>

              {/* Reserve button */}
              <button
                className="cost-calc__reserve-btn"
                onClick={handleReserve}
                disabled={reserving}
                aria-busy={reserving}
              >
                {reserving ? 'Reserving…' : 'Reserve'}
              </button>

              {reservationError && (
                <p className="cost-calc__error" role="alert">{reservationError}</p>
              )}
              {reservationMsg && (
                <p className="cost-calc__success" role="status">{reservationMsg}</p>
              )}

              <p className="cost-calc__note">You won't be charged yet</p>

              {/* Cost breakdown — only shown when dates selected */}
              {totalNights > 0 && (
                <div className="cost-calc__breakdown">
                  <div className="cost-calc__line">
                    <span>${listing.price} × {totalNights} night{totalNights !== 1 ? 's' : ''}</span>
                    <span>${basePrice.toFixed(2)}</span>
                  </div>
                  {weeklyDiscountAmt > 0 && (
                    <div className="cost-calc__line cost-calc__line--discount">
                      <span>Weekly discount ({listing.weeklyDiscount}%)</span>
                      <span>−${weeklyDiscountAmt.toFixed(2)}</span>
                    </div>
                  )}
                  {cleaningFee > 0 && (
                    <div className="cost-calc__line">
                      <span>Cleaning fee</span>
                      <span>${cleaningFee.toFixed(2)}</span>
                    </div>
                  )}
                  {serviceFee > 0 && (
                    <div className="cost-calc__line">
                      <span>Airbnb service fee</span>
                      <span>${serviceFee.toFixed(2)}</span>
                    </div>
                  )}
                  {occupancyTaxes > 0 && (
                    <div className="cost-calc__line">
                      <span>Occupancy taxes and fees</span>
                      <span>${occupancyTaxes.toFixed(2)}</span>
                    </div>
                  )}
                  <hr className="cost-calc__divider" />
                  <div className="cost-calc__total">
                    <span>Total</span>
                    <span>${totalCost.toFixed(2)}</span>
                  </div>
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default LocationDetailsPage;
