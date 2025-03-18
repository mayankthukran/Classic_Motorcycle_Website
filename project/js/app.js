// Handle hash change for navigation
window.addEventListener('hashchange', handleNavigation);
window.addEventListener('load', handleNavigation);

// Functions

// Check authentication status
function checkAuthStatus() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const authVisibleElements = document.querySelectorAll('.auth-visible');
    const authHiddenElements = document.querySelectorAll('.auth-hidden');

    if (currentUser) {
        // User is logged in
        authVisibleElements.forEach(el => el.style.display = 'none');
        authHiddenElements.forEach(el => el.style.display = 'block');
        
        // Update profile info
        document.getElementById('profile-name').textContent = currentUser.name;
        document.getElementById('profile-email').textContent = currentUser.email;
        
        // Load user's bookings
        loadUserBookings();
    } else {
        // User is not logged in
        authVisibleElements.forEach(el => el.style.display = 'block');
        authHiddenElements.forEach(el => el.style.display = 'none');
    }
}

// Open modal
function openModal(modal) {
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden'; // Prevent scrolling when modal is open
}

// Close modal
function closeModal(modal) {
    modal.style.display = 'none';
    document.body.style.overflow = 'auto'; // Re-enable scrolling
    
    // Clear form fields and error messages
    const form = modal.querySelector('form');
    if (form) {
        form.reset();
        const errorEl = modal.querySelector('.error-message');
        if (errorEl) {
            errorEl.style.display = 'none';
        }
    }
}

// Load events
function loadEvents() {
    // Clear current events
    eventsContainer.innerHTML = '';
    
    // Get events from mock data
    const events = getMockEvents();
    
    // Display events
    events.forEach(event => {
        const eventCard = createEventCard(event);
        eventsContainer.appendChild(eventCard);
    });
}

// Filter events
function filterEvents(filterType, filterValue) {
    // Clear current events
    eventsContainer.innerHTML = '';
    
    // Get all events
    const events = getMockEvents();
    
    // Filter events based on filter type
    let filteredEvents;
    
    if (filterType === 'category') {
        filteredEvents = events.filter(event => event.category === filterValue);
    } else if (filterType === 'search') {
        filteredEvents = events.filter(event => 
            event.title.toLowerCase().includes(filterValue) || 
            event.description.toLowerCase().includes(filterValue) ||
            event.location.toLowerCase().includes(filterValue) ||
            event.category.toLowerCase().includes(filterValue)
        );
    }
    
    // Display filtered events
    if (filteredEvents.length === 0) {
        eventsContainer.innerHTML = `
            <div class="no-events">
                <h3>No events found</h3>
                <p>Try a different search term or category.</p>
            </div>
        `;
    } else {
        filteredEvents.forEach(event => {
            const eventCard = createEventCard(event);
            eventsContainer.appendChild(eventCard);
        });
    }
}

// Create event card
function createEventCard(event) {
    const div = document.createElement('div');
    div.className = 'event-card';
    div.innerHTML = `
        <div class="event-image" style="background-image: url(${event.image})"></div>
        <div class="event-info">
            <span class="event-date">${formatDate(event.date)}</span>
            <h3 class="event-title">${event.title}</h3>
            <div class="event-details">
                <i class="fas fa-map-marker-alt"></i>
                <span>${event.location}</span>
            </div>
            <div class="event-details">
                <i class="fas fa-tag"></i>
                <span>${event.category}</span>
            </div>
            <div class="event-actions">
                <button class="btn btn-primary view-details" data-id="${event.id}">View Details</button>
                <span class="event-price">${event.price === 0 ? 'Free' : '$' + event.price}</span>
            </div>
        </div>
    `;
    
    // Add event listener to view details button
    div.querySelector('.view-details').addEventListener('click', () => {
        showEventDetails(event);
    });
    
    return div;
}

// Show event details
function showEventDetails(event) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const isLoggedIn = !!currentUser;
    
    // Check if event is already booked
    let isBooked = false;
    if (isLoggedIn) {
        const bookings = JSON.parse(localStorage.getItem('bookings')) || [];
        isBooked = bookings.some(booking => 
            booking.userId === currentUser.id && booking.eventId === event.id
        );
    }
    
    eventDetailsContent.innerHTML = `
        <div class="event-image-large" style="background-image: url(${event.image})"></div>
        <div class="event-details-info">
            <h2>${event.title}</h2>
            <div class="event-meta">
                <div class="event-meta-item">
                    <i class="fas fa-calendar-alt"></i>
                    <span>${formatDate(event.date)}</span>
                </div>
                <div class="event-meta-item">
                    <i class="fas fa-clock"></i>
                    <span>${event.time}</span>
                </div>
                <div class="event-meta-item">
                    <i class="fas fa-map-marker-alt"></i>
                    <span>${event.location}</span>
                </div>
                <div class="event-meta-item">
                    <i class="fas fa-tag"></i>
                    <span>${event.category}</span>
                </div>
                <div class="event-meta-item">
                    <i class="fas fa-ticket-alt"></i>
                    <span>${event.price === 0 ? 'Free' : '$' + event.price}</span>
                </div>
            </div>
            <div class="event-description">
                <h3>About this event</h3>
                <p>${event.description}</p>
            </div>
            <div class="action-buttons">
                ${isLoggedIn ? 
                    (isBooked ? 
                        '<button class="btn btn-secondary" disabled>Already Booked</button>' : 
                        `<button class="btn btn-primary" id="book-event" data-id="${event.id}">Book Now</button>`
                    ) : 
                    '<button class="btn btn-secondary" id="login-to-book">Login to Book</button>'
                }
                <button class="btn btn-secondary" id="close-details">Close</button>
            </div>
        </div>
    `;
    
    // Add event listeners to buttons
    const closeDetailsBtn = document.getElementById('close-details');
    closeDetailsBtn.addEventListener('click', () => {
        closeModal(eventDetailsModal);
    });
    
    const bookEventBtn = document.getElementById('book-event');
    if (bookEventBtn) {
        bookEventBtn.addEventListener('click', () => {
            bookEvent(event);
        });
    }
    
    const loginToBookBtn = document.getElementById('login-to-book');
    if (loginToBookBtn) {
        loginToBookBtn.addEventListener('click', () => {
            closeModal(eventDetailsModal);
            openModal(loginModal);
        });
    }
    
    // Open the modal
    openModal(eventDetailsModal);
}

// Book event
function bookEvent(event) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    if (!currentUser) {
        openModal(loginModal);
        return;
    }
    
    // Get existing bookings or create empty array
    const bookings = JSON.parse(localStorage.getItem('bookings')) || [];
    
    // Create new booking
    const newBooking = {
        id: generateId(),
        userId: currentUser.id,
        eventId: event.id,
        event: event, // Store the whole event object for easy access
        bookingDate: new Date().toISOString(),
        status: 'Confirmed'
    };
    
    // Add to bookings
    bookings.push(newBooking);
    
    // Save to localStorage
    localStorage.setItem('bookings', JSON.stringify(bookings));
    
    // Close event details modal
    closeModal(eventDetailsModal);
    
    // Show confirmation modal
    openModal(bookingConfirmationModal);
    
    // Update bookings display if on bookings page
    if (window.location.hash === '#bookings') {
        loadUserBookings();
    }
}

// Load user bookings
function loadUserBookings() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    if (!currentUser || !bookingsContainer) return;
    
    // Clear current bookings
    bookingsContainer.innerHTML = '';
    
    // Get user's bookings
    const bookings = JSON.parse(localStorage.getItem('bookings')) || [];
    const userBookings = bookings.filter(booking => booking.userId === currentUser.id);
    
    // Display bookings
    if (userBookings.length === 0) {
        bookingsContainer.innerHTML = `
            <div class="no-bookings">
                <h3>No bookings found</h3>
                <p>Browse events and book your first event!</p>
                <a href="#events" class="btn btn-primary">Browse Events</a>
            </div>
        `;
    } else {
        userBookings.forEach(booking => {
            const bookingCard = createBookingCard(booking);
            bookingsContainer.appendChild(bookingCard);
        });
    }
}

// Create booking card
function createBookingCard(booking) {
    const event = booking.event;
    const div = document.createElement('div');
    div.className = 'booking-card';
    div.innerHTML = `
        <div class="event-image" style="background-image: url(${event.image})"></div>
        <span class="booking-status">${booking.status}</span>
        <div class="event-info">
            <h3 class="event-title">${event.title}</h3>
            <div class="event-details">
                <i class="fas fa-calendar-alt"></i>
                <span>${formatDate(event.date)}</span>
            </div>
            <div class="event-details">
                <i class="fas fa-clock"></i>
                <span>${event.time}</span>
            </div>
            <div class="event-details">
                <i class="fas fa-map-marker-alt"></i>
                <span>${event.location}</span>
            </div>
            <div class="booking-actions">
                <button class="btn btn-primary view-booking-details" data-id="${booking.id}">View Details</button>
                <button class="btn btn-secondary cancel-booking" data-id="${booking.id}">Cancel</button>
            </div>
        </div>
    `;
    
    // Add event listeners to buttons
    div.querySelector('.view-booking-details').addEventListener('click', () => {
        showEventDetails(event);
    });
    
    div.querySelector('.cancel-booking').addEventListener('click', () => {
        cancelBooking(booking.id);
    });
    
    return div;
}

// Cancel booking
function cancelBooking(bookingId) {
    if (confirm('Are you sure you want to cancel this booking?')) {
        // Get bookings
        let bookings = JSON.parse(localStorage.getItem('bookings')) || [];
        
        // Remove booking
        bookings = bookings.filter(booking => booking.id !== bookingId);
        
        // Save to localStorage
        localStorage.setItem('bookings', JSON.stringify(bookings));
        
        // Update bookings display
        loadUserBookings();
    }
}

// Handle navigation based on hash
function handleNavigation() {
    const hash = window.location.hash || '#';
    
    // Hide all sections
    const sections = document.querySelectorAll('section');
    sections.forEach(section => {
        if (!section.id) return;
        
        if (section.id === 'profile' || section.id === 'bookings') {
            // These sections depend on auth status, don't hide them here
            return;
        }
        
        section.style.display = 'block';
    });
    
    // Show active section based on hash
    switch (hash) {
        case '#profile':
        case '#bookings':
            const currentUser = JSON.parse(localStorage.getItem('currentUser'));
            if (currentUser) {
                document.getElementById(hash.substring(1)).scrollIntoView();
            } else {
                window.location.hash = '#';
                openModal(loginModal);
            }
            break;
        case '#events':
        case '#about':
            document.getElementById(hash.substring(1)).scrollIntoView();
            break;
    }
    
    // Update active nav link
    const navLinks = document.querySelectorAll('nav ul li a');
    navLinks.forEach(link => {
        if (link.getAttribute('href') === hash) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

// Format date
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
}

// Generate unique ID
function generateId() {
    return '_' + Math.random().toString(36).substr(2, 9);
}

// Get mock events data
function getMockEvents() {
    return [
        {
            id: '1',
            title: 'Tech Conference 2025',
            date: '2025-05-15',
            time: '09:00 AM - 05:00 PM',
            location: 'Convention Center, New York',
            category: 'tech',
            description: 'Join us for the biggest tech conference of the year featuring keynotes from industry leaders, workshops, and networking opportunities.',
            price: 299,
            image: 'https://source.unsplash.com/random/800x600/?tech'
        },
        {
            id: '2',
            title: 'Summer Music Festival',
            date: '2025-06-20',
            time: '02:00 PM - 11:00 PM',
            location: 'Central Park, New York',
            category: 'music',
            description: 'Enjoy a day of amazing music performances from top artists across multiple genres. Food and drinks available on site.',
            price: 150,
            image: 'https://source.unsplash.com/random/800x600/?concert'
        },
        {
            id: '3',
            title: 'Startup Networking Meetup',
            date: '2025-04-10',
            time: '06:30 PM - 09:00 PM',
            location: 'Innovation Hub, San Francisco',
            category: 'business',
            description: 'Connect with fellow entrepreneurs, investors, and startup enthusiasts. Share ideas and build valuable relationships.',
            price: 0,
            image: 'https://source.unsplash.com/random/800x600/?networking'
        },
        {
            id: '4',
            title: 'Basketball Championship Finals',
            date: '2025-05-30',
            time: '07:00 PM - 10:00 PM',
            location: 'Sports Arena, Los Angeles',
            category: 'sports',
            description: 'Watch the thrilling finals of the basketball championship. Witness the best teams battle for the trophy.',
            price: 200,
            image: 'https://source.unsplash.com/random/800x600/?basketball'
        },
        {
            id: '5',
            title: 'Art Exhibition: Modern Perspectives',
            date: '2025-04-25',
            time: '10:00 AM - 08:00 PM',
            location: 'Metropolitan Gallery, Chicago',
            category: 'arts',
            description: 'Explore contemporary art pieces from emerging artists. Guided tours available throughout the day.',
            price: 25,
            image: 'https://source.unsplash.com/random/800x600/?art'
        },
        {
            id: '6',
            title: 'Web Development Workshop',
            date: '2025-04-18',
            time: '09:30 AM - 04:30 PM',
            location: 'Tech Campus, Seattle',
            category: 'tech',
            description: 'Learn the latest web development technologies and frameworks from industry experts. Hands-on exercises included.',
            price: 150,
            image: 'https://source.unsplash.com/random/800x600/?coding'
        },
        {
            id: '7',
            title: 'Jazz Night',
            date: '2025-05-10',
            time: '08:00 PM - 11:00 PM',
            location: 'Blue Note Club, New Orleans',
            category: 'music',
            description: 'Enjoy a night of smooth jazz music performed by renowned musicians. Dinner and drinks available.',
            price: 85,
            image: 'https://source.unsplash.com/random/800x600/?jazz'
        },
        {
            id: '8',
            title: 'Investment Strategies Seminar',
            date: '2025-06-05',
            time: '10:00 AM - 02:00 PM',
            location: 'Financial District, New York',
            category: 'business',
            description: 'Learn proven investment strategies from financial experts. Topics include stocks, real estate, and retirement planning.',
            price: 120,
            image: 'https://source.unsplash.com/random/800x600/?finance'
        }
    ];
}
