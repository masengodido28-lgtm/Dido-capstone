const express = require('express');
const { body } = require('express-validator');
const {
  createReservation,
  getReservationsByHost,
  getReservationsByUser,
  deleteReservation,
} = require('../controllers/reservationController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// ─── Validation rules ────────────────────────────────────────────────────────
const reservationValidation = [
  body('accommodationId').notEmpty().withMessage('Accommodation ID is required'),
  body('checkIn').isISO8601().withMessage('Check-in must be a valid date'),
  body('checkOut').isISO8601().withMessage('Check-out must be a valid date'),
  body('guests').isInt({ min: 1 }).withMessage('At least 1 guest is required'),
];

// ─── Routes (all protected) ──────────────────────────────────────────────────

// POST /api/reservations
router.post('/', protect, reservationValidation, createReservation);

// GET /api/reservations/host
router.get('/host', protect, getReservationsByHost);

// GET /api/reservations/user
router.get('/user', protect, getReservationsByUser);

// DELETE /api/reservations/:id
router.delete('/:id', protect, deleteReservation);

module.exports = router;
