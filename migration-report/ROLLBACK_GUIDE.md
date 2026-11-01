# Nakoda Store / ShopEase — Safe Rollback Procedure

## Overview
This rollback procedure outlines the exact steps to revert the repository, dependencies, and build configuration back to the original Next.js 14 baseline if unexpected production issues occur.

---

## 1. Git Rollback Procedure

All migration work was performed on a dedicated branch: `next16-upgrade`.

To revert back to the pre-migration baseline on `main`:

```bash
# 1. Ensure working directory has no unstaged experimental changes
git checkout main

# 2. Verify that main is at the pre-migration commit
git log -n 1 --oneline
# Expected output: 08e8d7b testing updates
```

---

## 2. Dependency & Lockfile Restoration

Backup copies of the original `package.json` and `package-lock.json` were preserved at the project root (`package.json.backup` and `package-lock.json.backup`).

To restore them:

```bash
# 1. Restore baseline package definitions
cp package.json.backup package.json
cp package-lock.json.backup package-lock.json

# 2. Clean install original dependencies
npm ci
```

---

## 3. Configuration & Middleware Restoration

If reverting files manually on the current branch:

1. **Delete Next.js 16 Proxy:**
   ```bash
   rm src/proxy.js
   ```
2. **Restore Next.js 14 Middleware:**
   Restore `src/middleware.js` using Git:
   ```bash
   git checkout main -- src/middleware.js
   ```
3. **Restore `next.config.js`:**
   ```bash
   git checkout main -- next.config.js
   ```

---

## 4. Database & Production Data Safety Notice

* **Zero Schema Migrations:** No destructive database migrations or schema alterations were performed during this migration.
* **Storage Safety:** Both MongoDB collections and the fallback `src/data/db.json` store remain completely compatible with both Next.js 14 and Next.js 16.
* **Customer Data Integrity:** Customer accounts, orders, reviews, and inquiries require no rollback actions.

