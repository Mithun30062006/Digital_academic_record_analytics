const db = require('./config/db');
const store = require('./config/storage');
require('dotenv').config();

async function test() {
  await db.testConnection();
  console.log('Testing saveMarksBatch with 2 subjects...');
  const result = await store.saveMarksBatch('2028201001', 'I', 'HALF 1', [
    { course_code: 'CSE301', course_name: 'Data Structures', course_type: 'Theory', mark: '90' },
    { course_code: 'CSE302', course_name: 'Algorithms', course_type: 'Lab', mark: '85' }
  ]);
  console.log('Result:', result);
  process.exit(0);
}

test().catch(e => { console.error('ERROR:', e.message); process.exit(1); });
