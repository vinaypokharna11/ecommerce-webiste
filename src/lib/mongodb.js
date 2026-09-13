import mongoose from 'mongoose';
import dns from 'dns';

// Configure reliable public DNS servers for Node.js SRV cluster resolution strictly for Windows local development
if (process.platform === 'win32' && !process.env.VERCEL && !process.env.AWS_LAMBDA_FUNCTION_NAME) {
  try {
    dns.setServers(['8.8.8.8', '1.1.1.1']);
  } catch (e) {}
}

/**
 * Global cache across hot-reloads and concurrent Next.js API requests.
 */
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null, lastAttempt: 0, failedCooldown: 3000, resolvedUri: null };
}

/**
 * Manually resolves a mongodb+srv:// URI into a standard mongodb:// URI using
 * an isolated DNS resolver configured with public DNS servers (Google & Cloudflare).
 *
 * This bypasses the OS default DNS resolver which frequently fails SRV lookups
 * on Windows (querySrv ECONNREFUSED) when using ISP/router DNS.
 *
 * The resolved URI is cached globally so DNS resolution only occurs once.
 */
async function resolveSrvUri(srvUri) {
  // Return cached resolved URI if available
  if (cached.resolvedUri) return cached.resolvedUri;

  // Only resolve mongodb+srv:// URIs; standard mongodb:// URIs pass through
  if (!srvUri || !srvUri.startsWith('mongodb+srv://')) return srvUri;

  try {
    const match = srvUri.match(/^mongodb\+srv:\/\/([^:]+):([^@]+)@([^/?#]+)(?:\/([^?#]*))?(?:\?(.*))?$/);
    if (!match) return srvUri;

    const [, user, pass, host, rawDb = '', rawQuery = ''] = match;
    const db = rawDb || 'nakodaimitation';

    // Use an isolated Resolver instance with high-reliability public DNS servers
    const resolver = new dns.promises.Resolver();
    resolver.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);

    const [srvRecords, txtRecords] = await Promise.all([
      resolver.resolveSrv('_mongodb._tcp.' + host),
      resolver.resolveTxt(host).catch(() => []),
    ]);

    if (!srvRecords || srvRecords.length === 0) return srvUri;

    const hostList = srvRecords.map((r) => r.name + ':' + r.port).join(',');

    // Merge original query params with TXT record params (authSource, replicaSet)
    const searchParams = new URLSearchParams(rawQuery);
    searchParams.set('ssl', 'true');
    const txtString = txtRecords.flat().join('&');
    if (txtString) {
      const txtParams = new URLSearchParams(txtString);
      for (const [key, val] of txtParams.entries()) {
        if (!searchParams.has(key)) searchParams.set(key, val);
      }
    }
    if (!searchParams.has('authSource')) searchParams.set('authSource', 'admin');

    const resolved =
      'mongodb://' +
      encodeURIComponent(decodeURIComponent(user)) +
      ':' +
      encodeURIComponent(decodeURIComponent(pass)) +
      '@' +
      hostList +
      '/' +
      db +
      '?' +
      searchParams.toString();

    // Cache the resolved URI globally
    cached.resolvedUri = resolved;
    return resolved;
  } catch (e) {
    console.warn('⚠️ SRV URI resolution failed, falling back to original URI:', e.message);
    return srvUri;
  }
}

export async function connectToDatabase() {
  let MONGODB_URI = process.env.MONGODB_URI;

  if (!MONGODB_URI) {
    return null;
  }

  // Auto-inject database name if missing to prevent default admin cluster traversal
  if (MONGODB_URI.startsWith('mongodb+srv://') && MONGODB_URI.includes('.mongodb.net/?')) {
    MONGODB_URI = MONGODB_URI.replace('.mongodb.net/?', '.mongodb.net/nakodaimitation?');
  }

  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  const now = Date.now();
  // If recent attempt failed, fail quickly during short 3s cooldown so API routes never hang
  if (cached.lastAttempt && !cached.conn && now - cached.lastAttempt < (cached.failedCooldown || 3000)) {
    return null;
  }

  if (!cached.promise) {
    cached.lastAttempt = now;

    // Resolve mongodb+srv:// to standard mongodb:// to avoid OS DNS SRV failures
    let connectionUri = MONGODB_URI;
    if (process.platform === 'win32' && !process.env.VERCEL && !process.env.AWS_LAMBDA_FUNCTION_NAME) {
      connectionUri = await resolveSrvUri(MONGODB_URI);
    }

    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
      maxPoolSize: 10,
      minPoolSize: 1,
      socketTimeoutMS: 45000,
      ...(process.platform === 'win32' && !process.env.VERCEL ? { family: 4 } : {}),
    };

    cached.promise = mongoose
      .connect(connectionUri, opts)
      .then((mongooseInstance) => {
        cached.conn = mongooseInstance;
        console.log(`⚡ Connected to MongoDB Atlas successfully [db: ${mongooseInstance.connection.name}].`);
        return mongooseInstance;
      })
      .catch((err) => {
        console.warn(`ℹ️ MongoDB Atlas connection notice: ${err.message || 'connection failed'}`);
        cached.promise = null;
        cached.conn = null;
        cached.lastAttempt = Date.now();
        return null;
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    cached.conn = null;
    cached.lastAttempt = Date.now();
    return null;
  }

  return cached.conn;
}

export default connectToDatabase;

