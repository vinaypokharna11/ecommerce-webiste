import fs from 'fs';
import path from 'path';

/**
 * jsonStore.js
 *
 * Provides atomic, fault-tolerant read and write operations for the local
 * persistent JSON database (src/data/db.json) and master seed template.
 *
 * Operates as the offline / local fallback layer when MongoDB Atlas is unreachable.
 */

export const DB_FILE_PATH = path.join(process.cwd(), 'src', 'data', 'db.json');
export const SEED_TEMPLATE_PATH = path.join(process.cwd(), 'src', 'data', 'seedTemplate.json');

export const INITIAL_DB_STATE = {
  isInitialized: false,
  products: [],
  categories: [],
  offers: [],
  orders: [],
  inquiries: [],
  contactMessages: [],
  storeConfig: null,
  users: [],
};

export function initJSONDB() {
  try {
    const dir = path.dirname(DB_FILE_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    if (!fs.existsSync(DB_FILE_PATH)) {
      fs.writeFileSync(DB_FILE_PATH, JSON.stringify(INITIAL_DB_STATE, null, 2), 'utf-8');
    }
  } catch (err) {
    console.error('Error initializing fallback JSON database file', err);
  }
}

export function readJSONDB() {
  initJSONDB();
  try {
    const data = fs.readFileSync(DB_FILE_PATH, 'utf-8');
    const parsed = JSON.parse(data);
    return parsed;
  } catch (err) {
    return { ...INITIAL_DB_STATE };
  }
}

export function writeJSONDB(data) {
  initJSONDB();
  try {
    const tmpPath = `${DB_FILE_PATH}.${Date.now()}.${Math.random().toString(36).slice(2)}.tmp`;
    fs.writeFileSync(tmpPath, JSON.stringify(data, null, 2), 'utf-8');
    fs.renameSync(tmpPath, DB_FILE_PATH);
    return true;
  } catch (err) {
    try {
      fs.writeFileSync(DB_FILE_PATH, JSON.stringify(data, null, 2), 'utf-8');
      return true;
    } catch (e) {
      console.error('Failed to write JSON DB:', e);
      return false;
    }
  }
}

/**
 * High-Speed In-Memory Cache for rapid reads.
 * Mutating operations immediately invalidate relevant keys.
 */
export const memoryCache = {
  products: null,
  productsTime: 0,
  categories: null,
  categoriesTime: 0,
  offers: null,
  offersTime: 0,
  config: null,
  configTime: 0,
  catalogBundle: null,
  catalogBundleTime: 0,
  TTL: 300000, // 5-minute hot cache
  invalidateProducts() {
    memoryCache.products = null;
    memoryCache.productsTime = 0;
    memoryCache.catalogBundle = null;
  },
  invalidateCategories() {
    memoryCache.categories = null;
    memoryCache.categoriesTime = 0;
    memoryCache.catalogBundle = null;
  },
  invalidateOffers() {
    memoryCache.offers = null;
    memoryCache.offersTime = 0;
    memoryCache.catalogBundle = null;
  },
  invalidateConfig() {
    memoryCache.config = null;
    memoryCache.configTime = 0;
    memoryCache.catalogBundle = null;
  },
  invalidateAll() {
    memoryCache.products = null;
    memoryCache.productsTime = 0;
    memoryCache.categories = null;
    memoryCache.categoriesTime = 0;
    memoryCache.offers = null;
    memoryCache.offersTime = 0;
    memoryCache.config = null;
    memoryCache.configTime = 0;
    memoryCache.catalogBundle = null;
    memoryCache.catalogBundleTime = 0;
  },
};
