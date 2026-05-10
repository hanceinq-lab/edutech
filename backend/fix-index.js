/**
 * EduFlow — Index Fix Script
 * Run this ONCE to fix the "username already exists" error.
 * 
 * Usage: node backend/fix-index.js
 */

import 'dotenv/config';
import mongoose from 'mongoose';

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error('❌ MONGO_URI not set in .env file');
  process.exit(1);
}

async function fixIndexes() {
  console.log('🔗 Connecting to MongoDB...');
  await mongoose.connect(MONGO_URI);
  console.log('✅ Connected\n');

  const db = mongoose.connection.db;
  const collection = db.collection('users');

  // List all current indexes
  const indexes = await collection.indexes();
  console.log('📋 Current indexes on users collection:');
  indexes.forEach(idx => console.log('  -', JSON.stringify(idx.key), idx.unique ? '(unique)' : ''));
  console.log('');

  // Drop any index on "username" field
  const usernameIndex = indexes.find(idx => idx.key && idx.key.username !== undefined);
  if (usernameIndex) {
    console.log(`🗑️  Dropping bad index: "${usernameIndex.name}"...`);
    await collection.dropIndex(usernameIndex.name);
    console.log('✅ Bad index dropped!\n');
  } else {
    console.log('✅ No username index found — nothing to drop.\n');
  }

  // Also clear any leftover users so seed works cleanly
  const count = await collection.countDocuments();
  if (count > 0) {
    console.log(`🗑️  Dropping all ${count} existing users so seed starts fresh...`);
    await collection.deleteMany({});
    console.log('✅ Users cleared.\n');
  }

  // Verify
  const remaining = await collection.indexes();
  console.log('📋 Indexes after fix:');
  remaining.forEach(idx => console.log('  -', JSON.stringify(idx.key), idx.unique ? '(unique)' : ''));

  await mongoose.disconnect();
  console.log('\n🎉 Done! Now run: node seed.js');
}

fixIndexes().catch(err => {
  console.error('❌ Fix failed:', err.message);
  mongoose.disconnect();
  process.exit(1);
});
