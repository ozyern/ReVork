/*
 * Shared behaviour for every ReVork page.
 *
 * Three things live in here:
 *   1. the custom cursor + all the pointer-driven tilt/magnet physics
 *   2. reveal-on-scroll, which doubles as the gate for the card backdrop blur
 *   3. the tab strip and "show more builds" drawers on the device pages
 *
 * The physics all run off a single rAF loop that stops itself the moment
 * everything has settled, so an idle tab costs nothing.
 */

const fine = matchMedia('(hover: hover) and (pointer: fine)');
const stillness = matchMedia('(prefers-reduced-motion: reduce)');

const lerp = (from, to, t) => from + (to - from) * t;

/* ---------------------------------------------------------------- *
 * Tidy up the address bar
 *
 * Pages ship as .html but Pages also serves them extensionless, and every
 * link on the site uses the short form. If someone lands on the long one,
 * rewrite it so shared URLs stay consistent.
 * ---------------------------------------------------------------- */

function initCleanUrl() {
  if (!location.protocol.startsWith('http')) return;
  if (!location.pathname.endsWith('.html')) return;

  const short = location.pathname.replace(/(?:index)?\.html$/, '');
  history.replaceState(null, '', short + location.search + location.hash);
}

/* ---------------------------------------------------------------- *
 * Theme
 * ---------------------------------------------------------------- */

function initTheme() {
  const button = document.querySelector('[data-theme-toggle]');
  if (!button) return;

  const root = document.documentElement;
  const sync = () => {
    const dark = root.dataset.theme !== 'light';
    button.setAttribute('aria-pressed', String(!dark));
    button.setAttribute('aria-label', dark ? 'Switch to light theme' : 'Switch to dark theme');
  };

  button.addEventListener('click', () => {
    const next = root.dataset.theme === 'light' ? 'dark' : 'light';
    root.dataset.theme = next;
    try {
      localStorage.setItem('revork-theme', next);
    } catch {
      // Private browsing. The toggle still works for this page view.
    }
    sync();
  });

  sync();
}

/* ---------------------------------------------------------------- *
 * Reveal on scroll
 *
 * Two observers with different margins. The near one fades content in as
 * you reach it; the far one flips `.in-view` on cards a long way ahead of
 * the viewport, and the stylesheet uses that to decide which glass panes
 * are allowed to run a backdrop-filter. Roughly two dozen live blurs per
 * page is more than most integrated GPUs will scroll smoothly.
 * ---------------------------------------------------------------- */

function initReveal() {
  const cards = document.querySelectorAll('.card');

  if (!('IntersectionObserver' in window)) {
    document.querySelectorAll('.reveal').forEach((el) => el.classList.add('shown'));
    cards.forEach((el) => el.classList.add('in-view'));
    return;
  }

  const paint = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => entry.target.classList.toggle('in-view', entry.isIntersecting));
    },
    { rootMargin: '400px 0px' }
  );
  cards.forEach((card) => paint.observe(card));

  const shown = new IntersectionObserver(
    (entries, self) => {
      // Anything arriving in the same batch gets a small cascade so a
      // screenful of cards lands in sequence instead of all at once.
      let step = 0;
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        if (!entry.target.style.getPropertyValue('--delay')) {
          entry.target.style.setProperty('--delay', `${Math.min(step, 6) * 60}ms`);
        }
        entry.target.classList.add('shown');
        self.unobserve(entry.target);
        step += 1;
      });
    },
    { rootMargin: '0px 0px -8% 0px', threshold: 0.05 }
  );

  document.querySelectorAll('.reveal').forEach((el) => shown.observe(el));
}

/* ---------------------------------------------------------------- *
 * Park the heading sheen when it is off screen
 *
 * It is the one animation here that repaints rather than composites, so
 * it is also the only reason the main thread renders on an idle page.
 * Scrolling past the heading should stop costing anything.
 * ---------------------------------------------------------------- */

function initSheen() {
  const headings = document.querySelectorAll('.sheen');
  if (!headings.length || !('IntersectionObserver' in window)) return;

  const watch = new IntersectionObserver((entries) => {
    entries.forEach((entry) => entry.target.classList.toggle('sheen-paused', !entry.isIntersecting));
  });

  headings.forEach((heading) => watch.observe(heading));
}

/* ---------------------------------------------------------------- *
 * Pointer engine
 *
 * The event handler records where the pointer is and moves the cursor dot,
 * and that is all. Picking the hovered element, the class changes and the
 * getBoundingClientRect calls all happen at the top of the next frame,
 * where the layout is still clean from the last one. Doing the reads in
 * the handler meant every pointermove invalidated the style and then
 * measured straight afterwards, forcing a synchronous layout per event.
 * ---------------------------------------------------------------- */

// Tilt targets, most specific first — `closest` picks the first match.
const TILTS = [
  { selector: '.card', max: 2, scale: 1.02, depth: 1200, parallax: 1.5, shadow: 6 },
  { selector: '.term-btn', max: 15, scale: 1.05, depth: 800, parallax: 0.8 },
  { selector: '.shell', max: 2.5, scale: 1, depth: 0 },
];

// Magnet targets. x/y are how far the element chases the pointer.
const MAGNETS = [
  { selector: '.back-link', x: 0.35, y: 0.35 },
  { selector: '.tabs', x: 0.05, y: 0.1 },
  { selector: '.magnetic, .solid, .theme-switch', x: 0.15, y: 0.3 },
];

const HOVERABLE = 'a, button, [role="tab"], .field-menu li';

// The smoothing rates below are quoted per 60fps frame. Rescaling them
// against the real frame time keeps the motion at the same speed on a
// 144Hz panel as on a 60Hz one — the old fixed-step lerp ran more than
// twice as fast on a high refresh rate display.
const approach = (rate, dt) => 1 - (1 - rate) ** (dt / 16.667);

function initPointer() {
  if (!fine.matches) return;

  const dot = document.getElementById('cursor-dot');
  const ring = document.getElementById('cursor-ring');
  const spotlight = document.getElementById('spotlight');
  const body = document.body;

  let px = innerWidth / 2;
  let py = innerHeight / 2;
  let rx = px;
  let ry = py;
  let awake = false;
  let running = false;
  let last = 0;

  // Written by the event, read by the frame. The only thing that crosses.
  let over = null;
  let overDirty = false;

  const tilt = { el: null, cfg: null, rect: null, x: 0, y: 0, toX: 0, toY: 0 };
  const magnet = { el: null, cfg: null, rect: null, x: 0, y: 0, toX: 0, toY: 0 };

  function start() {
    if (running) return;
    running = true;
    last = 0;
    requestAnimationFrame(frame);
  }

  function pick(list, target) {
    if (target) {
      for (const cfg of list) {
        const el = target.closest(cfg.selector);
        if (el) return { el, cfg };
      }
    }
    return { el: null, cfg: null };
  }

  // Hands the element back to CSS. The stylesheet keeps a transform
  // transition on everything the engine drives and switches it off while
  // `is-tracking`/`is-pulled` is set, so dropping the class and the inline
  // transform together eases it home on the compositor. Nothing has to
  // stay awake in JS for the settle.
  function releaseTilt() {
    if (!tilt.el) return;
    tilt.el.classList.remove('is-tracking');
    tilt.el.style.transform = '';
    const shadow = tilt.el.querySelector('.shadow');
    if (shadow) shadow.style.transform = '';
    if (tilt.cfg.selector === '.card') body.classList.remove('on-card');
    Object.assign(tilt, { el: null, cfg: null, rect: null, x: 0, y: 0, toX: 0, toY: 0 });
  }

  function releaseMagnet() {
    if (!magnet.el) return;
    magnet.el.classList.remove('is-pulled');
    magnet.el.style.transform = '';
    Object.assign(magnet, { el: null, cfg: null, rect: null, x: 0, y: 0, toX: 0, toY: 0 });
  }

  addEventListener(
    'pointermove',
    (event) => {
      if (event.pointerType !== 'mouse') return;

      px = event.clientX;
      py = event.clientY;

      if (!awake) {
        awake = true;
        rx = px;
        ry = py;
        body.classList.add('cursor-on');
      }

      // The one write left in here. The dot is meant to sit exactly on the
      // pointer, and a transform write only dirties style — it reads
      // nothing back — so keeping it immediate costs nothing.
      if (dot) dot.style.transform = `translate3d(${px - 3}px, ${py - 3}px, 0)`;

      if (event.target !== over) {
        over = event.target;
        overDirty = true;
      }

      start();
    },
    { passive: true }
  );

  // Rects go stale the moment the page moves under the pointer. Blank them
  // and let the frame re-measure, rather than measuring inside the handler.
  function remeasure() {
    tilt.rect = null;
    magnet.rect = null;
    if (tilt.el || magnet.el) start();
  }

  addEventListener('scroll', remeasure, { passive: true });
  addEventListener('resize', remeasure, { passive: true });

  addEventListener('blur', () => {
    releaseTilt();
    releaseMagnet();
  });

  document.addEventListener('pointerleave', () => {
    body.classList.remove('cursor-on');
    over = null;
    overDirty = true;
    releaseTilt();
    releaseMagnet();
  });

  document.addEventListener('pointerenter', () => {
    if (awake) body.classList.add('cursor-on');
  });

  // Rebind both slots to whatever is under the pointer. Measuring here is
  // cheap: nothing has dirtied the layout since the last frame painted.
  function rebind() {
    overDirty = false;

    const nextTilt = pick(TILTS, over);
    if (nextTilt.el !== tilt.el) {
      releaseTilt();
      if (nextTilt.el) {
        tilt.rect = nextTilt.el.getBoundingClientRect();
        tilt.el = nextTilt.el;
        tilt.cfg = nextTilt.cfg;
        nextTilt.el.classList.add('is-tracking');
        if (nextTilt.cfg.selector === '.card') body.classList.add('on-card');
      }
    }

    const nextMagnet = pick(MAGNETS, over);
    if (nextMagnet.el !== magnet.el) {
      releaseMagnet();
      if (nextMagnet.el) {
        magnet.rect = nextMagnet.el.getBoundingClientRect();
        magnet.el = nextMagnet.el;
        magnet.cfg = nextMagnet.cfg;
        nextMagnet.el.classList.add('is-pulled');
      }
    }

    // Last, because it is the only write here that dirties style for the
    // whole document. Measuring after it would force a layout.
    body.classList.toggle('on-link', Boolean(over && over.closest(HOVERABLE)));
  }

  function frame(now) {
    const dt = last ? Math.min(now - last, 50) : 16.667;
    last = now;

    if (overDirty) rebind();

    // Deferred from a scroll or a resize.
    if (tilt.el && !tilt.rect) tilt.rect = tilt.el.getBoundingClientRect();
    if (magnet.el && !magnet.rect) magnet.rect = magnet.el.getBoundingClientRect();

    let busy = false;

    // The ring trails the dot. 0.28 is tight enough to feel attached but
    // still reads as a separate object.
    const chase = approach(0.28, dt);
    rx = lerp(rx, px, chase);
    ry = lerp(ry, py, chase);
    if (Math.abs(px - rx) > 0.1 || Math.abs(py - ry) > 0.1) busy = true;

    const radius = body.classList.contains('on-card') ? 75 : body.classList.contains('on-link') ? 25 : 18;
    if (ring) ring.style.transform = `translate3d(${rx - radius}px, ${ry - radius}px, 0)`;
    if (spotlight) spotlight.style.transform = `translate3d(${rx - 600}px, ${ry - 600}px, 0)`;

    if (tilt.el) {
      busy = true;
      const { rect, cfg, el } = tilt;
      const localX = px - rect.left;
      const localY = py - rect.top;

      tilt.toX = ((localY - rect.height / 2) / (rect.height / 2)) * -cfg.max;
      tilt.toY = ((localX - rect.width / 2) / (rect.width / 2)) * cfg.max;

      const ease = approach(0.15, dt);
      tilt.x = lerp(tilt.x, tilt.toX, ease);
      tilt.y = lerp(tilt.y, tilt.toY, ease);

      const style = el.style;

      // The glare and the lit rim are pseudo elements further down the
      // tree and custom properties inherit, so they are written once here.
      // Both consume these as a translate, not as a gradient position:
      // moving a gradient's origin repaints the whole card every frame.
      style.setProperty('--px', `${localX}px`);
      style.setProperty('--py', `${localY}px`);
      style.setProperty('--rot-x', `${tilt.x}deg`);
      style.setProperty('--rot-y', `${tilt.y}deg`);

      if (cfg.parallax) {
        style.setProperty('--trans-x', `${tilt.y * cfg.parallax}px`);
        style.setProperty('--trans-y', `${tilt.x * -cfg.parallax}px`);
      }

      style.transform = cfg.depth
        ? `perspective(${cfg.depth}px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale3d(${cfg.scale}, ${cfg.scale}, ${cfg.scale})`
        : `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`;

      if (cfg.shadow) {
        const shadow = el.querySelector('.shadow');
        // Cast away from the light, i.e. opposite the tilt.
        if (shadow) shadow.style.transform = `translate3d(${tilt.y * -cfg.shadow}px, ${tilt.x * cfg.shadow}px, -20px)`;
      }
    }

    if (magnet.el) {
      busy = true;
      const { rect, cfg } = magnet;
      magnet.toX = (px - (rect.left + rect.width / 2)) * cfg.x;
      magnet.toY = (py - (rect.top + rect.height / 2)) * cfg.y;

      const ease = approach(0.25, dt);
      magnet.x = lerp(magnet.x, magnet.toX, ease);
      magnet.y = lerp(magnet.y, magnet.toY, ease);
      magnet.el.style.transform = `translate3d(${magnet.x}px, ${magnet.y}px, 0)`;
    }

    if (busy) requestAnimationFrame(frame);
    else running = false;
  }
}

/* ---------------------------------------------------------------- *
 * Tab strip
 * ---------------------------------------------------------------- */

function initTabs() {
  const strip = document.querySelector('[data-tabs]');
  if (!strip) return;

  const tabs = Array.from(strip.querySelectorAll('[role="tab"]'));
  const thumb = strip.querySelector('.tab-thumb');
  strip.style.setProperty('--tabs', String(tabs.length));

  function select(index, focus) {
    const tab = tabs[index];
    const panel = document.getElementById(tab.getAttribute('aria-controls'));
    const current = document.querySelector('.panel.is-active');

    if (panel === current) return;

    tabs.forEach((t, i) => {
      t.setAttribute('aria-selected', String(i === index));
      t.tabIndex = i === index ? 0 : -1;
    });
    if (thumb) thumb.style.setProperty('--tab-index', String(index));
    if (focus) tab.focus();

    if (!current || stillness.matches) {
      if (current) current.classList.remove('is-active');
      panel.classList.add('is-active');
      return;
    }

    // Let the outgoing panel finish its exit before the next one mounts,
    // otherwise both are laid out at once and the page height jumps.
    current.classList.remove('is-active');
    current.classList.add('is-leaving');
    current.addEventListener(
      'animationend',
      () => {
        current.classList.remove('is-leaving');
        panel.classList.add('is-active');
      },
      { once: true }
    );
  }

  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => select(index, false));
    tab.addEventListener('keydown', (event) => {
      const step = event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0;
      if (!step) return;
      event.preventDefault();
      select((index + step + tabs.length) % tabs.length, true);
    });
  });
}

/* ---------------------------------------------------------------- *
 * "Show more builds" drawers
 * ---------------------------------------------------------------- */

function initDrawers() {
  document.querySelectorAll('[data-drawer]').forEach((button) => {
    const drawer = document.getElementById(button.dataset.drawer);
    if (!drawer) return;

    const label = button.querySelector('[data-drawer-label]');
    drawer.querySelectorAll('.card').forEach((card, i) => card.style.setProperty('--i', String(i)));

    button.setAttribute('aria-expanded', 'false');
    button.setAttribute('aria-controls', drawer.id);

    button.addEventListener('click', () => {
      const open = drawer.classList.toggle('open');
      button.setAttribute('aria-expanded', String(open));
      if (label) label.textContent = open ? button.dataset.close : button.dataset.open;
    });
  });
}

/* ---------------------------------------------------------------- */

initCleanUrl();
initTheme();
initReveal();
initTabs();
initDrawers();
initSheen();
if (!stillness.matches) initPointer();
