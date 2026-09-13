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
  cached = global.mongoose = { conn: null, promise: null, lastAttempt: 0, failedCooldown: 3000 };
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
    const masked = MONGODB_URI.replace(/\/\/(.*?):(.*?)@/, '//$1:•••••••@');
    
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
      .connect(MONGODB_URI, opts)
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

