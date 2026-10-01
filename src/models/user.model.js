// src/models/user.model.js
// Acceso a datos de usuarios: consultas y transacción de registro.
const { pool } = require('../config/database');

// Lista de usuarios con tipo de documento, username y roles
async function findAll() {
  const [rows] = await pool.query(`
    SELECT u.user_id              AS id,
           u.user_first_name      AS firstName,
           u.user_last_name       AS lastName,
           dt.doty_code           AS documentType,
           u.user_document_number AS documentNumber,
           u.user_email           AS email,
           u.user_phone_number    AS phoneNumber,
           a.acce_username        AS username,
           u.user_is_active       AS isActive,
           u.user_created_at      AS createdAt,
           GROUP_CONCAT(r.role_name ORDER BY r.role_name SEPARATOR ', ') AS roles
      FROM users u
      JOIN document_types dt   ON dt.doty_id    = u.user_document_type_id
      LEFT JOIN accesses a     ON a.acce_user_id = u.user_id
      LEFT JOIN users_roles ur ON ur.user_id    = u.user_id
      LEFT JOIN roles r        ON r.role_id     = ur.role_id
     GROUP BY u.user_id, a.acce_username
     ORDER BY u.user_created_at DESC`);
  return rows;
}

/**
 * Crea el usuario, su acceso y sus roles en UNA transacción.
 * Si cualquier INSERT falla, se deshace todo (rollback).
 * @param {object}   user    datos personales ya validados
 * @param {object}   access  { username, passwordHash }
 * @param {number[]} roleIds ids de los roles
 * @returns {Promise<number>} id del usuario creado
 */
async function create(user, access, roleIds) {
  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    // 1. users
    const [userResult] = await conn.execute(
      `INSERT INTO users
         (user_first_name, user_last_name, user_document_type_id, user_document_number,
          user_email, user_phone_number, user_sex_id, user_gender_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        user.firstName,
        user.lastName,
        user.documentTypeId,
        user.documentNumber,
        user.email,
        user.phoneNumber,
        user.sexId,
        user.genderId
      ]
    );
    const userId = userResult.insertId;

    // 2. accesses
    await conn.execute(
      `INSERT INTO accesses
         (acce_user_id, acce_username, acce_password_hash, acce_password_changed_at)
       VALUES (?, ?, ?, CURRENT_TIMESTAMP(6))`,
      [userId, access.username, access.passwordHash]
    );

    // 3. users_roles: varias filas en un solo INSERT
    const roleRows = roleIds.map((roleId) => [userId, roleId]);
    await conn.query('INSERT INTO users_roles (user_id, role_id) VALUES ?', [roleRows]);

    await conn.commit();
    return userId;
  } catch (err) {
    await conn.rollback();
    throw err;            // el controlador decide qué responder
  } finally {
    conn.release();       // siempre devolver la conexión al pool
  }
}

module.exports = { findAll, create };