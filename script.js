document.addEventListener('DOMContentLoaded', () => {
    const slides = document.querySelectorAll('.slide');
    const indicators = document.querySelectorAll('.rs-indicator');
    const pauseBtn = document.getElementById('pauseBtn');
    let current = 0;
    let timer;
    let isPaused = false;
    const slideDuration = 5000;

    function updateSlider(idx) {
        // Reset slides
        slides.forEach(s => s.classList.remove('active'));
        
        // Reset indicators and bars
        indicators.forEach(ind => {
            ind.classList.remove('active');
            const bar = ind.querySelector('.rs-progress-bar');
            bar.style.width = '0%';
            bar.style.transition = 'none';
        });

        // Activate new slide and indicator
        slides[idx].classList.add('active');
        indicators[idx].classList.add('active');

        // Restart progress bar animation
        if (!isPaused) {
            setTimeout(() => {
                const activeBar = indicators[idx].querySelector('.rs-progress-bar');
                activeBar.style.transition = `width ${slideDuration}ms linear`;
                activeBar.style.width = '100%';
            }, 50);
        }

        current = idx;
    }

    function startCycle() {
        timer = setInterval(() => {
            let next = (current + 1) % slides.length;
            updateSlider(next);
        }, slideDuration);
    }

    function togglePause() {
        if (!isPaused) {
            clearInterval(timer);
            const activeBar = indicators[current].querySelector('.rs-progress-bar');
            const computedStyle = window.getComputedStyle(activeBar);
            activeBar.style.width = computedStyle.width;
            activeBar.style.transition = 'none';
            pauseBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="white" width="18" height="18"><path d="M8 5v14l11-7z"/></svg>';
        } else {
            updateSlider(current);
            startCycle();
            pauseBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="white" width="18" height="18"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>';
        }
        isPaused = !isPaused;
    }

    pauseBtn.addEventListener('click', togglePause);

    indicators.forEach((ind, i) => {
        ind.addEventListener('click', () => {
            clearInterval(timer);
            updateSlider(i);
            if (!isPaused) startCycle();
        });
    });

    // Start on load
    updateSlider(0);
    startCycle();
});