import assert from 'node:assert/strict';
import test from 'node:test';
import {
  calculateIotSessionTiming,
  canRunReadOnlyIotAutoBatchCoordinator,
  createReadOnlyIotAutoBatchCoordinator,
  createIotSessionEventTracker,
  formatIotElapsedDuration,
  getDeterministicIotBatchId,
  isValidIotSessionId,
  selectIotAutoBatchCandidate,
} from '../services/iotAutoBatch.ts';
import { normalizeIotTimestamp } from '../services/iotDataValidation.ts';
import { IOT_AUTO_BATCH_WRITES_ENABLED } from '../config/iotAutoBatch.ts';

const now = Date.parse('2026-11-19T08:00:00.000Z');
const baseCandidate = {
  id: 'session-alpha',
  firstReadingAt: '2026-11-19T07:55:00.000Z',
  latestReadingAt: '2026-11-19T07:59:00.000Z',
  validReadingCount: 2,
  session: null,
};
const baseContext = {
  farmerUid: 'farmer-1',
  role: 'farmer',
  nowMs: now,
  staleAfterMs: 30 * 60_000,
  maxFutureSkewMs: 60_000,
  minValidReadings: 2,
  hasConflictingActiveBatch: false,
  associatedSessionIds: new Set(),
};

test('automatic Firestore writes remain hard-disabled in stage one', () => {
  assert.equal(IOT_AUTO_BATCH_WRITES_ENABLED, false);
});

test('read-only coordinator requires an authenticated Farmer and loaded batches', () => {
  const ready = { detectionEnabled: true, farmerUid: 'farmer-1', role: 'farmer', batchesLoaded: true };
  assert.equal(canRunReadOnlyIotAutoBatchCoordinator(ready), true);
  assert.equal(canRunReadOnlyIotAutoBatchCoordinator({ ...ready, detectionEnabled: false }), false);
  assert.equal(canRunReadOnlyIotAutoBatchCoordinator({ ...ready, farmerUid: null }), false);
  assert.equal(canRunReadOnlyIotAutoBatchCoordinator({ ...ready, role: 'warehouse' }), false);
  assert.equal(canRunReadOnlyIotAutoBatchCoordinator({ ...ready, batchesLoaded: false }), false);
});

test('read-only coordinator suppresses history, cleans up, and ignores post-stop events', async () => {
  const diagnostics = [];
  let emit;
  let unsubscribed = 0;
  const coordinator = createReadOnlyIotAutoBatchCoordinator({
    source: (onSession) => {
      emit = onSession;
      return { ready: Promise.resolve(4), unsubscribe: () => { unsubscribed += 1; } };
    },
    getContext: () => baseContext,
    onDiagnostic: (value) => diagnostics.push(value),
    now: () => now,
  });
  await Promise.resolve();
  assert.deepEqual(diagnostics.at(-1), { state: 'rejected', reason: 'no-eligible-session' });
  coordinator.stop();
  emit?.({ candidate: baseCandidate, session: null });
  assert.equal(unsubscribed, 1);
  assert.deepEqual(diagnostics.at(-1), { state: 'rejected', reason: 'no-eligible-session' });
});

test('read-only coordinator handles detector updates and rejects multiple eligible sessions', async () => {
  const diagnostics = [];
  let emit;
  const coordinator = createReadOnlyIotAutoBatchCoordinator({
    source: (onSession) => {
      emit = onSession;
      return { ready: Promise.resolve(0), unsubscribe: () => {} };
    },
    getContext: () => baseContext,
    onDiagnostic: (value) => diagnostics.push(value),
    now: () => now,
  });
  await Promise.resolve();
  emit?.({ candidate: baseCandidate, session: null });
  assert.deepEqual(diagnostics.at(-1), { state: 'eligible', sessionId: 'session-alpha' });
  emit?.({ candidate: baseCandidate, session: null });
  assert.deepEqual(diagnostics.at(-1), { state: 'eligible', sessionId: 'session-alpha' });
  emit?.({ candidate: { ...baseCandidate, id: 'session-beta' }, session: null });
  assert.deepEqual(diagnostics.at(-1), { state: 'rejected', reason: 'ambiguous-sessions' });
  coordinator.stop();
});

test('coordinator invokes automatic creation once for repeated events and concurrent callbacks', async () => {
  let emit;
  let resolveCreation;
  let creationCalls = 0;
  const diagnostics = [];
  const coordinator = createReadOnlyIotAutoBatchCoordinator({
    source: (onSession) => {
      emit = onSession;
      return { ready: Promise.resolve(0), unsubscribe: () => {} };
    },
    getContext: () => baseContext,
    onDiagnostic: (value) => diagnostics.push(value),
    onEligible: () => {
      creationCalls += 1;
      return new Promise((resolve) => { resolveCreation = resolve; });
    },
    now: () => now,
  });
  await Promise.resolve();
  emit?.({ candidate: baseCandidate, session: null });
  emit?.({ candidate: { ...baseCandidate, validReadingCount: 3 }, session: null });
  assert.equal(creationCalls, 1);
  assert.deepEqual(diagnostics.at(-1), { state: 'eligible', sessionId: 'session-alpha' });
  resolveCreation?.({ created: true });
  await Promise.resolve();
  emit?.({ candidate: { ...baseCandidate, validReadingCount: 4 }, session: null });
  assert.equal(creationCalls, 1);
  coordinator.stop();
});

test('failed automatic creation retries only after the cooldown on a later detector event', async () => {
  let emit;
  let currentTime = now;
  let creationCalls = 0;
  const coordinator = createReadOnlyIotAutoBatchCoordinator({
    source: (onSession) => {
      emit = onSession;
      return { ready: Promise.resolve(0), unsubscribe: () => {} };
    },
    getContext: () => baseContext,
    onDiagnostic: () => {},
    onEligible: async () => {
      creationCalls += 1;
      if (creationCalls === 1) throw new Error('offline');
      return { created: false };
    },
    retryDelayMs: 1_000,
    now: () => currentTime,
  });
  await Promise.resolve();
  emit?.({ candidate: baseCandidate, session: null });
  await Promise.resolve();
  await Promise.resolve();
  emit?.({ candidate: { ...baseCandidate, validReadingCount: 3 }, session: null });
  assert.equal(creationCalls, 1);
  currentTime += 1_001;
  emit?.({ candidate: { ...baseCandidate, validReadingCount: 4 }, session: null });
  await Promise.resolve();
  assert.equal(creationCalls, 2);
  coordinator.stop();
});

test('IoT session mapping is deterministic and rejects unsafe IDs', () => {
  assert.equal(getDeterministicIotBatchId('session-alpha_001'), 'IOT_session-alpha_001');
  assert.equal(getDeterministicIotBatchId('session-alpha_001'), getDeterministicIotBatchId('session-alpha_001'));
  assert.equal(isValidIotSessionId('session-alpha_001'), true);
  for (const invalid of ['', 'bad.session', 'bad/session', 'bad session', 'x'.repeat(101)]) {
    assert.equal(isValidIotSessionId(invalid), false);
    assert.throws(() => getDeterministicIotBatchId(invalid));
  }
});

test('invalid IoT calendar timestamps are rejected instead of normalized', () => {
  assert.equal(normalizeIotTimestamp('2060-02-30 00:00:00'), null);
  assert.equal(normalizeIotTimestamp('2050-22-150 45:130:00'), null);
  assert.equal(normalizeIotTimestamp('2000-00-00 00:00:00'), null);
  assert.equal(normalizeIotTimestamp('2026-11-19T15:30:00+08:00'), '2026-11-19T07:30:00.000Z');
});

test('historical baseline sessions never emit as new and reconnect events are deduplicated', () => {
  const tracker = createIotSessionEventTracker(['historical-session']);
  assert.equal(tracker.isNewSession('historical-session'), false);
  assert.equal(tracker.shouldEmit('historical-session', 'signature-1'), false);
  assert.equal(tracker.isNewSession('new-session'), true);
  assert.equal(tracker.shouldEmit('new-session', 'signature-1'), true);
  assert.equal(tracker.shouldEmit('new-session', 'signature-1'), false);
  assert.equal(tracker.shouldEmit('new-session', 'signature-2'), true);
});

test('exactly one recent ongoing session is eligible for a signed-in Farmer', () => {
  const selection = selectIotAutoBatchCandidate([baseCandidate], baseContext);
  assert.equal(selection.kind, 'ready');
  if (selection.kind === 'ready') assert.equal(selection.candidate.id, baseCandidate.id);
});

test('unauthorized, stale, completed, associated, and conflicting sessions fail closed', () => {
  assert.deepEqual(selectIotAutoBatchCandidate([baseCandidate], { ...baseContext, farmerUid: null }), { kind: 'blocked', reason: 'unauthorized-farmer' });
  assert.deepEqual(selectIotAutoBatchCandidate([baseCandidate], { ...baseContext, hasConflictingActiveBatch: true }), { kind: 'blocked', reason: 'active-batch-exists' });
  assert.deepEqual(selectIotAutoBatchCandidate([{ ...baseCandidate, latestReadingAt: '2026-11-19T06:00:00.000Z' }], baseContext), { kind: 'blocked', reason: 'no-eligible-session' });
  assert.deepEqual(selectIotAutoBatchCandidate([{ ...baseCandidate, session: { status: 'COMPLETED' } }], baseContext), { kind: 'blocked', reason: 'no-eligible-session' });
  assert.deepEqual(selectIotAutoBatchCandidate([baseCandidate], { ...baseContext, associatedSessionIds: new Set([baseCandidate.id]) }), { kind: 'blocked', reason: 'no-eligible-session' });
});

test('ambiguous current sessions are rejected instead of choosing the latest ID', () => {
  const second = { ...baseCandidate, id: 'session-beta' };
  assert.deepEqual(selectIotAutoBatchCandidate([baseCandidate, second], baseContext), { kind: 'blocked', reason: 'ambiguous-sessions' });
});

test('unknown explicit session states fail closed while a missing summary may remain eligible', () => {
  assert.equal(selectIotAutoBatchCandidate([{ ...baseCandidate, session: null }], baseContext).kind, 'ready');
  assert.deepEqual(selectIotAutoBatchCandidate([{ ...baseCandidate, session: { status: 'MYSTERY' } }], baseContext), { kind: 'blocked', reason: 'no-eligible-session' });
});

test('elapsed timing uses validated start data and freezes when stale or finished', () => {
  const live = calculateIotSessionTiming({
    startedAt: baseCandidate.firstReadingAt,
    latestReadingAt: baseCandidate.latestReadingAt,
    session: { status: 'RUNNING' },
    nowMs: now,
    staleAfterMs: baseContext.staleAfterMs,
  });
  assert.equal(live?.mode, 'live');
  assert.equal(live?.elapsedMs, 5 * 60_000);

  const stale = calculateIotSessionTiming({
    startedAt: '2026-11-19T06:00:00.000Z',
    latestReadingAt: '2026-11-19T06:30:00.000Z',
    session: { status: 'RUNNING' },
    nowMs: now,
    staleAfterMs: baseContext.staleAfterMs,
  });
  assert.equal(stale?.mode, 'stale');
  assert.equal(stale?.elapsedMs, 30 * 60_000);

  const finished = calculateIotSessionTiming({
    startedAt: '2026-11-19T06:00:00.000Z',
    latestReadingAt: '2026-11-19T06:25:00.000Z',
    session: { status: 'COMPLETED', finishTime: '2026-11-19T06:30:00.000Z' },
    nowMs: now,
    staleAfterMs: baseContext.staleAfterMs,
  });
  assert.equal(finished?.mode, 'finished');
  assert.equal(finished?.elapsedMs, 30 * 60_000);
  assert.equal(formatIotElapsedDuration(finished?.elapsedMs ?? -1), '30 min');
  assert.equal(formatIotElapsedDuration(90 * 60_000), '1 hr 30 min');
});

test('active session without summary starts from history and advances with fresh readings', () => {
  const initial = calculateIotSessionTiming({
    startedAt: '2026-11-19T07:55:00.000Z',
    latestReadingAt: '2026-11-19T07:56:00.000Z',
    session: null,
    nowMs: Date.parse('2026-11-19T07:56:00.000Z'),
    staleAfterMs: baseContext.staleAfterMs,
  });
  const updated = calculateIotSessionTiming({
    startedAt: '2026-11-19T07:55:00.000Z',
    latestReadingAt: '2026-11-19T08:01:00.000Z',
    session: null,
    nowMs: Date.parse('2026-11-19T08:02:00.000Z'),
    staleAfterMs: baseContext.staleAfterMs,
  });
  assert.equal(initial?.mode, 'live');
  assert.equal(initial?.elapsedMs, 60_000);
  assert.equal(updated?.mode, 'live');
  assert.equal(updated?.elapsedMs, 7 * 60_000);
});

test('completed summary freezes an active history timer at its validated finish time', () => {
  const beforeStop = calculateIotSessionTiming({
    startedAt: '2026-11-19T07:00:00.000Z',
    latestReadingAt: '2026-11-19T07:29:00.000Z',
    session: null,
    nowMs: Date.parse('2026-11-19T07:30:00.000Z'),
    staleAfterMs: baseContext.staleAfterMs,
  });
  const afterStop = calculateIotSessionTiming({
    startedAt: '2026-11-19T07:00:00.000Z',
    latestReadingAt: '2026-11-19T07:29:00.000Z',
    session: { status: 'COMPLETED', finishTime: '2026-11-19T07:30:00.000Z' },
    nowMs: Date.parse('2026-11-19T08:00:00.000Z'),
    staleAfterMs: baseContext.staleAfterMs,
  });
  assert.equal(beforeStop?.mode, 'live');
  assert.equal(afterStop?.mode, 'finished');
  assert.equal(afterStop?.elapsedMs, 30 * 60_000);
});

test('timing rejects invalid or reversed source timestamps', () => {
  assert.equal(calculateIotSessionTiming({ startedAt: 'invalid', latestReadingAt: baseCandidate.latestReadingAt, session: null, nowMs: now, staleAfterMs: baseContext.staleAfterMs }), null);
  assert.equal(calculateIotSessionTiming({ startedAt: '2060-02-30T00:00:00.000Z', latestReadingAt: '2060-03-02T00:00:00.000Z', session: null, nowMs: now, staleAfterMs: baseContext.staleAfterMs }), null);
  assert.equal(calculateIotSessionTiming({ startedAt: baseCandidate.latestReadingAt, latestReadingAt: baseCandidate.firstReadingAt, session: null, nowMs: now, staleAfterMs: baseContext.staleAfterMs }), null);
});
