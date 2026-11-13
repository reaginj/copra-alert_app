import { mkdir, writeFile } from 'node:fs/promises';
import { createInterface } from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import { applicationDefault, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

const EXPECTED_PROJECT_ID = 'copra-alert';
const TARGET_COLLECTIONS = [
  'copra_batches',
  'monitoring_records',
  'weight_records',
  'alert_records',
  'delivery_records',
];
const args = new Set(process.argv.slice(2));
const apply = args.has('--apply');
const projectArgIndex = process.argv.indexOf('--project');
const projectId = projectArgIndex >= 0 ? process.argv[projectArgIndex + 1] : EXPECTED_PROJECT_ID;

if (!projectId || projectId !== EXPECTED_PROJECT_ID) {
  throw new Error(`Refusing to run: --project must be exactly ${EXPECTED_PROJECT_ID}.`);
}
if (process.env.FIRESTORE_EMULATOR_HOST) {
  throw new Error('Refusing to run while FIRESTORE_EMULATOR_HOST is set. Remove it and try again.');
}

const app = getApps()[0] ?? initializeApp({ credential: applicationDefault(), projectId });
const db = getFirestore(app);
const auth = getAuth(app);

console.log(`Mode: ${apply ? 'APPLY (deletion requested)' : 'DRY RUN (read-only)'}`);
console.log(`Firebase project: ${projectId}`);
console.log(`Target collections: ${TARGET_COLLECTIONS.join(', ')}`);
console.log('Protected resources: users, Authentication accounts, display_codes, rules, and indexes');

const snapshots = new Map();
for (const collectionName of TARGET_COLLECTIONS) {
  const snapshot = await db.collection(collectionName).get();
  snapshots.set(collectionName, snapshot);
  console.log(`\n${collectionName}: ${snapshot.size} document(s)`);
  for (const document of snapshot.docs) console.log(`  - ${document.id}`);
}

const [userDocuments, authUsers, displayCodeCount] = await Promise.all([
  db.collection('users').count().get().then((result) => result.data().count),
  countAuthUsers(),
  db.collection('display_codes').count().get().then((result) => result.data().count),
]);
console.log('\nPreserved resource counts:');
console.log(`  users documents: ${userDocuments}`);
console.log(`  Authentication accounts: ${authUsers}`);
console.log(`  display_codes documents: ${displayCodeCount} (preserved because delivery/batch code reservations depend on them)`);

if (!apply) {
  console.log('\nDry run complete. Nothing was deleted and no backup file was written.');
  console.log(`To request deletion after reviewing this list: npm run firestore:reset -- --apply --project ${projectId}`);
  process.exitCode = 0;
} else {
  const backupPath = await writeBackup(snapshots);
  console.log(`\nBackup completed before deletion: ${backupPath}`);

  const phrase = `DELETE ${projectId} OPERATIONAL DATA`;
  const prompt = createInterface({ input, output });
  const answer = await prompt.question(`Type exactly "${phrase}" to delete only the five listed collections: `);
  prompt.close();
  if (answer !== phrase) {
    console.log('Confirmation did not match. No records were deleted.');
    process.exitCode = 1;
  } else {
    const failures = [];
    for (const collectionName of TARGET_COLLECTIONS) {
      const documents = snapshots.get(collectionName).docs;
      for (let offset = 0; offset < documents.length; offset += 400) {
        const group = documents.slice(offset, offset + 400);
        const batch = db.batch();
        group.forEach((document) => batch.delete(document.ref));
        try {
          await batch.commit();
          console.log(`Deleted ${group.length} document(s) from ${collectionName}.`);
        } catch (error) {
          failures.push({ collection: collectionName, ids: group.map((document) => document.id), error: error instanceof Error ? error.message : String(error) });
          console.error(`Failed a batch in ${collectionName}; continuing with the other collections.`);
        }
      }
    }

    console.log('\nPost-reset verification:');
    for (const collectionName of TARGET_COLLECTIONS) {
      const count = await db.collection(collectionName).count().get().then((result) => result.data().count);
      console.log(`  ${collectionName}: ${count}`);
    }
    const [remainingUserDocuments, remainingAuthUsers] = await Promise.all([
      db.collection('users').count().get().then((result) => result.data().count),
      countAuthUsers(),
    ]);
    console.log(`  users documents (preserved): ${remainingUserDocuments}`);
    console.log(`  Authentication accounts (preserved): ${remainingAuthUsers}`);

    if (failures.length) {
      console.error('\nSome deletion batches failed:');
      console.error(JSON.stringify(failures, null, 2));
      process.exitCode = 1;
    } else {
      console.log('\nReset completed successfully. The backup remains available for recovery review.');
    }
  }
}

async function countAuthUsers() {
  let count = 0;
  let pageToken;
  do {
    const page = await auth.listUsers(1000, pageToken);
    count += page.users.length;
    pageToken = page.pageToken;
  } while (pageToken);
  return count;
}

async function writeBackup(collectionSnapshots) {
  const backupDirectory = new URL('../backups/firestore-reset/', import.meta.url);
  await mkdir(backupDirectory, { recursive: true });
  const timestamp = new Date().toISOString().replaceAll(':', '-').replaceAll('.', '-');
  const backupUrl = new URL(`copra-alert-${timestamp}.json`, backupDirectory);
  const collections = {};
  for (const [name, snapshot] of collectionSnapshots) {
    collections[name] = snapshot.docs.map((document) => ({ id: document.id, data: encode(document.data()) }));
  }
  const backup = { projectId, createdAt: new Date().toISOString(), collections };
  await writeFile(backupUrl, `${JSON.stringify(backup, null, 2)}\n`, { encoding: 'utf8', flag: 'wx' });
  return decodeURIComponent(backupUrl.pathname.replace(/^\/(.:)/, '$1'));
}

function encode(value) {
  if (value == null || typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') return value;
  if (value instanceof Date) return { __type: 'date', value: value.toISOString() };
  if (typeof value.toDate === 'function') return { __type: 'timestamp', value: value.toDate().toISOString() };
  if (value.latitude != null && value.longitude != null) return { __type: 'geopoint', latitude: value.latitude, longitude: value.longitude };
  if (Buffer.isBuffer(value) || value instanceof Uint8Array) return { __type: 'bytes', value: Buffer.from(value).toString('base64') };
  if (Array.isArray(value)) return value.map(encode);
  return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, encode(item)]));
}
