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
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  CircularProgress,
  Alert,
  Stepper,
  Step,
  StepLabel
} from '@mui/material';
import {
  Flight as FlightIcon,
  FlightTakeoff as TakeoffIcon,
  FlightLand as LandIcon,
  AccessTime as TimeIcon,
  AttachMoney as MoneyIcon,
  AirlineSeatReclineNormal as SeatIcon,
  EventSeat as EventSeatIcon,
  Info as InfoIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import { flightAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const FlightDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  
  const [flight, setFlight] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchFlightDetails = async () => {
      try {
        const data = await flightAPI.getFlight(id);
        setFlight(data);
      } catch (err) {
        console.error('Error fetching flight details:', err);
        setError('Failed to load flight details. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchFlightDetails();
  }, [id]);

  const handleBooking = () => {
    if (isAuthenticated) {
      navigate(`/booking/${id}`);
    } else {
      navigate('/login', { state: { from: `/flights/${id}` } });
    }
  };

  const handleBack = () => {
    navigate(-1);
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
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Format time only
  const formatTime = (dateTimeString) => {
    if (!dateTimeString) return '';
    const date = new Date(dateTimeString);
    return date.toLocaleTimeString('en-US', {
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
          Back to Search
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
          onClick={handleBack}
          sx={{ mt: 2 }}
        >
          Back to Search
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {/* Booking Process Stepper */}
      <Stepper activeStep={0} sx={{ mb: 4 }}>
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
        Back to Search
      </Button>

      <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
        <FlightIcon sx={{ mr: 1 }} /> Flight Details
      </Typography>

      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h5">{flight.airline}</Typography>
              <Chip 
                label={`Flight ${flight.flightNumber}`} 
                color="primary" 
                variant="outlined" 
              />
            </Box>
            <Divider sx={{ mb: 2 }} />
          </Grid>

          {/* Flight Route Visualization */}
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
              <Box sx={{ textAlign: 'center', width: '40%' }}>
                <Typography variant="h6">{flight.departureCity}</Typography>
                <Typography variant="body1">{formatTime(flight.departureTime)}</Typography>
                <Typography variant="body2" color="text.secondary">{formatDate(flight.departureTime)}</Typography>
              </Box>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '20%' }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  {calculateDuration(flight.departureTime, flight.arrivalTime)}
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
                <Typography variant="h6">{flight.arrivalCity}</Typography>
                <Typography variant="body1">{formatTime(flight.arrivalTime)}</Typography>
                <Typography variant="body2" color="text.secondary">{formatDate(flight.arrivalTime)}</Typography>
              </Box>
            </Box>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Flight Information
                </Typography>
                <List dense>
                  <ListItem>
                    <ListItemIcon>
                      <TakeoffIcon />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Departure" 
                      secondary={formatDateTime(flight.departureTime)} 
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <LandIcon />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Arrival" 
                      secondary={formatDateTime(flight.arrivalTime)} 
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <TimeIcon />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Duration" 
                      secondary={calculateDuration(flight.departureTime, flight.arrivalTime)} 
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Additional Information
                </Typography>
                <List dense>
                  <ListItem>
                    <ListItemIcon>
                      <SeatIcon />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Available Seats" 
                      secondary={flight.availableSeats} 
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <EventSeatIcon />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Seat Class" 
                      secondary="Economy" 
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <InfoIcon />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Baggage Allowance" 
                      secondary="1 x 23kg (Checked), 1 x 7kg (Cabin)" 
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
              <Box>
                <Typography variant="h5" color="primary" sx={{ display: 'flex', alignItems: 'center' }}>
                  <MoneyIcon sx={{ mr: 1 }} />
                  ${flight.price.toFixed(2)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  per passenger
                </Typography>
              </Box>
              
              <Button 
                variant="contained" 
                size="large"
                onClick={handleBooking}
                startIcon={<FlightIcon />}
                disabled={flight.availableSeats < 1}
              >
                {flight.availableSeats < 1 ? 'Sold Out' : 'Book Now'}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Flight Policies */}
      <Paper elevation={2} sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Flight Policies
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <Typography variant="subtitle1">Cancellation</Typography>
            <Typography variant="body2" color="text.secondary">
              Cancellation available up to 24 hours before departure with a fee.
            </Typography>
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography variant="subtitle1">Check-in</Typography>
            <Typography variant="body2" color="text.secondary">
              Online check-in available from 24 hours up to 1 hour before departure.
            </Typography>
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography variant="subtitle1">COVID-19 Measures</Typography>
            <Typography variant="body2" color="text.secondary">
              Enhanced cleaning procedures and mask requirements may apply.
            </Typography>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default FlightDetails;