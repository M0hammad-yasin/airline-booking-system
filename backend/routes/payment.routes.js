const express = require('express');
const {
  processPayment,
  getPayments,
  getPayment
} = require('../controllers/payment.controller');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.route('/')
  .get(protect, getPayments)
  .post(protect, processPayment);

router.route('/:id')
  .get(protect, getPayment);

module.exports = router;
