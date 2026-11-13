# Copra-Alert Firestore test-data reset

This utility targets project `copra-alert` and only these collections:

- `copra_batches`
- `monitoring_records`
- `weight_records`
- `alert_records`
- `delivery_records`

It never deletes `users`, Firebase Authentication accounts, `display_codes`, Security Rules, or indexes. `display_codes` is intentionally retained because the app uses it as an immutable reservation ledger for batch and delivery display codes. Old codes therefore remain reserved after a test-data reset.

## 1. Configure temporary administrative credentials

Use a trusted service account from Firebase Console: Project settings → Service accounts → Firebase Admin SDK. Store the downloaded JSON outside this repository and restrict access to it.

In PowerShell, set the credential only for the current terminal:

```powershell
$env:GOOGLE_APPLICATION_CREDENTIALS = 'C:\secure-location\copra-alert-admin.json'
```

Do not copy or commit the key into the project. Revoke/delete an unneeded downloaded key in Google Cloud IAM after the reset.

## 2. Run the mandatory dry run

```powershell
npm run firestore:reset -- --project copra-alert
```

The default mode is read-only. It prints every target document ID and these counts:

- each of the five target collections;
- preserved `users` documents;
- preserved Firebase Authentication accounts;
- preserved `display_codes` documents.

Review this output before continuing. No backup or deletion occurs in dry-run mode.

## 3. Request the reset

Only after reviewing the dry run:

```powershell
npm run firestore:reset -- --apply --project copra-alert
```

Before prompting for confirmation, the script exports the five target collections to:

```text
backups/firestore-reset/copra-alert-<timestamp>.json
```

Deletion cannot begin if the backup cannot be written. The backup preserves Firestore timestamps and other special values with type markers. Copy this file to protected storage before confirming if an off-machine backup is required.

The script then requires this exact phrase:

```text
DELETE copra-alert OPERATIONAL DATA
```

Any other input cancels deletion. Documents are deleted in batches of at most 400. Failed batches are reported with their collection and document IDs, and the script exits unsuccessfully.

## 4. Verify the result

After deletion, the script recounts all five collections. Each must report `0`. It also recounts `users` documents and Authentication accounts; compare those values with the dry-run counts.

In Firebase Console, independently verify:

1. Firestore Data shows the five operational collections empty.
2. The `users` collection still contains the Farmer and Warehouse profile documents.
3. Authentication → Users still contains the existing login accounts.
4. `display_codes` still exists and was not modified.
5. Firestore Rules and Indexes remain unchanged.

Finally, clear the terminal credential variable:

```powershell
Remove-Item Env:GOOGLE_APPLICATION_CREDENTIALS
```

