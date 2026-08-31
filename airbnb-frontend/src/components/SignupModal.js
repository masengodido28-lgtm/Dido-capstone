import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import './LoginModal.css';

const SignupModal = ({ onClose }) => {
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  });

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e = {};

    if (!formData.username.trim()) {
      e.username = 'Username is required';
    } else if (formData.username.trim().length < 2) {
      e.username = 'Username must be at least 2 characters';
    }

    if (!formData.email) {
      e.email = 'Email is required';
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      e.email = 'Invalid email';
    }

    if (!formData.password) {
      e.password = 'Password is required';
    } else if (formData.password.length < 6) {
      e.password = 'Password must be at least 6 characters';
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((p) => ({
      ...p,
      [name]: value
    }));

    if (errors[name]) {
      setErrors((p) => ({
        ...p,
        [name]: ''
      }));
    }

    setServerError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    setLoading(true);

    const result = await register(
      formData.username,
      formData.email,
      formData.password
    );

    setLoading(false);

    if (result.success) {
      onClose();
    } else {
      setServerError(result.message);
    }
  };

  return (
    <div
      className="modal-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Sign up"
    >
      <div
        className="modal-card"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="modal-close"
          onClick={onClose}
          aria-label="Close sign up"
        >
          ×
        </button>

        <h2 className="modal-title">Log in or sign up</h2>

        <hr className="modal-divider" />

        <h3 className="modal-welcome">Create your Airbnb account</h3>

        {serverError && (
          <div className="modal-error" role="alert">
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>

          <div className="form-group">
            <label htmlFor="signup-username" className="form-label">
              Username
            </label>

            <input
              id="signup-username"
              name="username"
              type="text"
              className={`form-input ${
                errors.username ? 'form-input--error' : ''
              }`}
              value={formData.username}
              onChange={handleChange}
              placeholder="Enter username"
              autoComplete="username"
            />

            {errors.username && (
              <span className="form-error">
                {errors.username}
              </span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="signup-email" className="form-label">
              Email
            </label>

            <input
              id="signup-email"
              name="email"
              type="email"
              className={`form-input ${
                errors.email ? 'form-input--error' : ''
              }`}
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter email"
              autoComplete="email"
            />

            {errors.email && (
              <span className="form-error">
                {errors.email}
              </span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="signup-password" className="form-label">
              Password
            </label>

            <input
              id="signup-password"
              name="password"
              type="password"
              className={`form-input ${
                errors.password ? 'form-input--error' : ''
              }`}
              value={formData.password}
              onChange={handleChange}
              placeholder="Create a password"
              autoComplete="new-password"
            />

            {errors.password && (
              <span className="form-error">
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
            {loading ? 'Creating account…' : 'Sign Up'}
          </button>

        </form>

        <p className="modal-hint">
          By signing up, you agree to our terms and conditions.
        </p>
      </div>
    </div>
  );
};

export default SignupModal;