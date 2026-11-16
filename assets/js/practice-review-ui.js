/* Optional self-assessment stays separate from timed attempts and official grading. */
(function () {
  'use strict';
  const esc = value => String(value == null ? '' : value).replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
  const rich = value => /<(?:p|ul|ol|li|div|table|details|strong|em|span|br)\b/i.test(String(value || '')) ? String(value || '') : '<p>' + esc(value) + '</p>';
  const localized = (value, lang) => value && typeof value === 'object' ? value[lang] ?? value.en ?? value.ru ?? '' : value || '';
  function create(options) {
    const M = window.NPHO_REVIEW_MODEL, holder = options.holder, t = options.t;
    let documents = null, specs = [], loading = null, record = null, recordKey = '', renderedKey = '', generation = 0;
    const closedSteps = new Set(), closedAnswers = new Set();
    const score = n => M.formatScore(n, window.NPHO_I18N?.lang || 'ru');
    const contextKey = context => [context.recordKey, context.task, context.material, window.NPHO_I18N?.lang || 'ru'].join('|');
    function flush() {
      if (!record || !recordKey) return;
      options.write(recordKey, JSON.stringify(record));
      const status = holder.querySelector('[data-review-save]');
      if (status) status.textContent = t(options.isPersistent() ? 'saved' : 'savedTab');
    }
    function update(action) {
      if (!record || !options.getContext().allowed) return;
      record = M.change(record, specs, action);
      flush();
      updateSummary();
    }
    function taskSpecs(id) { return specs.filter(spec => spec.id.startsWith(id + '-')); }
    function updateSummary() {
      if (!record || !documents) return;
      const context = options.getContext(), total = M.summarize(record, specs), current = M.summarize(record, taskSpecs(context.task));
      const map = {
        '[data-review-task-score]': (current.scoredParts ? score(current.score) : '—') + ' / ' + score(current.max),
        '[data-review-tour-score]': (total.scoredParts ? score(total.score) : '—') + ' / ' + score(total.max),
        '[data-review-checked]': t('reviewCheckedSteps', { n: current.checkedSteps, total: current.totalSteps })
      };
      Object.entries(map).forEach(([selector, value]) => { const el = holder.querySelector(selector); if (el) el.textContent = value; });
      const taskTotal = holder.querySelector('[data-review-task-score]'), tourTotal = holder.querySelector('[data-review-tour-score]');
      if (taskTotal) taskTotal.setAttribute('aria-label', current.scoredParts ? map['[data-review-task-score]'] : t('reviewUnscored') + ', ' + context.task);
      if (tourTotal) tourTotal.setAttribute('aria-label', total.scoredParts ? map['[data-review-tour-score]'] : t('reviewUnscored') + ', ' + t('reviewTourTotal'));
      holder.querySelectorAll('[data-review-jump]').forEach(button => {
        const id = button.dataset.reviewJump, part = record.parts[id], spec = specs.find(item => item.id === id);
        button.classList.toggle('assessed', part.score !== null);
        const status = button.querySelector('[data-chip-score]'); if (status) status.textContent = part.score === null ? '' : score(part.score) + ' / ' + score(spec.max);
      });
      holder.querySelectorAll('[data-review-part-progress]').forEach(progress => {
        const id = progress.dataset.reviewPartProgress, spec = specs.find(item => item.id === id), part = record.parts[id];
        progress.textContent = part.checked.length + ' / ' + spec.stepIds.length;
        progress.setAttribute('aria-label', t('reviewCheckedSteps', { n: part.checked.length, total: spec.stepIds.length }));
      });
      const next = holder.querySelector('[data-next-unreviewed]'); if (next) next.disabled = !taskSpecs(context.task).some(spec => record.parts[spec.id].score === null);
    }
    function focusPart(id) {
      const part = document.getElementById('review-' + id); if (!part) return;
      part.scrollIntoView({ block: 'start', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' }); part.focus({ preventScroll: true });
    }
    function scoreInput(input, part, commit = false) {
      const raw = input.value.trim().replace(',', '.');
      let value = null, valid = !raw;
      if (raw && /^(?:\d+(?:\.\d{0,2})?|\.\d{1,2})$/.test(raw)) { value = Number(raw); valid = Number.isFinite(value) && value >= 0 && value <= part.max; }
      input.setAttribute('aria-invalid', String(!valid));
      const error = holder.querySelector('[data-score-error="' + part.id + '"]'); if (error) { error.hidden = valid; error.textContent = t('reviewScoreRange', { max: score(part.max) }); }
      if (!valid) return;
      update({ type: 'score', partId: part.id, value });
      input.setAttribute('aria-label', part.id + ': ' + t('reviewMyScore') + (value === null ? ', ' + t('reviewUnscored') : ''));
      if (commit && value !== null) input.value = score(value);
    }
    function partMarkup(part, lang) {
      const saved = record.parts[part.id];
      const steps = part.steps.map(step => '<div class="review-step"><label class="review-step-toggle"><input type="checkbox" data-review-check="' + esc(part.id) + '" data-step-id="' + esc(step.id) + '" aria-label="' + esc(t('reviewCheckStep') + ': ' + localized(step.label, lang)) + '"' + (saved.checked.includes(step.id) ? ' checked' : '') + '></label><details data-step-details="' + esc(part.id + ':' + step.id) + '"' + (closedSteps.has(part.id + ':' + step.id) ? '' : ' open') + '><summary>' + esc(localized(step.label, lang)) + '</summary><div class="review-step-body">' + rich(localized(step.body, lang)) + '</div></details></div>').join('');
      return '<section class="review-part" id="review-' + esc(part.id) + '" tabindex="-1"><header class="review-part-head"><h3><span class="review-part-id">' + esc(part.id) + '</span><span class="review-part-title">' + esc(localized(part.title, lang) || part.id) + '</span></h3><span class="review-part-progress" data-review-part-progress="' + esc(part.id) + '"></span>' +
        '<div class="review-score-row"><label class="review-score-label" for="score-' + esc(part.id) + '">' + esc(t('reviewMyScore')) + '</label><input id="score-' + esc(part.id) + '" class="review-score-input" data-review-score="' + esc(part.id) + '" type="text" inputmode="decimal" autocomplete="off" maxlength="12" aria-describedby="score-error-' + esc(part.id) + '" aria-label="' + esc(part.id + ': ' + t('reviewMyScore') + (saved.score === null ? ', ' + t('reviewUnscored') : '')) + '" placeholder="—" value="' + (saved.score === null ? '' : esc(score(saved.score))) + '"><span class="review-score-of">/ ' + esc(score(part.max)) + '</span><div class="review-score-shortcuts"><button type="button" data-review-set="' + esc(part.id) + '" data-value="' + part.max + '">' + esc(t('reviewFullMarks')) + '</button></div></div></header>' +
        '<p class="review-input-error" id="score-error-' + esc(part.id) + '" data-score-error="' + esc(part.id) + '" role="status" hidden></p><div class="review-steps">' + steps + '</div>' +
        '<details class="review-answer" data-answer-details="' + esc(part.id) + '"' + (closedAnswers.has(part.id) ? '' : ' open') + '><summary>' + esc(t('reviewAnswerPitfalls')) + '</summary><div class="review-answer-body">' + rich(localized(part.answer, lang)) + '</div></details></section>';
    }
    function bind(documentData) {
      holder.querySelectorAll('[data-review-jump]').forEach(button => button.addEventListener('click', () => focusPart(button.dataset.reviewJump)));
      holder.querySelector('[data-next-unreviewed]')?.addEventListener('click', () => { const part = documentData.parts.find(item => record.parts[item.id].score === null); if (part) focusPart(part.id); });
      holder.querySelectorAll('[data-review-check]').forEach(input => input.addEventListener('change', () => update({ type: 'check', partId: input.dataset.reviewCheck, stepId: input.dataset.stepId, value: input.checked })));
      holder.querySelectorAll('[data-review-score]').forEach(input => { const part = documentData.parts.find(item => item.id === input.dataset.reviewScore); input.addEventListener('input', () => scoreInput(input, part)); input.addEventListener('blur', () => scoreInput(input, part, true)); });
      holder.querySelectorAll('[data-review-set]').forEach(button => button.addEventListener('click', () => { const input = holder.querySelector('[data-review-score="' + button.dataset.reviewSet + '"]'); input.value = score(Number(button.dataset.value)); scoreInput(input, documentData.parts.find(part => part.id === button.dataset.reviewSet)); }));
      const bindDisclosure = (selector, key, closed) => holder.querySelectorAll(selector).forEach(details => details.addEventListener('toggle', () => {
        if (details.hasAttribute('open')) { closed.delete(details.dataset[key]); window.MathJax?.typesetPromise?.([details]).catch(() => options.announce(t('mathError'))); }
        else closed.add(details.dataset[key]);
      }));
      bindDisclosure('[data-step-details]', 'stepDetails', closedSteps);
      bindDisclosure('[data-answer-details]', 'answerDetails', closedAnswers);
      holder.querySelector('[data-copy-review]')?.addEventListener('click', async () => {
        const lines = [t('reviewCopyTitle') + ' · IPhO 2026'];
        documents.forEach(doc => { const summary = M.summarize(record, taskSpecs(doc.id)); lines.push(doc.id + ': ' + (summary.scoredParts ? score(summary.score) + '/' + score(summary.max) : t('reviewUnscored')) + ' · ' + t('reviewCheckedSteps', { n: summary.checkedSteps, total: summary.totalSteps })); doc.parts.forEach(part => { const saved = record.parts[part.id]; lines.push(part.id + ': ' + (saved.score === null ? t('reviewUnscored') : score(saved.score) + '/' + score(part.max))); }); });
        const summary = M.summarize(record, specs); lines.push(t('reviewTourTotal') + ': ' + (summary.scoredParts ? score(summary.score) + '/' + score(summary.max) : t('reviewUnscored')));
        try { await navigator.clipboard.writeText(lines.join('\n')); options.announce(t('reviewCopied')); } catch { window.prompt(t('reviewCopy'), lines.join('\n')); }
      });
    }
    function render(context) {
      const documentData = documents.find(item => item.id === context.task), lang = context.material;
      holder.innerHTML = '<div class="review-totals"><div><span>' + esc(context.task) + '</span><strong data-review-task-score></strong></div><div><span>' + esc(t('reviewTourTotal')) + '</span><strong data-review-tour-score></strong></div><div class="review-totals-meta"><span data-review-checked role="status" aria-live="polite"></span></div></div>' +
        '<div class="review-toolbar"><div class="review-part-nav" aria-label="' + esc(t('reviewParts')) + '">' + documentData.parts.map(part => '<button type="button" data-review-jump="' + esc(part.id) + '"><span>' + esc(part.id.replace(/^T[123]-/, '')) + '</span><small data-chip-score></small></button>').join('') + '</div><button class="text-button" type="button" data-next-unreviewed>' + esc(t('reviewNextUnscored')) + '</button></div>' +
        documentData.parts.map(part => partMarkup(part, lang)).join('') + '<footer class="review-footer"><a class="text-link" href="' + esc(documentData.sourcePdf) + '" download>' + esc(t('reviewSourcePdf')) + '</a><button class="text-button" type="button" data-copy-review>' + esc(t('reviewCopy')) + '</button><span class="review-save-status" data-review-save role="status">' + esc(t(options.isPersistent() ? 'saved' : 'savedTab')) + '</span></footer>';
      renderedKey = contextKey(context); bind(documentData); updateSummary();
      window.MathJax?.typesetPromise?.([holder]).catch(() => options.announce(t('mathError')));
    }
    async function open() {
      const context = options.getContext(); if (!context.allowed) { lock(t('reviewLocked')); return; }
      if (renderedKey === contextKey(context) && record) { updateSummary(); return; }
      flush(); const token = ++generation;
      holder.innerHTML = '<p class="review-loading" role="status">' + esc(t('reviewLoading')) + '</p>';
      try {
        if (!loading && !documents) loading = Promise.all(['t1', 't2', 't3'].map(async id => { const response = await fetch('/assets/practice/ipho-2026/solutions/' + id + '.json'); if (!response.ok) throw new Error('Missing solution'); return JSON.parse(await response.text()); })).then(data => { documents = data; specs = documents.flatMap(doc => doc.parts.map(part => ({ id: part.id, max: part.max, stepIds: part.steps.map(step => step.id) }))); }).catch(error => { loading = null; throw error; });
        if (loading) await loading;
        const latest = options.getContext(); if (token !== generation || !latest.allowed || contextKey(latest) !== contextKey(context)) return;
        if (recordKey !== context.recordKey || !record) { let raw; try { raw = JSON.parse(options.read(context.recordKey)); } catch {} record = M.normalize(raw, specs); recordKey = context.recordKey; }
        render(context);
      } catch { if (token !== generation) return; holder.innerHTML = '<p class="notice">' + esc(t('reviewLoadError')) + '</p><button class="pbtn" type="button" data-review-retry>' + esc(t('retry')) + '</button>'; holder.querySelector('[data-review-retry]')?.addEventListener('click', open); }
    }
    function lock(message) { flush(); generation++; renderedKey = ''; holder.innerHTML = '<div class="review-lock" role="status"><h2>' + esc(t('reviewTitle')) + '</h2><p>' + esc(message) + '</p></div>'; }
    function close() { flush(); generation++; }
    window.addEventListener('pagehide', flush);
    return { open, lock, close, flush };
  }
  window.NPHO_PRACTICE_REVIEW = { create };
})();
