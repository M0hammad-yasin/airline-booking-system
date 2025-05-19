import { Box, Container, Typography, Link, Grid, Divider } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <Box
      component="footer"
      sx={{
        py: 3,
        px: 2,
        mt: 'auto',
        backgroundColor: (theme) => theme.palette.grey[100],
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          <Grid item xs={12} sm={4}>
            <Typography variant="h6" color="text.primary" gutterBottom>
              SkyBooker
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Your trusted partner for hassle-free flight bookings and travel management.
            </Typography>
          </Grid>
          
          <Grid item xs={12} sm={4}>
            <Typography variant="h6" color="text.primary" gutterBottom>
              Quick Links
            </Typography>
            <Link component={RouterLink} to="/" color="inherit" display="block" sx={{ mb: 1 }}>
              Home
            </Link>
            <Link component={RouterLink} to="/flights" color="inherit" display="block" sx={{ mb: 1 }}>
              Search Flights
            </Link>
            <Link component={RouterLink} to="/my-bookings" color="inherit" display="block" sx={{ mb: 1 }}>
              My Bookings
            </Link>
          </Grid>
          
          <Grid item xs={12} sm={4}>
            <Typography variant="h6" color="text.primary" gutterBottom>
              Support
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Need help with your booking?
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Email: support@skybooker.com
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Phone: +1 (555) 123-4567
            </Typography>
          </Grid>
        </Grid>
        
        <Divider sx={{ my: 2 }} />
        
        <Typography variant="body2" color="text.secondary" align="center">
          {'© '}
          {currentYear}
          {' SkyBooker. All rights reserved.'}
        </Typography>
      </Container>
    </Box>
  );
};

export default Footer;