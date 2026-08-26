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
const { protect } = require('../middleware/auth');

const router = express.Router();

// ─── Multer configuration for image uploads ─────────────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // store in /uploads folder
  },
  filename: (req, file, cb) => {
    // Unique filename: fieldname-timestamp.ext
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  // Accept only image files
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB limit per file
});

// ─── Validation rules ────────────────────────────────────────────────────────
const accommodationValidation = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('location').trim().notEmpty().withMessage('Location is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('price').isNumeric().withMessage('Price must be a number'),
  body('bedrooms').isInt({ min: 0 }).withMessage('Bedrooms must be a non-negative integer'),
  body('bathrooms').isNumeric({ min: 0 }).withMessage('Bathrooms must be a non-negative number'),
  body('guests').isInt({ min: 1 }).withMessage('Guests must be at least 1'),
];

// ─── Routes ──────────────────────────────────────────────────────────────────

// GET /api/accommodations          — public
router.get('/', getAccommodations);

// GET /api/accommodations/:id      — public
router.get('/:id', getAccommodationById);

// POST /api/accommodations         — protected, supports image upload
router.post(
  '/',
  protect,
  upload.array('images', 10),
  accommodationValidation,
  createAccommodation
);

// PUT /api/accommodations/:id      — protected, supports image upload
router.put(
  '/:id',
  protect,
  upload.array('images', 10),
  accommodationValidation,
  updateAccommodation
);

// DELETE /api/accommodations/:id   — protected
router.delete('/:id', protect, deleteAccommodation);

module.exports = router;
