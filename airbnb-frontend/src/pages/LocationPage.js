import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaStar, FaMapMarkerAlt, FaBed, FaBath, FaUsers, FaWifi } from 'react-icons/fa';
import { accommodations } from '../data/accommodations';
import Footer from '../components/Footer';
import './LocationPage.css';

/**
 * LocationPage — displays location cards filtered by the selected location.
 * Shows: total count + location name heading, filter bar, and location cards.
 * Each card: image left, details right (type, name, amenities, rating, reviews, price).
 */

const FILTER_OPTIONS = ['All Types', 'Entire apartment', 'Entire house', 'Private room', 'Cabin', 'Villa', 'Cottage'];

const LocationPage = () => {
  const { location } = useParams();
  const navigate = useNavigate();
  const [filterType, setFilterType] = useState('All Types');
  const [listings, setListings] = useState([]);

  const decodedLocation = decodeURIComponent(location || '');

  useEffect(() => {
    // Filter from static data; in production this would hit /api/accommodations?location=...
    const filtered = accommodations.filter(
      (a) => a.location.toLowerCase() === decodedLocation.toLowerCase()
    );
    setListings(filtered);
    setFilterType('All Types');
  }, [decodedLocation]);

  const displayedListings = filterType === 'All Types'
    ? listings
    : listings.filter((l) => l.type === filterType);

  const amenityIcon = (amenity) => {
    if (amenity.includes('wifi')) return <FaWifi size={12} />;
    return null;
  };

  return (
    <div className="location-page">
      <div className="location-page__inner">

        {/* ── Heading ──────────────────────────────────────────────── */}
        <div className="location-page__heading">
          <h1 className="location-page__title">
            <FaMapMarkerAlt color="#FF385C" size={20} />
            {decodedLocation}
          </h1>
          <p className="location-page__count">
            {displayedListings.length} accommodation{displayedListings.length !== 1 ? 's' : ''} found
          </p>
        </div>

        {/* ── Filter bar ───────────────────────────────────────────── */}
        <div className="location-filter" role="navigation" aria-label="Filter by type">
          <span className="location-filter__label">Filter by type:</span>
          <div className="location-filter__options">
            {FILTER_OPTIONS.map((opt) => (
              <button
                key={opt}
                className={`location-filter__btn ${filterType === opt ? 'location-filter__btn--active' : ''}`}
                onClick={() => setFilterType(opt)}
                aria-pressed={filterType === opt}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        {/* ── No results ──────────────────────────────────────────── */}
        {displayedListings.length === 0 && (
          <div className="location-page__empty">
            <p>No accommodations found for <strong>{decodedLocation}</strong>.</p>
            <button className="btn-primary" onClick={() => navigate('/')}>
              Back to Home
            </button>
          </div>
        )}

        {/* ── Location Cards ───────────────────────────────────────── */}
        <div className="location-cards">
          {displayedListings.map((listing) => (
            <article
              key={listing._id}
              className="location-card"
              onClick={() => navigate(`/location/${encodeURIComponent(listing.location)}/${listing._id}`)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && navigate(`/location/${encodeURIComponent(listing.location)}/${listing._id}`)}
              aria-label={`View details for ${listing.title}`}
            >
              {/* Image — left column */}
              <div className="location-card__img-col">
                <img
                  src={listing.images[0]}
                  alt={listing.title}
                  className="location-card__img"
                  loading="lazy"
                  onError={(e) => { e.target.src = 'https://via.placeholder.com/300x220?text=No+Image'; }}
                />
              </div>

              {/* Details — right column */}
              <div className="location-card__details">
                <div className="location-card__type">{listing.type}</div>
                <h2 className="location-card__title">{listing.title}</h2>

                {/* Amenities */}
                <div className="location-card__amenities">
                  {listing.amenities.slice(0, 4).map((amenity) => (
                    <span key={amenity} className="location-card__amenity">
                      {amenityIcon(amenity)}
                      {amenity}
                    </span>
                  ))}
                  {listing.amenities.length > 4 && (
                    <span className="location-card__amenity">+{listing.amenities.length - 4} more</span>
                  )}
                </div>

                {/* Capacity */}
                <div className="location-card__capacity">
                  <span><FaBed size={12} /> {listing.bedrooms} bedroom{listing.bedrooms !== 1 ? 's' : ''}</span>
                  <span><FaBath size={12} /> {listing.bathrooms} bathroom{listing.bathrooms !== 1 ? 's' : ''}</span>
                  <span><FaUsers size={12} /> {listing.guests} guest{listing.guests !== 1 ? 's' : ''}</span>
                </div>

                {/* Rating + Price */}
                <div className="location-card__footer">
                  <div className="location-card__rating">
                    <FaStar size={13} color="#FF385C" />
                    <span>{listing.rating.toFixed(1)}</span>
                    <span className="location-card__reviews">({listing.reviews} reviews)</span>
                  </div>
                  <div className="location-card__price">
                    <span className="location-card__price-amount">${listing.price}</span>
                    <span className="location-card__price-unit"> / night</span>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default LocationPage;
