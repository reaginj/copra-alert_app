// Stage one is read-only. Enabling this flag may arm the detector in a future
// development build, but no automatic Firestore write path exists yet.
export const IOT_AUTO_BATCH_DETECTION_ENABLED = typeof __DEV__ !== 'undefined'
  && __DEV__
  && process.env.EXPO_PUBLIC_ENABLE_IOT_AUTO_BATCH === 'true';

export const IOT_AUTO_BATCH_WRITES_ENABLED = false;
