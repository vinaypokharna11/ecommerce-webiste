import fs from 'fs';
import path from 'path';
import os from 'os';

/**
 * jsonStore.js
 *
 * Provides atomic, fault-tolerant read and write operations for the local
 * persistent JSON database (src/data/db.json) and master seed template.
 *
 * Operates as the offline / local fallback layer when MongoDB Atlas is unreachable.
 */

const IS_SERVERLESS = Boolean(
  process.env.VERCEL ||
  process.env.AWS_LAMBDA_FUNCTION_NAME ||
  process.env.NETLIFY ||
  (typeof process.cwd === 'function' && process.cwd().startsWith('/var/task'))
);

export const LOCAL_DB_PATH = path.join(process.cwd(), 'src', 'data', 'db.json');
export const LOCAL_SEED_TEMPLATE_PATH = path.join(process.cwd(), 'src', 'data', 'seedTemplate.json');

export const DB_FILE_PATH = IS_SERVERLESS
  ? path.join(os.tmpdir(), 'nakoda_db.json')
  : LOCAL_DB_PATH;

export const SEED_TEMPLATE_PATH = IS_SERVERLESS
  ? path.join(os.tmpdir(), 'nakoda_seedTemplate.json')
  : LOCAL_SEED_TEMPLATE_PATH;

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

// In-memory fallback state so operations never throw EROFS in serverless environments
let inMemoryDB = null;

function cloneInitialDb() {
  return JSON.parse(JSON.stringify(INITIAL_DB_STATE));
}

export function initJSONDB() {
  try {
    if (!inMemoryDB) {
      inMemoryDB = cloneInitialDb();
    }
    const dir = path.dirname(DB_FILE_PATH);
    if (!fs.existsSync(dir)) {
      try {
        fs.mkdirSync(dir, { recursive: true });
      } catch (e) {}
    }
    if (!fs.existsSync(DB_FILE_PATH)) {
      let baseline = null;
      if (fs.existsSync(LOCAL_DB_PATH)) {
        try {
          baseline = JSON.parse(fs.readFileSync(LOCAL_DB_PATH, 'utf-8'));
        } catch (e) {}
      }
      const dataToSave = baseline || inMemoryDB || cloneInitialDb();
      try {
        fs.writeFileSync(DB_FILE_PATH, JSON.stringify(dataToSave, null, 2), 'utf-8');
        inMemoryDB = dataToSave;
      } catch (e) {
        // Read-only filesystem; proceed with inMemoryDB
      }
    }
  } catch (err) {
    if (!inMemoryDB) inMemoryDB = cloneInitialDb();
  }
}

export function readJSONDB() {
  initJSONDB();
  try {
    let parsed = null;
    if (fs.existsSync(DB_FILE_PATH)) {
      const data = fs.readFileSync(DB_FILE_PATH, 'utf-8');
      parsed = JSON.parse(data);
    } else if (fs.existsSync(LOCAL_DB_PATH)) {
      const data = fs.readFileSync(LOCAL_DB_PATH, 'utf-8');
      parsed = JSON.parse(data);
    }
    if (!parsed) {
      parsed = inMemoryDB ? JSON.parse(JSON.stringify(inMemoryDB)) : cloneInitialDb();
    }
    inMemoryDB = parsed;
    return parsed;
  } catch (err) {
    return inMemoryDB ? JSON.parse(JSON.stringify(inMemoryDB)) : cloneInitialDb();
  }
}

export function writeJSONDB(data) {
  inMemoryDB = JSON.parse(JSON.stringify(data));
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
      // In-memory state updated; avoid throwing or crashing
      return true;
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
