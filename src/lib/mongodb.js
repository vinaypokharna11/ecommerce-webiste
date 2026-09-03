import mongoose from 'mongoose';

/**
 * Global cache across hot-reloads and concurrent Next.js API requests.
 */
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null, lastAttempt: 0, failedCooldown: 60000 };
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
  // If recent attempt failed, fail quickly during cooldown so API routes never hang
  if (cached.lastAttempt && !cached.conn && now - cached.lastAttempt < (cached.failedCooldown || 60000)) {
    return null;
  }

  if (!cached.promise) {
    cached.lastAttempt = now;
    const isProd = process.env.NODE_ENV === 'production';
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 2000,
      connectTimeoutMS: 2500,
      maxPoolSize: 10,
      minPoolSize: 1,
      socketTimeoutMS: 30000,
      family: 4, // Force IPv4 to prevent slow Windows/Node DNS IPv6 resolution stalls
    };

    cached.promise = mongoose
      .connect(MONGODB_URI, opts)
      .then((mongooseInstance) => {
        cached.conn = mongooseInstance;
        console.log('⚡ Connected to MongoDB Atlas successfully.');
        return mongooseInstance;
      })
      .catch((err) => {
        console.warn('ℹ️ MongoDB Atlas unavailable (' + (err.message || 'connection failed') + '). Operating with atomic local database.');
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
