/**
 * Bulk Product Import Core Engine
 * Handles schema definitions, header alias auto-detection, row-level validation,
 * color & variant parsing, duplicate detection, and error diagnostics.
 */

export const PRODUCT_SCHEMA_FIELDS = [
  { key: 'name', label: 'Product Name', required: true, type: 'text', description: 'Full title or name of the product' },
  { key: 'category', label: 'Category', required: true, type: 'category', description: 'Category ID or category name (e.g. necklaces, earrings)' },
  { key: 'categoryName', label: 'Category Name', required: false, type: 'text', description: 'Display name for category (optional)' },
  { key: 'price', label: 'Price (Selling Price)', required: true, type: 'number', description: 'Selling price in ₹ (must be greater than 0)' },
  { key: 'oldPrice', label: 'Old Price (MRP)', required: false, type: 'number', description: 'Original MRP before discount in ₹' },
  { key: 'discountPercent', label: 'Discount %', required: false, type: 'number', description: 'Discount percentage (0-100), auto-calculated if Old Price is provided' },
  { key: 'stockCount', label: 'Stock Count', required: false, type: 'number', default: 10, description: 'Available stock quantity (defaults to 10)' },
  { key: 'stockStatus', label: 'Stock Status', required: false, type: 'enum', allowed: ['in_stock', 'low_stock', 'out_of_stock'], description: 'in_stock, low_stock, or out_of_stock' },
  { key: 'description', label: 'Description', required: false, type: 'text', description: 'Detailed product description' },
  { key: 'image', label: 'Main Image URL', required: false, type: 'url', description: 'Full URL or assets path to product image' },
  { key: 'colors', label: 'Colors', required: false, type: 'colors', description: 'e.g. "Gold Polish:#D4AF37, Silver:#C0C0C0" or "Gold, Silver"' },
  { key: 'sizes', label: 'Sizes', required: false, type: 'csv', description: 'Comma-separated sizes (e.g. S, M, L, XL or 2.4, 2.6, 2.8)' },
  { key: 'variants', label: 'Variants', required: false, type: 'csv', description: 'Comma-separated variants (e.g. Standard, Premium)' },
  { key: 'tags', label: 'Tags', required: false, type: 'csv', description: 'Comma-separated search tags (e.g. bridal, necklace, kundan)' },
  { key: 'badge', label: 'Badge Text', required: false, type: 'text', description: 'e.g. NEW, BEST SELLER, 20% OFF' },
  { key: 'badgeType', label: 'Badge Type', required: false, type: 'text', description: 'new, bestseller, trending, discount' },
  { key: 'rating', label: 'Rating', required: false, type: 'number', default: 0, description: 'Customer rating from 0.0 to 5.0 (default: 0)' },
  { key: 'reviews', label: 'Reviews Count', required: false, type: 'number', default: 0, description: 'Total review count (default: 0)' },
  { key: 'isPopular', label: 'Is Popular', required: false, type: 'boolean', default: false, description: 'TRUE or FALSE' },
  { key: 'isFeatured', label: 'Is Featured', required: false, type: 'boolean', default: false, description: 'TRUE or FALSE' },
  { key: 'id', label: 'Product ID (Optional)', required: false, type: 'text', description: 'Unique product ID. If omitted, one is automatically generated' },
];

export const HEADER_ALIASES = {
  name: ['product name', 'product_name', 'productname', 'name', 'title', 'product title', 'item name', 'item_name', 'item'],
  category: ['category', 'category name', 'category_name', 'category id', 'category_id', 'cat', 'collection', 'type', 'product type'],
  categoryName: ['category display name', 'category_display_name', 'category title'],
  price: ['price', 'selling price', 'selling_price', 'sale price', 'sale_price', 'rate', 'unit price', 'unit_price', 'cost', 'amount'],
  oldPrice: ['old price', 'old_price', 'oldprice', 'original price', 'original_price', 'mrp', 'compare at price', 'compare_at_price', 'list price', 'list_price'],
  discountPercent: ['discount', 'discount percent', 'discount_percent', 'discount percentage', 'discount %', 'discount_pct', 'off percent'],
  stockCount: ['stock', 'stock count', 'stock_count', 'quantity', 'qty', 'inventory', 'units', 'available stock', 'stock quantity'],
  stockStatus: ['stock status', 'stock_status', 'stockstatus', 'availability', 'status'],
  description: ['description', 'desc', 'details', 'product description', 'product_description', 'about', 'summary'],
  image: ['image', 'images', 'image url', 'image_url', 'photo', 'picture', 'thumbnail', 'photo url', 'product image'],
  colors: ['colors', 'color', 'colours', 'colour', 'available colors'],
  sizes: ['sizes', 'size', 'dimensions', 'available sizes'],
  variants: ['variants', 'variant'],
  tags: ['tags', 'tag', 'keywords', 'keyword', 'labels'],
  badge: ['badge', 'ribbon', 'label', 'flag'],
  badgeType: ['badge type', 'badge_type', 'badgetype'],
  rating: ['rating', 'stars', 'score', 'average rating'],
  reviews: ['reviews', 'reviews count', 'review count', 'review_count', 'num reviews', 'no of reviews'],
  isPopular: ['popular', 'is popular', 'is_popular', 'ispopular', 'trending'],
  isFeatured: ['featured', 'is featured', 'is_featured', 'isfeatured', 'highlighted'],
  id: ['id', 'product id', 'product_id', 'productid', 'sku', 'product sku', 'item id'],
};

// Common color name to hex mapping for jewelry & lifestyle products
export const COLOR_HEX_MAP = {
  gold: '#D4AF37',
  'gold polish': '#D4AF37',
  silver: '#C0C0C0',
  'silver tone': '#C0C0C0',
  rose: '#F472B6',
  'rose gold': '#B76E79',
  black: '#171717',
  'matte black': '#0F172A',
  white: '#FFFFFF',
  red: '#EF4444',
  maroon: '#800000',
  ruby: '#9B111E',
  emerald: '#50C878',
  green: '#10B981',
  blue: '#3B82F6',
  navy: '#1E293B',
  'navy blue': '#1E293B',
  yellow: '#EAB308',
  pink: '#EC4899',
  purple: '#A855F7',
  bronze: '#CD7F32',
  copper: '#B87333',
  antique: '#917254',
  pearl: '#F0EAD6',
};

/**
 * Auto-detect column mapping based on spreadsheet headers
 */
export function autoDetectColumnMapping(headers = []) {
  const mapping = {};
  const lowerHeaders = headers.map((h) => String(h || '').trim().toLowerCase());

  PRODUCT_SCHEMA_FIELDS.forEach((field) => {
    const aliases = HEADER_ALIASES[field.key] || [field.key.toLowerCase()];
    const matchIndex = lowerHeaders.findIndex((headerText) => {
      if (!headerText) return false;
      return aliases.some((alias) => headerText === alias || headerText.replace(/[_\s-]+/g, '') === alias.replace(/[_\s-]+/g, ''));
    });

    if (matchIndex !== -1) {
      mapping[field.key] = matchIndex;
    }
  });

  return mapping;
}

/**
 * Parses color inputs:
 * Accepts: "Gold Polish:#D4AF37, Silver:#C0C0C0"
 * Or simple list: "Gold, Silver, Rose Gold"
 */
export function parseColorsInput(val) {
  if (!val) return [];
  if (Array.isArray(val)) return val;
  const str = String(val).trim();
  if (!str) return [];

  const parts = str.split(',').map((p) => p.trim()).filter(Boolean);
  return parts.map((part) => {
    if (part.includes(':')) {
      const [name, hex] = part.split(':').map((s) => s.trim());
      let cleanHex = hex;
      if (cleanHex && !cleanHex.startsWith('#') && /^[0-9A-Fa-f]{6}$/.test(cleanHex)) {
        cleanHex = '#' + cleanHex;
      }
      return { name, hex: cleanHex || '#D4AF37' };
    }
    const lower = part.toLowerCase();
    const hex = COLOR_HEX_MAP[lower] || '#D4AF37';
    return { name: part, hex };
  });
}

/**
 * Parses boolean inputs: 'true', 'yes', '1', 1 -> true
 */
export function parseBooleanInput(val) {
  if (typeof val === 'boolean') return val;
  if (typeof val === 'number') return val === 1;
  if (!val) return false;
  const s = String(val).trim().toLowerCase();
  return s === 'true' || s === 'yes' || s === '1' || s === 'y';
}

/**
 * Parses comma-separated string into clean array
 */
export function parseCsvInput(val) {
  if (!val) return [];
  if (Array.isArray(val)) return val.map((v) => String(v).trim()).filter(Boolean);
  return String(val)
    .split(',')
    .map((v) => v.trim())
    .filter(Boolean);
}

/**
 * Validates a single product row against Product schema, active categories, and duplicate keys
 */
export function validateProductRow({
  row,
  rowIndex,
  mapping,
  categories = [],
  seenIdsInFile = new Set(),
  dbExistingIds = new Set(),
  duplicateMode = 'skip', // 'skip' | 'update' | 'generate_id'
  importMode = 'create', // 'create' | 'update' | 'upsert'
}) {
  const errors = [];
  const warnings = [];
  const product = { _rowIndex: rowIndex };

  // 1. Extract values based on mapping
  PRODUCT_SCHEMA_FIELDS.forEach((field) => {
    const colIdx = mapping[field.key];
    const rawVal = colIdx !== undefined && colIdx >= 0 ? row[colIdx] : undefined;
    if (rawVal !== undefined && rawVal !== null && String(rawVal).trim() !== '') {
      product[field.key] = rawVal;
    } else if (field.default !== undefined) {
      product[field.key] = field.default;
    }
  });

  const productName = String(product.name || '').trim();

  // 2. Validate Name
  if (!productName) {
    errors.push({
      field: 'name',
      message: 'Product name is required',
      fix: 'Enter a valid, descriptive product title',
    });
  } else {
    product.name = productName;
  }

  // 3. Validate Category
  const rawCategory = String(product.category || '').trim();
  if (!rawCategory) {
    errors.push({
      field: 'category',
      message: 'Category is required',
      fix: `Choose an existing category: ${categories.map((c) => c.name || c.id).slice(0, 4).join(', ')}`,
    });
  } else {
    const cleanCat = rawCategory.toLowerCase();
    const matchedCategory = categories.find(
      (c) =>
        String(c.id).toLowerCase() === cleanCat ||
        String(c.name || '').toLowerCase() === cleanCat
    );

    if (matchedCategory) {
      product.category = matchedCategory.id;
      product.categoryName = matchedCategory.name || matchedCategory.id;
    } else {
      errors.push({
        field: 'category',
        message: `Category "${rawCategory}" does not exist in store`,
        fix: `Use one of: ${categories.map((c) => `"${c.name}"`).slice(0, 5).join(', ')}`,
      });
      product.category = cleanCat;
      product.categoryName = rawCategory;
    }
  }

  // 4. Validate Price
  if (product.price === undefined || product.price === null || String(product.price).trim() === '') {
    errors.push({
      field: 'price',
      message: 'Price is required',
      fix: 'Enter a selling price number greater than 0 (e.g. 799)',
    });
  } else {
    const pNum = Number(product.price);
    if (isNaN(pNum) || pNum <= 0) {
      errors.push({
        field: 'price',
        message: `Invalid price "${product.price}". Must be a number greater than 0`,
        fix: 'Enter a valid positive number (e.g. 499)',
      });
    } else {
      product.price = Math.round(pNum * 100) / 100;
    }
  }

  // 5. Validate Old Price (MRP)
  if (product.oldPrice !== undefined && product.oldPrice !== null && String(product.oldPrice).trim() !== '') {
    const oldPNum = Number(product.oldPrice);
    if (isNaN(oldPNum) || oldPNum < 0) {
      warnings.push({
        field: 'oldPrice',
        message: `Invalid Old Price "${product.oldPrice}". Must be a number`,
        fix: 'Enter a valid MRP number or leave empty',
      });
      product.oldPrice = undefined;
    } else {
      product.oldPrice = Math.round(oldPNum * 100) / 100;
      if (product.oldPrice > (product.price || 0) && (!product.discountPercent || Number(product.discountPercent) === 0)) {
        product.discountPercent = Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100);
      }
    }
  }

  // 6. Validate Stock
  if (product.stockCount !== undefined && product.stockCount !== null && String(product.stockCount).trim() !== '') {
    const sc = parseInt(product.stockCount, 10);
    if (isNaN(sc) || sc < 0) {
      warnings.push({
        field: 'stockCount',
        message: `Invalid stock count "${product.stockCount}". Defaulted to 10`,
        fix: 'Enter a whole number 0 or greater',
      });
      product.stockCount = 10;
    } else {
      product.stockCount = sc;
    }
  } else {
    product.stockCount = 10;
  }

  // Set stockStatus
  if (!product.stockStatus || !['in_stock', 'low_stock', 'out_of_stock'].includes(product.stockStatus)) {
    product.stockStatus = product.stockCount <= 0 ? 'out_of_stock' : product.stockCount < 5 ? 'low_stock' : 'in_stock';
  }

  // 7. Validate & Clean Image URL
  if (product.image) {
    const imgStr = String(product.image).trim();
    // Support multiple images separated by comma: take first as primary image
    const imgUrls = imgStr.split(',').map((u) => u.trim()).filter(Boolean);
    const primaryImg = imgUrls[0] || '';
    if (primaryImg && !primaryImg.startsWith('http://') && !primaryImg.startsWith('https://') && !primaryImg.startsWith('/')) {
      warnings.push({
        field: 'image',
        message: `Image URL "${primaryImg.slice(0, 30)}..." should start with http://, https://, or /assets/`,
        fix: 'Provide a valid image web URL or asset path',
      });
    }
    product.image = primaryImg;
    product.images = imgUrls;
  } else {
    product.image = '';
    product.images = [];
  }

  // 8. Transform Colors, Sizes, Tags, Variants
  product.colors = parseColorsInput(product.colors);
  product.sizes = parseCsvInput(product.sizes);
  product.variants = parseCsvInput(product.variants);
  product.tags = parseCsvInput(product.tags);

  // 9. Booleans
  product.isPopular = parseBooleanInput(product.isPopular);
  product.isFeatured = parseBooleanInput(product.isFeatured);

  // 10. Rating & Reviews - genuine only
  const parsedReviews = Math.max(0, parseInt(product.reviews, 10) || 0);
  product.reviews = parsedReviews;
  product.rating = parsedReviews > 0 ? Math.min(5, Math.max(0, Number(product.rating) || 0)) : 0;

  // 11. Description & Badges
  product.description = String(product.description || '').trim();
  product.badge = String(product.badge || '').trim();
  product.badgeType = String(product.badgeType || '').trim();

  // 12. Duplicate ID & SKU Detection (E11000 Prevention)
  let rawId = String(product.id || '').trim();
  let isDuplicateInFile = false;
  let isDuplicateInDb = false;

  if (rawId) {
    if (seenIdsInFile.has(rawId)) {
      isDuplicateInFile = true;
    } else {
      seenIdsInFile.add(rawId);
    }

    if (dbExistingIds.has(rawId)) {
      isDuplicateInDb = true;
    }
  }

  product._isDuplicate = isDuplicateInFile || isDuplicateInDb;
  product._duplicateType = isDuplicateInFile ? 'file' : isDuplicateInDb ? 'database' : null;

  if (product._isDuplicate) {
    if (duplicateMode === 'skip') {
      if (importMode === 'update' && isDuplicateInDb) {
        // In update mode, existing in DB is expected!
      } else {
        warnings.push({
          field: 'id',
          message: `Product ID "${rawId}" already exists (${product._duplicateType}). Will be skipped according to duplicate settings.`,
          fix: 'Keep skip setting or choose "Update existing products" / "Create new with generated IDs"',
        });
      }
    } else if (duplicateMode === 'update') {
      if (!isDuplicateInDb && importMode === 'update') {
        errors.push({
          field: 'id',
          message: `Product ID "${rawId}" does not exist in database to update.`,
          fix: 'Switch Import Mode to "Create + Update" or remove ID',
        });
      }
    } else if (duplicateMode === 'generate_id') {
      warnings.push({
        field: 'id',
        message: `Product ID "${rawId}" is duplicated (${product._duplicateType}). A fresh unique ID will be generated.`,
        fix: 'No action required — safe ID generation active',
      });
    }
  } else if (importMode === 'update' && !rawId) {
    errors.push({
      field: 'id',
      message: 'Product ID is required when Import Mode is "Update existing products"',
      fix: 'Include product ID column or change Import Mode to "Create new products"',
    });
  }

  return {
    product,
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validates an entire parsed dataset against active categories and DB IDs
 */
export function validateBulkDataset({
  dataRows = [],
  mapping = {},
  categories = [],
  dbExistingIds = new Set(),
  duplicateMode = 'skip',
  importMode = 'create',
}) {
  const seenIdsInFile = new Set();
  const validatedProducts = [];
  let totalValid = 0;
  let totalErrors = 0;
  let totalWarnings = 0;
  let totalDuplicates = 0;
  const allErrorsList = [];

  dataRows.forEach((row, index) => {
    const result = validateProductRow({
      row,
      rowIndex: index,
      mapping,
      categories,
      seenIdsInFile,
      dbExistingIds,
      duplicateMode,
      importMode,
    });

    if (result.isValid) {
      totalValid++;
    } else {
      totalErrors++;
    }

    if (result.warnings.length > 0) {
      totalWarnings += result.warnings.length;
    }

    if (result.product._isDuplicate) {
      totalDuplicates++;
    }

    result.errors.forEach((err) => {
      allErrorsList.push({
        row: index + 2, // 1-based, +1 for header row
        product: result.product.name || `Row ${index + 2}`,
        field: err.field,
        error: err.message,
        fix: err.fix,
      });
    });

    validatedProducts.push({
      ...result.product,
      _isValid: result.isValid,
      _errors: result.errors,
      _warnings: result.warnings,
    });
  });

  return {
    products: validatedProducts,
    metrics: {
      total: dataRows.length,
      valid: totalValid,
      invalid: totalErrors,
      warnings: totalWarnings,
      duplicates: totalDuplicates,
    },
    errorsList: allErrorsList,
  };
}
