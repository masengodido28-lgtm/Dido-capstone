import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api/axiosConfig';
import { FaArrowLeft, FaUpload } from 'react-icons/fa';
import './ListingForm.css';

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

const INITIAL = {
  title: '', location: '', description: '', type: 'Entire apartment',
  price: '', bedrooms: '', bathrooms: '', guests: '', amenities: [],
  weeklyDiscount: '', cleaningFee: '', serviceFee: '', occupancyTaxes: '',
  enhancedCleaning: false, selfCheckIn: false, rating: '', reviews: '',
};

const ListingForm = ({ mode }) => {
  const isEdit = mode === 'edit';
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState(INITIAL);
  const [images, setImages] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(isEdit);

  /* Pre-fill when editing */
  useEffect(() => {
    if (!isEdit) return;
    (async () => {
      try {
        const { data } = await api.get(`/api/accommodations/${id}`);
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
    })();
  }, [isEdit, id]);

  const validate = () => {
    const e = {};
    if (!formData.title.trim())       e.title       = 'Title is required';
    if (!formData.location.trim())    e.location    = 'Location is required';
    if (!formData.description.trim()) e.description = 'Description is required';
    if (!formData.price || isNaN(formData.price) || Number(formData.price) < 0)
      e.price = 'Valid price is required';
    if (formData.bedrooms === '' || isNaN(formData.bedrooms))
      e.bedrooms = 'Required';
    if (formData.bathrooms === '' || isNaN(formData.bathrooms))
      e.bathrooms = 'Required';
    if (!formData.guests || Number(formData.guests) < 1)
      e.guests = 'At least 1 guest';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(p => ({ ...p, [name]: type === 'checkbox' ? checked : value }));
    if (errors[name]) setErrors(p => ({ ...p, [name]: '' }));
    setServerError('');
  };

  const toggleAmenity = (a) =>
    setFormData(p => ({
      ...p,
      amenities: p.amenities.includes(a)
        ? p.amenities.filter(x => x !== a)
        : [...p.amenities, a],
    }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setServerError('');
    try {
      const fd = new FormData();
      Object.entries(formData).forEach(([k, v]) =>
        fd.append(k, k === 'amenities' ? JSON.stringify(v) : v)
      );
      images.forEach(f => fd.append('images', f));
      const cfg = { headers: { 'Content-Type': 'multipart/form-data' } };
      isEdit
        ? await api.put(`/api/accommodations/${id}`, fd, cfg)
        : await api.post('/api/accommodations', fd, cfg);
      navigate('/listings');
    } catch (err) {
      setServerError(err.response?.data?.message || 'Save failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) return (
    <div className="page-container">
      <div className="loading-spinner"><div className="spinner" /><p>Loading…</p></div>
    </div>
  );

  return (
    <div className="page-container">

      {/* ── Page header ── */}
      <div className="page-header">
        <div>
          <h1 className="page-title">{isEdit ? 'Edit Listing' : 'Create Listing'}</h1>
          <p className="page-subtitle">
            {isEdit ? 'Update the property details below.' : 'Fill in the details to add a new property.'}
          </p>
        </div>
        <button className="btn-secondary" onClick={() => navigate('/listings')}>
          <FaArrowLeft size={12} /> Back
        </button>
      </div>

      {serverError && (
        <div className="alert alert--error" role="alert">{serverError}</div>
      )}

      <form onSubmit={handleSubmit} noValidate>

        {/* ══ Row 1: two cards side by side ══ */}
        <div className="lf-grid-2">

          {/* Card: Basic Info */}
          <div className="lf-card">
            <h2 className="lf-card__title">Basic Info</h2>

            <div className="form-group">
              <label htmlFor="title" className="form-label">Title *</label>
              <input id="title" name="title" type="text"
                className={`form-input ${errors.title ? 'form-input--error' : ''}`}
                value={formData.title} onChange={handleChange}
                placeholder="e.g. Modern Apartment in New York" />
              {errors.title && <span className="form-error">{errors.title}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="location" className="form-label">Location *</label>
              <input id="location" name="location" type="text"
                className={`form-input ${errors.location ? 'form-input--error' : ''}`}
                value={formData.location} onChange={handleChange}
                placeholder="e.g. New York" />
              {errors.location && <span className="form-error">{errors.location}</span>}
            </div>

            <div className="form-row-2">
              <div className="form-group">
                <label htmlFor="type" className="form-label">Type</label>
                <select id="type" name="type"
                  className="form-input form-input--select"
                  value={formData.type} onChange={handleChange}>
                  {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
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

            <div className="form-group">
              <label htmlFor="description" className="form-label">Description *</label>
              <textarea id="description" name="description" rows={4}
                className={`form-input lf-textarea ${errors.description ? 'form-input--error' : ''}`}
                value={formData.description} onChange={handleChange}
                placeholder="Describe the property…" />
              {errors.description && <span className="form-error">{errors.description}</span>}
            </div>
          </div>

          {/* Card: Capacity */}
          <div className="lf-card">
            <h2 className="lf-card__title">Capacity</h2>

            <div className="form-row-3">
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

            <h2 className="lf-card__title" style={{ marginTop: '20px' }}>Fees &amp; Discounts</h2>

            <div className="form-row-2">
              <div className="form-group">
                <label htmlFor="weeklyDiscount" className="form-label">Weekly Discount (%)</label>
                <input id="weeklyDiscount" name="weeklyDiscount" type="number" min="0" max="100"
                  className="form-input" value={formData.weeklyDiscount}
                  onChange={handleChange} placeholder="0" />
              </div>
              <div className="form-group">
                <label htmlFor="cleaningFee" className="form-label">Cleaning Fee ($)</label>
                <input id="cleaningFee" name="cleaningFee" type="number" min="0"
                  className="form-input" value={formData.cleaningFee}
                  onChange={handleChange} placeholder="0" />
              </div>
            </div>

            <div className="form-row-2">
              <div className="form-group">
                <label htmlFor="serviceFee" className="form-label">Service Fee ($)</label>
                <input id="serviceFee" name="serviceFee" type="number" min="0"
                  className="form-input" value={formData.serviceFee}
                  onChange={handleChange} placeholder="0" />
              </div>
              <div className="form-group">
                <label htmlFor="occupancyTaxes" className="form-label">Occupancy Taxes ($)</label>
                <input id="occupancyTaxes" name="occupancyTaxes" type="number" min="0"
                  className="form-input" value={formData.occupancyTaxes}
                  onChange={handleChange} placeholder="0" />
              </div>
            </div>

            <div className="lf-checks">
              <label className="lf-check">
                <input type="checkbox" name="enhancedCleaning"
                  checked={formData.enhancedCleaning} onChange={handleChange} />
                <span>Enhanced Cleaning</span>
              </label>
              <label className="lf-check">
                <input type="checkbox" name="selfCheckIn"
                  checked={formData.selfCheckIn} onChange={handleChange} />
                <span>Self Check-In</span>
              </label>
            </div>
          </div>
        </div>

        {/* ══ Row 2: Amenities card (full width) ══ */}
        <div className="lf-card">
          <h2 className="lf-card__title">Amenities</h2>
          <div className="lf-amenities">
            {AMENITIES_OPTIONS.map(a => (
              <label
                key={a}
                className={`lf-amenity ${formData.amenities.includes(a) ? 'lf-amenity--on' : ''}`}
              >
                <input
                  type="checkbox"
                  checked={formData.amenities.includes(a)}
                  onChange={() => toggleAmenity(a)}
                />
                {a}
              </label>
            ))}
          </div>
        </div>

        {/* ══ Row 3: Images card ══ */}
        <div className="lf-card">
          <h2 className="lf-card__title">Images</h2>

          {isEdit && existingImages.length > 0 && (
            <div className="lf-existing">
              <p className="form-label">Current images</p>
              <div className="lf-existing__row">
                {existingImages.map((img, i) => (
                  <img
                    key={i}
                   src={img.startsWith('http') ? img : `${process.env.REACT_APP_API_URL || 'https://dido-capstone.onrender.com'}${img}`}
                    alt={`Listing ${i + 1}`}
                    className="lf-existing__thumb"
                    onError={e => { e.target.style.display = 'none'; }}
                  />
                ))}
              </div>
            </div>
          )}

          <label className="lf-upload" htmlFor="images">
            <FaUpload size={20} className="lf-upload__icon" />
            <span className="lf-upload__label">
              {images.length > 0
                ? `${images.length} file${images.length !== 1 ? 's' : ''} selected`
                : isEdit ? 'Upload new images (replaces current)' : 'Click to upload images'}
            </span>
            <span className="lf-upload__hint">PNG, JPG up to 5 MB each</span>
            <input
              id="images" type="file" accept="image/*" multiple
              onChange={e => setImages(Array.from(e.target.files))}
              className="lf-upload__input"
            />
          </label>
        </div>

        {/* ══ Form actions ══ */}
        <div className="lf-actions">
          <button type="button" className="btn-secondary" onClick={() => navigate('/listings')}>
            Cancel
          </button>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Listing'}
          </button>
        </div>

      </form>
    </div>
  );
};

export default ListingForm;
