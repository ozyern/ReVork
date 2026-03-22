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
      // Close dropdown when toggling mobile menu
      const dropdownParent = document.querySelector('.dropdown-parent');
      if (dropdownParent) {
        dropdownParent.classList.remove('active');
      }
    });

    // Close menu when clicking on a nav link
    const navLinks = nav.querySelectorAll('a');
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        mobileMenuToggle.classList.remove('active');
        nav.classList.remove('active');
        header.classList.remove('menu-active');
        body.style.overflow = '';
        // Also close dropdown
        const dropdownParent = document.querySelector('.dropdown-parent');
        if (dropdownParent) {
          dropdownParent.classList.remove('active');
        }
      });
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
      if (!e.target.closest('header') && nav.classList.contains('active')) {
        mobileMenuToggle.classList.remove('active');
        nav.classList.remove('active');
        header.classList.remove('menu-active');
        body.style.overflow = '';
        // Also close dropdown
        const dropdownParent = document.querySelector('.dropdown-parent');
        if (dropdownParent) {
          dropdownParent.classList.remove('active');
        }
      }
    });
  }

  // ===== DROPDOWN MENU =====
  const dropdownTrigger = document.querySelector('.dropdown-trigger');
  const dropdownParent = document.querySelector('.dropdown-parent');

  if (dropdownTrigger && dropdownParent) {
    dropdownTrigger.addEventListener('click', (e) => {
      e.preventDefault();
      dropdownParent.classList.toggle('active');
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.dropdown-parent') && dropdownParent.classList.contains('active')) {
        dropdownParent.classList.remove('active');
      }
    });

    // Close dropdown when clicking on Rom card or link inside
    const dropdownLinks = dropdownParent.querySelectorAll('a');
    dropdownLinks.forEach(link => {
      if (link !== dropdownTrigger) {
        link.addEventListener('click', () => {
          dropdownParent.classList.remove('active');
        });
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

// Optimized Custom Cursor with Performance Enhancements
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
let isNowVisible = true;  // Track visibility state to prevent redundant updates
let hasActiveClass = false;  // Cache active class state
let isAnimationFrameScheduled = false;

// Smooth easing factor for motion - tuned for natural tracking
const easing = 0.15;  // Lower = smoother, more natural following motion

// Check for reduced motion preference
const prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Initialize cursor position (only on non-touch devices)
if (cursorGlow && !isTouchDevice()) {
    cursorGlow.style.left = '0px';
    cursorGlow.style.top = '0px';
    cursorGlow.style.display = 'block';
    cursorGlow.style.opacity = '1';
} else if (cursorGlow) {
    cursorGlow.style.display = 'none';
}

function updateCursorVisibility(shouldBeVisible) {
    if (isNowVisible === shouldBeVisible) return;  // Skip if state hasn't changed
    
    isNowVisible = shouldBeVisible;
    if (cursorGlow) {
        if (shouldBeVisible) {
            cursorGlow.style.opacity = '1';
            cursorGlow.style.display = 'block';
        } else {
            cursorGlow.style.opacity = '0';
            cursorGlow.style.display = 'none';
        }
    }
}

function updateCursorActive(shouldBeActive) {
    if (hasActiveClass === shouldBeActive) return;  // Skip if state hasn't changed
    
    hasActiveClass = shouldBeActive;
    if (cursorGlow) {
        if (shouldBeActive) {
            cursorGlow.classList.add('active');
        } else {
            cursorGlow.classList.remove('active');
        }
    }
}

function animateCursor() {
    // Skip animation if reduced motion is preferred
    if (prefersReducedMotion) return;
    
    // Use optimized easing factor
    cursorX += (mouseX - cursorX) * easing;
    cursorY += (mouseY - cursorY) * easing;
    
    if (cursorGlow && isNowVisible && !isTouchDevice()) {
        // Use transform for GPU acceleration (more performant than left/top)
        cursorGlow.style.transform = `translate(${Math.round(cursorX)}px, ${Math.round(cursorY)}px) translateZ(0)`;
    }
    
    isAnimationFrameScheduled = false;
    requestAnimationFrame(animateCursor);
}

// Only attach cursor events on non-touch devices and if motion is not reduced
if (!isTouchDevice() && !prefersReducedMotion) {
    // Force cursor: none on all elements to prevent default cursor from showing
    const style = document.createElement('style');
    style.textContent = `* { cursor: none !important; }`;
    document.head.appendChild(style);
    
    // Throttled mousemove handler for better performance
    let lastMoveTime = 0;
    const moveThrottle = 16;  // ~60fps throttle (16ms per frame)
    
    document.addEventListener('mousemove', (e) => {
        const now = performance.now();
        
        mouseX = e.clientX;
        mouseY = e.clientY;
        
        // Update visibility and active state immediately
        updateCursorVisibility(true);
        updateCursorActive(true);
        
        // Debounce active removal - cancel if already pending
        clearTimeout(activeTimeout);
        activeTimeout = setTimeout(() => {
            updateCursorActive(false);
        }, 600);  // Faster response to motion idle
    }, { passive: true });

    window.addEventListener('mouseover', () => {
        updateCursorVisibility(true);
        updateCursorActive(true);
    }, { passive: true });

    window.addEventListener('mouseout', () => {
        updateCursorVisibility(false);
        updateCursorActive(false);
        clearTimeout(activeTimeout);
    }, { passive: true });

    // Click feedback with improved handling to prevent glitches
    let isClicking = false;
    
    document.addEventListener('mousedown', () => {
        if (cursorGlow && !isClicking) {
            isClicking = true;
            cursorGlow.classList.add('clicking');
        }
    }, { passive: true });

    document.addEventListener('mouseup', () => {
        if (cursorGlow && isClicking) {
            isClicking = false;
            cursorGlow.classList.remove('clicking');
        }
    }, { passive: true });

    // Ensure click state is cleared if mouse leaves window during click
    window.addEventListener('mouseout', (e) => {
        if (e.target === window || e.relatedTarget === null) {
            if (cursorGlow && isClicking) {
                isClicking = false;
                cursorGlow.classList.remove('clicking');
            }
        }
    }, { passive: true });

    animateCursor();
} else if (cursorGlow) {
    // Hide cursor on touch devices
    cursorGlow.style.display = 'none';
}