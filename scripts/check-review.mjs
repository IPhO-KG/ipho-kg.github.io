import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import vm from 'node:vm';

const root = new URL('../', import.meta.url);
const context = { window: {}, Intl };
vm.runInNewContext(readFileSync(new URL('assets/js/practice-review-model.js', root), 'utf8'), context);
const M = context.window.NPHO_REVIEW_MODEL;
const plain = value => JSON.parse(JSON.stringify(value));
const frozen = value => { if (value && typeof value === 'object') { Object.values(value).forEach(frozen); Object.freeze(value); } return value; };
const specs = frozen([
  { id: 'T1-A1', max: 0.3, stepIds: ['model', 'result'] },
  { id: 'T1-A2', max: 0.7, stepIds: ['calculation'] },
  { id: 'T2-B1', max: 2.25, stepIds: [] }
]);
const tests = [];
const test = (name, run) => tests.push({ name, run });
const raises = (fn, name) => assert.throws(fn, error => error && error.name === name);

test('unassessed scores remain null and do not count as lost points', () => {
  const record = M.normalize(null, specs);
  assert.equal(record.parts['T1-A1'].score, null);
  assert.deepEqual(plain(M.summarize(record, specs)), {
    score: 0, max: 3.25, assessedMax: 0, scoredParts: 0, totalParts: 3,
    uncertainParts: 0, checkedSteps: 0, totalSteps: 3, lost: 0, complete: false
  });
  const zero = M.change(record, specs, { type: 'score', partId: 'T1-A1', value: 0 });
  const result = M.summarize(zero, specs);
  assert.equal(zero.parts['T1-A1'].score, 0);
  assert.equal(result.scoredParts, 1);
  assert.equal(result.assessedMax, 0.3);
  assert.equal(result.lost, 0.3);
  assert.equal(result.complete, false);
});

test('fractional totals are exact to two decimals without binary floating-point noise', () => {
  let record = M.normalize(null, specs);
  for (const [partId, value] of [['T1-A1', 0.1], ['T1-A2', 0.2], ['T2-B1', 1.005]]) {
    record = M.change(record, specs, { type: 'score', partId, value });
  }
  const result = M.summarize(record, specs);
  assert.equal(record.parts['T2-B1'].score, 1.01);
  assert.equal(result.score, 1.31);
  assert.equal(result.max, 3.25);
  assert.equal(result.assessedMax, 3.25);
  assert.equal(result.lost, 1.94);
  assert.equal(result.complete, true);
  const larger = [{ id: 'decimal-rounding', max: 20, stepIds: [] }];
  const rounded = M.change(M.normalize(null, larger), larger, { type: 'score', partId: 'decimal-rounding', value: 10.075 });
  assert.equal(rounded.parts['decimal-rounding'].score, 10.08);
});

test('score updates reject nonfinite, nonnumeric and out-of-cap values before rounding', () => {
  const record = M.normalize(null, specs);
  for (const value of [NaN, Infinity, -Infinity, -0.001, 0.301, '0.2', undefined, true]) {
    raises(() => M.change(record, specs, { type: 'score', partId: 'T1-A1', value }), 'RangeError');
  }
  const full = M.change(record, specs, { type: 'score', partId: 'T1-A1', value: 0.3 });
  assert.equal(full.parts['T1-A1'].score, 0.3);
  const cleared = M.change(full, specs, { type: 'score', partId: 'T1-A1', value: null });
  assert.equal(cleared.parts['T1-A1'].score, null);
  assert.equal(M.summarize(cleared, specs).assessedMax, 0);
});

test('step checkboxes are unweighted editorial checks and never award points', () => {
  const initial = M.normalize(null, specs);
  const checked = M.change(initial, specs, { type: 'check', partId: 'T1-A1', stepId: 'result', value: true });
  assert.equal(checked.parts['T1-A1'].score, null);
  assert.equal(M.summarize(checked, specs).score, 0);
  assert.equal(M.summarize(checked, specs).scoredParts, 0);
  assert.equal(M.summarize(checked, specs).checkedSteps, 1);
  const scored = M.change(checked, specs, { type: 'score', partId: 'T1-A1', value: 0.2 });
  const unchecked = M.change(scored, specs, { type: 'check', partId: 'T1-A1', stepId: 'result', value: false });
  assert.equal(unchecked.parts['T1-A1'].score, 0.2);
  assert.equal(M.summarize(unchecked, specs).checkedSteps, 0);
});

test('step progress is task-scoped, reversible and preserves existing hidden notes and flags', () => {
  const initial = M.normalize({ schema: 1, parts: {
    'T1-A1': { score: 0.2, checked: [], uncertain: true, note: 'Keep my saved explanation.' },
    'T2-B1': { score: 1.25, checked: [], uncertain: false, note: 'Another task.' }
  } }, specs);
  let record = M.change(initial, specs, { type: 'check', partId: 'T1-A1', stepId: 'model', value: true });
  record = M.change(record, specs, { type: 'check', partId: 'T1-A1', stepId: 'model', value: true });
  const task = specs.filter(spec => spec.id.startsWith('T1-'));
  assert.equal(M.summarize(record, task).checkedSteps, 1);
  assert.equal(M.summarize(record, task).totalSteps, 3);
  assert.equal(M.summarize(record, specs.filter(spec => spec.id.startsWith('T2-'))).checkedSteps, 0);
  record = M.normalize(plain(record), specs);
  assert.equal(M.summarize(record, task).checkedSteps, 1);
  assert.equal(record.parts['T1-A1'].score, 0.2);
  assert.equal(record.parts['T1-A1'].uncertain, true);
  assert.equal(record.parts['T1-A1'].note, initial.parts['T1-A1'].note);
  assert.equal(record.parts['T2-B1'].note, initial.parts['T2-B1'].note);
  record = M.change(record, specs, { type: 'check', partId: 'T1-A1', stepId: 'model', value: false });
  assert.equal(M.summarize(record, task).checkedSteps, 0);
  assert.equal(M.summarize(record, specs).score, 1.45);
});

test('normalization removes corrupt scores, unknown parts, duplicate and unknown steps', () => {
  const raw = frozen({ schema: 1, parts: {
    'T1-A1': { score: 9, checked: ['result', 'model', 'result', 'unknown'], uncertain: true, note: 'Text\u0000\n<literal>' },
    'T1-A2': { score: '0.5', checked: 'calculation', uncertain: 'true', note: 45 },
    'T2-B1': { score: 1.234, checked: ['unknown'], uncertain: false, note: 'Saved' },
    UNKNOWN: { score: 100 }
  } });
  const result = M.normalize(raw, specs);
  assert.deepEqual(Object.keys(result.parts), specs.map(spec => spec.id));
  assert.equal(result.parts['T1-A1'].score, null);
  assert.deepEqual(plain(result.parts['T1-A1'].checked), ['model', 'result']);
  assert.equal(result.parts['T1-A1'].note, 'Text\n<literal>');
  assert.equal(result.parts['T1-A2'].score, null);
  assert.deepEqual(plain(result.parts['T1-A2'].checked), []);
  assert.equal(result.parts['T1-A2'].uncertain, false);
  assert.equal(result.parts['T1-A2'].note, '');
  assert.equal(result.parts['T2-B1'].score, 1.23);
  assert.equal(raw.parts['T1-A1'].score, 9);
});

test('corrupt records and unsupported schemas produce a fresh assessment', () => {
  for (const raw of [undefined, null, [], '', 42, { schema: 2, parts: {} }, { schema: 1, parts: [] }]) {
    const result = M.normalize(raw, specs);
    assert.equal(result.schema, 1);
    assert.equal(result.parts['T1-A1'].score, null);
  }
  const raw = JSON.parse('{"schema":1,"parts":{"__proto__":{"score":30},"T1-A1":{"score":0.1}}}');
  assert.equal(M.normalize(raw, specs).parts['T1-A1'].score, 0.1);
  assert.equal({}.score, undefined);
});

test('all transitions are immutable, including nested checked arrays', () => {
  const before = frozen(plain(M.normalize(null, specs)));
  const checked = M.change(before, specs, { type: 'check', partId: 'T1-A1', stepId: 'model', value: true });
  assert.notEqual(checked, before);
  assert.notEqual(checked.parts, before.parts);
  assert.notEqual(checked.parts['T1-A1'], before.parts['T1-A1']);
  assert.notEqual(checked.parts['T1-A1'].checked, before.parts['T1-A1'].checked);
  assert.deepEqual(before.parts['T1-A1'].checked, []);
  checked.parts['T1-A2'].note = 'A different output';
  assert.equal(before.parts['T1-A2'].note, '');
});

test('uncertainty prevents completion without changing self-assessed points', () => {
  let record = M.normalize(null, specs);
  for (const spec of specs) record = M.change(record, specs, { type: 'score', partId: spec.id, value: spec.max });
  assert.equal(M.summarize(record, specs).complete, true);
  record = M.change(record, specs, { type: 'uncertain', partId: 'T1-A2', value: true });
  assert.equal(M.summarize(record, specs).complete, false);
  assert.equal(M.summarize(record, specs).uncertainParts, 1);
  assert.equal(M.summarize(record, specs).score, 3.25);
  record = M.change(record, specs, { type: 'uncertain', partId: 'T1-A2', value: false });
  assert.equal(M.summarize(record, specs).complete, true);
  const empty = M.summarize(M.normalize(null, []), []);
  assert.equal(empty.complete, false);
});

test('notes retain plain text, remove control characters and respect the length limit', () => {
  let record = M.normalize(null, specs);
  record = M.change(record, specs, { type: 'note', partId: 'T1-A1', value: '<b>My explanation</b>\n\tLiteral notes' });
  assert.equal(record.parts['T1-A1'].note, '<b>My explanation</b>\n\tLiteral notes');
  record = M.change(record, specs, { type: 'note', partId: 'T1-A1', value: 'x'.repeat(1999) + '😀ending' });
  assert.equal(record.parts['T1-A1'].note.length, 1999);
  record = M.normalize({ schema: 1, parts: { 'T1-A1': { note: 'a'.repeat(3000) } } }, specs);
  assert.equal(record.parts['T1-A1'].note.length, 2000);
});

test('invalid specifications, part IDs, step IDs and action payloads fail clearly', () => {
  for (const invalid of [null, {}, [{ id: '', max: 1, stepIds: [] }],
    [{ id: '__proto__', max: 1, stepIds: [] }], [{ id: 'A', max: 1, stepIds: ['x', 'x'] }],
    [{ id: 'A', max: 1, stepIds: [null] }], [{ id: 'A', max: 1 }],
    [{ id: 'A', max: 1, stepIds: [] }, { id: 'A', max: 2, stepIds: [] }]]) {
    raises(() => M.normalize(null, invalid), 'TypeError');
  }
  for (const max of [-1, Infinity, NaN, '2', Number.MAX_VALUE]) raises(() => M.normalize(null, [{ id: 'A', max, stepIds: [] }]), 'RangeError');
  const record = M.normalize(null, specs);
  raises(() => M.change(record, specs, null), 'TypeError');
  raises(() => M.change(record, specs, { type: 'score', partId: 'missing', value: 0 }), 'RangeError');
  raises(() => M.change(record, specs, { type: 'check', partId: 'T1-A1', stepId: 'missing', value: true }), 'RangeError');
  raises(() => M.change(record, specs, { type: 'check', partId: 'T1-A1', stepId: 'model', value: 1 }), 'TypeError');
  raises(() => M.change(record, specs, { type: 'uncertain', partId: 'T1-A1', value: 1 }), 'TypeError');
  raises(() => M.change(record, specs, { type: 'note', partId: 'T1-A1', value: null }), 'TypeError');
  raises(() => M.change(record, specs, { type: 'automatic-points', partId: 'T1-A1' }), 'RangeError');
});

test('score formatting supports Russian, English, Kyrgyz and invalid input safely', () => {
  assert.equal(M.formatScore(1.5, 'en'), '1.5');
  assert.equal(M.formatScore(1.5, 'ru'), '1,5');
  assert.equal(M.formatScore(0, 'ky'), '0');
  assert.equal(M.formatScore(1.234, 'ky'), new Intl.NumberFormat('ky-KG', { maximumFractionDigits: 2, useGrouping: false }).format(1.23));
  assert.equal(M.formatScore(1, 'not_a_locale'), '1');
  assert.equal(M.formatScore(NaN, 'en'), '—');
  assert.equal(M.formatScore(null, 'en'), '—');
});

const solutionFiles = [1, 2, 3].map(n => new URL(`assets/practice/ipho-2026/solutions/t${n}.json`, root));
if (solutionFiles.every(existsSync)) {
  test('actual solution parts preserve the published 30-point total and never derive scores from step checks', () => {
    const actual = solutionFiles.flatMap(file => JSON.parse(readFileSync(file, 'utf8')).parts.map(part => ({
      id: part.id, max: part.max, stepIds: part.steps.map(step => step.id)
    })));
    let record = M.normalize(null, actual);
    for (const spec of actual) {
      for (const stepId of spec.stepIds) record = M.change(record, actual, { type: 'check', partId: spec.id, stepId, value: true });
    }
    assert.equal(M.summarize(record, actual).max, 30);
    assert.equal(M.summarize(record, actual).score, 0);
    assert.equal(M.summarize(record, actual).scoredParts, 0);
    for (const spec of actual) record = M.change(record, actual, { type: 'score', partId: spec.id, value: spec.max });
    const summary = M.summarize(record, actual);
    assert.equal(summary.score, 30);
    assert.equal(summary.lost, 0);
    assert.equal(summary.complete, true);
    for (const [i, file] of solutionFiles.entries()) {
      const parts = JSON.parse(readFileSync(file, 'utf8')).parts;
      const max = parts.reduce((total, part) => total + Math.round(part.max * 100), 0) / 100;
      assert.equal(max, 10, `T${i + 1} must have 10 points`);
    }
  });
} else {
  console.log('SKIP actual solution fixtures: still being written; rerun once all three JSON files exist.');
}

let failed = 0;
for (const { name, run } of tests) {
  try { run(); console.log('PASS ' + name); }
  catch (error) { failed++; console.error('FAIL ' + name); console.error(error); }
}
console.log(`Review model: ${tests.length - failed} passed; ${failed} failed.`);
if (failed) process.exitCode = 1;
