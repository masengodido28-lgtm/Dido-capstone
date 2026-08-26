const express = require('express');
const { body } = require('express-validator');
const { loginUser, registerUser, getMe } = require('../controllers/userController');
const { protect } = require('../middleware/auth');

const router = express.Router();

/**
 * Validation rules for login
 */
const loginValidation = [
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').notEmpty().withMessage('Password is required'),
];

/**
 * Validation rules for registration
 */
const registerValidation = [
  body('username')
    .trim()
    .isLength({ min: 2 })
    .withMessage('Username must be at least 2 characters'),
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
];

// POST /api/users/login
router.post('/login', loginValidation, loginUser);

// POST /api/users/register
router.post('/register', registerValidation, registerUser);

// GET /api/users/me  (protected)
router.get('/me', protect, getMe);

module.exports = router;
