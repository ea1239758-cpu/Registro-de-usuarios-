// src/controllers/user.controller.js
// Recibe la petición, valida, llama al modelo y responde JSON.
const bcrypt = require('bcryptjs');
const userModel = require('../models/user.model');
const { validateUser } = require('../validators/user.validator');

// Traduce cada índice UNIQUE de MySQL a un campo del formulario
const DUPLICATE_FIELDS = {
  user_email_UNIQUE: ['email', 'Ya existe un usuario con ese correo.'],
  user_phone_number_UNIQUE: ['phoneNumber', 'Ese teléfono ya está registrado.'],
  user_doty_document_number_UNIQUE: ['documentNumber', 'Ya existe un usuario con ese tipo y número de documento.'],
  acce_username_UNIQUE: ['username', 'Ese nombre de usuario ya está en uso.']
};

// GET /api/users
async function list(req, res, next) {
  try {
    const users = await userModel.findAll();
    res.json(users);
  } catch (err) {
    next(err);
  }
}

// POST /api/users
async function create(req, res, next) {
  // 1. Validar
  const { data, errors } = validateUser(req.body);
  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ message: 'Revisa los campos marcados.', errors });
  }

  try {
    // 2. Preparar: la contraseña nunca se guarda en texto plano
    const passwordHash = await bcrypt.hash(data.password, 10);

    // 3. Guardar mediante el modelo
    const id = await userModel.create(
      data,
      { username: data.username, passwordHash },
      data.roleIds
    );

    // 4. Responder
    res.status(201).json({
      id,
      message: `Usuario ${data.firstName} ${data.lastName} registrado.`
    });
  } catch (err) {
    // Dato repetido (índice UNIQUE)
    if (err.code === 'ER_DUP_ENTRY') {
      const key = Object.keys(DUPLICATE_FIELDS).find((k) => err.message.includes(k));
      if (key) {
        const [field, message] = DUPLICATE_FIELDS[key];
        return res.status(409).json({ message, errors: { [field]: message } });
      }
      return res.status(409).json({ message: 'Uno de los datos ya está registrado.' });
    }
    // Id de catálogo que no existe (llave foránea)
    if (err.code === 'ER_NO_REFERENCED_ROW_2') {
      return res.status(400).json({ message: 'Uno de los valores seleccionados no existe.' });
    }
    next(err);
  }
}

module.exports = { list, create };
