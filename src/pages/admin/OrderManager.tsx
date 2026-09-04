import { Package, Clock, CheckCircle, ChefHat, Receipt } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import { getPedidos, updateEstadoPedido } from '../../services/adminService';
import { ProductionSummaryModal } from '../../components/admin/ProductionSummaryModal';
import { FacturaModal } from '../../components/admin/FacturaModal';
import { useLockBodyScroll } from '../../hooks/useLockBodyScroll';
import { TableSkeleton } from '../../components/ui/Skeleton';

export function OrderManager() {
  const [pedidos, setPedidos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProdModalOpen, setIsProdModalOpen] = useState(false);
  const [isFacturaModalOpen, setIsFacturaModalOpen] = useState(false);
  const [filterTab, setFilterTab] = useState<'Pendientes' | 'Transito' | 'Historial'>('Pendientes');

  // Paginación y Filtrado
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(() => {
    const saved = localStorage.getItem('orderManager_itemsPerPage');
    return saved ? parseInt(saved, 10) : 7;
  });
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>(() => {
    return (localStorage.getItem('orderManager_sortOrder') as 'desc' | 'asc') || 'desc';
  });

  useEffect(() => {
    localStorage.setItem('orderManager_itemsPerPage', itemsPerPage.toString());
  }, [itemsPerPage]);

  useEffect(() => {
    localStorage.setItem('orderManager_sortOrder', sortOrder);
  }, [sortOrder]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filterTab, itemsPerPage]);

  useEffect(() => {
    cargarPedidos();
  }, []);

  useLockBodyScroll(isModalOpen || isProdModalOpen || isFacturaModalOpen);

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

  const filteredPedidos = useMemo(() => {
    return pedidos.filter(pedido => {
      if (filterTab === 'Pendientes') {
        return ['Pendiente', 'Nuevo', 'Elaborado'].includes(pedido.estado);
      }
      if (filterTab === 'Transito') {
        return ['En Tránsito', 'En Ruta'].includes(pedido.estado);
      }
      if (filterTab === 'Historial') {
        return ['Entregado', 'Cancelado'].includes(pedido.estado);
      }
      return true;
    });
  }, [pedidos, filterTab]);

  const sortedPedidos = useMemo(() => {
    return [...filteredPedidos].sort((a, b) => {
      const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
      const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
      return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    });
  }, [filteredPedidos, sortOrder]);

  const totalPages = Math.ceil(sortedPedidos.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = sortedPedidos.slice(startIndex, startIndex + itemsPerPage);

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
    <div className="max-w-5xl mx-auto pt-2 pb-8 md:pt-4 md:pb-8 mb-20 transition-colors duration-300">
      {/* Header */}
      <div className="mb-16 mt-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-sm tracking-[0.3em] text-tertiary dark:text-[#e3b54a] font-bold uppercase mb-2">Despacho</h2>
          <h1 className="text-5xl md:text-7xl font-headline-xl text-primary dark:text-white">Pedidos.</h1>
        </div>
        <button 
          onClick={() => setIsProdModalOpen(true)}
          className="flex items-center gap-2 bg-tertiary text-white dark:bg-[#e3b54a] dark:text-black hover:bg-tertiary/90 dark:hover:bg-[#e3b54a]/90 px-6 py-3 rounded-xl font-bold transition-all shadow-md hover:shadow-lg w-max"
        >
          <ChefHat className="w-5 h-5" />
          Resumen de Producción
        </button>
      </div>

      <div className="bg-white dark:bg-[#0f0f0f] border border-outline-variant/50 dark:border-white/5 rounded-3xl p-6 md:p-10 shadow-xl dark:shadow-2xl relative overflow-hidden transition-colors duration-300">
        {/* Decorative background */}
        <div className="absolute top-0 right-0 p-12 opacity-[0.03] dark:opacity-5 pointer-events-none">
          <Package className="w-96 h-96 text-primary dark:text-white" />
        </div>

        <div className="relative z-10">
          <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-8 border-b border-outline-variant/50 dark:border-white/10 pb-4">
            <div className="flex gap-4 overflow-x-auto hide-scrollbar">
              <button 
                onClick={() => setFilterTab('Pendientes')}
                className={`pb-2 font-bold px-4 whitespace-nowrap transition-colors ${filterTab === 'Pendientes' ? 'text-tertiary dark:text-[#e3b54a] border-b-2 border-tertiary dark:border-[#e3b54a]' : 'text-on-surface-variant/50 hover:text-on-surface dark:text-white/40 dark:hover:text-white'}`}
              >
                Nuevos / Pendientes
              </button>
              <button 
                onClick={() => setFilterTab('Transito')}
                className={`pb-2 font-bold px-4 whitespace-nowrap transition-colors ${filterTab === 'Transito' ? 'text-tertiary dark:text-[#e3b54a] border-b-2 border-tertiary dark:border-[#e3b54a]' : 'text-on-surface-variant/50 hover:text-on-surface dark:text-white/40 dark:hover:text-white'}`}
              >
                En Tránsito
              </button>
              <button 
                onClick={() => setFilterTab('Historial')}
                className={`pb-2 font-bold px-4 whitespace-nowrap transition-colors ${filterTab === 'Historial' ? 'text-tertiary dark:text-[#e3b54a] border-b-2 border-tertiary dark:border-[#e3b54a]' : 'text-on-surface-variant/50 hover:text-on-surface dark:text-white/40 dark:hover:text-white'}`}
              >
                Historial
              </button>
            </div>
            <button 
              onClick={() => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
              className="px-4 py-1.5 bg-surface-variant/30 dark:bg-white/5 text-on-surface dark:text-white rounded-full text-[10px] font-bold border border-outline-variant/30 dark:border-white/10 hover:bg-surface-variant/50 dark:hover:bg-white/10 transition-colors uppercase tracking-wider"
            >
              Orden: {sortOrder === 'desc' ? 'Más recientes' : 'Más antiguos'}
            </button>
          </div>

          <div className="space-y-4">
            {loading ? (
              <div className="py-4">
                <TableSkeleton columns={4} rows={5} />
              </div>
            ) : sortedPedidos.length === 0 ? (
              <div className="text-center py-8 text-on-surface-variant/50">No hay pedidos en esta sección.</div>
            ) : currentItems.map((pedido) => (
              <div key={pedido.id} className="group flex flex-col md:flex-row md:items-center justify-between p-6 bg-surface dark:bg-[#1a1a1a] rounded-2xl border border-outline-variant/50 dark:border-white/5 hover:border-tertiary/40 dark:hover:border-[#e3b54a]/30 transition-colors shadow-sm hover:shadow-md dark:shadow-none">
                <div className="flex items-start gap-4 mb-4 md:mb-0">
                  <div className={`p-3 rounded-xl flex-shrink-0 ${
                    pedido.estado === 'Pendiente' ? 'bg-primary-container/20 text-primary-container dark:bg-[#e3b54a]/10 dark:text-[#e3b54a]' : 
                    pedido.estado === 'Elaborado' ? 'bg-teal-100 text-teal-600 dark:bg-teal-500/10 dark:text-teal-400' : 
                    ['En Ruta', 'En Tránsito'].includes(pedido.estado) ? 'bg-blue-100 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400' : 
                    pedido.estado === 'Cancelado' ? 'bg-red-100 text-red-600 dark:bg-red-500/10 dark:text-red-400' :
                    'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400'
                  }`}>
                    {pedido.estado === 'Pendiente' ? <Clock className="w-6 h-6" /> : 
                     pedido.estado === 'Elaborado' ? <CheckCircle className="w-6 h-6" /> : 
                     ['En Ruta', 'En Tránsito'].includes(pedido.estado) ? <Package className="w-6 h-6" /> : 
                     <CheckCircle className="w-6 h-6" />}
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-on-surface-variant/70 dark:text-white/40 font-bold mb-1">Tienda / Razón Social</p>
                    <h3 className="text-xl font-headline-lg text-on-surface dark:text-white group-hover:text-tertiary dark:group-hover:text-[#e3b54a] transition-colors">{pedido.cliente_nombre}</h3>
                    <div className="flex flex-wrap items-center gap-3 text-sm mt-1">
                      <span className="text-on-surface-variant/70 dark:text-white/40 font-mono text-xs">{pedido.id?.substring(0, 8).toUpperCase()}</span>
                      <span className="w-1 h-1 bg-outline-variant dark:bg-white/20 rounded-full hidden sm:block"></span>
                      <span className="text-on-surface-variant/70 dark:text-white/40">
                        {pedido.created_at ? new Date(pedido.created_at).toLocaleDateString() : 'N/A'}
                      </span>
                      {pedido.fecha_entrega_esperada_inicio && pedido.fecha_entrega_esperada_fin && (
                        <>
                          <span className="w-1 h-1 bg-outline-variant dark:bg-white/20 rounded-full hidden sm:block"></span>
                          <span className="text-primary dark:text-[#e3b54a] font-bold text-xs bg-primary/10 dark:bg-[#e3b54a]/10 px-2 py-0.5 rounded-md">
                            Entrega: {new Date(pedido.fecha_entrega_esperada_inicio + "T12:00:00").toLocaleDateString('es-HN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} - {new Date(pedido.fecha_entrega_esperada_fin + "T12:00:00").toLocaleDateString('es-HN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between md:justify-end gap-6">
                  <div className="text-right flex items-center gap-4">
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-on-surface-variant/70 dark:text-white/40 font-bold mb-1">Total</p>
                      <p className="text-xl font-bold text-tertiary dark:text-[#e3b54a]">L {pedido.total}</p>
                    </div>
                    {['En Tránsito', 'Entregado'].includes(pedido.estado) && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedOrder(pedido);
                          setIsFacturaModalOpen(true);
                        }}
                        className="p-3 bg-tertiary/10 text-tertiary dark:bg-[#e3b54a]/10 dark:text-[#e3b54a] rounded-xl hover:bg-tertiary hover:text-white transition-colors"
                        title="Ver Factura"
                      >
                        <Receipt className="w-5 h-5" />
                      </button>
                    )}
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

          {/* Footer Paginación */}
          {sortedPedidos.length > 0 && (
            <div className="mt-8 pt-6 border-t border-outline-variant/30 dark:border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <p className="text-sm text-on-surface-variant dark:text-white/60 font-medium">
                  <span className="font-bold text-primary dark:text-white">{startIndex + 1}</span> - <span className="font-bold text-primary dark:text-white">{Math.min(startIndex + itemsPerPage, sortedPedidos.length)}</span> de <span className="font-bold text-primary dark:text-white">{sortedPedidos.length}</span> pedidos
                </p>
                
                <div className="flex items-center gap-2">
                  <span className="text-xs text-on-surface-variant dark:text-white/40">Por pág:</span>
                  <div className="flex bg-white dark:bg-[#1a1a1a] rounded-lg border border-outline-variant/50 dark:border-white/10 overflow-hidden">
                    {[4, 7, 10].map(num => (
                      <button
                        key={num}
                        onClick={() => setItemsPerPage(num)}
                        className={`px-3 py-1 text-xs font-bold transition-colors ${itemsPerPage === num ? 'bg-primary text-white dark:bg-white dark:text-black' : 'text-on-surface-variant hover:bg-surface dark:text-white/60 dark:hover:bg-white/5'}`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="w-8 h-8 flex items-center justify-center rounded-lg border border-outline-variant/50 dark:border-white/10 text-on-surface-variant hover:bg-surface dark:hover:bg-white/5 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  {'<'}
                </button>
                <span className="text-sm font-bold w-10 text-center text-primary dark:text-white">
                  {currentPage} / {totalPages}
                </span>
                <button 
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="w-8 h-8 flex items-center justify-center rounded-lg border border-outline-variant/50 dark:border-white/10 text-on-surface-variant hover:bg-surface dark:hover:bg-white/5 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  {'>'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal de Gestión de Pedido */}
      {isModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-surface dark:bg-[#0f0f0f] w-full max-w-2xl rounded-3xl p-6 md:p-8 shadow-2xl border border-outline-variant/30 dark:border-white/10 relative max-h-[90vh] overflow-y-auto hide-scrollbar">
            <h2 className="text-2xl font-bold text-primary dark:text-white mb-2">Gestionar Pedido</h2>
            <p className="text-sm text-on-surface-variant/70 dark:text-white/40 mb-6">Pedido {selectedOrder.id}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="bg-white dark:bg-[#1a1a1a] p-4 rounded-xl border border-outline-variant/30 dark:border-white/5">
                <p className="text-xs font-bold text-tertiary dark:text-[#e3b54a] uppercase tracking-wider mb-1">Tienda Solicitante</p>
                <p className="font-semibold text-on-surface dark:text-white text-lg">{selectedOrder.cliente_nombre}</p>
              </div>
              <div className="bg-white dark:bg-[#1a1a1a] p-4 rounded-xl border border-outline-variant/30 dark:border-white/5">
                <p className="text-xs font-bold text-tertiary dark:text-[#e3b54a] uppercase tracking-wider mb-1">Total</p>
                <p className="font-semibold text-on-surface dark:text-white">L {selectedOrder.total}</p>
              </div>
              {selectedOrder.fecha_entrega_esperada_inicio && selectedOrder.fecha_entrega_esperada_fin && (
                <div className="md:col-span-2 bg-primary-container/20 dark:bg-[#e3b54a]/10 p-4 rounded-xl border border-primary/20 dark:border-[#e3b54a]/20">
                  <p className="text-xs font-bold text-primary dark:text-[#e3b54a] uppercase tracking-wider mb-1">Ventana de Entrega Asignada</p>
                  <p className="font-semibold text-on-surface dark:text-white text-sm">
                    {new Date(selectedOrder.fecha_entrega_esperada_inicio + "T12:00:00").toLocaleDateString('es-HN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} a {new Date(selectedOrder.fecha_entrega_esperada_fin + "T12:00:00").toLocaleDateString('es-HN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                </div>
              )}
            </div>

            <div className="mb-6">
              <p className="text-xs font-bold text-on-surface-variant dark:text-white/60 uppercase tracking-wider mb-2">Detalles del Pedido</p>
              <div className="premium-table-card mt-2">
                <table className="premium-table">
                  <thead>
                    <tr>
                      <th>Producto</th>
                      <th className="text-center">Cant.</th>
                      <th className="text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedOrder.detalles?.map((det: any) => (
                      <tr key={det.id}>
                        <td>{det.producto_nombre} <span className="text-[10px] text-on-surface-variant/50 ml-2">({det.producto_sku})</span></td>
                        <td className="text-center font-bold">{Math.round(Number(det.cantidad))}</td>
                        <td className="text-right">L {det.subtotal}</td>
                      </tr>
                    ))}
                    {(!selectedOrder.detalles || selectedOrder.detalles.length === 0) && (
                      <tr><td colSpan={3} className="text-center opacity-50 py-6">Sin detalles.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-xs font-bold mb-2 text-on-surface-variant dark:text-white/60 uppercase tracking-wider">Actualizar Estado</label>
              <div className="flex items-center gap-4">
                <select 
                  value={selectedOrder.estado} 
                  onChange={e => handleStatusChange(selectedOrder.id, e.target.value)}
                  className="flex-1 bg-white dark:bg-black border border-outline-variant/50 dark:border-white/10 rounded-xl py-3 px-4 text-on-surface dark:text-white focus:outline-none focus:border-tertiary dark:focus:border-[#e3b54a]"
                >
                  <option value="Pendiente">Pendiente</option>
                  <option value="Elaborado">Elaborado</option>
                  <option value="En Tránsito">En Tránsito</option>
                  <option value="Entregado">Entregado</option>
                  <option value="Cancelado">Cancelado</option>
                </select>
                
                {selectedOrder.estado === 'Entregado' && (
                  <button 
                    onClick={() => setIsFacturaModalOpen(true)}
                    className="shrink-0 flex items-center gap-2 px-6 py-3 bg-tertiary text-white dark:bg-[#e3b54a] dark:text-black font-bold rounded-xl hover:opacity-80 transition-opacity"
                  >
                    <Receipt className="w-5 h-5" />
                    Ver Factura
                  </button>
                )}
              </div>
            </div>
            
            <div className="flex justify-end gap-3 pt-4 border-t border-outline-variant/30 dark:border-white/10 mt-6">
              <button onClick={() => setIsModalOpen(false)} className="px-6 py-2 rounded-full font-bold bg-primary text-white hover:bg-tertiary dark:bg-white/10 dark:text-white dark:hover:bg-white/20 transition-colors">
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Production Summary Modal */}
      {isProdModalOpen && (
        <ProductionSummaryModal 
          isOpen={isProdModalOpen} 
          onClose={() => setIsProdModalOpen(false)}
          pedidos={pedidos}
          onOrdersUpdated={cargarPedidos}
        />
      )}

      {/* Factura Modal */}
      <FacturaModal
        isOpen={isFacturaModalOpen}
        onClose={() => setIsFacturaModalOpen(false)}
        pedido={selectedOrder}
      />
    </div>
  );
}
