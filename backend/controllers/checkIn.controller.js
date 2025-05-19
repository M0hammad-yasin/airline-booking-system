const Booking = require('../models/Booking');

// @desc    Perform check-in for booking
// @route   PUT /api/v1/check-in/:id
// @access  Private
exports.performCheckIn = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate({
        path: 'flight',
        select: 'departureTime'
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
        error: 'Not authorized to check-in for this booking'
      });
    }
    
    // Check if payment is completed
    if (booking.paymentStatus !== 'completed') {
      return res.status(400).json({
        success: false,
        error: 'Payment must be completed before check-in'
      });
    }
    
    // Check if already checked in
    if (booking.checkInStatus) {
      return res.status(400).json({
        success: false,
        error: 'Already checked in'
      });
    }
    
    // Check if departure is within 24 hours
    const now = new Date();
    const departureTime = new Date(booking.flight.departureTime);
    const timeDiff = departureTime.getTime() - now.getTime();
    const hoursDiff = timeDiff / (1000 * 3600);
    
    if (hoursDiff > 24) {
      return res.status(400).json({
        success: false,
        error: 'Check-in is only available within 24 hours of departure'
      });
    }
    
    if (hoursDiff < 0) {
      return res.status(400).json({
        success: false,
        error: 'Cannot check-in after departure'
      });
    }
    
    // Update check-in status
    booking.checkInStatus = true;
    await booking.save();
    
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

// @desc    Get check-in status
// @route   GET /api/v1/check-in/:id
// @access  Private
exports.getCheckInStatus = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate({
        path: 'flight',
        select: 'flightNumber airline departureCity arrivalCity departureTime'
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
      data: {
        checkInStatus: booking.checkInStatus,
        flight: booking.flight,
        passengers: booking.passengers
      }
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: err.message
    });
  }
};
