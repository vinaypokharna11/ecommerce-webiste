import * as XLSX from 'xlsx';
import { PRODUCT_SCHEMA_FIELDS } from '../lib/productImport.js';

/**
 * Generates and downloads a multi-sheet Excel (.xlsx) template for bulk product import.
 * Sheet 1: "Products" with column headers and realistic sample rows
 * Sheet 2: "Instructions" with detailed format rules, allowed values, and active categories
 */
export function generateProductImportTemplate(categories = []) {
  const wb = XLSX.utils.book_new();

  // ── SHEET 1: PRODUCTS ──
  const categoryId1 = categories[0]?.id || 'necklaces';
  const categoryId2 = categories[1]?.id || 'bangles';
  const categoryId3 = categories[2]?.id || 'earrings';

  const productHeaders = [
    'name',
    'category',
    'categoryName',
    'price',
    'oldPrice',
    'discountPercent',
    'stockCount',
    'stockStatus',
    'description',
    'image',
    'colors',
    'sizes',
    'variants',
    'tags',
    'badge',
    'badgeType',
    'rating',
    'reviews',
    'isPopular',
    'isFeatured',
    'id',
  ];

  const sampleRows = [
    [
      'Royal Kundan Bridal Choker Necklace Set',
      categoryId1,
      categories[0]?.name || 'Necklaces',
      2499,
      3999,
      38,
      25,
      'in_stock',
      'Handcrafted traditional Kundan choker necklace set with matching jhumkas and maang tikka. Micron gold plated with meenakari reverse work.',
      'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80',
      'Gold Polish:#D4AF37, Antique Gold:#917254, Ruby Red:#9B111E',
      'Free Size, Adjustable Dori',
      'Bridal Choker, Classic Choker',
      'kundan, bridal, wedding, choker, necklace, imitation',
      'BEST SELLER',
      'bestseller',
      4.9,
      128,
      'TRUE',
      'TRUE',
      '',
    ],
    [
      'Antique Matte Temple Kada Bangles (Set of 2)',
      categoryId2,
      categories[1]?.name || 'Bangles',
      899,
      1499,
      40,
      18,
      'in_stock',
      'Traditional South Indian temple kada bangles featuring Lakshmi motif carving with antique ruby stones. Screw-open clasp for comfortable fit.',
      'https://images.unsplash.com/photo-1611591475878-a289069d3004?auto=format&fit=crop&w=800&q=80',
      'Antique Gold:#917254, Ruby Tone:#800000',
      '2.4, 2.6, 2.8',
      'Standard Pair',
      'temple, kada, bangles, antique, lakshmi',
      'NEW',
      'new',
      0,
      0,
      'FALSE',
      'TRUE',
      '',
    ],
    [
      'American Diamond Rose Gold Floral Drop Earrings',
      categoryId3,
      categories[2]?.name || 'Earrings',
      649,
      999,
      35,
      40,
      'in_stock',
      'Sparkling AAA cubic zirconia American Diamond dangling partywear earrings plated in rose gold. Lightweight and hypoallergenic push-back studs.',
      'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80',
      'Rose Gold:#B76E79, Silver Tone:#C0C0C0',
      'Free Size',
      'Drop Stud, Clip On',
      'earrings, diamond, ad, partywear, rosegold',
      '35% OFF',
      'discount',
      0,
      0,
      'TRUE',
      'FALSE',
      '',
    ],
  ];

  const productsAoa = [productHeaders, ...sampleRows];
  const wsProducts = XLSX.utils.aoa_to_sheet(productsAoa);

  // Column width formatting
  wsProducts['!cols'] = [
    { wch: 36 }, // name
    { wch: 16 }, // category
    { wch: 18 }, // categoryName
    { wch: 10 }, // price
    { wch: 10 }, // oldPrice
    { wch: 12 }, // discountPercent
    { wch: 12 }, // stockCount
    { wch: 14 }, // stockStatus
    { wch: 48 }, // description
    { wch: 36 }, // image
    { wch: 32 }, // colors
    { wch: 18 }, // sizes
    { wch: 22 }, // variants
    { wch: 28 }, // tags
    { wch: 14 }, // badge
    { wch: 12 }, // badgeType
    { wch: 8 },  // rating
    { wch: 10 }, // reviews
    { wch: 10 }, // isPopular
    { wch: 10 }, // isFeatured
    { wch: 22 }, // id
  ];

  XLSX.utils.book_append_sheet(wb, wsProducts, 'Products');

  // ── SHEET 2: INSTRUCTIONS ──
  const instructionsHeader = [
    'Column Name',
    'Required?',
    'Data Type',
    'Example Value',
    'Allowed Values & Guidelines',
  ];

  const activeCategoriesList = categories.length > 0
    ? categories.map((c) => `"${c.id}" (${c.name})`).join(', ')
    : 'necklaces, earrings, bangles, rings, sets';

  const instructionsRows = [
    [
      'name',
      'YES',
      'Text',
      'Royal Kundan Bridal Choker Necklace',
      'Unique, descriptive product name. Cannot be blank.',
    ],
    [
      'category',
      'YES',
      'Text',
      categoryId1,
      `Must match an active category ID or name in your store: ${activeCategoriesList}`,
    ],
    [
      'categoryName',
      'NO',
      'Text',
      'Necklaces',
      'Optional user-friendly category display title. If blank, system auto-fills from category.',
    ],
    [
      'price',
      'YES',
      'Number',
      '2499',
      'Selling price in ₹. Must be a positive number greater than 0 (e.g. 799 or 799.50).',
    ],
    [
      'oldPrice',
      'NO',
      'Number',
      '3999',
      'MRP / Original price before discount in ₹. Should be greater than price.',
    ],
    [
      'discountPercent',
      'NO',
      'Number',
      '38',
      'Discount percentage (0-100). If left empty, auto-calculated when oldPrice is given.',
    ],
    [
      'stockCount',
      'NO',
      'Number',
      '25',
      'Total units in stock. Whole number 0 or greater (default: 10).',
    ],
    [
      'stockStatus',
      'NO',
      'Text',
      'in_stock',
      'Allowed: in_stock, low_stock, out_of_stock. If empty, auto-determined from stockCount.',
    ],
    [
      'description',
      'NO',
      'Text',
      'Handcrafted traditional Kundan choker...',
      'Detailed product description, materials, care instructions, craftsmanship.',
    ],
    [
      'image',
      'NO',
      'URL',
      'https://images.unsplash.com/...',
      'Full HTTP/HTTPS image URL or local path (/assets/images/...). Multiple URLs can be comma-separated.',
    ],
    [
      'colors',
      'NO',
      'Text',
      'Gold Polish:#D4AF37, Antique:#917254',
      'Format: "ColorName:#HEX" or simply comma-separated names like "Gold, Silver, Rose Gold".',
    ],
    [
      'sizes',
      'NO',
      'Text',
      '2.4, 2.6, 2.8',
      'Comma-separated sizes (e.g. "Free Size", "S, M, L", or bangle sizes "2.4, 2.6, 2.8").',
    ],
    [
      'variants',
      'NO',
      'Text',
      'Standard, Bridal Choker',
      'Comma-separated variant names.',
    ],
    [
      'tags',
      'NO',
      'Text',
      'kundan, bridal, wedding, choker',
      'Comma-separated keywords for customer search and filtering.',
    ],
    [
      'badge',
      'NO',
      'Text',
      'BEST SELLER',
      'Short ribbon tag displayed on product card (e.g. NEW, BEST SELLER, 25% OFF, TRENDING).',
    ],
    [
      'badgeType',
      'NO',
      'Text',
      'bestseller',
      'Badge styling preset: new, bestseller, trending, discount.',
    ],
    [
      'rating',
      'NO',
      'Number',
      '4.9',
      'Average rating score between 1.0 and 5.0 (default: 4.8).',
    ],
    [
      'reviews',
      'NO',
      'Number',
      '128',
      'Total customer review count (default: 0).',
    ],
    [
      'isPopular',
      'NO',
      'Boolean',
      'TRUE',
      'TRUE or FALSE. Featured in Popular Products section.',
    ],
    [
      'isFeatured',
      'NO',
      'Boolean',
      'TRUE',
      'TRUE or FALSE. Featured in Hero/Featured collection.',
    ],
    [
      'id',
      'NO',
      'Text',
      'prod-1726000000-abc12',
      'Optional. Leave blank to auto-generate unique product IDs. Only provide if updating specific products.',
    ],
  ];

  const instructionsAoa = [instructionsHeader, ...instructionsRows];
  const wsInstructions = XLSX.utils.aoa_to_sheet(instructionsAoa);

  wsInstructions['!cols'] = [
    { wch: 18 }, // Column Name
    { wch: 12 }, // Required?
    { wch: 12 }, // Data Type
    { wch: 32 }, // Example Value
    { wch: 70 }, // Allowed Values & Guidelines
  ];

  XLSX.utils.book_append_sheet(wb, wsInstructions, 'Instructions');

  // Trigger browser download
  XLSX.writeFile(wb, 'nakoda_products_import_template.xlsx');
}

/**
 * Generates an Excel error report containing detailed row-by-row issues
 */
export function generateErrorReportFile(errors = []) {
  if (!Array.isArray(errors) || errors.length === 0) return;

  const wb = XLSX.utils.book_new();

  const headers = ['Row Number', 'Product Name', 'Field', 'Error', 'Suggested Fix'];
  const rows = errors.map((err) => [
    err.row || 'N/A',
    err.product || 'Unknown',
    err.field || 'General',
    err.error || err.message || 'Validation error',
    err.fix || 'Check format and retry',
  ]);

  const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);

  ws['!cols'] = [
    { wch: 12 },
    { wch: 30 },
    { wch: 16 },
    { wch: 45 },
    { wch: 45 },
  ];

  XLSX.utils.book_append_sheet(wb, ws, 'Import Errors');
  XLSX.writeFile(wb, `import_error_report_${Date.now()}.xlsx`);
}
