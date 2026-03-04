document.addEventListener('DOMContentLoaded', () => {
  const slides = document.querySelectorAll('.hero .slide');
  const indicatorsContainer = document.querySelector('.rs-indicators');
  const pausePlayBtn = document.querySelector('.rs-pause-play');
  const pauseIcon = pausePlayBtn.querySelector('.icon');
  const controls = document.querySelector('.rs-controls');

  if (slides.length === 0) return;

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

  // Init
  slides[0].classList.add('active');
  dots[0].classList.add('active');
  resetProgress();
  startAutoPlay();
});