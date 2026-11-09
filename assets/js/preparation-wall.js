(() => {
  'use strict';
  const data = window.NPHO_PREPARATION_NOTES;
  const authors = new Map(data.authors.map(author => [author.id, author]));
  const notes = new Map(data.notes.map(note => [note.id, note]));
  const topics = new Map(data.topics.map(topic => [topic.id, topic.label]));
  const storageKey = 'npho-preparation-favorites-v1';
  let favorites;
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey) || '[]');
    favorites = new Set(Array.isArray(saved) ? saved.filter(id => notes.has(id)) : []);
  } catch { favorites = new Set(); }
  const state = { query: '', author: '', topic: '', favoritesOnly: false };
  const wall = document.getElementById('notes-grid');
  const dialog = document.getElementById('note-reader');
  const readerBody = document.getElementById('reader-body');
  const count = document.getElementById('notes-count');
  const empty = document.getElementById('notes-empty');
  const status = document.getElementById('wall-status');
  let currentNote = null;
  let lastOpener = null;
  const starPath = 'M12 3.2l2.7 5.5 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z';

  function element(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }
  function starIcon() {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 24 24'); svg.setAttribute('aria-hidden', 'true');
    const path = document.createElementNS(svg.namespaceURI, 'path');
    path.setAttribute('d', starPath); svg.append(path); return svg;
  }
  function favoriteButton(note, reader = false) {
    const button = element('button', reader ? 'reader-favorite favorite-button' : 'note-favorite favorite-button');
    button.type = 'button'; button.dataset.favorite = note.id;
    button.append(starIcon());
    if (reader) button.append(element('span', 'favorite-label'));
    button.addEventListener('click', () => toggleFavorite(note.id));
    return button;
  }
  function syncFavorites() {
    document.querySelectorAll('[data-favorite]').forEach(button => {
      const selected = favorites.has(button.dataset.favorite);
      const note = notes.get(button.dataset.favorite);
      button.setAttribute('aria-pressed', String(selected));
      button.setAttribute('aria-label', (selected ? 'Убрать из избранного: ' : 'Добавить в избранное: ') + note.title);
      button.title = selected ? 'Убрать из избранного' : 'Добавить в избранное';
      const label = button.querySelector('.favorite-label');
      if (label) label.textContent = selected ? 'В избранном' : 'В избранное';
    });
    document.getElementById('favorite-count').textContent = favorites.size;
  }
  function toggleFavorite(id) {
    const selected = !favorites.has(id);
    if (selected) favorites.add(id); else favorites.delete(id);
    let persisted = true;
    try { localStorage.setItem(storageKey, JSON.stringify([...favorites])); }
    catch { persisted = false; }
    if (state.favoritesOnly) renderWall(); else syncFavorites();
    status.textContent = !persisted ? 'В этом браузере сохранение недоступно. Избранное останется до закрытия страницы.' : selected ? 'Заметка добавлена в избранное.' : 'Заметка убрана из избранного.';
  }
  function normalize(text) { return text.toLocaleLowerCase('ru').replace(/ё/g, 'е').trim(); }
  function visibleNotes() {
    const query = normalize(state.query);
    return data.notes.filter(note => {
      const author = authors.get(note.authorId);
      return (!state.author || note.authorId === state.author) &&
        (!state.topic || note.topic === state.topic) &&
        (!state.favoritesOnly || favorites.has(note.id)) &&
        (!query || normalize([note.title, note.excerpt, author.name, author.role, topics.get(note.topic), ...note.body].join(' ')).includes(query));
    });
  }
  function renderWall() {
    const visible = visibleNotes();
    wall.replaceChildren();
    visible.forEach((note, index) => {
      const author = authors.get(note.authorId);
      const card = element('article', 'paper-note paper-' + note.color + (note.featured ? ' paper-featured' : ''));
      card.style.setProperty('--paper-rotation', ['-.7deg', '.8deg', '-.35deg', '.45deg'][index % 4]);
      const pin = element('span', 'paper-pin'); pin.setAttribute('aria-hidden', 'true');
      card.append(pin, favoriteButton(note));
      const open = element('button', 'note-open'); open.type = 'button';
      open.setAttribute('aria-label', 'Читать заметку: ' + note.title);
      open.dataset.openNote = note.id;
      open.append(element('span', 'note-topic', note.label || topics.get(note.topic)), element('h2', 'note-title', note.title), element('p', 'note-excerpt', note.excerpt));
      if (note.featured) open.append(element('span', 'note-handwritten', 'Что я изучал бы с 5–6-го класса'));
      open.append(element('span', 'note-read', note.fullPlan ? 'Открыть весь план ↗' : 'Читать заметку ↗'));
      open.addEventListener('click', () => { lastOpener = open; location.hash = 'note/' + encodeURIComponent(note.id); });
      const byline = element('div', 'note-byline');
      byline.append(element('span', 'note-initials', author.initials));
      const name = element('div', 'note-author'); name.append(element('b', '', author.name), element('span', '', author.role));
      byline.append(name); card.append(open, byline); wall.append(card);
    });
    count.textContent = state.favoritesOnly ? 'В избранном: ' + visible.length : 'Показано ' + visible.length + ' из ' + data.notes.length;
    empty.hidden = visible.length !== 0;
    wall.hidden = visible.length === 0;
    document.getElementById('empty-title').textContent = state.favoritesOnly && favorites.size === 0 ? 'Здесь будут любимые заметки' : 'Ничего не нашлось';
    document.getElementById('empty-text').textContent = state.favoritesOnly && favorites.size === 0 ? 'Нажми на звёздочку на любой бумажке — заметка останется в твоей подборке.' : 'Попробуй другую тему, автора или поисковый запрос.';
    syncFavorites();
  }
  function setupPlan(root) {
    const tabs = [...root.querySelectorAll('[data-stage]')];
    function setStage(id, focus) {
      tabs.forEach(tab => {
        const active = tab.dataset.stage === id;
        tab.classList.toggle('active', active); tab.setAttribute('aria-selected', String(active)); tab.tabIndex = active ? 0 : -1;
        root.querySelector('#' + tab.getAttribute('aria-controls')).hidden = !active;
        if (active && focus) tab.focus();
      });
    }
    tabs.forEach((tab, index) => {
      tab.addEventListener('click', () => setStage(tab.dataset.stage));
      tab.addEventListener('keydown', event => {
        let next;
        if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
        if (event.key === 'ArrowLeft') next = (index + tabs.length - 1) % tabs.length;
        if (event.key === 'Home') next = 0;
        if (event.key === 'End') next = tabs.length - 1;
        if (next !== undefined) { event.preventDefault(); setStage(tabs[next].dataset.stage, true); }
      });
    });
    root.querySelectorAll('[data-week]').forEach(button => button.addEventListener('click', () => {
      root.querySelectorAll('[data-week]').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
      root.querySelectorAll('.week-panel').forEach(panel => { panel.hidden = panel.id !== 'week-' + button.dataset.week; });
    }));
  }
  function authorBlock(author) {
    const block = element('div', 'reader-author');
    block.append(element('span', 'reader-initials', author.initials));
    const copy = element('div'); copy.append(element('b', '', author.name), element('span', '', author.role));
    block.append(copy); return block;
  }
  function showNote(note, legacyAnchor) {
    if (currentNote !== note.id) {
      currentNote = note.id;
      const author = authors.get(note.authorId);
      document.getElementById('reader-title').textContent = note.title;
      document.getElementById('reader-kind').textContent = note.fullPlan ? 'Большая заметка' : topics.get(note.topic);
      const readerStar = document.getElementById('reader-star'); readerStar.replaceChildren(favoriteButton(note, true));
      readerBody.replaceChildren();
      if (note.fullPlan) {
        readerBody.append(document.getElementById(note.templateId).content.cloneNode(true));
        const header = readerBody.querySelector('.rhead'); header.prepend(authorBlock(author));
        setupPlan(readerBody);
      } else {
        readerBody.append(authorBlock(author));
        const heading = element('h2', 'reader-note-title', note.title); readerBody.append(heading);
        readerBody.append(element('p', 'reader-bio', author.bio));
        const text = element('div', 'reader-prose'); note.body.forEach(paragraph => text.append(element('p', '', paragraph)));
        readerBody.append(text);
        const more = element('a', 'reader-more', 'Читать весь план Эмира →');
        if (note.authorId === 'emir') { more.href = '#note/emir-early-start'; readerBody.append(more); }
      }
      dialog.scrollTop = 0; readerBody.scrollTop = 0;
      document.title = note.title + ' · Заметки NPhO';
    }
    if (!dialog.open) { dialog.showModal(); document.body.classList.add('note-reading'); }
    syncFavorites();
    if (legacyAnchor) requestAnimationFrame(() => readerBody.querySelector('#' + legacyAnchor)?.scrollIntoView({block: 'start'}));
  }
  function handleRoute() {
    const hash = location.hash.slice(1);
    let id = '';
    if (hash.startsWith('note/')) { try { id = decodeURIComponent(hash.slice(5)); } catch {} }
    const legacy = ['route', 'practice', 'experiment', 'schedule', 'resources', 'faq', 'quickstart'].includes(hash);
    const note = notes.get(legacy ? 'emir-early-start' : id);
    if (note) showNote(note, legacy ? hash : '');
    else if (dialog.open) dialog.close();
  }
  document.getElementById('reader-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    const rect = dialog.getBoundingClientRect();
    if (event.target === dialog && (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom)) dialog.close();
  });
  dialog.addEventListener('close', () => {
    document.body.classList.remove('note-reading'); currentNote = null;
    if (location.hash.startsWith('#note/') || ['#route', '#practice', '#experiment', '#schedule', '#resources', '#faq', '#quickstart'].includes(location.hash)) history.replaceState(history.state, '', location.pathname + location.search);
    document.title = 'Заметки о подготовке · NPhO';
    const opener = lastOpener?.isConnected ? lastOpener : document.querySelector('[data-open-note]'); opener?.focus({preventScroll: true});
  });
  readerBody.addEventListener('click', event => {
    const anchor = event.target.closest('a[href^="#"]');
    if (!anchor || anchor.hash.startsWith('#note/')) return;
    const target = readerBody.querySelector(anchor.hash);
    if (target) { event.preventDefault(); target.scrollIntoView({behavior: 'smooth', block: 'start'}); }
  });
  document.querySelectorAll('[data-notes-view]').forEach(button => button.addEventListener('click', () => {
    state.favoritesOnly = button.dataset.notesView === 'favorites';
    document.querySelectorAll('[data-notes-view]').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
    renderWall();
  }));
  const topicFilters = document.getElementById('topic-filters');
  [{id: '', label: 'Все темы'}, ...data.topics].forEach(topic => {
    const button = element('button', 'topic-filter', topic.label); button.type = 'button'; button.dataset.topic = topic.id; button.setAttribute('aria-pressed', String(!topic.id));
    button.addEventListener('click', () => {
      state.topic = topic.id;
      topicFilters.querySelectorAll('button').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
      renderWall();
    }); topicFilters.append(button);
  });
  const authorSelect = document.getElementById('author-filter');
  data.authors.forEach(author => { const option = element('option', '', author.name); option.value = author.id; authorSelect.append(option); });
  authorSelect.addEventListener('change', () => { state.author = authorSelect.value; renderWall(); });
  document.getElementById('note-search').addEventListener('input', event => { state.query = event.target.value; renderWall(); });
  document.getElementById('reset-filters').addEventListener('click', () => {
    state.query = ''; state.author = ''; state.topic = ''; state.favoritesOnly = false;
    document.getElementById('note-search').value = ''; authorSelect.value = '';
    topicFilters.querySelectorAll('button').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.topic === '')));
    document.querySelectorAll('[data-notes-view]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.notesView === 'all')));
    renderWall();
  });
  const authorList = document.getElementById('wall-authors');
  data.authors.forEach(author => {
    const card = element('article', 'wall-author'); card.append(authorBlock(author), element('p', '', author.bio)); authorList.append(card);
  });
  document.getElementById('author-total').textContent = data.authors.length;
  document.getElementById('note-total').textContent = data.notes.length;
  const theme = document.getElementById('theme-toggle');
  function updateHeader() {
    const i18n = window.NPHO_I18N; i18n.applyStatic();
    const dark = document.documentElement.dataset.theme === 'dark';
    document.getElementById('theme-icon').textContent = dark ? '☀' : '☾';
    document.getElementById('theme-label').textContent = i18n.t(dark ? 'theme.light' : 'theme.dark');
    theme.setAttribute('aria-label', i18n.t(dark ? 'theme.toLight' : 'theme.toDark'));
    document.querySelectorAll('[data-site-link]').forEach(anchor => { anchor.href = i18n.langUrl(anchor.dataset.siteLink); });
    const notice = document.querySelector('.language-notice'); notice.hidden = i18n.lang === 'ru'; notice.lang = i18n.lang;
    notice.textContent = i18n.lang === 'ky' ? 'Бул жазуулар азырынча орус тилинде гана жеткиликтүү.' : 'These notes are currently available in Russian.';
  }
  theme.addEventListener('click', () => {
    const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark'; document.documentElement.dataset.theme = next;
    try { localStorage.setItem('npho-theme', next); } catch {} updateHeader();
  });
  document.addEventListener('npho:langchange', updateHeader);
  window.addEventListener('pageshow', () => { try { const saved = localStorage.getItem('npho-theme'); if (saved === 'dark' || saved === 'light') document.documentElement.dataset.theme = saved; } catch {} updateHeader(); });
  window.addEventListener('storage', event => {
    if (event.key !== storageKey) return;
    try { const value = JSON.parse(event.newValue || '[]'); favorites = new Set(Array.isArray(value) ? value.filter(id => notes.has(id)) : []); renderWall(); } catch {}
  });
  let detailsBeforePrint = [];
  window.addEventListener('beforeprint', () => { detailsBeforePrint = [...readerBody.querySelectorAll('details')].filter(item => item.open); readerBody.querySelectorAll('details').forEach(item => { item.open = true; }); });
  window.addEventListener('afterprint', () => readerBody.querySelectorAll('details').forEach(item => { item.open = detailsBeforePrint.includes(item); }));
  window.addEventListener('hashchange', handleRoute); window.addEventListener('popstate', handleRoute);
  updateHeader(); renderWall(); handleRoute();
})();
