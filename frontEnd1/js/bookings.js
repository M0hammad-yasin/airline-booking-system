// Bookings related functions

// Base URL for API
const API_BASE_URL = 'http://localhost:3000/api/v1';

// DOM Elements
let authRequiredDiv;
let bookingsSection;
let bookingsContainer;
let noBookingsMessage;
let bookingDetailsModal;
let closeDetailsModalBtn;
let bookingDetailsContentDiv;
let checkInButton;
let cancelBookingButton;

// Current booking ID for modal actions
let currentBookingId = null;

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    // Get DOM elements
    authRequiredDiv = document.getElementById('authRequired');
    bookingsSection = document.getElementById('bookingsSection');
    bookingsContainer = document.getElementById('bookingsContainer');
    noBookingsMessage = document.getElementById('noBookingsMessage');
    bookingDetailsModal = document.getElementById('bookingDetailsModal');
    closeDetailsModalBtn = document.getElementById('closeDetailsModal');
    bookingDetailsContentDiv = document.getElementById('bookingDetailsContent');
    checkInButton = document.getElementById('checkInButton');
    cancelBookingButton = document.getElementById('cancelBookingButton');

    // Check if user is logged in
    const token = localStorage.getItem('token');

    if (!token) {
        // Show auth required message
        if (authRequiredDiv) authRequiredDiv.classList.remove('hidden');
        if (bookingsSection) bookingsSection.classList.add('hidden');
    } else {
        // Hide auth required message and show bookings section
        if (authRequiredDiv) authRequiredDiv.classList.add('hidden');
        if (bookingsSection) bookingsSection.classList.remove('hidden');

        // Fetch and display user bookings
        fetchBookings(token);
    }

    // Setup event listeners for modal
    if (closeDetailsModalBtn) {
        closeDetailsModalBtn.addEventListener('click', () => {
            if (bookingDetailsModal) bookingDetailsModal.classList.add('hidden');
        });
    }

    if (cancelBookingButton) {
        cancelBookingButton.addEventListener('click', handleCancelBooking);
    }

    if (checkInButton) {
        checkInButton.addEventListener('click', handleCheckIn);
    }
});

// Function to fetch user bookings
async function fetchBookings(token) {
    if (!bookingsContainer || !noBookingsMessage) return;

    try {
        // Show loading state
        bookingsContainer.innerHTML = '<div class="text-center py-8"><div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div><p class="mt-2 text-gray-600">Loading bookings...</p></div>';
        noBookingsMessage.classList.add('hidden');

        const response = await axios.get(`${API_BASE_URL}/bookings/my`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        const bookings = response.data;

        displayBookings(bookings);

    } catch (error) {
        console.error('Error fetching bookings:', error.response?.data || error.message);
        bookingsContainer.innerHTML = `
            <div class="text-center py-8 text-red-600">
                <p>Error loading bookings. Please try again.</p>
                <p class="text-sm mt-2">${error.response?.data?.message || error.message}</p>
            </div>
        `;
        noBookingsMessage.classList.add('hidden'); // Ensure message is hidden on error
    }
}

// Function to display bookings
function displayBookings(bookings) {
    if (!bookingsContainer || !noBookingsMessage) return;

    if (!bookings || bookings.length === 0) {
        noBookingsMessage.classList.remove('hidden');
        bookingsContainer.innerHTML = ''; // Clear previous results
        return;
    }

    noBookingsMessage.classList.add('hidden');

    const bookingsHTML = bookings.map(booking => {
        const departureTime = new Date(booking.flight.departureTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        const arrivalTime = new Date(booking.flight.arrivalTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        const departureDate = new Date(booking.flight.departureTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

        // Calculate total price
        const totalPassengers = booking.passengers.length;
        const totalPrice = booking.flight.price * totalPassengers;

        return `
            <div class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition duration-300 cursor-pointer view-booking-btn" data-booking-id="${booking._id}">
                <div class="flex flex-col md:flex-row justify-between items-start md:items-center">
                    <div class="mb-4 md:mb-0">
                        <div class="text-gray-500 mb-1">${booking.flight.airline} - ${booking.flight.flightNumber}</div>
                        <div class="flex items-center">
                            <div class="text-xl font-bold">${departureTime}</div>
                            <div class="mx-3 text-gray-400">→</div>
                            <div class="text-xl font-bold">${arrivalTime}</div>
                        </div>
                        <div class="text-sm text-gray-500 mt-1">
                            <span>${booking.flight.departureCity}</span>
                            <span class="mx-2">to</span>
                            <span>${booking.flight.arrivalCity}</span>
                        </div>
                    </div>

                    <div class="flex flex-col items-end">
                        <div class="text-sm text-gray-500 mb-1">${departureDate}</div>
                        <div class="text-sm text-gray-500 mb-2">Passengers: ${totalPassengers}</div>
                        <div class="text-xl font-bold text-blue-600 mb-2">$${totalPrice.toFixed(2)}</div>
                        <div class="text-sm text-gray-500">Status: ${booking.status}</div>
                    </div>
                </div>
            </div>
        `;
    }).join('');

    bookingsContainer.innerHTML = bookingsHTML;

    // Add event listeners to view booking buttons
    document.querySelectorAll('.view-booking-btn').forEach(button => {
        button.addEventListener('click', (event) => {
            const bookingId = event.currentTarget.dataset.bookingId;
            fetchBookingDetails(bookingId, localStorage.getItem('token'));
        });
    });
}

// Function to fetch single booking details
async function fetchBookingDetails(bookingId, token) {
    if (!bookingDetailsContentDiv || !bookingDetailsModal) return;

    try {
        bookingDetailsContentDiv.innerHTML = '<div class="text-center py-4"><div class="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div><p class="mt-2 text-gray-600">Loading details...</p></div>';
        currentBookingId = bookingId;

        const response = await axios.get(`${API_BASE_URL}/bookings/${bookingId}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        const booking = response.data;

        displayBookingDetails(booking);
        bookingDetailsModal.classList.remove('hidden');

    } catch (error) {
        console.error('Error fetching booking details:', error.response?.data || error.message);
        bookingDetailsContentDiv.innerHTML = `
            <div class="text-center py-4 text-red-600">
                <p>Error loading booking details.</p>
                <p class="text-sm mt-2">${error.response?.data?.message || error.message}</p>
            </div>
        `;
    }
}

// Function to display booking details in modal
function displayBookingDetails(booking) {
    if (!bookingDetailsContentDiv || !checkInButton || !cancelBookingButton) return;

    const departureTime = new Date(booking.flight.departureTime).toLocaleString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    const arrivalTime = new Date(booking.flight.arrivalTime).toLocaleString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

    const passengersHTML = booking.passengers.map(p => `
        <div class="border border-gray-200 rounded-lg p-3 mb-2">
            <p><strong>Name:</strong> ${p.name}</p>
            <p><strong>Email:</strong> ${p.email}</p>
            <p><strong>Passport:</strong> ${p.passportNumber}</p>
        </div>
    `).join('');

    const bookingDetailsHTML = `
        <h3 class="font-semibold text-blue-800 mb-2">${booking.flight.airline} - ${booking.flight.flightNumber}</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
                <div class="text-sm text-gray-500">Departure</div>
                <div class="font-semibold">${booking.flight.departureCity}</div>
                <div>${departureTime}</div>
            </div>
            <div>
                <div class="text-sm text-gray-500">Arrival</div>
                <div class="font-semibold">${booking.flight.arrivalCity}</div>
                <div>${arrivalTime}</div>
            </div>
        </div>
        <div class="mb-4">
            <div class="text-sm text-gray-500">Total Price</div>
            <div class="font-semibold text-blue-600">$${booking.totalPrice.toFixed(2)}</div>
        </div>
        <div class="mb-4">
            <div class="text-sm text-gray-500">Status</div>
            <div class="font-semibold">${booking.status}</div>
        </div>
        <div>
            <h4 class="font-semibold text-gray-700 mb-2">Passengers:</h4>
            ${passengersHTML}
        </div>
    `;

    bookingDetailsContentDiv.innerHTML = bookingDetailsHTML;

    // Show/hide check-in button based on status (example logic)
    if (booking.status === 'Confirmed') {
        checkInButton.classList.remove('hidden');
    } else {
        checkInButton.classList.add('hidden');
    }
}

// Function to handle booking cancellation
async function handleCancelBooking() {
    if (!currentBookingId) return;

    const token = localStorage.getItem('token');
    if (!token) {
        alert('Please login to cancel a booking');
        window.location.href = 'login.html';
        return;
    }

    if (confirm('Are you sure you want to cancel this booking?')) {
        try {
            await axios.delete(`${API_BASE_URL}/bookings/${currentBookingId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            alert('Booking cancelled successfully!');
            if (bookingDetailsModal) bookingDetailsModal.classList.add('hidden');
            // Refresh bookings list
            fetchBookings(token);

        } catch (error) {
            console.error('Error cancelling booking:', error.response?.data || error.message);
            alert(`Cancellation failed: ${error.response?.data?.message || error.message}`);
        }
    }
}

// Function to handle check-in
async function handleCheckIn() {
     if (!currentBookingId) return;

    const token = localStorage.getItem('token');
    if (!token) {
        alert('Please login to check in');
        window.location.href = 'login.html';
        return;
    }

    if (confirm('Proceed with check-in?')) {
        try {
            // Assuming a check-in endpoint exists
            await axios.post(`${API_BASE_URL}/bookings/${currentBookingId}/check-in`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });

            alert('Check-in successful!');
            if (bookingDetailsModal) bookingDetailsModal.classList.add('hidden');
            // Refresh bookings list
            fetchBookings(token);

        } catch (error) {
            console.error('Error during check-in:', error.response?.data || error.message);
            alert(`Check-in failed: ${error.response?.data?.message || error.message}`);
        }
    }
}