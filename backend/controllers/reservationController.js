const { validationResult } = require('express-validator');

const Reservation = require('../models/Reservation');
const Accommodation = require('../models/Accommodation');

/* =====================================================
   CREATE RESERVATION
   POST /api/reservations
   Protected route
   ===================================================== */

const createReservation = async (req, res) => {
  try {
    /* =====================================================
       VALIDATION
       ===================================================== */

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const {
      accommodationId,
      checkIn,
      checkOut,
      guests,
    } = req.body;

    /* =====================================================
       VERIFY USER
       ===================================================== */

    if (!req.user || !req.user._id) {
      return res.status(401).json({
        message: 'Not authorised',
      });
    }

    /* =====================================================
       VERIFY ACCOMMODATION ID
       ===================================================== */

    if (!accommodationId) {
      return res.status(400).json({
        message: 'Accommodation ID is required',
      });
    }

    /* =====================================================
       FIND ACCOMMODATION
       ===================================================== */

    const accommodation = await Accommodation.findById(
      accommodationId
    );

    if (!accommodation) {
      return res.status(404).json({
        message: 'Accommodation not found',
      });
    }

    /* =====================================================
       VALIDATE GUEST COUNT
       ===================================================== */

    const guestCount = Number(guests);

    if (!Number.isInteger(guestCount) || guestCount < 1) {
      return res.status(400).json({
        message: 'At least 1 guest is required',
      });
    }

    if (guestCount > accommodation.guests) {
      return res.status(400).json({
        message: `This accommodation supports a maximum of ${accommodation.guests} guests`,
      });
    }

    /* =====================================================
       CONVERT DATES
       ===================================================== */

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    /* =====================================================
       VALIDATE DATE FORMAT
       ===================================================== */

    if (
      Number.isNaN(checkInDate.getTime()) ||
      Number.isNaN(checkOutDate.getTime())
    ) {
      return res.status(400).json({
        message: 'Invalid check-in or check-out date',
      });
    }

    /* =====================================================
       NORMALISE TIME
       Prevent time-of-day issues when comparing dates.
       ===================================================== */

    checkInDate.setHours(0, 0, 0, 0);
    checkOutDate.setHours(0, 0, 0, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (checkInDate < today) {
      return res.status(400).json({
        message: 'Check-in date cannot be in the past',
      });
    }

    /* =====================================================
       VALIDATE DATE ORDER
       ===================================================== */

    if (checkOutDate <= checkInDate) {
      return res.status(400).json({
        message: 'Check-out date must be after check-in date',
      });
    }

    /* =====================================================
       CALCULATE NUMBER OF NIGHTS
       ===================================================== */

    const millisecondsPerDay =
      1000 * 60 * 60 * 24;

    const totalNights = Math.ceil(
      (checkOutDate.getTime() -
        checkInDate.getTime()) /
        millisecondsPerDay
    );

    if (totalNights <= 0) {
      return res.status(400).json({
        message: 'Reservation must be at least 1 night',
      });
    }

    /* =====================================================
       CHECK FOR EXISTING RESERVATIONS
       
       A reservation overlaps when:

       existing check-in < requested check-out
       AND
       existing check-out > requested check-in
       ===================================================== */

    const existingReservation =
      await Reservation.findOne({
        accommodation: accommodationId,

        status: {
          $in: ['pending', 'confirmed'],
        },

        checkIn: {
          $lt: checkOutDate,
        },

        checkOut: {
          $gt: checkInDate,
        },
      });

    if (existingReservation) {
      return res.status(409).json({
        message:
          'This accommodation is already booked for some or all of those dates.',
      });
    }

    /* =====================================================
       PRICE CALCULATION
       ===================================================== */

    const pricePerNight =
      Number(accommodation.price) || 0;

    const basePrice =
      pricePerNight * totalNights;

    /* =====================================================
       WEEKLY DISCOUNT
       ===================================================== */

    const weeklyDiscountPercentage =
      Number(accommodation.weeklyDiscount) || 0;

    const weeklyDiscount =
      totalNights >= 7
        ? (basePrice *
            weeklyDiscountPercentage) /
          100
        : 0;

    /* =====================================================
       FEES
       ===================================================== */

    const cleaningFee =
      Number(accommodation.cleaningFee) || 0;

    const serviceFee =
      Number(accommodation.serviceFee) || 0;

    const occupancyTaxes =
      Number(accommodation.occupancyTaxes) || 0;

    /* =====================================================
       TOTAL
       ===================================================== */

    const totalCost =
      basePrice -
      weeklyDiscount +
      cleaningFee +
      serviceFee +
      occupancyTaxes;

    /* =====================================================
       HOST
       ===================================================== */

    const hostId = accommodation.host_id || null;

    /* =====================================================
       CREATE RESERVATION
       ===================================================== */

    const reservation =
      await Reservation.create({
        accommodation: accommodation._id,

        user: req.user._id,

        host_id: hostId,

        checkIn: checkInDate,

        checkOut: checkOutDate,

        guests: guestCount,

        pricePerNight,

        totalNights,

        weeklyDiscount,

        cleaningFee,

        serviceFee,

        occupancyTaxes,

        totalCost,

        status: 'confirmed',
      });

    /* =====================================================
       POPULATE RESPONSE
       ===================================================== */

    const populatedReservation =
      await Reservation.findById(
        reservation._id
      )
        .populate(
          'accommodation',
          'title location price images type guests bedrooms bathrooms'
        )
        .populate(
          'user',
          'username email'
        )
        .populate(
          'host_id',
          'username email'
        );

    /* =====================================================
       SUCCESS RESPONSE
       ===================================================== */

    return res.status(201).json({
      message: 'Reservation created successfully',

      reservation: populatedReservation,
    });
  } catch (err) {
    console.error(
      'createReservation error:',
      err
    );

    /* =====================================================
       MONGOOSE INVALID OBJECT ID
       ===================================================== */

    if (err.name === 'CastError') {
      return res.status(400).json({
        message: 'Invalid accommodation ID',
      });
    }

    /* =====================================================
       MONGOOSE VALIDATION ERROR
       ===================================================== */

    if (err.name === 'ValidationError') {
      return res.status(400).json({
        message: err.message,
      });
    }

    /* =====================================================
       SERVER ERROR
       ===================================================== */

    return res.status(500).json({
      message:
        'Server error creating reservation',
    });
  }
};


/* =====================================================
   GET USER RESERVATIONS

   GET /api/reservations/user
   Protected route
   ===================================================== */

const getReservationsByUser = async (
  req,
  res
) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({
        message: 'Not authorised',
      });
    }

    const reservations =
      await Reservation.find({
        user: req.user._id,
      })
        .populate(
          'accommodation',
          'title location price images type guests bedrooms bathrooms'
        )
        .sort({
          createdAt: -1,
        });

    return res.status(200).json({
      count: reservations.length,

      data: reservations,
    });
  } catch (err) {
    console.error(
      'getReservationsByUser error:',
      err
    );

    return res.status(500).json({
      message:
        'Server error fetching user reservations',
    });
  }
};


/* =====================================================
   GET HOST RESERVATIONS

   GET /api/reservations/host
   Protected route
   ===================================================== */

const getReservationsByHost = async (
  req,
  res
) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({
        message: 'Not authorised',
      });
    }

    const reservations =
      await Reservation.find({
        host_id: req.user._id,
      })
        .populate(
          'accommodation',
          'title location price images type'
        )
        .populate(
          'user',
          'username email'
        )
        .sort({
          createdAt: -1,
        });

    return res.status(200).json({
      count: reservations.length,

      data: reservations,
    });
  } catch (err) {
    console.error(
      'getReservationsByHost error:',
      err
    );

    return res.status(500).json({
      message:
        'Server error fetching host reservations',
    });
  }
};


/* =====================================================
   DELETE / CANCEL RESERVATION

   DELETE /api/reservations/:id
   Protected route
   ===================================================== */

const deleteReservation = async (
  req,
  res
) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({
        message: 'Not authorised',
      });
    }

    const reservation =
      await Reservation.findById(
        req.params.id
      );

    if (!reservation) {
      return res.status(404).json({
        message: 'Reservation not found',
      });
    }

    /* =====================================================
       CHECK PERMISSIONS
       ===================================================== */

    const isOwner =
      reservation.user &&
      reservation.user.toString() ===
        req.user._id.toString();

    const isHost =
      reservation.host_id &&
      reservation.host_id.toString() ===
        req.user._id.toString();

    if (!isOwner && !isHost) {
      return res.status(403).json({
        message:
          'Not authorised to cancel this reservation',
      });
    }

    /* =====================================================
       CANCEL INSTEAD OF HARD DELETE
       ===================================================== */

    reservation.status = 'cancelled';

    await reservation.save();

    return res.status(200).json({
      message:
        'Reservation cancelled successfully',

      reservation,
    });
  } catch (err) {
    console.error(
      'deleteReservation error:',
      err
    );

    if (err.name === 'CastError') {
      return res.status(400).json({
        message:
          'Invalid reservation ID format',
      });
    }

    return res.status(500).json({
      message:
        'Server error cancelling reservation',
    });
  }
};


/* =====================================================
   EXPORT CONTROLLERS
   ===================================================== */

module.exports = {
  createReservation,
  getReservationsByHost,
  getReservationsByUser,
  deleteReservation,
};