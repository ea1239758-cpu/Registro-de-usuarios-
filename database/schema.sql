-- =========================================================
-- Base de datos: registro_usuarios (MySQL 8)
-- =========================================================
SET NAMES utf8mb4;
DROP DATABASE IF EXISTS registro_usuarios;
CREATE DATABASE registro_usuarios CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE registro_usuarios;

-- ---------------------------------------------------------
-- Catálogos
-- ---------------------------------------------------------
CREATE TABLE document_types (
  doty_id          BIGINT       NOT NULL AUTO_INCREMENT,
  doty_code        VARCHAR(10)  NOT NULL,
  doty_name        VARCHAR(100) NOT NULL,
  doty_description TEXT         NULL,
  doty_is_active   TINYINT      NOT NULL DEFAULT 1,
  doty_created_at  DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  doty_created_by  BIGINT       NULL,
  doty_updated_at  DATETIME(6)  NULL ON UPDATE CURRENT_TIMESTAMP(6),
  doty_updated_by  BIGINT       NULL,
  PRIMARY KEY (doty_id),
  UNIQUE KEY doty_code_UNIQUE (doty_code)
) ENGINE=InnoDB;

CREATE TABLE sexes (
  sexe_id          BIGINT      NOT NULL AUTO_INCREMENT,
  sexe_code        VARCHAR(10) NOT NULL,
  sexe_name        VARCHAR(50) NOT NULL,
  sexe_description TEXT        NULL,
  sexe_is_active   TINYINT     NOT NULL DEFAULT 1,
  sexe_created_at  DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  sexe_created_by  BIGINT      NULL,
  sexe_updated_at  DATETIME(6) NULL ON UPDATE CURRENT_TIMESTAMP(6),
  sexe_updated_by  BIGINT      NULL,
  PRIMARY KEY (sexe_id),
  UNIQUE KEY sexe_code_UNIQUE (sexe_code)
) ENGINE=InnoDB;

CREATE TABLE genders (
  gend_id          BIGINT      NOT NULL AUTO_INCREMENT,
  gend_code        VARCHAR(10) NOT NULL,
  gend_name        VARCHAR(50) NOT NULL,
  gend_description TEXT        NULL,
  gend_is_active   TINYINT     NOT NULL DEFAULT 1,
  gend_created_at  DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  gend_created_by  BIGINT      NULL,
  gend_updated_at  DATETIME(6) NULL ON UPDATE CURRENT_TIMESTAMP(6),
  gend_updated_by  BIGINT      NULL,
  PRIMARY KEY (gend_id),
  UNIQUE KEY gend_code_UNIQUE (gend_code)
) ENGINE=InnoDB;

-- ---------------------------------------------------------
-- Usuarios
-- ---------------------------------------------------------
CREATE TABLE users (
  user_id               BIGINT       NOT NULL AUTO_INCREMENT,
  user_first_name       VARCHAR(50)  NOT NULL,
  user_last_name        VARCHAR(50)  NOT NULL,
  user_document_type_id BIGINT       NOT NULL,
  user_document_number  VARCHAR(30)  NOT NULL,
  user_email            VARCHAR(100) NOT NULL,
  user_phone_number     VARCHAR(20)  NULL,
  user_sex_id           BIGINT       NOT NULL,
  user_gender_id        BIGINT       NULL,
  user_is_active        TINYINT      NOT NULL DEFAULT 1,
  user_created_at       DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  user_created_by       BIGINT       NULL,
  user_updated_at       DATETIME(6)  NULL ON UPDATE CURRENT_TIMESTAMP(6),
  user_updated_by       BIGINT       NULL,
  PRIMARY KEY (user_id),
  UNIQUE KEY user_email_UNIQUE (user_email),
  UNIQUE KEY user_phone_number_UNIQUE (user_phone_number),
  UNIQUE KEY user_doty_document_number_UNIQUE (user_document_type_id, user_document_number),
  KEY fk_users_user_sex_id_idx (user_sex_id),
  KEY fk_users_user_gender_id_idx (user_gender_id),
  CONSTRAINT fk_users_document_type FOREIGN KEY (user_document_type_id) REFERENCES document_types (doty_id),
  CONSTRAINT fk_users_sex           FOREIGN KEY (user_sex_id)           REFERENCES sexes (sexe_id),
  CONSTRAINT fk_users_gender        FOREIGN KEY (user_gender_id)        REFERENCES genders (gend_id)
) ENGINE=InnoDB;

CREATE TABLE accesses (
  acce_id                  BIGINT       NOT NULL AUTO_INCREMENT,
  acce_user_id             BIGINT       NOT NULL,
  acce_username            VARCHAR(50)  NOT NULL,
  acce_password_hash       VARCHAR(255) NOT NULL,
  acce_is_active           TINYINT      NOT NULL DEFAULT 1,
  acce_failed_attempts     INT          NOT NULL DEFAULT 0,
  acce_locked_until        DATETIME(6)  NULL,
  acce_last_login_at       DATETIME(6)  NULL,
  acce_password_changed_at DATETIME(6)  NULL,
  acce_created_at          DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  acce_created_by          BIGINT       NULL,
  acce_updated_at          DATETIME(6)  NULL ON UPDATE CURRENT_TIMESTAMP(6),
  acce_updated_by          BIGINT       NULL,
  PRIMARY KEY (acce_id),
  UNIQUE KEY acce_username_UNIQUE (acce_username),
  KEY fk_accesses_user_id_idx (acce_user_id),
  CONSTRAINT fk_accesses_user FOREIGN KEY (acce_user_id) REFERENCES users (user_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------
-- Seguridad: roles y permisos
-- ---------------------------------------------------------
CREATE TABLE roles (
  role_id          BIGINT      NOT NULL AUTO_INCREMENT,
  role_code        VARCHAR(30) NOT NULL,
  role_name        VARCHAR(50) NOT NULL,
  role_description TEXT        NULL,
  role_is_active   TINYINT     NOT NULL DEFAULT 1,
  role_created_at  DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  role_created_by  BIGINT      NULL,
  role_updated_at  DATETIME(6) NULL ON UPDATE CURRENT_TIMESTAMP(6),
  role_updated_by  BIGINT      NULL,
  PRIMARY KEY (role_id),
  UNIQUE KEY role_code_UNIQUE (role_code)
) ENGINE=InnoDB;

CREATE TABLE permissions (
  perm_id          BIGINT       NOT NULL AUTO_INCREMENT,
  perm_code        VARCHAR(100) NOT NULL,
  perm_name        VARCHAR(100) NOT NULL,
  perm_description TEXT         NULL,
  perm_is_active   TINYINT      NOT NULL DEFAULT 1,
  perm_created_at  DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  perm_created_by  BIGINT       NULL,
  perm_updated_at  DATETIME(6)  NULL ON UPDATE CURRENT_TIMESTAMP(6),
  perm_updated_by  BIGINT       NULL,
  PRIMARY KEY (perm_id),
  UNIQUE KEY perm_code_UNIQUE (perm_code)
) ENGINE=InnoDB;

CREATE TABLE users_roles (
  usro_id         BIGINT      NOT NULL AUTO_INCREMENT,
  user_id         BIGINT      NOT NULL,
  role_id         BIGINT      NOT NULL,
  usro_created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  usro_created_by BIGINT      NULL,
  PRIMARY KEY (usro_id),
  UNIQUE KEY usro_user_role_UNIQUE (user_id, role_id),
  KEY fk_users_roles_role_id_idx (role_id),
  CONSTRAINT fk_users_roles_user FOREIGN KEY (user_id) REFERENCES users (user_id) ON DELETE CASCADE,
  CONSTRAINT fk_users_roles_role FOREIGN KEY (role_id) REFERENCES roles (role_id)
) ENGINE=InnoDB;

CREATE TABLE roles_permissions (
  rope_id         BIGINT      NOT NULL AUTO_INCREMENT,
  role_id         BIGINT      NOT NULL,
  perm_id         BIGINT      NOT NULL,
  rope_created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  rope_created_by BIGINT      NULL,
  PRIMARY KEY (rope_id),
  UNIQUE KEY rope_role_perm_UNIQUE (role_id, perm_id),
  KEY fk_roles_permissions_perm_id_idx (perm_id),
  CONSTRAINT fk_roles_permissions_role FOREIGN KEY (role_id) REFERENCES roles (role_id) ON DELETE CASCADE,
  CONSTRAINT fk_roles_permissions_perm FOREIGN KEY (perm_id) REFERENCES permissions (perm_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- =========================================================
-- Datos iniciales de catálogos
-- =========================================================
INSERT INTO document_types (doty_code, doty_name) VALUES
  ('CC', 'Cédula de ciudadanía'),
  ('TI', 'Tarjeta de identidad'),
  ('CE', 'Cédula de extranjería'),
  ('PA', 'Pasaporte'),
  ('PPT', 'Permiso por protección temporal');

INSERT INTO sexes (sexe_code, sexe_name) VALUES
  ('M', 'Masculino'),
  ('F', 'Femenino'),
  ('I', 'Intersexual');

INSERT INTO genders (gend_code, gend_name) VALUES
  ('MAS', 'Masculino'),
  ('FEM', 'Femenino'),
  ('NB',  'No binario'),
  ('OTR', 'Otro'),
  ('NR',  'Prefiere no responder');

INSERT INTO roles (role_code, role_name, role_description) VALUES
  ('ADMIN',      'Administrador', 'Acceso total al sistema'),
  ('INSTRUCTOR', 'Instructor',    'Gestiona cursos y evaluaciones'),
  ('APRENDIZ',   'Aprendiz',      'Consulta cursos y presenta evaluaciones');

INSERT INTO permissions (perm_code, perm_name) VALUES
  ('USERS_READ',   'Consultar usuarios'),
  ('USERS_CREATE', 'Crear usuarios'),
  ('USERS_UPDATE', 'Editar usuarios'),
  ('USERS_DELETE', 'Eliminar usuarios');

-- ADMIN: todos los permisos; INSTRUCTOR: solo consultar
INSERT INTO roles_permissions (role_id, perm_id)
SELECT r.role_id, p.perm_id FROM roles r CROSS JOIN permissions p WHERE r.role_code = 'ADMIN';
INSERT INTO roles_permissions (role_id, perm_id)
SELECT r.role_id, p.perm_id FROM roles r JOIN permissions p ON p.perm_code = 'USERS_READ' WHERE r.role_code = 'INSTRUCTOR';

-- =========================================================
-- Usuario de MySQL para la aplicación (no usar root)
-- =========================================================
CREATE USER IF NOT EXISTS 'app_registro'@'localhost' IDENTIFIED BY 'Registro2026*';
GRANT SELECT, INSERT, UPDATE, DELETE ON registro_usuarios.* TO 'app_registro'@'localhost';
FLUSH PRIVILEGES;
