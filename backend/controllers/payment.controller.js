const Payment = require('../models/Payment');
const Booking = require('../models/Booking');

// @desc    Process payment for booking
// @route   POST /api/v1/payments
// @access  Private
exports.processPayment = async (req, res) => {
  try {
    const { bookingId, paymentMethod } = req.body;
    
    // Check if booking exists
    const booking = await Booking.findById(bookingId);
    
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
        error: 'Not authorized to make payment for this booking'
      });
    }
    
    // Check if payment is already completed
    if (booking.paymentStatus === 'completed') {
      return res.status(400).json({
        success: false,
        error: 'Payment is already completed for this booking'
      });
    }
    
    // Create payment record
    const payment = await Payment.create({
      booking: bookingId,
      user: req.user.id,
      amount: booking.totalPrice,
      paymentMethod,
      status: 'completed', // Assume payment is successful for simplicity
      transactionId: 'TXN' + Date.now() // Generate a simple transaction ID
    });
    
    // Update booking payment status
    booking.paymentStatus = 'completed';
    booking.status = 'confirmed';
    await booking.save();
    
    res.status(201).json({
      success: true,
      data: payment
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: err.message
    });
  }
};

// @desc    Get payment history for user
// @route   GET /api/v1/payments
// @access  Private
exports.getPayments = async (req, res) => {
  try {
    const payments = await Payment.find({ user: req.user.id })
      .populate({
        path: 'booking',
        select: 'status totalPrice'
      });
    
    res.status(200).json({
      success: true,
      count: payments.length,
      data: payments
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: err.message
    });
  }
};

// @desc    Get single payment
// @route   GET /api/v1/payments/:id
// @access  Private
exports.getPayment = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate({
        path: 'booking',
        select: 'status totalPrice passengers'
      });
    
    if (!payment) {
      return res.status(404).json({
        success: false,
        error: 'Payment not found'
      });
    }
    
    // Make sure user owns payment
    if (payment.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to access this payment'
      });
    }
    
    res.status(200).json({
      success: true,
      data: payment
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: err.message
    });
  }
};
