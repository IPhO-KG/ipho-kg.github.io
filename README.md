
# National Physics Olympiad of Kyrgyzstan

Official platform for the National Physics Olympiad of Kyrgyzstan.

🌐 Live website: npho.edu.kg

## Purpose
A centralized platform for physics olympiad students in Kyrgyzstan,
providing problems, results, resources, and competition information.

## Features
- Physics problem bank
- Problems with hints and solutions
- National Olympiad results
- Online exams and appeals
- Resources for olympiad preparation

## Authors
**Creator and developer: Emir Anaraly uulu.** I, Emir Anaraly uulu, created this website:
I designed and developed the platform and its core functionality for the National Physics
Olympiad community in Kyrgyzstan.

**Co-founder and main contributor: Askar Abdiev.** Askar helped me a lot throughout
the development of the project and continues to develop the platform today. He is
responsible for much of the ongoing work on the website, and I am very grateful
for his contribution.

## Technologies
HTML • CSS • JavaScript • GitHub Pages

## Languages (Кыргызча / Русский / English)
- Interface translations: `assets/js/i18n.js` (UI strings + translations of site content).
- Language switch in the navbar; also via URL: `?lang=ky`, `?lang=ru`, `?lang=en`.
- `assets/js/i18n-fallback.js` keeps the Russian interface working if `i18n.js` cannot load. Keep its Russian strings in sync with `i18n.js`.
- Russian is the source language: content edited in `/admin/` is stored in Russian.
  If an edited text differs from the default, KY/EN show the edited Russian text until its translation is added to `i18n.js`.

## Results pages
- `/results/2022/` … `/results/2026/` — standalone pages for each year; `/results/` redirects to the latest year.
- Results and PDF links live in `assets/js/npho-data.js` (shared by the home page and the results pages).
- SPA links also work: `/#results-2025`, `/#about`.
- To add a new year: add data to `npho-data.js`, then copy `results/2026/index.html` to `results/<year>/index.html`
  and change `data-year`, `<title>` and `canonical` (and update the redirect in `results/index.html`).

## Check before publishing
Run `node scripts/check-site.mjs` to check local asset paths, PDF links, result pages, and JavaScript syntax. No dependencies are required.

Public asset URLs use `?v=20261020` to bypass previously cached 404 responses. Bump this version when relocating or replacing shared assets.
