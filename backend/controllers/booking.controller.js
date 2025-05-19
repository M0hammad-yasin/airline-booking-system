const Booking = require('../models/Booking');
const Flight = require('../models/Flight');

// @desc    Get all bookings for a user
// @route   GET /api/v1/bookings
// @access  Private
exports.getBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user.id })
      .populate({
        path: 'flight',
        select: 'flightNumber airline departureCity arrivalCity departureTime arrivalTime'
      });
    
    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: err.message
    });
  }
};

// @desc    Get single booking
// @route   GET /api/v1/bookings/:id
// @access  Private
exports.getBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate({
        path: 'flight',
        select: 'flightNumber airline departureCity arrivalCity departureTime arrivalTime'
      });
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        error: 'Booking not found'
      });
    }
    
    // Make sure user owns booking
    if (booking.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to access this booking'
      });
    }
    
    res.status(200).json({
      success: true,
      data: booking
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: err.message
    });
  }
};

// @desc    Create booking
// @route   POST /api/v1/bookings
// @access  Private
exports.createBooking = async (req, res) => {
  try {
    req.body.user = req.user.id;
    
    // Check if flight exists
    const flight = await Flight.findById(req.body.flight);
    
    if (!flight) {
      return res.status(404).json({
        success: false,
        error: 'Flight not found'
      });
    }
    
    // Check if there are enough seats available
    const passengerCount = req.body.passengers.length;
    
    if (!flight.checkAvailability(passengerCount)) {
      return res.status(400).json({
        success: false,
        error: 'Not enough seats available'
      });
    }
    
    // Calculate total price
    req.body.totalPrice = flight.price * passengerCount;
    
    // Create booking
    const booking = await Booking.create(req.body);
    
    // Update available seats
    flight.availableSeats -= passengerCount;
    await flight.save();
    
    res.status(201).json({
      success: true,
      data: booking
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: err.message
    });
  }
};

// @desc    Cancel booking
// @route   PUT /api/v1/bookings/:id/cancel
// @access  Private
exports.cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        error: 'Booking not found'
      });
    }
    
    // Make sure user owns booking
    if (booking.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to cancel this booking'
      });
    }
    
    // Check if booking is already cancelled
    if (booking.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        error: 'Booking is already cancelled'
      });
    }
    
    // Update booking status
    booking.status = 'cancelled';
    await booking.save();
    
    // Restore seats
    const flight = await Flight.findById(booking.flight);
    flight.availableSeats += booking.passengers.length;
    await flight.save();
    
    res.status(200).json({
      success: true,
      data: booking
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: err.message
    });
  }
};
