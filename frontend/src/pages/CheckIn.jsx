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
  Stepper,
  Step,
  StepLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControlLabel,
  Checkbox
} from '@mui/material';
import {
  Flight as FlightIcon,
  FlightTakeoff as TakeoffIcon,
  FlightLand as LandIcon,
  AccessTime as TimeIcon,
  EventSeat as SeatIcon,
  Person as PersonIcon,
  CheckCircle as CheckCircleIcon,
  ArrowBack as ArrowBackIcon,
  AirlineSeatReclineNormal as AirlineSeatIcon,
  Luggage as LuggageIcon
} from '@mui/icons-material';
import { bookingAPI } from '../services/api';

// Seat map configuration
const ROWS = 20;
const SEATS_PER_ROW = 6;
const SEAT_LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'];

const CheckIn = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeStep, setActiveStep] = useState(0);
  const [selectedSeats, setSelectedSeats] = useState({});
  const [occupiedSeats, setOccupiedSeats] = useState([]);
  const [passengerAgreements, setPassengerAgreements] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);

  useEffect(() => {
    const fetchBookingDetails = async () => {
      try {
        const data = await bookingAPI.getBooking(bookingId);
        setBooking(data);
        
        // Initialize passenger agreements
        const agreements = {};
        data.passengers.forEach((passenger, index) => {
          agreements[index] = false;
        });
        setPassengerAgreements(agreements);
        
        // Fetch occupied seats
        const seatsData = await bookingAPI.getOccupiedSeats(data.flight.id);
        setOccupiedSeats(seatsData.occupiedSeats || []);
      } catch (err) {
        console.error('Error fetching booking details:', err);
        setError('Failed to load booking details. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchBookingDetails();
  }, [bookingId]);

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    if (activeStep === 0) {
      navigate(`/bookings/${bookingId}`);
    } else {
      setActiveStep((prevStep) => prevStep - 1);
    }
  };

  const handleSeatSelection = (passengerId, seat) => {
    // Check if seat is already occupied
    if (occupiedSeats.includes(seat)) return;
    
    // Check if seat is already selected by another passenger
    const isAlreadySelected = Object.values(selectedSeats).includes(seat);
    if (isAlreadySelected) return;
    
    setSelectedSeats({
      ...selectedSeats,
      [passengerId]: seat
    });
  };

  const handleAgreementChange = (passengerId, checked) => {
    setPassengerAgreements({
      ...passengerAgreements,
      [passengerId]: checked
    });
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      // Prepare passenger data with seat assignments
      const passengerData = booking.passengers.map((passenger, index) => ({
        passengerId: passenger.id || index,
        seat: selectedSeats[index]
      }));

      const result = await bookingAPI.completeCheckIn(bookingId, passengerData);
      
      if (result.success) {
        setSuccessDialogOpen(true);
      } else {
        setError(result.message || 'Check-in failed');
      }
    } catch (err) {
      console.error('Error completing check-in:', err);
      setError('Check-in failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCloseSuccessDialog = () => {
    setSuccessDialogOpen(false);
    navigate(`/bookings/${bookingId}`);
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

  // Check if check-in is available
  const isCheckInAvailable = () => {
    if (!booking) return false;
    
    const departureTime = new Date(booking.flight?.departureTime);
    const now = new Date();
    const hoursDiff = (departureTime - now) / (1000 * 60 * 60);
    
    // Check-in available between 24 hours and 1 hour before departure
    return hoursDiff <= 24 && hoursDiff > 1;
  };

  // Check if all passengers have selected seats
  const allSeatsSelected = () => {
    if (!booking) return false;
    return booking.passengers.every((_, index) => selectedSeats[index]);
  };

  // Check if all passengers have agreed to terms
  const allAgreementsChecked = () => {
    if (!booking) return false;
    return booking.passengers.every((_, index) => passengerAgreements[index]);
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
          onClick={() => navigate(`/bookings/${bookingId}`)}
          sx={{ mt: 2 }}
        >
          Back to Booking Details
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
          onClick={() => navigate('/my-bookings')}
          sx={{ mt: 2 }}
        >
          Back to My Bookings
        </Button>
      </Container>
    );
  }

  if (!isCheckInAvailable()) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="warning">
          Online check-in is only available from 24 hours up to 1 hour before departure.
        </Alert>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(`/bookings/${bookingId}`)}
          sx={{ mt: 2 }}
        >
          Back to Booking Details
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={handleBack}
        sx={{ mb: 2 }}
      >
        {activeStep === 0 ? 'Back to Booking Details' : 'Back to Passenger Selection'}
      </Button>

      <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
        <AirlineSeatIcon sx={{ mr: 1 }} /> Online Check-in
      </Typography>

      {/* Check-in Stepper */}
      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        <Step>
          <StepLabel>Select Seats</StepLabel>
        </Step>
        <Step>
          <StepLabel>Confirm Check-in</StepLabel>
        </Step>
      </Stepper>

      {/* Flight Information */}
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
          <FlightIcon sx={{ mr: 1 }} /> Flight Information
        </Typography>
        <Divider sx={{ mb: 2 }} />
        
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <List dense>
              <ListItem>
                <ListItemIcon>
                  <FlightIcon />
                </ListItemIcon>
                <ListItemText 
                  primary={`${booking.flight?.airline} - Flight ${booking.flight?.flightNumber}`}
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <TakeoffIcon />
                </ListItemIcon>
                <ListItemText 
                  primary={`From: ${booking.flight?.departureCity}`}
                  secondary={formatDateTime(booking.flight?.departureTime)}
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <LandIcon />
                </ListItemIcon>
                <ListItemText 
                  primary={`To: ${booking.flight?.arrivalCity}`}
                  secondary={formatDateTime(booking.flight?.arrivalTime)}
                />
              </ListItem>
            </List>
          </Grid>
          <Grid item xs={12} md={6}>
            <List dense>
              <ListItem>
                <ListItemIcon>
                  <PersonIcon />
                </ListItemIcon>
                <ListItemText 
                  primary={`Passengers: ${booking.passengers?.length}`}
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <LuggageIcon />
                </ListItemIcon>
                <ListItemText 
                  primary="Baggage Allowance"
                  secondary="1 x 23kg (Checked), 1 x 7kg (Cabin)"
                />
              </ListItem>
            </List>
          </Grid>
        </Grid>
      </Paper>

      {activeStep === 0 ? (
        /* Seat Selection Step */
        <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
            <SeatIcon sx={{ mr: 1 }} /> Seat Selection
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Please select seats for all passengers. The seat map shows available and occupied seats.
          </Typography>
          <Divider sx={{ mb: 2 }} />

          {/* Passenger Tabs */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            {booking.passengers.map((passenger, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Card 
                  variant="outlined" 
                  sx={{ 
                    height: '100%',
                    bgcolor: selectedSeats[index] ? 'primary.light' : 'background.paper',
                    color: selectedSeats[index] ? 'primary.contrastText' : 'text.primary'
                  }}
                >
                  <CardContent>
                    <Typography variant="subtitle1" gutterBottom>
                      {passenger.firstName} {passenger.lastName}
                    </Typography>
                    <Typography variant="body2">
                      Selected Seat: {selectedSeats[index] || 'None'}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Seat Map */}
          <Box sx={{ mb: 3, textAlign: 'center' }}>
            <Typography variant="subtitle1" gutterBottom>
              Airplane Seat Map
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mr: 3 }}>
                <Box sx={{ width: 20, height: 20, bgcolor: 'grey.300', mr: 1 }} />
                <Typography variant="caption">Available</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mr: 3 }}>
                <Box sx={{ width: 20, height: 20, bgcolor: 'primary.main', mr: 1 }} />
                <Typography variant="caption">Selected</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Box sx={{ width: 20, height: 20, bgcolor: 'error.light', mr: 1 }} />
                <Typography variant="caption">Occupied</Typography>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              {/* Airplane nose */}
              <Box sx={{ width: 60, height: 30, bgcolor: 'grey.300', borderTopLeftRadius: 30, borderTopRightRadius: 30, mb: 2 }} />
              
              {/* Seat grid */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {Array.from({ length: ROWS }).map((_, rowIndex) => (
                  <Box key={rowIndex} sx={{ display: 'flex', gap: 1 }}>
                    <Typography variant="caption" sx={{ width: 20, textAlign: 'right', pt: 0.5 }}>
                      {rowIndex + 1}
                    </Typography>
                    
                    {SEAT_LETTERS.slice(0, 3).map((letter) => {
                      const seat = `${rowIndex + 1}${letter}`;
                      const isOccupied = occupiedSeats.includes(seat);
                      const isSelected = Object.values(selectedSeats).includes(seat);
                      const _passengerIndex = Object.keys(selectedSeats).find(key => selectedSeats[key] === seat);
                      
                      return (
                        <Box 
                          key={seat}
                          sx={{
                            width: 30,
                            height: 30,
                            bgcolor: isOccupied ? 'error.light' : isSelected ? 'primary.main' : 'grey.300',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            cursor: isOccupied ? 'not-allowed' : 'pointer',
                            color: isSelected || isOccupied ? 'white' : 'text.primary',
                            '&:hover': {
                              bgcolor: isOccupied ? 'error.light' : isSelected ? 'primary.main' : 'primary.light',
                            }
                          }}
                          onClick={() => {
                            if (!isOccupied) {
                              // Find the current passenger being edited
                              const currentPassenger = booking.passengers.findIndex((_, idx) => !selectedSeats[idx]);
                              const passengerToEdit = currentPassenger !== -1 ? currentPassenger : 0;
                              handleSeatSelection(passengerToEdit, seat);
                            }
                          }}
                        >
                          {letter}
                        </Box>
                      );
                    })}
                    
                    <Box sx={{ width: 30 }} /> {/* Aisle */}
                    
                    {SEAT_LETTERS.slice(3).map((letter) => {
                      const seat = `${rowIndex + 1}${letter}`;
                      const isOccupied = occupiedSeats.includes(seat);
                      const isSelected = Object.values(selectedSeats).includes(seat);
                      const _passengerIndex = Object.keys(selectedSeats).find(key => selectedSeats[key] === seat);
                      
                      return (
                        <Box 
                          key={seat}
                          sx={{
                            width: 30,
                            height: 30,
                            bgcolor: isOccupied ? 'error.light' : isSelected ? 'primary.main' : 'grey.300',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            cursor: isOccupied ? 'not-allowed' : 'pointer',
                            color: isSelected || isOccupied ? 'white' : 'text.primary',
                            '&:hover': {
                              bgcolor: isOccupied ? 'error.light' : isSelected ? 'primary.main' : 'primary.light',
                            }
                          }}
                          onClick={() => {
                            if (!isOccupied) {
                              // Find the current passenger being edited
                              const currentPassenger = booking.passengers.findIndex((_, idx) => !selectedSeats[idx]);
                              const passengerToEdit = currentPassenger !== -1 ? currentPassenger : 0;
                              handleSeatSelection(passengerToEdit, seat);
                            }
                          }}
                        >
                          {letter}
                        </Box>
                      );
                    })}
                  </Box>
                ))}
              </Box>
              
              {/* Airplane tail */}
              <Box sx={{ width: 40, height: 60, bgcolor: 'grey.300', borderBottomLeftRadius: 20, borderBottomRightRadius: 20, mt: 2 }} />
            </Box>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
            <Button
              variant="contained"
              onClick={handleNext}
              disabled={!allSeatsSelected()}
            >
              Continue
            </Button>
          </Box>
        </Paper>
      ) : (
        /* Confirmation Step */
        <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
            <CheckCircleIcon sx={{ mr: 1 }} /> Confirm Check-in
          </Typography>
          <Divider sx={{ mb: 2 }} />

          {/* Passenger Summary */}
          <Typography variant="subtitle1" gutterBottom>
            Passenger and Seat Summary
          </Typography>
          
          {booking.passengers.map((passenger, index) => (
            <Card key={index} variant="outlined" sx={{ mb: 2 }}>
              <CardContent>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2">
                      {passenger.firstName} {passenger.lastName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Passport: {passenger.passportNumber}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2">
                      Seat: {selectedSeats[index]}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Class: Economy
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          ))}

          {/* Terms and Conditions */}
          <Typography variant="subtitle1" gutterBottom sx={{ mt: 3 }}>
            Terms and Conditions
          </Typography>
          <Typography variant="body2" paragraph>
            Please read and agree to the following terms before completing check-in:
          </Typography>
          
          <Box sx={{ bgcolor: 'grey.100', p: 2, borderRadius: 1, mb: 3 }}>
            <Typography variant="body2" paragraph>
              • I confirm that all passenger information is correct and matches their travel documents.
            </Typography>
            <Typography variant="body2" paragraph>
              • I understand that all passengers must present valid identification at the airport.
            </Typography>
            <Typography variant="body2" paragraph>
              • I agree to comply with all baggage restrictions and security regulations.
            </Typography>
            <Typography variant="body2">
              • I acknowledge that passengers should arrive at the airport at least 2 hours before the scheduled departure time.
            </Typography>
          </Box>

          {booking.passengers.map((passenger, index) => (
            <FormControlLabel
              key={index}
              control={
                <Checkbox
                  checked={passengerAgreements[index] || false}
                  onChange={(e) => handleAgreementChange(index, e.target.checked)}
                />
              }
              label={`I agree to the terms and conditions on behalf of ${passenger.firstName} ${passenger.lastName}`}
            />
          ))}

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
            <Button
              variant="outlined"
              onClick={handleBack}
            >
              Back
            </Button>
            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={!allAgreementsChecked() || submitting}
            >
              {submitting ? <CircularProgress size={24} /> : 'Complete Check-in'}
            </Button>
          </Box>
        </Paper>
      )}

      {/* Success Dialog */}
      <Dialog
        open={successDialogOpen}
        onClose={handleCloseSuccessDialog}
      >
        <DialogTitle>Check-in Successful</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 2 }}>
            <CheckCircleIcon color="success" sx={{ fontSize: 60, mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              You're all set!
            </Typography>
            <Typography variant="body1" align="center" paragraph>
              Your check-in has been completed successfully. Boarding passes have been sent to your email.
            </Typography>
            <Typography variant="body2" color="text.secondary" align="center">
              Please arrive at the airport at least 2 hours before your scheduled departure time.
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseSuccessDialog} color="primary" autoFocus>
            View Booking Details
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default CheckIn;