/**
 * Product Options Helper
 * Sizes are exclusively provided for Clothing and Shoes (Footwear).
 * All other categories (jewelry, electronics, bags, perfumes, etc.) have no sizes.
 *
 * getAllProductSizes() always returns the full default set for the category
 * so the UI can show all possible sizes. Sizes NOT present in the product's
 * database `sizes` array are marked unavailable (shown with a cross).
 */

export const isClothingProduct = (product) => {
  if (!product) return false;
  const str = `${product.categoryName || ''} ${product.category || ''} ${product.name || ''}`.toLowerCase();
  return (
    str.includes('cloth') ||
    str.includes('apparel') ||
    str.includes('fashion') ||
    str.includes('shirt') ||
    str.includes('pant') ||
    str.includes('tee') ||
    str.includes('t-shirt') ||
    str.includes('kurti') ||
    str.includes('jacket') ||
    str.includes('undergarment') ||
    str.includes('dress') ||
    str.includes('trouser') ||
    str.includes('hoodie') ||
    str.includes('denim')
  );
};

export const isFootwearProduct = (product) => {
  if (!product) return false;
  const str = `${product.categoryName || ''} ${product.category || ''} ${product.name || ''}`.toLowerCase();
  return (
    str.includes('foot') ||
    str.includes('shoe') ||
    str.includes('loafer') ||
    str.includes('sneaker') ||
    str.includes('sandal') ||
    str.includes('boots') ||
    str.includes('heel') ||
    str.includes('slipper')
  );
};

/** Default size sets for each category type */
const CLOTHING_SIZES = ['S', 'M', 'L', 'XL', 'XXL'];
const FOOTWEAR_SIZES = ['UK 7', 'UK 8', 'UK 9', 'UK 10', 'UK 11'];

/**
 * Returns ALL possible sizes for Clothing and Footwear/Shoes.
 * Always returns the full default set for the category, merged with any
 * extra product-specific sizes from the database.
 * Returns an empty array [] for all other product types.
 */
export const getAllProductSizes = (product) => {
  if (!product) return [];

  // Determine the default size set based on category
  let defaultSizes = [];
  if (isClothingProduct(product)) {
    defaultSizes = CLOTHING_SIZES;
  } else if (isFootwearProduct(product)) {
    defaultSizes = FOOTWEAR_SIZES;
  }

  // If product has explicit sizes in DB, merge them with the default set
  // to ensure all possible sizes are always shown
  if (Array.isArray(product.sizes) && product.sizes.length > 0) {
    // Merge: default set + any extra product-specific sizes not in defaults
    const merged = [...defaultSizes];
    for (const sz of product.sizes) {
      if (!merged.includes(sz)) {
        merged.push(sz);
      }
    }
    return merged.length > 0 ? merged : product.sizes;
  }

  return defaultSizes;
};

/**
 * Determines whether a specific size is available in stock for a product.
 * A size is unavailable (shown with a cross) if:
 * 1. The entire product is out of stock, OR
 * 2. The product has an explicit `sizes` array in the database and the size is NOT in it, OR
 * 3. The size is in `unavailableSizes` / `outOfStockSizes`, OR
 * 4. The size has zero stock in `sizeStock`
 */
export const isProductSizeAvailable = (product, size) => {
  if (!product || !size) return false;

  // If entire product is marked out of stock and no explicit availableSizes are declared
  if (product.stockStatus === 'out_of_stock' && (!Array.isArray(product.availableSizes) || product.availableSizes.length === 0)) {
    return false;
  }

  // If explicit availableSizes array is provided
  if (Array.isArray(product.availableSizes)) {
    return product.availableSizes.includes(size);
  }

  // If product has explicit sizes array from the database,
  // only sizes IN that array are available — others get a cross
  if (Array.isArray(product.sizes) && product.sizes.length > 0) {
    if (!product.sizes.includes(size)) {
      return false;
    }
  }

  // If explicit unavailable / out-of-stock sizes array is provided
  const unavail = product.unavailableSizes || product.outOfStockSizes;
  if (Array.isArray(unavail)) {
    return !unavail.includes(size);
  }

  // If size-level stock count exists
  if (product.sizeStock && typeof product.sizeStock[size] === 'number') {
    return product.sizeStock[size] > 0;
  }

  // By default, if product is not out of stock, size is available
  return product.stockStatus !== 'out_of_stock';
};

/**
 * Returns only the sizes that are currently in stock and available.
 */
export const getProductAvailableSizes = (product) => {
  const allSizes = getAllProductSizes(product);
  return allSizes.filter((sz) => isProductSizeAvailable(product, sz));
};

// Maintain backwards compatibility: getProductSizes returns all sizes
export const getProductSizes = getAllProductSizes;

/**
 * Common color name to hex mapping for jewelry, apparel & lifestyle products
 */
export const COLOR_HEX_MAP = {
  black: '#171717',
  'matte black': '#0F172A',
  white: '#FFFFFF',
  red: '#EF4444',
  blue: '#3B82F6',
  'navy blue': '#1E293B',
  navy: '#1E293B',
  grey: '#68696E',
  gray: '#68696E',
  'deep blue-green': '#0F565D',
  'dark purple': '#581C87',
  purple: '#A855F7',
  green: '#10B981',
  yellow: '#EAB308',
  pink: '#EC4899',
  maroon: '#800000',
  gold: '#D4AF37',
  'gold polish': '#D4AF37',
  silver: '#C0C0C0',
  'silver tone': '#C0C0C0',
  rose: '#F472B6',
  'rose gold': '#B76E79',
  ruby: '#9B111E',
  emerald: '#50C878',
  bronze: '#CD7F32',
  copper: '#B87333',
  antique: '#917254',
  pearl: '#F0EAD6',
  orange: '#F97316',
  brown: '#78350F',
  teal: '#14B8A6',
  lavender: '#C4B5FD',
  peach: '#FDBA74',
  olive: '#65A30D',
  cream: '#FFFDD0',
  beige: '#F5F5DC',
};

/**
 * Returns an array of standardized color objects: [{ name: 'Red', hex: '#EF4444' }]
 * Extracts colors from:
 * 1. product.colors (array of objects {name, hex}, or array of strings, or comma-separated string)
 * 2. product.availableColors
 */
export const getProductColors = (product) => {
  if (!product) return [];

  let rawColors = product.colors;
  if (!rawColors && product.availableColors) rawColors = product.availableColors;
  if (!rawColors) return [];

  // If string, parse by commas
  if (typeof rawColors === 'string') {
    const parts = rawColors.split(',').map((s) => s.trim()).filter(Boolean);
    return parts.map((part) => {
      if (part.includes(':')) {
        const [name, hex] = part.split(':').map((s) => s.trim());
        let cleanHex = hex;
        if (cleanHex && !cleanHex.startsWith('#') && /^[0-9A-Fa-f]{6}$/.test(cleanHex)) {
          cleanHex = `#${cleanHex}`;
        }
        return { name, hex: cleanHex || COLOR_HEX_MAP[name.toLowerCase()] || '#1D1D1F' };
      }
      const lower = part.toLowerCase();
      return { name: part, hex: COLOR_HEX_MAP[lower] || '#1D1D1F' };
    });
  }

  if (Array.isArray(rawColors)) {
    return rawColors
      .map((col) => {
        if (!col) return null;
        if (typeof col === 'string') {
          const lower = col.trim().toLowerCase();
          return { name: col.trim(), hex: COLOR_HEX_MAP[lower] || '#1D1D1F' };
        }
        if (typeof col === 'object') {
          const name = col.name || col.color || col.label || '';
          if (!name) return null;
          const lower = String(name).trim().toLowerCase();
          let hex = col.hex || col.colorHex || COLOR_HEX_MAP[lower] || '#1D1D1F';
          if (hex && !hex.startsWith('#') && /^[0-9A-Fa-f]{6}$/.test(hex)) {
            hex = `#${hex}`;
          }
          return { name: String(name).trim(), hex };
        }
        return null;
      })
      .filter(Boolean);
  }

  return [];
};

/**
 * Retrieves the hex code for a given color name from product's color list
 */
export const getProductColorHex = (product, colorName) => {
  if (!colorName) return '#1D1D1F';
  const colors = getProductColors(product);
  const found = colors.find((c) => c.name.toLowerCase() === String(colorName).toLowerCase());
  if (found && found.hex) return found.hex;
  return COLOR_HEX_MAP[String(colorName).toLowerCase()] || '#1D1D1F';
};

