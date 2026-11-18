/* Self-assessment: step checks share each part maximum equally; manual scores remain editable. */
(function (root) {
  'use strict';

  const SCHEMA = 1;
  const MAX_NOTE_LENGTH = 2000;
  const own = (value, key) => Object.prototype.hasOwnProperty.call(value, key);
  const isObject = value => value !== null && typeof value === 'object' && !Array.isArray(value);
  const validId = value => typeof value === 'string' && value.length > 0 && value.length <= 160 &&
    value === value.trim() && !/[\u0000-\u001f\u007f]/.test(value) &&
    !['__proto__', 'prototype', 'constructor'].includes(value);
  const cents = value => Math.round((value + Number.EPSILON * Math.max(1, Math.abs(value))) * 100);
  const fromCents = value => value / 100;

  function validateSpecs(specs) {
    if (!Array.isArray(specs)) throw new TypeError('Review specifications must be an array');
    const ids = new Set();
    let total = 0;
    return specs.map(spec => {
      if (!isObject(spec) || !validId(spec.id) || ids.has(spec.id)) {
        throw new TypeError('Review part IDs must be valid and unique');
      }
      if (typeof spec.max !== 'number' || !Number.isFinite(spec.max) || spec.max < 0 ||
          !Number.isSafeInteger(cents(spec.max))) {
        throw new RangeError('Review part maximum must be a finite non-negative score');
      }
      if (!Array.isArray(spec.stepIds)) throw new TypeError('Review step IDs must be an array');
      const steps = new Set();
      for (const id of spec.stepIds) {
        if (!validId(id) || steps.has(id)) throw new TypeError('Review step IDs must be valid and unique within each part');
        steps.add(id);
      }
      ids.add(spec.id);
      total += cents(spec.max);
      if (!Number.isSafeInteger(total)) throw new RangeError('Review total is too large');
      return { id: spec.id, max: fromCents(cents(spec.max)), stepIds: [...steps] };
    });
  }

  function plainNote(value) {
    if (typeof value !== 'string') return '';
    let note = value.replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, '').slice(0, MAX_NOTE_LENGTH);
    // Do not persist a dangling half of a Unicode character at the limit.
    if (/[\ud800-\udbff]$/.test(note)) note = note.slice(0, -1);
    return note;
  }

  function validScore(value, max) {
    return typeof value === 'number' && Number.isFinite(value) && value >= 0 && value <= max;
  }

  function normalizeWithSpecs(raw, specs) {
    const source = isObject(raw) && raw.schema === SCHEMA && isObject(raw.parts) ? raw.parts : {};
    const entries = specs.map(spec => {
      const saved = own(source, spec.id) && isObject(source[spec.id]) ? source[spec.id] : {};
      const selected = new Set(Array.isArray(saved.checked) ? saved.checked : []);
      return [spec.id, {
        score: validScore(saved.score, spec.max) ? fromCents(cents(saved.score)) : null,
        checked: spec.stepIds.filter(id => selected.has(id)),
        uncertain: saved.uncertain === true,
        note: plainNote(saved.note)
      }];
    });
    return { schema: SCHEMA, parts: Object.fromEntries(entries) };
  }

  function normalize(raw, specs) {
    return normalizeWithSpecs(raw, validateSpecs(specs));
  }

  function change(record, specs, action) {
    const validated = validateSpecs(specs);
    if (!isObject(action)) throw new TypeError('A review action is required');
    const spec = validated.find(item => item.id === action.partId);
    if (!spec) throw new RangeError('Unknown review part');
    const next = normalizeWithSpecs(record, validated);
    const part = next.parts[spec.id];
    if (action.type === 'score') {
      if (action.value !== null && !validScore(action.value, spec.max)) throw new RangeError('Score is outside the part maximum');
      part.score = action.value === null ? null : fromCents(cents(action.value));
    } else if (action.type === 'check') {
      if (!spec.stepIds.includes(action.stepId)) throw new RangeError('Unknown review step');
      if (typeof action.value !== 'boolean') throw new TypeError('A step check must be boolean');
      const checked = new Set(part.checked);
      if (action.value) checked.add(action.stepId); else checked.delete(action.stepId);
      part.checked = spec.stepIds.filter(id => checked.has(id));
      const maximum = cents(spec.max);
      part.score = fromCents(Math.min(maximum, Math.round(maximum * (part.checked.length / spec.stepIds.length))));
    } else if (action.type === 'uncertain') {
      if (typeof action.value !== 'boolean') throw new TypeError('An uncertainty flag must be boolean');
      part.uncertain = action.value;
    } else if (action.type === 'note') {
      if (typeof action.value !== 'string') throw new TypeError('A review note must be plain text');
      part.note = plainNote(action.value);
    } else {
      throw new RangeError('Unknown review action');
    }
    return next;
  }

  function summarize(record, specs) {
    const validated = validateSpecs(specs);
    const normalized = normalizeWithSpecs(record, validated);
    let score = 0, max = 0, assessedMax = 0, scoredParts = 0, uncertainParts = 0, checkedSteps = 0, totalSteps = 0;
    for (const spec of validated) {
      const part = normalized.parts[spec.id];
      max += cents(spec.max);
      if (part.score !== null) { score += cents(part.score); assessedMax += cents(spec.max); scoredParts++; }
      if (part.uncertain) uncertainParts++;
      checkedSteps += part.checked.length;
      totalSteps += spec.stepIds.length;
    }
    return {
      score: fromCents(score), max: fromCents(max), assessedMax: fromCents(assessedMax),
      scoredParts, totalParts: validated.length, uncertainParts, checkedSteps, totalSteps,
      lost: fromCents(Math.max(0, assessedMax - score)),
      complete: validated.length > 0 && scoredParts === validated.length && uncertainParts === 0
    };
  }

  function formatScore(value, locale) {
    if (typeof value !== 'number' || !Number.isFinite(value)) return '—';
    const locales = { ru: 'ru-RU', en: 'en-US', ky: 'ky-KG' };
    const options = { minimumFractionDigits: 0, maximumFractionDigits: 2, useGrouping: false };
    try { return new Intl.NumberFormat(locales[locale] || locale || 'en-US', options).format(fromCents(cents(value))); }
    catch { return new Intl.NumberFormat('en-US', options).format(fromCents(cents(value))); }
  }

  root.NPHO_REVIEW_MODEL = { normalize, change, summarize, formatScore };
})(typeof window !== 'undefined' ? window : globalThis);
