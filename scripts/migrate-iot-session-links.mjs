import { applicationDefault, getApps, initializeApp } from 'firebase-admin/app';
import { FieldValue, getFirestore } from 'firebase-admin/firestore';

const apply = process.argv.includes('--apply');
const emulatorHost = process.env.FIRESTORE_EMULATOR_HOST;
const projectId = process.env.GCLOUD_PROJECT || process.env.GOOGLE_CLOUD_PROJECT || 'demo-copra-alert';

if (apply && !emulatorHost) {
  throw new Error('Refusing to write outside the Firestore emulator. Run the audit without --apply for live-project review.');
}

if (!getApps().length) {
  initializeApp(emulatorHost ? { projectId } : { projectId, credential: applicationDefault() });
}

const db = getFirestore();
const [batchSnapshot, linkSnapshot] = await Promise.all([
  db.collection('copra_batches').get(),
  db.collection('iot_session_links').get(),
]);

const sessionPattern = /^[A-Za-z0-9_-]{1,100}$/;
const batchesBySession = new Map();
const invalid = [];
for (const document of batchSnapshot.docs) {
  const data = document.data();
  if (typeof data.iotSessionId !== 'string' || !data.iotSessionId.trim()) continue;
  const sessionId = data.iotSessionId.trim();
  if (!sessionPattern.test(sessionId) || data.createdBy == null) {
    invalid.push({ batchId: document.id, sessionId });
    continue;
  }
  const records = batchesBySession.get(sessionId) ?? [];
  records.push({ batchId: document.id, ownerUid: data.createdBy });
  batchesBySession.set(sessionId, records);
}

const existingLinks = new Map(linkSnapshot.docs.map((document) => [document.id, document.data()]));
const conflicts = [];
const missing = [];
for (const [sessionId, batches] of batchesBySession) {
  if (batches.length !== 1) {
    conflicts.push({ sessionId, batches, reason: 'multiple-batches' });
    continue;
  }
  const batch = batches[0];
  const link = existingLinks.get(sessionId);
  if (!link) {
    missing.push({ sessionId, ...batch });
  } else if (link.sessionId !== sessionId || link.batchId !== batch.batchId || link.ownerUid !== batch.ownerUid) {
    conflicts.push({ sessionId, batches, link, reason: 'reservation-mismatch' });
  }
}

console.log(JSON.stringify({
  mode: apply ? 'emulator-apply' : 'audit-only',
  linkedBatchCount: [...batchesBySession.values()].reduce((total, records) => total + records.length, 0),
  existingReservationCount: existingLinks.size,
  missing,
  invalid,
  conflicts,
}, null, 2));

if (invalid.length || conflicts.length) {
  process.exitCode = 1;
} else if (apply) {
  for (const item of missing) {
    await db.runTransaction(async (transaction) => {
      const reference = db.collection('iot_session_links').doc(item.sessionId);
      const existing = await transaction.get(reference);
      if (existing.exists) throw new Error(`Reservation appeared during migration for ${item.sessionId}; audit again.`);
      transaction.create(reference, {
        sessionId: item.sessionId,
        batchId: item.batchId,
        ownerUid: item.ownerUid,
        createdAt: FieldValue.serverTimestamp(),
      });
    });
  }
  console.log(`Created ${missing.length} reservation document(s) in the Firestore emulator.`);
}
