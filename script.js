document.addEventListener('DOMContentLoaded', () => {
  const logo = document.querySelector('header .logo');
  if (logo) {
    logo.style.cursor = 'pointer';
    logo.addEventListener('click', () => {
      window.location.href = 'https://ozyern.me';
    });
  }

  // ===== MOBILE MENU =====
  const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
  const nav = document.querySelector('header nav');
  const header = document.querySelector('header');
  const body = document.body;

  if (mobileMenuToggle && nav) {
    mobileMenuToggle.addEventListener('click', () => {
      mobileMenuToggle.classList.toggle('active');
      nav.classList.toggle('active');
      header.classList.toggle('menu-active');
      body.style.overflow = nav.classList.contains('active') ? 'hidden' : '';
    });

    // Close menu when clicking on a nav link
    const navLinks = nav.querySelectorAll('a');
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        mobileMenuToggle.classList.remove('active');
        nav.classList.remove('active');
        header.classList.remove('menu-active');
        body.style.overflow = '';
      });
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
      if (!e.target.closest('header') && nav.classList.contains('active')) {
        mobileMenuToggle.classList.remove('active');
        nav.classList.remove('active');
        header.classList.remove('menu-active');
        body.style.overflow = '';
      }
    });
  }

  // ===== HERO SLIDER =====
  const slides = document.querySelectorAll('.hero .slide');
  const indicatorsContainer = document.querySelector('.rs-indicators');
  const pausePlayBtn = document.querySelector('.rs-pause-play');
  const pauseIcon = pausePlayBtn.querySelector('.icon');
  const controls = document.querySelector('.rs-controls');

  if (slides.length === 0) return;

  // Set appropriate background images based on screen size
  function setBackgroundImages() {
    const isMobile = window.innerWidth <= 768;
    slides.forEach(slide => {
      const desktopImg = slide.getAttribute('data-desktop');
      const mobileImg = slide.getAttribute('data-mobile');
      const imageUrl = isMobile ? mobileImg : desktopImg;
      slide.style.backgroundImage = `url('${imageUrl}')`;
    });
  }

  // Set initial images
  setBackgroundImages();

  // Update on resize
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      setBackgroundImages();
    }, 250);
  });

  let currentIndex = 0;
  let intervalId = null;
  let isPaused = false;

  const slideDuration = 6000;

  // Create dots
  slides.forEach((_, index) => {
    const dot = document.createElement('div');
    dot.classList.add('rs-dot');
    dot.addEventListener('click', () => {
      goToSlide(index);
      pause();
    });
    indicatorsContainer.appendChild(dot);
  });

  const dots = document.querySelectorAll('.rs-dot');

  function goToSlide(index) {
    if (index === currentIndex) return;

    slides[currentIndex].classList.remove('active');
    dots[currentIndex].classList.remove('active');

    setTimeout(() => {
      slides[index].classList.add('active');
      dots[index].classList.add('active');
      currentIndex = index;
      resetProgress();
    }, 800);
  }

  function resetProgress() {
    dots.forEach(dot => {
      dot.style.setProperty('--progress', '0%');
    });

    // Small delay to trigger animation
    setTimeout(() => {
      dots[currentIndex].style.setProperty('--progress', '100%');
    }, 50);
  }

  function startAutoPlay() {
    if (isPaused) return;
    intervalId = setInterval(() => {
      const next = (currentIndex + 1) % slides.length;
      goToSlide(next);
    }, slideDuration);
  }

  function pause() {
    isPaused = true;
    clearInterval(intervalId);
    pauseIcon.textContent = '▶';
    controls.classList.add('rs-paused');
  }

  function play() {
    isPaused = false;
    startAutoPlay();
    pauseIcon.textContent = '||';
    controls.classList.remove('rs-paused');
  }

  pausePlayBtn.addEventListener('click', () => {
    if (isPaused) play();
    else pause();
  });

  // Touch swipe support for mobile
  let touchStartX = 0;
  let touchEndX = 0;

  const heroSection = document.querySelector('.hero');
  
  if (heroSection) {
    heroSection.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    heroSection.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      handleSwipe();
    }, { passive: true });
  }

  function handleSwipe() {
    const swipeThreshold = 50;
    const diff = touchStartX - touchEndX;

    if (Math.abs(diff) > swipeThreshold) {
      if (diff > 0) {
        // Swipe left - next slide
        const next = (currentIndex + 1) % slides.length;
        goToSlide(next);
      } else {
        // Swipe right - previous slide
        const prev = (currentIndex - 1 + slides.length) % slides.length;
        goToSlide(prev);
      }
      pause();
    }
  }

  // Init
  slides[0].classList.add('active');
  dots[0].classList.add('active');
  resetProgress();
  startAutoPlay();
});

// Optimized Custom Cursor with Smooth Performance
// Disable cursor on touch devices
const isTouchDevice = () => {
    return (('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || (navigator.msMaxTouchPoints > 0));
};

const cursorGlow = document.getElementById('cursorGlow');
let mouseX = 0;
let mouseY = 0;
let cursorX = 0;
let cursorY = 0;
let isVisible = true;
let activeTimeout;

// Smooth easing factor (optimized for 300Hz displays)
const easing = 0.22;

// Initialize cursor position (only on non-touch devices)
if (cursorGlow && !isTouchDevice()) {
    cursorGlow.style.transform = 'translate3d(0, 0, 0)';
    cursorGlow.style.webkitTransform = 'translate3d(0, 0, 0)';
    cursorGlow.style.display = 'block';
    cursorGlow.style.opacity = '1';
    cursorGlow.style.willChange = 'transform';
} else if (cursorGlow) {
    cursorGlow.style.display = 'none';
}

function animateCursor() {
    // Smooth exponential moving average
    cursorX += (mouseX - cursorX) * easing;
    cursorY += (mouseY - cursorY) * easing;
    
    if (cursorGlow && isVisible && !isTouchDevice()) {
        cursorGlow.style.transform = `translate3d(${cursorX}px, ${cursorY}px, 0)`;
        cursorGlow.style.webkitTransform = `translate3d(${cursorX}px, ${cursorY}px, 0)`;
    }
    
    requestAnimationFrame(animateCursor);
}

// Only attach cursor events on non-touch devices
if (!isTouchDevice()) {
    // Force cursor: none on all elements to prevent default cursor from showing
    const style = document.createElement('style');
    style.textContent = `
        * { cursor: none !important; }
        #cursorGlow {
            will-change: transform;
            -webkit-backface-visibility: hidden;
            backface-visibility: hidden;
            -webkit-perspective: 1000;
            perspective: 1000;
        }
        .hero, .rom-cards, .devices, body {
            -webkit-font-smoothing: antialiased;
            -webkit-backface-visibility: hidden;
            backface-visibility: hidden;
        }
        .rom-card, .device-card, .news-card {
            will-change: transform;
            -webkit-backface-visibility: hidden;
            backface-visibility: hidden;
        }
    `;
    document.head.appendChild(style);
    
    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        isVisible = true;
        
        if (cursorGlow) {
            cursorGlow.style.opacity = '1';
            cursorGlow.style.display = 'block';
            cursorGlow.style.cursor = 'none';
            
            // Add active class on movement
            if (!cursorGlow.classList.contains('active')) {
                cursorGlow.classList.add('active');
            }
            
            // Debounce active removal
            clearTimeout(activeTimeout);
            activeTimeout = setTimeout(() => {
                cursorGlow.classList.remove('active');
            }, 800);
        }
    }, { passive: true });

    document.addEventListener('mouseenter', () => {
        isVisible = true;
        if (cursorGlow) {
            cursorGlow.style.opacity = '1';
            cursorGlow.style.display = 'block';
            cursorGlow.classList.add('active');
        }
    });

    document.addEventListener('mouseleave', () => {
        isVisible = false;
        if (cursorGlow) {
            cursorGlow.style.opacity = '0';
            cursorGlow.style.display = 'none';
            cursorGlow.classList.remove('active');
            clearTimeout(activeTimeout);
        }
    });

    // Click feedback
    document.addEventListener('mousedown', (e) => {
        if (cursorGlow) {
            cursorGlow.classList.add('clicking');
            cursorGlow.style.cursor = 'none';
        }
    });

    document.addEventListener('mouseup', () => {
        if (cursorGlow) {
            cursorGlow.classList.remove('clicking');
            cursorGlow.style.cursor = 'none';
        }
    });

    document.addEventListener('click', (e) => {
        isVisible = true;
        if (cursorGlow) {
            cursorGlow.style.opacity = '1';
            cursorGlow.style.display = 'block';
            cursorGlow.style.cursor = 'none';
        }
    });

    // Performance Optimization: Scroll speed optimization
    let scrolling = false;
    let scrollTimeout;
    
    window.addEventListener('scroll', () => {
        if (!scrolling) {
            scrolling = true;
            document.documentElement.style.scrollBehavior = 'auto';
        }
        
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
            scrolling = false;
        }, 150);
    }, { passive: true });

    // Enable GPU acceleration on the document
    document.documentElement.style.willChange = 'scroll-position';
    document.body.style.webkitFontSmoothing = 'antialiased';
    document.body.style.webkitTextSizeAdjust = '100%';

    animateCursor();
}