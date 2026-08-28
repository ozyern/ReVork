/*
 * The download terminal: three dependent dropdowns that resolve to one
 * release asset, wrapped in a fake shell prompt.
 *
 * Add a build by editing CATALOG. Anything with a `variants` map gets a
 * third dropdown; anything with a plain `url` skips straight to Execute.
 */

const CATALOG = {
  op9pro: {
    name: 'OnePlus 9 Pro',
    parts: {
      super_empty: { label: 'super_empty.img', url: asset('super_empty_9p.img') },
      recovery: {
        label: 'Recovery Image',
        variants: {
          orangefox: { label: 'OrangeFox Project', url: asset('orangefox_9series.img') },
          twrp: { label: 'TWRP Official', url: asset('twrp_9series.img') },
        },
      },
    },
  },
  op9: {
    name: 'OnePlus 9',
    parts: {
      super_empty: { label: 'super_empty.img', url: asset('super_empty_9.img') },
      recovery: {
        label: 'Recovery Image',
        variants: {
          orangefox: { label: 'OrangeFox Project', url: asset('orangefox_9series.img') },
          twrp: { label: 'TWRP Official', url: asset('twrp_9series.img') },
        },
      },
    },
  },
  op9r: {
    name: 'OnePlus 9R',
    parts: {
      // No super_empty for the 9R yet.
      recovery: {
        label: 'Recovery Image',
        variants: {
          orangefox: { label: 'OrangeFox Project', url: asset('orangefox_9R.img') },
        },
      },
    },
  },
  op8pro: {
    name: 'OnePlus 8 Pro',
    parts: {
      super_empty: { label: 'super_empty.img', url: asset('super_empty_8p.img') },
      recovery: {
        label: 'Recovery Image',
        variants: {
          orangefox: { label: 'OrangeFox Project', url: asset('orangefox_8series.img') },
          twrp: { label: 'TWRP Official', url: asset('twrp_8p.img') },
        },
      },
    },
  },
  op8t: {
    name: 'OnePlus 8T',
    parts: {
      super_empty: { label: 'super_empty.img', url: asset('super_empty_8t.img') },
      recovery: {
        label: 'Recovery Image',
        variants: {
          orangefox: { label: 'OrangeFox Project', url: asset('orangefox_8series.img') },
          twrp: { label: 'TWRP Official', url: asset('twrp_8t.img') },
        },
      },
    },
  },
};

function asset(file) {
  return `https://github.com/ozyern/ReVork/releases/download/downloads/${file}`;
}

/* ---------------------------------------------------------------- *
 * Prompt line
 * ---------------------------------------------------------------- */

const out = document.getElementById('cli-out');
let typing;

function say(text, tone = 'text-dim') {
  clearInterval(typing);
  out.className = `ml-1 truncate font-medium ${tone}`;
  out.textContent = '';

  let i = 0;
  typing = setInterval(() => {
    out.textContent = text.slice(0, (i += 1));
    if (i >= text.length) clearInterval(typing);
  }, 14);
}

/* ---------------------------------------------------------------- *
 * Dropdowns
 * ---------------------------------------------------------------- */

const fields = {
  device: field('device'),
  part: field('part'),
  variant: field('variant'),
};

const runButton = document.getElementById('btn-run');
const frame = document.getElementById('shell-frame');
const picked = { device: null, part: null, variant: null };

function field(name) {
  const root = document.getElementById(`field-${name}`);
  return {
    name,
    root,
    button: root.querySelector('.field-btn'),
    label: root.querySelector('.field-label'),
    menu: root.querySelector('.field-menu'),
  };
}

function closeMenus(except) {
  Object.values(fields).forEach((f) => {
    if (f === except) return;
    f.root.classList.remove('is-open');
    f.button.setAttribute('aria-expanded', 'false');
  });
}

function fill(f, items) {
  f.menu.replaceChildren();
  items.forEach((item, i) => {
    const li = document.createElement('li');
    li.textContent = item.label;
    li.setAttribute('role', 'option');
    li.tabIndex = -1;
    li.style.setProperty('--i', String(i));
    li.addEventListener('click', (event) => {
      event.stopPropagation();
      choose(f.name, item.id, item.label);
    });
    f.menu.append(li);
  });
}

// Enough keyboard support that the picker is usable without a mouse:
// arrows move through the list, Enter picks, Escape backs out.
function wireKeys(f) {
  f.button.addEventListener('keydown', (event) => {
    if (event.key !== 'ArrowDown' && event.key !== 'Enter' && event.key !== ' ') return;
    if (!f.root.classList.contains('is-open')) return;
    event.preventDefault();
    f.menu.firstElementChild?.focus();
  });

  f.menu.addEventListener('keydown', (event) => {
    const items = Array.from(f.menu.children);
    const at = items.indexOf(document.activeElement);

    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      const step = event.key === 'ArrowDown' ? 1 : -1;
      items[(at + step + items.length) % items.length]?.focus();
    } else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      document.activeElement.click();
      f.button.focus();
    } else if (event.key === 'Escape') {
      closeMenus();
      f.button.focus();
    }
  });
}

function setField(f, { enabled, text, lit }) {
  f.button.disabled = !enabled;
  if (text !== undefined) f.label.textContent = text;
  f.label.classList.toggle('text-dim', !lit);
  f.label.classList.toggle('text-title', Boolean(lit));
}

function resolved() {
  const part = CATALOG[picked.device]?.parts?.[picked.part];
  if (!part) return null;
  return part.variants ? part.variants[picked.variant]?.url ?? null : part.url ?? null;
}

function refreshRunState() {
  const ready = Boolean(resolved());
  runButton.classList.toggle('is-ready', ready);
  frame.classList.toggle('is-ready', ready);
}

function choose(name, id, label) {
  closeMenus();
  setField(fields[name], { enabled: true, text: label, lit: true });

  if (name === 'device') {
    Object.assign(picked, { device: id, part: null, variant: null });

    const parts = CATALOG[id].parts;
    fill(
      fields.part,
      Object.entries(parts).map(([key, part]) => ({ id: key, label: part.label }))
    );
    setField(fields.part, { enabled: true, text: 'Select format...', lit: false });
    setField(fields.variant, { enabled: false, text: 'Locked', lit: false });
    fill(fields.variant, []);

    say(`export TARGET="${id}"; awaiting --format`);
  } else if (name === 'part') {
    Object.assign(picked, { part: id, variant: null });

    const part = CATALOG[picked.device].parts[id];
    if (part.variants) {
      fill(
        fields.variant,
        Object.entries(part.variants).map(([key, v]) => ({ id: key, label: v.label }))
      );
      setField(fields.variant, { enabled: true, text: 'Select variant...', lit: false });
      say(`export COMPONENT="${id}"; awaiting --variant`);
    } else {
      fill(fields.variant, []);
      setField(fields.variant, { enabled: false, text: 'Standard output', lit: true });
      say('./resolve_link.sh --ready', 'glow-green');
    }
  } else {
    picked.variant = id;
    say('./resolve_link.sh --ready', 'glow-green');
  }

  refreshRunState();
}

Object.values(fields).forEach((f) => {
  wireKeys(f);
  f.button.addEventListener('click', (event) => {
    event.stopPropagation();
    const open = f.root.classList.contains('is-open');
    closeMenus();
    if (!open) {
      f.root.classList.add('is-open');
      f.button.setAttribute('aria-expanded', 'true');
    }
  });
});

document.addEventListener('click', () => closeMenus());
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') closeMenus();
});

/* ---------------------------------------------------------------- *
 * Controls
 * ---------------------------------------------------------------- */

function reset() {
  Object.assign(picked, { device: null, part: null, variant: null });
  setField(fields.device, { enabled: true, text: 'Select device...', lit: false });
  setField(fields.part, { enabled: false, text: 'Awaiting hardware...', lit: false });
  setField(fields.variant, { enabled: false, text: 'Locked', lit: false });
  fill(fields.part, []);
  fill(fields.variant, []);
  refreshRunState();
}

document.getElementById('btn-clear').addEventListener('click', () => {
  reset();
  say('clear && reset_env; awaiting --hardware');
});

runButton.addEventListener('click', () => {
  if (!picked.device) return say('Error: missing --hardware parameter', 'glow-red');
  if (!picked.part) return say('Error: missing --format parameter', 'glow-red');

  const url = resolved();
  if (!url) return say('Error: missing --variant parameter', 'glow-red');

  runButton.classList.remove('is-ready');
  frame.classList.remove('is-ready');
  say('wget -qO- fetching_payload...', 'glow-yellow');

  setTimeout(() => {
    say('200 OK: payload found. Redirecting.', 'glow-green');
    setTimeout(() => {
      location.href = url;
    }, 400);
  }, 600);
});

/* ---------------------------------------------------------------- */

fill(
  fields.device,
  Object.entries(CATALOG).map(([id, device]) => ({ id, label: device.name }))
);

setTimeout(() => say('init revork_shell... done. awaiting --hardware'), 900);
