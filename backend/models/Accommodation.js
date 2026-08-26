const mongoose = require('mongoose');

/**
 * Accommodation Schema
 * Represents a property listing in the Airbnb clone.
 * Matches the data structure from the project brief.
 */
const accommodationSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },
    type: {
      type: String,
      required: [true, 'Accommodation type is required'],
      enum: [
        'Entire apartment',
        'Entire house',
        'Private room',
        'Shared room',
        'Hotel room',
        'Cabin',
        'Villa',
        'Cottage',
      ],
      default: 'Entire apartment',
    },
    price: {
      type: Number,
      required: [true, 'Price per night is required'],
      min: [0, 'Price cannot be negative'],
    },
    bedrooms: {
      type: Number,
      required: [true, 'Number of bedrooms is required'],
      min: [0, 'Bedrooms cannot be negative'],
    },
    bathrooms: {
      type: Number,
      required: [true, 'Number of bathrooms is required'],
      min: [0, 'Bathrooms cannot be negative'],
    },
    guests: {
      type: Number,
      required: [true, 'Number of guests is required'],
      min: [1, 'At least 1 guest is required'],
    },
    amenities: {
      type: [String],
      default: [],
    },
    images: {
      type: [String], // Array of image URLs or file paths
      default: [],
    },
    weeklyDiscount: {
      type: Number,
      default: 0,
      min: [0, 'Weekly discount cannot be negative'],
      max: [100, 'Weekly discount cannot exceed 100%'],
    },
    cleaningFee: {
      type: Number,
      default: 0,
      min: [0, 'Cleaning fee cannot be negative'],
    },
    serviceFee: {
      type: Number,
      default: 0,
      min: [0, 'Service fee cannot be negative'],
    },
    occupancyTaxes: {
      type: Number,
      default: 0,
      min: [0, 'Occupancy taxes cannot be negative'],
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    reviews: {
      type: Number,
      default: 0,
    },
    host: {
      type: String,
      trim: true,
    },
    host_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    enhancedCleaning: {
      type: Boolean,
      default: false,
    },
    selfCheckIn: {
      type: Boolean,
      default: false,
    },
    specificRatings: {
      cleanliness: { type: Number, default: 0, min: 0, max: 5 },
      communication: { type: Number, default: 0, min: 0, max: 5 },
      checkIn: { type: Number, default: 0, min: 0, max: 5 },
      accuracy: { type: Number, default: 0, min: 0, max: 5 },
      location: { type: Number, default: 0, min: 0, max: 5 },
      value: { type: Number, default: 0, min: 0, max: 5 },
    },
  },
  {
    timestamps: true, // createdAt, updatedAt
  }
);

// Index for faster location-based queries
accommodationSchema.index({ location: 1 });
accommodationSchema.index({ price: 1 });

module.exports = mongoose.model('Accommodation', accommodationSchema);
