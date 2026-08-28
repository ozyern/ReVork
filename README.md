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

- **One rAF loop, and it stops.** All the tilt and magnet physics share a single
  animation frame callback that exits once everything has settled. An idle tab
  costs nothing.
- **One `pointermove` listener for the whole page.** `event.target` is already the
  topmost element under the cursor, so `closest()` identifies the hovered card
  without needing enter/leave handlers on every one of them.
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
