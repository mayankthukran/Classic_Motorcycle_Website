// This file will handle event-specific functionality
// For example, loading events from an API, event filtering logic, etc.

// In this demo version, we'll use mock data which is defined in app.js
// For a real application, you would fetch events from an API

// Sample function to load events from API
// Uncomment and modify this if you want to connect to a real backend
/*
async function fetchEvents() {
    try {
        const response = await fetch('https://api.example.com/events');
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching events:', error);
        return getMockEvents(); // Fall back to mock data
    }
}
*/

// Sample function to filter events based on various criteria
function filterEventsByMultipleCriteria(events, criteria) {
    return events.filter(event => {
        // Filter by date range
        if (criteria.startDate && criteria.endDate) {
            const eventDate = new Date(event.date);
            const startDate = new Date(criteria.startDate);
            const endDate = new Date(criteria.endDate);
            if (eventDate < startDate || eventDate > endDate) {
                return false;
            }
        }
        
        // Filter by category
        if (criteria.category && criteria.category !== 'all') {
            if (event.category !== criteria.category) {
                return false;
            }
        }
        
        // Filter by price range
        if (criteria.minPrice !== undefined && criteria.maxPrice !== undefined) {
            if (event.price < criteria.minPrice || event.price > criteria.maxPrice) {
                return false;
            }
        }
        
        // Filter by search term
        if (criteria.searchTerm) {
            const term = criteria.searchTerm.toLowerCase();
            return event.title.toLowerCase().includes(term) || 
                   event.description.toLowerCase().includes(term) ||
                   event.location.toLowerCase().includes(term);
        }
        
        return true;
    });
}

// Example advanced search functionality (not currently used in UI)
function performAdvancedSearch() {
    // Get search criteria from form elements (this would need to be added to the HTML)
    const criteria = {
        searchTerm: document.getElementById('search-input').value.trim(),
        category: document.querySelector('.category-btn.active')?.dataset.category,
        startDate: document.getElementById('start-date')?.value,
        endDate: document.getElementById('end-date')?.value,
        minPrice: document.getElementById('min-price')?.value,
        maxPrice: document.getElementById('max-price')?.value
    };
    
    // Get events
    const events = getMockEvents();
    
    // Filter events
    const filteredEvents = filterEventsByMultipleCriteria(events, criteria);
    
    // Display filtered events
    displayEvents(filteredEvents);
}

// Helper function to display events (used with advanced filtering)
function displayEvents(events) {
    // Clear current events
    const eventsContainer = document.getElementById('events-container');
    eventsContainer.innerHTML = '';
    
    if (events.length === 0) {
        eventsContainer.innerHTML = `
            <div class="no-events">
                <h3>No events found</h3>
                <p>Try different search criteria.</p>
            </div>
        `;
        return;
    }
    
    // Display events
    events.forEach(event => {
        const eventCard = createEventCard(event);
        eventsContainer.appendChild(eventCard);
    });
}

// Mock function to get featured or recommended events
function getFeaturedEvents() {
    const events = getMockEvents();
    // In a real app, you might have a "featured" flag or some algorithm
    // For demo, just return a random subset
    return events.sort(() => 0.5 - Math.random()).slice(0, 3);
}

// Function to get upcoming events (soonest first)
function getUpcomingEvents() {
    const events = getMockEvents();
    return events.sort((a, b) => new Date(a.date) - new Date(b.date));
}

// Function to get events by popularity (in a real app, this might be based on bookings)
function getPopularEvents() {
    const events = getMockEvents();
    // For demo, we'll just use a random order
    return events.sort(() => 0.5 - Math.random());
}

// Export functions for use in other files (not actually needed in this implementation)
// export { getFeaturedEvents, getUpcomingEvents, getPopularEvents };