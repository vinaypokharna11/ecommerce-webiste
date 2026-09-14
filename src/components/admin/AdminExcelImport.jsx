'use client';

import React, { useState, useCallback, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as XLSX from 'xlsx';
import {
  FileSpreadsheet,
  Upload,
  ArrowRight,
  ArrowLeft,
  Check,
  X,
  AlertCircle,
  Download,
  Columns3,
  Eye,
  Loader2,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Info,
  SlidersHorizontal,
  ShieldCheck,
  ChevronRight,
  ChevronLeft,
  FileCheck2,
} from 'lucide-react';
import { useCatalog } from '../../context/CatalogContext';
import {
  PRODUCT_SCHEMA_FIELDS,
  autoDetectColumnMapping,
  validateBulkDataset,
} from '../../lib/productImport';
import {
  generateProductImportTemplate,
  generateErrorReportFile,
} from '../../utils/excelTemplate';

const STEPS = [
  { id: 'upload', label: 'Upload File', icon: Upload },
  { id: 'mapping', label: 'Map Columns', icon: Columns3 },
  { id: 'settings', label: 'Import Mode', icon: SlidersHorizontal },
  { id: 'preview', label: 'Preview & Validate', icon: Eye },
  { id: 'importing', label: 'Import Progress', icon: RefreshCw },
  { id: 'report', label: 'Summary Report', icon: FileCheck2 },
];

export const AdminExcelImport = () => {
  const { categories, refreshCatalog } = useCatalog();
  const fileInputRef = useRef(null);

  // Workflow State
  const [currentStep, setCurrentStep] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [parseError, setParseError] = useState('');

  // File State
  const [fileName, setFileName] = useState('');
  const [fileSizeStr, setFileSizeStr] = useState('');
  const [sheetNames, setSheetNames] = useState([]);
  const [selectedSheet, setSelectedSheet] = useState(0);
  const [workbook, setWorkbook] = useState(null);
  const [headers, setHeaders] = useState([]);
  const [rawRows, setRawRows] = useState([]);

  // Mapping State
  const [columnMapping, setColumnMapping] = useState({});

  // Settings State
  const [duplicateMode, setDuplicateMode] = useState('skip');
  const [importMode, setImportMode] = useState('create');

  // Validation State
  const [isValidating, setIsValidating] = useState(false);
  const [previewProducts, setPreviewProducts] = useState([]);
  const [previewMetrics, setPreviewMetrics] = useState({ total: 0, valid: 0, invalid: 0, warnings: 0, duplicates: 0 });
  const [allErrorsList, setAllErrorsList] = useState([]);
  const [excludedRowIndices, setExcludedRowIndices] = useState(new Set());
  const [filterTab, setFilterTab] = useState('all');

  // Import Progress & Report
  const [importProgress, setImportProgress] = useState({ percent: 0, current: 0, total: 0 });
  const [importReport, setImportReport] = useState({ total: 0, inserted: 0, updated: 0, skipped: 0, failed: 0, errors: [] });
  const [showFailedOnly, setShowFailedOnly] = useState(false);

  const getAuthToken = useCallback(() => {
    if (typeof window === 'undefined') return null;
    return (
      localStorage.getItem('nakoda_admin_token') ||
      localStorage.getItem('shopease_admin_token')
    );
  }, []);

  // ── Step 1: File Upload & Parse ──
  const processSheetData = useCallback((wb, sheetIdx) => {
    const sheet = wb.Sheets[wb.SheetNames[sheetIdx]];
    const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });

    if (!jsonData || jsonData.length < 2) {
      setParseError('The selected sheet must contain a header row and at least one product row.');
      return;
    }

    const headerRow = jsonData[0].map((h) => String(h).trim());
    const dataRows = jsonData.slice(1).filter((row) => row.some((cell) => cell !== '' && cell !== null && cell !== undefined));

    if (dataRows.length === 0) {
      setParseError('No product data rows found in the selected sheet.');
      return;
    }

    setHeaders(headerRow);
    setRawRows(dataRows);
    setParseError('');

    const detected = autoDetectColumnMapping(headerRow);
    setColumnMapping(detected);
  }, []);

  const handleFileSelect = useCallback((file) => {
    if (!file) return;

    const validExtensions = ['.xlsx', '.xls', '.csv'];
    const name = file.name || '';
    const ext = '.' + name.split('.').pop().toLowerCase();

    if (!validExtensions.includes(ext)) {
      setParseError('Unsupported file format. Please upload an Excel (.xlsx, .xls) or CSV (.csv) file.');
      return;
    }

    if (file.size > 25 * 1024 * 1024) {
      setParseError('File size exceeds 25MB limit. Please upload a smaller file.');
      return;
    }

    setParseError('');
    setFileName(file.name);
    setFileSizeStr(
      file.size > 1024 * 1024
        ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
        : `${Math.round(file.size / 1024)} KB`
    );

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const wb = XLSX.read(data, { type: 'array' });
        setWorkbook(wb);
        setSheetNames(wb.SheetNames);
        setSelectedSheet(0);
        processSheetData(wb, 0);
      } catch (err) {
        setParseError('Failed to parse spreadsheet. Ensure it is a valid, uncorrupted Excel or CSV file.');
      }
    };
    reader.readAsArrayBuffer(file);
  }, [processSheetData]);

  // ── Step 2: Column Mapping ──
  const updateMapping = (fieldKey, columnIndex) => {
    setColumnMapping((prev) => {
      const next = { ...prev };
      if (columnIndex === -1) {
        delete next[fieldKey];
      } else {
        next[fieldKey] = columnIndex;
      }
      return next;
    });
  };

  const requiredFieldsMapped = useMemo(() => {
    return PRODUCT_SCHEMA_FIELDS.filter((f) => f.required).every(
      (f) => columnMapping[f.key] !== undefined && columnMapping[f.key] >= 0
    );
  }, [columnMapping]);

  const unmappedColumns = useMemo(() => {
    const mappedIndices = new Set(Object.values(columnMapping));
    return headers
      .map((headerName, index) => ({ name: headerName, index }))
      .filter((col) => !mappedIndices.has(col.index));
  }, [headers, columnMapping]);

  // ── Step 3 & 4: Validation & Preview ──
  const runValidation = useCallback(async () => {
    setIsValidating(true);
    setParseError('');

    try {
      const token = getAuthToken();
      const response = await fetch('/api/products/import/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          rows: rawRows,
          mapping: columnMapping,
          duplicateMode,
          importMode,
        }),
      });

      const data = await response.json();

      if (data.success && data.validation) {
        setPreviewProducts(data.validation.products || []);
        setPreviewMetrics(data.validation.metrics || {});
        setAllErrorsList(data.validation.errorsList || []);
        setExcludedRowIndices(new Set());
      } else {
        const localValidation = validateBulkDataset({
          dataRows: rawRows,
          mapping: columnMapping,
          categories: categories || [],
          dbExistingIds: new Set(),
          duplicateMode,
          importMode,
        });
        setPreviewProducts(localValidation.products);
        setPreviewMetrics(localValidation.metrics);
        setAllErrorsList(localValidation.errorsList);
        setExcludedRowIndices(new Set());
      }
    } catch (err) {
      const localValidation = validateBulkDataset({
        dataRows: rawRows,
        mapping: columnMapping,
        categories: categories || [],
        dbExistingIds: new Set(),
        duplicateMode,
        importMode,
      });
      setPreviewProducts(localValidation.products);
      setPreviewMetrics(localValidation.metrics);
      setAllErrorsList(localValidation.errorsList);
      setExcludedRowIndices(new Set());
    } finally {
      setIsValidating(false);
      setCurrentStep(3);
    }
  }, [rawRows, columnMapping, duplicateMode, importMode, categories, getAuthToken]);

  const toggleExcludeRow = (rowIdx) => {
    setExcludedRowIndices((prev) => {
      const next = new Set(prev);
      if (next.has(rowIdx)) {
        next.delete(rowIdx);
      } else {
        next.add(rowIdx);
      }
      return next;
    });
  };

  const handleToggleSelectAll = () => {
    if (excludedRowIndices.size === previewProducts.length) {
      setExcludedRowIndices(new Set());
    } else {
      setExcludedRowIndices(new Set(previewProducts.map((p) => p._rowIndex)));
    }
  };

  const filteredPreviewRows = useMemo(() => {
    return previewProducts.filter((p) => {
      if (filterTab === 'valid') return p._isValid;
      if (filterTab === 'invalid') return !p._isValid;
      if (filterTab === 'warnings') return p._warnings && p._warnings.length > 0;
      if (filterTab === 'duplicates') return p._isDuplicate;
      return true;
    });
  }, [previewProducts, filterTab]);

  const activeProductsToImport = useMemo(() => {
    return previewProducts.filter(
      (p) => !excludedRowIndices.has(p._rowIndex) && p._isValid
    );
  }, [previewProducts, excludedRowIndices]);

  // ── Step 5: Execute Batch Import ──
  const startBulkImport = useCallback(async () => {
    if (activeProductsToImport.length === 0) return;

    setCurrentStep(4);
    setImportProgress({ percent: 5, current: 0, total: activeProductsToImport.length });

    const token = getAuthToken();
    const batchSize = 100;
    const total = activeProductsToImport.length;

    let overallInserted = 0;
    let overallUpdated = 0;
    let overallSkipped = 0;
    let overallFailed = 0;
    const overallErrors = [];

    try {
      for (let i = 0; i < total; i += batchSize) {
        const chunk = activeProductsToImport.slice(i, i + batchSize);
        const res = await fetch('/api/products/import', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({
            products: chunk,
            duplicateMode,
            importMode,
          }),
        });

        const result = await res.json();

        if (result.success) {
          overallInserted += result.inserted || 0;
          overallUpdated += result.updated || 0;
          overallSkipped += result.skipped || 0;
          overallFailed += result.failed || 0;
          if (Array.isArray(result.errors)) {
            overallErrors.push(...result.errors);
          }
        } else {
          overallFailed += chunk.length;
          overallErrors.push({
            row: `Batch ${Math.floor(i / batchSize) + 1}`,
            product: `${chunk.length} items`,
            error: result.error || 'Server rejected batch',
          });
        }

        const processed = Math.min(i + batchSize, total);
        const percent = Math.round((processed / total) * 100);
        setImportProgress({ percent, current: processed, total });
      }

      setImportReport({
        total,
        inserted: overallInserted,
        updated: overallUpdated,
        skipped: overallSkipped,
        failed: overallFailed,
        errors: overallErrors,
      });

      if (refreshCatalog) {
        await refreshCatalog();
      }

      setCurrentStep(5);
    } catch (err) {
      setImportReport({
        total,
        inserted: overallInserted,
        updated: overallUpdated,
        skipped: overallSkipped,
        failed: overallFailed + (total - (overallInserted + overallUpdated + overallSkipped)),
        errors: [...overallErrors, { row: 'System', product: 'Import Engine', error: err.message }],
      });
      setCurrentStep(5);
    }
  }, [activeProductsToImport, duplicateMode, importMode, getAuthToken, refreshCatalog]);

  const resetAll = () => {
    setCurrentStep(0);
    setFileName('');
    setFileSizeStr('');
    setSheetNames([]);
    setSelectedSheet(0);
    setWorkbook(null);
    setHeaders([]);
    setRawRows([]);
    setColumnMapping({});
    setDuplicateMode('skip');
    setImportMode('create');
    setPreviewProducts([]);
    setPreviewMetrics({ total: 0, valid: 0, invalid: 0, warnings: 0, duplicates: 0 });
    setAllErrorsList([]);
    setExcludedRowIndices(new Set());
    setFilterTab('all');
    setImportProgress({ percent: 0, current: 0, total: 0 });
    setImportReport({ total: 0, inserted: 0, updated: 0, skipped: 0, failed: 0, errors: [] });
    setParseError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-6 font-sans">
      <h1 className="sr-only">Excel & CSV Bulk Product Import</h1>

      {/* ── Main Container Card ── */}
      <div className="bg-white rounded-[28px] border border-black/10 shadow-[0_4px_20px_rgba(0,0,0,0.02)] overflow-hidden">
        {/* Card Header */}
        <div className="p-5 sm:p-6 border-b border-black/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#F3FCDA] flex items-center justify-center text-[#709E1E] border border-[#9FD842]/30">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-[#171717] tracking-tight">
                Bulk Product Import
              </h2>
              <p className="text-xs text-[#777777]">
                Import products in bulk from Excel (.xlsx, .xls) or CSV files
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => generateProductImportTemplate(categories)}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-full bg-[#F5F5F5] hover:bg-[#EBEBEB] text-[#171717] font-extrabold text-xs border border-black/5 transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-[#709E1E]" />
              <span>Download Template</span>
            </button>
          </div>
        </div>

        {/* Stepper Header */}
        <div className="px-6 py-3 bg-[#FAFAFA] border-b border-black/5 overflow-x-auto">
          <div className="flex items-center justify-between min-w-[500px]">
            {STEPS.map((step, idx) => {
              const Icon = step.icon;
              const isPassed = currentStep > idx;
              const isCurrent = currentStep === idx;
              return (
                <div key={step.id} className="flex items-center gap-2">
                  <div
                    className={`flex items-center gap-1.5 text-xs font-extrabold px-3 py-1 rounded-full transition-all ${
                      isPassed
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : isCurrent
                        ? 'bg-[#171717] text-white shadow-sm'
                        : 'bg-black/5 text-[#999999]'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{step.label}</span>
                  </div>
                  {idx < STEPS.length - 1 && (
                    <ChevronRight className="w-3.5 h-3.5 text-black/20" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Card Body */}
        <div className="p-6">
          {/* STEP 0: Upload */}
          {currentStep === 0 && (
            <div className="space-y-6 max-w-3xl mx-auto">
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={(e) => {
                  e.preventDefault();
                  setIsDragging(false);
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragging(false);
                  if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                    handleFileSelect(e.dataTransfer.files[0]);
                  }
                }}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-[24px] p-8 sm:p-12 text-center cursor-pointer transition-all ${
                  isDragging
                    ? 'border-[#9FD842] bg-[#F3FCDA]/30 scale-[0.99]'
                    : 'border-black/15 hover:border-black/30 hover:bg-[#FAFAFA]'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={(e) => handleFileSelect(e.target.files[0])}
                  className="hidden"
                />

                <div className="w-16 h-16 mx-auto rounded-3xl bg-[#F5F5F5] flex items-center justify-center text-[#171717] mb-4 shadow-inner">
                  <Upload className="w-7 h-7 text-[#777777]" />
                </div>

                <h3 className="text-base sm:text-lg font-extrabold text-[#171717] mb-1">
                  Drag & Drop your CSV or Excel file here
                </h3>
                <p className="text-xs sm:text-sm text-[#777777] mb-4">
                  Supports .xlsx, .xls, and .csv formats
                </p>

                <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-[#171717] hover:bg-black text-white text-xs font-extrabold shadow-sm transition-all">
                  <span>Browse Computer</span>
                </div>

                <div className="mt-4 flex items-center justify-center gap-3 text-[11px] text-[#999999]">
                  <span className="inline-flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    Recommended: up to 10 MB or 5,000 products per file
                  </span>
                </div>
              </div>

              {fileName && (
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700">
                      <FileSpreadsheet className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-extrabold text-emerald-900">{fileName}</p>
                      <p className="text-[11px] text-emerald-700">
                        {fileSizeStr} • {rawRows.length} product rows detected • {headers.length} columns
                      </p>
                    </div>
                  </div>

                  {sheetNames.length > 1 && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-emerald-900">Sheet:</span>
                      <select
                        value={selectedSheet}
                        onChange={(e) => {
                          const idx = Number(e.target.value);
                          setSelectedSheet(idx);
                          processSheetData(workbook, idx);
                        }}
                        className="text-xs font-bold px-3 py-1.5 rounded-lg bg-white border border-emerald-300 text-emerald-900"
                      >
                        {sheetNames.map((name, idx) => (
                          <option key={name} value={idx}>
                            {name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              )}

              {parseError && (
                <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-3">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <p className="text-xs font-bold text-rose-700">{parseError}</p>
                </div>
              )}
            </div>
          )}

          {/* STEP 1: Header Mapping */}
          {currentStep === 1 && (
            <div className="space-y-5">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm font-extrabold text-[#171717]">
                    Match Spreadsheet Columns to Product Fields
                  </h3>
                  <p className="text-xs text-[#777777]">
                    Review column mappings and adjust destinations if needed.
                  </p>
                </div>
                <span
                  className={`text-xs font-bold px-3 py-1 rounded-full ${
                    requiredFieldsMapped
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-amber-50 text-amber-700 border border-amber-200'
                  }`}
                >
                  {requiredFieldsMapped ? '✓ Required fields mapped' : '⚠️ Required fields missing'}
                </span>
              </div>

              {unmappedColumns.length > 0 && (
                <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200/80 flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div className="text-xs">
                    <span className="font-extrabold text-amber-900">
                      {unmappedColumns.length} columns are unmapped:
                    </span>{' '}
                    <span className="text-amber-800">
                      {unmappedColumns.map((c) => `"${c.name}"`).join(', ')}.
                    </span>
                  </div>
                </div>
              )}

              <div className="border border-black/10 rounded-2xl overflow-hidden shadow-sm">
                <div className="bg-[#FAFAFA] border-b border-black/10 px-4 py-2.5 grid grid-cols-12 gap-3 text-[11px] font-extrabold text-[#777777] uppercase tracking-wider">
                  <div className="col-span-5 sm:col-span-4">Product Field</div>
                  <div className="col-span-2 hidden sm:block">Status</div>
                  <div className="col-span-7 sm:col-span-6">Excel Column Source</div>
                </div>

                <div className="divide-y divide-black/5 max-h-[400px] overflow-y-auto">
                  {PRODUCT_SCHEMA_FIELDS.map((field) => {
                    const isMapped = columnMapping[field.key] !== undefined && columnMapping[field.key] >= 0;
                    const mappedColIdx = columnMapping[field.key];
                    const sampleValue = isMapped && rawRows[0] ? rawRows[0][mappedColIdx] : '';

                    return (
                      <div
                        key={field.key}
                        className="px-4 py-2.5 grid grid-cols-12 gap-3 items-center hover:bg-black/[0.01] transition-colors"
                      >
                        <div className="col-span-5 sm:col-span-4">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-[#171717]">{field.label}</span>
                            {field.required && (
                              <span className="text-[10px] font-bold text-rose-500 bg-rose-50 px-1.5 py-0.2 rounded border border-rose-200">
                                Required
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-[#888888] line-clamp-1">{field.description}</span>
                        </div>

                        <div className="col-span-2 hidden sm:flex items-center">
                          {isMapped ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                              <Check className="w-3 h-3" /> Mapped
                            </span>
                          ) : field.required ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full">
                              Missing
                            </span>
                          ) : (
                            <span className="text-[11px] text-[#999999]">Optional</span>
                          )}
                        </div>

                        <div className="col-span-7 sm:col-span-6 space-y-1">
                          <select
                            value={isMapped ? mappedColIdx : -1}
                            onChange={(e) => updateMapping(field.key, Number(e.target.value))}
                            className={`w-full text-xs font-semibold px-3 py-1.5 rounded-xl border transition-all ${
                              isMapped
                                ? 'border-emerald-300 bg-emerald-50/40 text-emerald-950 font-bold'
                                : field.required
                                ? 'border-rose-300 bg-rose-50/30 text-[#171717]'
                                : 'border-black/15 bg-white text-[#555555]'
                            }`}
                          >
                            <option value={-1}>-- Do Not Import / Ignored --</option>
                            {headers.map((h, hIdx) => (
                              <option key={hIdx} value={hIdx}>
                                Column: "{h || `Col ${hIdx + 1}`}"
                              </option>
                            ))}
                          </select>

                          {isMapped && sampleValue !== '' && sampleValue !== undefined && (
                            <p className="text-[10px] text-[#777777] truncate px-1">
                              Sample: <span className="text-[#171717] font-mono">{String(sampleValue).slice(0, 45)}</span>
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Settings */}
          {currentStep === 2 && (
            <div className="space-y-6 max-w-3xl mx-auto">
              <div>
                <h3 className="text-sm font-extrabold text-[#171717] mb-0.5">
                  Configure Import & Duplicate Rules
                </h3>
                <p className="text-xs text-[#777777]">
                  Define how existing products and duplicate identifier collisions should be handled.
                </p>
              </div>

              <div className="space-y-2.5">
                <label className="text-xs font-extrabold text-[#171717] uppercase tracking-wider block">
                  1. Import Mode
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { id: 'create', title: 'Create New Products', desc: 'Add new items only. Matching existing database IDs are skipped.' },
                    { id: 'update', title: 'Update Existing', desc: 'Update existing products based on Product ID. Non-existent IDs skipped.' },
                    { id: 'upsert', title: 'Create + Update', desc: 'Update items if ID exists in database, otherwise create new.' },
                  ].map((mode) => (
                    <div
                      key={mode.id}
                      onClick={() => setImportMode(mode.id)}
                      className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                        importMode === mode.id
                          ? 'border-[#171717] bg-[#F5F5F5] shadow-sm'
                          : 'border-black/10 hover:border-black/20 bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1.5">
                        <input
                          type="radio"
                          name="importModePage"
                          checked={importMode === mode.id}
                          onChange={() => setImportMode(mode.id)}
                          className="text-[#171717] focus:ring-0"
                        />
                        <span className="text-xs font-extrabold text-[#171717]">{mode.title}</span>
                      </div>
                      <p className="text-[11px] text-[#777777] leading-relaxed pl-5">{mode.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2.5">
                <label className="text-xs font-extrabold text-[#171717] uppercase tracking-wider block">
                  2. Duplicate Product ID Collision Handling
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { id: 'skip', title: 'Skip Duplicates (Default)', desc: 'Do not overwrite existing items. Safe & protects catalog data.' },
                    { id: 'update', title: 'Update Existing Products', desc: 'Overwrite existing catalog data with values from spreadsheet.' },
                    { id: 'generate_id', title: 'Create With New IDs', desc: 'Auto-generate fresh unique IDs (prod-...) to avoid collisions.' },
                  ].map((dup) => (
                    <div
                      key={dup.id}
                      onClick={() => setDuplicateMode(dup.id)}
                      className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                        duplicateMode === dup.id
                          ? 'border-[#9FD842] bg-[#F3FCDA]/30 shadow-sm'
                          : 'border-black/10 hover:border-black/20 bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1.5">
                        <input
                          type="radio"
                          name="duplicateModePage"
                          checked={duplicateMode === dup.id}
                          onChange={() => setDuplicateMode(dup.id)}
                          className="text-[#709E1E] focus:ring-0"
                        />
                        <span className="text-xs font-extrabold text-[#171717]">{dup.title}</span>
                      </div>
                      <p className="text-[11px] text-[#777777] leading-relaxed pl-5">{dup.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Preview */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                <div className="p-3 rounded-2xl bg-[#FAFAFA] border border-black/10 text-center">
                  <span className="text-[10px] font-extrabold text-[#777777] uppercase">Total</span>
                  <p className="text-lg font-extrabold text-[#171717]">{previewMetrics.total}</p>
                </div>
                <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-center">
                  <span className="text-[10px] font-extrabold text-emerald-700 uppercase">Valid</span>
                  <p className="text-lg font-extrabold text-emerald-800">{previewMetrics.valid}</p>
                </div>
                <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-center">
                  <span className="text-[10px] font-extrabold text-rose-700 uppercase">Errors</span>
                  <p className="text-lg font-extrabold text-rose-800">{previewMetrics.invalid}</p>
                </div>
                <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-center">
                  <span className="text-[10px] font-extrabold text-amber-700 uppercase">Warnings</span>
                  <p className="text-lg font-extrabold text-amber-800">{previewMetrics.warnings}</p>
                </div>
                <div className="p-3 rounded-2xl bg-blue-50 border border-blue-200 text-center col-span-2 sm:col-span-1">
                  <span className="text-[10px] font-extrabold text-blue-700 uppercase">Duplicates</span>
                  <p className="text-lg font-extrabold text-blue-800">{previewMetrics.duplicates}</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-1.5 flex-wrap">
                  {[
                    { id: 'all', label: `All (${previewProducts.length})` },
                    { id: 'valid', label: `Valid (${previewMetrics.valid})` },
                    { id: 'invalid', label: `Errors (${previewMetrics.invalid})` },
                    { id: 'warnings', label: `Warnings (${previewMetrics.warnings})` },
                    { id: 'duplicates', label: `Duplicates (${previewMetrics.duplicates})` },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setFilterTab(tab.id)}
                      className={`text-xs font-bold px-3 py-1 rounded-full transition-all cursor-pointer ${
                        filterTab === tab.id
                          ? 'bg-[#171717] text-white shadow-sm'
                          : 'bg-black/5 hover:bg-black/10 text-[#555555]'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {allErrorsList.length > 0 && (
                  <button
                    type="button"
                    onClick={() => generateErrorReportFile(allErrorsList)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs border border-rose-200 transition-all cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Error Report ({allErrorsList.length})</span>
                  </button>
                )}
              </div>

              <div className="border border-black/10 rounded-2xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto max-h-[380px]">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-[#FAFAFA] border-b border-black/10 sticky top-0 z-10 text-[11px] font-extrabold text-[#777777] uppercase tracking-wider">
                      <tr>
                        <th className="py-2.5 px-3 w-10 text-center">
                          <input
                            type="checkbox"
                            checked={excludedRowIndices.size === 0 && previewProducts.length > 0}
                            onChange={handleToggleSelectAll}
                            className="rounded text-[#171717] focus:ring-0 cursor-pointer"
                            title="Select/Deselect All"
                          />
                        </th>
                        <th className="py-2.5 px-3 w-14">Row</th>
                        <th className="py-2.5 px-3">Product Name</th>
                        <th className="py-2.5 px-3">Category</th>
                        <th className="py-2.5 px-3">Price</th>
                        <th className="py-2.5 px-3">Stock</th>
                        <th className="py-2.5 px-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-black/5 text-xs">
                      {filteredPreviewRows.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="py-8 text-center text-[#777777]">
                            No products found in this filter.
                          </td>
                        </tr>
                      ) : (
                        filteredPreviewRows.map((p) => {
                          const isExcluded = excludedRowIndices.has(p._rowIndex);
                          const hasErrors = !p._isValid;
                          const hasWarnings = p._warnings && p._warnings.length > 0;

                          return (
                            <tr
                              key={p._rowIndex}
                              className={`transition-colors ${
                                isExcluded
                                  ? 'opacity-40 bg-gray-50'
                                  : hasErrors
                                  ? 'bg-rose-50/20 hover:bg-rose-50/40'
                                  : 'hover:bg-black/[0.01]'
                              }`}
                            >
                              <td className="py-2.5 px-3 text-center">
                                <input
                                  type="checkbox"
                                  checked={!isExcluded}
                                  onChange={() => toggleExcludeRow(p._rowIndex)}
                                  disabled={hasErrors}
                                  className="rounded text-[#171717] focus:ring-0 cursor-pointer disabled:opacity-40"
                                />
                              </td>
                              <td className="py-2.5 px-3 font-mono text-[11px] text-[#777777]">
                                #{p._rowIndex + 2}
                              </td>
                              <td className="py-2.5 px-3">
                                <div className="flex items-center gap-2.5">
                                  {p.image ? (
                                    <img
                                      src={p.image}
                                      alt={p.name || 'product'}
                                      className="w-7 h-7 rounded-lg object-cover border border-black/10 shrink-0"
                                      onError={(e) => {
                                        e.target.style.display = 'none';
                                      }}
                                    />
                                  ) : (
                                    <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center text-[10px] text-gray-400 shrink-0">
                                      No img
                                    </div>
                                  )}
                                  <span className="font-bold text-[#171717] truncate max-w-[220px]">
                                    {p.name || <span className="text-rose-500 italic">Name missing</span>}
                                  </span>
                                </div>
                              </td>
                              <td className="py-2.5 px-3">
                                <span className="inline-block px-2 py-0.5 rounded-full bg-black/5 text-[11px] font-medium text-[#444444] capitalize">
                                  {p.categoryName || p.category || '-'}
                                </span>
                              </td>
                              <td className="py-2.5 px-3 font-extrabold text-[#171717]">
                                {p.price !== undefined ? `₹${p.price}` : <span className="text-rose-500 font-bold">-</span>}
                              </td>
                              <td className="py-2.5 px-3">
                                <span
                                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                                    p.stockStatus === 'in_stock'
                                      ? 'bg-emerald-50 text-emerald-700'
                                      : p.stockStatus === 'low_stock'
                                      ? 'bg-amber-50 text-amber-700'
                                      : 'bg-rose-50 text-rose-700'
                                  }`}
                                >
                                  {p.stockCount} in stock
                                </span>
                              </td>
                              <td className="py-2.5 px-3">
                                {hasErrors ? (
                                  <div className="space-y-0.5">
                                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                                      <XCircle className="w-3 h-3" /> Error
                                    </span>
                                    <p className="text-[10px] text-rose-600 line-clamp-1">{p._errors[0]?.message}</p>
                                  </div>
                                ) : hasWarnings ? (
                                  <div className="space-y-0.5">
                                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                                      <AlertCircle className="w-3 h-3" /> Warning
                                    </span>
                                    <p className="text-[10px] text-amber-600 line-clamp-1">{p._warnings[0]?.message}</p>
                                  </div>
                                ) : (
                                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                                    <CheckCircle2 className="w-3 h-3" /> Valid
                                  </span>
                                )}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Progress */}
          {currentStep === 4 && (
            <div className="py-12 px-6 max-w-lg mx-auto text-center space-y-6">
              <div className="w-16 h-16 rounded-3xl bg-[#F3FCDA] border border-[#9FD842]/40 flex items-center justify-center text-[#709E1E] mx-auto animate-pulse">
                <RefreshCw className="w-8 h-8 animate-spin" />
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-extrabold text-[#171717]">
                  Importing Products to Database...
                </h3>
                <p className="text-xs text-[#777777]">
                  Processing batch safely, syncing MongoDB & local storage
                </p>
              </div>

              <div className="space-y-2">
                <div className="w-full bg-black/10 rounded-full h-3 overflow-hidden">
                  <motion.div
                    className="bg-[#9FD842] h-full rounded-full transition-all duration-300"
                    style={{ width: `${importProgress.percent}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-xs font-extrabold text-[#777777]">
                  <span>{importProgress.percent}% complete</span>
                  <span>
                    {importProgress.current} / {importProgress.total} products
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: Report */}
          {currentStep === 5 && (
            <div className="space-y-6 max-w-2xl mx-auto py-4">
              <div className="text-center space-y-2">
                <div className="w-16 h-16 rounded-3xl bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-700 mx-auto">
                  <CheckCircle2 className="w-9 h-9" />
                </div>
                <h3 className="text-xl font-extrabold text-[#171717]">
                  Bulk Import Complete
                </h3>
                <p className="text-xs text-[#777777]">
                  Catalog has been updated with the processed spreadsheet records.
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-4 rounded-2xl bg-[#FAFAFA] border border-black/10 text-center">
                  <span className="text-[10px] font-extrabold text-[#777777] uppercase">Total</span>
                  <p className="text-2xl font-extrabold text-[#171717] mt-1">{importReport.total}</p>
                </div>
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-center">
                  <span className="text-[10px] font-extrabold text-emerald-700 uppercase">Created</span>
                  <p className="text-2xl font-extrabold text-emerald-800 mt-1">{importReport.inserted}</p>
                </div>
                <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 text-center">
                  <span className="text-[10px] font-extrabold text-blue-700 uppercase">Updated</span>
                  <p className="text-2xl font-extrabold text-blue-800 mt-1">{importReport.updated}</p>
                </div>
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-center">
                  <span className="text-[10px] font-extrabold text-amber-700 uppercase">Skipped</span>
                  <p className="text-2xl font-extrabold text-amber-800 mt-1">{importReport.skipped}</p>
                </div>
              </div>

              {importReport.failed > 0 && (
                <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-extrabold text-rose-800">
                      <XCircle className="w-4 h-4 text-rose-600" />
                      <span>{importReport.failed} rows failed to import</span>
                    </div>
                    <button
                      onClick={() => setShowFailedOnly(!showFailedOnly)}
                      className="text-xs font-bold text-rose-700 underline cursor-pointer"
                    >
                      {showFailedOnly ? 'Hide Details' : 'View Failed Rows'}
                    </button>
                  </div>

                  {showFailedOnly && importReport.errors.length > 0 && (
                    <div className="max-h-40 overflow-y-auto space-y-1.5 pt-2 border-t border-rose-200 text-xs">
                      {importReport.errors.map((err, i) => (
                        <div key={i} className="text-rose-700 flex items-start gap-2">
                          <span className="font-mono font-bold shrink-0">Row {err.row}:</span>
                          <span>{err.error || err.message}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Card Footer Controls */}
        <div className="px-6 py-4 border-t border-black/10 bg-[#FAFAFA] flex items-center justify-between">
          {currentStep < 4 ? (
            <>
              <button
                type="button"
                onClick={currentStep === 0 ? resetAll : () => setCurrentStep((prev) => prev - 1)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white hover:bg-gray-100 text-[#171717] font-extrabold text-xs border border-black/10 transition-all cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>{currentStep === 0 ? 'Clear' : 'Back'}</span>
              </button>

              <div className="flex items-center gap-2">
                {currentStep === 0 && (
                  <button
                    type="button"
                    disabled={!rawRows.length}
                    onClick={() => setCurrentStep(1)}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#171717] hover:bg-black text-white font-extrabold text-xs shadow-md transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <span>Next: Map Columns</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                )}

                {currentStep === 1 && (
                  <button
                    type="button"
                    disabled={!requiredFieldsMapped}
                    onClick={() => setCurrentStep(2)}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#171717] hover:bg-black text-white font-extrabold text-xs shadow-md transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <span>Next: Import Settings</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                )}

                {currentStep === 2 && (
                  <button
                    type="button"
                    disabled={isValidating}
                    onClick={runValidation}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#171717] hover:bg-black text-white font-extrabold text-xs shadow-md transition-all cursor-pointer disabled:opacity-40"
                  >
                    {isValidating ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-[#9FD842]" />
                        <span>Validating Data...</span>
                      </>
                    ) : (
                      <>
                        <span>Validate & Preview</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                )}

                {currentStep === 3 && (
                  <button
                    type="button"
                    disabled={activeProductsToImport.length === 0}
                    onClick={startBulkImport}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#9FD842] hover:bg-[#8EC731] text-[#171717] font-extrabold text-xs sm:text-sm shadow-md transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <span>Import {activeProductsToImport.length} Products</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </>
          ) : currentStep === 5 ? (
            <div className="w-full flex items-center justify-between">
              {importReport.errors.length > 0 ? (
                <button
                  type="button"
                  onClick={() => generateErrorReportFile(importReport.errors)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-rose-50 hover:bg-rose-100 text-rose-700 font-extrabold text-xs border border-rose-200 transition-all cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Error Report</span>
                </button>
              ) : <div />}

              <button
                type="button"
                onClick={resetAll}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#171717] hover:bg-black text-white font-extrabold text-xs sm:text-sm shadow-md transition-all cursor-pointer"
              >
                <Check className="w-4 h-4 text-[#9FD842]" />
                <span>Done (Import Another)</span>
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};
