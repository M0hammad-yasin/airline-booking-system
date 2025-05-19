import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Autocomplete,
  Card,
  CardContent,
  CardMedia,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { Flight as FlightIcon, Search as SearchIcon } from '@mui/icons-material';

// Sample popular destinations
const popularDestinations = [
  { city: 'New York', country: 'USA', image: 'https://source.unsplash.com/random/300x200/?newyork' },
  { city: 'London', country: 'UK', image: 'https://source.unsplash.com/random/300x200/?london' },
  { city: 'Tokyo', country: 'Japan', image: 'https://source.unsplash.com/random/300x200/?tokyo' },
  { city: 'Paris', country: 'France', image: 'https://source.unsplash.com/random/300x200/?paris' },
];

// Sample cities for autocomplete
const cities = [
  'New York', 'London', 'Tokyo', 'Paris', 'Dubai', 'Singapore', 'Sydney', 'Rome',
  'Barcelona', 'Hong Kong', 'Istanbul', 'Bangkok', 'Toronto', 'Berlin', 'Madrid'
];

const Home = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useState({
    departureCity: '',
    arrivalCity: '',
    departureDate: null,
    returnDate: null,
    tripType: 'one-way',
    passengers: 1
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSearchParams(prevParams => ({
      ...prevParams,
      [name]: value
    }));
  };

  const handleDateChange = (name, date) => {
    setSearchParams(prevParams => ({
      ...prevParams,
      [name]: date
    }));
  };

  const handleCityChange = (name, value) => {
    setSearchParams(prevParams => ({
      ...prevParams,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Format the date for API query
    const formattedDepartureDate = searchParams.departureDate 
      ? new Date(searchParams.departureDate).toISOString().split('T')[0] 
      : '';
    
    // Navigate to flight search with query params
    navigate(`/flights?departureCity=${searchParams.departureCity}&arrivalCity=${searchParams.arrivalCity}&departureDate=${formattedDepartureDate}`);
  };

  const handleDestinationClick = (city) => {
    setSearchParams(prevParams => ({
      ...prevParams,
      arrivalCity: city
    }));
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      {/* Hero Section */}
      <Box
        sx={{
          backgroundImage: 'url(https://source.unsplash.com/random/1600x900/?airplane)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          height: '500px',
          display: 'flex',
          alignItems: 'center',
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
          }
        }}
      >
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Typography variant="h2" component="h1" color="white" gutterBottom>
            Explore the World with SkyBooker
          </Typography>
          <Typography variant="h5" color="white" paragraph>
            Book your flights easily and securely with our airline reservation system
          </Typography>
        </Container>
      </Box>

      {/* Search Form */}
      <Container maxWidth="lg" sx={{ mt: -5, mb: 8 }}>
        <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
          <Box component="form" onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                  <FlightIcon sx={{ mr: 1 }} /> Find Your Flight
                </Typography>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel id="trip-type-label">Trip Type</InputLabel>
                  <Select
                    labelId="trip-type-label"
                    id="trip-type"
                    name="tripType"
                    value={searchParams.tripType}
                    label="Trip Type"
                    onChange={handleChange}
                  >
                    <MenuItem value="one-way">One Way</MenuItem>
                    <MenuItem value="round-trip">Round Trip</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel id="passengers-label">Passengers</InputLabel>
                  <Select
                    labelId="passengers-label"
                    id="passengers"
                    name="passengers"
                    value={searchParams.passengers}
                    label="Passengers"
                    onChange={handleChange}
                  >
                    {[1, 2, 3, 4, 5, 6].map(num => (
                      <MenuItem key={num} value={num}>{num}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Autocomplete
                  id="departure-city"
                  options={cities}
                  value={searchParams.departureCity}
                  onChange={(_, value) => handleCityChange('departureCity', value)}
                  renderInput={(params) => (
                    <TextField {...params} label="From" required fullWidth />
                  )}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Autocomplete
                  id="arrival-city"
                  options={cities}
                  value={searchParams.arrivalCity}
                  onChange={(_, value) => handleCityChange('arrivalCity', value)}
                  renderInput={(params) => (
                    <TextField {...params} label="To" required fullWidth />
                  )}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    label="Departure Date"
                    value={searchParams.departureDate}
                    onChange={(date) => handleDateChange('departureDate', date)}
                    renderInput={(params) => <TextField {...params} fullWidth required />}
                    minDate={new Date()}
                  />
                </LocalizationProvider>
              </Grid>
              
              {searchParams.tripType === 'round-trip' && (
                <Grid item xs={12} md={6}>
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DatePicker
                      label="Return Date"
                      value={searchParams.returnDate}
                      onChange={(date) => handleDateChange('returnDate', date)}
                      renderInput={(params) => <TextField {...params} fullWidth required />}
                      minDate={searchParams.departureDate || new Date()}
                    />
                  </LocalizationProvider>
                </Grid>
              )}
              
              <Grid item xs={12}>
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  fullWidth
                  startIcon={<SearchIcon />}
                  sx={{ py: 1.5 }}
                >
                  Search Flights
                </Button>
              </Grid>
            </Grid>
          </Box>
        </Paper>
      </Container>

      {/* Popular Destinations */}
      <Container maxWidth="lg" sx={{ mb: 8 }}>
        <Typography variant="h4" gutterBottom align="center" sx={{ mb: 4 }}>
          Popular Destinations
        </Typography>
        <Grid container spacing={4}>
          {popularDestinations.map((destination, index) => (
            <Grid item key={index} xs={12} sm={6} md={3}>
              <Card 
                sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  transition: 'transform 0.3s',
                  '&:hover': {
                    transform: 'scale(1.05)',
                    cursor: 'pointer'
                  }
                }}
                onClick={() => handleDestinationClick(destination.city)}
              >
                <CardMedia
                  component="img"
                  height="140"
                  image={destination.image}
                  alt={destination.city}
                />
                <CardContent>
                  <Typography gutterBottom variant="h6" component="div">
                    {destination.city}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {destination.country}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Why Choose Us */}
      <Box sx={{ bgcolor: 'grey.100', py: 8 }}>
        <Container maxWidth="lg">
          <Typography variant="h4" gutterBottom align="center" sx={{ mb: 4 }}>
            Why Choose SkyBooker
          </Typography>
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: 'center', p: 2 }}>
                <Box sx={{ 
                  bgcolor: 'primary.main', 
                  color: 'white', 
                  width: 80, 
                  height: 80, 
                  borderRadius: '50%', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  margin: '0 auto',
                  mb: 2
                }}>
                  <Typography variant="h4">1</Typography>
                </Box>
                <Typography variant="h6" gutterBottom>Best Prices</Typography>
                <Typography variant="body2" color="text.secondary">
                  We offer competitive prices on flights to destinations worldwide.
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: 'center', p: 2 }}>
                <Box sx={{ 
                  bgcolor: 'primary.main', 
                  color: 'white', 
                  width: 80, 
                  height: 80, 
                  borderRadius: '50%', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  margin: '0 auto',
                  mb: 2
                }}>
                  <Typography variant="h4">2</Typography>
                </Box>
                <Typography variant="h6" gutterBottom>Easy Booking</Typography>
                <Typography variant="body2" color="text.secondary">
                  Our simple booking process makes it easy to plan your trip.
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: 'center', p: 2 }}>
                <Box sx={{ 
                  bgcolor: 'primary.main', 
                  color: 'white', 
                  width: 80, 
                  height: 80, 
                  borderRadius: '50%', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  margin: '0 auto',
                  mb: 2
                }}>
                  <Typography variant="h4">3</Typography>
                </Box>
                <Typography variant="h6" gutterBottom>24/7 Support</Typography>
                <Typography variant="body2" color="text.secondary">
                  Our customer support team is available around the clock to assist you.
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Box>
  );
};

export default Home;