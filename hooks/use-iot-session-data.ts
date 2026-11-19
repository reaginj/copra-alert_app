import { useEffect, useState } from 'react';
import {
  subscribeToCookingSession,
  subscribeToTemperatureHistory,
  type IoTCookingSession,
  type IoTTemperatureHistoryValidation,
  type IoTTemperatureReading,
} from '@/services/iotMonitoring';

const EMPTY_VALIDATION: IoTTemperatureHistoryValidation = { invalidRecordCount: 0, invalidTemperatureCount: 0, invalidTimestampCount: 0 };

type HistoryState = {
  sessionId: string | null;
  readings: IoTTemperatureReading[];
  validation: IoTTemperatureHistoryValidation;
  error: Error | null;
};

type SessionState = {
  sessionId: string | null;
  session: IoTCookingSession | null;
  error: Error | null;
};

export function useIotSessionData(sessionId?: string, historyLimit = 200) {
  const normalizedSessionId = sessionId?.trim() || null;
  const [historyState, setHistoryState] = useState<HistoryState>({ sessionId: null, readings: [], validation: EMPTY_VALIDATION, error: null });
  const [sessionState, setSessionState] = useState<SessionState>({ sessionId: null, session: null, error: null });

  useEffect(() => {
    if (!normalizedSessionId) return;

    let unsubscribeHistory: () => void = () => {};
    let unsubscribeSession: () => void = () => {};
    try {
      unsubscribeHistory = subscribeToTemperatureHistory(
        normalizedSessionId,
        (readings, validation) => setHistoryState({ sessionId: normalizedSessionId, readings, validation, error: null }),
        (error) => setHistoryState({ sessionId: normalizedSessionId, readings: [], validation: EMPTY_VALIDATION, error }),
        { limit: historyLimit },
      );
      unsubscribeSession = subscribeToCookingSession(
        normalizedSessionId,
        (session) => setSessionState({ sessionId: normalizedSessionId, session, error: null }),
        (error) => setSessionState({ sessionId: normalizedSessionId, session: null, error }),
      );
    } catch (cause) {
      const error = cause instanceof Error ? cause : new Error('Unable to start the IoT session listener.');
      setTimeout(() => {
        setHistoryState({ sessionId: normalizedSessionId, readings: [], validation: EMPTY_VALIDATION, error });
      }, 0);
    }

    return () => {
      unsubscribeHistory();
      unsubscribeSession();
    };
  }, [historyLimit, normalizedSessionId]);

  const historyReady = !normalizedSessionId || historyState.sessionId === normalizedSessionId;
  const sessionReady = !normalizedSessionId || sessionState.sessionId === normalizedSessionId;
  return {
    readings: normalizedSessionId && historyReady ? historyState.readings : [],
    validation: normalizedSessionId && historyReady ? historyState.validation : EMPTY_VALIDATION,
    session: normalizedSessionId && sessionReady ? sessionState.session : null,
    loading: Boolean(normalizedSessionId) && (!historyReady || !sessionReady),
    error: normalizedSessionId ? (historyReady ? historyState.error : null) ?? (sessionReady ? sessionState.error : null) : null,
  };
}
