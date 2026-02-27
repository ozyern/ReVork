document.addEventListener('DOMContentLoaded', () => {
    const slides = document.querySelectorAll('.slide');
    const indicators = document.querySelectorAll('.rs-indicator');
    const duration = 5000; // 5 seconds per slide
    let current = 0;

    function updateSlider(idx) {
        slides.forEach(s => s.classList.remove('active'));
        indicators.forEach(ind => {
            ind.classList.remove('active');
            const bar = ind.querySelector('.rs-progress-bar');
            bar.style.transition = 'none'; 
            bar.style.width = '0%';
        });

        slides[idx].classList.add('active');
        indicators[idx].classList.add('active');

        // Trigger the Rockstar linear fill
        setTimeout(() => {
            const activeBar = indicators[idx].querySelector('.rs-progress-bar');
            activeBar.style.transition = `width ${duration}ms linear`;
            activeBar.style.width = '100%';
        }, 50);

        current = idx;
    }

    // Auto-cycle slider
    setInterval(() => {
        updateSlider((current + 1) % slides.length);
    }, duration);

    updateSlider(0);
});