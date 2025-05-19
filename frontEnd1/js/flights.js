// Flight search and booking related functions

// Base URL for API
const API_BASE_URL = 'http://localhost:3000/api/v1';

// DOM Elements
let flightsContainer;
let noFlightsMessage;
let searchCriteriaContainer;
let bookingModal;
let flightDetailsContainer;
let bookingForm;
let addPassengerBtn;
let passengersContainer;
let totalPriceElement;
let closeModalBtn;

// Current flight price for booking calculations
let currentFlightPrice = 0;
let passengerCount = 1;

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    // Get DOM elements
    flightsContainer = document.getElementById('flightsContainer');
    noFlightsMessage = document.getElementById('noFlightsMessage');
    searchCriteriaContainer = document.getElementById('searchCriteria');
    bookingModal = document.getElementById('bookingModal');
    flightDetailsContainer = document.getElementById('flightDetails');
    bookingForm = document.getElementById('bookingForm');
    addPassengerBtn = document.getElementById('addPassenger');
    passengersContainer = document.getElementById('passengersContainer');
    totalPriceElement = document.getElementById('totalPrice');
    closeModalBtn = document.getElementById('closeModal');
    
    // Check for search parameters in URL
    const urlParams = new URLSearchParams(window.location.search);
    const departureCity = urlParams.get('departureCity');
    const arrivalCity = urlParams.get('arrivalCity');
    const departureDate = urlParams.get('departureDate');
    
    if (departureCity && arrivalCity && departureDate) {
        // Display search criteria
        displaySearchCriteria(departureCity, arrivalCity, departureDate);
        
        // Search flights with parameters
        searchFlights(departureCity, arrivalCity, departureDate);
    }
    
    // Setup event listeners
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', () => {
            bookingModal.classList.add('hidden');
        });
    }
    
    if (addPassengerBtn) {
        addPassengerBtn.addEventListener('click', addPassengerField);
    }
    
    if (bookingForm) {
        bookingForm.addEventListener('submit', handleBookingSubmit);
    }
});

// Function to display search criteria
function displaySearchCriteria(departureCity, arrivalCity, departureDate) {
    if (!searchCriteriaContainer) return;
    
    const formattedDate = new Date(departureDate).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    searchCriteriaContainer.innerHTML = `
        <div class="flex flex-wrap gap-2">
            <span class="font-semibold">From:</span> ${departureCity}
            <span class="font-semibold ml-4">To:</span> ${arrivalCity}
            <span class="font-semibold ml-4">Date:</span> ${formattedDate}
        </div>
    `;
}

// Function to search flights
async function searchFlights(departureCity, arrivalCity, departureDate) {
    if (!flightsContainer) return;
    
    try {
        // Show loading state
        flightsContainer.innerHTML = '<div class="text-center py-8"><div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div><p class="mt-2 text-gray-600">Searching for flights...</p></div>';
        
        // Build query parameters
        const params = new URLSearchParams();
        if (departureCity) params.append('departureCity', departureCity);
        if (arrivalCity) params.append('arrivalCity', arrivalCity);
        if (departureDate) params.append('departureDate', departureDate);
        
        // Make API request
        const response = await axios.get(`${API_BASE_URL}/flights?${params.toString()}`);
        const flights = response.data;
        
        // Display flights
        displayFlights(flights);
    } catch (error) {
        console.error('Error searching flights:', error.response?.data || error.message);
        flightsContainer.innerHTML = `
            <div class="text-center py-8 text-red-600">
                <p>Error searching for flights. Please try again.</p>
                <p class="text-sm mt-2">${error.response?.data?.message || error.message}</p>
            </div>
        `;
    }
}

// Function to display flights
function displayFlights(flights) {
    if (!flightsContainer || !noFlightsMessage) return;
    
    if (!flights || flights.length === 0) {
        noFlightsMessage.textContent = 'No flights found matching your criteria. Please try different search parameters.';
        noFlightsMessage.classList.remove('hidden');
        flightsContainer.innerHTML = '';
        return;
    }
    
    // Hide no flights message
    noFlightsMessage.classList.add('hidden');
    
    // Create HTML for flights
    const flightsHTML = flights.map(flight => {
        const departureTime = new Date(flight.departureTime).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });
        
        const arrivalTime = new Date(flight.arrivalTime).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });
        
        const departureDate = new Date(flight.departureTime).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
        
        // Calculate flight duration
        const durationMs = new Date(flight.arrivalTime) - new Date(flight.departureTime);
        const hours = Math.floor(durationMs / (1000 * 60 * 60));
        const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
        const duration = `${hours}h ${minutes}m`;
        
        return `
            <div class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition duration-300">
                <div class="flex flex-col md:flex-row justify-between items-start md:items-center">
                    <div class="mb-4 md:mb-0">
                        <div class="text-gray-500 mb-1">${flight.airline}</div>
                        <div class="flex items-center">
                            <div class="text-xl font-bold">${departureTime}</div>
                            <div class="mx-3 text-gray-400">→</div>
                            <div class="text-xl font-bold">${arrivalTime}</div>
                        </div>
                        <div class="text-sm text-gray-500 mt-1">
                            <span>${flight.departureCity}</span>
                            <span class="mx-2">to</span>
                            <span>${flight.arrivalCity}</span>
                        </div>
                    </div>
                    
                    <div class="flex flex-col items-end">
                        <div class="text-sm text-gray-500 mb-1">${departureDate}</div>
                        <div class="text-sm text-gray-500 mb-2">Duration: ${duration}</div>
                        <div class="text-xl font-bold text-blue-600 mb-2">$${flight.price.toFixed(2)}</div>
                        <div class="text-sm text-gray-500 mb-3">${flight.availableSeats} seats left</div>
                        <button 
                            class="bg-blue-600 text-white py-1 px-4 rounded hover:bg-blue-700 transition duration-300 book-flight-btn"
                            data-flight-id="${flight._id}"
                            data-flight-number="${flight.flightNumber}"
                            data-airline="${flight.airline}"
                            data-departure-city="${flight.departureCity}"
                            data-arrival-city="${flight.arrivalCity}"
                            data-departure-time="${flight.departureTime}"
                            data-arrival-time="${flight.arrivalTime}"
                            data-price="${flight.price}"
                        >
                            Book Now
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
    
    flightsContainer.innerHTML = flightsHTML;
    
    // Add event listeners to book buttons
    document.querySelectorAll('.book-flight-btn').forEach(button => {
        button.addEventListener('click', () => {
            const flightData = button.dataset;
            openBookingModal(flightData);
        });
    });
}

// Function to open booking modal
function openBookingModal(flightData) {
    if (!bookingModal || !flightDetailsContainer || !bookingForm) return;
    
    // Reset form
    bookingForm.reset();
    resetPassengers();
    
    // Set flight ID in hidden field
    document.getElementById('flightId').value = flightData.flightId;
    
    // Store current flight price
    currentFlightPrice = parseFloat(flightData.price);
    updateTotalPrice();
    
    // Format dates
    const departureTime = new Date(flightData.departureTime).toLocaleString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
    
    const arrivalTime = new Date(flightData.arrivalTime).toLocaleString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
    
    // Display flight details
    flightDetailsContainer.innerHTML = `
        <h3 class="font-semibold text-blue-800 mb-2">${flightData.airline} - ${flightData.flightNumber}</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <div class="text-sm text-gray-500">Departure</div>
                <div class="font-semibold">${flightData.departureCity}</div>
                <div>${departureTime}</div>
            </div>
            <div>
                <div class="text-sm text-gray-500">Arrival</div>
                <div class="font-semibold">${flightData.arrivalCity}</div>
                <div>${arrivalTime}</div>
            </div>
        </div>
        <div class="mt-2">
            <div class="text-sm text-gray-500">Price per passenger</div>
            <div class="font-semibold text-blue-600">$${parseFloat(flightData.price).toFixed(2)}</div>
        </div>
    `;
    
    // Show modal
    bookingModal.classList.remove('hidden');
}

// Function to add passenger field
function addPassengerField() {
    passengerCount++;
    
    const newPassengerField = document.createElement('div');
    newPassengerField.innerHTML = `
        <div class="flex justify-between items-center">
            <h3 class="font-semibold text-gray-700 mb-2">Passenger ${passengerCount}</h3>
            <button type="button" class="text-red-500 hover:text-red-700 remove-passenger" data-passenger="${passengerCount}">
                Remove
            </button>
        </div>
        <div class="space-y-3 p-3 border border-gray-200 rounded-lg mb-4">
            <div>
                <label for="passengerName${passengerCount}" class="block text-gray-700 mb-1">Full Name</label>
                <input type="text" id="passengerName${passengerCount}" name="passengerName${passengerCount}" class="w-full p-2 border border-gray-300 rounded" required>
            </div>
            <div>
                <label for="passengerEmail${passengerCount}" class="block text-gray-700 mb-1">Email</label>
                <input type="email" id="passengerEmail${passengerCount}" name="passengerEmail${passengerCount}" class="w-full p-2 border border-gray-300 rounded" required>
            </div>
            <div>
                <label for="passengerPassport${passengerCount}" class="block text-gray-700 mb-1">Passport Number</label>
                <input type="text" id="passengerPassport${passengerCount}" name="passengerPassport${passengerCount}" class="w-full p-2 border border-gray-300 rounded" required>
            </div>
        </div>
    `;
    
    passengersContainer.appendChild(newPassengerField);
    
    // Add event listener to remove button
    const removeBtn = newPassengerField.querySelector('.remove-passenger');
    if (removeBtn) {
        removeBtn.addEventListener('click', function() {
            newPassengerField.remove();
            passengerCount--;
            updateTotalPrice();
        });
    }
    
    updateTotalPrice();
}

// Function to reset passengers
function resetPassengers() {
    passengerCount = 1;
    
    if (passengersContainer) {
        passengersContainer.innerHTML = `
            <h3 class="font-semibold text-gray-700 mb-2">Passenger 1</h3>
            <div class="space-y-3 p-3 border border-gray-200 rounded-lg mb-4">
                <div>
                    <label for="passengerName1" class="block text-gray-700 mb-1">Full Name</label>
                    <input type="text" id="passengerName1" name="passengerName1" class="w-full p-2 border border-gray-300 rounded" required>
                </div>
                <div>
                    <label for="passengerEmail1" class="block text-gray-700 mb-1">Email</label>
                    <input type="email" id="passengerEmail1" name="passengerEmail1" class="w-full p-2 border border-gray-300 rounded" required>
                </div>
                <div>
                    <label for="passengerPassport1" class="block text-gray-700 mb-1">Passport Number</label>
                    <input type="text" id="passengerPassport1" name="passengerPassport1" class="w-full p-2 border border-gray-300 rounded" required>
                </div>
            </div>
        `;
    }
}

// Function to update total price
function updateTotalPrice() {
    if (totalPriceElement) {
        const total = currentFlightPrice * passengerCount;
        totalPriceElement.textContent = `$${total.toFixed(2)}`;
    }
}

// Function to handle booking form submission
async function handleBookingSubmit(e) {
    e.preventDefault();
    
    const token = localStorage.getItem('token');
    if (!token) {
        alert('Please login to book a flight');
        window.location.href = 'login.html';
        return;
    }
    
    try {
        // Get flight ID
        const flightId = document.getElementById('flightId').value;
        
        // Collect passenger information
        const passengers = [];
        
        for (let i = 1; i <= passengerCount; i++) {
            const name = document.getElementById(`passengerName${i}`).value;
            const email = document.getElementById(`passengerEmail${i}`).value;
            const passportNumber = document.getElementById(`passengerPassport${i}`).value;
            
            passengers.push({ name, email, passportNumber });
        }
        
        // Create booking
        const response = await axios.post(
            `${API_BASE_URL}/bookings`,
            { flight: flightId, passengers },
            { headers: { Authorization: `Bearer ${token}` }}
        );
        
        // Process payment
        const bookingId = response.data._id;
        const paymentResponse = await axios.post(
            `${API_BASE_URL}/payments`,
            { bookingId, paymentMethod: 'credit_card' },
            { headers: { Authorization: `Bearer ${token}` }}
        );
        
        // Close modal
        bookingModal.classList.add('hidden');
        
        // Show success message
        alert('Booking successful! You will be redirected to your bookings page.');
        
        // Redirect to bookings page
        window.location.href = 'bookings.html';
    } catch (error) {
        console.error('Booking error:', error.response?.data || error.message);
        alert(`Booking failed: ${error.response?.data?.message || error.message}`);
    }
}