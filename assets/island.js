(function(){
  'use strict';
  // Initialize only on touch devices or small screens
  function isMobile() {
    return ('ontouchstart' in window) || window.innerWidth <= 820;
  }
  if (!isMobile()) return;

  function createIsland(){
    if (document.querySelector('.dynamic-island')) return;
    const wrap = document.createElement('div');
    wrap.className = 'dynamic-island';
    wrap.innerHTML = `
      <div class="island-pill" role="button" aria-expanded="false" tabindex="0">
        <div class="island-mini">●</div>
        <div class="island-content">
          <div class="island-icon">R</div>
          <div class="island-text">
            <div style="font-weight:700">Reimagine</div>
            <div style="font-size:0.85rem; opacity:.85">Tap for actions</div>
          </div>
        </div>
      </div>`;
    document.body.appendChild(wrap);

    const pill = wrap.querySelector('.island-pill');
    let closeTimeout = null;

    function expand(){
      pill.classList.add('expanded');
      pill.setAttribute('aria-expanded','true');
      // clear any pending close
      if (closeTimeout) { clearTimeout(closeTimeout); closeTimeout = null; }
      // auto-collapse after 6s
      closeTimeout = setTimeout(collapse, 6000);
    }
    function collapse(){
      pill.classList.remove('expanded');
      pill.setAttribute('aria-expanded','false');
      if (closeTimeout){ clearTimeout(closeTimeout); closeTimeout = null; }
    }

    // Toggle on tap / Enter
    pill.addEventListener('click', (e)=>{ e.stopPropagation(); pill.classList.contains('expanded') ? collapse() : expand(); });
    pill.addEventListener('keydown', (e)=>{ if(e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pill.click(); } });

    // Close when tapping outside
    document.addEventListener('click', (e)=>{ if (!e.target.closest('.dynamic-island')) collapse(); }, {passive:true});

    // Provide a simple quick-action when expanded: open menu or show download
    pill.addEventListener('transitionend', (e)=>{
      if (pill.classList.contains('expanded')){
        // optionally show a small temporary toast or quick actions
        // create quick-actions if not present
        if (!wrap.querySelector('.quick-actions')){
          const actions = document.createElement('div');
          actions.className = 'quick-actions';
          actions.style.display = 'flex';
          actions.style.gap = '8px';
          actions.style.marginLeft = '8px';
          actions.innerHTML = `
            <button class="island-action" style="padding:8px 10px;border-radius:10px;border:0;background:rgba(255,255,255,0.08);color:#fff">Open</button>
            <button class="island-action" style="padding:8px 10px;border-radius:10px;border:0;background:rgba(255,255,255,0.06);color:#fff">Downloads</button>`;
          const content = wrap.querySelector('.island-content');
          if (content) content.appendChild(actions);
          // wire basic handlers
          actions.querySelectorAll('.island-action').forEach(btn=>{
            btn.addEventListener('click', (ev)=>{
              ev.stopPropagation();
              const txt = btn.textContent.trim().toLowerCase();
              if (txt === 'open') {
                // navigate to home
                location.href = 'index.html';
              } else if (txt === 'downloads'){
                // open roms page
                location.href = 'roms.html';
              }
            });
          });
        }
      }
    });
  }

  // ensure DOM ready
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', createIsland);
  else createIsland();

})();
