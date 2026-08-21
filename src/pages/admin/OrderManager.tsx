import { Package, Clock, CheckCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getPedidos, updateEstadoPedido } from '../../services/adminService';

export function OrderManager() {
  const [pedidos, setPedidos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    cargarPedidos();
  }, []);

  const cargarPedidos = async () => {
    try {
      setLoading(true);
      const data = await getPedidos();
      setPedidos(data);
    } catch (error) {
      console.error('Error al cargar pedidos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (pedidoId: string, nuevoEstado: string) => {
    try {
      await updateEstadoPedido(pedidoId, nuevoEstado);
      cargarPedidos();
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error actualizando estado', error);
      alert('Error al actualizar estado del pedido');
    }
  };

  const openModal = (pedido: any) => {
    setSelectedOrder(pedido);
    setIsModalOpen(true);
  };

  return (
    <div className="max-w-5xl mx-auto py-8 mb-20 transition-colors duration-300">
      {/* Header */}
      <div className="mb-16 mt-8">
        <h2 className="text-sm tracking-[0.3em] text-tertiary dark:text-[#e3b54a] font-bold uppercase mb-2">Despacho</h2>
        <h1 className="text-5xl md:text-7xl font-headline-xl text-primary dark:text-white">Pedidos.</h1>
      </div>

      <div className="bg-white dark:bg-[#0f0f0f] border border-outline-variant/50 dark:border-white/5 rounded-3xl p-6 md:p-10 shadow-xl dark:shadow-2xl relative overflow-hidden transition-colors duration-300">
        {/* Decorative background */}
        <div className="absolute top-0 right-0 p-12 opacity-[0.03] dark:opacity-5 pointer-events-none">
          <Package className="w-96 h-96 text-primary dark:text-white" />
        </div>

        <div className="relative z-10">
          <div className="flex gap-4 mb-8 border-b border-outline-variant/50 dark:border-white/10 pb-4 overflow-x-auto hide-scrollbar">
            <button className="text-tertiary dark:text-[#e3b54a] border-b-2 border-tertiary dark:border-[#e3b54a] pb-2 font-bold px-4 whitespace-nowrap">Nuevos / Pendientes</button>
            <button className="text-on-surface-variant/50 hover:text-on-surface dark:text-white/40 dark:hover:text-white pb-2 font-bold px-4 transition-colors whitespace-nowrap">En Tránsito</button>
            <button className="text-on-surface-variant/50 hover:text-on-surface dark:text-white/40 dark:hover:text-white pb-2 font-bold px-4 transition-colors whitespace-nowrap">Historial</button>
          </div>

          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-8 text-on-surface-variant/50">Cargando pedidos...</div>
            ) : pedidos.length === 0 ? (
              <div className="text-center py-8 text-on-surface-variant/50">No hay pedidos disponibles.</div>
            ) : pedidos.map((pedido) => (
              <div key={pedido.id} className="group flex flex-col md:flex-row md:items-center justify-between p-6 bg-surface dark:bg-[#1a1a1a] rounded-2xl border border-outline-variant/50 dark:border-white/5 hover:border-tertiary/40 dark:hover:border-[#e3b54a]/30 transition-colors shadow-sm hover:shadow-md dark:shadow-none">
                <div className="flex items-start gap-4 mb-4 md:mb-0">
                  <div className={`p-3 rounded-xl flex-shrink-0 ${pedido.estado === 'Pendiente' ? 'bg-primary-container/20 text-primary-container dark:bg-[#e3b54a]/10 dark:text-[#e3b54a]' : pedido.estado === 'En Ruta' ? 'bg-blue-100 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400' : 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400'}`}>
                    {pedido.estado === 'Pendiente' ? <Clock className="w-6 h-6" /> : pedido.estado === 'En Ruta' || pedido.estado === 'En Tránsito' ? <Package className="w-6 h-6" /> : <CheckCircle className="w-6 h-6" />}
                  </div>
                  <div>
                    <h3 className="text-xl font-headline-lg text-on-surface dark:text-white group-hover:text-tertiary dark:group-hover:text-[#e3b54a] transition-colors">{pedido.cliente_nombre}</h3>
                    <div className="flex items-center gap-3 text-sm mt-1">
                      <span className="text-on-surface-variant/70 dark:text-white/40">{pedido.id?.substring(0, 8).toUpperCase()}</span>
                      <span className="w-1 h-1 bg-outline-variant dark:bg-white/20 rounded-full"></span>
                      <span className="text-on-surface-variant/70 dark:text-white/40">
                        {pedido.created_at ? new Date(pedido.created_at).toLocaleDateString() : 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between md:justify-end gap-6">
                  <div className="text-right">
                    <p className="text-[10px] tracking-widest uppercase text-on-surface-variant/60 dark:text-white/40 font-bold mb-1">Total</p>
                    <p className="text-xl text-on-surface dark:text-white font-light">L {pedido.total}</p>
                  </div>
                  <button 
                    onClick={() => openModal(pedido)}
                    className="px-6 py-2 bg-white dark:bg-white/5 hover:bg-tertiary hover:text-white dark:hover:bg-[#e3b54a] dark:hover:text-black text-tertiary dark:text-white font-bold rounded-full transition-all border border-outline-variant/50 dark:border-white/10 hover:border-transparent text-sm cursor-pointer shadow-sm dark:shadow-none hover:shadow-md"
                  >
                    Revisar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal de Gestión de Pedido */}
      {isModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-surface dark:bg-[#0f0f0f] w-full max-w-2xl rounded-3xl p-6 md:p-8 shadow-2xl border border-outline-variant/30 dark:border-white/10 relative max-h-[90vh] overflow-y-auto hide-scrollbar">
            <h2 className="text-2xl font-bold text-primary dark:text-white mb-2">Gestionar Pedido</h2>
            <p className="text-sm text-on-surface-variant/70 dark:text-white/40 mb-6">Pedido {selectedOrder.id}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="bg-white dark:bg-[#1a1a1a] p-4 rounded-xl border border-outline-variant/30 dark:border-white/5">
                <p className="text-xs font-bold text-tertiary dark:text-[#e3b54a] uppercase tracking-wider mb-1">Cliente</p>
                <p className="font-semibold text-on-surface dark:text-white">{selectedOrder.cliente_nombre}</p>
              </div>
              <div className="bg-white dark:bg-[#1a1a1a] p-4 rounded-xl border border-outline-variant/30 dark:border-white/5">
                <p className="text-xs font-bold text-tertiary dark:text-[#e3b54a] uppercase tracking-wider mb-1">Total</p>
                <p className="font-semibold text-on-surface dark:text-white">L {selectedOrder.total}</p>
              </div>
            </div>

            <div className="mb-6">
              <p className="text-xs font-bold text-on-surface-variant dark:text-white/60 uppercase tracking-wider mb-2">Detalles del Pedido</p>
              <div className="bg-white dark:bg-[#1a1a1a] rounded-xl border border-outline-variant/30 dark:border-white/5 overflow-hidden">
                <table className="w-full text-left text-sm">
                  <thead className="bg-surface dark:bg-black/20 text-on-surface-variant/70 dark:text-white/40">
                    <tr>
                      <th className="p-3 font-semibold">Producto</th>
                      <th className="p-3 font-semibold">Cant.</th>
                      <th className="p-3 font-semibold text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/20 dark:divide-white/5">
                    {selectedOrder.detalles?.map((det: any) => (
                      <tr key={det.id} className="text-on-surface dark:text-white/90">
                        <td className="p-3">{det.producto_nombre} <span className="text-xs text-on-surface-variant/50">({det.producto_sku})</span></td>
                        <td className="p-3">{det.cantidad}</td>
                        <td className="p-3 text-right">L {det.subtotal}</td>
                      </tr>
                    ))}
                    {(!selectedOrder.detalles || selectedOrder.detalles.length === 0) && (
                      <tr><td colSpan={3} className="p-3 text-center text-on-surface-variant/50">Sin detalles.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-xs font-bold mb-2 text-on-surface-variant dark:text-white/60 uppercase tracking-wider">Actualizar Estado</label>
              <select 
                value={selectedOrder.estado} 
                onChange={e => handleStatusChange(selectedOrder.id, e.target.value)}
                className="w-full bg-white dark:bg-black border border-outline-variant/50 dark:border-white/10 rounded-xl py-3 px-4 text-on-surface dark:text-white focus:outline-none focus:border-tertiary dark:focus:border-[#e3b54a]"
              >
                <option value="Pendiente">Pendiente</option>
                <option value="Confirmado">Confirmado</option>
                <option value="En Tránsito">En Tránsito</option>
                <option value="Entregado">Entregado</option>
                <option value="Cancelado">Cancelado</option>
              </select>
            </div>
            
            <div className="flex justify-end gap-3 pt-4 border-t border-outline-variant/30 dark:border-white/10 mt-6">
              <button onClick={() => setIsModalOpen(false)} className="px-6 py-2 rounded-full font-bold bg-primary text-white hover:bg-tertiary dark:bg-white/10 dark:text-white dark:hover:bg-white/20 transition-colors">
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
