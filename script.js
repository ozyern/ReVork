document.addEventListener('DOMContentLoaded', () => {
    const slides = document.querySelectorAll('.slide');
    const indicators = document.querySelectorAll('.rs-indicator');
    const pauseBtn = document.getElementById('pauseBtn');
    let current = 0;
    let timer;
    let isPaused = false;

    function updateSlider(idx) {
        slides.forEach(s => s.classList.remove('active'));
        indicators.forEach(ind => {
            ind.classList.remove('active');
            const bar = ind.querySelector('.rs-progress-bar');
            bar.style.transition = 'none'; bar.style.width = '0%';
        });
        slides[idx].classList.add('active');
        indicators[idx].classList.add('active');
        setTimeout(() => {
            if (!isPaused) {
                const activeBar = indicators[idx].querySelector('.rs-progress-bar');
                activeBar.style.transition = 'width 5000ms linear';
                activeBar.style.width = '100%';
            }
        }, 50);
        current = idx;
    }

    function startCycle() {
        timer = setInterval(() => { updateSlider((current + 1) % slides.length); }, 5000);
    }

    pauseBtn.addEventListener('click', () => {
        if (!isPaused) { clearInterval(timer); } else { startCycle(); updateSlider(current); }
        isPaused = !isPaused;
    });

    updateSlider(0);
    startCycle();
});