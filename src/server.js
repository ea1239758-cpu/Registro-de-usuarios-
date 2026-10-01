// src/server.js
// Punto de entrada: carga variables de entorno, prueba MySQL y arranca.
require('dotenv').config({ quiet: true });   // debe ir antes de cualquier otro require

const app = require('./app');
const { testConnection } = require('./config/database');

const PORT = Number(process.env.PORT) || 3000;

async function start() {
  try {
    await testConnection();
    app.listen(PORT, () => {
      console.log(`Servidor listo en http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('No se pudo conectar a MySQL:', err.message);
    process.exit(1);
  }
}

start();