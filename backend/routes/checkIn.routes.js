const express = require('express');
const {
  performCheckIn,
  getCheckInStatus
} = require('../controllers/checkIn.controller');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.route('/:id')
  .get(protect, getCheckInStatus)
  .put(protect, performCheckIn);

module.exports = router;