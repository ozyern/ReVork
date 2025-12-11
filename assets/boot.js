// Insert boot overlay markup and behavior
(function(){
  const DURATION = 2000; // ms
  function createOverlay(){
    const div = document.createElement('div');
    div.id = 'boot-overlay';
    div.className = 'boot-overlay';
    div.setAttribute('role','presentation');
    div.innerHTML = `
      <div class="boot-inner">
        <div class="boot-logo">Python Notes</div>
        <div class="boot-sub">-Aditya</div>
        <div class="boot-ring" aria-hidden="true">
          <svg class="spinner" viewBox="0 0 50 50" role="img" aria-label="Loading">
            <circle class="path" cx="25" cy="25" r="20" fill="none" stroke="#ff4081" stroke-width="4" stroke-linecap="round"></circle>
          </svg>
        </div>
      </div>`;
    return div;
  }

  function init(){
    // wait until DOM ready
    if (document.readyState === 'loading'){
      document.addEventListener('DOMContentLoaded', init);
      return;
    }
    // avoid duplicate
    if (document.getElementById('boot-overlay')) return;
    const overlay = createOverlay();
    // prepare for smooth transition: start transparent then fade in
    overlay.style.opacity = '0';
    overlay.style.transition = 'opacity 360ms cubic-bezier(.2,.9,.2,1)';
    overlay.style.willChange = 'opacity';
    document.body.appendChild(overlay);
    // ensure paint before starting fade-in
    requestAnimationFrame(()=>{ overlay.style.opacity = '1'; });

    const hide = ()=>{
      // fade out and remove on transitionend for smoothness
      overlay.style.opacity = '0';
      overlay.setAttribute('aria-hidden','true');
      const onEnd = (e)=>{
        if (e.target !== overlay) return;
        overlay.removeEventListener('transitionend', onEnd);
        try{ overlay.remove(); }catch(e){}
      };
      overlay.addEventListener('transitionend', onEnd, {passive:true});
    };
    // schedule hide; allow small rAF before starting timeout to avoid jank on very slow pages
    requestAnimationFrame(()=> setTimeout(hide, DURATION));
    overlay.addEventListener('click', hide, {passive:true});
  }

  // Expose init for manual call and auto-init
  if (typeof window !== 'undefined'){
    window.addEventListener('load', init);
  }
})();
