import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  Card,
  CardContent,
  CardActions,
  Divider,
  Chip,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Tabs,
  Tab
} from '@mui/material';
import {
  Flight as FlightIcon,
  FlightTakeoff as TakeoffIcon,
  FlightLand as LandIcon,
  AccessTime as TimeIcon,
  EventSeat as SeatIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Schedule as ScheduleIcon,
  ArrowForward as ArrowForwardIcon
} from '@mui/icons-material';
import { bookingAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const MyBookings = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const data = await bookingAPI.getUserBookings();
        setBookings(data);
      } catch (err) {
        console.error('Error fetching bookings:', err);
        setError('Failed to load your bookings. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleViewBooking = (bookingId) => {
    navigate(`/bookings/${bookingId}`);
  };

  const handleCheckIn = (bookingId) => {
    navigate(`/check-in/${bookingId}`);
  };

  // Format date and time
  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return '';
    const date = new Date(dateTimeString);
    return date.toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
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
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Check if flight is upcoming, past, or canceled
  const getBookingStatus = (booking) => {
    if (booking.status === 'canceled') return 'canceled';
    
    const departureTime = new Date(booking.flight?.departureTime);
    const now = new Date();
    
    if (departureTime < now) return 'past';
    return 'upcoming';
  };

  // Filter bookings based on tab
  const filteredBookings = bookings.filter(booking => {
    const status = getBookingStatus(booking);
    if (tabValue === 0) return status === 'upcoming';
    if (tabValue === 1) return status === 'past';
    if (tabValue === 2) return status === 'canceled';
    return true;
  });

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">{error}</Alert>
        <Button
          variant="contained"
          onClick={() => navigate('/')}
          sx={{ mt: 2 }}
        >
          Return to Home
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
        <FlightIcon sx={{ mr: 1 }} /> My Bookings
      </Typography>

      {bookings.length === 0 ? (
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>
            You don't have any bookings yet
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            Start by searching for flights and making your first booking.
          </Typography>
          <Button
            variant="contained"
            onClick={() => navigate('/flights')}
            sx={{ mt: 2 }}
          >
            Search Flights
          </Button>
        </Paper>
      ) : (
        <>
          <Paper elevation={3} sx={{ mb: 4 }}>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              indicatorColor="primary"
              textColor="primary"
              variant="fullWidth"
            >
              <Tab label="Upcoming" icon={<ScheduleIcon />} iconPosition="start" />
              <Tab label="Past" icon={<CheckCircleIcon />} iconPosition="start" />
              <Tab label="Canceled" icon={<CancelIcon />} iconPosition="start" />
            </Tabs>
          </Paper>

          {filteredBookings.length === 0 ? (
            <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="h6" gutterBottom>
                No {tabValue === 0 ? 'upcoming' : tabValue === 1 ? 'past' : 'canceled'} bookings found
              </Typography>
              {tabValue === 0 && (
                <Button
                  variant="contained"
                  onClick={() => navigate('/flights')}
                  sx={{ mt: 2 }}
                >
                  Search Flights
                </Button>
              )}
            </Paper>
          ) : (
            <Grid container spacing={3}>
              {filteredBookings.map((booking) => {
                const status = getBookingStatus(booking);
                return (
                  <Grid item xs={12} key={booking.id || booking._id}>
                    <Card variant="outlined">
                      <CardContent>
                        <Grid container spacing={2}>
                          <Grid item xs={12}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                              <Typography variant="h6">
                                {booking.flight?.airline} - Flight {booking.flight?.flightNumber}
                              </Typography>
                              <Chip 
                                label={booking.bookingReference || `Booking #${booking.id || booking._id}`} 
                                color="primary" 
                                variant="outlined" 
                              />
                            </Box>
                            <Divider sx={{ mb: 2 }} />
                          </Grid>

                          <Grid item xs={12} md={8}>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                              <Box sx={{ textAlign: 'center', width: '40%' }}>
                                <Typography variant="body1" fontWeight="bold">{booking.flight?.departureCity}</Typography>
                                <Typography variant="body2">{formatDateTime(booking.flight?.departureTime)}</Typography>
                              </Box>
                              
                              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '20%' }}>
                                <ArrowForwardIcon color="primary" />
                                <Typography variant="caption" color="text.secondary">
                                  Direct
                                </Typography>
                              </Box>
                              
                              <Box sx={{ textAlign: 'center', width: '40%' }}>
                                <Typography variant="body1" fontWeight="bold">{booking.flight?.arrivalCity}</Typography>
                                <Typography variant="body2">{formatDateTime(booking.flight?.arrivalTime)}</Typography>
                              </Box>
                            </Box>

                            <Box>
                              <Typography variant="body2" color="text.secondary">
                                Passengers: {booking.passengers?.length} ({booking.passengers?.map(p => `${p.firstName} ${p.lastName}`).join(', ')})
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                Booking Date: {formatDate(booking.bookingDate || booking.createdAt)}
                              </Typography>
                            </Box>
                          </Grid>

                          <Grid item xs={12} md={4}>
                            <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
                              <Box>
                                <Typography variant="body1" fontWeight="bold">
                                  Status: 
                                  <Chip 
                                    label={status === 'upcoming' ? 'Upcoming' : status === 'past' ? 'Completed' : 'Canceled'} 
                                    color={status === 'upcoming' ? 'primary' : status === 'past' ? 'success' : 'error'}
                                    size="small"
                                    sx={{ ml: 1 }}
                                  />
                                </Typography>
                                <Typography variant="body1" fontWeight="bold" color="primary">
                                  Total: ${booking.totalPrice?.toFixed(2)}
                                </Typography>
                              </Box>
                              
                              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 2 }}>
                                <Button
                                  variant="contained"
                                  onClick={() => handleViewBooking(booking.id || booking._id)}
                                  fullWidth
                                >
                                  View Details
                                </Button>
                                
                                {status === 'upcoming' && (
                                  <Button
                                    variant="outlined"
                                    onClick={() => handleCheckIn(booking.id || booking._id)}
                                    fullWidth
                                  >
                                    Check-in
                                  </Button>
                                )}
                              </Box>
                            </Box>
                          </Grid>
                        </Grid>
                      </CardContent>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          )}
        </>
      )}
    </Container>
  );
};

export default MyBookings;