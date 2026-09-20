import * as XLSX from 'xlsx';
import {
  PRODUCT_SCHEMA_FIELDS,
  autoDetectColumnMapping,
  validateBulkDataset,
} from '../lib/productImport';

/**
 * Validates file format and size for Excel/CSV bulk import.
 * @param {File} file
 * @returns {{ valid: boolean, error?: string, sizeStr?: string }}
 */
export function validateImportFile(file) {
  if (!file) return { valid: false, error: 'No file selected.' };

  const validExtensions = ['.xlsx', '.xls', '.csv'];
  const name = file.name || '';
  const ext = '.' + name.split('.').pop().toLowerCase();

  if (!validExtensions.includes(ext)) {
    return {
      valid: false,
      error: 'Unsupported file format. Please upload an Excel (.xlsx, .xls) or CSV (.csv) file.',
    };
  }

  const MAX_SIZE = 25 * 1024 * 1024; // 25MB
  if (file.size > MAX_SIZE) {
    return {
      valid: false,
      error: 'File size exceeds 25MB limit. Please upload a smaller file.',
    };
  }

  const sizeStr = file.size > 1024 * 1024
    ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
    : `${Math.round(file.size / 1024)} KB`;

  return { valid: true, sizeStr };
}

/**
 * Parses a raw spreadsheet ArrayBuffer into an XLSX workbook.
 * @param {ArrayBuffer} arrayBuffer
 * @returns {{ workbook: any, sheetNames: string[] }}
 */
export function parseSpreadsheetBuffer(arrayBuffer) {
  const data = new Uint8Array(arrayBuffer);
  const wb = XLSX.read(data, { type: 'array' });
  return {
    workbook: wb,
    sheetNames: wb.SheetNames || [],
  };
}

/**
 * Extracts header row, non-empty data rows, and auto-detects column mapping.
 * @param {any} workbook
 * @param {number} sheetIdx
 * @returns {{ headers: string[], rows: any[][], mapping: Record<string, number>, error?: string }}
 */
export function extractSheetData(workbook, sheetIdx = 0) {
  if (!workbook || !workbook.SheetNames || !workbook.SheetNames[sheetIdx]) {
    return { headers: [], rows: [], mapping: {}, error: 'Sheet not found in workbook.' };
  }

  const sheetName = workbook.SheetNames[sheetIdx];
  const sheet = workbook.Sheets[sheetName];
  const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });

  if (!jsonData || jsonData.length < 2) {
    return {
      headers: [],
      rows: [],
      mapping: {},
      error: 'The selected sheet must contain a header row and at least one product row.',
    };
  }

  const headerRow = jsonData[0].map((h) => String(h).trim());
  const dataRows = jsonData
    .slice(1)
    .filter((row) => row.some((cell) => cell !== '' && cell !== null && cell !== undefined));

  if (dataRows.length === 0) {
    return {
      headers: headerRow,
      rows: [],
      mapping: {},
      error: 'No product data rows found in the selected sheet.',
    };
  }

  const detectedMapping = autoDetectColumnMapping(headerRow);

  return {
    headers: headerRow,
    rows: dataRows,
    mapping: detectedMapping,
  };
}

/**
 * Runs bulk dataset validation across raw rows with the configured column mapping.
 * @param {any[][]} rawRows
 * @param {Record<string, number>} columnMapping
 * @param {string[]} validCategories
 * @param {string} duplicateMode
 * @returns {any}
 */
export function runDatasetValidation(rawRows, columnMapping, validCategories = [], duplicateMode = 'skip') {
  return validateBulkDataset(rawRows, columnMapping, validCategories, duplicateMode);
}

/**
 * Dispatches bulk import in batches to /api/products/import.
 * @param {Object} options
 * @param {any[]} options.products - Validated product payloads
 * @param {string} options.duplicateMode
 * @param {string} options.importMode
 * @param {Function} [options.onProgress] - (percent, current, total) => void
 * @returns {Promise<Object>} Aggregate summary report
 */
export async function executeBatchImport({
  products = [],
  duplicateMode = 'skip',
  importMode = 'create',
  onProgress,
}) {
  if (!products.length) {
    return { total: 0, inserted: 0, updated: 0, skipped: 0, failed: 0, errors: [] };
  }

  const BATCH_SIZE = 500;
  const total = products.length;
  let inserted = 0;
  let updated = 0;
  let skipped = 0;
  let failed = 0;
  const errors = [];

  for (let i = 0; i < total; i += BATCH_SIZE) {
    const batch = products.slice(i, i + BATCH_SIZE);
    try {
      const res = await fetch('/api/products/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          products: batch,
          duplicateMode,
          importMode,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        inserted += data.inserted || 0;
        updated += data.updated || 0;
        skipped += data.skipped || 0;
        failed += data.failed || 0;
        if (Array.isArray(data.errors)) {
          errors.push(...data.errors);
        }
      } else {
        failed += batch.length;
        errors.push({
          row: i + 1,
          productId: batch[0]?.id || `Batch ${Math.floor(i / BATCH_SIZE) + 1}`,
          error: data.error || 'Batch import failed',
        });
      }
    } catch (err) {
      failed += batch.length;
      errors.push({
        row: i + 1,
        productId: batch[0]?.id || `Batch ${Math.floor(i / BATCH_SIZE) + 1}`,
        error: err.message || 'Network error during batch import',
      });
    }

    const currentCount = Math.min(i + BATCH_SIZE, total);
    if (typeof onProgress === 'function') {
      onProgress(Math.round((currentCount / total) * 100), currentCount, total);
    }
  }

  return {
    total,
    inserted,
    updated,
    skipped,
    failed,
    errors,
  };
}
