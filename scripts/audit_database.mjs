import mongoose from 'mongoose';
import dns from 'dns';
import fs from 'fs';

try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {}

let uri = process.env.MONGODB_URI;
if (!uri && fs.existsSync('.env')) {
  const envContent = fs.readFileSync('.env', 'utf8');
  const match = envContent.match(/MONGODB_URI=(.+)/);
  if (match) uri = match[1].trim();
}

async function audit() {
  const conn = await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 8000,
    connectTimeoutMS: 10000,
    family: 4,
  });

  const db = conn.connection.db;
  const collections = await db.listCollections().toArray();
  const fullDump = {};

  for (const col of collections) {
    const name = col.name;
    const docs = await db.collection(name).find({}).toArray();
    fullDump[name] = docs;
  }

  const outPath = 'scratch_audit_dump.json';
  fs.writeFileSync(outPath, JSON.stringify(fullDump, null, 2));
  console.log(`Full dump saved to ${outPath}. Total collections: ${collections.length}`);

  // Summary analysis:
  for (const [name, docs] of Object.entries(fullDump)) {
    console.log(`Collection ${name}: ${docs.length} documents`);
  }

  await mongoose.disconnect();
}

audit().catch(console.error);
