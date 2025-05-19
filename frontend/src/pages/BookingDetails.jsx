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
  Chip,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions
} from '@mui/material';
import {
  Flight as FlightIcon,
  FlightTakeoff as TakeoffIcon,
  FlightLand as LandIcon,
  AccessTime as TimeIcon,
  EventSeat as SeatIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  CalendarToday as CalendarIcon,
  Print as PrintIcon,
  Cancel as CancelIcon,
  ArrowBack as ArrowBackIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import { bookingAPI } from '../services/api';

const BookingDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    const fetchBookingDetails = async () => {
      try {
        const data = await bookingAPI.getBooking(id);
        setBooking(data);
      } catch (err) {
        console.error('Error fetching booking details:', err);
        setError('Failed to load booking details. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchBookingDetails();
  }, [id]);

  const handlePrintTicket = () => {
    window.print();
  };

  const handleCheckIn = () => {
    navigate(`/check-in/${id}`);
  };

  const handleCancelBooking = async () => {
    setCancelling(true);
    try {
      const result = await bookingAPI.cancelBooking(id);
      if (result.success) {
        // Update the booking status locally
        setBooking({
          ...booking,
          status: 'canceled'
        });
      } else {
        setError(result.message || 'Failed to cancel booking');
      }
    } catch (err) {
      console.error('Error cancelling booking:', err);
      setError('Failed to cancel booking. Please try again.');
    } finally {
      setCancelling(false);
      setCancelDialogOpen(false);
    }
  };

  const handleBack = () => {
    navigate('/my-bookings');
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

  // Check if flight is upcoming, past, or canceled
  const getBookingStatus = () => {
    if (booking?.status === 'canceled') return 'canceled';
    
    const departureTime = new Date(booking?.flight?.departureTime);
    const now = new Date();
    
    if (departureTime < now) return 'past';
    return 'upcoming';
  };

  // Check if check-in is available
  const isCheckInAvailable = () => {
    if (!booking || getBookingStatus() !== 'upcoming') return false;
    
    const departureTime = new Date(booking.flight?.departureTime);
    const now = new Date();
    const hoursDiff = (departureTime - now) / (1000 * 60 * 60);
    
    // Check-in available between 24 hours and 1 hour before departure
    return hoursDiff <= 24 && hoursDiff > 1;
  };

  // Check if cancellation is available
  const isCancellationAvailable = () => {
    if (!booking || getBookingStatus() !== 'upcoming') return false;
    
    const departureTime = new Date(booking.flight?.departureTime);
    const now = new Date();
    const hoursDiff = (departureTime - now) / (1000 * 60 * 60);
    
    // Cancellation available up to 24 hours before departure
    return hoursDiff > 24;
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
          Back to My Bookings
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
          onClick={handleBack}
          sx={{ mt: 2 }}
        >
          Back to My Bookings
        </Button>
      </Container>
    );
  }

  const status = getBookingStatus();

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={handleBack}
        sx={{ mb: 2 }}
      >
        Back to My Bookings
      </Button>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ display: 'flex', alignItems: 'center' }}>
          <FlightIcon sx={{ mr: 1 }} /> Booking Details
        </Typography>
        <Chip 
          label={status === 'upcoming' ? 'Upcoming' : status === 'past' ? 'Completed' : 'Canceled'} 
          color={status === 'upcoming' ? 'primary' : status === 'past' ? 'success' : 'error'}
          icon={status === 'upcoming' ? <FlightIcon /> : status === 'past' ? <CheckCircleIcon /> : <CancelIcon />}
        />
      </Box>

      {/* Booking Reference */}
      <Paper elevation={3} sx={{ p: 3, mb: 4, textAlign: 'center' }}>
        <Typography variant="h6" gutterBottom>
          Booking Reference
        </Typography>
        <Typography variant="h4" color="primary" sx={{ fontWeight: 'bold', letterSpacing: 1 }}>
          {booking.bookingReference || id}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Booking Date: {formatDate(booking.bookingDate || booking.createdAt)}
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

      {/* Payment Information */}
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Payment Information
        </Typography>
        <Divider sx={{ mb: 2 }} />
        
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Typography variant="body1">
              Payment Method: {booking.paymentMethod || 'Credit Card'}
            </Typography>
            <Typography variant="body1">
              Payment Status: 
              <Chip 
                label={booking.paymentStatus || 'Paid'} 
                color="success" 
                size="small"
                sx={{ ml: 1 }}
              />
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
              <Typography variant="body1">
                Subtotal: ${booking.flight?.price?.toFixed(2)} x {booking.passengers?.length} passenger(s)
              </Typography>
              <Typography variant="body1">
                Taxes & Fees: ${(booking.totalPrice * 0.1).toFixed(2)}
              </Typography>
              <Divider sx={{ width: '100%', my: 1 }} />
              <Typography variant="h6" color="primary">
                Total: ${booking.totalPrice?.toFixed(2)}
              </Typography>
            </Box>
          </Grid>
        </Grid>
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
        
        {isCheckInAvailable() && (
          <Button
            variant="contained"
            color="success"
            onClick={handleCheckIn}
          >
            Check-in
          </Button>
        )}
        
        {isCancellationAvailable() && (
          <Button
            variant="outlined"
            color="error"
            startIcon={<CancelIcon />}
            onClick={() => setCancelDialogOpen(true)}
          >
            Cancel Booking
          </Button>
        )}
      </Box>

      {/* Cancel Confirmation Dialog */}
      <Dialog
        open={cancelDialogOpen}
        onClose={() => setCancelDialogOpen(false)}
      >
        <DialogTitle>Cancel Booking</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to cancel this booking? A cancellation fee may apply according to the airline's policy.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCancelDialogOpen(false)} disabled={cancelling}>
            No, Keep Booking
          </Button>
          <Button onClick={handleCancelBooking} color="error" disabled={cancelling}>
            {cancelling ? <CircularProgress size={24} /> : 'Yes, Cancel Booking'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default BookingDetails;