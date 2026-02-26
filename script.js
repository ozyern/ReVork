document.addEventListener('DOMContentLoaded', () => {
    const slides = document.querySelectorAll('.slide');
    const indicators = document.querySelectorAll('.rs-indicator');
    const pauseBtn = document.getElementById('pauseBtn');
    let current = 0;
    let timer;
    let isPaused = false;
    const duration = 5000;

    function updateSlider(idx) {
        slides.forEach(s => s.classList.remove('active'));
        indicators.forEach(ind => {
            ind.classList.remove('active');
            const bar = ind.querySelector('.rs-progress-bar');
            bar.style.width = '0%';
            bar.style.transition = 'none';
        });
        
        slides[idx].classList.add('active');
        indicators[idx].classList.add('active');
        
        if (!isPaused) {
            setTimeout(() => {
                const activeBar = indicators[idx].querySelector('.rs-progress-bar');
                activeBar.style.transition = `width ${duration}ms linear`;
                activeBar.style.width = '100%';
            }, 50);
        }
        current = idx;
    }

    function start() { 
        timer = setInterval(() => { 
            updateSlider((current + 1) % slides.length); 
        }, duration); 
    }

    pauseBtn.addEventListener('click', () => {
        if (!isPaused) { 
            clearInterval(timer); 
            pauseBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="white" width="18" height="18"><path d="M8 5v14l11-7z"/></svg>'; 
        } 
        else { 
            start(); 
            updateSlider(current); 
            pauseBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="white" width="18" height="18"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>'; 
        }
        isPaused = !isPaused;
    });

    indicators.forEach((ind, i) => {
        ind.addEventListener('click', () => {
            clearInterval(timer);
            updateSlider(i);
            if (!isPaused) start();
        });
    });

    updateSlider(0);
    start();
});