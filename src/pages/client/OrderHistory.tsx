import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { clientService } from '../../services/clientService';
import { Package, Clock, CheckCircle, Truck, XCircle, ChevronDown, ChevronUp, RotateCcw } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useNotification } from '../../context/NotificationContext';
import { getProductos } from '../../services/adminService';

interface DetallePedido {
  id: string;
  producto: string;
  producto_nombre: string;
  cantidad: number;
  precio_historico: string;
  subtotal: string;
}

interface Pedido {
  id: string;
  created_at: string;
  total: string;
  estado: string;
  notas: string;
  fecha_entrega_esperada_inicio: string | null;
  fecha_entrega_esperada_fin: string | null;
  detalles: DetallePedido[];
}

export function OrderHistory() {
  const { token } = useAuth();
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { showNotification } = useNotification();
  const { addToCart, setIsCartOpen } = useCart();
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [reorderingId, setReorderingId] = useState<string | null>(null);
  useEffect(() => {
    const fetchPedidos = async () => {
      try {
        const data = await clientService.getMisPedidos(token as string);
        setPedidos(data);
      } catch (err: any) {
        setError(err.message || 'No se pudieron cargar los pedidos.');
      } finally {
        setLoading(false);
      }
    };
    fetchPedidos();
  }, [token]);

  const getStatusIcon = (estado: string) => {
    switch(estado) {
      case 'Pendiente': return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'En_Proceso': return <Package className="w-5 h-5 text-blue-500" />;
      case 'Enviado': return <Truck className="w-5 h-5 text-purple-500" />;
      case 'Entregado': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'Cancelado': return <XCircle className="w-5 h-5 text-red-500" />;
      default: return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (estado: string) => {
    switch(estado) {
      case 'Pendiente': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'En_Proceso': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Enviado': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Entregado': return 'bg-green-100 text-green-800 border-green-200';
      case 'Cancelado': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const safeDate = (dateString: string) => {
    if (!dateString) return 'Fecha no disponible';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Fecha no disponible';
    return date.toLocaleDateString('es-ES', { 
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute:'2-digit' 
    });
  };

  const handleReorder = async (pedido: Pedido, e: React.MouseEvent) => {
    e.stopPropagation();
    setReorderingId(pedido.id);
    try {
      // Obtenemos los productos actuales para asegurar stock y precios correctos
      const data = await getProductos();
      const allProducts = data.results || data;
      
      let allFound = true;
      let addedCount = 0;

      for (const detalle of pedido.detalles) {
        const prod = allProducts.find((p: any) => p.id === detalle.producto);
        if (prod && prod.estado !== false && prod.stock_disponible > 0) {
          // Agregar al carrito
          const cantToAdd = parseInt(detalle.cantidad as any);
          addToCart({
            id: prod.id,
            nombre: prod.nombre,
            precio: parseFloat(prod.precio_unitario),
            cantidad: cantToAdd,
            unidad_minima: prod.unidad_minima,
            stock_disponible: prod.stock_disponible,
            exento_isv: prod.exento_isv,
            imagen: prod.imagen
          });
          addedCount++;
        } else {
          allFound = false;
        }
      }

      if (addedCount > 0) {
        showNotification(
          allFound ? 'success' : 'warning', 
          allFound ? 'Productos agregados al carrito.' : 'Algunos productos ya no están disponibles.'
        );
        setIsCartOpen(true);
      } else {
        showNotification('error', 'Ninguno de estos productos está disponible actualmente.');
      }
    } catch (err) {
      console.error(err);
      showNotification('error', 'Error al intentar volver a pedir.');
    } finally {
      setReorderingId(null);
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedOrderId(prev => prev === id ? null : id);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 pt-2 pb-12 md:pt-4 md:pb-12 transition-colors duration-300">
      <h1 className="text-4xl md:text-5xl font-headline-xl font-bold mb-12 text-on-surface dark:text-white drop-shadow-sm">Mis Pedidos</h1>

      {error ? (
        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-xl border border-red-200 dark:border-red-800">
          {error}
        </div>
      ) : pedidos.length === 0 ? (
        <div className="text-center py-20 bg-surface-variant/20 dark:bg-[#111111] rounded-3xl border border-outline-variant/30 dark:border-white/5 transition-colors">
          <Package className="w-16 h-16 mx-auto text-on-surface-variant/50 dark:text-white/30 mb-4" />
          <h2 className="text-2xl font-bold text-on-surface dark:text-white mb-2">Aún no tienes pedidos</h2>
          <p className="text-on-surface-variant dark:text-white/60">Explora nuestro catálogo y realiza tu primera compra.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {pedidos.map(pedido => (
            <div 
              key={pedido.id} 
              className={`bg-surface dark:bg-[#0f0f0f] border rounded-2xl overflow-hidden transition-all duration-300 ${
                expandedOrderId === pedido.id 
                  ? 'border-tertiary/50 dark:border-[#e3b54a]/30 shadow-md' 
                  : 'border-outline-variant/30 dark:border-white/5 shadow-sm hover:shadow-md'
              }`}
            >
              {/* Header del Pedido (Clickable para expandir) */}
              <div 
                onClick={() => toggleExpand(pedido.id)}
                className="p-5 cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4 select-none hover:bg-surface-variant/10 dark:hover:bg-white/[0.02] transition-colors"
              >
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <p className="text-sm text-on-surface-variant dark:text-white/60 font-semibold uppercase tracking-wider">
                      Pedido #{pedido.id.split('-')[0]}
                    </p>
                    <div className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-[10px] font-bold ${getStatusColor(pedido.estado)} dark:opacity-90`}>
                      {getStatusIcon(pedido.estado)}
                      <span>{pedido.estado.replace('_', ' ')}</span>
                    </div>
                  </div>
                  <p className="text-on-surface dark:text-white font-medium capitalize text-sm mt-1">
                    {new Date(pedido.created_at).toLocaleDateString('es-HN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>
                
                <div className="flex items-center justify-between md:justify-end gap-6 border-t md:border-t-0 border-outline-variant/20 dark:border-white/5 pt-4 md:pt-0">
                  <div className="text-left md:text-right">
                    <p className="text-[10px] text-on-surface-variant dark:text-white/50 uppercase tracking-widest font-bold">Total</p>
                    <p className="text-2xl font-black text-primary dark:text-[#e3b54a]">L {parseFloat(pedido.total).toFixed(2)}</p>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    {pedido.estado === 'Entregado' && (
                      <button
                        onClick={(e) => handleReorder(pedido, e)}
                        disabled={reorderingId === pedido.id}
                        className="p-2 sm:px-4 sm:py-2 bg-primary/10 text-primary dark:bg-[#e3b54a]/10 dark:text-[#e3b54a] rounded-xl hover:bg-primary hover:text-white dark:hover:bg-[#e3b54a] dark:hover:text-black transition-all flex items-center gap-2 font-bold text-xs disabled:opacity-50"
                        title="Volver a pedir"
                      >
                        <RotateCcw className={`w-4 h-4 ${reorderingId === pedido.id ? 'animate-spin' : ''}`} />
                        <span className="hidden sm:inline">Repetir</span>
                      </button>
                    )}
                    <div className="w-8 h-8 rounded-full flex items-center justify-center bg-surface-variant/30 dark:bg-white/5 text-on-surface-variant dark:text-white/60">
                      {expandedOrderId === pedido.id ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </div>
                  </div>
                </div>
              </div>

              {/* Detalles del Pedido (Accordion) */}
              {expandedOrderId === pedido.id && (
                <div className="p-5 border-t border-outline-variant/20 dark:border-white/5 bg-surface-variant/10 dark:bg-black/20 animate-in slide-in-from-top-2 duration-200">
                  <div className="flex flex-col gap-3 mb-6 bg-white/50 dark:bg-black/20 p-4 rounded-xl border border-outline-variant/20 dark:border-white/5">
                    <p className="text-sm text-on-surface dark:text-white">
                      <span className="font-bold text-on-surface-variant dark:text-white/60 uppercase text-xs tracking-wider mr-2">Realizado:</span> 
                      {safeDate(pedido.created_at)}
                    </p>
                    {pedido.fecha_entrega_esperada_inicio && pedido.fecha_entrega_esperada_fin && (
                      <p className="text-sm text-on-surface dark:text-white">
                        <span className="font-bold text-tertiary dark:text-[#e3b54a] uppercase text-xs tracking-wider mr-2">Entrega Esperada:</span> 
                        {new Date(pedido.fecha_entrega_esperada_inicio + "T12:00:00").toLocaleDateString('es-HN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} - {new Date(pedido.fecha_entrega_esperada_fin + "T12:00:00").toLocaleDateString('es-HN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                      </p>
                    )}
                  </div>
                  
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                    <h4 className="text-xs font-bold text-on-surface-variant dark:text-white/60 uppercase tracking-widest">Desglose de Artículos</h4>
                  </div>
                  
                  <div className="space-y-3">
                    {pedido.detalles.map(detalle => (
                      <div key={detalle.id} className="flex justify-between items-center text-sm py-2 border-b border-outline-variant/10 dark:border-white/5 last:border-0">
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-sm text-tertiary dark:text-black w-8 h-8 flex items-center justify-center bg-tertiary/10 dark:bg-[#e3b54a] rounded-md shrink-0">
                            {parseInt(detalle.cantidad as any)}
                          </span>
                          <span className="font-medium text-on-surface dark:text-white">{detalle.producto_nombre || 'Producto'}</span>
                        </div>
                        <div className="text-right shrink-0 ml-4">
                          <p className="font-bold text-on-surface dark:text-white">L {parseFloat(detalle.subtotal).toFixed(2)}</p>
                          <p className="text-xs text-on-surface-variant dark:text-white/40">L {parseFloat(detalle.precio_historico).toFixed(2)} c/u</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {pedido.notas && (
                    <div className="mt-6 bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-100 dark:border-yellow-700/30 p-4 rounded-xl">
                      <p className="text-[10px] font-bold text-yellow-800 dark:text-yellow-500 uppercase tracking-wider mb-1">Notas de preparación:</p>
                      <p className="text-sm text-yellow-900 dark:text-yellow-200/80 italic">"{pedido.notas}"</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
