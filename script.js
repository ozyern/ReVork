document.addEventListener('DOMContentLoaded', () => {
    const slides = document.querySelectorAll('.slide');
    const indicators = document.querySelectorAll('.indicator');
    const pauseBtn = document.getElementById('pauseBtn');
    let current = 0;
    let timer;
    let isPaused = false;

    function updateSlider(idx) {
        // Remove active states
        slides.forEach(s => s.classList.remove('active'));
        indicators.forEach(i => {
            i.classList.remove('active');
            const prog = i.querySelector('.progress');
            if (prog) {
                prog.style.width = '0%';
                prog.style.transition = 'none';
            }
        });
        
        // Set new active states
        slides[idx].classList.add('active');
        indicators[idx].classList.add('active');
        
        // Rockstar Progress Bar Animation
        setTimeout(() => {
            const activeProg = indicators[idx].querySelector('.progress');
            if (activeProg) {
                activeProg.style.transition = 'width 5000ms linear';
                activeProg.style.width = '100%';
            }
        }, 50);
        
        current = idx;
    }

    function run() {
        timer = setInterval(() => {
            let next = (current + 1) % slides.length;
            updateSlider(next);
        }, 5000);
    }

    // Controls
    if (pauseBtn) {
        pauseBtn.addEventListener('click', () => {
            if (!isPaused) {
                clearInterval(timer);
                pauseBtn.textContent = '▶';
            } else {
                run();
                pauseBtn.textContent = '||';
            }
            isPaused = !isPaused;
        });
    }

    indicators.forEach((ind, i) => {
        ind.addEventListener('click', () => {
            clearInterval(timer);
            updateSlider(i);
            if (!isPaused) run();
        });
    });

    // Initialize
    updateSlider(0);
    run();
});