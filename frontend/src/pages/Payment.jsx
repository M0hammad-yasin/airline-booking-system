import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  Divider,
  Stepper,
  Step,
  StepLabel,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormLabel,
  List,
  ListItem,
  ListItemText,
  ListItemIcon
} from '@mui/material';
import {
  Flight as FlightIcon,
  Payment as PaymentIcon,
  CreditCard as CreditCardIcon,
  AccountBalance as BankIcon,
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon,
  Security as SecurityIcon,
  Person as PersonIcon,
  AttachMoney as MoneyIcon
} from '@mui/icons-material';
import { bookingAPI, paymentAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const Payment = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
  // Payment form state
  const [paymentMethod, setPaymentMethod] = useState('credit_card');
  const [paymentDetails, setPaymentDetails] = useState({
    cardNumber: '',
    cardholderName: '',
    expiryDate: '',
    cvv: '',
    billingAddress: '',
    city: '',
    zipCode: '',
    country: ''
  });

  useEffect(() => {
    const fetchBookingDetails = async () => {
      try {
        const data = await bookingAPI.getBooking(bookingId);
        setBooking(data);
      } catch (err) {
        console.error('Error fetching booking details:', err);
        setError('Failed to load booking details. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchBookingDetails();
  }, [bookingId]);

  const handlePaymentMethodChange = (event) => {
    setPaymentMethod(event.target.value);
  };

  const handlePaymentDetailsChange = (field, value) => {
    setPaymentDetails({
      ...paymentDetails,
      [field]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      // Process payment
      const paymentData = {
        bookingId,
        amount: booking.totalPrice,
        method: paymentMethod,
        details: paymentDetails
      };

      const result = await paymentAPI.processPayment(paymentData);
      
      if (result.success) {
        navigate(`/booking-confirmation/${bookingId}`);
      } else {
        setError(result.message || 'Payment failed');
      }
    } catch (err) {
      console.error('Error processing payment:', err);
      setError('Payment processing failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleBack = () => {
    navigate(`/booking/${booking?.flightId}`);
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error">{error}</Alert>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/my-bookings')}
          sx={{ mt: 2 }}
        >
          View My Bookings
        </Button>
      </Container>
    );
  }

  if (!booking) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="info">Booking not found</Alert>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/flights')}
          sx={{ mt: 2 }}
        >
          Back to Flight Search
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {/* Booking Process Stepper */}
      <Stepper activeStep={2} sx={{ mb: 4 }}>
        <Step>
          <StepLabel>Flight Selection</StepLabel>
        </Step>
        <Step>
          <StepLabel>Passenger Details</StepLabel>
        </Step>
        <Step>
          <StepLabel>Payment</StepLabel>
        </Step>
        <Step>
          <StepLabel>Confirmation</StepLabel>
        </Step>
      </Stepper>

      <Button
        startIcon={<ArrowBackIcon />}
        onClick={handleBack}
        sx={{ mb: 2 }}
      >
        Back to Passenger Details
      </Button>

      <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
        <PaymentIcon sx={{ mr: 1 }} /> Payment
      </Typography>

      {/* Booking Summary */}
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Booking Summary
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <List dense>
              <ListItem>
                <ListItemIcon>
                  <FlightIcon />
                </ListItemIcon>
                <ListItemText 
                  primary={`${booking.flight?.airline} - Flight ${booking.flight?.flightNumber}`}
                  secondary={`${booking.flight?.departureCity} to ${booking.flight?.arrivalCity}`}
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <PersonIcon />
                </ListItemIcon>
                <ListItemText 
                  primary={`Passengers: ${booking.passengers?.length}`}
                  secondary={booking.passengers?.map(p => `${p.firstName} ${p.lastName}`).join(', ')}
                />
              </ListItem>
            </List>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
              <Typography variant="body1">
                Subtotal: ${booking.flight?.price.toFixed(2)} x {booking.passengers?.length} passenger(s)
              </Typography>
              <Typography variant="body1">
                Taxes & Fees: ${(booking.totalPrice * 0.1).toFixed(2)}
              </Typography>
              <Divider sx={{ width: '100%', my: 1 }} />
              <Typography variant="h6" color="primary" sx={{ display: 'flex', alignItems: 'center' }}>
                <MoneyIcon sx={{ mr: 1 }} />
                Total: ${booking.totalPrice.toFixed(2)}
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      <Box component="form" onSubmit={handleSubmit}>
        {/* Payment Method Selection */}
        <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Payment Method
          </Typography>
          <FormControl component="fieldset">
            <RadioGroup
              name="payment-method"
              value={paymentMethod}
              onChange={handlePaymentMethodChange}
            >
              <FormControlLabel 
                value="credit_card" 
                control={<Radio />} 
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <CreditCardIcon sx={{ mr: 1 }} />
                    Credit/Debit Card
                  </Box>
                } 
              />
              <FormControlLabel 
                value="bank_transfer" 
                control={<Radio />} 
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <BankIcon sx={{ mr: 1 }} />
                    Bank Transfer
                  </Box>
                } 
              />
            </RadioGroup>
          </FormControl>
        </Paper>

        {/* Credit Card Details */}
        {paymentMethod === 'credit_card' && (
          <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
            <Typography variant="h6" gutterBottom>
              Card Details
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  label="Card Number"
                  placeholder="1234 5678 9012 3456"
                  value={paymentDetails.cardNumber}
                  onChange={(e) => handlePaymentDetailsChange('cardNumber', e.target.value)}
                  inputProps={{ maxLength: 19 }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  label="Cardholder Name"
                  placeholder="John Doe"
                  value={paymentDetails.cardholderName}
                  onChange={(e) => handlePaymentDetailsChange('cardholderName', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  required
                  fullWidth
                  label="Expiry Date"
                  placeholder="MM/YY"
                  value={paymentDetails.expiryDate}
                  onChange={(e) => handlePaymentDetailsChange('expiryDate', e.target.value)}
                  inputProps={{ maxLength: 5 }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  required
                  fullWidth
                  label="CVV"
                  placeholder="123"
                  value={paymentDetails.cvv}
                  onChange={(e) => handlePaymentDetailsChange('cvv', e.target.value)}
                  inputProps={{ maxLength: 4 }}
                  type="password"
                />
              </Grid>
            </Grid>
          </Paper>
        )}

        {/* Bank Transfer Details */}
        {paymentMethod === 'bank_transfer' && (
          <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
            <Typography variant="h6" gutterBottom>
              Bank Transfer Instructions
            </Typography>
            <Alert severity="info" sx={{ mb: 2 }}>
              Please transfer the total amount to the following bank account and use your booking ID as the reference.
            </Alert>
            <Typography variant="body1" gutterBottom>
              Bank: SkyBooker International Bank
            </Typography>
            <Typography variant="body1" gutterBottom>
              Account Name: SkyBooker Airlines Ltd
            </Typography>
            <Typography variant="body1" gutterBottom>
              Account Number: 1234567890
            </Typography>
            <Typography variant="body1" gutterBottom>
              Routing Number: 987654321
            </Typography>
            <Typography variant="body1" gutterBottom>
              Reference: {bookingId}
            </Typography>
          </Paper>
        )}

        {/* Billing Address */}
        <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Billing Address
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                label="Billing Address"
                value={paymentDetails.billingAddress}
                onChange={(e) => handlePaymentDetailsChange('billingAddress', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                required
                fullWidth
                label="City"
                value={paymentDetails.city}
                onChange={(e) => handlePaymentDetailsChange('city', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                required
                fullWidth
                label="Zip/Postal Code"
                value={paymentDetails.zipCode}
                onChange={(e) => handlePaymentDetailsChange('zipCode', e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                label="Country"
                value={paymentDetails.country}
                onChange={(e) => handlePaymentDetailsChange('country', e.target.value)}
              />
            </Grid>
          </Grid>
        </Paper>

        {/* Security Notice */}
        <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <SecurityIcon color="primary" sx={{ mr: 2, fontSize: 40 }} />
            <Box>
              <Typography variant="h6" gutterBottom>
                Secure Payment
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Your payment information is encrypted and secure. We never store your full credit card details.
              </Typography>
            </Box>
          </Box>
        </Paper>

        {/* Submit Button */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={handleBack}
          >
            Back
          </Button>
          <Button
            type="submit"
            variant="contained"
            endIcon={<ArrowForwardIcon />}
            disabled={submitting}
          >
            {submitting ? <CircularProgress size={24} /> : 'Complete Payment'}
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default Payment;