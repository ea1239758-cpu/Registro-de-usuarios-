// src/routes/user.routes.js
const { Router } = require('express');
const userController = require('../controllers/user.controller');

const router = Router();

router.get('/', userController.list);      // GET  /api/users
router.post('/', userController.create);   // POST /api/users

module.exports = router;