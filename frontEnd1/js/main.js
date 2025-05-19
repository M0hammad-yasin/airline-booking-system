// Main JavaScript file for the homepage

// Base URL for API
const API_BASE_URL = 'http://localhost:3000/api/v1';

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    // Set minimum date for departure date input to today
    const departureDateInput = document.getElementById('departureDate');
    if (departureDateInput) {
        const today = new Date();
        const formattedDate = today.toISOString().split('T')[0];
        departureDateInput.min = formattedDate;
        
        // Set default value to today
        departureDateInput.value = formattedDate;
    }
    
    // Setup search form
    const searchForm = document.getElementById('searchForm');
    if (searchForm) {
        searchForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const departureCity = document.getElementById('departureCity').value;
            const arrivalCity = document.getElementById('arrivalCity').value;
            const departureDate = document.getElementById('departureDate').value;
            
            // Redirect to flights page with search parameters
            window.location.href = `flights.html?departureCity=${encodeURIComponent(departureCity)}&arrivalCity=${encodeURIComponent(arrivalCity)}&departureDate=${encodeURIComponent(departureDate)}`;
        });
    }
    
    // Load popular destinations (this would normally come from an API)
    loadPopularDestinations();
});

// Function to load popular destinations
function loadPopularDestinations() {
    // This would normally fetch from an API, but we'll use mock data for demonstration
    const popularDestinations = [
        { city: 'New York', country: 'USA', price: 299 },
        { city: 'London', country: 'UK', price: 399 },
        { city: 'Tokyo', country: 'Japan', price: 799 },
        { city: 'Paris', country: 'France', price: 349 },
        { city: 'Sydney', country: 'Australia', price: 899 },
        { city: 'Dubai', country: 'UAE', price: 499 }
    ];
    
    // Display popular destinations if container exists
    const container = document.getElementById('popularDestinations');
    if (container) {
        const destinationsHTML = popularDestinations.map(destination => `
            <div class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition duration-300">
                <div class="h-32 bg-gray-300 flex items-center justify-center">
                    <div class="text-2xl font-bold text-white">${destination.city}</div>
                </div>
                <div class="p-4">
                    <div class="font-semibold">${destination.city}, ${destination.country}</div>
                    <div class="text-sm text-gray-600 mb-2">Starting from</div>
                    <div class="text-blue-600 font-bold">$${destination.price}</div>
                    <button 
                        class="mt-2 w-full bg-blue-600 text-white py-1 px-2 rounded hover:bg-blue-700 transition duration-300 text-sm"
                        onclick="searchDestination('${destination.city}')"
                    >
                        Find Flights
                    </button>
                </div>
            </div>
        `).join('');
        
        container.innerHTML = destinationsHTML;
    }
}

// Function to search for a specific destination
function searchDestination(city) {
    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0];
    
    // Redirect to flights page with search parameters
    // Using 'Any City' as departure for demonstration
    window.location.href = `flights.html?departureCity=Any%20City&arrivalCity=${encodeURIComponent(city)}&departureDate=${formattedDate}`;
}