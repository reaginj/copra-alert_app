import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import { after, before, beforeEach, test } from 'node:test';
import { assertFails, assertSucceeds, initializeTestEnvironment } from '@firebase/rules-unit-testing';
import { collection, doc, getDoc, getDocs, query, runTransaction, serverTimestamp, setDoc, Timestamp, updateDoc, where, writeBatch } from 'firebase/firestore';

const projectId = 'copra-alert-rules-test';
let environment;

before(async () => {
  environment = await initializeTestEnvironment({ projectId, firestore: { rules: readFileSync('firestore.rules', 'utf8') } });
});

beforeEach(async () => {
  await environment.clearFirestore();
  await environment.withSecurityRulesDisabled(async (context) => {
    const db = context.firestore();
    const users = [
      ['farmer-1', { uid: 'farmer-1', email: 'farmer@test.com', role: 'farmer' }],
      ['farmer-2', { uid: 'farmer-2', email: 'farmer2@test.com', role: 'farmer' }],
      ['warehouse-1', { uid: 'warehouse-1', email: 'warehouse1@test.com', role: 'warehouse' }],
      ['warehouse-2', { uid: 'warehouse-2', email: 'warehouse2@test.com', role: 'warehouse' }],
    ];
    await Promise.all(users.map(([id, data]) => setDoc(doc(db, 'users', id), data)));
    await setDoc(doc(db, 'copra_batches', 'BATCH-1'), { batchId: 'BATCH-1', createdBy: 'farmer-1', batchDate: Timestamp.now(), batchStatus: 'active' });
    await setDoc(doc(db, 'copra_batches', 'BATCH-DONE'), { batchId: 'BATCH-DONE', createdBy: 'farmer-1', batchDate: Timestamp.now(), batchStatus: 'completed', completedAt: Timestamp.now(), completedBy: 'farmer-1' });
    await setDoc(doc(db, 'monitoring_records', 'MON-1'), { monitoringId: 'MON-1', batchId: 'BATCH-1', temperature: 48.2, dryingStatus: 'GOOD', estimatedTimeRemaining: 120, recordedAt: Timestamp.now() });
    await setDoc(doc(db, 'alert_records', 'ALERT-1'), { alertId: 'ALERT-1', batchId: 'BATCH-1', alertType: 'Condition', alertMessage: 'Check batch', alertDateTime: Timestamp.now(), isRead: false, readAt: null });
    await setDoc(doc(db, 'delivery_records', 'DEL-1'), { deliveryId: 'DEL-1', batchId: 'BATCH-1', warehouseUserId: 'warehouse-1', createdBy: 'farmer-1', updatedBy: 'farmer-1', deliveryWeight: 80, deliveryDate: Timestamp.now(), deliveryStatus: 'In Transit' });
    await setDoc(doc(db, 'delivery_records', 'DEL-2'), { deliveryId: 'DEL-2', batchId: 'BATCH-1', warehouseUserId: 'warehouse-2', createdBy: 'farmer-1', updatedBy: null, deliveryWeight: 75, deliveryDate: Timestamp.now(), deliveryStatus: 'Scheduled' });
  });
});

after(async () => environment?.cleanup());

test('users cannot change their role but can update displayName', async () => {
  const db = environment.authenticatedContext('farmer-1').firestore();
  await assertSucceeds(updateDoc(doc(db, 'users', 'farmer-1'), { displayName: 'Farmer One' }));
  await assertFails(updateDoc(doc(db, 'users', 'farmer-1'), { role: 'warehouse' }));
});

test('farmer can query warehouse accounts while warehouse cannot list users', async () => {
  const farmerDb = environment.authenticatedContext('farmer-1').firestore();
  const warehouseDb = environment.authenticatedContext('warehouse-1').firestore();
  await assertSucceeds(getDocs(query(collection(farmerDb, 'users'), where('role', '==', 'warehouse'))));
  await assertFails(getDocs(collection(warehouseDb, 'users')));
});

test('farmer can create a valid batch and warehouse cannot', async () => {
  const db = environment.authenticatedContext('farmer-1').firestore();
  const data = { batchId: 'BATCH-NEW', displayCode: 'B-7K2P9Q', createdBy: 'farmer-1', batchDate: Timestamp.now(), batchStatus: 'active' };
  const creation = writeBatch(db);
  creation.set(doc(db, 'copra_batches', 'BATCH-NEW'), data);
  creation.set(doc(db, 'display_codes', 'B-7K2P9Q'), { displayCode: 'B-7K2P9Q', kind: 'batch', recordId: 'BATCH-NEW', ownerUid: 'farmer-1', createdAt: serverTimestamp() });
  await assertSucceeds(creation.commit());
  await assertFails(setDoc(doc(environment.authenticatedContext('warehouse-1').firestore(), 'copra_batches', 'BATCH-W'), { ...data, batchId: 'BATCH-W', createdBy: 'warehouse-1' }));
});

test('new display codes require a valid atomic reservation and cannot collide', async () => {
  const db = environment.authenticatedContext('farmer-1').firestore();
  const unreserved = { batchId: 'BATCH-NO-RESERVATION', displayCode: 'B-8M3R2X', createdBy: 'farmer-1', batchDate: Timestamp.now(), batchStatus: 'active' };
  await assertFails(setDoc(doc(db, 'copra_batches', unreserved.batchId), unreserved));

  const invalid = writeBatch(db);
  invalid.set(doc(db, 'copra_batches', 'BATCH-BAD-CODE'), { ...unreserved, batchId: 'BATCH-BAD-CODE', displayCode: 'B-123' });
  invalid.set(doc(db, 'display_codes', 'B-123'), { displayCode: 'B-123', kind: 'batch', recordId: 'BATCH-BAD-CODE', ownerUid: 'farmer-1', createdAt: serverTimestamp() });
  await assertFails(invalid.commit());

  const first = writeBatch(db);
  first.set(doc(db, 'copra_batches', 'BATCH-FIRST'), { ...unreserved, batchId: 'BATCH-FIRST' });
  first.set(doc(db, 'display_codes', 'B-8M3R2X'), { displayCode: 'B-8M3R2X', kind: 'batch', recordId: 'BATCH-FIRST', ownerUid: 'farmer-1', createdAt: serverTimestamp() });
  await assertSucceeds(first.commit());

  const collision = writeBatch(db);
  collision.set(doc(db, 'copra_batches', 'BATCH-SECOND'), { ...unreserved, batchId: 'BATCH-SECOND' });
  collision.set(doc(db, 'display_codes', 'B-8M3R2X'), { displayCode: 'B-8M3R2X', kind: 'batch', recordId: 'BATCH-SECOND', ownerUid: 'farmer-1', createdAt: serverTimestamp() });
  await assertFails(collision.commit());
});

test('display codes are immutable while legacy records remain updateable', async () => {
  const db = environment.authenticatedContext('farmer-1').firestore();
  await assertFails(updateDoc(doc(db, 'copra_batches', 'BATCH-1'), { displayCode: 'B-7K2P9Q' }));
  await assertSucceeds(updateDoc(doc(db, 'copra_batches', 'BATCH-1'), {
    batchStatus: 'completed',
    completedAt: serverTimestamp(),
    completedBy: 'farmer-1',
  }));
});

test('farmer can atomically create a delivery code reservation without a batch', async () => {
  const db = environment.authenticatedContext('farmer-1').firestore();
  const delivery = { deliveryId: 'DEL-NEW', displayCode: 'D-4M8R2X', warehouseUserId: 'warehouse-1', createdBy: 'farmer-1', updatedBy: null, deliveryDate: Timestamp.now(), deliveryStatus: 'Scheduled' };
  const creation = writeBatch(db);
  creation.set(doc(db, 'delivery_records', 'DEL-NEW'), delivery);
  creation.set(doc(db, 'display_codes', 'D-4M8R2X'), { displayCode: 'D-4M8R2X', kind: 'delivery', recordId: 'DEL-NEW', ownerUid: 'farmer-1', createdAt: serverTimestamp() });
  await assertSucceeds(creation.commit());
  await assertFails(updateDoc(doc(db, 'delivery_records', 'DEL-NEW'), { displayCode: 'D-7K2P9Q' }));
});

test('concurrent batch creation allocates unique sequential numbers', async () => {
  const db1 = environment.authenticatedContext('farmer-1').firestore();
  const db2 = environment.authenticatedContext('farmer-1').firestore();
  const numbers = await Promise.all([
    createSequentialBatch(db1, 'BATCH-SEQ-A'),
    createSequentialBatch(db2, 'BATCH-SEQ-B'),
  ]);
  assert.deepEqual(numbers.sort((a, b) => a - b), [1, 2]);
  const counter = await getDoc(doc(db1, 'sequence_counters', 'batches'));
  assert.equal(counter.data().currentValue, 2);
});

test('automatic IoT batch creation atomically creates a deterministic mapping', async () => {
  const db = environment.authenticatedContext('farmer-1').firestore();
  const result = await createSequentialIotBatch(db, 'farmer-1', 'session-alpha');
  assert.deepEqual(result, { batchId: 'IOT_session-alpha', batchNumber: 1, created: true });

  const batch = await getDoc(doc(db, 'copra_batches', result.batchId));
  const link = await getDoc(doc(db, 'iot_session_links', 'session-alpha'));
  assert.equal(batch.data().iotSessionId, 'session-alpha');
  assert.equal(batch.data().createdBy, 'farmer-1');
  assert.equal(link.data().batchId, result.batchId);
  assert.equal(link.data().ownerUid, 'farmer-1');
});

test('duplicate and concurrent IoT events create one batch and increment the counter once', async () => {
  const db1 = environment.authenticatedContext('farmer-1').firestore();
  const db2 = environment.authenticatedContext('farmer-1').firestore();
  const results = await Promise.all([
    createSequentialIotBatch(db1, 'farmer-1', 'session-repeat'),
    createSequentialIotBatch(db2, 'farmer-1', 'session-repeat'),
  ]);
  assert.equal(results[0].batchId, 'IOT_session-repeat');
  assert.equal(results[1].batchId, 'IOT_session-repeat');
  assert.deepEqual(results.map((item) => item.batchNumber), [1, 1]);

  const replay = await createSequentialIotBatch(db1, 'farmer-1', 'session-repeat');
  assert.equal(replay.created, false);
  assert.equal(replay.batchNumber, 1);
  const counter = await getDoc(doc(db1, 'sequence_counters', 'batches'));
  assert.equal(counter.data().currentValue, 1);
});

test('different concurrent IoT sessions preserve sequential counter integrity', async () => {
  const db1 = environment.authenticatedContext('farmer-1').firestore();
  const db2 = environment.authenticatedContext('farmer-1').firestore();
  const results = await Promise.all([
    createSequentialIotBatch(db1, 'farmer-1', 'session-one'),
    createSequentialIotBatch(db2, 'farmer-1', 'session-two'),
  ]);
  assert.deepEqual(results.map((item) => item.batchNumber).sort((a, b) => a - b), [1, 2]);
  const counter = await getDoc(doc(db1, 'sequence_counters', 'batches'));
  assert.equal(counter.data().currentValue, 2);
});

test('invalid IoT session IDs and unauthorized automatic creation are denied', async () => {
  const farmer = environment.authenticatedContext('farmer-1').firestore();
  const warehouse = environment.authenticatedContext('warehouse-1').firestore();
  await assertFails(createSequentialIotBatch(warehouse, 'warehouse-1', 'session-warehouse'));

  const invalid = writeBatch(farmer);
  invalid.set(doc(farmer, 'copra_batches', 'IOT_bad.session'), { batchId: 'IOT_bad.session', batchNumber: 1, createdBy: 'farmer-1', batchDate: Timestamp.now(), batchStatus: 'active', iotSessionId: 'bad.session' });
  invalid.set(doc(farmer, 'iot_session_links', 'bad.session'), { sessionId: 'bad.session', batchId: 'IOT_bad.session', ownerUid: 'farmer-1', createdAt: serverTimestamp() });
  invalid.set(doc(farmer, 'sequence_counters', 'batches'), { kind: 'batch', currentValue: 1, lastRecordId: 'IOT_bad.session', updatedBy: 'farmer-1', updatedAt: serverTimestamp() });
  await assertFails(invalid.commit());
});

test('manual IoT linking creates the same immutable uniqueness reservation', async () => {
  const db = environment.authenticatedContext('farmer-1').firestore();
  const linking = writeBatch(db);
  linking.update(doc(db, 'copra_batches', 'BATCH-1'), { iotSessionId: 'manual-session' });
  linking.set(doc(db, 'iot_session_links', 'manual-session'), { sessionId: 'manual-session', batchId: 'BATCH-1', ownerUid: 'farmer-1', createdAt: serverTimestamp() });
  await assertSucceeds(linking.commit());

  const link = await getDoc(doc(db, 'iot_session_links', 'manual-session'));
  assert.equal(link.data().batchId, 'BATCH-1');
  await assertFails(updateDoc(doc(db, 'iot_session_links', 'manual-session'), { batchId: 'CHANGED' }));
});

test('batch and delivery sequences are separate and cannot be forged', async () => {
  const db = environment.authenticatedContext('farmer-1').firestore();
  assert.equal(await createSequentialBatch(db, 'BATCH-SEQ-ONLY'), 1);
  assert.equal(await createSequentialDelivery(db, 'DEL-SEQ-ONLY'), 1);
  await assertFails(setDoc(doc(db, 'sequence_counters', 'batches'), { kind: 'batch', currentValue: 99, lastRecordId: 'FORGED', updatedBy: 'farmer-1', updatedAt: serverTimestamp() }));

  const duplicate = writeBatch(db);
  duplicate.set(doc(db, 'copra_batches', 'BATCH-DUPLICATE'), { batchId: 'BATCH-DUPLICATE', batchNumber: 1, createdBy: 'farmer-1', batchDate: Timestamp.now(), batchStatus: 'active' });
  duplicate.set(doc(db, 'sequence_counters', 'batches'), { kind: 'batch', currentValue: 2, lastRecordId: 'BATCH-DUPLICATE', updatedBy: 'farmer-1', updatedAt: serverTimestamp() });
  await assertFails(duplicate.commit());
});

test('delivery sack weights use an owned delivery and deterministic immutable id', async () => {
  const farmer = environment.authenticatedContext('farmer-1').firestore();
  const otherFarmer = environment.authenticatedContext('farmer-2').firestore();
  const reading = { weightId: 'DEL-1_SACK-001', deliveryId: 'DEL-1', sackId: 'SACK-001', weight: 42.5, recordedAt: Timestamp.now() };
  await assertSucceeds(setDoc(doc(farmer, 'weight_records', reading.weightId), reading));
  await assertFails(setDoc(doc(farmer, 'weight_records', 'RANDOM-ID'), { ...reading, weightId: 'RANDOM-ID', sackId: 'SACK-002' }));
  await assertFails(setDoc(doc(otherFarmer, 'weight_records', 'DEL-1_SACK-003'), { ...reading, weightId: 'DEL-1_SACK-003', sackId: 'SACK-003' }));
  await assertFails(updateDoc(doc(farmer, 'weight_records', reading.weightId), { weight: 45 }));
});

test('owning farmer can complete an active batch with server completion metadata', async () => {
  const db = environment.authenticatedContext('farmer-1').firestore();
  await assertSucceeds(updateDoc(doc(db, 'copra_batches', 'BATCH-1'), {
    batchStatus: 'completed',
    completedAt: serverTimestamp(),
    completedBy: 'farmer-1',
  }));
});

test('another farmer and warehouse cannot complete a batch they do not own', async () => {
  for (const uid of ['farmer-2', 'warehouse-1']) {
    const db = environment.authenticatedContext(uid).firestore();
    await assertFails(updateDoc(doc(db, 'copra_batches', 'BATCH-1'), {
      batchStatus: 'completed',
      completedAt: serverTimestamp(),
      completedBy: uid,
    }));
  }
});

test('completed batches cannot be reverted or completed twice', async () => {
  const db = environment.authenticatedContext('farmer-1').firestore();
  await assertFails(updateDoc(doc(db, 'copra_batches', 'BATCH-DONE'), { batchStatus: 'active' }));
  await assertFails(updateDoc(doc(db, 'copra_batches', 'BATCH-DONE'), {
    batchStatus: 'completed',
    completedAt: serverTimestamp(),
    completedBy: 'farmer-1',
  }));
});

test('batch completion cannot alter protected fields or forge completion metadata', async () => {
  const db = environment.authenticatedContext('farmer-1').firestore();
  await assertFails(updateDoc(doc(db, 'copra_batches', 'BATCH-1'), {
    batchId: 'CHANGED',
    batchStatus: 'completed',
    completedAt: serverTimestamp(),
    completedBy: 'farmer-1',
  }));
  await assertFails(updateDoc(doc(db, 'copra_batches', 'BATCH-1'), {
    batchStatus: 'completed',
    completedAt: Timestamp.now(),
    completedBy: 'farmer-2',
  }));
});

test('mobile clients cannot create monitoring records or alerts', async () => {
  const db = environment.authenticatedContext('farmer-1').firestore();
  await assertFails(setDoc(doc(db, 'monitoring_records', 'MON-NEW'), { monitoringId: 'MON-NEW', batchId: 'BATCH-1', temperature: 50, dryingStatus: null, estimatedTimeRemaining: null, recordedAt: Timestamp.now() }));
  await assertFails(setDoc(doc(db, 'alert_records', 'ALERT-NEW'), { alertId: 'ALERT-NEW', batchId: 'BATCH-1', alertType: 'Test', alertMessage: 'Test', alertDateTime: Timestamp.now(), isRead: false, readAt: null }));
});

test('farmer can mark an alert read but cannot edit its message', async () => {
  const db = environment.authenticatedContext('farmer-1').firestore();
  await assertSucceeds(updateDoc(doc(db, 'alert_records', 'ALERT-1'), { isRead: true, readAt: Timestamp.now() }));
  await assertFails(updateDoc(doc(db, 'alert_records', 'ALERT-1'), { alertMessage: 'Changed' }));
});

test('warehouse can read only deliveries assigned to its UID', async () => {
  const db = environment.authenticatedContext('warehouse-1').firestore();
  await assertSucceeds(getDoc(doc(db, 'delivery_records', 'DEL-1')));
  await assertFails(getDoc(doc(db, 'delivery_records', 'DEL-2')));
  await assertSucceeds(getDocs(query(collection(db, 'delivery_records'), where('warehouseUserId', '==', 'warehouse-1'))));
  await assertFails(getDocs(collection(db, 'delivery_records')));
});

test('warehouse can receive an assigned in-transit delivery without editing protected fields', async () => {
  const assignedDb = environment.authenticatedContext('warehouse-1').firestore();
  const otherDb = environment.authenticatedContext('warehouse-2').firestore();
  await assertSucceeds(updateDoc(doc(assignedDb, 'delivery_records', 'DEL-1'), { deliveryStatus: 'Received', updatedBy: 'warehouse-1' }));
  await assertFails(updateDoc(doc(otherDb, 'delivery_records', 'DEL-1'), { deliveryStatus: 'Received', updatedBy: 'warehouse-2' }));
  await assertFails(updateDoc(doc(assignedDb, 'delivery_records', 'DEL-1'), { deliveryWeight: 1, deliveryStatus: 'Received', updatedBy: 'warehouse-1' }));
});

test('farmer cannot skip directly from Scheduled to Received', async () => {
  const db = environment.authenticatedContext('farmer-1').firestore();
  await assertFails(updateDoc(doc(db, 'delivery_records', 'DEL-2'), { deliveryStatus: 'Received', updatedBy: 'farmer-1' }));
  await assertSucceeds(updateDoc(doc(db, 'delivery_records', 'DEL-2'), { deliveryStatus: 'In Transit', updatedBy: 'farmer-1' }));
});

async function createSequentialBatch(db, batchId) {
  return runTransaction(db, async (transaction) => {
    const counterRef = doc(db, 'sequence_counters', 'batches');
    const counter = await transaction.get(counterRef);
    const next = (counter.data()?.currentValue ?? 0) + 1;
    transaction.set(doc(db, 'copra_batches', batchId), { batchId, batchNumber: next, createdBy: 'farmer-1', batchDate: Timestamp.now(), batchStatus: 'active' });
    transaction.set(counterRef, { kind: 'batch', currentValue: next, lastRecordId: batchId, updatedBy: 'farmer-1', updatedAt: serverTimestamp() });
    return next;
  });
}

async function createSequentialIotBatch(db, farmerUid, sessionId) {
  const batchId = `IOT_${sessionId}`;
  const batchDate = Timestamp.now();
  return runTransaction(db, async (transaction) => {
    const batchRef = doc(db, 'copra_batches', batchId);
    const linkRef = doc(db, 'iot_session_links', sessionId);
    const counterRef = doc(db, 'sequence_counters', 'batches');
    const batch = await transaction.get(batchRef);
    const link = await transaction.get(linkRef);
    const counter = await transaction.get(counterRef);

    if (batch.exists() || link.exists()) {
      if (!batch.exists() || !link.exists()) throw new Error('Incomplete mapping');
      if (batch.data().createdBy !== farmerUid || batch.data().iotSessionId !== sessionId
        || link.data().batchId !== batchId || link.data().ownerUid !== farmerUid) throw new Error('Mapping conflict');
      return { batchId, batchNumber: batch.data().batchNumber, created: false };
    }

    const batchNumber = (counter.data()?.currentValue ?? 0) + 1;
    transaction.set(batchRef, { batchId, batchNumber, createdBy: farmerUid, batchDate, batchStatus: 'active', iotSessionId: sessionId });
    transaction.set(linkRef, { sessionId, batchId, ownerUid: farmerUid, createdAt: serverTimestamp() });
    transaction.set(counterRef, { kind: 'batch', currentValue: batchNumber, lastRecordId: batchId, updatedBy: farmerUid, updatedAt: serverTimestamp() });
    return { batchId, batchNumber, created: true };
  });
}

async function createSequentialDelivery(db, deliveryId) {
  return runTransaction(db, async (transaction) => {
    const counterRef = doc(db, 'sequence_counters', 'deliveries');
    const counter = await transaction.get(counterRef);
    const next = (counter.data()?.currentValue ?? 0) + 1;
    transaction.set(doc(db, 'delivery_records', deliveryId), { deliveryId, deliveryNumber: next, warehouseUserId: 'warehouse-1', createdBy: 'farmer-1', updatedBy: null, createdAt: serverTimestamp(), deliveryDate: Timestamp.now(), deliveryStatus: 'Scheduled' });
    transaction.set(counterRef, { kind: 'delivery', currentValue: next, lastRecordId: deliveryId, updatedBy: 'farmer-1', updatedAt: serverTimestamp() });
    return next;
  });
}
