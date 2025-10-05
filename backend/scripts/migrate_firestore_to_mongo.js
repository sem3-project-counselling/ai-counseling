// backend/scripts/migrate_firestore_to_mongo.js
const { MongoClient } = require('mongodb');
require('dotenv').config();

if (!process.env.MONGODB_URI) {
  console.error('❌ Please set MONGODB_URI in .env');
  process.exit(1);
}

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || 'app_db';

async function main() {
  const client = new MongoClient(uri, { useUnifiedTopology: true });

  try {
    await client.connect();
    console.log('✅ Connected to MongoDB Atlas for migration');

    const db = client.db(dbName);

    // Example: migrate JSON files or seed data
    const collections = ['users', 'posts', 'items']; // adjust as needed

    for (const colName of collections) {
      console.log('Processing collection', colName);
      const col = db.collection(colName);

      // Example: seed empty collection if not exist
      const count = await col.countDocuments();
      if (count === 0) {
        console.log('Collection is empty, inserting example document for', colName);
        await col.insertOne({ example: true, createdAt: new Date() });
      } else {
        console.log('Collection already has', count, 'documents');
      }
    }

    console.log('✅ Migration/seed process complete');
  } catch (err) {
    console.error('Migration error:', err.message);
  } finally {
    await client.close();
  }
}

main();
