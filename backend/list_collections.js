const mongoose = require('mongoose');

async function listCollections() {
  await mongoose.connect('mongodb://localhost:27017/mini_project');
  const collections = await mongoose.connection.db.listCollections().toArray();
  console.log('Collections in mini_project:');
  collections.forEach(c => console.log(`- ${c.name}`));
  await mongoose.disconnect();
}
listCollections().catch(console.error);
