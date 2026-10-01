// src/controllers/catalog.controller.js
const catalogModel = require('../models/catalog.model');

// GET /api/catalogs
async function getAll(req, res, next) {
  try {
    const catalogs = await catalogModel.findAll();
    res.json(catalogs);
  } catch (err) {
    next(err);
  }
}

module.exports = { getAll };