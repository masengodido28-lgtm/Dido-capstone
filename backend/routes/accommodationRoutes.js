
const express = require('express');

const { body } = require('express-validator');

const multer = require('multer');

const path = require('path');

const {
  getAccommodations,
  getAccommodationById,
  createAccommodation,
  updateAccommodation,
  deleteAccommodation,
} = require('../controllers/accommodationController');

const {
  protect,
  adminOnly
} = require('../middleware/auth');

const router = express.Router();

/* =========================================================
   MULTER CONFIGURATION
========================================================= */

const storage = multer.diskStorage({

  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },

  filename: (req, file, cb) => {

    // Create a unique filename
    const uniqueSuffix =
      Date.now() +
      '-' +
      Math.round(Math.random() * 1e9);

    cb(
      null,
      file.fieldname +
        '-' +
        uniqueSuffix +
        path.extname(file.originalname)
    );
  },
});

/* =========================================================
   IMAGE FILE FILTER
========================================================= */

const fileFilter = (req, file, cb) => {

  // Only allow image files
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(
      new Error('Only image files are allowed'),
      false
    );
  }
};

const upload = multer({

  storage,

  fileFilter,

  limits: {
    fileSize: 5 * 1024 * 1024
  },

});

/* =========================================================
   VALIDATION RULES
========================================================= */

const accommodationValidation = [

  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required'),

  body('location')
    .trim()
    .notEmpty()
    .withMessage('Location is required'),

  body('description')
    .trim()
    .notEmpty()
    .withMessage('Description is required'),

  body('price')
    .isNumeric()
    .withMessage('Price must be a number'),

  body('bedrooms')
    .isInt({ min: 0 })
    .withMessage(
      'Bedrooms must be a non-negative integer'
    ),

  body('bathrooms')
    .isNumeric({ min: 0 })
    .withMessage(
      'Bathrooms must be a non-negative number'
    ),

  body('guests')
    .isInt({ min: 1 })
    .withMessage(
      'Guests must be at least 1'
    ),

];

/* =========================================================
   PUBLIC ROUTES
========================================================= */

/**
 * GET /api/accommodations
 *
 * Anyone can view listings.
 */
router.get(
  '/',
  getAccommodations
);

/**
 * GET /api/accommodations/:id
 *
 * Anyone can view a specific listing.
 */
router.get(
  '/:id',
  getAccommodationById
);

/* =========================================================
   ADMIN ROUTES
========================================================= */

/**
 * POST /api/accommodations
 *
 * Only admins can create listings.
 */
router.post(
  '/',
  protect,
  adminOnly,
  upload.array('images', 10),
  accommodationValidation,
  createAccommodation
);

/**
 * PUT /api/accommodations/:id
 *
 * Only admins can edit listings.
 */
router.put(
  '/:id',
  protect,
  adminOnly,
  upload.array('images', 10),
  accommodationValidation,
  updateAccommodation
);

/**
 * DELETE /api/accommodations/:id
 *
 * Only admins can delete listings.
 */
router.delete(
  '/:id',
  protect,
  adminOnly,
  deleteAccommodation
);

module.exports = router;
