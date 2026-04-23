<div align="center">
  <img src="https://ozyern.me/assets/favicon.png" width="80" alt="ReVork Logo" />

  <h1>ReVork</h1>
  <p><strong>Custom ROMs Reimagined — Enhanced OxygenOS & ColorOS for OnePlus Devices</strong></p>

  <a href="https://ozyern.me"><img src="https://img.shields.io/website?url=https%3A%2F%2Fozyern.me&label=ozyern.me&style=flat-square" alt="Website Status"></a>
  <img src="https://img.shields.io/github/repo-size/ozyern/ReVork?style=flat-square" alt="Repo Size">
  <img src="https://img.shields.io/github/last-commit/ozyern/ReVork?style=flat-square" alt="Last Commit">
  <img src="https://img.shields.io/badge/License-MIT-blue?style=flat-square" alt="License">
  <a href="https://t.me/ReVorkHub"><img src="https://img.shields.io/badge/Telegram-ReVorkHub-2CA5E0?style=flat-square&logo=telegram" alt="Telegram"></a>
</div>

---

## 📖 About

**ReVork** is a custom ROM project by [ozyern](https://github.com/ozyern) delivering enhanced builds of **OxygenOS 16** and **ColorOS 16** for OnePlus devices. This repository houses the source code for the official ReVork website — a clean, fast reference hub for ROM downloads, device compatibility, changelogs, and installation guides.

> **Live site:** [ozyern.me](https://ozyern.me)

---

## ✨ Features

- 📱 **ROM Downloads** — Ported builds of OxygenOS 16 and ColorOS 16 for supported OnePlus devices
- 🗂️ **Device Pages** — Per-device pages with version-specific changelogs and download links
- 📰 **Newswire** — Release news and update announcements
- 🛠️ **Installation Guide** — Step-by-step flashing instructions
- ⚡ **Fast & Responsive** — Lightweight HTML/CSS/JS, works great on mobile and desktop
- 🔍 **SEO Optimized** — Structured data, sitemap, and Open Graph tags built-in

---

## 📦 Supported Devices & ROMs

| Device | OxygenOS 16 | ColorOS 16 |
|---|---|---|
| OnePlus 9 Pro | ✅ | ✅ |
| OnePlus 9 | ✅ | ✅ |

> More devices may be added over time. Check [ozyern.me/devices.html](https://ozyern.me/devices.html) for the latest.

---

## 🗂️ Repo Structure

```
ReVork/
├── index.html                  # Homepage (hero slider, news, support)
├── devices.html                # Device listing
├── roms.html                   # ROM listing
├── downloads.html              # Downloads page
├── installation.html           # Flashing/installation guide
├── newswire.html               # News hub
├── oxygen-versions.html        # OxygenOS version index
├── coloros-versions.html       # ColorOS version index
├── device-*.html               # Per-device per-version pages
├── devices-*.html              # Per-version device listing pages
├── newswire/                   # Individual news articles
├── assets/                     # Images, icons, banners
├── style.css                   # Global stylesheet
├── script.js                   # Site JS (slider, nav, etc.)
├── sitemap.xml                 # SEO sitemap
├── robots.txt                  # Crawler rules
└── update-*.ps1                # PowerShell scripts for page generation
```

---

## 🚀 Running Locally

This is a static HTML site — no build step needed.

```bash
# Clone the repo
git clone https://github.com/ozyern/ReVork.git
cd ReVork

# Serve locally (Python)
python -m http.server 8000

# Or use VS Code Live Server extension
```

Then open [http://localhost:8000](http://localhost:8000) in your browser.

---

## 🛠️ Tech Stack

- **HTML5 / CSS3 / Vanilla JS** — No frameworks, just clean static web
- **GitHub Pages** — Hosted via custom domain `ozyern.me`
- **PowerShell scripts** — Automate device/version page generation
- **JSON-LD** — Structured data for SEO

---

## 💬 Support & Community

Join the Telegram community for support, updates, and discussions:

👉 [t.me/ReVorkHub](https://t.me/ReVorkHub)

---

## 📄 License

This project is licensed under the **MIT License** — see [LICENSE](LICENSE) for details.

The website source code is open for learning and reference. Please swap out all personal branding, ROM files, and device-specific content if you fork it.

---

<div align="center">
  <sub>© 2026 ReVork Project · Built by <a href="https://github.com/ozyern">ozyern</a></sub>
</div>
