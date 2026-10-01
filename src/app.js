// src/app.js
// Configura Express: middlewares, archivos estáticos y rutas.
const path = require('path');
const express = require('express');

const catalogRoutes = require('./routes/catalog.routes');
const userRoutes = require('./routes/user.routes');
const { notFound, errorHandler } = require('./middlewares/error.middleware');

const app = express();

// Convierte el cuerpo JSON de las peticiones en req.body
app.use(express.json());

// Sirve la vista: index.html, css y js de la carpeta public
app.use(express.static(path.join(__dirname, '..', 'public')));

// API
app.use('/api/catalogs', catalogRoutes);
app.use('/api/users', userRoutes);

// Manejo de errores (siempre al final)
app.use('/api', notFound);
app.use(errorHandler);

module.exports = app;