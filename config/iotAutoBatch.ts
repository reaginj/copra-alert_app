// The detector is development-only. It observes eligible sessions but does not
// authorize automatic Firestore writes.
export const IOT_AUTO_BATCH_DETECTION_ENABLED = typeof __DEV__ !== 'undefined'
  && __DEV__
  && process.env.EXPO_PUBLIC_ENABLE_IOT_AUTO_BATCH === 'true';

export const IOT_AUTO_BATCH_MIN_VALID_READINGS = 2;
export const IOT_AUTO_BATCH_MAX_FUTURE_SKEW_MS = 60_000;

// This hard gate must remain false until session authorization and the staged
// Firestore Rules rollout are complete.
export const IOT_AUTO_BATCH_WRITES_ENABLED = false;
