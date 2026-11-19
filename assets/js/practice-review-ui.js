/* Optional self-assessment stays separate from timed attempts and official grading. */
(function () {
  'use strict';
  const esc = value => String(value == null ? '' : value).replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
  const rich = value => /<(?:p|ul|ol|li|div|table|details|strong|em|span|br|figure|img)\b/i.test(String(value || '')) ? String(value || '') : '<p>' + esc(value) + '</p>';
  const localized = (value, lang) => value && typeof value === 'object' ? value[lang] ?? value.en ?? value.ru ?? '' : value || '';
  function create(options) {
    const M = window.NPHO_REVIEW_MODEL, holder = options.holder, t = options.t;
    let documents = null, specs = [], loading = null, record = null, recordKey = '', renderedKey = '', generation = 0, navigationIntent = 0;
    const mountedNavigations = new Map(), selectedParts = new Map();
    const score = n => M.formatScore(n, window.NPHO_I18N?.lang || 'ru');
    const navigation = id => typeof options.navigation === 'function' ? options.navigation(id) : id === options.getContext().task ? options.navigation : null;
    const contextKey = context => [context.recordKey, context.task, context.material, window.NPHO_I18N?.lang || 'ru'].join('|');
    function clearNavigation() {
      mountedNavigations.forEach(nav => nav.replaceChildren()); mountedNavigations.clear();
      options.onSummary?.(null);
    }
    function flush() {
      if (!record || !recordKey) return;
      options.write(recordKey, JSON.stringify(record));
    }
    function update(action) {
      if (!record || !options.getContext().allowed) return;
      record = M.change(record, specs, action);
      if (action.type === 'check') {
        const input = holder.querySelector('[data-review-score="' + action.partId + '"]');
        if (input) {
          input.value = score(record.parts[action.partId].score);
          input.setAttribute('aria-invalid', 'false');
          input.setAttribute('aria-label', (input.dataset.reviewLabel || action.partId) + ': ' + t('reviewMyScore'));
        }
        const error = holder.querySelector('[data-score-error="' + action.partId + '"]');
        if (error) error.hidden = true;
      }
      flush(); updateSummary();
    }
    function taskSpecs(id) { return specs.filter(spec => spec.id.startsWith(id + '-')); }
    function updateSummary() {
      if (!record || !documents) return;
      const context = options.getContext();
      if (!context.allowed) { clearNavigation(); return; }
      const total = M.summarize(record, specs);
      mountedNavigations.forEach(nav => nav.querySelectorAll('[data-review-jump]').forEach(button => {
        const id = button.dataset.reviewJump, saved = record.parts[id], spec = specs.find(item => item.id === id);
        const assessed = saved.score !== null;
        const value = assessed ? score(saved.score) : '';
        button.querySelector('.review-subpart-score').textContent = value;
        button.querySelector('.score-divider').hidden = !assessed;
        button.classList.toggle('assessed', assessed);
        const earned = assessed ? t('reviewEarnedHeading') + ' ' + value : t('reviewUnscored');
        button.setAttribute('aria-label', (spec.label || id) + ', ' + earned + ', ' + t('reviewMaximum', { n: score(spec.max) }));
        if (id === selectedParts.get(context.task) && id.startsWith(context.task + '-')) button.setAttribute('aria-current', 'location');
        else button.removeAttribute('aria-current');
      }));
      const tasks = {};
      documents.forEach(doc => {
        const summary = M.summarize(record, taskSpecs(doc.id));
        tasks[doc.id] = { score: summary.scoredParts ? summary.score : null, max: summary.max, sourcePdf: doc.sourcePdf };
      });
      options.onSummary?.({ tasks, tour: { score: total.scoredParts ? total.score : null, max: total.max } });
    }
    function focusPart(id) {
      const part = document.getElementById('review-' + id); if (!part) return;
      part.scrollIntoView({ block: 'start', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
      part.focus({ preventScroll: true });
    }
    function renderNavigation(context) {
      documents.forEach(documentData => {
        const nav = navigation(documentData.id), previous = mountedNavigations.get(documentData.id);
        if (previous && previous !== nav) previous.replaceChildren();
        if (!nav) { mountedNavigations.delete(documentData.id); return; }
        mountedNavigations.set(documentData.id, nav);
        nav.innerHTML = documentData.parts.map(part => '<button type="button" class="review-subpart-button" data-review-jump="' + esc(part.id) + '" aria-controls="review-panel"><span class="review-subpart-label">' + esc(part.label || part.id.replace(/^T[123]-/, '')) + '</span><span class="review-subpart-score"></span><span class="score-divider" aria-hidden="true" hidden>/</span><span class="score-limit">' + esc(score(part.max)) + '</span><span class="score-unit">' + esc(t('reviewPointUnit')) + '</span></button>').join('');
        nav.querySelectorAll('[data-review-jump]').forEach(button => button.addEventListener('click', async () => {
          const before = options.getContext();
          if (!before.allowed) { lock(t('reviewLocked')); return; }
          if (before.recordKey !== context.recordKey) return;
          const id = button.dataset.reviewJump, task = id.split('-')[0], intent = ++navigationIntent;
          if (before.task !== task) {
            if (typeof options.selectTask !== 'function') return;
            await options.selectTask(task);
          }
          let latest = options.getContext();
          if (intent !== navigationIntent || !latest.allowed || latest.recordKey !== before.recordKey || latest.task !== task) return;
          selectedParts.set(task, id); await open(); latest = options.getContext();
          if (intent !== navigationIntent || !latest.allowed || latest.recordKey !== before.recordKey || latest.task !== task) return;
          updateSummary(); focusPart(id);
        }));
      });
    }
    function scoreInput(input, part, commit = false) {
      const raw = input.value.trim().replace(',', '.');
      let value = null, valid = !raw;
      if (raw && /^(?:\d+(?:\.\d{0,2})?|\.\d{1,2})$/.test(raw)) { value = Number(raw); valid = Number.isFinite(value) && value >= 0 && value <= part.max; }
      input.setAttribute('aria-invalid', String(!valid));
      const error = holder.querySelector('[data-score-error="' + part.id + '"]'); if (error) { error.hidden = valid; error.textContent = t('reviewScoreRange', { max: score(part.max) }); }
      if (!valid) return;
      update({ type: 'score', partId: part.id, value });
      input.setAttribute('aria-label', (part.label || part.id) + ': ' + t('reviewMyScore') + (value === null ? ', ' + t('reviewUnscored') : ''));
      if (commit && value !== null) input.value = score(value);
    }
    function partMarkup(part, lang) {
      const saved = record.parts[part.id];
      const answerTitle = esc(t('reviewAnswerPitfalls'));
      let answerControl = '';
      const steps = part.steps.map((step, index) => {
        const checkId = 'check-' + esc(part.id) + '-' + esc(step.id);
        const title = esc(localized(step.label, lang));
        const isAnswer = step.type === 'answer' && index === part.steps.length - 1;
        const wholePart = part.steps.length === 1 && localized(step.label, lang) === localized(part.title, lang);
        const weight = Number.isFinite(step.points) && part.steps.length > 1
          ? ' <small class="review-step-points" title="' + esc(t('reviewStepWeight')) + '">' + esc(score(step.points)) + ' ' + esc(t('reviewPointUnit')) + '</small>' : '';
        const checkLabel = isAnswer || wholePart ? answerTitle + ' · ' + title : title;
        const checkbox = '<input id="' + checkId + '" type="checkbox" data-review-check="' + esc(part.id) + '" data-step-id="' + esc(step.id) + '" aria-label="' + esc(t('reviewCheckStep')) + ': ' + checkLabel + '"' + (saved.checked.includes(step.id) ? ' checked' : '') + '>';
        if (isAnswer || wholePart) {
          answerControl = '<label class="review-answer-check">' + checkbox + answerTitle + weight + '</label>';
          if (wholePart && !isAnswer) return '<div class="review-step-body">' + rich(localized(step.body, lang)) + '</div>';
          return '';
        }
        return '<div class="review-step"><label class="review-step-toggle">' + checkbox + '</label>' +
          '<h4 class="review-step-title"><label for="' + checkId + '">' + title + weight + '</label></h4>' +
          '<div class="review-step-body">' + rich(localized(step.body, lang)) + '</div></div>';
      }).join('');
      return '<section class="review-part" id="review-' + esc(part.id) + '" tabindex="-1" aria-labelledby="review-heading-' + esc(part.id) + '"><header class="review-part-head"><div class="review-part-heading"><h3 id="review-heading-' + esc(part.id) + '"><span class="review-part-id">' + esc(part.label || part.id) + '</span><span class="review-part-title">' + esc(localized(part.title, lang) || part.id) + '</span></h3></div>' +
        '<div class="review-score-row"><label class="review-score-control" for="score-' + esc(part.id) + '" title="' + esc(t('reviewScoreHint')) + '">' +
          '<span class="review-score-label">' + esc(t('reviewMyScore')) + '</span><span class="review-score-field">' +
          '<input id="score-' + esc(part.id) + '" class="review-score-input" data-review-score="' + esc(part.id) + '" data-review-label="' + esc(part.label || part.id) + '" type="text" inputmode="decimal" autocomplete="off" maxlength="12" aria-describedby="score-error-' + esc(part.id) + '" aria-label="' + esc((part.label || part.id) + ': ' + t('reviewMyScore') + (saved.score === null ? ', ' + t('reviewUnscored') : '')) + '" placeholder=" " value="' + (saved.score === null ? '' : esc(score(saved.score))) + '">' +
          '<span class="score-divider" aria-hidden="true">/</span><span class="review-score-of score-limit">' + esc(score(part.max)) + '</span><span class="score-unit">' + esc(t('reviewPointUnit')) + '</span>' +
          '<svg class="score-edit-icon" viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path d="m3 10.7-.6 2.9 2.9-.6 7.4-7.4a1.6 1.6 0 0 0-2.3-2.3zM9.4 4.3l2.3 2.3"/></svg>' +
          '</span></label></div></header>' +
        '<p class="review-input-error" id="score-error-' + esc(part.id) + '" data-score-error="' + esc(part.id) + '" role="status" hidden></p><div class="review-steps">' + steps + '</div>' +
        '<section class="review-answer' + (answerControl ? ' review-step' : '') + '"><h4 class="review-answer-title">' + (answerControl || answerTitle) + '</h4><div class="review-answer-body' + (answerControl ? ' review-step-body' : '') + '">' + rich(localized(part.answer, lang)) + '</div></section></section>';
    }
    function bind(documentData) {
      holder.querySelectorAll('[data-review-check]').forEach(input => input.addEventListener('change', () => update({ type: 'check', partId: input.dataset.reviewCheck, stepId: input.dataset.stepId, value: input.checked })));
      holder.querySelectorAll('[data-review-score]').forEach(input => { const part = documentData.parts.find(item => item.id === input.dataset.reviewScore); input.addEventListener('input', () => scoreInput(input, part)); input.addEventListener('blur', () => scoreInput(input, part, true)); });
    }
    function render(context) {
      const documentData = documents.find(item => item.id === context.task), lang = context.material;
      if (!documentData.parts.some(part => part.id === selectedParts.get(context.task))) selectedParts.set(context.task, documentData.parts[0]?.id || '');
      holder.innerHTML = documentData.parts.map(part => partMarkup(part, lang)).join('');
      renderedKey = contextKey(context); renderNavigation(context); bind(documentData); updateSummary();
      window.MathJax?.typesetPromise?.([holder]).catch(() => options.announce(t('mathError')));
    }
    async function open() {
      const context = options.getContext(); if (!context.allowed) { lock(t('reviewLocked')); return; }
      if (renderedKey === contextKey(context) && record) {
        if (documents.some(doc => navigation(doc.id) && (mountedNavigations.get(doc.id) !== navigation(doc.id) || !navigation(doc.id).querySelector('[data-review-jump]')))) renderNavigation(context);
        updateSummary(); return;
      }
      flush(); clearNavigation(); const token = ++generation;
      holder.innerHTML = '<p class="review-loading" role="status">' + esc(t('reviewLoading')) + '</p>';
      try {
        if (!loading && !documents) {
          loading = Promise.all(['t1', 't2', 't3'].map(async id => {
            const response = await fetch(options.assetRoot + '/solutions/' + id + '.json', { cache: 'no-cache' });
            if (!response.ok) throw new Error('Missing solution');
            return JSON.parse(await response.text());
          })).then(data => {
            specs = data.flatMap(doc => doc.parts.map(part => ({
              id: part.id, label: part.label, max: part.max,
              stepIds: part.steps.map(step => step.id),
              stepPoints: part.steps.some(step => step.points !== undefined) ? part.steps.map(step => step.points) : undefined
            })));
            documents = data;
          }).catch(error => { loading = null; throw error; });
        }
        if (loading) await loading;
        const latest = options.getContext(); if (token !== generation || !latest.allowed || contextKey(latest) !== contextKey(context)) return;
        if (recordKey !== context.recordKey || !record) { let raw; try { raw = JSON.parse(options.read(context.recordKey)); } catch {} record = M.normalize(raw, specs); recordKey = context.recordKey; }
        render(context);
      } catch { if (token !== generation) return; holder.innerHTML = '<p class="notice">' + esc(t('reviewLoadError')) + '</p><button class="pbtn" type="button" data-review-retry>' + esc(t('retry')) + '</button>'; holder.querySelector('[data-review-retry]')?.addEventListener('click', open); }
    }
    function lock(message) { flush(); generation++; navigationIntent++; renderedKey = ''; clearNavigation(); holder.innerHTML = '<div class="review-lock" role="status"><h2>' + esc(t('reviewTitle')) + '</h2><p>' + esc(message) + '</p></div>'; }
    function close() { flush(); generation++; navigationIntent++; clearNavigation(); }
    window.addEventListener('pagehide', flush);
    return { open, lock, close, flush };
  }
  window.NPHO_PRACTICE_REVIEW = { create };
})();
