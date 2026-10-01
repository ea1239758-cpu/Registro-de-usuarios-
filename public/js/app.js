// public/js/app.js
// Controla la vista: llena el formulario, valida, envía y pinta la lista.
import { getCatalogs, getUsers, createUser } from './api.js';

// ---------- Referencias al DOM ----------
const form = document.getElementById('userForm');
const rolesList = document.getElementById('rolesList');
const userList = document.getElementById('userList');
const userCount = document.getElementById('userCount');
const formMessage = document.getElementById('formMessage');
const submitBtn = document.getElementById('submitBtn');
const togglePassword = document.getElementById('togglePassword');

// ---------- Utilidades ----------
function escapeHtml(value) {
  const div = document.createElement('div');
  div.textContent = value ?? '';
  return div.innerHTML;
}

function fillSelect(select, items, placeholder) {
  select.innerHTML = '';
  select.append(new Option(placeholder, ''));
  items.forEach((item) => select.append(new Option(item.name, item.id)));
}

function setMessage(text, type = '') {
  formMessage.textContent = text;
  formMessage.className = `form-message ${type}`;
}

function clearErrors() {
  form.querySelectorAll('[data-error]').forEach((el) => (el.textContent = ''));
  form.querySelectorAll('.field.invalid').forEach((el) => el.classList.remove('invalid'));
}

function showErrors(errors = {}) {
  let firstInput = null;
  for (const [field, message] of Object.entries(errors)) {
    const slot = form.querySelector(`[data-error="${field}"]`);
    if (slot) slot.textContent = message;

    const input = form.elements[field];
    if (input instanceof HTMLElement) {
      input.closest('.field')?.classList.add('invalid');
      firstInput ??= input;
    }
  }
  (firstInput || rolesList.querySelector('input'))?.focus();
}

// ---------- Leer y validar el formulario ----------
function readForm() {
  const fd = new FormData(form);
  return {
    firstName: fd.get('firstName').trim(),
    lastName: fd.get('lastName').trim(),
    documentTypeId: fd.get('documentTypeId'),
    documentNumber: fd.get('documentNumber').trim(),
    email: fd.get('email').trim(),
    phoneNumber: fd.get('phoneNumber').trim(),
    sexId: fd.get('sexId'),
    genderId: fd.get('genderId'),
    username: fd.get('username').trim(),
    password: fd.get('password'),
    roleIds: fd.getAll('roleIds').map(Number)
  };
}

// Validación rápida en el navegador. La definitiva la hace el servidor.
function validate(data) {
  const errors = {};
  if (!data.firstName) errors.firstName = 'Escribe los nombres.';
  if (!data.lastName) errors.lastName = 'Escribe los apellidos.';
  if (!data.documentTypeId) errors.documentTypeId = 'Selecciona el tipo de documento.';
  if (!/^[A-Za-z0-9-]{3,30}$/.test(data.documentNumber)) errors.documentNumber = 'Usa entre 3 y 30 letras, números o guiones.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) errors.email = 'Escribe un correo válido.';
  if (data.phoneNumber && !/^\+?[0-9 ]{7,20}$/.test(data.phoneNumber)) errors.phoneNumber = 'Usa solo números (7 a 20 dígitos).';
  if (!data.sexId) errors.sexId = 'Selecciona el sexo.';
  if (!/^[a-zA-Z0-9._-]{4,50}$/.test(data.username)) errors.username = 'Entre 4 y 50 caracteres: letras, números, punto, guion o guion bajo.';
  if (data.password.length < 8) errors.password = 'La contraseña debe tener al menos 8 caracteres.';
  if (data.roleIds.length === 0) errors.roleIds = 'Asigna al menos un rol.';
  return errors;
}

// ---------- Pintar datos ----------
function renderRoles(roles) {
  rolesList.innerHTML = roles.map((role) => `
    <label class="role">
      <input type="checkbox" name="roleIds" value="${role.id}">
      <span class="role-body">
        <strong>${escapeHtml(role.name)}</strong>
        ${role.description ? `<small>${escapeHtml(role.description)}</small>` : ''}
      </span>
    </label>`).join('');
}

function renderUsers(users, highlightId) {
  userCount.textContent = users.length === 1 ? '1 usuario' : `${users.length} usuarios`;

  if (users.length === 0) {
    userList.innerHTML = '<li class="empty">Aún no hay usuarios. Registra el primero con el formulario.</li>';
    return;
  }

  userList.innerHTML = users.map((u) => {
    const roles = (u.roles || '').split(', ').filter(Boolean)
      .map((r) => `<span class="tag">${escapeHtml(r)}</span>`).join('');
    return `
      <li class="${u.id === highlightId ? 'new' : ''}">
        <div class="name">${escapeHtml(u.firstName)} ${escapeHtml(u.lastName)}</div>
        <div class="meta">${escapeHtml(u.documentType)} ${escapeHtml(u.documentNumber)} · ${escapeHtml(u.email)}</div>
        <div class="meta">Usuario: ${escapeHtml(u.username)}</div>
        <div class="tags">${roles}</div>
      </li>`;
  }).join('');
}

// ---------- Cargar datos del servidor ----------
async function loadCatalogs() {
  const { documentTypes, sexes, genders, roles } = await getCatalogs();
  fillSelect(form.elements.documentTypeId, documentTypes, 'Selecciona…');
  fillSelect(form.elements.sexId, sexes, 'Selecciona…');
  fillSelect(form.elements.genderId, genders, 'Sin especificar');
  renderRoles(roles);
}

async function loadUsers(highlightId) {
  const users = await getUsers();
  renderUsers(users, highlightId);
}

// ---------- Eventos ----------
form.addEventListener('submit', async (event) => {
  event.preventDefault();          // evita que el navegador recargue la página
  clearErrors();
  setMessage('');

  const data = readForm();
  const errors = validate(data);
  if (Object.keys(errors).length > 0) {
    showErrors(errors);
    setMessage('Revisa los campos marcados.', 'bad');
    return;
  }

  submitBtn.disabled = true;
  submitBtn.textContent = 'Registrando…';

  try {
    const result = await createUser(data);
    form.reset();
    setMessage(result.message, 'ok');
    await loadUsers(result.id);
    form.elements.firstName.focus();
  } catch (err) {
    showErrors(err.errors);
    setMessage(err.message, 'bad');
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Registrar usuario';
  }
});

form.addEventListener('reset', () => {
  clearErrors();
  setMessage('');
});

// Quita el error del campo apenas el usuario lo corrige
form.addEventListener('input', (event) => {
  const field = event.target.closest('.field');
  if (field) {
    field.classList.remove('invalid');
    const slot = field.querySelector('[data-error]');
    if (slot) slot.textContent = '';
  }
  if (event.target.name === 'roleIds') {
    form.querySelector('[data-error="roleIds"]').textContent = '';
  }
});

togglePassword.addEventListener('click', () => {
  const input = form.elements.password;
  const show = input.type === 'password';
  input.type = show ? 'text' : 'password';
  togglePassword.textContent = show ? 'Ocultar' : 'Mostrar';
  togglePassword.setAttribute('aria-pressed', String(show));
});

// ---------- Inicio ----------
async function init() {
  try {
    await loadCatalogs();
    await loadUsers();
  } catch (err) {
    setMessage(err.message, 'bad');
  }
}

init();