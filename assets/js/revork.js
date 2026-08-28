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
 * Pointer engine
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

  const tilt = { el: null, cfg: null, rect: null, x: 0, y: 0, toX: 0, toY: 0 };
  const magnet = { el: null, cfg: null, rect: null, x: 0, y: 0, toX: 0, toY: 0 };

  function start() {
    if (running) return;
    running = true;
    requestAnimationFrame(frame);
  }

  function pick(list, target) {
    for (const cfg of list) {
      const el = target.closest(cfg.selector);
      if (el) return { el, cfg };
    }
    return { el: null, cfg: null };
  }

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

  // One listener does the lot: `event.target` is already the topmost element
  // under the pointer, so `closest` tells us what is hovered without a
  // mouseenter/mouseleave pair on every card on the page.
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

      if (dot) dot.style.transform = `translate3d(${px - 3}px, ${py - 3}px, 0)`;

      const target = event.target;
      body.classList.toggle('on-link', Boolean(target.closest('a, button, [role="tab"], .field-menu li')));

      const nextTilt = pick(TILTS, target);
      if (nextTilt.el !== tilt.el) {
        releaseTilt();
        if (nextTilt.el) {
          tilt.el = nextTilt.el;
          tilt.cfg = nextTilt.cfg;
          tilt.rect = nextTilt.el.getBoundingClientRect();
          nextTilt.el.classList.add('is-tracking');
          if (nextTilt.cfg.selector === '.card') body.classList.add('on-card');
        }
      }

      if (tilt.el) {
        const { rect, cfg } = tilt;
        const localX = px - rect.left;
        const localY = py - rect.top;
        tilt.toX = ((localY - rect.height / 2) / (rect.height / 2)) * -cfg.max;
        tilt.toY = ((localX - rect.width / 2) / (rect.width / 2)) * cfg.max;

        // Written once, here. The glare and the lit rim are both pseudo
        // elements further down the tree, and custom properties inherit.
        tilt.el.style.setProperty('--px', `${localX}px`);
        tilt.el.style.setProperty('--py', `${localY}px`);
      }

      const nextMagnet = pick(MAGNETS, target);
      if (nextMagnet.el !== magnet.el) {
        releaseMagnet();
        if (nextMagnet.el) {
          magnet.el = nextMagnet.el;
          magnet.cfg = nextMagnet.cfg;
          magnet.rect = nextMagnet.el.getBoundingClientRect();
          nextMagnet.el.classList.add('is-pulled');
        }
      }

      if (magnet.el) {
        const { rect, cfg } = magnet;
        magnet.toX = (px - (rect.left + rect.width / 2)) * cfg.x;
        magnet.toY = (py - (rect.top + rect.height / 2)) * cfg.y;
      }

      start();
    },
    { passive: true }
  );

  // Rects go stale the moment the page moves under the pointer.
  addEventListener(
    'scroll',
    () => {
      if (tilt.el) tilt.rect = tilt.el.getBoundingClientRect();
      if (magnet.el) magnet.rect = magnet.el.getBoundingClientRect();
    },
    { passive: true }
  );

  addEventListener('blur', () => {
    releaseTilt();
    releaseMagnet();
  });

  document.addEventListener('pointerleave', () => {
    body.classList.remove('cursor-on');
    releaseTilt();
    releaseMagnet();
  });

  document.addEventListener('pointerenter', () => {
    if (awake) body.classList.add('cursor-on');
  });

  function frame() {
    let busy = false;

    // The ring trails the dot. 0.28 is tight enough to feel attached but
    // still reads as a separate object.
    rx = lerp(rx, px, 0.28);
    ry = lerp(ry, py, 0.28);

    if (Math.abs(px - rx) > 0.1 || Math.abs(py - ry) > 0.1) busy = true;

    const radius = body.classList.contains('on-card') ? 75 : body.classList.contains('on-link') ? 25 : 18;
    if (ring) ring.style.transform = `translate3d(${rx - radius}px, ${ry - radius}px, 0)`;
    if (spotlight) spotlight.style.transform = `translate3d(${rx - 600}px, ${ry - 600}px, 0)`;

    if (tilt.el) {
      busy = true;
      const { cfg } = tilt;
      tilt.x = lerp(tilt.x, tilt.toX, 0.15);
      tilt.y = lerp(tilt.y, tilt.toY, 0.15);

      const style = tilt.el.style;
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
        const shadow = tilt.el.querySelector('.shadow');
        // Cast away from the light, i.e. opposite the tilt.
        if (shadow) shadow.style.transform = `translate3d(${tilt.y * -cfg.shadow}px, ${tilt.x * cfg.shadow}px, -20px)`;
      }
    }

    if (magnet.el) {
      busy = true;
      magnet.x = lerp(magnet.x, magnet.toX, 0.25);
      magnet.y = lerp(magnet.y, magnet.toY, 0.25);
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
if (!stillness.matches) initPointer();
