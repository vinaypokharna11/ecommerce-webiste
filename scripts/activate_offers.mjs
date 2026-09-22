import mongoose from 'mongoose';
import connectToDatabase from '../src/lib/mongodb.js';
import fs from 'fs';
import path from 'path';
import Offer from '../src/models/Offer.js';

async function run() {
  await connectToDatabase();
  console.log('Connected to MongoDB');

  const seedTemplateRaw = fs.readFileSync(path.join(process.cwd(), 'src', 'data', 'seedTemplate.json'), 'utf8');
  const seedTemplate = JSON.parse(seedTemplateRaw);
  const defaultOffers = seedTemplate.offers || [];

  for (const offer of defaultOffers) {
    await Offer.findOneAndUpdate(
      { id: offer.id },
      { ...offer, isActive: true, status: 'ACTIVE', isDeleted: false },
      { upsert: true, returnDocument: 'after' }
    );
    console.log(`Upserted offer: ${offer.code} (${offer.title}) - active: true, status: ACTIVE`);
  }

  const allOffers = await Offer.find({ isDeleted: false });
  console.log(`Total active offers now in MongoDB: ${allOffers.length}`);
  allOffers.forEach(o => console.log(`- ${o.code}: ${o.title} (status: ${o.status})`));

  await mongoose.disconnect();
}

run().catch(console.error);
