// services/adminService.ts

// Usaremos un wrapper simple de fetch que inyecte el token
const API_URL = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:8000/api`;

function getAuthHeaders() {
  const token = localStorage.getItem('vinz_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
}

// ==========================================
// CLIENTES
// ==========================================
export async function getClientes() {
  const response = await fetch(`${API_URL}/clientes/`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error('Error al obtener clientes');
  const data = await response.json();
  return data.results || data;
}

export async function createCliente(data: any) {
  const response = await fetch(`${API_URL}/clientes/`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Error al crear cliente');
  return response.json();
}

export async function createClienteAdmin(data: any) {
  const response = await fetch(`${API_URL}/clientes/registrar_cliente_admin/`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Error al crear cliente desde admin');
  return response.json();
}

// ==========================================
// CATEGORIAS
// ==========================================
export async function getCategorias() {
  const response = await fetch(`${API_URL}/categorias/`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error('Error al obtener categorias');
  const data = await response.json();
  return data.results || data;
}

// ==========================================
// PRODUCTOS
// ==========================================
export async function getProductos() {
  const response = await fetch(`${API_URL}/productos/`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error('Error al obtener productos');
  const data = await response.json();
  return data.results || data;
}

export async function createProducto(data: FormData | any) {
  const isFormData = data instanceof FormData;
  const headers = getAuthHeaders();
  if (isFormData) {
    // @ts-ignore
    delete headers['Content-Type']; // El navegador lo asigna con el boundary correcto
  }
  
  const response = await fetch(`${API_URL}/productos/`, {
    method: 'POST',
    headers: headers,
    body: isFormData ? data : JSON.stringify(data),
  });
  if (!response.ok) {
    const errText = await response.text();
    throw new Error(errText);
  }
  return response.json();
}

export async function updateProducto(id: string, data: FormData | any) {
  const isFormData = data instanceof FormData;
  const headers = getAuthHeaders();
  if (isFormData) {
    // @ts-ignore
    delete headers['Content-Type'];
  }
  
  const response = await fetch(`${API_URL}/productos/${id}/`, {
    method: 'PATCH',
    headers: headers,
    body: isFormData ? data : JSON.stringify(data),
  });
  if (!response.ok) {
    const errText = await response.text();
    throw new Error(errText);
  }
  return response.json();
}

export async function deleteProducto(id: string) {
  const response = await fetch(`${API_URL}/productos/${id}/`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error('Error al eliminar producto');
  return true;
}

// ==========================================
// PEDIDOS
// ==========================================
export async function getPedidos() {
  const response = await fetch(`${API_URL}/pedidos/`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error('Error al obtener pedidos');
  const data = await response.json();
  return data.results || data;
}

export async function updateEstadoPedido(id: string, estado: string) {
  const response = await fetch(`${API_URL}/pedidos/${id}/`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify({ estado }),
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error('Error al actualizar estado del pedido: ' + text);
  }
  return response.json();
}

// Procedimiento Transaccional
export async function crearPedidoCompleto(data: { cliente_id: string, notas: string, detalles: { producto_id: string, cantidad: number }[] }) {
  const response = await fetch(`${API_URL}/pedidos/crear_completo/`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Error al procesar el pedido transaccional');
  return response.json();
}
