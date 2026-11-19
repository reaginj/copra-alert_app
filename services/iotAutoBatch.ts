export type IoTSessionLifecycle = 'Active' | 'Finished' | 'Unknown' | 'Unavailable';

export type IoTSessionMetadata = {
  status?: string;
  finishTime?: string;
} | null;

export type IoTAutoBatchCandidate = {
  id: string;
  firstReadingAt: string;
  latestReadingAt: string;
  validReadingCount: number;
  session: IoTSessionMetadata;
};

export type IoTAutoBatchContext = {
  farmerUid: string | null;
  role: 'farmer' | 'warehouse' | null;
  nowMs: number;
  staleAfterMs: number;
  maxFutureSkewMs: number;
  minValidReadings: number;
  hasConflictingActiveBatch: boolean;
  associatedSessionIds: ReadonlySet<string>;
};

export type IoTAutoBatchSelection =
  | { kind: 'ready'; candidate: IoTAutoBatchCandidate }
  | { kind: 'blocked'; reason: 'unauthorized-farmer' | 'active-batch-exists' | 'no-eligible-session' | 'ambiguous-sessions' };

export type IoTSessionTiming = {
  startedAt: string;
  elapsedMs: number;
  endAt: string;
  mode: 'live' | 'stale' | 'finished';
} | null;

export function getIotSessionLifecycle(session: IoTSessionMetadata): IoTSessionLifecycle {
  if (!session) return 'Unavailable';
  const status = normalizeStatus(session.status);
  if (session.finishTime || status === 'COMPLETED' || status === 'FINISHED') return 'Finished';
  if (status === 'ACTIVE' || status === 'RUNNING' || status === 'IN_PROGRESS') return 'Active';
  return 'Unknown';
}

export function selectIotAutoBatchCandidate(
  candidates: readonly IoTAutoBatchCandidate[],
  context: IoTAutoBatchContext,
): IoTAutoBatchSelection {
  if (!context.farmerUid || context.role !== 'farmer') return { kind: 'blocked', reason: 'unauthorized-farmer' };
  if (context.hasConflictingActiveBatch) return { kind: 'blocked', reason: 'active-batch-exists' };

  const eligible = candidates.filter((candidate) => isEligibleCandidate(candidate, context));
  if (!eligible.length) return { kind: 'blocked', reason: 'no-eligible-session' };
  if (eligible.length !== 1) return { kind: 'blocked', reason: 'ambiguous-sessions' };
  return { kind: 'ready', candidate: eligible[0] };
}

export function calculateIotSessionTiming(input: {
  startedAt: string;
  latestReadingAt: string;
  session: IoTSessionMetadata;
  nowMs: number;
  staleAfterMs: number;
}): IoTSessionTiming {
  const startedAtMs = parseTimestamp(input.startedAt);
  const latestReadingAtMs = parseTimestamp(input.latestReadingAt);
  if (startedAtMs === null || latestReadingAtMs === null || latestReadingAtMs < startedAtMs) return null;

  const lifecycle = getIotSessionLifecycle(input.session);
  const validFinishMs = input.session?.finishTime ? parseTimestamp(input.session.finishTime) : null;
  const finishedAtMs = validFinishMs !== null && validFinishMs >= startedAtMs ? validFinishMs : latestReadingAtMs;
  const stale = input.nowMs - latestReadingAtMs > input.staleAfterMs;
  const endAtMs = lifecycle === 'Finished' ? finishedAtMs : stale ? latestReadingAtMs : Math.max(startedAtMs, input.nowMs);
  return {
    startedAt: new Date(startedAtMs).toISOString(),
    elapsedMs: Math.max(0, endAtMs - startedAtMs),
    endAt: new Date(endAtMs).toISOString(),
    mode: lifecycle === 'Finished' ? 'finished' : stale ? 'stale' : 'live',
  };
}

export function formatIotElapsedDuration(elapsedMs: number): string {
  if (!Number.isFinite(elapsedMs) || elapsedMs < 0) return 'UNAVAILABLE';
  const totalMinutes = Math.floor(elapsedMs / 60_000);
  const days = Math.floor(totalMinutes / 1440);
  const hours = Math.floor((totalMinutes % 1440) / 60);
  const minutes = totalMinutes % 60;
  const parts = [days ? `${days} day${days === 1 ? '' : 's'}` : '', hours ? `${hours} hr` : '', minutes || (!days && !hours) ? `${minutes} min` : ''].filter(Boolean);
  return parts.join(' ');
}

export function createIotSessionEventTracker(baselineSessionIds: Iterable<string>) {
  const baseline = new Set(baselineSessionIds);
  const signatures = new Map<string, string>();
  return {
    isNewSession(sessionId: string) {
      return Boolean(sessionId) && !baseline.has(sessionId);
    },
    shouldEmit(sessionId: string, signature: string) {
      if (!sessionId || baseline.has(sessionId) || signatures.get(sessionId) === signature) return false;
      signatures.set(sessionId, signature);
      return true;
    },
  };
}

function isEligibleCandidate(candidate: IoTAutoBatchCandidate, context: IoTAutoBatchContext) {
  if (!candidate.id || context.associatedSessionIds.has(candidate.id)) return false;
  if (!Number.isSafeInteger(candidate.validReadingCount) || candidate.validReadingCount < context.minValidReadings) return false;
  const firstReadingAt = parseTimestamp(candidate.firstReadingAt);
  const latestReadingAt = parseTimestamp(candidate.latestReadingAt);
  if (firstReadingAt === null || latestReadingAt === null || latestReadingAt < firstReadingAt) return false;
  if (firstReadingAt > context.nowMs + context.maxFutureSkewMs || latestReadingAt > context.nowMs + context.maxFutureSkewMs) return false;
  if (context.nowMs - latestReadingAt > context.staleAfterMs) return false;

  const lifecycle = getIotSessionLifecycle(candidate.session);
  if (lifecycle === 'Finished' || lifecycle === 'Unknown') return false;
  return true;
}

function normalizeStatus(value?: string) {
  return value?.trim().toUpperCase().replace(/[\s-]+/g, '_') ?? '';
}

function parseTimestamp(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(value)) return null;
  const milliseconds = Date.parse(value);
  if (!Number.isFinite(milliseconds) || milliseconds <= 0) return null;
  return new Date(milliseconds).toISOString() === value ? milliseconds : null;
}
