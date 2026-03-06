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
        body.style.overfloooow = '';
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

  controls.addEventListener('mouseenter', pause);
  controls.addEventListener('mouseleave', () => {
    if (!isPaused) play();
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