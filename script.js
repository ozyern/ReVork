document.addEventListener('DOMContentLoaded', () => {
    const slides = document.querySelectorAll('.slide');
    const indicators = document.querySelectorAll('.rs-indicator');
    const pauseBtn = document.getElementById('pauseBtn');
    const pausePath = document.getElementById('pausePath');
    
    let current = 0;
    let timer;
    let isPaused = false;
    const duration = 5000; // 5 seconds per slide

    function updateSlider(idx) {
        // Reset slides
        slides.forEach(s => s.classList.remove('active'));
        
        // Reset indicators and bars
        indicators.forEach(ind => {
            ind.classList.remove('active');
            const bar = ind.querySelector('.rs-progress-bar');
            bar.style.transition = 'none'; 
            bar.style.width = '0%';
        });

        // Activate current
        slides[idx].classList.add('active');
        indicators[idx].classList.add('active');

        // Linear fill animation
        setTimeout(() => {
            if (!isPaused) {
                const activeBar = indicators[idx].querySelector('.rs-progress-bar');
                activeBar.style.transition = `width ${duration}ms linear`;
                activeBar.style.width = '100%';
            }
        }, 50);

        current = idx;
    }

    function startCycle() {
        timer = setInterval(() => {
            let next = (current + 1) % slides.length;
            updateSlider(next);
        }, duration);
    }

    pauseBtn.addEventListener('click', () => {
        if (!isPaused) {
            clearInterval(timer);
            const activeBar = indicators[current].querySelector('.rs-progress-bar');
            const currentWidth = window.getComputedStyle(activeBar).width;
            activeBar.style.transition = 'none';
            activeBar.style.width = currentWidth;
            pausePath.setAttribute('d', 'M8 5v14l11-7z'); // Play icon
        } else {
            updateSlider(current); 
            startCycle();
            pausePath.setAttribute('d', 'M6 19h4V5H6v14zm8-14v14h4V5h-4z'); // Pause icon
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

    updateSlider(0);
    startCycle();
});