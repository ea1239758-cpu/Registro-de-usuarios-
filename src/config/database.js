// src/config/database.js
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  charset: 'utf8mb4',
  dateStrings: true,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

async function testConnection() {
  const [rows] = await pool.query(
    'SELECT DATABASE() AS db, CURRENT_USER() AS user, VERSION() AS version'
  );
  console.log(`MySQL conectado → base: ${rows[0].db} | usuario: ${rows[0].user} | versión: ${rows[0].version}`);
}

module.exports = { pool, testConnection };
