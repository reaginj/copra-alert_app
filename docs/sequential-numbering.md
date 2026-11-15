# Sequential batch and delivery numbers

New records keep their existing random Firestore document IDs. Their user-facing labels come from:

- `copra_batches.batchNumber` → `Batch 001`, `Batch 002`, …
- `delivery_records.deliveryNumber` → `Delivery 001`, `Delivery 002`, …

Two independent documents hold the current sequence:

- `sequence_counters/batches`
- `sequence_counters/deliveries`

The mobile client reads and increments the appropriate counter inside the same Firestore transaction that creates the record. Firestore retries transaction conflicts, so concurrent creation cannot commit the same number. The counter records the last created document ID, and Security Rules require that referenced record to contain the new number and belong to the signed-in Farmer.

The first new record creates its counter at `1`. Existing records are not counted, migrated, or renumbered. Documents with no sequential field continue to display their legacy `displayCode`.

## Deployment order

Publish `firestore.rules` before distributing the updated application. The old production rules do not permit `batchNumber`, `deliveryNumber`, or writes to `sequence_counters`.

No Firestore index is required for this change. Do not manually create or edit counter documents unless recovery has been reviewed and tested first.
