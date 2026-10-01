// src/routes/catalog.routes.js
const { Router } = require('express');
const catalogController = require('../controllers/catalog.controller');

const router = Router();

router.get('/', catalogController.getAll);   // GET /api/catalogs

module.exports = router;