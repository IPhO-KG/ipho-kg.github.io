/* Pure attempt transitions. Time is measured against a deadline, not interval ticks. */
(function (root) {
  'use strict';
  const VERSION = 1;
  const TASK_STATES = ['new', 'working', 'revisit', 'done'];
  const terminal = state => state && ['finished', 'expired'].includes(state.status);
  function validate(state) {
    return !!state && state.schema === VERSION && typeof state.id === 'string' &&
      state.pack === 'ipho-2026' && ['exam', 'training'].includes(state.mode) &&
      ['running', 'paused', 'finished', 'expired'].includes(state.status) &&
      Number.isFinite(state.durationMs) && state.durationMs >= 60000 && state.durationMs <= 24 * 3600000 &&
      (state.mode !== 'exam' || state.durationMs === 5 * 3600000) &&
      Number.isFinite(state.startedAt) && Number.isInteger(state.revision) && state.revision >= 0 &&
      Number.isFinite(state.lastSeenAt) && Number.isFinite(state.updatedAt) &&
      (state.status !== 'running' || Number.isFinite(state.deadline)) &&
      (state.status !== 'paused' || (state.mode === 'training' && Number.isFinite(state.pausedRemaining) &&
        state.pausedRemaining > 0 && state.pausedRemaining <= state.durationMs)) &&
      (!terminal(state) || (Number.isFinite(state.finishedAt) && Number.isFinite(state.remainingAtFinish) &&
        state.remainingAtFinish >= 0 && state.remainingAtFinish <= state.durationMs)) &&
      state.tasks && ['T1', 'T2', 'T3'].every(id => TASK_STATES.includes(state.tasks[id]));
  }
  function create(id, mode, durationMs, now) {
    if (!id || !['exam', 'training'].includes(mode) || !Number.isFinite(now) ||
        !Number.isFinite(durationMs) || durationMs < 60000 || durationMs > 24 * 3600000) {
      throw new Error('Invalid attempt settings');
    }
    const duration = mode === 'exam' ? 5 * 3600000 : durationMs;
    return { schema: VERSION, id, pack: 'ipho-2026', contentVersion: 'ru-1.0', mode,
      durationMs: duration, startedAt: now, deadline: now + duration, status: 'running',
      pausedRemaining: null, finishedAt: null, remainingAtFinish: null,
      lastSeenAt: now, updatedAt: now, revision: 0,
      tasks: { T1: 'new', T2: 'new', T3: 'new' }, reflection: '' };
  }
  function remaining(state, now) {
    if (terminal(state)) return Math.max(0, state.remainingAtFinish || 0);
    if (state.status === 'paused') return Math.max(0, state.pausedRemaining);
    return Math.max(0, Math.min(state.durationMs, state.deadline - Math.max(now, state.lastSeenAt)));
  }
  function normalize(state, now) {
    if (!validate(state)) return null;
    if (terminal(state)) return state;
    if (state.status === 'running' && remaining(state, now) <= 0) {
      return { ...state, status: 'expired', finishedAt: state.deadline,
        remainingAtFinish: 0, updatedAt: now, lastSeenAt: Math.max(now, state.lastSeenAt),
        revision: state.revision + 1 };
    }
    return state;
  }
  function change(state, action, now) {
    state = normalize(state, now);
    if (!state) throw new Error('Invalid attempt');
    if (action.type === 'reflection') {
      return { ...state, reflection: String(action.value || '').slice(0, 5000), updatedAt: now, revision: state.revision + 1 };
    }
    if (terminal(state)) return state;
    let next = { ...state };
    if (action.type === 'pause' && state.mode === 'training' && state.status === 'running') {
      next.pausedRemaining = remaining(state, now); next.deadline = null; next.status = 'paused';
    } else if (action.type === 'resume' && state.mode === 'training' && state.status === 'paused') {
      next.deadline = now + state.pausedRemaining; next.pausedRemaining = null; next.status = 'running';
    } else if (action.type === 'finish') {
      next.remainingAtFinish = remaining(state, now); next.status = 'finished'; next.finishedAt = now;
    } else if (action.type === 'task' && ['T1', 'T2', 'T3'].includes(action.id) && TASK_STATES.includes(action.value)) {
      next.tasks = { ...state.tasks, [action.id]: action.value };
    } else if (action.type !== 'checkpoint') {
      return state;
    }
    next.updatedAt = now; next.lastSeenAt = Math.max(now, state.lastSeenAt); next.revision = state.revision + 1;
    return next;
  }
  function formatTime(ms) {
    const seconds = Math.max(0, Math.ceil(ms / 1000));
    return [Math.floor(seconds / 3600), Math.floor(seconds / 60) % 60, seconds % 60]
      .map(n => String(n).padStart(2, '0')).join(':');
  }
  root.NPHO_PRACTICE_ENGINE = { create, validate, normalize, change, remaining, terminal, formatTime, TASK_STATES };
})(typeof window !== 'undefined' ? window : globalThis);
