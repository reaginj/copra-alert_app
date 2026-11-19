import {
  get,
  limitToFirst,
  limitToLast,
  onChildAdded,
  onChildChanged,
  onValue,
  orderByChild,
  orderByKey,
  query,
  ref,
  type DataSnapshot,
} from 'firebase/database';
import { iotDb } from '@/config/firebase';
import { createIotSessionEventTracker } from '@/services/iotAutoBatch';
import { normalizeIotTimestamp } from '@/services/iotDataValidation';

const DEFAULT_HISTORY_LIMIT = 200;
const MAX_HISTORY_LIMIT = 500;
const DEFAULT_SESSION_DISCOVERY_LIMIT = 20;
const MAX_SESSION_DISCOVERY_LIMIT = 50;
const INVALID_FIREBASE_KEY = /[.#$\[\]\/]/;

export interface IoTCookingSession {
  id: string;
  averageTemperatureC?: number;
  minimumTemperatureC?: number;
  maximumTemperatureC?: number;
  startTemperatureC?: number;
  finalTemperatureC?: number;
  durationSeconds?: number;
  startTime?: string;
  finishTime?: string;
  status?: string;
  processingResult?: string;
  temperatureRateCPerMin?: number;
  totalTemperatureReadings?: number;
}

export interface IoTTemperatureReading {
  id: string;
  sessionId: string;
  temperatureC: number;
  timestamp: string;
}

export interface IoTHistoryOptions {
  limit?: number;
}

export interface IoTTemperatureHistoryValidation {
  invalidRecordCount: number;
  invalidTemperatureCount: number;
  invalidTimestampCount: number;
}

export interface IoTSessionCandidate {
  id: string;
  firstReadingAt: string;
  latestReadingAt: string;
  validReadingCount: number;
}

export interface IoTDetectedNewSession {
  candidate: IoTSessionCandidate;
  session: IoTCookingSession | null;
  detectedAt: string;
}

export interface IoTNewSessionDetector {
  ready: Promise<number>;
  unsubscribe: () => void;
}

export type IoTSubscriptionErrorHandler = (error: IoTMonitoringError) => void;

export class IoTMonitoringError extends Error {
  constructor(
    message: string,
    readonly code: 'invalid-session-id' | 'permission-denied' | 'network-error' | 'read-failed',
    readonly cause?: unknown,
  ) {
    super(message);
    this.name = 'IoTMonitoringError';
  }
}

export async function getCookingSession(sessionId: string): Promise<IoTCookingSession | null> {
  const safeSessionId = validateSessionId(sessionId);
  try {
    const snapshot = await get(ref(iotDb, `cooking_sessions/${safeSessionId}`));
    return parseCookingSessionSnapshot(snapshot, safeSessionId);
  } catch (error) {
    throw normalizeFirebaseError(error, `Unable to retrieve cooking session ${safeSessionId}.`);
  }
}

export async function getTemperatureHistory(
  sessionId: string,
  options: IoTHistoryOptions = {},
): Promise<IoTTemperatureReading[]> {
  const safeSessionId = validateSessionId(sessionId);
  const historyQuery = makeHistoryQuery(safeSessionId, options.limit);
  try {
    const snapshot = await get(historyQuery);
    return parseTemperatureHistorySnapshot(snapshot, safeSessionId).readings;
  } catch (error) {
    throw normalizeFirebaseError(error, `Unable to retrieve temperature history for ${safeSessionId}.`);
  }
}

export async function getFirstTemperatureReading(sessionId: string): Promise<IoTTemperatureReading | null> {
  const safeSessionId = validateSessionId(sessionId);
  try {
    const snapshot = await get(query(
      ref(iotDb, `temperature_history/${safeSessionId}`),
      orderByChild('timestamp'),
      limitToFirst(MAX_HISTORY_LIMIT),
    ));
    return parseTemperatureHistorySnapshot(snapshot, safeSessionId).readings.at(0) ?? null;
  } catch (error) {
    throw normalizeFirebaseError(error, `Unable to retrieve the first temperature reading for ${safeSessionId}.`);
  }
}

export function subscribeToFirstTemperatureReading(
  sessionId: string,
  onReading: (reading: IoTTemperatureReading | null) => void,
  onError?: IoTSubscriptionErrorHandler,
) {
  const safeSessionId = validateSessionId(sessionId);
  const firstReadingQuery = query(
    ref(iotDb, `temperature_history/${safeSessionId}`),
    orderByChild('timestamp'),
    limitToFirst(MAX_HISTORY_LIMIT),
  );
  return onValue(
    firstReadingQuery,
    (snapshot) => onReading(parseTemperatureHistorySnapshot(snapshot, safeSessionId).readings.at(0) ?? null),
    (error) => onError?.(normalizeFirebaseError(error, `First temperature reading subscription failed for ${safeSessionId}.`)),
  );
}

export async function discoverIotSessions(limit = DEFAULT_SESSION_DISCOVERY_LIMIT): Promise<IoTSessionCandidate[]> {
  const sessionLimit = normalizeSessionDiscoveryLimit(limit);
  try {
    const snapshot = await get(query(
      ref(iotDb, 'temperature_history'),
      orderByKey(),
      limitToLast(sessionLimit),
    ));
    if (!snapshot.exists()) return [];

    const sessions: IoTSessionCandidate[] = [];
    snapshot.forEach((sessionSnapshot) => {
      const candidate = parseSessionCandidate(sessionSnapshot);
      if (candidate) sessions.push(candidate);
    });
    return sessions.sort((left, right) => Date.parse(right.latestReadingAt) - Date.parse(left.latestReadingAt));
  } catch (error) {
    throw normalizeFirebaseError(error, 'Unable to discover IoT cooking sessions.');
  }
}

export function detectNewIotSessions(
  onSession: (event: IoTDetectedNewSession) => void,
  onError?: IoTSubscriptionErrorHandler,
): IoTNewSessionDetector {
  const historyRef = ref(iotDb, 'temperature_history');
  let disposed = false;
  let unsubscribeAdded: () => void = () => {};
  let unsubscribeChanged: () => void = () => {};

  const ready = get(historyRef).then((baselineSnapshot) => {
    const baselineIds: string[] = [];
    baselineSnapshot.forEach((sessionSnapshot) => {
      if (sessionSnapshot.key) baselineIds.push(sessionSnapshot.key);
    });
    if (disposed) return baselineIds.length;

    const tracker = createIotSessionEventTracker(baselineIds);
    const inspect = async (sessionSnapshot: DataSnapshot) => {
      const sessionId = sessionSnapshot.key;
      if (disposed || !sessionId || !tracker.isNewSession(sessionId)) return;
      const candidate = parseSessionCandidate(sessionSnapshot);
      if (!candidate) return;
      try {
        const session = await getCookingSession(sessionId);
        if (disposed) return;
        const signature = `${candidate.latestReadingAt}:${candidate.validReadingCount}:${session?.status ?? ''}:${session?.finishTime ?? ''}`;
        if (!tracker.shouldEmit(sessionId, signature)) return;
        onSession({ candidate, session, detectedAt: new Date().toISOString() });
      } catch (cause) {
        onError?.(cause instanceof IoTMonitoringError ? cause : normalizeFirebaseError(cause, `Unable to inspect IoT session ${sessionId}.`));
      }
    };
    const listenerError = (cause: Error) => onError?.(normalizeFirebaseError(cause, 'New IoT session detection failed.'));
    unsubscribeAdded = onChildAdded(historyRef, (snapshot) => { void inspect(snapshot); }, listenerError);
    unsubscribeChanged = onChildChanged(historyRef, (snapshot) => { void inspect(snapshot); }, listenerError);
    return baselineIds.length;
  }).catch((cause) => {
    const error = normalizeFirebaseError(cause, 'Unable to establish the IoT session baseline.');
    onError?.(error);
    throw error;
  });

  return {
    ready,
    unsubscribe: () => {
      disposed = true;
      unsubscribeAdded();
      unsubscribeChanged();
    },
  };
}

export function subscribeToCookingSession(
  sessionId: string,
  onSession: (session: IoTCookingSession | null) => void,
  onError?: IoTSubscriptionErrorHandler,
) {
  const safeSessionId = validateSessionId(sessionId);
  return onValue(
    ref(iotDb, `cooking_sessions/${safeSessionId}`),
    (snapshot) => onSession(parseCookingSessionSnapshot(snapshot, safeSessionId)),
    (error) => onError?.(normalizeFirebaseError(error, `Cooking session subscription failed for ${safeSessionId}.`)),
  );
}

export function subscribeToTemperatureHistory(
  sessionId: string,
  onHistory: (readings: IoTTemperatureReading[], validation: IoTTemperatureHistoryValidation) => void,
  onError?: IoTSubscriptionErrorHandler,
  options: IoTHistoryOptions = {},
) {
  const safeSessionId = validateSessionId(sessionId);
  return onValue(
    makeHistoryQuery(safeSessionId, options.limit),
    (snapshot) => {
      const result = parseTemperatureHistorySnapshot(snapshot, safeSessionId);
      onHistory(result.readings, result.validation);
    },
    (error) => onError?.(normalizeFirebaseError(error, `Temperature history subscription failed for ${safeSessionId}.`)),
  );
}

function makeHistoryQuery(sessionId: string, requestedLimit?: number) {
  return query(
    ref(iotDb, `temperature_history/${sessionId}`),
    orderByChild('timestamp'),
    limitToLast(normalizeHistoryLimit(requestedLimit)),
  );
}

function parseCookingSessionSnapshot(snapshot: DataSnapshot, sessionId: string) {
  if (!snapshot.exists()) return null;
  const value: unknown = snapshot.val();
  if (!isRecord(value)) {
    console.warn(`[IoT Monitoring] Ignored malformed cooking session ${sessionId}: expected an object.`);
    return null;
  }

  return {
    id: sessionId,
    ...optionalNumber(value, 'averageTemperatureC', ['average_temperature_c', 'averageTemperatureC', 'avg_temperature_c', 'average_temperature']),
    ...optionalNumber(value, 'minimumTemperatureC', ['minimum_temperature_c', 'minimumTemperatureC', 'min_temperature_c', 'minimum_temperature']),
    ...optionalNumber(value, 'maximumTemperatureC', ['maximum_temperature_c', 'maximumTemperatureC', 'max_temperature_c', 'maximum_temperature']),
    ...optionalNumber(value, 'startTemperatureC', ['start_temperature_c', 'startTemperatureC', 'initial_temperature_c', 'start_temperature']),
    ...optionalNumber(value, 'finalTemperatureC', ['final_temperature_c', 'finalTemperatureC', 'end_temperature_c', 'final_temperature']),
    ...optionalNonNegativeNumber(value, 'durationSeconds', ['duration_seconds', 'durationSeconds', 'duration_sec']),
    ...optionalTimestamp(value, 'startTime', ['start_time', 'startTime', 'started_at', 'startedAt']),
    ...optionalTimestamp(value, 'finishTime', ['finish_time', 'finishTime', 'end_time', 'endTime', 'finished_at', 'finishedAt']),
    ...optionalString(value, 'status', ['status', 'session_status', 'sessionStatus']),
    ...optionalString(value, 'processingResult', ['processing_result', 'processingResult', 'result']),
    ...optionalNumber(value, 'temperatureRateCPerMin', ['temperature_rate_c_per_min', 'temperatureRateCPerMin', 'temperature_rate']),
    ...optionalNonNegativeInteger(value, 'totalTemperatureReadings', ['total_temperature_readings', 'totalTemperatureReadings', 'reading_count']),
  } satisfies IoTCookingSession;
}

function parseTemperatureHistorySnapshot(snapshot: DataSnapshot, sessionId: string) {
  const validation: IoTTemperatureHistoryValidation = { invalidRecordCount: 0, invalidTemperatureCount: 0, invalidTimestampCount: 0 };
  if (!snapshot.exists()) return { readings: [], validation };
  const value: unknown = snapshot.val();
  if (!isRecord(value)) {
    console.warn(`[IoT Monitoring] Ignored malformed temperature history for ${sessionId}: expected an object.`);
    validation.invalidRecordCount = 1;
    return { readings: [], validation };
  }

  const readings: IoTTemperatureReading[] = [];
  const invalidTimestampIds: string[] = [];

  Object.entries(value).forEach(([readingId, rawReading]) => {
    const parsed = parseTemperatureReading(rawReading, sessionId, readingId);
    if (parsed.reading) readings.push(parsed.reading);
    else {
      validation[parsed.issue] += 1;
      if (parsed.issue === 'invalidTimestampCount') invalidTimestampIds.push(readingId);
    }
  });

  if (invalidTimestampIds.length) {
    console.warn(`[IoT Monitoring] Rejected ${invalidTimestampIds.length} reading(s) with invalid source timestamps for ${sessionId}: ${invalidTimestampIds.slice(0, 10).join(', ')}`);
  }

  return { readings: readings.sort((left, right) => Date.parse(left.timestamp) - Date.parse(right.timestamp)), validation };
}

function parseTemperatureReading(value: unknown, sessionId: string, readingId: string): { reading: IoTTemperatureReading | null; issue: keyof IoTTemperatureHistoryValidation } {
  if (!isRecord(value)) return { reading: null, issue: 'invalidRecordCount' };

  const temperatureValue = firstPresent(value, ['temperature_c', 'temperatureC', 'temperature', 'temp_c', 'tempC']);
  const timestampValue = firstPresent(value, ['timestamp', 'recorded_at', 'recordedAt', 'time']);
  const temperatureC = finiteNumber(temperatureValue);
  const timestamp = normalizeIotTimestamp(timestampValue);

  // Timestamp parsing is intentionally restricted to timestamp aliases. A
  // temperature value is never considered as a timestamp fallback.
  if (temperatureC === null) return { reading: null, issue: 'invalidTemperatureCount' };
  if (timestamp === null) return { reading: null, issue: 'invalidTimestampCount' };
  return { reading: { id: readingId, sessionId, temperatureC, timestamp }, issue: 'invalidRecordCount' };
}

function parseSessionCandidate(sessionSnapshot: DataSnapshot): IoTSessionCandidate | null {
  const sessionId = sessionSnapshot.key;
  if (!sessionId) return null;

  let firstTimestamp = Number.POSITIVE_INFINITY;
  let latestTimestamp = Number.NEGATIVE_INFINITY;
  let validReadingCount = 0;
  sessionSnapshot.forEach((readingSnapshot) => {
    const { reading } = parseTemperatureReading(readingSnapshot.val(), sessionId, readingSnapshot.key ?? 'unknown');
    if (!reading) return;
    const timestamp = Date.parse(reading.timestamp);
    firstTimestamp = Math.min(firstTimestamp, timestamp);
    latestTimestamp = Math.max(latestTimestamp, timestamp);
    validReadingCount += 1;
  });

  if (!validReadingCount || !Number.isFinite(firstTimestamp) || !Number.isFinite(latestTimestamp)) return null;
  return {
    id: sessionId,
    firstReadingAt: new Date(firstTimestamp).toISOString(),
    latestReadingAt: new Date(latestTimestamp).toISOString(),
    validReadingCount,
  };
}

function optionalNumber<K extends string>(value: Record<string, unknown>, key: K, aliases: string[]) {
  const raw = firstPresent(value, aliases);
  const parsed = finiteNumber(raw);
  return parsed === null ? {} : { [key]: parsed } as Record<K, number>;
}

function optionalNonNegativeNumber<K extends string>(value: Record<string, unknown>, key: K, aliases: string[]) {
  const raw = firstPresent(value, aliases);
  const parsed = finiteNumber(raw);
  return parsed === null || parsed < 0 ? {} : { [key]: parsed } as Record<K, number>;
}

function optionalNonNegativeInteger<K extends string>(value: Record<string, unknown>, key: K, aliases: string[]) {
  const raw = firstPresent(value, aliases);
  const parsed = finiteNumber(raw);
  return parsed === null || !Number.isSafeInteger(parsed) || parsed < 0 ? {} : { [key]: parsed } as Record<K, number>;
}

function optionalTimestamp<K extends string>(value: Record<string, unknown>, key: K, aliases: string[]) {
  const parsed = normalizeIotTimestamp(firstPresent(value, aliases));
  return parsed === null ? {} : { [key]: parsed } as Record<K, string>;
}

function optionalString<K extends string>(value: Record<string, unknown>, key: K, aliases: string[]) {
  const raw = firstPresent(value, aliases);
  const parsed = typeof raw === 'string' ? raw.trim() : '';
  return parsed ? { [key]: parsed } as Record<K, string> : {};
}

function firstPresent(value: Record<string, unknown>, aliases: string[]) {
  for (const alias of aliases) {
    if (value[alias] !== undefined && value[alias] !== null) return value[alias];
  }
  return undefined;
}

function finiteNumber(value: unknown) {
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  if (typeof value !== 'string' || !value.trim()) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function normalizeHistoryLimit(value?: number) {
  if (value === undefined) return DEFAULT_HISTORY_LIMIT;
  if (!Number.isFinite(value) || value <= 0) return DEFAULT_HISTORY_LIMIT;
  return Math.min(MAX_HISTORY_LIMIT, Math.max(1, Math.floor(value)));
}

function normalizeSessionDiscoveryLimit(value: number) {
  if (!Number.isFinite(value) || value <= 0) return DEFAULT_SESSION_DISCOVERY_LIMIT;
  return Math.min(MAX_SESSION_DISCOVERY_LIMIT, Math.max(1, Math.floor(value)));
}

function validateSessionId(sessionId: string) {
  const normalized = sessionId.trim();
  if (!normalized || INVALID_FIREBASE_KEY.test(normalized)) {
    throw new IoTMonitoringError('A valid explicit cooking session ID is required.', 'invalid-session-id');
  }
  return normalized;
}

function normalizeFirebaseError(error: unknown, fallbackMessage: string) {
  if (error instanceof IoTMonitoringError) return error;
  const code = errorCode(error).toLowerCase();
  const message = error instanceof Error ? error.message : fallbackMessage;
  if (code.includes('permission') || /permission|denied/i.test(message)) {
    return new IoTMonitoringError('Permission denied while reading the IoT Realtime Database.', 'permission-denied', error);
  }
  if (code.includes('network') || /network|offline|failed to fetch|connection/i.test(message)) {
    return new IoTMonitoringError('Unable to reach the IoT Realtime Database.', 'network-error', error);
  }
  return new IoTMonitoringError(`${fallbackMessage} ${message}`.trim(), 'read-failed', error);
}

function errorCode(error: unknown) {
  return isRecord(error) && typeof error.code === 'string' ? error.code : '';
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
