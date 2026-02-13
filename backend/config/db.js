// If you want to use a real MySQL database set USE_DB=true in .env
if (process.env.USE_DB === 'true') {
  const mysql = require('mysql2/promise');
  const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_DATABASE || 'digital_academic_records',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    charset: 'utf8mb4'
  });

  async function testConnection() {
    const conn = await pool.getConnection();
    try { await conn.ping(); } finally { conn.release(); }
  }

  module.exports = { pool, testConnection };
} else {
  async function testConnection() { return; }
  const pool = null;
  module.exports = { pool, testConnection };
}
