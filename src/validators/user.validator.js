// src/validators/user.validator.js
// Limpia y valida los datos que llegan del formulario.
// Devuelve { data, errors }: data con los valores normalizados y
// errors con un mensaje por cada campo inválido.

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DOCUMENT_RE = /^[A-Za-z0-9-]{3,30}$/;
const PHONE_RE = /^\+?[0-9 ]{7,20}$/;
const USERNAME_RE = /^[a-zA-Z0-9._-]{4,50}$/;

const text = (value) => (typeof value === 'string' ? value.trim() : '');
const toId = (value) => {
  const n = Number(value);
  return Number.isInteger(n) && n > 0 ? n : null;
};

function validateUser(body = {}) {
  const data = {
    firstName: text(body.firstName),
    lastName: text(body.lastName),
    documentTypeId: toId(body.documentTypeId),
    documentNumber: text(body.documentNumber),
    email: text(body.email).toLowerCase(),
    phoneNumber: text(body.phoneNumber) || null,
    sexId: toId(body.sexId),
    genderId: toId(body.genderId),
    username: text(body.username),
    password: typeof body.password === 'string' ? body.password : '',
    roleIds: Array.isArray(body.roleIds)
      ? [...new Set(body.roleIds.map(toId).filter(Boolean))]
      : []
  };

  const errors = {};

  if (!data.firstName || data.firstName.length > 50) errors.firstName = 'Escribe los nombres (máximo 50 caracteres).';
  if (!data.lastName || data.lastName.length > 50) errors.lastName = 'Escribe los apellidos (máximo 50 caracteres).';
  if (!data.documentTypeId) errors.documentTypeId = 'Selecciona el tipo de documento.';
  if (!DOCUMENT_RE.test(data.documentNumber)) errors.documentNumber = 'Usa entre 3 y 30 letras, números o guiones.';
  if (!EMAIL_RE.test(data.email) || data.email.length > 100) errors.email = 'Escribe un correo válido.';
  if (data.phoneNumber && !PHONE_RE.test(data.phoneNumber)) errors.phoneNumber = 'Usa solo números (7 a 20 dígitos).';
  if (!data.sexId) errors.sexId = 'Selecciona el sexo.';
  if (!USERNAME_RE.test(data.username)) errors.username = 'Entre 4 y 50 caracteres: letras, números, punto, guion o guion bajo.';
  if (data.password.length < 8) errors.password = 'La contraseña debe tener al menos 8 caracteres.';
  if (data.roleIds.length === 0) errors.roleIds = 'Asigna al menos un rol.';

  return { data, errors };
}

module.exports = { validateUser };