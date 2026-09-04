
const mongoose = require('mongoose');

/**
 * Reservation Schema
 * Represents a booking made by a user for an accommodation.
 * Tracks check-in/check-out, guest count, and cost breakdown.
 */
const reservationSchema = new mongoose.Schema(
  {
    accommodation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Accommodation',
      required: [true, 'Accommodation reference is required'],
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
    },

    host_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },

    checkIn: {
      type: Date,
      required: [true, 'Check-in date is required'],
    },

    checkOut: {
      type: Date,
      required: [true, 'Check-out date is required'],
    },

    guests: {
      type: Number,
      required: [true, 'Number of guests is required'],
      min: [1, 'At least 1 guest required'],
    },

    // Cost breakdown snapshot at time of booking
    pricePerNight: {
      type: Number,
      required: true,
    },

    totalNights: {
      type: Number,
      required: true,
    },

    weeklyDiscount: {
      type: Number,
      default: 0,
    },

    cleaningFee: {
      type: Number,
      default: 0,
    },

    serviceFee: {
      type: Number,
      default: 0,
    },

    occupancyTaxes: {
      type: Number,
      default: 0,
    },

    totalCost: {
      type: Number,
      required: true,
    },

    status: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled'],
      default: 'confirmed',
    },
  },
  {
    timestamps: true,
  }
);

/**
 * Validate that checkOut is after checkIn before saving.
 */
reservationSchema.pre('save', function () {
  if (this.checkOut <= this.checkIn) {
    throw new Error('Check-out date must be after check-in date');
  }
});

// Indexes for fast host/user queries
reservationSchema.index({ host_id: 1 });
reservationSchema.index({ user: 1 });
reservationSchema.index({ accommodation: 1 });

module.exports = mongoose.model('Reservation', reservationSchema);

