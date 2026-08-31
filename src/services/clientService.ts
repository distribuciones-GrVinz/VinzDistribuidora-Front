const API_URL = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:8000/api`;

export interface OrderDetailPayload {
  producto_id: string;
  cantidad: number;
}

export interface CreateOrderPayload {
  notas: string;
  detalles: OrderDetailPayload[];
}

export const clientService = {
  /**
   * Crea un pedido completo con sus detalles a través de la transacción atómica
   */
  async crearPedido(token: string, payload: CreateOrderPayload) {
    const response = await fetch(`${API_URL}/pedidos/crear_completo/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || errorData[0] || 'Error al crear el pedido');
    }

    return await response.json();
  },

  /**
   * Obtiene el historial de pedidos del cliente autenticado
   */
  async getMisPedidos(token: string) {
    const response = await fetch(`${API_URL}/pedidos/`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error('Error al obtener el historial de pedidos');
    }

    const data = await response.json();
    return data.results || data;
  },

  /**
   * Obtiene la configuración de despachos (fechas estimadas)
   */
  async getConfiguracionDespacho(token: string) {
    const response = await fetch(`${API_URL}/configuraciones-entrega/`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error('Error al obtener configuración de entrega');
    }

    return await response.json();
  }
};
