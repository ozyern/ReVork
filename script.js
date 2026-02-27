* { margin: 0; padding: 0; box-sizing: border-box; }
body { background: #000; color: #fff; font-family: 'Archivo', sans-serif; overflow-x: hidden; }

/* Protection */
.no-select { user-select: none; -webkit-user-drag: none; pointer-events: none; }
img { -webkit-user-drag: none; user-drag: none; }

/* Rockstar Header */
.rs-nav { position: absolute; top: 0; width: 100%; z-index: 1000; padding: 35px 60px; background: transparent; }
.nav-container { display: flex; justify-content: center; align-items: center; position: relative; }
.nav-logo { position: absolute; left: 0; }
.nav-logo img { width: 52px; pointer-events: auto; }
.nav-links { display: flex; list-style: none; gap: 40px; }
.nav-links a { 
    color: #fff; text-decoration: none; font-family: 'Archivo Black', sans-serif; 
    font-size: 13.5px; text-transform: uppercase; letter-spacing: 2.2px; opacity: 0.85; 
}
.nav-links a:hover { opacity: 1; }

/* Hero Slider - FIXED IMAGE ALIGNMENT */
.hero { height: 100vh; width: 100vw; position: relative; overflow: hidden; background: #000; }
.slide { 
    position: absolute; inset: 0; 
    background-size: cover; 
    /* Shift horizontal position to 30% to align with button and prevent cutting off branding */
    background-position: 30% center; 
    background-repeat: no-repeat;
    opacity: 0; transition: opacity 1s ease-in-out;
}
.slide.active { opacity: 1; }

/* Rockstar Button - Lower-left position */
.hero-content-anchor { position: absolute; bottom: 12%; left: 8%; pointer-events: auto; }
.rs-btn { 
    display: inline-block;
    padding: 15px 70px; 
    border: 2.5px solid rgba(255,255,255,0.4); 
    background: rgba(255,255,255,0.05); 
    backdrop-filter: blur(20px); 
    -webkit-backdrop-filter: blur(20px); 
    color: #fff; text-decoration: none; border-radius: 50px; 
    font-weight: 700; font-size: 14.5px; text-transform: uppercase;
    transition: 0.3s cubic-bezier(0.2, 0.8, 0.2, 1);
}
.rs-btn:hover { background: #fff; color: #000; border-color: #fff; transform: scale(1.05);