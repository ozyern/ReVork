document.addEventListener('DOMContentLoaded', () => {
    const slides = document.querySelectorAll('.slide');
    const indicators = document.querySelectorAll('.rs-indicator');
    const pauseBtn = document.getElementById('pauseBtn');
    let current = 0;
    let timer;
    let isPaused = false;

    function updateSlider(idx) {
        // Reset all slides and bars
        slides.forEach(s => s.classList.remove('active'));
        indicators.forEach(ind => {
            ind.classList.remove('active');
            const bar = ind.querySelector('.rs-progress-bar');
            bar.style.width = '0%';
            bar.style.transition = 'none';
        });

        // Activate new slide
        slides[idx].classList.add('active');
        indicators[idx].classList.add('active');

        // Restart Rockstar-style "mover" bar
        setTimeout(() => {
            const activeBar = indicators[idx].querySelector('.rs-progress-bar');
            activeBar.style.transition = 'width 5000ms linear';
            activeBar.style.width = '100%';
        }, 50);

        current = idx;
    }

    function startCycle() {
        timer = setInterval(() => {
            let next = (current + 1) % slides.length;
            updateSlider(next);
        }, 5000);
    }

    pauseBtn.addEventListener('click', () => {
        if (!isPaused) {
            clearInterval(timer);
            pauseBtn.textContent = '▶';
        } else {
            startCycle();
            pauseBtn.textContent = '||';
        }
        isPaused = !isPaused;
    });

    indicators.forEach((ind, i) => {
        ind.addEventListener('click', () => {
            clearInterval(timer);
            updateSlider(i);
            if (!isPaused) startCycle();
        });
    });

    // Initial load
    updateSlider(0);
    startCycle();
});