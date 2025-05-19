import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  Divider,
  Stepper,
  Step,
  StepLabel,
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
  CheckCircle as CheckCircleIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  EventSeat as SeatIcon,
  Print as PrintIcon,
  Home as HomeIcon,
  FlightTakeoff as TakeoffIcon,
  FlightLand as LandIcon,
  AccessTime as TimeIcon,
  CalendarToday as CalendarIcon
} from '@mui/icons-material';
import { bookingAPI } from '../services/api';

const BookingConfirmation = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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

  const handlePrintTicket = () => {
    window.print();
  };

  const handleGoToMyBookings = () => {
    navigate('/my-bookings');
  };

  const handleGoHome = () => {
    navigate('/');
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

  // Format date only
  const formatDate = (dateTimeString) => {
    if (!dateTimeString) return '';
    const date = new Date(dateTimeString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
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
          startIcon={<HomeIcon />}
          onClick={handleGoHome}
          sx={{ mt: 2 }}
        >
          Return to Home
        </Button>
      </Container>
    );
  }

  if (!booking) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="info">Booking not found</Alert>
        <Button
          startIcon={<HomeIcon />}
          onClick={handleGoHome}
          sx={{ mt: 2 }}
        >
          Return to Home
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {/* Booking Process Stepper */}
      <Stepper activeStep={3} sx={{ mb: 4 }}>
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

      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <CheckCircleIcon color="success" sx={{ fontSize: 60, mb: 2 }} />
        <Typography variant="h4" gutterBottom>
          Booking Confirmed!
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Your booking has been confirmed and your tickets are ready. A confirmation email has been sent to your email address.
        </Typography>
      </Box>

      {/* Booking Reference */}
      <Paper elevation={3} sx={{ p: 3, mb: 4, textAlign: 'center' }}>
        <Typography variant="h6" gutterBottom>
          Booking Reference
        </Typography>
        <Typography variant="h4" color="primary" sx={{ fontWeight: 'bold', letterSpacing: 1 }}>
          {booking.bookingReference || bookingId}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Please quote this reference in all communications
        </Typography>
      </Paper>

      {/* Flight Details */}
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
          <FlightIcon sx={{ mr: 1 }} /> Flight Details
        </Typography>
        <Divider sx={{ mb: 2 }} />
        
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">{booking.flight?.airline}</Typography>
              <Typography variant="body1">Flight {booking.flight?.flightNumber}</Typography>
            </Box>
          </Grid>

          {/* Flight Route Visualization */}
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
              <Box sx={{ textAlign: 'center', width: '40%' }}>
                <Typography variant="h6">{booking.flight?.departureCity}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {formatDateTime(booking.flight?.departureTime)}
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '20%' }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  {calculateDuration(booking.flight?.departureTime, booking.flight?.arrivalTime)}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                  <Box sx={{ bgcolor: 'primary.main', height: 10, width: 10, borderRadius: '50%' }} />
                  <Divider sx={{ flexGrow: 1, mx: 1 }} />
                  <FlightIcon color="primary" sx={{ transform: 'rotate(90deg)' }} />
                  <Divider sx={{ flexGrow: 1, mx: 1 }} />
                  <Box sx={{ bgcolor: 'primary.main', height: 10, width: 10, borderRadius: '50%' }} />
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Direct Flight
                </Typography>
              </Box>
              
              <Box sx={{ textAlign: 'center', width: '40%' }}>
                <Typography variant="h6">{booking.flight?.arrivalCity}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {formatDateTime(booking.flight?.arrivalTime)}
                </Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Passenger Information */}
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
          <PersonIcon sx={{ mr: 1 }} /> Passenger Information
        </Typography>
        <Divider sx={{ mb: 2 }} />
        
        {booking.passengers?.map((passenger, index) => (
          <Card key={index} variant="outlined" sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="subtitle1">
                {index === 0 ? 'Primary Passenger' : `Passenger ${index + 1}`}
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <List dense>
                    <ListItem>
                      <ListItemIcon>
                        <PersonIcon />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Name" 
                        secondary={`${passenger.firstName} ${passenger.lastName}`} 
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <SeatIcon />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Seat" 
                        secondary={passenger.seat || 'Not assigned yet'} 
                      />
                    </ListItem>
                  </List>
                </Grid>
                <Grid item xs={12} md={6}>
                  <List dense>
                    <ListItem>
                      <ListItemIcon>
                        <CalendarIcon />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Date of Birth" 
                        secondary={formatDate(passenger.dateOfBirth)} 
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <PersonIcon />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Passport" 
                        secondary={passenger.passportNumber} 
                      />
                    </ListItem>
                  </List>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        ))}
      </Paper>

      {/* Contact Information */}
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Contact Information
        </Typography>
        <Divider sx={{ mb: 2 }} />
        
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <List dense>
              <ListItem>
                <ListItemIcon>
                  <EmailIcon />
                </ListItemIcon>
                <ListItemText 
                  primary="Email" 
                  secondary={booking.contactInfo?.email} 
                />
              </ListItem>
            </List>
          </Grid>
          <Grid item xs={12} md={6}>
            <List dense>
              <ListItem>
                <ListItemIcon>
                  <PhoneIcon />
                </ListItemIcon>
                <ListItemText 
                  primary="Phone" 
                  secondary={booking.contactInfo?.phone} 
                />
              </ListItem>
            </List>
          </Grid>
        </Grid>
      </Paper>

      {/* Important Information */}
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Important Information
        </Typography>
        <Divider sx={{ mb: 2 }} />
        
        <Typography variant="body2" paragraph>
          • Please arrive at the airport at least 2 hours before your scheduled departure time.
        </Typography>
        <Typography variant="body2" paragraph>
          • Don't forget to bring a valid ID or passport for all passengers.
        </Typography>
        <Typography variant="body2" paragraph>
          • Online check-in opens 24 hours before departure and closes 1 hour before departure.
        </Typography>
        <Typography variant="body2" paragraph>
          • Each passenger is allowed one carry-on bag (max 7kg) and one checked bag (max 23kg).
        </Typography>
        <Typography variant="body2">
          • For any changes or cancellations, please contact our customer service at least 24 hours before departure.
        </Typography>
      </Paper>

      {/* Action Buttons */}
      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
        <Button
          variant="contained"
          startIcon={<PrintIcon />}
          onClick={handlePrintTicket}
        >
          Print Ticket
        </Button>
        <Button
          variant="outlined"
          onClick={handleGoToMyBookings}
        >
          View My Bookings
        </Button>
        <Button
          variant="outlined"
          startIcon={<HomeIcon />}
          onClick={handleGoHome}
        >
          Return to Home
        </Button>
      </Box>
    </Container>
  );
};

export default BookingConfirmation;