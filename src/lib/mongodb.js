import mongoose from 'mongoose';

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development and serverless function invocations in production.
 */
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null, lastAttempt: 0, failedCooldown: 30000 };
}

export async function connectToDatabase() {
  const MONGODB_URI = process.env.MONGODB_URI;

  if (!MONGODB_URI) {
    return null;
  }

  if (cached.conn) {
    return cached.conn;
  }

  // If recent attempt failed, fail instantly during cooldown so API routes never block
  const now = Date.now();
  if (cached.lastAttempt && !cached.conn && now - cached.lastAttempt < (cached.failedCooldown || 30000)) {
    return null;
  }

  if (!cached.promise) {
    cached.lastAttempt = now;
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 800, // Fail quickly if MongoDB is offline so fallback kicks in instantly
    };

    cached.promise = mongoose
      .connect(MONGODB_URI, opts)
      .then((mongooseInstance) => {
        console.log('✅ Connected to MongoDB successfully.');
        return mongooseInstance;
      })
      .catch((err) => {
        console.info('ℹ️ Using local persistent database fallback');
        cached.promise = null;
        cached.lastAttempt = Date.now();
        return null;
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    cached.lastAttempt = Date.now();
    return null;
  }

  return cached.conn;
}

export default connectToDatabase;
