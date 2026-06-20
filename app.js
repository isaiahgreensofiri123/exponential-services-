/* ==========================================================================
   EMS - EXPONENTIAL MICROSERVICES — APPLICATION LOGIC
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    initMobileMenu();
    initBookingModal();
    initHeroSlider();
    initTestimonialSlider();
    initEstimator();
});

/* ==========================================================================
   1. HEADER SCROLL STATE
   ========================================================================== */
function initNavigation() {
    const header = document.getElementById('header-nav');
    if (!header) return;

    const onScroll = () => {
        header.classList.toggle('scrolled', window.scrollY > 50);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
}

/* ==========================================================================
   2. MOBILE MENU
   ========================================================================== */
function initMobileMenu() {
    const toggleBtn = document.getElementById('mobile-toggle-btn');
    const drawer = document.getElementById('mobile-drawer');
    if (!toggleBtn || !drawer) return;

    toggleBtn.setAttribute('aria-expanded', 'false');

    toggleBtn.addEventListener('click', () => toggleMobileMenu());

    // Close on Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && drawer.classList.contains('active')) {
            toggleMobileMenu(false);
        }
    });

    // Close automatically if the viewport grows back to desktop size
    window.addEventListener('resize', () => {
        if (window.innerWidth > 860 && drawer.classList.contains('active')) {
            toggleMobileMenu(false);
        }
    });
}

function toggleMobileMenu(forceState) {
    const toggleBtn = document.getElementById('mobile-toggle-btn');
    const drawer = document.getElementById('mobile-drawer');
    if (!toggleBtn || !drawer) return;

    const shouldOpen = typeof forceState === 'boolean'
        ? forceState
        : !drawer.classList.contains('active');

    toggleBtn.classList.toggle('active', shouldOpen);
    drawer.classList.toggle('active', shouldOpen);
    toggleBtn.setAttribute('aria-expanded', String(shouldOpen));
    document.body.style.overflow = shouldOpen ? 'hidden' : '';
}

/* ==========================================================================
   3. HIGHLIGHT SERVICE CARDS (from footer links)
   ========================================================================== */
function highlightCard(cardId) {
    const card = document.getElementById(cardId);
    if (!card) return;

    card.scrollIntoView({ behavior: 'smooth', block: 'center' });
    card.classList.add('highlight');
    setTimeout(() => card.classList.remove('highlight'), 1500);
}

/* ==========================================================================
   4. BOOKING MODAL
   ========================================================================== */
function initBookingModal() {
    const modal = document.getElementById('booking-modal');
    const form = document.getElementById('modal-booking-form');
    if (!modal) return;

    // Close on overlay click (but not clicks inside the modal box)
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeBookingModal();
    });

    // Close on Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeBookingModal();
        }
    });

    if (form) form.addEventListener('submit', submitBookingForm);
}

function openBookingModal(defaultService = 'General Booking') {
    const modal = document.getElementById('booking-modal');
    if (!modal) return;

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';

    const select = document.getElementById('book-service');
    if (select) {
        const match = Array.from(select.options).find((opt) =>
            opt.value.toLowerCase() === defaultService.toLowerCase() ||
            opt.text.toLowerCase().includes(defaultService.toLowerCase())
        );
        if (match) select.value = match.value;
    }

    const nameInput = document.getElementById('book-name');
    if (nameInput) nameInput.focus();
}

function closeBookingModal() {
    const modal = document.getElementById('booking-modal');
    if (!modal) return;
    modal.classList.remove('active');
    document.body.style.overflow = '';
}

/* ==========================================================================
   5. DYNAMIC PRICE ESTIMATOR
   ========================================================================== */
// Base prices in Nigerian Naira (₦) by service + complexity
const BASE_PRICES = {
    webdev:      { basic: 15000, medium: 45000,  complex: 120000 },
    assignments: { basic: 3000,  medium: 8000,   complex: 20000  },
    projects:    { basic: 25000, medium: 60000,  complex: 150000 },
    graphics:    { basic: 5000,  medium: 12000,  complex: 30000  },
    other:       { basic: 4000,  medium: 10000,  complex: 25000  },
};

// Delivery speed multipliers
const URGENCY_MULTIPLIERS = {
    standard: 1.0, // 7-14 days
    express: 1.3,  // 3-6 days
    super: 1.6,    // 24-48 hours
};

const DISPLAY = {
    services: {
        webdev: 'Web Development',
        assignments: 'Assignment Solutions',
        projects: 'Project Work',
        graphics: 'Graphic Design',
        other: 'Custom Microservice',
    },
    complexities: {
        basic: 'Basic (Template / Low Complexity)',
        medium: 'Medium (Custom Features / Normal Complexity)',
        complex: 'Complex (Full System / Custom Logic)',
    },
    timelines: {
        standard: 'Standard Speed (7 - 14 Days)',
        express: 'Express Speed (3 - 6 Days)',
        super: 'Urgent Speed (24 - 48 Hours)',
    },
};

let currentPrice = BASE_PRICES.webdev.basic;
let priceAnimationFrame = null;

function initEstimator() {
    const form = document.getElementById('estimator-form');
    if (!form) return;

    form.addEventListener('change', calculateEstimate);
    calculateEstimate(); // initial render
}

function getEstimatorSelection() {
    const serviceEl = document.getElementById('est-service');
    const complexityEl = document.querySelector('input[name="complexity"]:checked');
    const urgencyEl = document.querySelector('input[name="urgency"]:checked');

    return {
        service: serviceEl ? serviceEl.value : 'webdev',
        complexity: complexityEl ? complexityEl.value : 'basic',
        urgency: urgencyEl ? urgencyEl.value : 'standard',
    };
}

function calculateEstimate() {
    const { service, complexity, urgency } = getEstimatorSelection();

    const base = BASE_PRICES[service]?.[complexity] ?? BASE_PRICES.other.basic;
    const multiplier = URGENCY_MULTIPLIERS[urgency] ?? 1;
    const total = Math.round(base * multiplier);

    const summaryService = document.getElementById('summary-service');
    const summaryComplexity = document.getElementById('summary-complexity');
    const summaryTimeline = document.getElementById('summary-timeline');

    if (summaryService) summaryService.textContent = DISPLAY.services[service];
    if (summaryComplexity) summaryComplexity.textContent = complexity.charAt(0).toUpperCase() + complexity.slice(1);
    if (summaryTimeline) summaryTimeline.textContent = DISPLAY.timelines[urgency];

    animatePriceCounter(currentPrice, total);
    currentPrice = total;
}

function animatePriceCounter(start, end) {
    const priceDisplay = document.getElementById('estimated-price');
    if (!priceDisplay) return;

    if (priceAnimationFrame) cancelAnimationFrame(priceAnimationFrame);

    const duration = 400;
    const startTime = performance.now();

    function tick(now) {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const value = Math.round(start + (end - start) * eased);

        priceDisplay.textContent = value.toLocaleString();

        if (progress < 1) {
            priceAnimationFrame = requestAnimationFrame(tick);
        }
    }
    priceAnimationFrame = requestAnimationFrame(tick);
}

/* ==========================================================================
   6. WHATSAPP BOOKING
   ========================================================================== */
const BOOKING_PHONE = '2347062155519'; // country code, no leading +

function openWhatsApp(message) {
    const url = `https://wa.me/${BOOKING_PHONE}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank', 'noopener');
}

// Book using the estimator's current selection
function bookWithEstimate() {
    const { service, complexity, urgency } = getEstimatorSelection();
    const priceFormatted = currentPrice.toLocaleString();

    const message = `Hello Exponential Microservices (EMS) team! 👋

I calculated a quote estimate on your website and would like to finalize booking this service:

*Service:* ${DISPLAY.services[service]}
*Complexity:* ${DISPLAY.complexities[complexity]}
*Timeline:* ${DISPLAY.timelines[urgency]}
*Estimated Investment:* ₦${priceFormatted}

Please let me know how we can proceed with details and file transfers!`;

    openWhatsApp(message);
}

// Book using the modal form
function submitBookingForm(event) {
    event.preventDefault();

    const name = document.getElementById('book-name').value.trim();
    const service = document.getElementById('book-service').value;
    const urgency = document.getElementById('book-urgency').value;
    const phone = document.getElementById('book-phone').value.trim();
    const details = document.getElementById('book-details').value.trim();

    const message = `Hello Exponential Microservices (EMS) team! 👋

I want to book a microservice from the website portal. Here are my booking details:

*Client Name:* ${name}
*WhatsApp Contact:* ${phone}
*Requested Service:* ${service}
*Delivery Urgency:* ${urgency}

*Project Scope / Instructions:*
${details}

Looking forward to your swift response!`;

    openWhatsApp(message);

    event.target.reset();
    closeBookingModal();
}

/* ==========================================================================
   7. HERO SLIDER (rotates through the four service showcases)
   ========================================================================== */
const HERO_AUTO_SLIDE_MS = 5000;
let heroSlideIndex = 0;
let heroSlideInterval = null;
let heroTouchStartX = 0;

function initHeroSlider() {
    const track = document.getElementById('hero-slider-track');
    const slider = document.getElementById('hero-slider');
    if (!track || track.children.length <= 1) return;

    startHeroAutoSlide();

    if (slider) {
        slider.addEventListener('mouseenter', stopHeroAutoSlide);
        slider.addEventListener('mouseleave', startHeroAutoSlide);

        slider.addEventListener('touchstart', (e) => {
            heroTouchStartX = e.touches[0].clientX;
            stopHeroAutoSlide();
        }, { passive: true });

        slider.addEventListener('touchend', (e) => {
            const deltaX = e.changedTouches[0].clientX - heroTouchStartX;
            if (Math.abs(deltaX) > 40) {
                slideHero(deltaX < 0 ? 1 : -1);
            }
            setTimeout(startHeroAutoSlide, HERO_AUTO_SLIDE_MS);
        }, { passive: true });
    }

    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            stopHeroAutoSlide();
        } else {
            startHeroAutoSlide();
        }
    });
}

function startHeroAutoSlide() {
    stopHeroAutoSlide();
    heroSlideInterval = setInterval(() => slideHero(1), HERO_AUTO_SLIDE_MS);
}

function stopHeroAutoSlide() {
    if (heroSlideInterval) {
        clearInterval(heroSlideInterval);
        heroSlideInterval = null;
    }
}

function renderHeroSlide() {
    const track = document.getElementById('hero-slider-track');
    if (!track) return;

    track.style.transform = `translateX(${-heroSlideIndex * 100}%)`;

    document.querySelectorAll('.hero-dot').forEach((dot, i) => {
        dot.classList.toggle('active', i === heroSlideIndex);
    });
}

function slideHero(direction) {
    const track = document.getElementById('hero-slider-track');
    if (!track) return;

    const total = track.children.length;
    heroSlideIndex = (heroSlideIndex + direction + total) % total;
    renderHeroSlide();
}

function goToHeroSlide(index) {
    heroSlideIndex = index;
    renderHeroSlide();
    stopHeroAutoSlide();
    startHeroAutoSlide();
}

/* ==========================================================================
   8. TESTIMONIAL SLIDER
   ========================================================================== */
const AUTO_SLIDE_INTERVAL_MS = 6000;
let currentSlide = 0;
let slideInterval = null;

function initTestimonialSlider() {
    const track = document.getElementById('testimonials-track');
    const container = document.querySelector('.testimonials-slider-container');
    if (!track || track.children.length <= 1) return;

    startAutoSlide();

    if (container) {
        container.addEventListener('mouseenter', stopAutoSlide);
        container.addEventListener('mouseleave', startAutoSlide);
        // Pause on touch for mobile users actively swiping/reading
        container.addEventListener('touchstart', stopAutoSlide, { passive: true });
        container.addEventListener('touchend', () => {
            setTimeout(startAutoSlide, AUTO_SLIDE_INTERVAL_MS);
        }, { passive: true });
    }

    // Pause when the tab isn't visible to avoid jank on return
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            stopAutoSlide();
        } else {
            startAutoSlide();
        }
    });
}

function startAutoSlide() {
    stopAutoSlide();
    slideInterval = setInterval(() => slideReviews(1), AUTO_SLIDE_INTERVAL_MS);
}

function stopAutoSlide() {
    if (slideInterval) {
        clearInterval(slideInterval);
        slideInterval = null;
    }
}

function slideReviews(direction) {
    const track = document.getElementById('testimonials-track');
    if (!track) return;

    const totalSlides = track.children.length;
    currentSlide = (currentSlide + direction + totalSlides) % totalSlides;
    track.style.transform = `translateX(${-currentSlide * 100}%)`;
}