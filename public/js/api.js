// public/js/api.js
// Todas las peticiones HTTP al backend. Ningún otro archivo usa fetch.

// Error con el código HTTP y los errores por campo que envía el servidor
export class ApiError extends Error {
  constructor(message, status, errors = {}) {
    super(message);
    this.status = status;
    this.errors = errors;
  }
}

// Función base: hace la petición, lee el JSON y lanza ApiError si falla
async function request(url, options = {}) {
  let response;
  try {
    response = await fetch(url, {
      headers: { 'Content-Type': 'application/json' },
      ...options
    });
  } catch {
    throw new ApiError('No hay conexión con el servidor. Verifica que esté en ejecución.', 0);
  }

  const body = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new ApiError(body.message || `Error ${response.status}`, response.status, body.errors);
  }
  return body;
}

export function getCatalogs() {
  return request('/api/catalogs');
}

export function getUsers() {
  return request('/api/users');
}

export function createUser(user) {
  return request('/api/users', {
    method: 'POST',
    body: JSON.stringify(user)
  });
}