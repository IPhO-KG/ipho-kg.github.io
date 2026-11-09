
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

**Co-founder and developer: Askar Abdiev.** Askar helped me a lot throughout
the development of the project and continues to develop the platform today. He is
responsible for much of the ongoing work on the website.

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


## Preparation notes wall
The `/preparation/` entry page is a paper-note wall, designed for multiple contributors. Emir’s profile identifies him as the creator of npho.edu.kg and states that he began preparing in grade 10. His longer note describes how he would prepare if starting earlier. Visitors can search, filter by topic or author, read notes in a notebook dialog, and save personal favorites in localStorage (`npho-preparation-favorites-v1`). Favorites are specific to a browser; there are no public like counts or accounts.

- Add contributors and notes in `assets/js/preparation-notes-data.js`. Each author needs a stable `id`, name, initials, role and first-person bio. Each note needs a stable `id`, `authorId`, topic, paper color, title, excerpt and an array of body paragraphs.
- Register new topic IDs in the same data file. New authors automatically appear in the author filter and profile list; do not add placeholder people or fabricated experience.
- The long Emir plan is preserved in the `emir-full-plan` template inside `preparation/index.html`. Its note opens the full plan, including the existing stage and weekly workload controls. Other notes open their body paragraphs.
- Existing links such as `/preparation/#route` and `#experiment` open the long plan at the relevant section. Individual notes use `/preparation/#note/<stable-id>`.
- The site header/footer still use `results.css`. Paper and notebook styles are isolated in `preparation-wall.css`; the original long-plan styles remain in `preparation.css`.

- Notes are currently in Russian; site navigation follows the shared RU/KY/EN setting. The pre-preparation site snapshot is preserved on `backup/before-preparation-2026-11-09`.
