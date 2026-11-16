(function () {
  'use strict';
  const E = window.NPHO_PRACTICE_ENGINE;
  const L = window.NPHO_PRACTICE_I18N;
  const t = (key, vars) => L.t(key, vars);
  const I = window.NPHO_I18N;
  const PREFIX = 'npho-practice-v1:ipho-2026:';
  const ACTIVE = PREFIX + 'active';
  const memory = new Map();
  const $ = id => document.getElementById(id);
  const params = new URLSearchParams(location.search);
  const contentCache = new Map();
  let canStore = true, current = null, task = 'T1', readOnly = false;
  let timerHidden = false, focus = false, font = '19', material = 'ru', positions = {};
  let reviewUI = null, reviewSelected = false, reviewAuthorized = false;
  let loadingNumber = 0, previousRemaining = null, lastCheckpoint = 0;
  let scrollTimer = null, restoring = false, tabIsStale = false, loadedTask = null, restoreNumber = 0;
  function storageWarning() { canStore = false; if ($('storage-warning')) $('storage-warning').hidden = false; }
  function get(key) {
    if (canStore) { try { const value = localStorage.getItem(key); if (value !== null) memory.set(key, value); return value; } catch { storageWarning(); } }
    return memory.get(key) || null;
  }
  function put(key, value) {
    memory.set(key, value);
    if (canStore) { try { localStorage.setItem(key, value); } catch { storageWarning(); } }
  }
  function attemptKey(id) { return PREFIX + 'attempt:' + id; }
  function readerKey() { return PREFIX + 'reader:' + (current?.id || 'read-only'); }
  function load(id) {
    if (!id || !/^[a-zA-Z0-9_-]{1,100}$/.test(id)) return null;
    try { const state = JSON.parse(get(attemptKey(id))); return E.validate(state) && state.id === id ? state : null; } catch { return null; }
  }
  function save(state) { put(attemptKey(state.id), JSON.stringify(state)); }
  function normalized(id) {
    const stored = load(id); if (!stored) return null;
    const next = E.normalize(stored, Date.now()); if (next !== stored) save(next); return next;
  }
  function saveReader() {
    if (!current && !readOnly) return;
    put(readerKey(), JSON.stringify({ task, view: 'text', font, timerHidden, focus, material, positions }));
  }
  function loadReader() {
    let ui;
    try { ui = JSON.parse(get(readerKey())) || {}; } catch { ui = {}; }
    task = ['T1', 'T2', 'T3'].includes(ui.task) ? ui.task : 'T1';
    font = ['17', '19', '21'].includes(String(ui.font)) ? String(ui.font) : '19';
    timerHidden = ui.timerHidden === true; focus = ui.focus === true;
    material = ui.material === 'en' ? 'en' : 'ru';
    positions = {};
    if (ui.positions && typeof ui.positions === 'object') {
      for (const [key, pos] of Object.entries(ui.positions)) {
        if (!/^T[123]:(ru|en|text)$/.test(key) || !pos || typeof pos !== 'object') continue;
        const target = key.replace(/:text$/, ':ru');
        if (positions[target] && !/:(ru|en)$/.test(key)) continue;
        positions[target] = {
          y: Number.isFinite(pos.y) ? Math.max(0, pos.y) : 0,
          anchor: typeof pos.anchor === 'string' && /^T[123](?:-[A-Za-z0-9]+)*$/.test(pos.anchor) ? pos.anchor : '',
          offset: Number.isFinite(pos.offset) ? Math.max(-2000, Math.min(2000, pos.offset)) : 0
        };
      }
    }
    $('font-size').value = font; $('material-language').value = material;
    $('task-content').style.setProperty('--reading-size', font + 'px'); $('review-panel').style.setProperty('--reading-size', font + 'px'); applyFocus(false);
  }
  function capturePosition() {
    if (reviewSelected || restoring || !loadedTask || loadedTask !== task + ':' + material || (!current && !readOnly)) return;
    const y = Math.max(0, window.scrollY || 0);
    let anchor = '', offset = 0;
    const nodes = [...$('task-content').querySelectorAll('[id]')];
    const node = nodes.filter(el => el.getBoundingClientRect().top <= 135).at(-1);
    if (node) { anchor = node.id; offset = node.getBoundingClientRect().top; }
    positions[task + ':' + material] = { y, anchor, offset }; saveReader();
  }
  async function restorePosition(id, token, language) {
    const restoreId = ++restoreNumber;
    restoring = true;
    const holder = $('task-content');
    const images = [...holder.querySelectorAll('img')].filter(img => !img.complete);
    await Promise.all(images.map(img => new Promise(resolve => { img.addEventListener('load', resolve, { once: true }); img.addEventListener('error', resolve, { once: true }); setTimeout(resolve, 2500); })));
    await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    if (reviewSelected || token !== loadingNumber || id !== task || language !== material || restoreId !== restoreNumber) return;
    const pos = positions[id + ':' + language];
    if (pos) {
      const anchor = pos.anchor ? document.getElementById(pos.anchor) : null;
      window.scrollTo({ top: anchor ? window.scrollY + anchor.getBoundingClientRect().top - pos.offset : pos.y, behavior: 'instant' });
    } else if (window.scrollY > $('session-panel').offsetTop + 80) {
      $('document-toolbar')?.scrollIntoView({ block: 'start' });
      window.scrollTo({ top: Math.max(0, $('session-panel').offsetTop - 80), behavior: 'instant' });
    }
    restoring = false;
  }
  function announce(message) { if ($('live-message')) $('live-message').textContent = message; }
  function modeLabel(state) { return t(state.mode === 'exam' ? 'exam' : 'training'); }
  function href(path) { return I?.langUrl(path) || path; }
  function updateTheme() {
    const button = $('theme-toggle'); if (!button) return;
    const dark = document.documentElement.dataset.theme === 'dark' || (!document.documentElement.dataset.theme && matchMedia('(prefers-color-scheme: dark)').matches);
    button.querySelector('.theme-icon').innerHTML = dark ? '<svg class="ui-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>' : '<svg class="ui-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M20.9 13A9 9 0 0 1 11 3.1a9 9 0 1 0 9.9 9.9Z"/></svg>';
    if (button.querySelector('.theme-label')) button.querySelector('.theme-label').textContent = I.t(dark ? 'theme.light' : 'theme.dark');
    button.setAttribute('aria-label', I.t(dark ? 'theme.toLight' : 'theme.toDark'));
  }
  function initTheme() {
    updateTheme();
    $('theme-toggle')?.addEventListener('click', () => {
      const dark = document.documentElement.dataset.theme === 'dark' || (!document.documentElement.dataset.theme && matchMedia('(prefers-color-scheme: dark)').matches);
      const next = dark ? 'light' : 'dark'; document.documentElement.dataset.theme = next;
      try { localStorage.setItem('npho-theme', next); } catch {} updateTheme();
    });
  }
  function renderResume() {
    const form = $('edition-start-form'), link = $('edition-continue');
    if (!form || !link) return;
    const active = normalized(get(ACTIVE)), continuing = !!active && !E.terminal(active);
    form.hidden = continuing; link.hidden = !continuing;
    if (continuing) { link.href = href('/practice/ipho-2026/?attempt=' + encodeURIComponent(active.id)); link.textContent = t('resumeCta'); }
  }
  function refreshState() {
    if (!current) return;
    const latest = normalized(current.id); if (latest) current = latest;
    tabIsStale = !!get(ACTIVE) && get(ACTIVE) !== current.id && !E.terminal(current);
    $('cross-tab-note').hidden = !tabIsStale;
  }
  function mutate(action) {
    if (!current) return; refreshState();
    if (tabIsStale) return;
    current = E.change(current, action, Date.now()); save(current); renderSession();
  }
  function renderTimer() {
    if (!current) return;
    const ms = E.remaining(current, Date.now());
    $('timer').textContent = timerHidden ? t('timerHidden') : E.formatTime(ms);
    $('timer').classList.toggle('timer-hidden', timerHidden);
    $('timer').classList.toggle('urgent', ms <= 10 * 60000 && !E.terminal(current));
    $('timer-label').textContent = t(current.status === 'paused' ? 'pause' : 'remaining');
    $('toggle-timer').setAttribute('aria-label', t(timerHidden ? 'showTimer' : 'hideTimer'));
    if (previousRemaining !== null && current.status === 'running') {
      for (const minutes of [30, 10, 5]) if (previousRemaining > minutes * 60000 && ms <= minutes * 60000) announce(t('minutesLeft', { n: minutes }));
    }
    previousRemaining = ms;
  }
  function renderSession() {
    $('setup-panel').hidden = true; $('session-panel').hidden = false;
    document.body.classList.add('practice-session');
    document.body.classList.toggle('practice-ended', !!current && E.terminal(current));
    $('timer-group').hidden = !current || E.terminal(current);
    $('finish-attempt').hidden = !current || E.terminal(current); $('finish-attempt').disabled = tabIsStale;
    $('pause-attempt').hidden = !current || current.mode !== 'training' || E.terminal(current); $('pause-attempt').disabled = tabIsStale;
    $('session-mode').textContent = current ? modeLabel(current) : t('readMode');
    $('session-status').textContent = !current ? '' : t({ paused: 'paused', expired: 'expired', finished: 'finished' }[current.status] || '') ;
    if (current?.status === 'running') $('session-status').textContent = '';
    $('pause-attempt').textContent = t(current?.status === 'paused' ? 'resume' : 'pause');
    $('task-status-control').hidden = !current || E.terminal(current);
    $('task-status').disabled = !current || E.terminal(current) || tabIsStale;
    $('task-status').value = current?.tasks[task] || 'new';
    document.querySelectorAll('[data-task]').forEach(button => {
      const active = button.dataset.task === task; button.classList.toggle('active', active); button.setAttribute('aria-current', String(active));
      const state = current?.tasks[button.dataset.task] || 'new', dot = button.querySelector('.task-dot');
      dot.className = 'task-dot ' + state; dot.hidden = !current;
      button.setAttribute('aria-label', button.dataset.task + ', 10 ' + t('points') + (current ? ', ' + t(state) : ''));
    });
    renderTimer();
    syncReview();
  }
  function applyFocus(persist = true) {
    document.body.classList.toggle('practice-focus', focus);
    if ($('focus-mode')) { $('focus-mode').textContent = t(focus ? 'exitFocus' : 'focus'); $('focus-mode').setAttribute('aria-pressed', String(focus)); }
    if (persist) saveReader();
  }
  function updateMaterials() {
    $('download-task').href = '/assets/practice/ipho-2026/IPhO_2026_' + task + '_' + material.toUpperCase() + '.pdf';
    $('task-content').lang = material;
  }

  function reviewContext() {
    const active = normalized(get(ACTIVE));
    const allowed = current ? E.terminal(current) : !active || E.terminal(active);
    return { task, material, allowed, recordKey: PREFIX + 'review:' + (current?.id || 'standalone') };
  }
  function syncReview() {
    if (!reviewUI) return;
    document.body.classList.toggle('practice-review', reviewSelected);
    $('conditions-panel').hidden = reviewSelected;
    $('review-panel').hidden = !reviewSelected;
    $('show-conditions').setAttribute('aria-selected', String(!reviewSelected));
    $('show-review').setAttribute('aria-selected', String(reviewSelected));
    $('show-conditions').tabIndex = reviewSelected ? -1 : 0;
    $('show-review').tabIndex = reviewSelected ? 0 : -1;
    if (reviewSelected) {
      if (reviewAuthorized && reviewContext().allowed) reviewUI.open();
      else { reviewAuthorized = false; reviewUI.lock(t(reviewContext().allowed ? 'reviewReady' : 'reviewLocked')); }
    }
  }
  function choosePanel(review) {
    if (review) {
      capturePosition(); reviewSelected = true; reviewAuthorized = reviewContext().allowed; restoreNumber++;
    } else {
      reviewUI?.close(); reviewSelected = false; reviewAuthorized = false;
      restorePosition(task, loadingNumber, material);
    }
    syncReview();
    const url = new URL(location.href); if (reviewSelected) url.searchParams.set('review', '1'); else url.searchParams.delete('review'); history.replaceState(null, '', url);
  }
  function formatTaskHeading(holder, id) {
    const heading = holder.querySelector('h2'); if (!heading) return;
    const match = heading.textContent.trim().match(/^(?:Задача|Question)\s+(T[123])\s*\[([^\]]+)\]\s*\.?\s*(.+)$/iu);
    if (!match || match[1].toUpperCase() !== id) return;
    const meta = document.createElement('span'), title = document.createElement('span');
    meta.className = 'exam-heading-meta'; meta.textContent = id + ' · ' + match[2].trim() + '\n';
    title.className = 'exam-heading-title'; title.textContent = match[3].trim();
    heading.replaceChildren(meta, title);
  }
  async function selectTask(id, capture = true) {
    if (!['T1', 'T2', 'T3'].includes(id)) return;
    if (capture) capturePosition();
    task = id; loadedTask = null; restoring = true; saveReader();
    if (current) refreshState(); renderSession(); updateMaterials();
    const language = material, cacheKey = id + ':' + language;
    const token = ++loadingNumber, holder = $('task-content'); holder.setAttribute('aria-busy', 'true'); holder.innerHTML = '<p class="loading"></p>'; holder.firstElementChild.textContent = t('loading');
    try {
      let html = contentCache.get(cacheKey);
      if (!html) { const response = await fetch('/assets/practice/ipho-2026/q' + id.slice(1) + (language === 'en' ? '_en' : '') + '.html'); if (!response.ok) throw new Error('Missing task'); html = await response.text(); contentCache.set(cacheKey, html); }
      if (token !== loadingNumber) return;
      window.MathJax?.typesetClear?.([holder]); holder.innerHTML = html; formatTaskHeading(holder, id);
      holder.querySelectorAll('img').forEach(img => {
        img.tabIndex = 0; img.setAttribute('role', 'button'); const alt = img.alt || task;
        img.setAttribute('aria-label', t('enlargement') + ': ' + alt);
        const enlarge = () => { $('enlarged-image').src = img.src; $('enlarged-image').alt = alt; $('image-dialog').showModal(); };
        img.addEventListener('click', enlarge); img.addEventListener('keydown', event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); enlarge(); } });
      });
      try { if (window.MathJax?.startup?.promise) await window.MathJax.startup.promise; if (token === loadingNumber && window.MathJax?.typesetPromise) await window.MathJax.typesetPromise([holder]); } catch { if (token === loadingNumber) announce(t('mathError')); }
    } catch {
      if (token !== loadingNumber) return;
      holder.replaceChildren(); const p = document.createElement('p'); p.textContent = t('loadError');
      const retry = document.createElement('button'); retry.className = 'pbtn'; retry.textContent = t('retry'); retry.addEventListener('click', () => selectTask(id, false)); holder.append(p, retry);
    } finally {
      if (token === loadingNumber) { holder.setAttribute('aria-busy', 'false'); loadedTask = cacheKey; await restorePosition(id, token, language); }
    }
  }

  function openAttempt(state) {
    capturePosition(); current = state; readOnly = false; previousRemaining = E.remaining(current, Date.now()); loadReader();
    const url = new URL(location.href); url.searchParams.delete('view'); url.searchParams.delete('new'); url.searchParams.set('attempt', state.id); history.replaceState(null, '', url);
    refreshState(); renderSession(); selectTask(task, false);
  }
  function openReadOnly() {
    capturePosition(); current = null; readOnly = true; tabIsStale = false; loadReader();
    const url = new URL(location.href); url.searchParams.delete('attempt'); url.searchParams.delete('new'); url.searchParams.set('view', 'read'); history.replaceState(null, '', url);
    $('cross-tab-note').hidden = true; renderSession(); selectTask(task, false);
  }
  function beginAttempt(mode, minutes) {
    const active = normalized(get(ACTIVE));
    if (active && !E.terminal(active)) { openAttempt(active); announce(t('continued')); return true; }
    if (!['exam', 'training'].includes(mode) || (mode === 'training' && (!Number.isInteger(minutes) || minutes < 1 || minutes > 1440))) return false;
    const id = typeof crypto.randomUUID === 'function' ? crypto.randomUUID() : Date.now().toString(36) + '-' + Math.random().toString(36).slice(2);
    const state = E.create(id, mode, (mode === 'exam' ? 300 : minutes) * 60000, Date.now());
    save(state); put(ACTIVE, state.id); openAttempt(state); announce(t('began')); return true;
  }
  function startAttempt(event) {
    event.preventDefault();
    const mode = document.querySelector('input[name="mode"]:checked').value;
    if (!beginAttempt(mode, Number($('duration-minutes').value))) $('duration-minutes').reportValidity();
  }
  function takeDirectStart() {
    if (!params.has('start') && !params.has('minutes')) return null;
    const starts = params.getAll('start'), durations = params.getAll('minutes');
    const url = new URL(location.href); url.searchParams.delete('start'); url.searchParams.delete('minutes'); history.replaceState(null, '', url);
    if (starts.length !== 1 || durations.length > 1) return null;
    if (starts[0] === 'exam') return !durations.length || durations[0] === '300' ? { mode: 'exam', minutes: 300 } : null;
    if (starts[0] !== 'training' || durations.length !== 1 || !/^\d{1,4}$/.test(durations[0])) return null;
    const minutes = Number(durations[0]);
    return minutes >= 1 && minutes <= 1440 ? { mode: 'training', minutes } : null;
  }
  function initEditionChooser() {
    const form = $('edition-start-form'); if (!form) return;
    const duration = $('edition-duration'), input = $('edition-duration-minutes');
    const sync = () => {
      const training = form.querySelector('input[name="start"]:checked')?.value === 'training';
      if (duration) duration.hidden = !training;
      if (input) input.disabled = !training;
    };
    form.querySelectorAll('input[name="start"]').forEach(radio => radio.addEventListener('change', sync));
    form.addEventListener('submit', () => {
      if (input && !input.disabled) {
        const minutes = Number(input.value);
        if (Number.isInteger(minutes) && minutes >= 1 && minutes <= 1440) input.value = String(minutes);
      }
      if ($('edition-language')) $('edition-language').value = I?.lang || 'ru';
    });
    sync();
  }
  function tick() {
    if (!current || readOnly) return;
    const before = current.status; refreshState();
    if (before !== current.status) { renderSession(); if (current.status === 'expired') announce(t('expired')); } else renderTimer();
    if (Date.now() - lastCheckpoint > 15000 && current.status === 'running' && !tabIsStale) { lastCheckpoint = Date.now(); mutate({ type: 'checkpoint' }); }
  }
  function flush() {
    reviewUI?.flush();
    clearTimeout(scrollTimer); capturePosition(); saveReader();
    if (current && !E.terminal(current) && !tabIsStale) mutate({ type: 'checkpoint' });
  }
  function syncLanguage() {
    I?.applyStatic(); L.apply(); updateTheme();
    document.querySelectorAll('[data-site-link]').forEach(link => link.href = href(link.dataset.siteLink));
    if (document.body.dataset.practicePage === 'reader') {
      if (current || readOnly) { renderSession(); applyFocus(false); updateMaterials(); }
      $('finish-attempt').textContent = t('finish');
    } else { renderResume(); if ($('edition-language')) $('edition-language').value = I?.lang || 'ru'; }
  }
  function initReader() {
    reviewUI = window.NPHO_PRACTICE_REVIEW?.create({ holder: $('review-panel'), t, getContext: reviewContext, read: get, write: put, isPersistent: () => canStore, announce });
    $('show-conditions').addEventListener('click', () => choosePanel(false));
    $('show-review').addEventListener('click', () => choosePanel(true));
    [$('show-conditions'), $('show-review')].forEach((button, index, tabs) => button.addEventListener('keydown', event => {
      if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight' && event.key !== 'Home' && event.key !== 'End') return;
      event.preventDefault(); const next = event.key === 'Home' ? 0 : event.key === 'End' ? 1 : 1 - index; choosePanel(next === 1); tabs[next].focus();
    }));
    $('start-form').addEventListener('submit', startAttempt);
    document.querySelectorAll('input[name="mode"]').forEach(radio => radio.addEventListener('change', () => {
      const training = document.querySelector('input[name="mode"]:checked').value === 'training'; $('duration-control').hidden = !training; $('duration-minutes').disabled = !training;
    }));
    $('duration-minutes').disabled = true;
    $('read-only').addEventListener('click', openReadOnly);
    document.querySelectorAll('[data-task]').forEach(button => button.addEventListener('click', () => selectTask(button.dataset.task)));
    $('material-language').addEventListener('change', () => { capturePosition(); material = $('material-language').value === 'en' ? 'en' : 'ru'; saveReader(); selectTask(task, false); });
    $('task-status').addEventListener('change', () => mutate({ type: 'task', id: task, value: $('task-status').value }));
    $('pause-attempt').addEventListener('click', () => { refreshState(); mutate({ type: current?.status === 'paused' ? 'resume' : 'pause' }); });
    $('finish-attempt').addEventListener('click', () => { $('finish-dialog').returnValue = 'cancel'; $('finish-dialog').showModal(); });
    $('finish-dialog').addEventListener('close', () => { if ($('finish-dialog').returnValue === 'finish') { mutate({ type: 'finish' }); $('show-review').focus(); announce(t('doneTitle')); } });
    $('toggle-timer').addEventListener('click', () => { timerHidden = !timerHidden; saveReader(); renderTimer(); });
    $('focus-mode').addEventListener('click', () => { focus = !focus; applyFocus(); $('reader-settings').removeAttribute('open'); $('reader-settings-summary').focus(); });
    document.addEventListener('keydown', event => {
      if (event.key !== 'Escape' || event.defaultPrevented || document.querySelector('dialog[open]') || document.querySelector('.language-trigger[aria-expanded="true"]')) return;
      if ($('reader-settings').hasAttribute('open')) { $('reader-settings').removeAttribute('open'); $('reader-settings-summary').focus(); return; }
      if (focus) { focus = false; applyFocus(); }
    });
    document.addEventListener('pointerdown', event => { if (!event.target.closest('#reader-settings')) $('reader-settings').removeAttribute('open'); });
    $('fullscreen').hidden = !document.documentElement.requestFullscreen;
    $('fullscreen').addEventListener('click', async () => { try { if (document.fullscreenElement) await document.exitFullscreen(); else await document.documentElement.requestFullscreen(); } catch { announce(t('noFullscreen')); } });
    $('font-size').addEventListener('change', () => { font = $('font-size').value; $('task-content').style.setProperty('--reading-size', font + 'px'); $('review-panel').style.setProperty('--reading-size', font + 'px'); saveReader(); });
    $('close-image').addEventListener('click', () => $('image-dialog').close());
    window.addEventListener('scroll', () => { if (restoring) return; clearTimeout(scrollTimer); scrollTimer = setTimeout(capturePosition, 250); }, { passive: true });
    window.addEventListener('pagehide', flush);
    document.addEventListener('visibilitychange', () => { if (document.hidden) flush(); else { tick(); if (current) renderSession(); } });
    window.addEventListener('storage', event => { if (event.key === ACTIVE || (current && event.key === attemptKey(current.id))) { if (current) { refreshState(); renderSession(); } else syncReview(); } });
    const directStart = takeDirectStart();
    const requested = params.get('attempt');
    if (requested) { const state = normalized(requested); if (state) openAttempt(state); else announce(t('notFound')); }
    else if (params.get('view') === 'read') openReadOnly();
    else { const state = normalized(get(ACTIVE)); if (state && !E.terminal(state)) openAttempt(state); else if (directStart) beginAttempt(directStart.mode, directStart.minutes); }
    if (params.get('review') === '1') { if (!requested && !current && !readOnly) openReadOnly(); if (current || readOnly) choosePanel(true); }
    setInterval(tick, 500);
  }
  try { const probe = PREFIX + 'probe'; localStorage.setItem(probe, '1'); localStorage.removeItem(probe); } catch { storageWarning(); }
  initTheme();
  if (document.body.dataset.practicePage === 'reader') initReader();
  else { initEditionChooser(); renderResume(); window.addEventListener('storage', event => { if (event.key === ACTIVE || event.key?.startsWith(PREFIX + 'attempt:')) renderResume(); }); window.addEventListener('pageshow', renderResume); }
  syncLanguage(); document.addEventListener('npho:langchange', syncLanguage);
})();
