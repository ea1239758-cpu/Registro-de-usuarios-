// src/models/catalog.model.js
// Consultas de solo lectura para llenar los selects del formulario.
const { pool } = require('../config/database');

async function findDocumentTypes() {
  const [rows] = await pool.query(`
    SELECT doty_id AS id, doty_code AS code, doty_name AS name
      FROM document_types
     WHERE doty_is_active = 1
     ORDER BY doty_id`);
  return rows;
}

async function findSexes() {
  const [rows] = await pool.query(`
    SELECT sexe_id AS id, sexe_code AS code, sexe_name AS name
      FROM sexes
     WHERE sexe_is_active = 1
     ORDER BY sexe_id`);
  return rows;
}

async function findGenders() {
  const [rows] = await pool.query(`
    SELECT gend_id AS id, gend_code AS code, gend_name AS name
      FROM genders
     WHERE gend_is_active = 1
     ORDER BY gend_id`);
  return rows;
}

async function findRoles() {
  const [rows] = await pool.query(`
    SELECT role_id AS id, role_code AS code, role_name AS name,
           role_description AS description
      FROM roles
     WHERE role_is_active = 1
     ORDER BY role_id`);
  return rows;
}

// Trae los cuatro catálogos en paralelo
async function findAll() {
  const [documentTypes, sexes, genders, roles] = await Promise.all([
    findDocumentTypes(),
    findSexes(),
    findGenders(),
    findRoles()
  ]);
  return { documentTypes, sexes, genders, roles };
}

module.exports = { findAll };