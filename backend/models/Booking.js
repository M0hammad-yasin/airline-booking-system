const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  flight: {
    type: mongoose.Schema.ObjectId,
    ref: 'Flight',
    required: true
  },
  passengers: [{
    name: {
      type: String,
      required: [true, 'Please add passenger name']
    },
    email: {
      type: String,
      required: [true, 'Please add passenger email']
    },
    passportNumber: {
      type: String,
      required: [true, 'Please add passport number']
    }
  }],
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled'],
    default: 'pending'
  },
  totalPrice: {
    type: Number,
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending'
  },
  checkInStatus: {
    type: Boolean,
    default: false
  },
  bookingDate: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Booking', BookingSchema);
