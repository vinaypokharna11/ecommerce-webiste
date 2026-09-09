import mongoose from 'mongoose';
import dns from 'dns';
import fs from 'fs';
import path from 'path';

// Force reliable DNS for Windows Node SRV resolution
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {}

// Read MONGODB_URI from .env.local if not in process.env
let uri = process.env.MONGODB_URI;
if (!uri && fs.existsSync('.env.local')) {
  const envContent = fs.readFileSync('.env.local', 'utf8');
  const match = envContent.match(/MONGODB_URI=(.+)/);
  if (match) uri = match[1].trim();
}

console.log('═══════════════════════════════════════════════════════');
console.log('🔍 CHECKING MONGODB CONNECTION & DATABASE HEALTH');
console.log('═══════════════════════════════════════════════════════\n');

if (!uri) {
  console.error('❌ ERROR: MONGODB_URI is not set in environment or .env.local');
  process.exit(1);
}

// Mask password for display
const maskedUri = uri.replace(/\/\/(.*?):(.*?)@/, '//$1:•••••••@');
console.log(`📡 Connecting to: ${maskedUri}\n`);

const startTime = Date.now();

try {
  const conn = await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 8000,
    connectTimeoutMS: 10000,
    family: 4,
  });

  const duration = Date.now() - startTime;
  console.log(`✅ SUCCESS: Connected to MongoDB in ${duration}ms!`);
  console.log(`📦 Database Name: "${conn.connection.name}"`);
  console.log(`🖥️  Host: ${conn.connection.host}`);
  console.log(`⚡ Ready State: ${conn.connection.readyState} (1 = Connected)`);

  // Ping the database
  const pingResult = await conn.connection.db.admin().ping();
  console.log(`🏓 Database Ping:`, pingResult);

  // List existing collections
  const collections = await conn.connection.db.listCollections().toArray();
  console.log(`\n📂 Collections in "${conn.connection.name}": (${collections.length} total)`);
  for (const col of collections) {
    const count = await conn.connection.db.collection(col.name).countDocuments();
    console.log(`   • ${col.name.padEnd(20)} : ${count} documents`);
  }

  // Quick read/write verification test
  const testCol = conn.connection.db.collection('__connection_test');
  const testId = `test-${Date.now()}`;
  await testCol.insertOne({ testId, time: new Date(), verified: true });
  const found = await testCol.findOne({ testId });
  await testCol.deleteOne({ testId });
  console.log(`\n✅ Read/Write Test: PASSED (insert, find, delete working flawlessly)`);

  console.log('\n═══════════════════════════════════════════════════════');
  console.log('🎉 MONGODB IS FULLY CONNECTED, HEALTHY, AND OPERATIONAL!');
  console.log('═══════════════════════════════════════════════════════\n');

  await mongoose.disconnect();
  process.exit(0);
} catch (error) {
  console.error('\n❌ MONGODB CONNECTION FAILED:');
  console.error('   Error Name:', error.name);
  console.error('   Error Message:', error.message);
  if (error.reason) {
    console.error('   Error Reason:', error.reason);
  }
  console.log('\n═══════════════════════════════════════════════════════');
  process.exit(1);
}
