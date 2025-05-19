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
  List,
  ListItem,
  ListItemText,
  ListItemIcon
} from '@mui/material';
import {
  Flight as FlightIcon,
  Person as PersonIcon,
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon,
  FlightTakeoff as TakeoffIcon,
  FlightLand as LandIcon,
  AccessTime as TimeIcon,
  AttachMoney as MoneyIcon
} from '@mui/icons-material';
import { flightAPI, bookingAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const Booking = () => {
  const { flightId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [flight, setFlight] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
  // Passenger form state
  const [passengers, setPassengers] = useState([{
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    passportNumber: '',
    specialRequests: ''
  }]);

  // Contact information
  const [contactInfo, setContactInfo] = useState({
    email: user?.email || '',
    phone: ''
  });

  useEffect(() => {
    const fetchFlightDetails = async () => {
      try {
        const data = await flightAPI.getFlight(flightId);
        setFlight(data);
      } catch (err) {
        console.error('Error fetching flight details:', err);
        setError('Failed to load flight details. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchFlightDetails();
  }, [flightId]);

  const handlePassengerChange = (index, field, value) => {
    const updatedPassengers = [...passengers];
    updatedPassengers[index] = {
      ...updatedPassengers[index],
      [field]: value
    };
    setPassengers(updatedPassengers);
  };

  const handleContactChange = (field, value) => {
    setContactInfo({
      ...contactInfo,
      [field]: value
    });
  };

  const addPassenger = () => {
    if (passengers.length < 9) { // Maximum 9 passengers per booking
      setPassengers([
        ...passengers,
        {
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          dateOfBirth: '',
          passportNumber: '',
          specialRequests: ''
        }
      ]);
    }
  };

  const removePassenger = (index) => {
    if (passengers.length > 1) {
      const updatedPassengers = [...passengers];
      updatedPassengers.splice(index, 1);
      setPassengers(updatedPassengers);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      // Create booking
      const bookingData = {
        flightId,
        passengers,
        contactInfo,
        totalPrice: flight.price * passengers.length
      };

      const result = await bookingAPI.createBooking(bookingData);
      
      if (result.success) {
        navigate(`/payment/${result.bookingId}`);
      } else {
        setError(result.message || 'Failed to create booking');
      }
    } catch (err) {
      console.error('Error creating booking:', err);
      setError('Failed to create booking. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleBack = () => {
    navigate(`/flights/${flightId}`);
  };

  // Format date and time
  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return '';
    const date = new Date(dateTimeString);
    return date.toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    });
  };

  // Calculate flight duration
  const calculateDuration = (departure, arrival) => {
    if (!departure || !arrival) return '';
    const departureTime = new Date(departure);
    const arrivalTime = new Date(arrival);
    const durationMs = arrivalTime - departureTime;
    const hours = Math.floor(durationMs / (1000 * 60 * 60));
    const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
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
          onClick={handleBack}
          sx={{ mt: 2 }}
        >
          Back to Flight Details
        </Button>
      </Container>
    );
  }

  if (!flight) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="info">Flight not found</Alert>
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
      <Stepper activeStep={1} sx={{ mb: 4 }}>
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
        Back to Flight Details
      </Button>

      <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
        <PersonIcon sx={{ mr: 1 }} /> Passenger Details
      </Typography>

      {/* Flight Summary */}
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Flight Summary
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <List dense>
              <ListItem>
                <ListItemIcon>
                  <FlightIcon />
                </ListItemIcon>
                <ListItemText 
                  primary={`${flight.airline} - Flight ${flight.flightNumber}`}
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <TakeoffIcon />
                </ListItemIcon>
                <ListItemText 
                  primary={`From: ${flight.departureCity}`}
                  secondary={formatDateTime(flight.departureTime)}
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <LandIcon />
                </ListItemIcon>
                <ListItemText 
                  primary={`To: ${flight.arrivalCity}`}
                  secondary={formatDateTime(flight.arrivalTime)}
                />
              </ListItem>
            </List>
          </Grid>
          <Grid item xs={12} md={6}>
            <List dense>
              <ListItem>
                <ListItemIcon>
                  <TimeIcon />
                </ListItemIcon>
                <ListItemText 
                  primary="Duration"
                  secondary={calculateDuration(flight.departureTime, flight.arrivalTime)}
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <MoneyIcon />
                </ListItemIcon>
                <ListItemText 
                  primary="Price per passenger"
                  secondary={`$${flight.price.toFixed(2)}`}
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <MoneyIcon />
                </ListItemIcon>
                <ListItemText 
                  primary="Total price"
                  secondary={`$${(flight.price * passengers.length).toFixed(2)}`}
                />
              </ListItem>
            </List>
          </Grid>
        </Grid>
      </Paper>

      <Box component="form" onSubmit={handleSubmit}>
        {/* Contact Information */}
        <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Contact Information
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            We'll send booking confirmation and updates to this contact.
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                required
                fullWidth
                label="Email"
                value={contactInfo.email}
                onChange={(e) => handleContactChange('email', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                required
                fullWidth
                label="Phone Number"
                value={contactInfo.phone}
                onChange={(e) => handleContactChange('phone', e.target.value)}
              />
            </Grid>
          </Grid>
        </Paper>

        {/* Passenger Forms */}
        {passengers.map((passenger, index) => (
          <Paper key={index} elevation={3} sx={{ p: 3, mb: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                {index === 0 ? 'Primary Passenger' : `Passenger ${index + 1}`}
              </Typography>
              {passengers.length > 1 && (
                <Button 
                  variant="outlined" 
                  color="error" 
                  size="small"
                  onClick={() => removePassenger(index)}
                >
                  Remove
                </Button>
              )}
            </Box>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  required
                  fullWidth
                  label="First Name"
                  value={passenger.firstName}
                  onChange={(e) => handlePassengerChange(index, 'firstName', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  required
                  fullWidth
                  label="Last Name"
                  value={passenger.lastName}
                  onChange={(e) => handlePassengerChange(index, 'lastName', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  required
                  fullWidth
                  label="Date of Birth"
                  type="date"
                  InputLabelProps={{ shrink: true }}
                  value={passenger.dateOfBirth}
                  onChange={(e) => handlePassengerChange(index, 'dateOfBirth', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  required
                  fullWidth
                  label="Passport Number"
                  value={passenger.passportNumber}
                  onChange={(e) => handlePassengerChange(index, 'passportNumber', e.target.value)}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Special Requests (Optional)"
                  multiline
                  rows={2}
                  value={passenger.specialRequests}
                  onChange={(e) => handlePassengerChange(index, 'specialRequests', e.target.value)}
                  helperText="Meal preferences, assistance needs, etc."
                />
              </Grid>
            </Grid>
          </Paper>
        ))}

        {/* Add Passenger Button */}
        {passengers.length < 9 && (
          <Button
            variant="outlined"
            onClick={addPassenger}
            sx={{ mb: 4 }}
          >
            Add Another Passenger
          </Button>
        )}

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
            {submitting ? <CircularProgress size={24} /> : 'Proceed to Payment'}
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default Booking;