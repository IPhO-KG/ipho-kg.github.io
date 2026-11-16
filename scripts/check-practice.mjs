import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const filename = new URL('../assets/js/practice-engine.js', import.meta.url);
const context = { window: {} };
vm.runInNewContext(readFileSync(filename, 'utf8'), context, { filename: filename.pathname });
const E = context.window.NPHO_PRACTICE_ENGINE;
const START = 1_800_000_000_000;
const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const exam = () => E.create('exam-test', 'exam', 90 * MINUTE, START);
const training = () => E.create('training-test', 'training', 90 * MINUTE, START);
let passed = 0;
let failed = 0;
function test(name, fn) {
  try { fn(); passed++; console.log(`PASS ${name}`); }
  catch (error) { failed++; console.error(`FAIL ${name}: ${error.message}`); }
}

test('exam duration is fixed at five hours regardless of a valid selected time', () => {
  const state = exam();
  assert.equal(state.durationMs, 5 * HOUR);
  assert.equal(state.deadline, START + 5 * HOUR);
  assert.equal(E.remaining(state, START), 5 * HOUR);
});

test('refresh or sleep uses absolute time, not the number of interval callbacks', () => {
  const restored = JSON.parse(JSON.stringify(exam()));
  assert.equal(E.remaining(restored, START + 73 * MINUTE), 227 * MINUTE);
  assert.equal(E.normalize(restored, START + 73 * MINUTE).status, 'running');
  const expired = E.normalize(restored, START + 9 * HOUR);
  assert.equal(expired.status, 'expired');
  assert.equal(expired.finishedAt, START + 5 * HOUR);
  assert.equal(E.remaining(expired, START + 9 * HOUR), 0);
});

test('expiry occurs exactly at the deadline and is idempotent', () => {
  const state = exam();
  assert.equal(E.normalize(state, state.deadline - 1).status, 'running');
  const expired = E.normalize(state, state.deadline);
  assert.equal(expired.status, 'expired');
  assert.equal(expired.remainingAtFinish, 0);
  assert.strictEqual(E.normalize(expired, state.deadline + MINUTE), expired);
});

test('an action arriving after expiry cannot keep the attempt alive', () => {
  const state = training();
  for (const action of [{ type: 'pause' }, { type: 'finish' }, { type: 'task', id: 'T2', value: 'done' }]) {
    const next = E.change(state, action, state.deadline + 1);
    assert.equal(next.status, 'expired');
    assert.equal(next.tasks.T2, 'new');
  }
});

test('exam cannot be paused or resumed', () => {
  const state = exam();
  assert.strictEqual(E.change(state, { type: 'pause' }, START + MINUTE), state);
  assert.strictEqual(E.change(state, { type: 'resume' }, START + MINUTE), state);
});

test('training pause freezes remaining time and resume excludes time spent paused', () => {
  const state = training();
  const paused = E.change(state, { type: 'pause' }, START + 20 * MINUTE);
  assert.equal(paused.status, 'paused');
  assert.equal(paused.deadline, null);
  assert.equal(E.remaining(paused, START + 7 * HOUR), 70 * MINUTE);
  const resumed = E.change(paused, { type: 'resume' }, START + 7 * HOUR);
  assert.equal(resumed.status, 'running');
  assert.equal(resumed.deadline, START + 7 * HOUR + 70 * MINUTE);
  assert.equal(E.remaining(resumed, START + 7 * HOUR + 10 * MINUTE), 60 * MINUTE);
});

test('repeated pause and resume preserve the remaining budget', () => {
  let state = training();
  state = E.change(state, { type: 'pause' }, START + 10 * MINUTE);
  const paused = state;
  assert.strictEqual(E.change(state, { type: 'pause' }, START + 11 * MINUTE), paused);
  state = E.change(state, { type: 'resume' }, START + 20 * MINUTE);
  state = E.change(state, { type: 'pause' }, START + 30 * MINUTE);
  assert.equal(E.remaining(state, START + 60 * MINUTE), 70 * MINUTE);
});

test('manual finish freezes remaining time and all task statuses', () => {
  let state = exam();
  state = E.change(state, { type: 'task', id: 'T1', value: 'done' }, START + MINUTE);
  const finished = E.change(state, { type: 'finish' }, START + 45 * MINUTE);
  assert.equal(finished.status, 'finished');
  assert.equal(finished.finishedAt, START + 45 * MINUTE);
  assert.equal(E.remaining(finished, START + 20 * HOUR), 255 * MINUTE);
  for (const action of [{ type: 'resume' }, { type: 'pause' }, { type: 'finish' }, { type: 'task', id: 'T1', value: 'new' }]) {
    assert.strictEqual(E.change(finished, action, START + 46 * MINUTE), finished);
  }
  assert.equal(finished.tasks.T1, 'done');
});

test('finishing a paused training attempt records the active time budget', () => {
  const paused = E.change(training(), { type: 'pause' }, START + 25 * MINUTE);
  const finished = E.change(paused, { type: 'finish' }, START + 4 * HOUR);
  assert.equal(finished.status, 'finished');
  assert.equal(finished.remainingAtFinish, 65 * MINUTE);
});

test('reflection can be saved after completion without changing exam facts', () => {
  const finished = E.change(exam(), { type: 'finish' }, START + MINUTE);
  const revised = E.change(finished, { type: 'reflection', value: 'x'.repeat(5100) }, START + 2 * MINUTE);
  assert.equal(revised.reflection.length, 5000);
  assert.equal(revised.status, finished.status);
  assert.equal(revised.finishedAt, finished.finishedAt);
  assert.equal(revised.remainingAtFinish, finished.remainingAtFinish);
  assert.equal(revised.revision, finished.revision + 1);
});

test('task transitions are immutable and reject unknown task or status', () => {
  const before = exam();
  const after = E.change(before, { type: 'task', id: 'T3', value: 'revisit' }, START + MINUTE);
  assert.equal(before.tasks.T3, 'new');
  assert.equal(after.tasks.T3, 'revisit');
  assert.notStrictEqual(after.tasks, before.tasks);
  assert.strictEqual(E.change(after, { type: 'task', id: 'T4', value: 'done' }, START + 2 * MINUTE), after);
  assert.strictEqual(E.change(after, { type: 'task', id: 'T3', value: 'unknown' }, START + 2 * MINUTE), after);
});

test('a backward wall-clock adjustment cannot restore already checkpointed time', () => {
  const checkpointed = E.change(exam(), { type: 'checkpoint' }, START + HOUR);
  assert.equal(E.remaining(checkpointed, START + 20 * MINUTE), 4 * HOUR);
  const next = E.change(checkpointed, { type: 'task', id: 'T1', value: 'working' }, START + 30 * MINUTE);
  assert.equal(next.lastSeenAt, START + HOUR);
  assert.equal(E.remaining(next, START + 30 * MINUTE), 4 * HOUR);
});

test('corrupt persisted state is rejected before it can produce a NaN timer', () => {
  for (const patch of [
    { lastSeenAt: undefined }, { lastSeenAt: NaN }, { lastSeenAt: Infinity },
    { updatedAt: undefined }, { startedAt: NaN }, { deadline: undefined },
    { durationMs: -1 }, { tasks: { T1: 'new', T2: 'new' } }, { schema: 999 },
  ]) {
    const corrupt = { ...exam(), ...patch };
    assert.equal(Boolean(E.validate(corrupt)), false, `accepted corrupt keys: ${Object.keys(patch).join(', ')}`);
    assert.equal(E.normalize(corrupt, START), null);
  }
});

test('invalid paused states are rejected', () => {
  const paused = E.change(training(), { type: 'pause' }, START + MINUTE);
  for (const patch of [{ mode: 'exam' }, { pausedRemaining: -1 }, { pausedRemaining: 91 * MINUTE }, { pausedRemaining: NaN }]) {
    assert.equal(Boolean(E.validate({ ...paused, ...patch })), false, `accepted corrupt paused state: ${JSON.stringify(patch)}`);
  }
});

test('invalid terminal time budgets are rejected', () => {
  const finished = E.change(exam(), { type: 'finish' }, START + MINUTE);
  for (const patch of [{ finishedAt: undefined }, { remainingAtFinish: NaN }, { remainingAtFinish: -1 }, { remainingAtFinish: 6 * HOUR }]) {
    assert.equal(Boolean(E.validate({ ...finished, ...patch })), false, `accepted corrupt terminal state: ${JSON.stringify(patch)}`);
  }
});

test('invalid attempt settings fail clearly', () => {
  for (const args of [
    ['', 'exam', HOUR, START], ['x', 'other', HOUR, START],
    ['x', 'training', 0, START], ['x', 'training', 25 * HOUR, START],
    ['x', 'training', HOUR, NaN],
  ]) assert.throws(() => E.create(...args));
});

test('timer formatting rounds upward until actual expiry', () => {
  assert.equal(E.formatTime(5 * HOUR), '05:00:00');
  assert.equal(E.formatTime(1), '00:00:01');
  assert.equal(E.formatTime(60_001), '00:01:01');
  assert.equal(E.formatTime(0), '00:00:00');
  assert.equal(E.formatTime(-1), '00:00:00');
});

console.log(`Practice engine: ${passed} passed; ${failed} failed.`);
if (failed) process.exitCode = 1;
