import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import './ListingForm.css';

/**
 * ListingForm — shared form component used for both:
 *   - Creating a new listing (no :id param)
 *   - Updating an existing listing (:id param present, form pre-filled)
 *
 * Handles multipart/form-data for optional image uploads.
 */

const AMENITIES_OPTIONS = [
  'wifi', 'kitchen', 'free parking', 'air conditioning', 'pool', 'gym',
  'washing machine', 'dryer', 'hot tub', 'beach access', 'barbecue',
  'fireplace', 'balcony', 'elevator', 'self check-in', 'pet friendly',
  'ocean view', 'mountain view', 'hiking trails',
];

const TYPES = [
  'Entire apartment', 'Entire house', 'Private room',
  'Shared room', 'Hotel room', 'Cabin', 'Villa', 'Cottage',
];

const initialState = {
  title: '', location: '', description: '', type: 'Entire apartment',
  price: '', bedrooms: '', bathrooms: '', guests: '',
  amenities: [], weeklyDiscount: '', cleaningFee: '',
  serviceFee: '', occupancyTaxes: '', enhancedCleaning: false,
  selfCheckIn: false, rating: '', reviews: '',
};

const ListingForm = ({ mode }) => {
  const isEdit = mode === 'edit';
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState(initialState);
  const [images, setImages] = useState([]);     // new files to upload
  const [existingImages, setExistingImages] = useState([]); // current images
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(isEdit);

  // Pre-fill form when editing
  useEffect(() => {
    if (!isEdit) return;
    const fetchListing = async () => {
      try {
        const { data } = await axios.get(`/api/accommodations/${id}`);
        setFormData({
          title: data.title || '',
          location: data.location || '',
          description: data.description || '',
          type: data.type || 'Entire apartment',
          price: data.price ?? '',
          bedrooms: data.bedrooms ?? '',
          bathrooms: data.bathrooms ?? '',
          guests: data.guests ?? '',
          amenities: data.amenities || [],
          weeklyDiscount: data.weeklyDiscount ?? '',
          cleaningFee: data.cleaningFee ?? '',
          serviceFee: data.serviceFee ?? '',
          occupancyTaxes: data.occupancyTaxes ?? '',
          enhancedCleaning: data.enhancedCleaning || false,
          selfCheckIn: data.selfCheckIn || false,
          rating: data.rating ?? '',
          reviews: data.reviews ?? '',
        });
        setExistingImages(data.images || []);
      } catch {
        setServerError('Failed to load listing data.');
      } finally {
        setFetchLoading(false);
      }
    };
    fetchListing();
  }, [isEdit, id]);

  /** Validate required fields */
  const validate = () => {
    const e = {};
    if (!formData.title.trim()) e.title = 'Title is required';
    if (!formData.location.trim()) e.location = 'Location is required';
    if (!formData.description.trim()) e.description = 'Description is required';
    if (!formData.price || isNaN(formData.price) || Number(formData.price) < 0)
      e.price = 'Valid price is required';
    if (formData.bedrooms === '' || isNaN(formData.bedrooms))
      e.bedrooms = 'Number of bedrooms is required';
    if (formData.bathrooms === '' || isNaN(formData.bathrooms))
      e.bathrooms = 'Number of bathrooms is required';
    if (!formData.guests || Number(formData.guests) < 1)
      e.guests = 'At least 1 guest is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
    setServerError('');
  };

  const handleAmenityToggle = (amenity) => {
    setFormData((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter((a) => a !== amenity)
        : [...prev.amenities, amenity],
    }));
  };

  const handleImageChange = (e) => {
    setImages(Array.from(e.target.files));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setServerError('');

    try {
      // Build multipart form data
      const data = new FormData();
      Object.entries(formData).forEach(([key, val]) => {
        if (key === 'amenities') {
          data.append(key, JSON.stringify(val));
        } else {
          data.append(key, val);
        }
      });
      images.forEach((file) => data.append('images', file));

      if (isEdit) {
        await axios.put(`/api/accommodations/${id}`, data, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } else {
        await axios.post('/api/accommodations', data, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }

      navigate('/listings');
    } catch (err) {
      setServerError(err.response?.data?.message || 'Save failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <div className="page-container">
        <div className="loading-spinner"><div className="spinner" /><p>Loading listing…</p></div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="form-page">
        <div className="page-header">
          <div>
            <h1 className="page-title">{isEdit ? 'Edit Listing' : 'Create New Listing'}</h1>
            <p className="page-subtitle">
              {isEdit ? 'Update the details below and save.' : 'Fill in the details to add a new property.'}
            </p>
          </div>
          <button className="btn-secondary" onClick={() => navigate('/listings')}>
            ← Back to Listings
          </button>
        </div>

        {serverError && (
          <div className="alert alert--error" role="alert">{serverError}</div>
        )}

        <form onSubmit={handleSubmit} noValidate encType="multipart/form-data">
          {/* ── Section: Basic Info ─────────────────────────────────────── */}
          <div className="form-section">
            <h2 className="form-section__title">Basic Information</h2>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="title" className="form-label">Title *</label>
                <input id="title" name="title" type="text"
                  className={`form-input ${errors.title ? 'form-input--error' : ''}`}
                  value={formData.title} onChange={handleChange}
                  placeholder="Modern Apartment in New York" />
                {errors.title && <span className="form-error">{errors.title}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="location" className="form-label">Location *</label>
                <input id="location" name="location" type="text"
                  className={`form-input ${errors.location ? 'form-input--error' : ''}`}
                  value={formData.location} onChange={handleChange}
                  placeholder="New York" />
                {errors.location && <span className="form-error">{errors.location}</span>}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="description" className="form-label">Description *</label>
              <textarea id="description" name="description" rows={4}
                className={`form-input form-textarea ${errors.description ? 'form-input--error' : ''}`}
                value={formData.description} onChange={handleChange}
                placeholder="Describe the property…" />
              {errors.description && <span className="form-error">{errors.description}</span>}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="type" className="form-label">Property Type</label>
                <select id="type" name="type" className="form-input form-select"
                  value={formData.type} onChange={handleChange}>
                  {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="price" className="form-label">Price / night ($) *</label>
                <input id="price" name="price" type="number" min="0"
                  className={`form-input ${errors.price ? 'form-input--error' : ''}`}
                  value={formData.price} onChange={handleChange} placeholder="0" />
                {errors.price && <span className="form-error">{errors.price}</span>}
              </div>
            </div>
          </div>

          {/* ── Section: Capacity ───────────────────────────────────────── */}
          <div className="form-section">
            <h2 className="form-section__title">Capacity</h2>
            <div className="form-row form-row--thirds">
              <div className="form-group">
                <label htmlFor="bedrooms" className="form-label">Bedrooms *</label>
                <input id="bedrooms" name="bedrooms" type="number" min="0"
                  className={`form-input ${errors.bedrooms ? 'form-input--error' : ''}`}
                  value={formData.bedrooms} onChange={handleChange} placeholder="0" />
                {errors.bedrooms && <span className="form-error">{errors.bedrooms}</span>}
              </div>
              <div className="form-group">
                <label htmlFor="bathrooms" className="form-label">Bathrooms *</label>
                <input id="bathrooms" name="bathrooms" type="number" min="0" step="0.5"
                  className={`form-input ${errors.bathrooms ? 'form-input--error' : ''}`}
                  value={formData.bathrooms} onChange={handleChange} placeholder="0" />
                {errors.bathrooms && <span className="form-error">{errors.bathrooms}</span>}
              </div>
              <div className="form-group">
                <label htmlFor="guests" className="form-label">Max Guests *</label>
                <input id="guests" name="guests" type="number" min="1"
                  className={`form-input ${errors.guests ? 'form-input--error' : ''}`}
                  value={formData.guests} onChange={handleChange} placeholder="1" />
                {errors.guests && <span className="form-error">{errors.guests}</span>}
              </div>
            </div>
          </div>

          {/* ── Section: Fees ───────────────────────────────────────────── */}
          <div className="form-section">
            <h2 className="form-section__title">Fees &amp; Discounts</h2>
            <div className="form-row form-row--quarters">
              {[
                { id: 'weeklyDiscount', label: 'Weekly Discount (%)', placeholder: '0' },
                { id: 'cleaningFee', label: 'Cleaning Fee ($)', placeholder: '0' },
                { id: 'serviceFee', label: 'Service Fee ($)', placeholder: '0' },
                { id: 'occupancyTaxes', label: 'Occupancy Taxes ($)', placeholder: '0' },
              ].map(({ id, label, placeholder }) => (
                <div key={id} className="form-group">
                  <label htmlFor={id} className="form-label">{label}</label>
                  <input id={id} name={id} type="number" min="0"
                    className="form-input" value={formData[id]}
                    onChange={handleChange} placeholder={placeholder} />
                </div>
              ))}
            </div>

            <div className="form-row">
              <label className="form-checkbox">
                <input type="checkbox" name="enhancedCleaning"
                  checked={formData.enhancedCleaning} onChange={handleChange} />
                <span>Enhanced Cleaning Protocol</span>
              </label>
              <label className="form-checkbox">
                <input type="checkbox" name="selfCheckIn"
                  checked={formData.selfCheckIn} onChange={handleChange} />
                <span>Self Check-In</span>
              </label>
            </div>
          </div>

          {/* ── Section: Amenities ──────────────────────────────────────── */}
          <div className="form-section">
            <h2 className="form-section__title">Amenities</h2>
            <div className="amenities-grid">
              {AMENITIES_OPTIONS.map((amenity) => (
                <label key={amenity} className="amenity-chip">
                  <input
                    type="checkbox"
                    checked={formData.amenities.includes(amenity)}
                    onChange={() => handleAmenityToggle(amenity)}
                  />
                  <span>{amenity}</span>
                </label>
              ))}
            </div>
          </div>

          {/* ── Section: Images ─────────────────────────────────────────── */}
          <div className="form-section">
            <h2 className="form-section__title">Images</h2>

            {isEdit && existingImages.length > 0 && (
              <div className="existing-images">
                <p className="form-label">Current images:</p>
                <div className="existing-images__grid">
                  {existingImages.map((img, i) => (
                    <img
                      key={i}
                      src={img.startsWith('http') ? img : `http://localhost:5000${img}`}
                      alt={`Listing ${i + 1}`}
                      className="existing-images__thumb"
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  ))}
                </div>
              </div>
            )}

            <div className="form-group">
              <label htmlFor="images" className="form-label">
                {isEdit ? 'Upload new images (replaces current)' : 'Upload images'} (optional)
              </label>
              <input
                id="images"
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageChange}
                className="form-input-file"
              />
              {images.length > 0 && (
                <p className="form-hint">{images.length} file{images.length !== 1 ? 's' : ''} selected</p>
              )}
            </div>
          </div>

          {/* Submit */}
          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={() => navigate('/listings')}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={loading} aria-busy={loading}>
              {loading ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Listing'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ListingForm;
