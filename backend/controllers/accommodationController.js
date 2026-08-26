const { validationResult } = require('express-validator');
const Accommodation = require('../models/Accommodation');

/**
 * @route   GET /api/accommodations
 * @desc    Get all accommodation listings (supports ?location= filter)
 * @access  Public
 */
const getAccommodations = async (req, res) => {
  try {
    const filter = {};

    // Optional query filter by location (case-insensitive)
    if (req.query.location) {
      filter.location = { $regex: req.query.location, $options: 'i' };
    }

    const accommodations = await Accommodation.find(filter).sort({ createdAt: -1 });

    res.status(200).json({
      count: accommodations.length,
      data: accommodations,
    });
  } catch (err) {
    console.error('getAccommodations error:', err.message);
    res.status(500).json({ message: 'Server error fetching accommodations' });
  }
};

/**
 * @route   GET /api/accommodations/:id
 * @desc    Get a single accommodation by ID
 * @access  Public
 */
const getAccommodationById = async (req, res) => {
  try {
    const accommodation = await Accommodation.findById(req.params.id);

    if (!accommodation) {
      return res.status(404).json({ message: 'Accommodation not found' });
    }

    res.status(200).json(accommodation);
  } catch (err) {
    console.error('getAccommodationById error:', err.message);
    // Handle invalid ObjectId format
    if (err.kind === 'ObjectId') {
      return res.status(400).json({ message: 'Invalid accommodation ID format' });
    }
    res.status(500).json({ message: 'Server error fetching accommodation' });
  }
};

/**
 * @route   POST /api/accommodations
 * @desc    Create a new accommodation listing
 * @access  Private (requires JWT)
 */
const createAccommodation = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
  }

  try {
    const {
      title, location, description, type, price,
      bedrooms, bathrooms, guests, amenities,
      weeklyDiscount, cleaningFee, serviceFee, occupancyTaxes,
      enhancedCleaning, selfCheckIn, rating, reviews,
      specificRatings,
    } = req.body;

    // Handle uploaded images (multer stores files in req.files)
    let images = [];
    if (req.files && req.files.length > 0) {
      images = req.files.map((file) => `/uploads/${file.filename}`);
    } else if (req.body.images) {
      // Allow passing image URLs as JSON array string or array
      images = Array.isArray(req.body.images)
        ? req.body.images
        : JSON.parse(req.body.images);
    }

    // Parse amenities if sent as JSON string
    let parsedAmenities = amenities;
    if (typeof amenities === 'string') {
      try { parsedAmenities = JSON.parse(amenities); } catch { parsedAmenities = [amenities]; }
    }

    const accommodation = await Accommodation.create({
      title,
      location,
      description,
      type,
      price: Number(price),
      bedrooms: Number(bedrooms),
      bathrooms: Number(bathrooms),
      guests: Number(guests),
      amenities: parsedAmenities || [],
      images,
      weeklyDiscount: Number(weeklyDiscount) || 0,
      cleaningFee: Number(cleaningFee) || 0,
      serviceFee: Number(serviceFee) || 0,
      occupancyTaxes: Number(occupancyTaxes) || 0,
      enhancedCleaning: enhancedCleaning === 'true' || enhancedCleaning === true,
      selfCheckIn: selfCheckIn === 'true' || selfCheckIn === true,
      rating: Number(rating) || 0,
      reviews: Number(reviews) || 0,
      host: req.user ? req.user.username : '',
      host_id: req.user ? req.user._id : null,
      specificRatings: specificRatings || {},
    });

    res.status(201).json(accommodation);
  } catch (err) {
    console.error('createAccommodation error:', err.message);
    res.status(500).json({ message: 'Server error creating accommodation' });
  }
};

/**
 * @route   PUT /api/accommodations/:id
 * @desc    Update an existing accommodation listing
 * @access  Private (requires JWT)
 */
const updateAccommodation = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
  }

  try {
    const accommodation = await Accommodation.findById(req.params.id);

    if (!accommodation) {
      return res.status(404).json({ message: 'Accommodation not found' });
    }

    // Handle image updates
    let images = accommodation.images; // keep existing images by default
    if (req.files && req.files.length > 0) {
      images = req.files.map((file) => `/uploads/${file.filename}`);
    } else if (req.body.images) {
      images = Array.isArray(req.body.images)
        ? req.body.images
        : JSON.parse(req.body.images);
    }

    // Parse amenities if sent as string
    let parsedAmenities = req.body.amenities;
    if (typeof parsedAmenities === 'string') {
      try { parsedAmenities = JSON.parse(parsedAmenities); } catch { parsedAmenities = [parsedAmenities]; }
    }

    // Build update object from request body
    const updateData = {
      ...req.body,
      images,
      amenities: parsedAmenities || accommodation.amenities,
    };

    // Convert numeric strings to numbers
    ['price', 'bedrooms', 'bathrooms', 'guests', 'weeklyDiscount', 'cleaningFee', 'serviceFee', 'occupancyTaxes'].forEach((field) => {
      if (updateData[field] !== undefined) {
        updateData[field] = Number(updateData[field]);
      }
    });

    const updated = await Accommodation.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    res.status(200).json(updated);
  } catch (err) {
    console.error('updateAccommodation error:', err.message);
    if (err.kind === 'ObjectId') {
      return res.status(400).json({ message: 'Invalid accommodation ID format' });
    }
    res.status(500).json({ message: 'Server error updating accommodation' });
  }
};

/**
 * @route   DELETE /api/accommodations/:id
 * @desc    Delete an accommodation listing
 * @access  Private (requires JWT)
 */
const deleteAccommodation = async (req, res) => {
  try {
    const accommodation = await Accommodation.findById(req.params.id);

    if (!accommodation) {
      return res.status(404).json({ message: 'Accommodation not found' });
    }

    await accommodation.deleteOne();

    res.status(200).json({ message: 'Accommodation deleted successfully', id: req.params.id });
  } catch (err) {
    console.error('deleteAccommodation error:', err.message);
    if (err.kind === 'ObjectId') {
      return res.status(400).json({ message: 'Invalid accommodation ID format' });
    }
    res.status(500).json({ message: 'Server error deleting accommodation' });
  }
};

module.exports = {
  getAccommodations,
  getAccommodationById,
  createAccommodation,
  updateAccommodation,
  deleteAccommodation,
};
