# How do you secure sensitive data at rest?

## 1. What does "data at rest" mean?

Data can exist in three states:

```text
1. Data in transit
   ↓
   Data moving between systems
   Example: Browser → Backend
   Protection: TLS / HTTPS

2. Data at rest
   ↓
   Data stored somewhere
   Example: Database, disk, backup
   Protection: Encryption + Access Control

3. Data in use
   ↓
   Data currently being processed
   Example: Application processing data in memory
   Protection: Access control, isolation, secure runtime
```

### Simple definition

> **Data at rest is data that is currently stored rather than being transmitted.**

Examples:

* Database records
* Files on disk
* Database backups
* Snapshots
* Object storage
* Stored documents

---

# 2. How do you secure sensitive data at rest?

A strong security strategy uses **multiple layers**:

```text
                 Sensitive Data
                       │
          ┌────────────┼────────────┐
          │            │            │
          ▼            ▼            ▼
      Encryption   Access Control  Network
          │            │            │
          ▼            ▼            ▼
       Key Mgmt    Least Privilege  Private DB
          │
          ▼
       Backups
          │
          ▼
     Secure Logging
```

Main techniques:

1. Encrypt stored data
2. Secure encryption keys
3. Use application-level encryption for highly sensitive fields
4. Hash passwords instead of encrypting them
5. Restrict database network access
6. Use firewalls/security groups
7. Apply least privilege
8. Encrypt backups
9. Avoid sensitive data in logs
10. Keep databases off the public internet

---

# 3. Encryption

The primary way to protect sensitive data at rest is **encryption**.

Encryption converts readable data (**plaintext**) into unreadable data (**ciphertext**) using an encryption key.

```text
Plaintext
    │
    │ Encryption + Key
    ▼
Ciphertext
    │
    │ Stored in database
    ▼
Database
```

To recover the original data:

```text
Ciphertext
    │
    │ Decryption + Key
    ▼
Plaintext
```

### Example

Instead of storing:

```text
credit_card = 4111111111111111
```

we might store encrypted data:

```text
credit_card = "8fA91xK29..."
```

---

# 4. Database-level encryption

Database/storage-level encryption happens at the **database or storage layer**.

Conceptually:

```text
Application
     │
     ▼
Database
     │
     ▼
Encryption
     │
     ▼
Encrypted Disk
```

The application can work with normal data:

```text
Application
    ↓
Database
    ↓
"9876543210"
```

The storage layer handles encryption when data is written to disk.

### What does it protect against?

Primarily:

> Someone obtaining the underlying disk, storage files, snapshots, or other encrypted-at-rest storage.

For example:

```text
Database Server
      │
      ▼
Encrypted Disk
```

If someone steals the physical disk or obtains raw storage data, they should not be able to simply read the stored information.

### Important

Database-level encryption does **not** mean the application never sees plaintext.

The database/application can still access the data normally when authorized.

---

# 5. Application-level encryption

Application-level encryption happens **inside the application before the data reaches the database**.

```text
Application
     │
     │ Encrypt sensitive field
     ▼
Ciphertext
     │
     ▼
Database
```

Example:

Original:

```text
phone = 9876543210
```

Application encrypts it:

```text
phone = "X8a91ks7..."
```

Database stores:

```text
id | name   | phone
---|--------|------------
1  | Bhavya | X8a91ks7...
```

The database itself only sees the ciphertext.

---

# 6. Database-level vs Application-level encryption

The easiest way to remember the difference:

```text
DATABASE-LEVEL

Application
     ↓
Database
     ↓
🔐 Encryption
     ↓
Disk
```

vs.

```text
APPLICATION-LEVEL

Application
     ↓
🔐 Encryption
     ↓
Database
     ↓
Disk
```

### Key difference

> **Database-level encryption encrypts at the storage/database layer, while application-level encryption encrypts the data inside the application before storing it.**

---

# 7. Why use application-level encryption?

Suppose an attacker gets access to your database.

With application-level encryption, they may see:

```text
phone = "X8a91ks7..."
```

instead of:

```text
phone = "9876543210"
```

The database itself does not contain the plaintext.

This gives an additional layer of protection for highly sensitive fields.

Examples:

* Government IDs
* Highly sensitive personal information
* Certain financial information
* Sensitive tokens/secrets
* Private customer information

---

# 8. Downside of application-level encryption

Application-level encryption can make database operations more difficult.

Suppose the database stores:

```text
phone = "X8a91ks7..."
```

You can't simply do:

```sql
SELECT *
FROM users
WHERE phone = '9876543210';
```

because the database doesn't have the plaintext phone number.

This can make:

* Searching
* Sorting
* Indexing
* Filtering
* Analytics

more difficult.

Therefore:

> **Don't automatically application-encrypt every column. Use it where the additional protection is worth the complexity.**

---

# 9. Encryption vs Hashing

This is one of the most important interview distinctions.

## Encryption

Encryption is generally **reversible** with the appropriate key.

```text
Plaintext
    ↓
Encryption
    ↓
Ciphertext
    ↓
Decryption
    ↓
Plaintext
```

Use encryption when you need to recover the original value.

Examples:

* Sensitive documents
* Certain financial information
* API credentials that the system needs to retrieve
* Sensitive personal information

---

## Hashing

Hashing is designed to be **one-way**.

```text
Password
    ↓
Hash function
    ↓
Hash
```

You don't normally decrypt a password hash.

Passwords should therefore generally be **hashed rather than encrypted**.

Common password-hashing algorithms:

```text
Argon2
bcrypt
scrypt
```

---

# 10. Why shouldn't passwords be encrypted?

Suppose we encrypt:

```text
password123
```

and get:

```text
X8a91ks7...
```

The application has a decryption key.

If an attacker gets:

```text
Database + Encryption Key
```

they may be able to recover everyone's passwords.

With password hashing:

```text
password123
      ↓
    Argon2
      ↓
$argon2id$...
```

there is no normal decryption process.

When the user logs in:

```text
Entered Password
      ↓
Password verification
      ↓
Stored Hash
```

The password-hashing algorithm checks whether they match.

### Memory trick

```text
Need the original value later?
→ Encryption

Don't need the original value?
→ Hashing
```

---

# 11. Encryption Keys

Encryption is only useful if the encryption keys are protected.

Bad:

```text
Database
├── encrypted_data
└── encryption_key
```

If an attacker gets both, they may be able to decrypt the data.

Another bad approach:

```javascript
const encryptionKey = "my-secret-key";
```

or committing it to Git.

```text
❌ Source code
❌ Git repository
❌ Public config
❌ Database alongside encrypted data
```

---

# 12. Key Management System (KMS)

Encryption keys should be managed separately using a secure key-management system.

Conceptually:

```text
Application
     │
     │ Request/use key
     ▼
KMS
     │
     ▼
Encryption Key
```

Examples:

```text
AWS KMS
Google Cloud KMS
Azure Key Vault
```

The important principle is:

> **Keep encryption keys separate from the data they protect and manage them securely.**

---

# 13. Secrets Management

Some sensitive values aren't database data but still need protection.

Examples:

```text
DATABASE_PASSWORD
API_KEY
JWT_SECRET
ENCRYPTION_KEY
```

Don't put them directly in source code:

```text
❌ GitHub
❌ Hard-coded source code
❌ Public configuration
```

Instead use a secrets-management system.

Conceptually:

```text
Application
     │
     ▼
Secrets Manager
     │
     ├── Database password
     ├── API key
     └── Other secrets
```

Examples:

```text
AWS Secrets Manager
HashiCorp Vault
Google Secret Manager
Azure Key Vault
```

---

# 14. Restricting Database Access

Encryption is only one layer of security.

You should also make sure that **random people cannot directly connect to your database**.

### Bad architecture

```text
                 INTERNET
                    │
          ┌─────────┼─────────┐
          │         │         │
        User      Admin     Hacker
          │         │         │
          └─────────┼─────────┘
                    ▼
                DATABASE
```

The database is directly exposed to the internet.

This is dangerous.

---

# 15. Better Database Architecture

Instead:

```text
                 INTERNET
                    │
                    ▼
                 Backend
                    │
                    ▼
              Private Network
                    │
                    ▼
                 Database
```

The important rule is:

> **Users should normally communicate with your backend/API, not directly with your database.**

The backend acts as the controlled gateway to the database.

---

# 16. Why should the database be private?

Suppose your PostgreSQL database uses:

```text
Port: 5432
```

If it's publicly accessible:

```text
Internet
    │
    ▼
Database:5432
```

Attackers can at least attempt to connect to it.

They could try:

```text
Credential attacks
Database vulnerabilities
Misconfiguration exploits
Other network attacks
```

Instead:

```text
Internet
    │
    ▼
Backend
    │
    ▼
Database
```

The database only needs to accept connections from trusted backend services.

---

# 17. What is a Firewall?

A **firewall** is a system that controls network traffic according to rules.

Think of it as a security guard.

```text
Internet
   │
   ▼
Firewall
   │
   ├── Trusted traffic → ALLOW
   │
   └── Untrusted traffic → BLOCK
```

Example:

```text
Allow:
Backend → Database → Port 5432

Block:
Internet → Database → Port 5432
```

---

# 18. What is a Port?

A port identifies a particular network service on a machine.

Think:

```text
IP address
→ Which machine?

Port
→ Which service on that machine?
```

Common ports:

```text
80    → HTTP
443   → HTTPS
22    → SSH
5432  → PostgreSQL
3306  → MySQL
6379  → Redis
```

For example:

```text
10.0.2.15:5432
```

means:

```text
Machine:
10.0.2.15

Service:
PostgreSQL on port 5432
```

---

# 19. Example Firewall Rule

Suppose:

```text
Backend server
      ↓
PostgreSQL database
```

The firewall could have:

```text
ALLOW

Source:
Backend server

Destination:
Database

Port:
5432

Protocol:
TCP
```

Everything else can be blocked.

Conceptually:

```text
                    DATABASE
                       │
                    Port 5432
                       │
             ┌─────────┴─────────┐
             │     FIREWALL      │
             └─────────┬─────────┘
                       │
          ┌────────────┴────────────┐
          │                         │
       Backend                    Hacker
          │                         │
          ▼                         ▼
        ALLOW                     BLOCK
          ✅                         ❌
```

---

# 20. What is a Security Group?

A **security group** is a cloud-managed set of network access rules.

It works conceptually like a firewall around cloud resources.

For example, in a cloud environment:

```text
Backend Server
      │
      │
      ▼
Database
```

Database security group:

```text
Database Security Group

Inbound:
Port: 5432
Source: Backend servers
Action: ALLOW
```

So:

```text
Backend → Database:5432
        ✅ ALLOWED
```

but:

```text
Random Internet machine → Database:5432
        ❌ BLOCKED
```

---

# 21. Firewall vs Security Group

Think of:

```text
Firewall
↓
General networking/security concept
↓
"Which network traffic should be allowed?"
```

and:

```text
Security Group
↓
Cloud-specific network access mechanism
↓
"Which traffic should be allowed to/from this cloud resource?"
```

A security group is essentially a **cloud-managed firewall mechanism**, although the exact behavior depends on the cloud provider.

---

# 22. Inbound vs Outbound

Network rules can control both directions.

## Inbound

Traffic coming **into** a server.

```text
Internet
   ↓
Server
```

Question:

> Who can connect to my server?

For a database, inbound rules are especially important.

---

## Outbound

Traffic going **out of** a server.

```text
Server
   ↓
Internet
```

Question:

> Where is my server allowed to connect?

---

# 23. Database Authentication vs Network Security

Firewall/security groups don't replace database authentication.

Think of multiple layers:

```text
Internet
   │
   ▼
Firewall / Security Group
   │
   │ "Are you allowed to reach the DB?"
   ▼
Database
   │
   ▼
Database Authentication
   │
   │ "Do you have valid credentials?"
   ▼
Database Permissions
   │
   │ "What are you allowed to do?"
   ▼
Data
```

These are different security layers.

---

# 24. Least Privilege

Once the backend can reach the database, don't give it unlimited permissions.

Suppose the backend only needs:

```text
SELECT
INSERT
UPDATE
```

Don't automatically give it:

```text
DROP DATABASE
CREATE USER
ALTER SYSTEM
```

Give users/services only the permissions they actually need.

This is called:

> **Principle of Least Privilege**

### Simple definition

> Give every user, service, or process the minimum permissions required to perform its job.

---

# 25. Backups Must Also Be Protected

Imagine:

```text
Production Database
      ↓
Encrypted ✅
```

but:

```text
Database Backup
      ↓
Unencrypted ❌
```

Your sensitive data is still exposed.

Therefore, protect:

```text
Primary database
Backups
Snapshots
Replication storage
Exports
Object storage
```

where applicable.

---

# 26. Don't Put Sensitive Data in Logs

Suppose your API receives:

```json
{
    "credit_card": "4111111111111111"
}
```

and logs the entire request:

```text
Received payment:
credit_card=4111111111111111
```

Now you've accidentally created another copy of sensitive data.

Instead:

```text
credit_card=****1111
```

or don't log it at all.

### Rule

> **Don't log sensitive information unnecessarily.**

---

# 27. Complete Secure Architecture

A good backend architecture can look like:

```text
                         INTERNET
                            │
                            ▼
                      Load Balancer
                            │
                            ▼
                         Backend
                            │
                 ┌──────────┴──────────┐
                 │                     │
          Authentication          Authorization
                 │                     │
                 └──────────┬──────────┘
                            │
                            ▼
                     Private Network
                            │
                            ▼
                         Database
                            │
                  ┌─────────┴─────────┐
                  │                   │
             Access Control      Encryption
                  │                   │
                  │                   ▼
                  │             Encrypted Disk
                  │
                  ▼
             Least Privilege

Highly sensitive fields:
Backend
   │
   │ Application-level encryption
   ▼
Database
   │
   │ Storage-level encryption
   ▼
Encrypted Disk

Encryption keys:
Backend/KMS
     ↓
Secure key management

Backups:
Database
   ↓
Encrypted Backup
```

---

# 28. Database-level + Application-level Encryption Can Coexist

You don't have to choose one.

You can use both:

```text
Sensitive Data
      │
      ▼
Application-level encryption
      │
      ▼
Database
      │
      ▼
Database/storage-level encryption
      │
      ▼
Disk
```

This creates multiple layers of protection.

For example:

```text
Highly sensitive field
        ↓
Application encrypts it
        ↓
Database stores ciphertext
        ↓
Database storage is encrypted
        ↓
Encrypted disk
```

---

# 29. What Are We Protecting Against?

It's useful to understand that different controls protect against different threats.

| Security measure             | Main purpose                                                       |
| ---------------------------- | ------------------------------------------------------------------ |
| TLS/HTTPS                    | Protect data while traveling                                       |
| Database encryption at rest  | Protect stored data/disk                                           |
| Application-level encryption | Protect particularly sensitive fields from database-level exposure |
| KMS                          | Protect/manage encryption keys                                     |
| Firewall                     | Control network traffic                                            |
| Security Group               | Cloud network access control                                       |
| Private database             | Prevent direct public network access                               |
| Database authentication      | Verify who can connect                                             |
| Least privilege              | Limit what an authenticated user/service can do                    |
| Encrypted backups            | Protect backup copies                                              |
| Log redaction                | Prevent sensitive data leakage through logs                        |
| Password hashing             | Protect passwords without storing recoverable plaintext            |

---

# 30. Interview Questions

## Q1. How do you secure sensitive data at rest?

### Answer

> I would encrypt sensitive data at rest, use secure key management, and apply least-privilege access controls. For particularly sensitive fields, I may use application-level encryption before storing them. I'd also keep the database on a private network, restrict access using firewall/security-group rules, encrypt backups, and avoid logging sensitive information. Passwords should be hashed using algorithms such as Argon2 or bcrypt rather than encrypted.

---

## Q2. What's the difference between data at rest and data in transit?

### Answer

> Data at rest is stored data, such as database records, files, or backups. Data in transit is data moving between systems. We typically protect data in transit using TLS/HTTPS and data at rest using encryption.

---

## Q3. What's the difference between database-level and application-level encryption?

### Answer

> Database-level encryption happens at the database or storage layer and primarily protects the underlying stored data. Application-level encryption happens inside the application before the data is stored, meaning the database only sees ciphertext for those fields. Application-level encryption gives stronger protection for highly sensitive fields but can make searching and querying more difficult.

---

## Q4. Should passwords be encrypted?

### Answer

> No. Passwords should generally be hashed using a password-hashing algorithm such as Argon2, bcrypt, or scrypt. Since the application doesn't need to recover the original password, a one-way password hash is more appropriate than reversible encryption.

---

## Q5. Where should encryption keys be stored?

### Answer

> Encryption keys should be managed separately from the encrypted data, preferably using a dedicated key-management system such as KMS. They should not be hard-coded in source code or stored alongside the encrypted data.

---

## Q6. How would you restrict access to a database?

### Answer

> I would keep the database on a private network and prevent direct internet access. Firewall or security-group rules would allow the database port only from trusted backend services. I'd also use database authentication and least-privilege database permissions.

---

## Q7. What is a firewall?

### Answer

> A firewall is a network security mechanism that allows or blocks network traffic according to defined rules, such as source, destination, port, and protocol.

---

## Q8. What is a security group?

### Answer

> A security group is a cloud-managed set of network access rules used to control traffic to or from cloud resources. For example, I could configure a database security group to allow PostgreSQL traffic only from my backend servers.

---

## Q9. Is database encryption enough?

### Answer

> No. Encryption protects stored data, but security also requires proper key management, network isolation, authentication, authorization, least privilege, encrypted backups, and careful handling of sensitive information in logs.

---

# 31. Common Interview Traps

### ❌ "Encryption and hashing are the same."

No.

```text
Encryption
→ Reversible with a key

Hashing
→ Designed to be one-way
```

---

### ❌ "Passwords should be encrypted."

Generally no.

```text
Passwords
→ Hash with Argon2/bcrypt/scrypt
```

---

### ❌ "A firewall authenticates users."

No.

A firewall controls **network traffic**.

Authentication determines **who you are**.

---

### ❌ "Security groups replace database passwords."

No.

They control network access.

Database authentication still determines whether the connection is authorized to log in.

---

### ❌ "If the database is encrypted, we're completely secure."

No.

You still need:

```text
Key management
Access control
Network restrictions
Least privilege
Backup protection
Secure logging
```

---

### ❌ "Application-level encryption is always better."

Not necessarily.

It provides additional protection for sensitive fields, but it can make:

```text
Searching
Indexing
Filtering
Sorting
Analytics
```

more complicated.

Use it where appropriate.

---

# 32. 🧠 Mental Models

## Encryption

```text
Encryption
→ Lock the data
```

## Encryption key

```text
Encryption key
→ Key that unlocks the encrypted data
```

## KMS

```text
KMS
→ Secure system for managing encryption keys
```

## Firewall

```text
Firewall
→ Security guard for network traffic
```

## Security Group

```text
Security Group
→ Cloud-managed network security rules
```

## Private Database

```text
Private Database
→ Database that isn't directly reachable from the public internet
```

## Least Privilege

```text
Least Privilege
→ Give only the permissions actually needed
```

## Hashing

```text
Hashing
→ One-way transformation
→ Useful for passwords
```

---

# 33. 🔥 Final Cheat Sheet

```text
DATA AT REST
→ Data stored in database, disk, backup, snapshot, etc.

PROTECT IT WITH:

1. Encryption
   → Encrypt stored data

2. Application-level encryption
   → Encrypt sensitive fields before DB

3. Database/storage-level encryption
   → Encrypt stored database/disk data

4. Key management
   → KMS / secure key management

5. Password hashing
   → Argon2 / bcrypt / scrypt
   → Don't encrypt passwords

6. Private database
   → Don't expose DB directly to internet

7. Firewall
   → Allow/block network traffic

8. Security Group
   → Cloud-managed network access rules

9. Least privilege
   → Give minimum required permissions

10. Database authentication
    → Require valid DB credentials

11. Encrypted backups
    → Protect copies of the database too

12. Secure logging
    → Don't log sensitive information
```

---

# ⭐ Perfect Interview Answer

> **"To secure sensitive data at rest, I would use encryption for stored data and secure the encryption keys using a KMS. For particularly sensitive fields, I could use application-level encryption before storing them in the database, while also using database or storage-level encryption. I'd keep the database on a private network, restrict access using firewall or security-group rules, enforce authentication and least-privilege permissions, encrypt backups, and avoid logging sensitive information. For passwords, I'd use a password-hashing algorithm such as Argon2 or bcrypt rather than encryption."**

### 🧠 One-line memory trick

> **"Encrypt the data, protect the keys, restrict who can reach the database, restrict what they can do, protect the backups, and never store passwords in recoverable form."**
