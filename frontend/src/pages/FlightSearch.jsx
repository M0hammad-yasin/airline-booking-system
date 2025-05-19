import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  Card,
  CardContent,
  CardActions,
  Divider,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Autocomplete,
  CircularProgress,
  Alert,
  IconButton,
  Collapse
} from '@mui/material';
import {
  Flight as FlightIcon,
  FlightTakeoff as TakeoffIcon,
  FlightLand as LandIcon,
  AccessTime as TimeIcon,
  AttachMoney as MoneyIcon,
  FilterList as FilterIcon,
  ExpandMore as ExpandMoreIcon,
  Search as SearchIcon
} from '@mui/icons-material';
import { flightAPI } from '../services/api';

// Sample cities for autocomplete
const cities = [
  'New York', 'London', 'Tokyo', 'Paris', 'Dubai', 'Singapore', 'Sydney', 'Rome',
  'Barcelona', 'Hong Kong', 'Istanbul', 'Bangkok', 'Toronto', 'Berlin', 'Madrid'
];

const FlightSearch = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);

  // Search form state
  const [searchParams, setSearchParams] = useState({
    departureCity: queryParams.get('departureCity') || '',
    arrivalCity: queryParams.get('arrivalCity') || '',
    departureDate: queryParams.get('departureDate') || ''
  });

  // Flights state
  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Filter state
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    airline: '',
    maxPrice: '',
    sortBy: 'price' // price, departure, duration
  });

  // Fetch flights on initial load or when search params change
  useEffect(() => {
    if (searchParams.departureCity && searchParams.arrivalCity && searchParams.departureDate) {
      fetchFlights();
    }
  }, [searchParams.departureCity, searchParams.arrivalCity, searchParams.departureDate]);

  const fetchFlights = async () => {
    setLoading(true);
    setError('');

    try {
      const data = await flightAPI.searchFlights(searchParams);
      setFlights(data);
    } catch (err) {
      console.error('Error fetching flights:', err);
      setError('Failed to fetch flights. Please try again.');
      setFlights([]);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSearchParams(prevParams => ({
      ...prevParams,
      [name]: value
    }));
  };

  const handleCityChange = (name, value) => {
    setSearchParams(prevParams => ({
      ...prevParams,
      [name]: value
    }));
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prevFilters => ({
      ...prevFilters,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Update URL with search params
    const queryString = new URLSearchParams(searchParams).toString();
    navigate(`/flights?${queryString}`);
    
    fetchFlights();
  };

  const handleFlightSelect = (flightId) => {
    navigate(`/flights/${flightId}`);
  };

  // Apply filters to flights
  const filteredFlights = flights.filter(flight => {
    if (filters.airline && flight.airline !== filters.airline) return false;
    if (filters.maxPrice && flight.price > parseFloat(filters.maxPrice)) return false;
    return true;
  }).sort((a, b) => {
    switch (filters.sortBy) {
      case 'price':
        return a.price - b.price;
      case 'departure':
        return new Date(a.departureTime) - new Date(b.departureTime);
      case 'duration': {
        const durationA = new Date(a.arrivalTime) - new Date(a.departureTime);
        const durationB = new Date(b.arrivalTime) - new Date(b.departureTime);
        return durationA - durationB;
      }
      default:
        return a.price - b.price;
    }
  });

  // Get unique airlines for filter
  const airlines = [...new Set(flights.map(flight => flight.airline))];

  // Format date and time
  const formatDateTime = (dateTimeString) => {
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

  // Calculate flight duration
  const calculateDuration = (departure, arrival) => {
    const departureTime = new Date(departure);
    const arrivalTime = new Date(arrival);
    const durationMs = arrivalTime - departureTime;
    const hours = Math.floor(durationMs / (1000 * 60 * 60));
    const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
        <FlightIcon sx={{ mr: 1 }} /> Flight Search
      </Typography>

      {/* Search Form */}
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={3}>
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
            
            <Grid item xs={12} md={3}>
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
            
            <Grid item xs={12} md={3}>
              <TextField
                id="departure-date"
                label="Departure Date"
                type="date"
                name="departureDate"
                value={searchParams.departureDate}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
                required
                fullWidth
              />
            </Grid>
            
            <Grid item xs={12} md={3}>
              <Button
                type="submit"
                variant="contained"
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

      {/* Filters */}
      <Paper elevation={2} sx={{ p: 2, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">
            {filteredFlights.length} {filteredFlights.length === 1 ? 'Flight' : 'Flights'} Found
          </Typography>
          
          <Button
            startIcon={<FilterIcon />}
            onClick={() => setShowFilters(!showFilters)}
            endIcon={<ExpandMoreIcon sx={{ transform: showFilters ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s' }} />}
          >
            Filters
          </Button>
        </Box>
        
        <Collapse in={showFilters}>
          <Box sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel id="airline-label">Airline</InputLabel>
                  <Select
                    labelId="airline-label"
                    id="airline"
                    name="airline"
                    value={filters.airline}
                    label="Airline"
                    onChange={handleFilterChange}
                  >
                    <MenuItem value="">All Airlines</MenuItem>
                    {airlines.map((airline) => (
                      <MenuItem key={airline} value={airline}>{airline}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <TextField
                  id="max-price"
                  label="Max Price"
                  type="number"
                  name="maxPrice"
                  value={filters.maxPrice}
                  onChange={handleFilterChange}
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                />
              </Grid>
              
              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel id="sort-by-label">Sort By</InputLabel>
                  <Select
                    labelId="sort-by-label"
                    id="sort-by"
                    name="sortBy"
                    value={filters.sortBy}
                    label="Sort By"
                    onChange={handleFilterChange}
                  >
                    <MenuItem value="price">Price (Low to High)</MenuItem>
                    <MenuItem value="departure">Departure Time</MenuItem>
                    <MenuItem value="duration">Flight Duration</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Box>
        </Collapse>
      </Paper>

      {/* Loading and Error States */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      )}
      
      {error && (
        <Alert severity="error" sx={{ mb: 4 }}>
          {error}
        </Alert>
      )}

      {/* Flight Results */}
      {!loading && !error && filteredFlights.length === 0 && searchParams.departureCity && (
        <Alert severity="info" sx={{ mb: 4 }}>
          No flights found matching your criteria. Please try different search parameters.
        </Alert>
      )}
      
      {!loading && filteredFlights.map((flight) => (
        <Card key={flight._id} sx={{ mb: 3, '&:hover': { boxShadow: 6 } }}>
          <CardContent>
            <Grid container spacing={2}>
              <Grid item xs={12} md={3}>
                <Typography variant="subtitle1" fontWeight="bold">
                  {flight.airline}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Flight {flight.flightNumber}
                </Typography>
                <Chip 
                  label={`${flight.availableSeats} seats left`} 
                  size="small" 
                  color={flight.availableSeats < 10 ? "error" : "success"}
                  sx={{ mt: 1 }}
                />
              </Grid>
              
              <Grid item xs={12} md={3}>
                <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <TakeoffIcon color="primary" sx={{ mr: 1 }} />
                    <Typography variant="body1">
                      {formatDateTime(flight.departureTime)}
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {flight.departureCity}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 2, mb: 1 }}>
                    <LandIcon color="primary" sx={{ mr: 1 }} />
                    <Typography variant="body1">
                      {formatDateTime(flight.arrivalTime)}
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {flight.arrivalCity}
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={12} md={3}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <TimeIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="body1">
                    Duration: {calculateDuration(flight.departureTime, flight.arrivalTime)}
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={12} md={3}>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <MoneyIcon color="primary" sx={{ mr: 1 }} />
                    <Typography variant="h6" color="primary">
                      ${flight.price.toFixed(2)}
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    per passenger
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
          
          <Divider />
          
          <CardActions sx={{ justifyContent: 'flex-end', p: 2 }}>
            <Button 
              variant="contained" 
              onClick={() => handleFlightSelect(flight._id)}
              startIcon={<FlightIcon />}
            >
              Select Flight
            </Button>
          </CardActions>
        </Card>
      ))}
    </Container>
  );
};

export default FlightSearch;