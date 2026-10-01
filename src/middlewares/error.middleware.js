// src/middlewares/error.middleware.js

// Ruta de la API que no existe
function notFound(req, res) {
  res.status(404).json({ message: `No existe la ruta ${req.method} ${req.originalUrl}` });
}

// Errores no controlados. Express lo reconoce por tener 4 parámetros.
function errorHandler(err, req, res, next) {
  // JSON mal formado en el cuerpo de la petición
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ message: 'El cuerpo de la petición no es un JSON válido.' });
  }
  console.error(err);
  res.status(500).json({ message: 'Error interno del servidor.' });
}

module.exports = { notFound, errorHandler };