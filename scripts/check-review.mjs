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

test('published criterion weights are added individually and survive reloading', () => {
  const parts = [{ id: 'T1-A1', max: 0.8, stepIds: ['model', 'calculation', 'result'], stepPoints: [0.3, 0.3, 0.2] }];
  const toggle = (record, stepId, value) => M.change(record, parts, {type: 'check', partId: 'T1-A1', stepId, value});
  let record = toggle(null, 'result', true);
  assert.equal(M.summarize(record, parts).score, 0.2);
  record = toggle(M.normalize(plain(record), parts), 'model', true);
  assert.equal(M.summarize(record, parts).score, 0.5);
  record = toggle(record, 'result', false);
  assert.equal(M.summarize(record, parts).score, 0.3);
  raises(() => M.normalize(null, [{...parts[0], stepPoints: [0.2, 0.3, 0.2]}]), 'RangeError');
});

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

test('step checkboxes divide each part maximum equally and explicit zero differs from untouched null', () => {
  const initial = M.normalize(null, specs);
  assert.equal(initial.parts['T1-A1'].score, null);
  let record = M.change(initial, specs, { type: 'check', partId: 'T1-A1', stepId: 'result', value: true });
  assert.equal(record.parts['T1-A1'].score, 0.15);
  assert.equal(M.summarize(record, specs).score, 0.15);
  assert.equal(M.summarize(record, specs).scoredParts, 1);
  assert.equal(M.summarize(record, specs).checkedSteps, 1);
  record = M.change(record, specs, { type: 'check', partId: 'T1-A1', stepId: 'model', value: true });
  assert.equal(record.parts['T1-A1'].score, 0.3);
  record = M.change(record, specs, { type: 'check', partId: 'T1-A1', stepId: 'result', value: false });
  assert.equal(record.parts['T1-A1'].score, 0.15);
  record = M.change(record, specs, { type: 'check', partId: 'T1-A1', stepId: 'model', value: false });
  assert.equal(record.parts['T1-A1'].score, 0);
  assert.equal(record.parts['T1-A2'].score, null);
  assert.equal(M.summarize(record, specs).scoredParts, 1);
  assert.equal(M.summarize(record, specs).checkedSteps, 0);
});

test('automatic fractions round to two decimals, remain reversible and reach the exact maximum', () => {
  const fractions = [{ id: 'sixths', max: 1, stepIds: ['a','b','c','d','e','f'] }, { id: 'half-cent', max: 0.03, stepIds: ['a','b'] }];
  let record = M.normalize(null, fractions);
  for (const [index, expected] of [0.17,0.33,0.5,0.67,0.83,1].entries()) {
    record = M.change(record, fractions, { type: 'check', partId: 'sixths', stepId: fractions[0].stepIds[index], value: true });
    assert.equal(record.parts.sixths.score, expected);
  }
  for (const [index, expected] of [0.83,0.67,0.5,0.33,0.17,0].entries()) {
    record = M.change(record, fractions, { type: 'check', partId: 'sixths', stepId: fractions[0].stepIds[index], value: false });
    assert.equal(record.parts.sixths.score, expected);
  }
  record = M.change(record, fractions, { type: 'check', partId: 'half-cent', stepId: 'a', value: true });
  assert.equal(record.parts['half-cent'].score, 0.02);
  record = M.change(record, fractions, { type: 'check', partId: 'half-cent', stepId: 'b', value: true });
  assert.equal(record.parts['half-cent'].score, 0.03);
});

test('manual overrides and legacy scores survive loading until the next checkbox event for that part', () => {
  const legacy = { schema: 1, parts: { 'T1-A1': { score: 0.27, checked: ['model'], uncertain: true, note: 'Saved manual score.' } } };
  let record = M.normalize(frozen(legacy), specs);
  assert.equal(record.parts['T1-A1'].score, 0.27);
  record = M.normalize(plain(record), specs);
  assert.equal(record.parts['T1-A1'].score, 0.27);
  record = M.change(record, specs, { type: 'check', partId: 'T1-A2', stepId: 'calculation', value: true });
  assert.equal(record.parts['T1-A1'].score, 0.27);
  record = M.change(record, specs, { type: 'score', partId: 'T1-A1', value: 0.2 });
  assert.deepEqual(plain(record.parts['T1-A1'].checked), ['model']);
  assert.equal(M.normalize(plain(record), specs).parts['T1-A1'].score, 0.2);
  record = M.change(record, specs, { type: 'check', partId: 'T1-A1', stepId: 'result', value: true });
  assert.equal(record.parts['T1-A1'].score, 0.3);
  assert.equal(record.parts['T1-A1'].note, legacy.parts['T1-A1'].note);
  assert.equal(record.parts['T1-A1'].uncertain, true);
  record = M.change(record, specs, { type: 'score', partId: 'T1-A1', value: null });
  assert.equal(record.parts['T1-A1'].score, null);
  assert.deepEqual(plain(record.parts['T1-A1'].checked), ['model','result']);
  record = M.change(record, specs, { type: 'check', partId: 'T1-A1', stepId: 'model', value: false });
  assert.equal(record.parts['T1-A1'].score, 0.15);
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
  assert.equal(record.parts['T1-A1'].score, 0.15);
  assert.equal(record.parts['T1-A1'].uncertain, true);
  assert.equal(record.parts['T1-A1'].note, initial.parts['T1-A1'].note);
  assert.equal(record.parts['T2-B1'].note, initial.parts['T2-B1'].note);
  record = M.change(record, specs, { type: 'check', partId: 'T1-A1', stepId: 'model', value: false });
  assert.equal(M.summarize(record, task).checkedSteps, 0);
  assert.equal(M.summarize(record, specs).score, 1.25);
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
  test('checking every step reaches the published 30-point total and unchecking reverses it to zero', () => {
    const actual = solutionFiles.flatMap(file => JSON.parse(readFileSync(file, 'utf8')).parts.map(part => ({
      id: part.id, max: part.max, stepIds: part.steps.map(step => step.id)
    })));
    let record = M.normalize(null, actual);
    for (const spec of actual) {
      for (const stepId of spec.stepIds) record = M.change(record, actual, { type: 'check', partId: spec.id, stepId, value: true });
    }
    assert.equal(M.summarize(record, actual).max, 30);
    assert.equal(M.summarize(record, actual).score, 30);
    assert.equal(M.summarize(record, actual).scoredParts, 23);
    for (const spec of actual) assert.equal(record.parts[spec.id].score, spec.max);
    for (const spec of actual) record = M.change(record, actual, { type: 'score', partId: spec.id, value: spec.max });
    const summary = M.summarize(record, actual);
    assert.equal(summary.score, 30);
    assert.equal(summary.lost, 0);
    assert.equal(summary.complete, true);
    for (const spec of actual) for (const stepId of spec.stepIds) record = M.change(record, actual, { type: 'check', partId: spec.id, stepId, value: false });
    assert.equal(M.summarize(record, actual).score, 0);
    assert.equal(M.summarize(record, actual).checkedSteps, 0);
    assert.equal(M.summarize(record, actual).scoredParts, 23);
    for (const [i, file] of solutionFiles.entries()) {
      const parts = JSON.parse(readFileSync(file, 'utf8')).parts;
      const max = parts.reduce((total, part) => total + Math.round(part.max * 100), 0) / 100;
      assert.equal(max, 10, `T${i + 1} must have 10 points`);
    }
  });
} else {
  console.log('SKIP actual solution fixtures: still being written; rerun once all three JSON files exist.');
}

test('each listed theory edition awards its published subpart and round totals', () => {
  const catalog = readFileSync(new URL('practice/ipho/index.html', root), 'utf8');
  const editions = [...catalog.matchAll(/<details\b[^>]*\bdata-edition="(ipho-\d{4})"/g)].map(match => match[1]);
  assert.ok(editions.length > 0);
  assert.equal(new Set(editions).size, editions.length);
  for (const edition of editions) {
    const directory = new URL('assets/practice/' + edition + '/', root);
    const reader = readFileSync(new URL('practice/' + edition + '/index.html', root), 'utf8');
    const sidebarMax = new Map([...reader.matchAll(/data-task-score="(T[123])"(?: data-max="([\d.]+)")?>([\d.]+) баллов/g)]
      .map(match => [match[1], Number(match[2] || match[3])]));
    assert.equal(sidebarMax.size, 3, edition + ' sidebar');
    const rubric = [];
    for (const number of [1, 2, 3]) {
      const paper = JSON.parse(readFileSync(new URL('q' + number + '_metadata.json', directory), 'utf8'));
      const solution = JSON.parse(readFileSync(new URL('solutions/t' + number + '.json', directory), 'utf8'));
      assert.deepEqual(solution.parts.map(part => [part.id, part.max]),
        paper.subtasks.map(part => [part.id, part.points]), edition + ' T' + number);
      assert.equal(solution.max, paper.points);
      assert.equal(sidebarMax.get('T' + number), paper.points, edition + ' T' + number + ' sidebar');
      assert.equal(solution.parts.reduce((total, part) => total + Math.round(part.max * 100), 0), Math.round(paper.points * 100));
      for (const part of solution.parts) {
        const spec = {id: part.id, max: part.max, stepIds: part.steps.map(step => step.id)};
        if (part.steps.some(step => step.points !== undefined)) spec.stepPoints = part.steps.map(step => step.points);
        rubric.push(spec);
      }
    }
    let record = M.normalize(null, rubric);
    for (const spec of rubric) {
      for (const stepId of spec.stepIds) {
        record = M.change(record, rubric, {type: 'check', partId: spec.id, stepId, value: true});
      }
      assert.equal(record.parts[spec.id].score, spec.max, edition + ' ' + spec.id);
    }
    assert.equal(M.summarize(record, rubric).score, 30, edition);
  }
});

let failed = 0;
for (const { name, run } of tests) {
  try { run(); console.log('PASS ' + name); }
  catch (error) { failed++; console.error('FAIL ' + name); console.error(error); }
}
console.log(`Review model: ${tests.length - failed} passed; ${failed} failed.`);
if (failed) process.exitCode = 1;
