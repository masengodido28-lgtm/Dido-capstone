
const jwt = require('jsonwebtoken');

const { validationResult } = require('express-validator');

const User = require('../models/User');

/**
 * Generate a signed JWT for a given user ID.
 *
 * Token expires in 7 days.
 */
const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET,
    {
      expiresIn: '7d'
    }
  );
};

/**
 * @route   POST /api/users/login
 * @desc    Authenticate user and return JWT
 * @access  Public
 */
const loginUser = async (req, res) => {

  // Validate request body
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const { email, password } = req.body;

  try {

    // Find user by email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        message: 'Invalid email or password'
      });
    }

    // Compare provided password
    // with the hashed password
    const isMatch =
      await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({
        message: 'Invalid email or password'
      });
    }

    /**
     * Return user information and JWT.
     *
     * The role is included so the frontend
     * knows whether this is an admin.
     */
    return res.status(200).json({
      _id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      token: generateToken(user._id)
    });

  } catch (err) {

    console.error(
      'Login error:',
      err.message
    );

    return res.status(500).json({
      message: 'Server error during login'
    });
  }
};

/**
 * @route   POST /api/users/register
 * @desc    Register a new normal user
 * @access  Public
 *
 * IMPORTANT:
 * Public registration NEVER accepts a role
 * from the client.
 *
 * Every newly registered account starts as
 * role: 'user'.
 */
const registerUser = async (req, res) => {

  // Validate request body
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const {
    username,
    email,
    password
  } = req.body;

  try {

    // Check if user already exists
    const existingUser =
      await User.findOne({ email });

    if (existingUser) {
      return res.status(409).json({
        message:
          'A user with this email already exists'
      });
    }

    /**
     * Always create public registrations
     * as normal users.
     *
     * Do NOT accept role from req.body.
     */
    const user = await User.create({
      username,
      email,
      password,
      role: 'user'
    });

    return res.status(201).json({
      _id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      token: generateToken(user._id)
    });

  } catch (err) {

    console.error(
      'Register error:',
      err.message
    );

    return res.status(500).json({
      message: 'Server error during registration'
    });
  }
};

/**
 * @route   GET /api/users/me
 * @desc    Get current logged-in user profile
 * @access  Private
 */
const getMe = async (req, res) => {

  try {

    const user = await User
      .findById(req.user._id)
      .select('-password');

    if (!user) {
      return res.status(404).json({
        message: 'User not found'
      });
    }

    return res.status(200).json(user);

  } catch (err) {

    console.error(
      'getMe error:',
      err.message
    );

    return res.status(500).json({
      message:
        'Server error fetching profile'
    });
  }
};

module.exports = {
  loginUser,
  registerUser,
  getMe
};

