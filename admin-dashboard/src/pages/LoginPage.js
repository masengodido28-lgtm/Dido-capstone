import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './LoginPage.css';

/**
 * LoginPage — admin login form.
 * Fields: email + password with client-side validation.
 * On success → redirects to dashboard (/listings).
 */
const LoginPage = () => {
  const { login, user } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  // If already logged in, skip login page
  if (user) return <Navigate to="/listings" replace />;

  /** Validate form fields, return true if valid */
  const validate = () => {
    const newErrors = {};
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear field error on change
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
    setServerError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setServerError('');

    const result = await login(formData.email, formData.password);

    setLoading(false);
    if (result.success) {
      navigate('/listings');
    } else {
      setServerError(result.message);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        {/* Header */}
        <div className="login-card__header">
          <svg viewBox="0 0 32 32" className="login-card__logo" aria-hidden="true">
            <path
              d="M16 1C7.716 1 1 7.716 1 16s6.716 15 15 15 15-6.716 15-15S24.284 1 16 1zm0 5.5c1.38 0 2.5 1.12 2.5 2.5S17.38 11.5 16 11.5 13.5 10.38 13.5 9s1.12-2.5 2.5-2.5zm6 14.25c0 .414-.336.75-.75.75H10.75a.75.75 0 01-.75-.75v-.5c0-.414.336-.75.75-.75H11v-5h-.25a.75.75 0 01-.75-.75v-.5c0-.414.336-.75.75-.75h4.5c.414 0 .75.336.75.75V20h.5v-6.25h-.25a.75.75 0 01-.75-.75v-.5c0-.414.336-.75.75-.75h4.5c.414 0 .75.336.75.75V20h.25c.414 0 .75.336.75.75v.5z"
              fill="#FF385C"
            />
          </svg>
          <h1 className="login-card__title">Welcome back</h1>
          <p className="login-card__subtitle">Sign in to your admin dashboard</p>
        </div>

        {/* Server error banner */}
        {serverError && (
          <div className="login-card__error-banner" role="alert">
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          {/* Email */}
          <div className="form-group">
            <label htmlFor="email" className="form-label">Email address</label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              value={formData.email}
              onChange={handleChange}
              className={`form-input ${errors.email ? 'form-input--error' : ''}`}
              placeholder="admin@airbnb.com"
              aria-describedby={errors.email ? 'email-error' : undefined}
            />
            {errors.email && (
              <span id="email-error" className="form-error" role="alert">
                {errors.email}
              </span>
            )}
          </div>

          {/* Password */}
          <div className="form-group">
            <label htmlFor="password" className="form-label">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              value={formData.password}
              onChange={handleChange}
              className={`form-input ${errors.password ? 'form-input--error' : ''}`}
              placeholder="••••••••"
              aria-describedby={errors.password ? 'password-error' : undefined}
            />
            {errors.password && (
              <span id="password-error" className="form-error" role="alert">
                {errors.password}
              </span>
            )}
          </div>

          <button
            type="submit"
            className="btn-primary btn-full"
            disabled={loading}
            aria-busy={loading}
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <p className="login-card__hint">
          Demo: <strong>admin@airbnb.com</strong> / <strong>password123</strong>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
