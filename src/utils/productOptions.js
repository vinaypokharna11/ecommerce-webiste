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

