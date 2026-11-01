# Nakoda Store / ShopEase — Prioritized Unresolved Issues & Recommendations

## Priority Assessment Matrix

| Priority | Issue Description | Impact | Recommended Resolution |
| :--- | :--- | :--- | :--- |
| **Medium** | `xlsx@0.18.5` prototype pollution & ReDoS advisories | The `xlsx` package is used in `src/utils/excelImportCore.js` and `src/utils/excelTemplate.js` for admin bulk import. While reachable only via admin functions, upstream `xlsx` is unpatched on npm. | Migrate spreadsheet generation and parsing completely to `exceljs` (which is already installed in `package.json` at `^4.4.0` and actively maintained). |
| **Low** | Indirect transitive dependency `brace-expansion` (via `archiver`) | Low severity CPU recursion in deeply nested brace syntax. | Will automatically resolve when upstream `archiver` updates its dependency tree. |
| **Low** | Legacy `package.json.backup` and `package-lock.json.backup` files | Clutters root directory if retained permanently. | Remove backups once the migration branch is tested and merged into `main`. |
