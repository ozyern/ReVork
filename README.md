# ReVork

Source for [ozyern.me](https://ozyern.me) — the download site for ReVork, a set of
ported OxygenOS 16 and ColorOS 16 builds for OnePlus 8 and 9 series phones.

It's a static site. Seven HTML pages, one stylesheet, two scripts, no framework and
no server. GitHub Pages serves the repository root as-is.

If you're here to flash a ROM, you want the website, not this repo.

## Supported devices

| Device | Codename | Model | OxygenOS 16 | ColorOS 16 | realmeUI 7 |
| --- | --- | --- | :---: | :---: | :---: |
| OnePlus 9 Pro | `lemonadep` | LE2123 | yes | yes | yes |
| OnePlus 9 | `lemonade` | LE2113 | yes | yes | yes |
| OnePlus 9R | `lemonades` | LE2101 | yes | yes | — |
| OnePlus 8 Pro | `instantnoodlep` | IN2023 | yes | yes | — |
| OnePlus 8T | `kebab` | KB2003 | yes | yes | — |

ROM builds are hosted on SourceForge; recovery images and `super_empty.img` payloads
come from this repo's GitHub releases. The site only links to them.

## Layout

```
index.html            device picker
downloads.html        recovery / super_empty picker ("the terminal")
lemonadep.html        one page per device, each a list of builds
lemonade.html
lemonades.html
instantnoodlep.html
kebab.html

src/revork.css        stylesheet source — edit this one
assets/revork.css     built output — committed, do not edit by hand
assets/js/revork.js   theme, cursor physics, reveals, tabs, drawers
assets/js/downloads.js  the download terminal and its file catalogue
assets/src/           full-size device renders (sources for the build)
tools/                image pipeline + smoke tests
```

## Working on it

```sh
npm install
npm run watch     # rebuild assets/revork.css on save
npm run serve     # http://localhost:8080
```

`assets/revork.css` is a Tailwind build of `src/revork.css`, scoped to the classes
actually used in the HTML. **Adding a Tailwind class to a page means rebuilding**,
otherwise the class silently does nothing:

```sh
npm run build
```

CI runs the same build and fails if the committed CSS doesn't match, so a forgotten
rebuild gets caught before it ships.

```sh
npm test          # loads every page in jsdom and clicks through the interactive bits
```

The tests are deliberately shallow — they check that links resolve, tabs switch,
drawers open and the terminal resolves a download. They don't check that anything
looks right.

## Adding a build

Device pages are plain HTML on purpose: the build lists need to be in the markup for
search engines. Copy the nearest existing card and edit the link, name and version
string:

```html
<a class="card reveal flex items-center justify-between p-8 sm:p-10" href="…" target="_blank" rel="noopener">
  <span class="shadow"></span>
  <span class="pane"></span>
  <div class="layer flex flex-col">
    <h3 class="text-2xl font-extrabold tracking-tight text-title sm:text-4xl lg:text-5xl">OxygenOS 16.1</h3>
    <p class="mt-1 font-mono text-xs tracking-widest text-sub sm:mt-2 sm:text-base">Android 16 • 16.0.10.500 • Stable</p>
  </div>
  <div class="arrow text-3xl sm:text-5xl" aria-hidden="true">↓</div>
</a>
```

`.shadow` and `.pane` are the two layers the stylesheet needs — the glass, grain,
rim light and hover sweep are all pseudo-elements hanging off `.pane`. Older builds
go inside the `.drawer` above the "show more" button.

Files in the download terminal live in one object at the top of
`assets/js/downloads.js`. Anything with a `variants` map gets a third dropdown.

## Adding a device image

Drop a PNG in `assets/src/` and run:

```sh
npm run images
```

That resizes to 640px tall, writes a WebP plus a quantised PNG fallback into
`assets/`, and regenerates the favicons. The originals stay in `assets/src/` so the
pipeline can be re-run at a different size later.

## Notes on the front end

A few decisions that aren't obvious from reading the code:

- **`@tailwind utilities` is the last line of `src/revork.css`, deliberately.**
  Everything above it is component CSS, so a utility in the markup always wins.
  Move it back to the top and rules like `.card { display: block }` start
  silently beating `class="flex"` on the device pages.
- **The reveal gate is written `:where(html.js) .reveal`.** `:where()` adds no
  specificity, so the `.js` guard does not turn every reveal rule into something
  that outranks the component styling underneath it. Without it the gate scored
  (0,3,1) and quietly won every fight over `opacity` and `translate` it was
  never meant to be in.
- **The page background lives on `html`, not `body`.** The aurora is a
  `z-index: -1` child of the body; give the body its own opaque background and
  it paints straight over the aurora, leaving a flat black page.
- **One rAF loop, and it stops.** All the tilt and magnet physics share a single
  animation frame callback that exits once everything has settled. An idle tab
  costs nothing.
- **One `pointermove` listener for the whole page**, and it only records. The
  handler stores the pointer position and what it is over; picking the hovered
  element, the class changes and every `getBoundingClientRect()` happen at the
  top of the next frame, where the layout is still clean. Reading in the handler
  meant a forced synchronous layout on every single move.
- **Nothing animates a property that cannot be composited.** In practice that
  rules out `box-shadow`, `background-position`, `filter`, `width`/`height` and
  anything under a `mix-blend-mode` — each one repaints on every frame it runs,
  and an infinite one repaints for as long as the tab is open. Fade the opacity
  of a pseudo-element carrying a static shadow instead. Getting this wrong is
  invisible until you profile: an animated `box-shadow` on the home page's
  terminal button was on its own more than half of that page's idle CPU.
- **The heading sheen is the one exception**, because a gradient moving across
  `background-clip: text` has no composited equivalent. It sweeps for half its
  cycle and holds still for the other half, and `initSheen` parks it whenever
  the heading scrolls off screen. With it parked the pages sit at zero style
  recalculations — everything else is on the compositor.
- **The engine and CSS never drive the same transform at once.** While
  `is-tracking`/`is-pulled` is set, the transform transition is switched off and
  JS owns the property; dropping the class and the inline transform together is
  what eases the element home. Leaving the transition on underneath restarted a
  0.6s interpolation on every frame, which never arrived and dragged the tilt a
  beat behind the cursor.
- **Smoothing is scaled by frame time**, so the motion lands at the same speed on
  a 144Hz panel as on a 60Hz one.
- **Backdrop blur is gated on visibility.** An IntersectionObserver adds `.in-view`
  to cards well before they scroll in, and the stylesheet only allows
  `backdrop-filter` on those. Two dozen simultaneous live blurs is enough to drop
  frames on integrated graphics.
- **Hovering a card dims the others with opacity, not blur.** Blurring the whole
  grid looked better and scrolled worse.
- **`prefers-reduced-motion` turns off the custom cursor entirely**, along with the
  drifting background and every reveal.

## Licence

MIT.
