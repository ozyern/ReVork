<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ReVork - OxygenOS 16</title>
    <style>
        /* ROCKSTAR GAMES STYLE FONT & RESET */
        @import url('https://fonts.googleapis.com/css2?family=Archivo+Black&family=Inter:wght@400;700;900&display=swap');

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            background-color: #000;
            color: #fff;
            font-family: 'Inter', sans-serif;
            overflow-x: hidden;
        }

        /* HEADER FONT STYLE (Condensed & Heavy) */
        h1, h2, .nav-links a {
            font-family: 'Archivo Black', sans-serif;
            text-transform: uppercase;
        }

        /* NAVIGATION */
        nav {
            position: absolute;
            top: 0;
            width: 100%;
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 40px 50px;
            z-index: 1000;
        }

        .nav-links {
            display: flex;
            list-style: none;
            gap: 40px;
        }

        .nav-links a {
            color: #fff;
            text-decoration: none;
            font-size: 13px;
            letter-spacing: 1px;
            transition: 0.3s;
        }

        .nav-links a:hover { color: #fccf00; } /* Rockstar Yellow hover */

        .nav-logo { position: absolute; left: 50px; font-weight: 900; font-size: 28px; }
        .nav-social { position: absolute; right: 50px; font-size: 20px; }

        /* HERO SLIDESHOW */
        .hero {
            height: 100vh;
            width: 100%;
            position: relative;
            overflow: hidden;
        }

        .slide {
            position: absolute;
            inset: 0;
            background-size: cover;
            background-position: center;
            opacity: 0;
            transition: opacity 0.8s ease-in-out;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            text-align: center;
        }

        .slide.active { opacity: 1; }

        .slide h1 {
            font-size: clamp(50px, 12vw, 110px);
            line-height: 0.9;
            margin-bottom: 30px;
            letter-spacing: -2px;
        }

        .slide h1 span { color: #FF5E5E; }

        .btn-learn {
            padding: 15px 50px;
            border: 2px solid #fff;
            color: #fff;
            text-decoration: none;
            font-family: 'Archivo Black', sans-serif;
            font-size: 14px;
            transition: 0.2s;
            background: rgba(0,0,0,0.3);
        }

        .btn-learn:hover { background: #fff; color: #000; }

        /* ROCKSTAR PROGRESS SLIDER */
        .controls {
            position: absolute;
            bottom: 50px;
            width: 100%;
            display: flex;
            justify-content: center;
            align-items: center;
            gap: 15px;
            z-index: 10;
        }

        .pause-btn {
            background: none;
            border: none;
            color: #fff;
            cursor: pointer;
            font-size: 16px;
            margin-right: 10px;
        }

        .indicator-container {
            display: flex;
            gap: 10px;
        }

        .indicator {
            width: 60px; /* Wider Rockstar style */
            height: 4px;
            background: rgba(255,255,255,0.2);
            position: relative;
            cursor: pointer;
            overflow: hidden;
        }

        /* The moving progress bar inside the indicator */
        .indicator .progress {
            position: absolute;
            left: 0;
            top: 0;
            height: 100%;
            width: 0%;
            background: #fff;
        }

        .indicator.active .progress {
            width: 100%;
            transition: width 5s linear; /* Matches slide interval */
        }

        /* VERSION CARDS */
        .version-grid {
            padding: 100px 8%;
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
            gap: 40px;
        }

        .v-header { font-size: 50px; margin-bottom: 20px; }

        .glass-box {
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(20px);
            padding: 50px;
            border-radius: 2px;
        }

        .glass-box .label { font-size: 12px; font-weight: 900; margin-bottom: 10px; color: #888; }
        .glass-box .ver { font-size: 30px; font-weight: 800; margin-bottom: 5px; }

        /* FAQ */
        .faq-section { padding: 100px 10%; max-width: 1100px; margin: 0 auto; }
        .faq-section h2 { font-size: 60px; text-align: center; margin-bottom: 80px; font-family: 'Archivo Black'; }
        .faq-item { margin-bottom: 50px; border-left: 4px solid #333; padding-left: 20px; }
        .faq-item .q { font-size: 22px; font-weight: 900; text-transform: uppercase; margin-bottom: 10px; }
        .faq-item .a { font-size: 18px; color: #bbb; line-height: 1.5; }

        /* REVORK BANNER (IMAGE) */
        .revork-banner {
            width: 100%;
            background: #000;
            display: flex;
            justify-content: center;
            padding: 60px 0;
        }

        .revork-img { width: 100%; max-width: 1600px; height: auto; }

        footer {
            padding: 60px 8%;
            display: flex;
            justify-content: space-between;
            font-size: 12px;
            color: #444;
            font-weight: 700;
            text-transform: uppercase;
        }
    </style>
</head>
<body>

    <nav>
        <div class="nav-logo">𝗫</div>
        <ul class="nav-links">
            <li><a href="#">ROMs</a></li>
            <li><a href="#">Newswire</a></li>
            <li><a href="#">Downloads</a></li>
            <li><a href="#">Installation Guide</a></li>
        </ul>
        <div class="nav-social">✈</div>
    </nav>

    <section class="hero">
        <div class="slide active" style="background-image: url('assets/oos16_home.png');">
            <h1>Oxygen<span>OS</span> 16</h1>
            <a href="#" class="btn-learn">Learn More</a>
        </div>
        <div class="slide" style="background-image: linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url('assets/revork.png');">
            <h1>The Revork Edition</h1>
            <a href="#" class="btn-learn">Download Now</a>
        </div>

        <div class="controls">
            <button class="pause-btn" id="pauseBtn">||</button>
            <div class="indicator-container">
                <div class="indicator active" data-index="0"><div class="progress"></div></div>
                <div class="indicator" data-index="1"><div class="progress"></div></div>
            </div>
        </div>
    </section>

    <section class="version-grid">
        <div>
            <h2 class="v-header">Oxygen<span>OS</span> 16</h2>
            <div class="glass-box">
                <p class="label">OxygenOS</p>
                <p class="ver">OxygenOS 16.0.3.503</p>
                <p>Out Now</p>
            </div>
        </div>
        <div>
            <h2 class="v-header" style="color: #6D72FF;">ColorOS 16</h2>
            <div class="glass-box">
                <p class="label">ColorOS</p>
                <p class="ver">ColorOS 16.0.3.504</p>
                <p>Out Now</p>
            </div>
        </div>
    </section>

    <section class="faq-section">
        <h2>FAQ</h2>
        <div class="faq-item">
            <p class="q">Is the ROM Rooted?</p>
            <p class="a">Yes, the ROM is rooted via SukiSu Ultra.</p>
        </div>
        <div class="faq-item">
            <p class="q">Does the stock camera work?</p>
            <p class="a">Yes, if ur device is OnePlus 9 or 9 Pro it will work.</p>
        </div>
    </section>

    <section class="revork-banner">
        <img src="assets/revork.png" alt="Revork" class="revork-img">
    </section>

    <footer>
        <p>🌐 Global/English</p>
        <p>©ReVork All rights reserved.</p>
    </footer>

    <script>
        const slides = document.querySelectorAll('.slide');
        const indicators = document.querySelectorAll('.indicator');
        const pauseBtn = document.getElementById('pauseBtn');
        let currentSlide = 0;
        let isPlaying = true;
        let slideInterval = 5000;
        let timer;

        function resetProgress() {
            indicators.forEach(ind => {
                const prog = ind.querySelector('.progress');
                prog.style.transition = 'none';
                prog.style.width = '0%';
            });
        }

        function startProgress(index) {
            resetProgress();
            setTimeout(() => {
                const activeProg = indicators[index].querySelector('.progress');
                activeProg.style.transition = `width ${slideInterval}ms linear`;
                activeProg.style.width = '100%';
            }, 50);
        }

        function showSlide(index) {
            slides.forEach(s => s.classList.remove('active'));
            indicators.forEach(i => i.classList.remove('active'));
            
            slides[index].classList.add('active');
            indicators[index].classList.add('active');
            
            if (isPlaying) startProgress(index);
            currentSlide = index;
        }

        function nextSlide() {
            let next = (currentSlide + 1) % slides.length;
            showSlide(next);
        }

        function startSlideshow() {
            timer = setInterval(nextSlide, slideInterval);
            startProgress(currentSlide);
            isPlaying = true;
            pauseBtn.textContent = '||';
        }

        function stopSlideshow() {
            clearInterval(timer);
            resetProgress();
            isPlaying = false;
            pauseBtn.textContent = '▶';
        }

        pauseBtn.addEventListener('click', () => {
            if (isPlaying) stopSlideshow();
            else startSlideshow();
        });

        indicators.forEach((ind, i) => {
            ind.addEventListener('click', () => {
                showSlide(i);
                if (isPlaying) {
                    clearInterval(timer);
                    startSlideshow();
                }
            });
        });

        // Initialize
        startSlideshow();
    </script>
</body>
</html>