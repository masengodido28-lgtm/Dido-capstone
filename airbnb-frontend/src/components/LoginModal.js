import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import './LoginModal.css';

/**
 * LoginModal — slide-in modal for user authentication.
 * Shown from the profile dropdown in TopHeader.
 * On success, closes the modal and updates the auth state.
 */
const LoginModal = ({ onClose }) => {
  const { login } = useAuth();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e = {};
    if (!formData.email) e.email = 'Email is required';
    else if (!/^\S+@\S+\.\S+$/.test(formData.email)) e.email = 'Invalid email';
    if (!formData.password) e.password = 'Password is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: '' }));
    setServerError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    const result = await login(formData.email, formData.password);
    setLoading(false);
    if (result.success) {
      onClose();
    } else {
      setServerError(result.message);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-label="Login">
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Close login">×</button>
        <h2 className="modal-title">Log in or sign up</h2>
        <hr className="modal-divider" />
        <h3 className="modal-welcome">Welcome to Airbnb</h3>

        {serverError && (
          <div className="modal-error" role="alert">{serverError}</div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="modal-email" className="form-label">Email</label>
            <input id="modal-email" name="email" type="email"
              className={`form-input ${errors.email ? 'form-input--error' : ''}`}
              value={formData.email} onChange={handleChange}
              placeholder="Enter email" autoComplete="email" />
            {errors.email && <span className="form-error">{errors.email}</span>}
          </div>
          <div className="form-group">
            <label htmlFor="modal-password" className="form-label">Password</label>
            <input id="modal-password" name="password" type="password"
              className={`form-input ${errors.password ? 'form-input--error' : ''}`}
              value={formData.password} onChange={handleChange}
              placeholder="Enter password" autoComplete="current-password" />
            {errors.password && <span className="form-error">{errors.password}</span>}
          </div>
          <button type="submit" className="btn-primary btn-full" disabled={loading} aria-busy={loading}>
            {loading ? 'Logging in…' : 'Continue'}
          </button>
        </form>

        <p className="modal-hint">
          Demo: <strong>admin@airbnb.com</strong> / <strong>password123</strong>
        </p>
      </div>
    </div>
  );
};

export default LoginModal;
