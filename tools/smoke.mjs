// Loads every page in jsdom, runs the real scripts against it and pokes the
// interactive bits. Catches the boring stuff: renamed ids, selectors that no
// longer match, links that point at nothing. `npm test`.
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { JSDOM, VirtualConsole } from 'jsdom';

const pages = readdirSync('.').filter((f) => f.endsWith('.html'));
const failures = [];

function check(page, label, ok, detail = '') {
  if (!ok) failures.push(`${page}: ${label}${detail ? ` (${detail})` : ''}`);
}

for (const page of pages) {
  const errors = [];
  const vc = new VirtualConsole();
  vc.on('jsdomError', (e) => errors.push(e.message));
  vc.on('error', (e) => errors.push(String(e)));

  const dom = new JSDOM(readFileSync(page, 'utf8'), {
    url: `https://ozyern.me/${page}`,
    runScripts: 'outside-only',
    virtualConsole: vc,
    pretendToBeVisual: true,
  });

  const { window } = dom;
  const { document } = window;

  // jsdom has no matchMedia; the scripts branch on it, so answer as a
  // desktop pointer with motion allowed.
  window.matchMedia = (q) => ({
    matches: /hover: hover|pointer: fine/.test(q),
    media: q,
    addEventListener() {},
    removeEventListener() {},
  });
  window.requestAnimationFrame = () => 0;
  window.IntersectionObserver = class {
    constructor(cb) {
      this.cb = cb;
    }
    observe(el) {
      this.cb([{ target: el, isIntersecting: true }], this);
    }
    unobserve() {}
  };

  for (const script of document.querySelectorAll('script[src]')) {
    const src = script.getAttribute('src');
    if (src.startsWith('http')) continue;
    check(page, `script exists: ${src}`, existsSync(src));
    try {
      window.eval(readFileSync(src, 'utf8').replace(/^export .*$/gm, ''));
    } catch (e) {
      errors.push(`${src}: ${e.message}`);
    }
  }

  check(page, 'no script errors', errors.length === 0, errors.join(' | '));

  // Local assets and page links must resolve to a real file.
  for (const el of document.querySelectorAll('[src], [href], source[srcset]')) {
    const raw = el.getAttribute('src') || el.getAttribute('srcset') || el.getAttribute('href');
    if (!raw || /^(https?:|mailto:|#|data:)/.test(raw)) continue;
    const file = raw.includes('.') ? raw : `${raw}.html`;
    check(page, `asset resolves: ${raw}`, existsSync(file));
  }

  // Every card needs the two layers the stylesheet expects.
  for (const card of document.querySelectorAll('.card')) {
    check(page, 'card has .pane', Boolean(card.querySelector('.pane')));
    check(page, 'card has .shadow', Boolean(card.querySelector('.shadow')));
  }

  // Tabs: one panel per tab, exactly one active to begin with.
  const tabs = [...document.querySelectorAll('[role="tab"]')];
  if (tabs.length) {
    for (const tab of tabs) {
      const panel = document.getElementById(tab.getAttribute('aria-controls'));
      check(page, `tab ${tab.id} has a panel`, Boolean(panel));
    }
    check(page, 'one active panel', document.querySelectorAll('.panel.is-active').length === 1);

    // Switching tabs should move the indicator and swap the panel.
    const last = tabs[tabs.length - 1];
    last.dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
    check(page, 'clicking a tab selects it', last.getAttribute('aria-selected') === 'true');
  }

  // Drawers.
  for (const button of document.querySelectorAll('[data-drawer]')) {
    const drawer = document.getElementById(button.dataset.drawer);
    check(page, `drawer ${button.dataset.drawer} exists`, Boolean(drawer));
    if (!drawer) continue;

    button.dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
    check(page, 'drawer opens', drawer.classList.contains('open'));
    check(page, 'label swaps', button.querySelector('[data-drawer-label]')?.textContent === button.dataset.close);
  }

  // Download terminal: walk a full selection and confirm it resolves.
  if (page === 'downloads.html') {
    const menu = document.querySelector('#field-device .field-menu');
    check(page, 'device list populated', menu.children.length === 5);

    menu.children[0].dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
    const parts = document.querySelector('#field-part .field-menu');
    check(page, 'components unlocked', !document.getElementById('btn-part').disabled);
    check(page, 'components populated', parts.children.length > 0);

    parts.children[1].dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
    const variants = document.querySelector('#field-variant .field-menu');
    check(page, 'variants populated', variants.children.length > 0);

    variants.children[0].dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
    check(page, 'execute goes live', document.getElementById('btn-run').classList.contains('is-ready'));

    document.getElementById('btn-clear').dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
    check(page, 'clear resets execute', !document.getElementById('btn-run').classList.contains('is-ready'));
    check(page, 'clear relocks variant', document.getElementById('btn-variant').disabled);
  }

  window.close();
}

if (failures.length) {
  console.error(`${failures.length} failure(s):`);
  failures.forEach((f) => console.error('  x', f));
  process.exit(1);
}

console.log(`ok - ${pages.length} pages checked`);
