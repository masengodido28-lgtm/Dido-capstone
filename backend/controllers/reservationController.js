const { validationResult } = require('express-validator');
const Reservation = require('../models/Reservation');
const Accommodation = require('../models/Accommodation');

/**
 * @route   POST /api/reservations
 * @desc    Create a new reservation
 * @access  Private (requires JWT)
 */
const createReservation = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
  }

  const { accommodationId, checkIn, checkOut, guests } = req.body;

  try {
    // Verify accommodation exists
    const accommodation = await Accommodation.findById(accommodationId);
    if (!accommodation) {
      return res.status(404).json({ message: 'Accommodation not found' });
    }

    // Validate guest count does not exceed maximum
    if (guests > accommodation.guests) {
      return res.status(400).json({
        message: `This accommodation supports a maximum of ${accommodation.guests} guests`,
      });
    }

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    // Validate date range
    if (checkOutDate <= checkInDate) {
      return res.status(400).json({ message: 'Check-out date must be after check-in date' });
    }

    // Calculate total nights
    const msPerDay = 1000 * 60 * 60 * 24;
    const totalNights = Math.ceil((checkOutDate - checkInDate) / msPerDay);

    // Calculate cost breakdown
    const basePrice = accommodation.price * totalNights;
    const weeklyDiscountAmount =
      totalNights >= 7
        ? (basePrice * (accommodation.weeklyDiscount || 0)) / 100
        : 0;
    const cleaningFee = accommodation.cleaningFee || 0;
    const serviceFee = accommodation.serviceFee || 0;
    const occupancyTaxes = accommodation.occupancyTaxes || 0;
    const totalCost = basePrice - weeklyDiscountAmount + cleaningFee + serviceFee + occupancyTaxes;

    const reservation = await Reservation.create({
      accommodation: accommodationId,
      user: req.user._id,
      host_id: accommodation.host_id,
      checkIn: checkInDate,
      checkOut: checkOutDate,
      guests: Number(guests),
      pricePerNight: accommodation.price,
      totalNights,
      weeklyDiscount: weeklyDiscountAmount,
      cleaningFee,
      serviceFee,
      occupancyTaxes,
      totalCost,
    });

    // Populate accommodation details in response
    const populated = await reservation.populate('accommodation', 'title location images type');

    res.status(201).json(populated);
  } catch (err) {
    console.error('createReservation error:', err.message);
    res.status(500).json({ message: 'Server error creating reservation' });
  }
};

/**
 * @route   GET /api/reservations/host
 * @desc    Get all reservations for the logged-in host's properties
 * @access  Private (requires JWT)
 */
const getReservationsByHost = async (req, res) => {
  try {
    const reservations = await Reservation.find({ host_id: req.user._id })
      .populate('accommodation', 'title location price images')
      .populate('user', 'username email')
      .sort({ createdAt: -1 });

    res.status(200).json({ count: reservations.length, data: reservations });
  } catch (err) {
    console.error('getReservationsByHost error:', err.message);
    res.status(500).json({ message: 'Server error fetching host reservations' });
  }
};

/**
 * @route   GET /api/reservations/user
 * @desc    Get all reservations made by the logged-in user
 * @access  Private (requires JWT)
 */
const getReservationsByUser = async (req, res) => {
  try {
    const reservations = await Reservation.find({ user: req.user._id })
      .populate('accommodation', 'title location price images type')
      .sort({ createdAt: -1 });

    res.status(200).json({ count: reservations.length, data: reservations });
  } catch (err) {
    console.error('getReservationsByUser error:', err.message);
    res.status(500).json({ message: 'Server error fetching user reservations' });
  }
};

/**
 * @route   DELETE /api/reservations/:id
 * @desc    Delete / cancel a reservation
 * @access  Private (requires JWT — only owner or host can delete)
 */
const deleteReservation = async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id);

    if (!reservation) {
      return res.status(404).json({ message: 'Reservation not found' });
    }

    // Only the user who made the reservation or the host can delete it
    const isOwner = reservation.user.toString() === req.user._id.toString();
    const isHost = reservation.host_id && reservation.host_id.toString() === req.user._id.toString();

    if (!isOwner && !isHost) {
      return res.status(403).json({ message: 'Not authorised to delete this reservation' });
    }

    await reservation.deleteOne();

    res.status(200).json({ message: 'Reservation cancelled successfully', id: req.params.id });
  } catch (err) {
    console.error('deleteReservation error:', err.message);
    if (err.kind === 'ObjectId') {
      return res.status(400).json({ message: 'Invalid reservation ID format' });
    }
    res.status(500).json({ message: 'Server error deleting reservation' });
  }
};

module.exports = {
  createReservation,
  getReservationsByHost,
  getReservationsByUser,
  deleteReservation,
};
