// Hero Slideshow
const slides = document.querySelectorAll('.slide');
const indicators = document.querySelectorAll('.indicator');
const pauseBtn = document.querySelector('.pause-btn');
let currentSlide = 0;
const totalSlides = slides.length;
const slideInterval = 5000; // 5 seconds
let isPlaying = true;
let slideshowTimer;

function showSlide(index) {
    // Remove active class from all slides and indicators
    slides.forEach(slide => slide.classList.remove('active'));
    indicators.forEach(indicator => indicator.classList.remove('active'));
    
    // Add active class to current slide and indicator
    slides[index].classList.add('active');
    indicators[index].classList.add('active');
}

function nextSlide() {
    currentSlide = (currentSlide + 1) % totalSlides;
    showSlide(currentSlide);
}

function startSlideshow() {
    slideshowTimer = setInterval(nextSlide, slideInterval);
    isPlaying = true;
    if (pauseBtn) pauseBtn.textContent = '||';
}

function stopSlideshow() {
    clearInterval(slideshowTimer);
    isPlaying = false;
    if (pauseBtn) pauseBtn.textContent = '▶';
}

// Auto-start slideshow
startSlideshow();

// Pause/Play button
if (pauseBtn) {
    pauseBtn.addEventListener('click', () => {
        if (isPlaying) {
            stopSlideshow();
        } else {
            startSlideshow();
        }
    });
}

// Indicator click handlers
indicators.forEach((indicator, index) => {
    indicator.addEventListener('click', () => {
        currentSlide = index;
        showSlide(currentSlide);
        
        // Reset timer when manually changing slides
        if (isPlaying) {
            clearInterval(slideshowTimer);
            startSlideshow();
        }
    });
});

// Smooth scroll for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href === '#' || href === '#learn-more') {
            e.preventDefault();
            return;
        }
        
        e.preventDefault();
        const target = document.querySelector(href);
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});
