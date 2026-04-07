const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'mini_project',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

async function testMySQLConnection() {
    try {
        const connection = await pool.getConnection();
        console.log('MySQL Connected Successfully to', process.env.DB_NAME || 'mini_project');
        connection.release();
    } catch (err) {
        console.error('MySQL connection error:', err.message);
        throw err;
    }
}

module.exports = { pool, testMySQLConnection };
