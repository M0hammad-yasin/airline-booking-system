const Flight = require('../models/Flight');

// @desc    Get all flights with optional filtering
// @route   GET /api/v1/flights
// @access  Public
exports.getFlights = async (req, res) => {
  try {
    let query = {};
    
    // Build query based on filter parameters
    if (req.query.departureCity) {
      query.departureCity = req.query.departureCity;
    }
    
    if (req.query.arrivalCity) {
      query.arrivalCity = req.query.arrivalCity;
    }
    
    if (req.query.departureDate) {
      // Find flights departing on the specified date
      const departureDate = new Date(req.query.departureDate);
      const nextDay = new Date(departureDate);
      nextDay.setDate(nextDay.getDate() + 1);
      
      query.departureTime = {
        $gte: departureDate,
        $lt: nextDay
      };
    }

    const flights = await Flight.find(query);
    
    res.status(200).json({
      success: true,
      count: flights.length,
      data: flights
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: err.message
    });
  }
};

// @desc    Get single flight
// @route   GET /api/v1/flights/:id
// @access  Public
exports.getFlight = async (req, res) => {
  try {
    const flight = await Flight.findById(req.params.id);
    
    if (!flight) {
      return res.status(404).json({
        success: false,
        error: 'Flight not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: flight
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: err.message
    });
  }
};

// @desc    Create new flight
// @route   POST /api/v1/flights
// @access  Private (Admin)
exports.createFlight = async (req, res) => {
  try {
    const flight = await Flight.create(req.body);
    
    res.status(201).json({
      success: true,
      data: flight
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: err.message
    });
  }
};

// @desc    Update flight
// @route   PUT /api/v1/flights/:id
// @access  Private (Admin)
exports.updateFlight = async (req, res) => {
  try {
    const flight = await Flight.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    
    if (!flight) {
      return res.status(404).json({
        success: false,
        error: 'Flight not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: flight
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: err.message
    });
  }
};

// @desc    Delete flight
// @route   DELETE /api/v1/flights/:id
// @access  Private (Admin)
exports.deleteFlight = async (req, res) => {
  try {
    const flight = await Flight.findByIdAndDelete(req.params.id);
    
    if (!flight) {
      return res.status(404).json({
        success: false,
        error: 'Flight not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: err.message
    });
  }
};
