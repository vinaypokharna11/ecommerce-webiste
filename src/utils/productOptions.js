/**
 * Product Options Helper
 * Sizes are exclusively provided for Clothing and Shoes (Footwear).
 * All other categories (jewelry, electronics, bags, perfumes, etc.) have no sizes.
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

/**
 * Returns available sizes ONLY for Clothing and Footwear/Shoes.
 * Returns an empty array [] for all other product types.
 */
export const getProductSizes = (product) => {
  if (!product) return [];

  // 1. Clothing
  if (isClothingProduct(product)) {
    if (Array.isArray(product.sizes) && product.sizes.length > 0) {
      return product.sizes;
    }
    return ['S', 'M', 'L', 'XL', 'XXL'];
  }

  // 2. Footwear / Shoes
  if (isFootwearProduct(product)) {
    if (Array.isArray(product.sizes) && product.sizes.length > 0) {
      return product.sizes;
    }
    return ['UK 7', 'UK 8', 'UK 9', 'UK 10'];
  }

  // 3. Rest of the catalog (Jewelry, Electronics, Bags, Home, Gourmet, etc.) - NO size option
  return [];
};
