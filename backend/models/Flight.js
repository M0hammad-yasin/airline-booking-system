const mongoose = require('mongoose');

const FlightSchema = new mongoose.Schema({
  flightNumber: {
    type: String,
    required: [true, 'Please add a flight number'],
    unique: true,
    trim: true
  },
  airline: {
    type: String,
    required: [true, 'Please add airline name']
  },
  departureCity: {
    type: String,
    required: [true, 'Please add departure city']
  },
  arrivalCity: {
    type: String,
    required: [true, 'Please add arrival city']
  },
  departureTime: {
    type: Date,
    required: [true, 'Please add departure time']
  },
  arrivalTime: {
    type: Date,
    required: [true, 'Please add arrival time']
  },
  price: {
    type: Number,
    required: [true, 'Please add price']
  },
  availableSeats: {
    type: Number,
    required: [true, 'Please add available seats']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Method to check seat availability
FlightSchema.methods.checkAvailability = function(requestedSeats) {
  return this.availableSeats >= requestedSeats;
};

module.exports = mongoose.model('Flight', FlightSchema);
