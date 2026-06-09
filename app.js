/* ==========================================================================
   EMS - EXPONENTIAL MICROSERVICES CUSTOM JAVASCRIPT APPLICATION LOGIC
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    // Initialize Navigation & Event Listeners
    initNavigation();
    initTestimonialSlider();
    calculateEstimate(); // Run initial calculation
});

/* ==========================================================================
   1. NAVIGATION HEADER ACTIONS
   ========================================================================== */
function initNavigation() {
    const header = document.getElementById('header-nav');
    
    // Morph header style on scroll
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });
}

// Mobile drawer controls
function toggleMobileMenu() {
    const toggleBtn = document.getElementById('mobile-toggle-btn');
    const drawer = document.getElementById('mobile-drawer');
    
    toggleBtn.classList.toggle('active');
    drawer.classList.toggle('active');
}

/* ==========================================================================
   2. HIGHLIGHT SERVICE CARDS (From footer links)
   ========================================================================== */
function highlightCard(cardId) {
    const card = document.getElementById(cardId);
    if (!card) return;
    
    // Smooth scroll to card
    card.scrollIntoView({ behavior: 'smooth', block: 'center' });
    
    // Add flashing highlight class
    card.classList.add('highlight');
    
    // Remove class after animation finishes
    setTimeout(() => {
        card.classList.remove('highlight');
    }, 1500);
}

/* ==========================================================================
   3. BOOKING MODAL ACTIONS
   ========================================================================== */
const bookingModal = document.getElementById('booking-modal');

function openBookingModal(defaultService = 'General Booking') {
    bookingModal.classList.add('active');
    document.body.style.overflow = 'hidden'; // Stop background scrolling
    
    // Set default value in dropdown if exists
    const select = document.getElementById('book-service');
    if (select) {
        // Match string values in options
        for (let option of select.options) {
            if (option.value.toLowerCase() === defaultService.toLowerCase() || 
                option.text.toLowerCase().includes(defaultService.toLowerCase())) {
                select.value = option.value;
                break;
            }
        }
    }
}

function closeBookingModal() {
    bookingModal.classList.remove('active');
    document.body.style.overflow = 'auto'; // Re-enable scroll
}

// Close modal when clicking outside the container
bookingModal.addEventListener('click', (e) => {
    if (e.target === bookingModal) {
        closeBookingModal();
    }
});

/* ==========================================================================
   4. DYNAMIC PRICE ESTIMATOR
   ========================================================================== */
// Service Base Prices matrix (in Nigerian Naira ₦)
const basePrices = {
    webdev: {
        basic: 15000,
        medium: 45000,
        complex: 120000
    },
    assignments: {
        basic: 3000,
        medium: 8000,
        complex: 20000
    },
    projects: {
        basic: 25000,
        medium: 6000, // wait let's make it 60000
        mediumValue: 60000,
        complex: 150000
    },
    graphics: {
        basic: 5000,
        medium: 12000,
        complex: 30000
    },
    other: {
        basic: 4000,
        medium: 10000,
        complex: 25000
    }
};

// Urgency Speed Multipliers
const urgencyMultipliers = {
    standard: 1.0, // 7-14 Days
    express: 1.3,  // 3-6 Days
    super: 1.6     // 24-48 Hours
};

// Map values for presentation summaries
const displayMappings = {
    services: {
        webdev: 'Web Development',
        assignments: 'Assignment Solutions',
        projects: 'Project Work',
        graphics: 'Graphic Design',
        other: 'Custom Microservice'
    },
    complexities: {
        basic: 'Basic (Template / Low Complexity)',
        medium: 'Medium (Custom Features / Normal Complexity)',
        complex: 'Complex (Full System / Custom Logic)'
    },
    timelines: {
        standard: 'Standard Speed (7 - 14 Days)',
        express: 'Express Speed (3 - 6 Days)',
        super: 'Urgent Speed (24 - 48 Hours)'
    }
};

let previousPrice = 15000;

function calculateEstimate() {
    const serviceVal = document.getElementById('est-service').value;
    const complexityVal = document.querySelector('input[name="complexity"]:checked').value;
    const urgencyVal = document.querySelector('input[name="urgency"]:checked').value;
    
    // Resolve base price
    let base = 0;
    if (serviceVal === 'projects' && complexityVal === 'medium') {
        base = basePrices.projects.mediumValue; // Fix typo key safety
    } else {
        base = basePrices[serviceVal][complexityVal];
    }
    
    const multiplier = urgencyMultipliers[urgencyVal];
    const estimatedTotal = Math.round(base * multiplier);
    
    // Update summary text
    document.getElementById('summary-service').innerText = displayMappings.services[serviceVal];
    document.getElementById('summary-complexity').innerText = complexityVal.charAt(0).toUpperCase() + complexityVal.slice(1);
    document.getElementById('summary-timeline').innerText = displayMappings.timelines[urgencyVal];
    
    // Animate price numbers
    animatePriceCounter(previousPrice, estimatedTotal);
    previousPrice = estimatedTotal;
}

// Price Count Animation
function animatePriceCounter(start, end) {
    const priceDisplay = document.getElementById('estimated-price');
    const duration = 400; // ms
    const startTime = performance.now();
    
    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing out function
        const ease = 1 - Math.pow(1 - progress, 3);
        const currentVal = Math.round(start + (end - start) * ease);
        
        // Format with thousand separator
        priceDisplay.innerText = currentVal.toLocaleString();
        
        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }
    requestAnimationFrame(update);
}

/* ==========================================================================
   5. WHATSAPP LINK GENERATORS & REDIRECTS
   ========================================================================== */
const bookingPhone = '2347062155519'; // Format: country-code without +

// Book using Estimator parameters
function bookWithEstimate() {
    const serviceVal = document.getElementById('est-service').value;
    const complexityVal = document.querySelector('input[name="complexity"]:checked').value;
    const urgencyVal = document.querySelector('input[name="urgency"]:checked').value;
    
    const serviceText = displayMappings.services[serviceVal];
    const complexityText = displayMappings.complexities[complexityVal];
    const timelineText = displayMappings.timelines[urgencyVal];
    const priceFormatted = previousPrice.toLocaleString();
    
    const message = `Hello Exponential Microservices (EMS) team! 👋
    
I calculated a quote estimate on your website and would like to finalize booking this service:

*Service:* ${serviceText}
*Complexity:* ${complexityText}
*Timeline:* ${timelineText}
*Estimated Investment:* ₦${priceFormatted}

Please let me know how we can proceed with details and file transfers!`;

    const encodedMessage = encodeURIComponent(message);
    const waUrl = `https://wa.me/${bookingPhone}?text=${encodedMessage}`;
    
    window.open(waUrl, '_blank');
}

// Book using Booking Modal Form
function submitBookingForm(event) {
    event.preventDefault(); // Stop form submission reloading page
    
    const name = document.getElementById('book-name').value;
    const service = document.getElementById('book-service').value;
    const urgency = document.getElementById('book-urgency').value;
    const phone = document.getElementById('book-phone').value;
    const details = document.getElementById('book-details').value;
    
    const message = `Hello Exponential Microservices (EMS) team! 👋
    
I want to book a microservice from the website portal. Here are my booking details:

*Client Name:* ${name}
*WhatsApp Contact:* ${phone}
*Requested Service:* ${service}
*Delivery Urgency:* ${urgency}

*Project Scope / Instructions:*
${details}

Looking forward to your swift response!`;

    const encodedMessage = encodeURIComponent(message);
    const waUrl = `https://wa.me/${bookingPhone}?text=${encodedMessage}`;
    
    // Open WhatsApp
    window.open(waUrl, '_blank');
    
    // Cleanup form and close modal
    document.getElementById('modal-booking-form').reset();
    closeBookingModal();
}

/* ==========================================================================
   6. TESTIMONIAL SLIDER CAROUSEL
   ========================================================================== */
let currentSlide = 0;
let slideInterval;

function initTestimonialSlider() {
    const track = document.getElementById('testimonials-track');
    const slides = track.children;
    
    if (slides.length <= 1) return;
    
    // Auto slide timer
    startAutoSlide();
    
    // Pause auto-sliding on hover
    const container = document.querySelector('.testimonials-slider-container');
    container.addEventListener('mouseenter', () => clearInterval(slideInterval));
    container.addEventListener('mouseleave', () => startAutoSlide());
}

function startAutoSlide() {
    slideInterval = setInterval(() => {
        slideReviews(1);
    }, 6000);
}

function slideReviews(direction) {
    const track = document.getElementById('testimonials-track');
    const slides = track.children;
    const totalSlides = slides.length;
    
    currentSlide = (currentSlide + direction + totalSlides) % totalSlides;
    
    // Apply sliding transform offset
    const offset = -currentSlide * 100;
    track.style.transform = `translateX(${offset}%)`;
}
