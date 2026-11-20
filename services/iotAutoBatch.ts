export type IoTSessionLifecycle = 'Active' | 'Finished' | 'Unknown' | 'Unavailable';

const IOT_SESSION_ID_PATTERN = /^[A-Za-z0-9_-]{1,100}$/;
const IOT_BATCH_ID_PREFIX = 'IOT_';

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

export type IoTAutoBatchDiagnostic =
  | { state: 'baselining' }
  | { state: 'eligible'; sessionId: string }
  | { state: 'creating'; sessionId: string }
  | { state: 'created'; sessionId: string; created: boolean }
  | { state: 'rejected'; reason: Extract<IoTAutoBatchSelection, { kind: 'blocked' }>['reason'] }
  | { state: 'error'; message: string };

export type IoTDetectedSessionEvent = {
  candidate: Omit<IoTAutoBatchCandidate, 'session'>;
  session: IoTSessionMetadata;
};

export type IoTNewSessionSource = (
  onSession: (event: IoTDetectedSessionEvent) => void,
  onError: (error: Error) => void,
) => { ready: Promise<number>; unsubscribe: () => void };

export type ReadOnlyIotAutoBatchCoordinator = {
  refresh: () => void;
  stop: () => void;
};

export type IoTSessionTiming = {
  startedAt: string;
  elapsedMs: number;
  endAt: string;
  mode: 'live' | 'stale' | 'finished';
} | null;

export function isValidIotSessionId(sessionId: string): boolean {
  return IOT_SESSION_ID_PATTERN.test(sessionId);
}

export function getDeterministicIotBatchId(sessionId: string): string {
  if (!isValidIotSessionId(sessionId)) throw new Error('A valid IoT session ID is required.');
  return `${IOT_BATCH_ID_PREFIX}${sessionId}`;
}

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

export function canRunReadOnlyIotAutoBatchCoordinator(input: {
  detectionEnabled: boolean;
  farmerUid: string | null;
  role: 'farmer' | 'warehouse' | null;
  batchesLoaded: boolean;
}) {
  return input.detectionEnabled
    && Boolean(input.farmerUid)
    && input.role === 'farmer'
    && input.batchesLoaded;
}

export function createReadOnlyIotAutoBatchCoordinator(input: {
  source: IoTNewSessionSource;
  getContext: () => Omit<IoTAutoBatchContext, 'nowMs'>;
  onDiagnostic: (diagnostic: IoTAutoBatchDiagnostic) => void;
  onEligible?: (candidate: IoTAutoBatchCandidate) => Promise<{ created: boolean }>;
  retryDelayMs?: number;
  now?: () => number;
}): ReadOnlyIotAutoBatchCoordinator {
  const candidates = new Map<string, IoTAutoBatchCandidate>();
  const attempts = new Map<string, { state: 'in-flight' | 'succeeded' | 'failed'; retryAt: number }>();
  const now = input.now ?? Date.now;
  const retryDelayMs = input.retryDelayMs ?? 15_000;
  let stopped = false;
  let baselineReady = false;

  const attemptCreation = (candidate: IoTAutoBatchCandidate) => {
    if (!input.onEligible || stopped) return;
    const previous = attempts.get(candidate.id);
    const currentTime = now();
    if (previous?.state === 'in-flight' || previous?.state === 'succeeded'
      || (previous?.state === 'failed' && currentTime < previous.retryAt)) return;

    attempts.set(candidate.id, { state: 'in-flight', retryAt: Number.POSITIVE_INFINITY });
    input.onDiagnostic({ state: 'creating', sessionId: candidate.id });
    void input.onEligible(candidate).then((result) => {
      if (stopped) return;
      attempts.set(candidate.id, { state: 'succeeded', retryAt: Number.POSITIVE_INFINITY });
      input.onDiagnostic({ state: 'created', sessionId: candidate.id, created: result.created });
    }).catch((error: unknown) => {
      if (stopped) return;
      attempts.set(candidate.id, { state: 'failed', retryAt: now() + retryDelayMs });
      input.onDiagnostic({ state: 'error', message: error instanceof Error ? error.message : 'Automatic IoT batch creation failed.' });
    });
  };

  const evaluate = (allowCreation = false) => {
    if (stopped || !baselineReady) return;
    const selection = selectIotAutoBatchCandidate([...candidates.values()], {
      ...input.getContext(),
      nowMs: now(),
    });
    if (selection.kind === 'ready') {
      input.onDiagnostic({ state: 'eligible', sessionId: selection.candidate.id });
      if (allowCreation) attemptCreation(selection.candidate);
    } else {
      input.onDiagnostic({ state: 'rejected', reason: selection.reason });
    }
  };

  input.onDiagnostic({ state: 'baselining' });
  const detector = input.source(
    (event) => {
      if (stopped) return;
      candidates.set(event.candidate.id, { ...event.candidate, session: event.session });
      evaluate(true);
    },
    (error) => {
      if (!stopped) input.onDiagnostic({ state: 'error', message: error.message || 'IoT session detection failed.' });
    },
  );

  void detector.ready.then(() => {
    if (stopped) return;
    baselineReady = true;
    evaluate();
  }).catch((error: unknown) => {
    if (!stopped) input.onDiagnostic({ state: 'error', message: error instanceof Error ? error.message : 'Unable to establish the IoT session baseline.' });
  });

  return {
    refresh: evaluate,
    stop: () => {
      if (stopped) return;
      stopped = true;
      candidates.clear();
      attempts.clear();
      detector.unsubscribe();
    },
  };
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
