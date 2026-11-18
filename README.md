
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
Run `node scripts/check-site.mjs` to check local asset paths, PDF links, result pages, and JavaScript syntax. Run `node scripts/check-review.mjs` for self-assessment validation. No dependencies are required.

Public asset URLs use `?v=20261020` to bypass previously cached 404 responses. Bump this version when relocating or replacing shared assets.


## Preparation notes wall
The `/preparation/` entry page is a paper-note wall, designed for multiple contributors. Emir’s profile identifies him as the creator of npho.edu.kg and states that he began preparing in grade 10. His longer note describes how he would prepare if starting earlier. Visitors can search, filter by topic or author, read notes in a notebook dialog, and save personal favorites in localStorage (`npho-preparation-favorites-v1`). Favorites are specific to a browser; there are no public like counts or accounts.

- Add contributors and notes in `assets/js/preparation-notes-data.js`. Each author needs a stable `id`, name, initials, role and first-person bio. Each note needs a stable `id`, `authorId`, topic, paper color, title, excerpt and an array of body paragraphs.
- Register new topic IDs in the same data file. New authors automatically appear in the author filter and profile list; do not add placeholder people or fabricated experience.
- The long Emir plan is preserved in the `emir-full-plan` template inside `preparation/index.html`. Its note opens the full plan, including the existing stage and weekly workload controls. Other notes open their body paragraphs.
- Existing links such as `/preparation/#route` and `#experiment` open the long plan at the relevant section. Individual notes use `/preparation/#note/<stable-id>`.
- The site header/footer still use `results.css`. Paper and notebook styles are isolated in `preparation-wall.css`; the original long-plan styles remain in `preparation.css`.

- Notes are currently in Russian; site navigation follows the shared RU/KY/EN setting. The pre-preparation site snapshot is preserved on `backup/before-preparation-2026-11-09`.


## Practice and IPhO 2026 mock

- `/practice/` lists available full papers and resumes the active attempt. History and personal-note controls are omitted from the interface; existing saved records remain compatible.
- The edition card on `/practice/ipho/` expands in place with reading and exam/training controls. Submitting it opens the reader directly via `?start=exam` or `?start=training&minutes=90`; launch arguments are consumed once and existing active attempts take priority.
- `/practice/ipho-2026/` also supports the saved setup URL for a 5-hour exam or a training session (1–1440 minutes, with pause). `?view=read` opens conditions without starting a timer.
- Russian conditions are loaded from `assets/practice/ipho-2026/q1.html`, `q2.html`, `q3.html`; English conditions use `q1_en.html`, `q2_en.html`, `q3_en.html`. Original and Russian PDF files are available as downloads. The supplied official conditions include some hints; these remain part of the exam.
- Detailed solutions use the supplied organizer PDFs. Self-assessment assigns equal shares of each subpart maximum to checked steps; users can edit the resulting score manually.
- `assets/js/practice-engine.js` contains pure timing/state transitions. `practice-page.js` handles local storage, the inline bilingual reader, PDF downloads, and active-attempt resume. Styles are isolated in `assets/css/practice.css`.
- Exam time uses an absolute deadline and continues while a tab is closed or the computer sleeps. Training pauses preserve the remaining budget. Completed/expired attempts cannot resume. Cross-tab updates reload the latest saved state; a tab pointing to an older unfinished attempt becomes read-only when a new active attempt exists.
- Attempts use localStorage keys starting `npho-practice-v1:ipho-2026:`. History is device/browser-local. Private mode or blocked storage may prevent persistence; the UI reports this. There is no account, server timer, proctoring, or cross-device synchronization.
- Both languages use native HTML with MathJax; PDF links download files without embedding a browser viewer. MathJax is loaded from the same CDN/version family as the existing site. A static HTTP server is required for HTML fragments; opening `index.html` through `file://` is not supported.
- Run `node scripts/check-site.mjs` and `node scripts/check-practice.mjs` before publishing.

## Solutions and self-assessment

- The wider practice reader preserves IPhO subpart numbering, formulas and figures. The native NPhO palette, shared controls and one continuous document surface keep practice consistent with the rest of the site.
- Detailed Russian/English solutions live in `assets/practice/ipho-2026/solutions/t1.json`, `t2.json`, `t3.json`; original solution PDFs are bundled alongside conditions.
- Part maxima match the 23 published subquestions (30 points). On each checkbox change, self-assessment recomputes the score as maximum × checked steps / total steps, rounded to two decimal places. All checked gives the exact maximum; all unchecked gives an explicit zero. This equal-share estimate is not an official granular marking scheme. Manual scores stay editable, and existing saved scores are not recomputed until the next checkbox change.
- Self-assessment has manual capped scores, unassessed/null scores and a live count of checked steps per task and subpart. Existing uncertainty/note values are preserved in old records without visible controls. Records remain separate from exam state for each attempt.
- Review access is blocked for an unfinished selected attempt; opening review never finishes or resets an attempt. Existing timing/state schemas are retained.
- `practice-review-model.js` handles pure validated score transitions; the review UI handles navigation, rendering and local persistence.


## Typography

`assets/css/fonts.css` loads bundled Open Sans for interface controls and STIX for mathematical reading. Fonts are self-hosted in `assets/fonts/`, with their redistribution licenses. STIX covers Russian/English reading; UI fonts also cover Kyrgyz letters. MathJax equations and the source PDFs are unchanged.
