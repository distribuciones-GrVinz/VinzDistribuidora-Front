import { Package, Clock, CheckCircle, ChefHat, Receipt, X, Trash2 } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import { getPedidos, updateEstadoPedido, updateOrderQuantities, getProductos, addDetallePedido } from '../../services/adminService';
import { ProductionSummaryModal } from '../../components/admin/ProductionSummaryModal';
import { FacturaModal } from '../../components/admin/FacturaModal';
import { useLockBodyScroll } from '../../hooks/useLockBodyScroll';
import { TableSkeleton } from '../../components/ui/Skeleton';
import { formatDeliveryDateRange } from '../../utils/dateUtils';

export function OrderManager() {
  const [pedidos, setPedidos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProdModalOpen, setIsProdModalOpen] = useState(false);
  const [isFacturaModalOpen, setIsFacturaModalOpen] = useState(false);
  const [filterTab, setFilterTab] = useState<'Pendientes' | 'Transito' | 'Historial'>('Pendientes');
  
  // Edición de Pedido
  const [isEditMode, setIsEditMode] = useState(false);
  const [editDetails, setEditDetails] = useState<any[]>([]);
  const [editMotivo, setEditMotivo] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  // Agregar Producto a Pedido
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
  const [productosDisponibles, setProductosDisponibles] = useState<any[]>([]);
  const [newProductId, setNewProductId] = useState<string>('');
  const [newProductQuantity, setNewProductQuantity] = useState<number>(1);
  const [isAddingProduct, setIsAddingProduct] = useState(false);

  useEffect(() => {
    if (isAddProductModalOpen && productosDisponibles.length === 0) {
      getProductos().then(res => setProductosDisponibles(res.results || res)).catch(console.error);
    }
  }, [isAddProductModalOpen]);

  const handleAddProduct = async () => {
    if (!newProductId || newProductQuantity <= 0) return;
    setIsAddingProduct(true);
    try {
      await addDetallePedido({
        pedido: selectedOrder.id,
        producto: newProductId,
        cantidad: newProductQuantity
      });
      setIsAddProductModalOpen(false);
      setNewProductId('');
      setNewProductQuantity(1);
      
      // Recargar detalles del pedido
      const res = await getPedidos();
      const items = res.results || res;
      setPedidos(items);
      const updatedOrder = items.find((p: any) => p.id === selectedOrder.id);
      if (updatedOrder) setSelectedOrder(updatedOrder);
      
      alert('Producto agregado exitosamente');
    } catch (e: any) {
      alert(e.message || 'Error al agregar producto');
    } finally {
      setIsAddingProduct(false);
    }
  };

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
      const dateFieldA = filterTab === 'Pendientes' ? a.created_at : a.updated_at;
      const dateFieldB = filterTab === 'Pendientes' ? b.created_at : b.updated_at;
      const dateA = dateFieldA ? new Date(dateFieldA).getTime() : 0;
      const dateB = dateFieldB ? new Date(dateFieldB).getTime() : 0;
      return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    });
  }, [filteredPedidos, sortOrder, filterTab]);

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
    setIsEditMode(false);
    setEditDetails(pedido.detalles ? pedido.detalles.map((d: any) => ({ ...d })) : []);
    setEditMotivo("");
    setIsModalOpen(true);
  };

  const handleUpdateQuantities = async () => {
    if (!editMotivo.trim()) {
      alert("Debes escribir un motivo de modificación.");
      return;
    }
    
    // Validar cantidades
    for (const det of editDetails) {
      if (det.cantidad < 1) {
        alert("Ningún producto puede tener cantidad menor a 1.");
        return;
      }
      const original = selectedOrder.detalles.find((d: any) => d.id === det.id);
      if (original && det.cantidad > original.cantidad) {
        alert("No puedes aumentar la cantidad de un producto por encima de lo solicitado.");
        return;
      }
    }

    try {
      setIsUpdating(true);
      await updateOrderQuantities(selectedOrder.id, editDetails, editMotivo);
      alert("Pedido actualizado correctamente.");
      setIsModalOpen(false);
      cargarPedidos();
    } catch (error: any) {
      console.error('Error actualizando pedido:', error);
      alert(error.message || 'Ocurrió un error al actualizar.');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto pt-2 pb-8 md:pt-4 md:pb-8 mb-20 transition-colors duration-300">
      {/* Header */}
      <div className="mb-10 md:mb-16 mt-2 md:mt-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
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
              <div key={pedido.id} className="group flex flex-col md:flex-row md:items-center justify-between p-4 bg-surface dark:bg-[#1a1a1a] rounded-2xl border border-outline-variant/50 dark:border-white/5 hover:border-tertiary/40 dark:hover:border-[#e3b54a]/30 transition-colors shadow-sm hover:shadow-md dark:shadow-none">
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
                            <p className="text-xs font-medium text-tertiary dark:text-[#e3b54a] mt-2 bg-primary/10 dark:bg-[#e3b54a]/10 px-3 py-1 rounded-full inline-block">
                      Entrega: {formatDeliveryDateRange(pedido.fecha_entrega_esperada_inicio, pedido.fecha_entrega_esperada_fin)}
                    </p>
                        </>
                      )}
                    </div>
                    {pedido.detalles && pedido.detalles.length > 0 && (
                      <p className="text-xs text-on-surface-variant/70 dark:text-white/50 mt-1 line-clamp-1">
                        <span className="font-semibold">{pedido.detalles.length} artículo{pedido.detalles.length !== 1 ? 's' : ''}:</span> {pedido.detalles.map((d: any) => d.producto_nombre).join(', ')}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between md:justify-end gap-2 sm:gap-6 mt-2 pt-4 border-t border-outline-variant/20 dark:border-white/10 md:mt-0 md:pt-0 md:border-0 w-full md:w-auto">
                  <div className="text-left md:text-right">
                    <p className="text-[10px] uppercase tracking-widest text-on-surface-variant/70 dark:text-white/40 font-bold mb-0.5 md:mb-1">Total</p>
                    <p className="text-lg md:text-xl font-bold text-tertiary dark:text-[#e3b54a] whitespace-nowrap">L {pedido.total}</p>
                  </div>
                  
                  <div className="flex items-center gap-2 md:gap-4">
                    {['En Tránsito', 'Entregado'].includes(pedido.estado) && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedOrder(pedido);
                          setIsFacturaModalOpen(true);
                        }}
                        className="p-2 md:p-3 bg-tertiary/10 text-tertiary dark:bg-[#e3b54a]/10 dark:text-[#e3b54a] rounded-xl hover:bg-tertiary hover:text-white transition-colors"
                        title="Ver Factura"
                      >
                        <Receipt className="w-5 h-5 md:w-5 md:h-5" />
                      </button>
                    )}
                    <button 
                      onClick={() => openModal(pedido)}
                      className="px-5 md:px-6 py-2.5 md:py-2 bg-white dark:bg-white/5 hover:bg-tertiary hover:text-white dark:hover:bg-[#e3b54a] dark:hover:text-black text-tertiary dark:text-white font-bold rounded-full transition-all border border-outline-variant/50 dark:border-white/10 hover:border-transparent text-sm cursor-pointer shadow-sm dark:shadow-none hover:shadow-md"
                    >
                      Revisar
                    </button>
                  </div>
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
          <div className="bg-surface dark:bg-[#0f0f0f] w-full max-w-2xl rounded-3xl p-4 sm:p-6 md:p-8 shadow-2xl border border-outline-variant/30 dark:border-white/10 relative max-h-[90vh] overflow-y-auto hide-scrollbar flex flex-col">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-bold text-primary dark:text-white mb-2">Gestionar Pedido</h2>
                <p className="text-sm text-on-surface-variant/70 dark:text-white/40">Pedido {selectedOrder.id}</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-red-50 dark:bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-colors group"
                aria-label="Cerrar"
              >
                <X className="w-5 h-5 transition-transform duration-300 group-hover:rotate-90" />
              </button>
            </div>
            
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
                      Entrega: {formatDeliveryDateRange(selectedOrder.fecha_entrega_esperada_inicio, selectedOrder.fecha_entrega_esperada_fin)}
                  </p>
                </div>
              )}
            </div>

            <div className="mb-6">
              <p className="text-xs font-bold text-on-surface-variant dark:text-white/60 uppercase tracking-wider mb-2">Detalles del Pedido</p>
              {/* Mobile View */}
              <div className="md:hidden flex flex-col divide-y divide-outline-variant/30 dark:divide-white/5 bg-white dark:bg-[#1a1a1a] rounded-xl border border-outline-variant/30 dark:border-white/5 mt-2">
                {(isEditMode ? editDetails : selectedOrder.detalles)?.map((det: any, index: number) => (
                  <div key={det.id} className={`p-3 transition-opacity ${det.cantidad === 0 ? 'opacity-40 bg-red-50 dark:bg-red-950/10' : ''}`}>
                    <p className={`text-sm font-semibold text-on-surface dark:text-white break-words ${det.cantidad === 0 ? 'line-through text-red-500' : ''}`}>
                      {det.producto_nombre} 
                      <span className="text-[10px] text-on-surface-variant/50 ml-1">({det.producto_sku})</span>
                      {det.cantidad === 0 && <span className="ml-2 text-[10px] text-red-600 dark:text-red-400 font-bold uppercase">Se eliminará</span>}
                    </p>
                    <div className="flex justify-between items-center mt-2">
                      {isEditMode ? (
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-on-surface-variant dark:text-white/60">Cant:</span>
                          <input 
                            type="number"
                            min="0"
                            max={selectedOrder.detalles.find((d: any) => d.id === det.id)?.cantidad || 1}
                            value={Math.round(Number(det.cantidad))}
                            onChange={(e) => {
                              const newDetails = [...editDetails];
                              newDetails[index].cantidad = Math.max(0, Number(e.target.value));
                              setEditDetails(newDetails);
                            }}
                            className="w-16 bg-surface dark:bg-black border border-outline-variant/50 dark:border-white/10 rounded-md py-1 px-2 text-sm text-center text-on-surface dark:text-white focus:outline-none focus:border-tertiary dark:focus:border-[#e3b54a]"
                          />
                          <button
                            onClick={() => {
                              const newDetails = [...editDetails];
                              newDetails[index].cantidad = 0;
                              setEditDetails(newDetails);
                            }}
                            className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-md transition-colors"
                            title="Eliminar producto"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-on-surface-variant dark:text-white/60">Cant: <span className="font-bold">{Math.round(Number(det.cantidad))}</span></span>
                      )}
                      <span className={`text-sm font-bold ${det.cantidad === 0 ? 'text-red-500 line-through' : 'text-primary dark:text-white'}`}>
                        L {isEditMode ? (det.cantidad * (det.subtotal / (selectedOrder.detalles.find((d:any) => d.id === det.id)?.cantidad || 1))).toFixed(2) : det.subtotal}
                      </span>
                    </div>
                  </div>
                ))}
                {(!selectedOrder.detalles || selectedOrder.detalles.length === 0) && (
                  <div className="p-6 text-center text-sm opacity-50">Sin detalles.</div>
                )}
              </div>

              {/* Desktop View */}
              <div className="hidden md:block premium-table-card mt-2">
                <table className="premium-table">
                  <thead>
                    <tr>
                      <th>Producto</th>
                      <th className="text-center">Cant.</th>
                      <th className="text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(isEditMode ? editDetails : selectedOrder.detalles)?.map((det: any, index: number) => (
                      <tr key={det.id} className={det.cantidad === 0 ? 'opacity-40 bg-red-50 dark:bg-red-950/10' : ''}>
                        <td className={det.cantidad === 0 ? 'line-through text-red-500' : ''}>
                          {det.producto_nombre} <span className="text-[10px] text-on-surface-variant/50 ml-2">({det.producto_sku})</span>
                          {det.cantidad === 0 && <span className="ml-2 text-[10px] text-red-600 dark:text-red-400 font-bold uppercase">Se eliminará</span>}
                        </td>
                        <td className="text-center font-bold">
                          {isEditMode ? (
                            <div className="flex items-center justify-center gap-2">
                              <input 
                                type="number"
                                min="0"
                                max={selectedOrder.detalles.find((d: any) => d.id === det.id)?.cantidad || 1}
                                value={Math.round(Number(det.cantidad))}
                                onChange={(e) => {
                                  const newDetails = [...editDetails];
                                  newDetails[index].cantidad = Math.max(0, Number(e.target.value));
                                  setEditDetails(newDetails);
                                }}
                                className="w-20 bg-surface dark:bg-black border border-outline-variant/50 dark:border-white/10 rounded-lg py-1.5 px-2 text-sm text-center text-on-surface dark:text-white focus:outline-none focus:border-tertiary dark:focus:border-[#e3b54a]"
                              />
                              <button
                                onClick={() => {
                                  const newDetails = [...editDetails];
                                  newDetails[index].cantidad = 0;
                                  setEditDetails(newDetails);
                                }}
                                className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-md transition-colors"
                                title="Eliminar producto"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          ) : (
                            Math.round(Number(det.cantidad))
                          )}
                        </td>
                        <td className={`text-right ${det.cantidad === 0 ? 'text-red-500 line-through' : ''}`}>
                          L {isEditMode ? (det.cantidad * (det.subtotal / (selectedOrder.detalles.find((d:any) => d.id === det.id)?.cantidad || 1))).toFixed(2) : det.subtotal}
                        </td>
                      </tr>
                    ))}
                    {(!selectedOrder.detalles || selectedOrder.detalles.length === 0) && (
                      <tr><td colSpan={3} className="text-center opacity-50 py-6">Sin detalles.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Controles de Edición */}
              {isEditMode && (
                <div className="mt-4 p-4 bg-primary-container/10 dark:bg-[#e3b54a]/5 rounded-xl border border-primary-container/20 dark:border-[#e3b54a]/20">
                  <label className="block text-[10px] font-semibold mb-2 text-primary dark:text-[#e3b54a] uppercase">Motivo de la Modificación *</label>
                  <textarea 
                    value={editMotivo}
                    onChange={(e) => setEditMotivo(e.target.value)}
                    placeholder="Ej. Falta de stock en bodega, solo se entregan 5 unidades..."
                    className="w-full bg-white dark:bg-black border border-outline-variant/50 dark:border-white/10 rounded-xl py-2 px-3 text-sm text-on-surface dark:text-white focus:outline-none focus:border-tertiary dark:focus:border-[#e3b54a] resize-none h-20 mb-3"
                  />
                  <div className="flex justify-end gap-3">
                    <button 
                      onClick={() => setIsEditMode(false)}
                      disabled={isUpdating}
                      className="px-4 py-2 rounded-lg font-bold text-sm text-on-surface-variant hover:bg-outline-variant/20 dark:text-white/60 dark:hover:bg-white/10 transition-colors"
                    >
                      Cancelar
                    </button>
                    <button 
                      onClick={handleUpdateQuantities}
                      disabled={isUpdating}
                      className="px-4 py-2 rounded-lg font-bold text-sm bg-primary text-white hover:bg-tertiary dark:bg-[#e3b54a] dark:text-black dark:hover:bg-white transition-colors flex items-center gap-2"
                    >
                      {isUpdating ? 'Guardando...' : 'Guardar Cambios'}
                    </button>
                  </div>
                </div>
              )}

              {/* Botón Activar Edición */}
              {!isEditMode && ['Pendiente', 'Elaborado'].includes(selectedOrder.estado) && (
                <div className="mt-4 flex justify-end gap-3 flex-wrap">
                  <button 
                    onClick={() => setIsAddProductModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-white hover:bg-tertiary dark:bg-primary-container dark:text-white dark:hover:bg-[#e3b54a] dark:hover:text-black font-bold rounded-lg transition-colors text-sm shadow-sm"
                  >
                    + Agregar Producto
                  </button>
                  {selectedOrder.detalles?.length > 0 && (
                    <button 
                      onClick={() => setIsEditMode(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-surface-variant/30 hover:bg-surface-variant/50 dark:bg-white/5 dark:hover:bg-white/10 text-on-surface dark:text-white font-bold rounded-lg transition-colors text-sm border border-outline-variant/50 dark:border-white/10"
                    >
                      Modificar Cantidades
                    </button>
                  )}
                </div>
              )}
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

      {/* Agregar Producto Modal */}
      {isAddProductModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-surface dark:bg-[#0f0f0f] w-full max-w-md rounded-3xl p-6 shadow-2xl border border-outline-variant/30 dark:border-white/10">
            <h3 className="text-xl font-bold mb-4 text-on-surface dark:text-white">Agregar Producto al Pedido</h3>
            
            <div className="mb-4">
              <label className="block text-xs font-bold mb-2 text-on-surface-variant dark:text-white/60 uppercase">Producto</label>
              <select 
                value={newProductId}
                onChange={e => setNewProductId(e.target.value)}
                className="w-full bg-white dark:bg-black border border-outline-variant/50 dark:border-white/10 rounded-xl py-3 px-4 text-sm text-on-surface dark:text-white focus:outline-none focus:border-tertiary dark:focus:border-[#e3b54a]"
              >
                <option value="">Seleccione un producto...</option>
                {productosDisponibles.map(p => (
                  <option key={p.id} value={p.id}>{p.nombre} (Stock: {p.stock_disponible})</option>
                ))}
              </select>
            </div>

            <div className="mb-6">
              <label className="block text-xs font-bold mb-2 text-on-surface-variant dark:text-white/60 uppercase">Cantidad</label>
              <input 
                type="number"
                min="1"
                value={newProductQuantity}
                onChange={e => setNewProductQuantity(parseInt(e.target.value) || 1)}
                className="w-full bg-white dark:bg-black border border-outline-variant/50 dark:border-white/10 rounded-xl py-3 px-4 text-sm text-on-surface dark:text-white focus:outline-none focus:border-tertiary dark:focus:border-[#e3b54a]"
              />
            </div>

            <div className="flex gap-3">
              <button 
                onClick={() => setIsAddProductModalOpen(false)}
                className="flex-1 py-3 px-4 bg-surface dark:bg-[#1a1a1a] text-on-surface dark:text-white font-bold rounded-xl border border-outline-variant/50 dark:border-white/10 hover:bg-outline-variant/30 dark:hover:bg-white/5"
              >
                Cancelar
              </button>
              <button 
                onClick={handleAddProduct}
                disabled={isAddingProduct || !newProductId}
                className="flex-1 py-3 px-4 bg-tertiary text-white dark:bg-[#e3b54a] dark:text-black font-bold rounded-xl shadow-md hover:-translate-y-0.5 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isAddingProduct ? 'Agregando...' : 'Agregar'}
              </button>
            </div>
          </div>
        </div>
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
