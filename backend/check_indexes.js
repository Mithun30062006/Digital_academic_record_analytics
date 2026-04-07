const { MongoClient } = require('mongodb');

async function checkIndexes() {
  const uri = 'mongodb://localhost:27017';
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db('mydatabase');
    const cols = await db.listCollections().toArray();
    for (const col of cols) {
      if (col.name.endsWith('_student')) {
        const indexes = await db.collection(col.name).indexes();
        console.log('Indexes for', col.name, ':', JSON.stringify(indexes, null, 2));
      }
    }
  } catch (err) {
    console.error(err);
  } finally {
    await client.close();
  }
}

checkIndexes();
