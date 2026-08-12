# Security Specification - EduSmart Pro Firestore Security

## 1. Data Invariants
- Only signed-in users can write or read school administration and student database entries.
- Student identities must be unique, and their barcode matching values must meet character limits.
- Transactions and payment values must be positive numbers.
- Timestamps must correspond to the correct server time, preventing historical injection attacks.

## 2. The "Dirty Dozen" Payloads (Threat Vectors Rejected)
1. **Unauthenticated Siswa Read**: Request to fetch student records without authentication.
2. **Anonymous Teacher Injection**: Creating a teacher record using an unverified/anonymous auth token.
3. **Ghost Tuition Creation**: Creating a financial tuition record with negative or empty amount fields.
4. **Incorrect ID Spoofing**: Creating a record where `id` inside payload doesn't match the URL document ID.
5. **PII Data Scraping**: Attempting to read all phone numbers / addresses of students without being an administrative role.
6. **Transaction Falsification**: Mutating a paid bill's `terbayar` sum back to 0 without admin permissions.
7. **System Configuration Tampering**: Overwriting school settings with arbitrary junk properties.
8. **CBT Exam Sheet Manipulation**: Modifying exam result or answers of another student.
9. **Fake Attendance Injection**: Spoofing daily student attendance using historical dates or future timestamps.
10. **ID Poisoning Attack**: Trying to inject a document ID of length > 256 or containing special characters to trigger memory exhaustion.
11. **Malicious Role Escalation**: Writing `role: admin` inside the user profile directly on sign up.
12. **Double Refund/Charge Void**: Submitting a payment transaction with non-server-validated timestamps.

## 3. Test Runner Design (`firestore.rules.test.ts`)
The `firestore.rules.test.ts` file acts as the primary validation harness to ensure that permissions are locked down tight.

```typescript
// Test suites will confirm that ALL "Dirty Dozen" malicious payload combinations
// return PERMISSION_DENIED under zero-trust authorization policies.
```
