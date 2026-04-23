import { useScrollReveal } from './hooks/useReveal';
import Cursor from './components/Cursor';
import Header from './components/Header';
import './styles/globals.css';
import './App.css'; // Create this for page-specific styles

function App() {
  useScrollReveal();

  return (
    <>
      <div className="ambient-bg"></div>
      <Cursor />
      <Header />

      <main id="app-wrapper">
        {/* HERO SECTION */}
        <section className="hero">
          <div className="hero-inner reveal">
            <span className="hero-badge">System Software 2.0</span>
            <h1 className="hero-title">ReVork</h1>
            <p className="hero-desc">Flash enhanced OxygenOS and ColorOS ROMs with better performance, zero bloat, and ultimate customization.</p>
            
            <div className="hero-actions">
              <a href="#downloads" className="btn btn-primary">Download ROMs</a>
              <a href="#guide" className="btn btn-outline">Install Guide</a>
            </div>

            {/* The ReVork Status Pill (Replaces the BDay Clock) */}
            <div className="status-pill reveal delay-1">
              <div className="status-glow"></div>
              <div className="status-icon">
                <img src="/favicon.png" alt="ReVork" />
              </div>
              <div className="status-text">
                <span>Latest Release</span><br/>
                <strong>OxygenOS 16.0.5</strong>
              </div>
            </div>
          </div>
        </section>

        {/* ROMS GRID SECTION (Like Sabrina's Albums) */}
        <div className="section-wrapper dark reveal">
          <div className="section-content">
            <div className="section-header">
              <div>
                <p className="sec-label">Featured Projects</p>
                <h2 className="sec-title">Our <em>Universe</em> of ROMs</h2>
              </div>
            </div>
            
            <div className="rom-grid">
              {/* Card 1 */}
              <div className="rom-card reveal">
                <div className="rom-art" style={{ backgroundImage: "url('/assets/oos16_icon.png')" }}></div>
                <div className="rom-info">
                  <h4>OxygenOS 16</h4>
                  <span>Global Edition</span>
                </div>
              </div>
              {/* Card 2 */}
              <div className="rom-card reveal delay-1">
                <div className="rom-art" style={{ backgroundImage: "url('/assets/cos16_cn.jpg')" }}></div>
                <div className="rom-info">
                  <h4>ColorOS 16</h4>
                  <span>China Exclusive</span>
                </div>
              </div>
            </div>
          </div>
        </div>

      </main>
    </>
  );
}

export default App;