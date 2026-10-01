require('dotenv').config({ quiet: true });
const { pool, testConnection } = require('./src/config/database');

testConnection()
  .catch((err) => console.error('Error:', err.code, err.message))
  .finally(() => pool.end());