import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaStar, FaMapMarkerAlt, FaBed, FaBath, FaUsers, FaWifi } from 'react-icons/fa';
import api from '../api/axiosConfig';
import Footer from '../components/Footer';
import './LocationPage.css';

const FILTER_OPTIONS = [
  'All Types',
  'Entire apartment',
  'Entire house',
  'Private room',
  'Cabin',
  'Villa',
  'Cottage'
];

const LocationPage = () => {
  const { location } = useParams();
  const navigate = useNavigate();

  const [filterType, setFilterType] = useState('All Types');
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const decodedLocation = decodeURIComponent(location || '');

  useEffect(() => {
    const fetchAccommodations = async () => {
      try {
        setLoading(true);
        setError('');

        const { data } = await api.get(
          `/api/accommodations?location=${encodeURIComponent(decodedLocation)}`
        );

        setListings(data.data || []);
        setFilterType('All Types');
      } catch (err) {
        console.error('Failed to fetch accommodations:', err);

        setError(
          err.response?.data?.message ||
          'Failed to load accommodations.'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchAccommodations();
  }, [decodedLocation]);

  const displayedListings =
    filterType === 'All Types'
      ? listings
      : listings.filter((listing) => listing.type === filterType);

  const amenityIcon = (amenity) => {
    if (amenity.toLowerCase().includes('wifi')) {
      return <FaWifi size={12} />;
    }

    return null;
  };

  if (loading) {
    return (
      <div className="location-page">
        <div className="location-page__inner">
          <div className="location-page__empty">
            <p>Loading accommodations...</p>
          </div>
        </div>

        <Footer />
      </div>
    );
  }

  return (
    <div className="location-page">
      <div className="location-page__inner">

        {/* Heading */}
        <div className="location-page__heading">
          <h1 className="location-page__title">
            <FaMapMarkerAlt color="#FF385C" size={20} />
            {decodedLocation}
          </h1>

          <p className="location-page__count">
            {displayedListings.length} accommodation
            {displayedListings.length !== 1 ? 's' : ''} found
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="location-page__empty">
            <p>{error}</p>

            <button
              className="btn-primary"
              onClick={() => navigate('/')}
            >
              Back to Home
            </button>
          </div>
        )}

        {/* Filter bar */}
        {!error && (
          <div
            className="location-filter"
            role="navigation"
            aria-label="Filter by type"
          >
            <span className="location-filter__label">
              Filter by type:
            </span>

            <div className="location-filter__options">
              {FILTER_OPTIONS.map((option) => (
                <button
                  key={option}
                  className={`location-filter__btn ${
                    filterType === option
                      ? 'location-filter__btn--active'
                      : ''
                  }`}
                  onClick={() => setFilterType(option)}
                  aria-pressed={filterType === option}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* No results */}
        {!error && displayedListings.length === 0 && (
          <div className="location-page__empty">
            <p>
              No accommodations found for{' '}
              <strong>{decodedLocation}</strong>.
            </p>

            <button
              className="btn-primary"
              onClick={() => navigate('/')}
            >
              Back to Home
            </button>
          </div>
        )}

        {/* Location Cards */}
        {!error && displayedListings.length > 0 && (
          <div className="location-cards">
            {displayedListings.map((listing) => (
              <article
                key={listing._id}
                className="location-card"
                onClick={() =>
                  navigate(
                    `/location/${encodeURIComponent(
                      listing.location
                    )}/${listing._id}`
                  )
                }
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    navigate(
                      `/location/${encodeURIComponent(
                        listing.location
                      )}/${listing._id}`
                    );
                  }
                }}
                aria-label={`View details for ${listing.title}`}
              >

                {/* Image */}
                <div className="location-card__img-col">
                  <img
                    src={listing.images?.[0]}
                    alt={listing.title}
                    className="location-card__img"
                    loading="lazy"
                    onError={(e) => {
                      e.target.src =
                        'https://via.placeholder.com/300x220?text=No+Image';
                    }}
                  />
                </div>

                {/* Details */}
                <div className="location-card__details">

                  <div className="location-card__type">
                    {listing.type}
                  </div>

                  <h2 className="location-card__title">
                    {listing.title}
                  </h2>

                  {/* Amenities */}
                  <div className="location-card__amenities">
                    {(listing.amenities || [])
                      .slice(0, 4)
                      .map((amenity) => (
                        <span
                          key={amenity}
                          className="location-card__amenity"
                        >
                          {amenityIcon(amenity)}
                          {amenity}
                        </span>
                      ))}

                    {(listing.amenities || []).length > 4 && (
                      <span className="location-card__amenity">
                        +{listing.amenities.length - 4} more
                      </span>
                    )}
                  </div>

                  {/* Capacity */}
                  <div className="location-card__capacity">
                    <span>
                      <FaBed size={12} />{' '}
                      {listing.bedrooms} bedroom
                      {listing.bedrooms !== 1 ? 's' : ''}
                    </span>

                    <span>
                      <FaBath size={12} />{' '}
                      {listing.bathrooms} bathroom
                      {listing.bathrooms !== 1 ? 's' : ''}
                    </span>

                    <span>
                      <FaUsers size={12} />{' '}
                      {listing.guests} guest
                      {listing.guests !== 1 ? 's' : ''}
                    </span>
                  </div>

                  {/* Rating + Price */}
                  <div className="location-card__footer">

                    <div className="location-card__rating">
                      <FaStar
                        size={13}
                        color="#FF385C"
                      />

                      <span>
                        {Number(listing.rating || 0).toFixed(1)}
                      </span>

                      <span className="location-card__reviews">
                        ({listing.reviews || 0} reviews)
                      </span>
                    </div>

                    <div className="location-card__price">
                      <span className="location-card__price-amount">
                        ${listing.price}
                      </span>

                      <span className="location-card__price-unit">
                        {' '} / night
                      </span>
                    </div>

                  </div>

                </div>
              </article>
            ))}
          </div>
        )}

      </div>

      <Footer />
    </div>
  );
};

export default LocationPage;