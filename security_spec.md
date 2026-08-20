# Security Specification - EduSmart Pro Firestore Security

## 1. Data Invariants
- All master data (Siswa, Guru, Staf, Rombel, Mapel, Ekskul) can only be managed by authenticated users.
- Attendance records (AbsensiHarian, AbsensiKelas, AbsensiGuru) require authentication and must validate user roles if applicable.
- Financial records (Tagihan, Transaksi, Tarif) are highly sensitive and restricted to authenticated administration staff.
- CBT data (BankSoal, Ujian, HasilUjian) must prevent cross-student leakage.
- School settings are restricted to administrative users.

## 2. The "Dirty Dozen" Payloads (Threat Vectors Rejected)
1. **Unauthenticated Read**: Attempting to read any collection without being signed in.
2. **Anonymous Write**: Attempting to create a student record without a verified auth token.
3. **ID Mismatch**: Creating a document where the `id` field in the data does not match the document ID in the path.
4. **Invalid Type Injection**: Sending a number to a field that expects a string (e.g., `nama`).
5. **Oversized String Attack**: Sending a 1MB string to a field with a 100-character limit.
6. **Cross-User Data Access**: Student A attempting to read Student B's exam results.
7. **Negative Nominal**: Creating a financial transaction with a negative amount.
8. **Future Timestamp Spoofing**: Setting `createdAt` to a future date instead of `request.time`.
9. **Role Escalation**: Setting `isAdmin` or `role` fields in a user profile.
10. **Unauthorized Settings Update**: Changing school name or NPSN without proper permissions.
11. **Orphaned Attendance**: Creating attendance for a student ID that doesn't exist.
12. **Status Skipping**: Manually setting a bill to "Lunas" without a corresponding transaction.

## 3. Test Runner Design (`firestore.rules.test.ts`)
The test suite will verify:
- Deny all unauthenticated access.
- Deny writes with missing required fields.
- Deny updates to immutable fields like `id` or `createdAt`.
- Allow read/write for authenticated users on school data.
