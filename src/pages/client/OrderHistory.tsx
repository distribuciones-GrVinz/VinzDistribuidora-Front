import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { clientService } from '../../services/clientService';
import { Package, Clock, CheckCircle, Truck, XCircle } from 'lucide-react';

interface DetallePedido {
  id: string;
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
            <div key={pedido.id} className="bg-surface dark:bg-[#0f0f0f] border border-outline-variant/30 dark:border-white/5 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all">
              {/* Header del Pedido */}
              <div className="bg-surface-variant/20 dark:bg-black/40 p-5 border-b border-outline-variant/30 dark:border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-on-surface-variant dark:text-white/60 font-semibold uppercase tracking-wider mb-1">
                    Pedido #{pedido.id.split('-')[0]}
                  </p>
                  <p className="text-on-surface dark:text-white font-medium capitalize">
                    {safeDate(pedido.created_at)}
                  </p>
                  {pedido.fecha_entrega_esperada_inicio && pedido.fecha_entrega_esperada_fin && (
                    <div className="mt-2 bg-primary/10 dark:bg-[#e3b54a]/10 px-3 py-1.5 rounded-md inline-block">
                      <p className="text-xs font-bold text-primary dark:text-[#e3b54a] uppercase tracking-wider mb-0.5">Entrega Esperada:</p>
                      <p className="text-sm font-medium text-on-surface dark:text-white">
                        {new Date(pedido.fecha_entrega_esperada_inicio + "T12:00:00").toLocaleDateString()} a {new Date(pedido.fecha_entrega_esperada_fin + "T12:00:00").toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-4">
                  <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm font-bold ${getStatusColor(pedido.estado)} dark:opacity-90`}>
                    {getStatusIcon(pedido.estado)}
                    {pedido.estado.replace('_', ' ')}
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-on-surface-variant dark:text-white/50 uppercase tracking-widest">Total</p>
                    <p className="text-xl font-black text-primary dark:text-[#e3b54a]">L {parseFloat(pedido.total).toFixed(2)}</p>
                  </div>
                </div>
              </div>

              {/* Detalles del Pedido */}
              <div className="p-5">
                <h4 className="text-sm font-bold text-on-surface-variant dark:text-white/60 uppercase tracking-widest mb-4 border-b border-outline-variant/30 dark:border-white/5 pb-2">Artículos</h4>
                <div className="space-y-3">
                  {pedido.detalles.map(detalle => (
                    <div key={detalle.id} className="flex justify-between items-center text-sm">
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-on-surface w-8 h-8 flex items-center justify-center bg-surface-variant dark:bg-[#1a1a1a] dark:text-white rounded-md">{detalle.cantidad}</span>
                        <span className="font-medium text-on-surface dark:text-white">{detalle.producto_nombre || 'Producto'}</span>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-on-surface dark:text-white">L {parseFloat(detalle.subtotal).toFixed(2)}</p>
                        <p className="text-xs text-on-surface-variant dark:text-white/50">L {parseFloat(detalle.precio_historico).toFixed(2)} c/u</p>
                      </div>
                    </div>
                  ))}
                </div>

                {pedido.notas && (
                  <div className="mt-6 bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-100 dark:border-yellow-700/30 p-3 rounded-lg">
                    <p className="text-xs font-bold text-yellow-800 dark:text-yellow-500 uppercase tracking-wider mb-1">Tus Notas:</p>
                    <p className="text-sm text-yellow-900 dark:text-yellow-200/80 italic">"{pedido.notas}"</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
