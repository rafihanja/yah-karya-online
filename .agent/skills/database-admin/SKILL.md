---
name: database-admin
description: Expert database administrator specializing in modern cloud databases, automation, and reliability engineering.
risk: high (loss of data backups, storage exhaustion outages, unauthorized public access)
source: "Elite Agent Operations - Batch 9 (Gemini Upgraded)"
date_updated: "2026-06-29"
---

# Database Administration

> **One-liner:** Guidelines for provisioning cloud database infrastructure using Terraform, configuring Multi-AZ high availability, setting retention rules, and securing storage encryption.

## When to Use

- When provisioning databases (e.g. AWS RDS, Aurora, Cloud SQL) using Infrastructure as Code (IaC).
- When configuring database backup windows, retention policies, or point-in-time recovery (PITR) systems.
- When establishing high-availability replica configurations, read-scaling nodes, or auto-scaling rules.

## Why This Exists

If databases are provisioned manually without deletion protection or backup configurations, accidental human error can delete database clusters and cause irreversible data loss. Furthermore, deploying a single-instance database without Multi-AZ replicas leaves the application vulnerable to complete downtime if a hardware failure occurs in a datacenter. Enforcing automated backups, deletion protection, and Multi-AZ replication guarantees disaster recovery and uptime.

## ALWAYS DO THIS

- **Enable deletion protection** — Configure deletion protection on production databases to prevent accidental deletion via console clicks or IaC runs.
- **Configure Multi-AZ deployments** — Deploy production instances across multiple Availability Zones (Multi-AZ) to enable automated failover during datacenter outages.
- **Enforce storage encryption** — Encrypt database storage at rest using customer-managed keys (KMS) to secure sensitive data.
- **Define automated backup schedules** — Enforce daily backup windows with a retention period of at least 7 to 30 days to support point-in-time recovery.
- **Deploy databases in private subnets** — Keep database instances out of public-facing subnets; restrict incoming traffic to application servers using security group rules.

## NEVER DO THIS

- ❌ **DO NOT** deploy database instances in public-facing subnets with public IP addresses enabled. **Why fails:** Exposes the database port to the public internet, leaving it vulnerable to automated brute-force attacks and network intrusion. **Instead:** Deploy databases in private subnets and restrict access to application servers.
- ❌ **DO NOT** disable automated backup configurations or set the retention period to 0 days on production databases. **Why fails:** Untested backups do not exist. Disabling backups prevents point-in-time recovery (PITR) during data corruption incidents, leading to permanent data loss. **Instead:** Set a minimum 7-day retention period.
- ❌ **DO NOT** run database instances on single Availability Zones in production environments. **Why fails:** If the physical datacenter hosting the database experiences a power outage or hardware failure, the database (and your application) goes offline. **Instead:** Enable Multi-AZ failovers.
- ❌ **DO NOT** provision database storage structures without configuring auto-scaling thresholds. **Why fails:** If the database runs out of disk space, it halts all transactions immediately and crashes, corrupting tables. **Instead:** Enable storage auto-scaling parameters.

---

## High-Availability (Multi-AZ) Failover Flow

In a Multi-AZ deployment, database writes are replicated synchronously, enabling automated failover if the primary node fails:

```
[Write Request] ──> [Primary Database (AZ-A)] ──(Synchronous Replication)──> [Standby Database (AZ-B)]
                         │ (Hardware Crash)
                         └──> [Auto-Failover] ──> [DNS Swaps to Standby Node (AZ-B)]
```

---

## Examples

### ✅ Good — Production-Ready AWS RDS PostgreSQL Instance (Terraform)

```hcl
# AWS RDS PostgreSQL Configuration in Terraform
resource "aws_db_instance" "production_db" {
  identifier           = "prod-postgres-db"
  allocated_storage    = 20
  max_allocated_storage = 100 # 1. Enable storage auto-scaling to prevent disk exhaustion
  engine               = "postgres"
  engine_version       = "16.1"
  instance_class       = "db.t4g.medium"
  db_name              = "production_app"
  username             = "admin_user"
  password             = var.database_password # Loaded securely via variable binding

  # 2. High-Availability: Deploy across multiple availability zones
  multi_az             = true

  # 3. Security: Deploy database in private subnets
  db_subnet_group_name = aws_db_subnet_group.private_db_group.name
  vpc_security_group_ids = [aws_security_group.db_security_group.id]

  # 4. Storage Encryption at rest using AWS KMS
  storage_encrypted    = true
  kms_key_id           = aws_kms_key.db_encryption_key.arn

  # 5. Backup configuration
  backup_retention_period = 14 # Store backups for 14 days to support Point-in-time recovery
  backup_window           = "03:00-04:00" # Run backups during low-traffic windows

  # 6. Guardrail: Prevent accidental deletions
  deletion_protection = true

  skip_final_snapshot = false
  final_snapshot_identifier = "prod-postgres-db-final-snapshot"

  tags = {
    Environment = "production"
    Owner       = "database-admin"
  }
}
```

Why this passes: Configures storage auto-scaling, deploys across multiple zones (Multi-AZ), isolates the database in private subnets, encrypts storage at rest, sets a 14-day backup retention period, and enables deletion protection.

### ❌ Bad — Publicly Accessible, Single Zone, and Unencrypted RDS Instance

```hcl
# Unsafe Database configuration
resource "aws_db_instance" "vulnerable_db" {
  identifier        = "dev-postgres-db"
  allocated_storage = 10
  engine            = "postgres"
  instance_class    = "db.t3.micro"
  db_name           = "dev_app"
  username          = "root"
  password          = "Password123!" # ERROR 1: Hardcoded credentials in plaintext

  # ERROR 2: Single availability zone deployment (single point of failure)
  multi_az          = false 

  # ERROR 3: Exposing the database directly to the public internet
  publicly_accessible = true 

  # ERROR 4: Disabling storage encryption at rest
  storage_encrypted   = false 

  # ERROR 5: Disabling backups (0 retention period)
  backup_retention_period = 0 

  # ERROR 6: Disabled deletion protection - vulnerable to accidental run deletes
  deletion_protection     = false
  skip_final_snapshot     = true
}
```

Why this fails: Hardcodes credentials in plain text, runs on a single zone, exposes the instance to the public internet, disables storage encryption, sets backup retention to 0, and disables deletion protection.

---

## Failure Modes

- **The Accidental Destroy Crash:** Running `terraform destroy` or clicking a console button that deletes a database because deletion protection was disabled.
- **The Datacenter Blackout:** Running a single-AZ database that goes offline when a physical server hosting the instance crashes.
- **The Disk Exhaustion Outage:** Disabling storage auto-scaling, causing the database to run out of disk space and halt transactions.
- **Untested Backup Restore:** Backup berhasil setiap malam tapi restore gak pernah di-test → bencana hari = ketahuan backup corrupt atau encryption key hilang.
- **Over-Permissioned IAM Role:** Production app IAM punya `rds:*` permission — credential compromise = attacker bisa drop database, bukan cuma read data.
- **Replication Lag Silent Drift:** Read replica lag tumbuh dari ms ke minutes karena schema change heavy — monitoring gak alert, user lihat data stale.

## Validation

Audit cloud DB admin terhadap protection, backup, IAM, dan multi-AZ:

1. **Deletion protection enabled di production:**
   ```bash
   grep -rnE "deletion_protection\s*=\s*true" terraform/ infra/prod/ 2>/dev/null
   # expected: minimum 1 match per production DB resource block.
   ```
2. **Backup retention ≥ 7 hari:**
   ```bash
   grep -rnE "backup_retention_period\s*=\s*([7-9]|[1-9][0-9]+)" terraform/
   # expected: angka >= 7. Compliance audit minimum 30 (SOC2/PCI).
   ```
3. **Test restore (quarterly drill):**
   ```bash
   ls -la backup-restore-tests/ | head -5
   # expected: ada log restore drill dalam 90 hari terakhir. Backup tanpa restore test = false security.
   ```
4. **IAM least-privilege (no wildcard `rds:*`):**
   ```bash
   grep -rnE "rds:\*|\"rds:Delete|\"rds:Drop" terraform/iam/ infra/iam/ 2>/dev/null
   # expected: zero matches. App role wajib granular: rds:Connect, rds-db:connect saja.
   ```
5. **Multi-AZ verify untuk production:**
   ```bash
   grep -rnE "multi_az\s*=\s*true" terraform/prod/ 2>/dev/null
   # expected: ≥1 match. Single-AZ = SLA gak achievable.
   ```

## Sub-Agent Propagation

Saat menginstruksikan sub-agen untuk melakukan deployment database:

> "Use the skill `database-admin`. Read `.agent/skills/database-admin/SKILL.md` before coding. Never deploy publicly accessible databases, disable encryption, or set backup retention periods to 0. Always enable deletion protection, configure Multi-AZ deployments, and manage resources via Terraform configuration scripts."

## Related

- [database](../database/SKILL.md) — Transactional SQL migrations.
- [database-design](../database-design/SKILL.md) — Schema architecture rules.
- [postgres-best-practices](../postgres-best-practices/SKILL.md) — Database optimization.
