import { X, ChefHat, Store, PackageCheck, FileText, CheckSquare, Square } from 'lucide-react';
import { useMemo, useState, useEffect } from 'react';
import { updateEstadoPedido } from '../../services/adminService';
import { useNotification } from '../../context/NotificationContext';
import { useLockBodyScroll } from '../../hooks/useLockBodyScroll';

interface ProductionSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  pedidos: any[];
  onOrdersUpdated?: () => void; // Call this when orders change status
}

interface ClientSummary {
  cliente_nombre: string;
  totalProductos: number;
  notas: string[];
  productos: {
    producto_nombre: string;
    cantidad: number;
  }[];
}

export function ProductionSummaryModal({ isOpen, onClose, pedidos, onOrdersUpdated }: ProductionSummaryModalProps) {
  useLockBodyScroll(isOpen);
  const [completedItems, setCompletedItems] = useState<Set<string>>(new Set());
  const { showNotification } = useNotification();

  // Función para verificar si un cliente completó todos sus items
  const checkClientCompletion = async (clientName: string, clientProducts: any[], currentSet: Set<string>) => {
    const allCompleted = clientProducts.every(p => currentSet.has(`${clientName}-${p.producto_nombre}`));
    if (allCompleted) {
      // Encontrar los pedidos pendientes de este cliente
      const pendingOrders = pedidos.filter(p => (p.estado === 'Pendiente' || p.estado === 'Nuevo') && p.cliente_nombre === clientName);
      if (pendingOrders.length > 0) {
        try {
          await Promise.all(pendingOrders.map(p => updateEstadoPedido(p.id, 'Elaborado')));
          showNotification('success', `Pedidos de ${clientName} marcados como Elaborado.`);
          if (onOrdersUpdated) {
            onOrdersUpdated();
          }
        } catch (error) {
          console.error('Error actualizando pedidos a Elaborado:', error);
          showNotification('error', 'Hubo un error al actualizar el estado de los pedidos.');
        }
      }
    }
  };

  const toggleItem = (clientName: string, prodName: string, clientProducts: any[]) => {
    const key = `${clientName}-${prodName}`;
    const newSet = new Set(completedItems);
    if (newSet.has(key)) {
      newSet.delete(key);
    } else {
      newSet.add(key);
    }
    setCompletedItems(newSet);
    checkClientCompletion(clientName, clientProducts, newSet);
  };

  const toggleAllClientItems = (clientName: string, productos: { producto_nombre: string }[]) => {
    const allCompleted = productos.every(p => completedItems.has(`${clientName}-${p.producto_nombre}`));
    const newSet = new Set(completedItems);
    if (allCompleted) {
      productos.forEach(p => newSet.delete(`${clientName}-${p.producto_nombre}`));
    } else {
      productos.forEach(p => newSet.add(`${clientName}-${p.producto_nombre}`));
    }
    setCompletedItems(newSet);
    checkClientCompletion(clientName, productos, newSet);
  };

  // Bloquear el scroll del fondo cuando el modal está abierto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const { global, clients } = useMemo(() => {
    const pendingOrders = pedidos.filter(
      (p) => p.estado === 'Pendiente' || p.estado === 'Nuevo'
    );

    const globalSummary: Record<string, number> = {};
    const agg: Record<string, ClientSummary> = {};

    pendingOrders.forEach((pedido) => {
      const clientName = pedido.cliente_nombre || 'Cliente Desconocido';
      if (!agg[clientName]) {
        agg[clientName] = {
          cliente_nombre: clientName,
          totalProductos: 0,
          notas: [],
          productos: [],
        };
      }

      if (pedido.notas && pedido.notas.trim() !== '') {
        // Evitar duplicar notas si es exactamente la misma
        if (!agg[clientName].notas.includes(pedido.notas)) {
          agg[clientName].notas.push(pedido.notas);
        }
      }

      pedido.detalles?.forEach((det: any) => {
        const prodName = det.producto_nombre;
        const cant = Math.round(Number(det.cantidad));
        
        // Suma global base
        globalSummary[prodName] = (globalSummary[prodName] || 0) + cant;

        // Suma por cliente
        const existingProd = agg[clientName].productos.find(p => p.producto_nombre === prodName);
        if (existingProd) {
          existingProd.cantidad += cant;
        } else {
          agg[clientName].productos.push({
            producto_nombre: prodName,
            cantidad: cant
          });
        }
        agg[clientName].totalProductos += cant;
      });
    });

    const clientsList = Object.values(agg).sort((a, b) => b.totalProductos - a.totalProductos);

    // Calcular cuántos están completados globalmente
    const globalCompleted: Record<string, number> = {};
    clientsList.forEach(client => {
      client.productos.forEach(prod => {
        if (completedItems.has(`${client.cliente_nombre}-${prod.producto_nombre}`)) {
          globalCompleted[prod.producto_nombre] = (globalCompleted[prod.producto_nombre] || 0) + prod.cantidad;
        }
      });
    });

    return {
      global: Object.entries(globalSummary)
        .map(([name, total]) => ({ 
          name, 
          total, 
          completed: globalCompleted[name] || 0,
          remaining: total - (globalCompleted[name] || 0)
        }))
        .sort((a, b) => b.total - a.total),
      clients: clientsList,
    };
  }, [pedidos, completedItems]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-2 sm:p-6 bg-black/70 backdrop-blur-md transition-opacity">
      {/* El modal ocupa casi toda la pantalla */}
      <div className="bg-surface dark:bg-[#0a0a0a] w-full h-full sm:h-auto sm:max-h-[95vh] sm:max-w-7xl rounded-none sm:rounded-3xl shadow-2xl border border-outline-variant/30 dark:border-white/10 flex flex-col overflow-hidden relative transition-all duration-300">
        
        {/* Header */}
        <div className="p-6 md:p-8 border-b border-outline-variant/30 dark:border-white/10 flex items-center justify-between bg-white dark:bg-[#111] shrink-0">
          <div className="flex items-center gap-4 min-w-0">
            <div className="w-12 h-12 bg-primary-container dark:bg-[#e3b54a]/10 rounded-full flex items-center justify-center text-primary dark:text-[#e3b54a] shrink-0">
              <ChefHat className="w-6 h-6" />
            </div>
            <div className="min-w-0 pr-4">
              <h2 className="text-2xl md:text-3xl font-headline-lg text-primary dark:text-white truncate">Resumen de Producción</h2>
              <p className="text-sm text-on-surface-variant/80 dark:text-white/50 mt-1 truncate">Organizado por Tienda (Pedidos Pendientes)</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-outline-variant/20 dark:hover:bg-white/10 text-on-surface-variant dark:text-white/60 transition-colors bg-surface dark:bg-white/5 shrink-0"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 hide-scrollbar bg-surface dark:bg-[#0a0a0a]">
          {clients.length === 0 ? (
            <div className="text-center py-16 flex flex-col items-center justify-center">
              <PackageCheck className="w-16 h-16 text-outline-variant dark:text-white/20 mb-4" />
              <p className="text-on-surface-variant/60 dark:text-white/40 text-xl font-light">No hay pedidos pendientes para producir.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full items-start">
              
              {/* Columna Izquierda: Tarjetas por Cliente */}
              <div className="lg:col-span-7 xl:col-span-7 space-y-6 min-w-0 w-full overflow-hidden">
                <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-on-surface-variant/50 dark:text-white/30 mb-2 truncate">Desglose por Tienda</h3>
                {clients.map((client, idx) => {
                  const allCompleted = client.productos.every(p => completedItems.has(`${client.cliente_nombre}-${p.producto_nombre}`));
                  
                  return (
                  <div 
                    key={idx} 
                    className={`bg-white dark:bg-[#151515] border rounded-2xl overflow-hidden shadow-sm flex flex-col transition-all duration-500 ${allCompleted ? 'border-emerald-500/50 bg-emerald-50/50 dark:bg-emerald-950/10 dark:border-emerald-500/30 ring-1 ring-emerald-500/20' : 'border-outline-variant/30 dark:border-white/5'}`}
                  >
                    {/* Cabecera de la Tarjeta del Cliente */}
                    <div className={`p-5 md:p-6 flex items-center justify-between gap-4 border-b transition-colors ${allCompleted ? 'border-emerald-500/20 bg-emerald-100/30 dark:bg-emerald-900/20' : 'border-outline-variant/10 dark:border-white/5 bg-surface/50 dark:bg-black/20'}`}>
                      <div className="flex items-center gap-4 min-w-0">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-colors duration-500 ${allCompleted ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30' : 'bg-tertiary text-white dark:bg-[#e3b54a] dark:text-black'}`}>
                          {allCompleted ? <CheckSquare className="w-5 h-5" /> : <Store className="w-5 h-5" />}
                        </div>
                        <h3 className={`text-lg font-bold truncate transition-colors ${allCompleted ? 'text-emerald-700 dark:text-emerald-400' : 'text-on-surface dark:text-white'}`}>
                          {client.cliente_nombre}
                        </h3>
                      </div>
                      <div className="text-right shrink-0">
                        <p className={`text-[10px] uppercase tracking-widest font-bold transition-colors ${allCompleted ? 'text-emerald-600/70 dark:text-emerald-400/50' : 'text-on-surface-variant/50 dark:text-white/30'}`}>Total Unds.</p>
                        <p className={`font-bold text-lg transition-colors ${allCompleted ? 'text-emerald-600 dark:text-emerald-400' : 'text-tertiary dark:text-[#e3b54a]'}`}>
                          {client.totalProductos}
                        </p>
                      </div>
                    </div>

                    {/* Mensaje Elegante si todo está completado */}
                    {allCompleted && (
                      <div className="px-5 md:px-6 py-3 bg-emerald-100/50 dark:bg-emerald-900/30 flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                        <PackageCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                        <span className="text-sm font-bold text-emerald-700 dark:text-emerald-300">¡Todos los productos han sido elaborados para este cliente!</span>
                      </div>
                    )}

                    {/* Detalle Desplegado Automáticamente */}
                    <div className={`px-5 md:px-6 pb-6 pt-2 overflow-x-auto transition-colors ${allCompleted ? 'bg-emerald-50/30 dark:bg-[#151515]' : 'bg-white dark:bg-[#151515]'}`}>
                      <div className="premium-table-card mt-2">
                        <table className="premium-table">
                          <thead>
                            <tr>
                              <th className="w-10">
                                <button 
                                  onClick={() => toggleAllClientItems(client.cliente_nombre, client.productos)}
                                  className={`transition-opacity flex items-center justify-center hover:opacity-70 ${allCompleted ? 'text-white dark:text-emerald-400' : 'text-white dark:text-[#e3b54a]'}`}
                                  title={allCompleted ? "Desmarcar todos" : "Marcar todos"}
                                >
                                  {allCompleted ? <CheckSquare className="w-5 h-5" /> : <Square className="w-5 h-5" />}
                                </button>
                              </th>
                              <th>Producto</th>
                              <th className="text-right">Cantidad</th>
                            </tr>
                          </thead>
                          <tbody>
                            {client.productos.map((prod, pIdx) => {
                              const isCompleted = completedItems.has(`${client.cliente_nombre}-${prod.producto_nombre}`);
                              return (
                                <tr key={pIdx} className={`${isCompleted ? 'opacity-40 bg-emerald-50/50 dark:bg-emerald-900/10 hover:bg-emerald-100/50 dark:hover:bg-emerald-900/20' : ''}`}>
                                  <td>
                                    <button 
                                      onClick={() => toggleItem(client.cliente_nombre, prod.producto_nombre, client.productos)}
                                      className={`hover:opacity-70 transition-opacity flex items-center justify-center ${isCompleted ? 'text-emerald-600 dark:text-emerald-400' : 'text-tertiary dark:text-[#e3b54a]'}`}
                                    >
                                      {isCompleted ? <CheckSquare className="w-5 h-5" /> : <Square className="w-5 h-5" />}
                                    </button>
                                  </td>
                                  <td className={`${isCompleted ? 'line-through' : ''}`}>{prod.producto_nombre}</td>
                                  <td className="text-right">
                                    <span className={`inline-flex items-center justify-center font-bold px-3 py-1 rounded-lg transition-colors duration-300 ${isCompleted ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-tertiary/10 text-tertiary dark:bg-[#e3b54a]/10 dark:text-[#e3b54a]'}`}>
                                      {prod.cantidad}
                                    </span>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                      
                      {/* Mostrar Notas si existen */}
                      {client.notas.length > 0 && (
                        <div className={`mt-4 p-4 rounded-xl border transition-colors ${allCompleted ? 'bg-emerald-100/50 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800' : 'bg-tertiary/5 dark:bg-[#e3b54a]/5 border-tertiary/20 dark:border-[#e3b54a]/10'}`}>
                          <div className={`flex items-center gap-2 mb-2 ${allCompleted ? 'text-emerald-600 dark:text-emerald-400' : 'text-tertiary dark:text-[#e3b54a]'}`}>
                            <FileText className="w-4 h-4" />
                            <span className="text-xs font-bold uppercase tracking-widest">Notas del Pedido</span>
                          </div>
                          <ul className="list-disc pl-5 text-sm text-on-surface-variant dark:text-white/70 space-y-1">
                            {client.notas.map((nota, nIdx) => (
                              <li key={nIdx}>{nota}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                )})}
              </div>

              {/* Columna Derecha: Total Global (Sticky si es posible) */}
              <div className="lg:col-span-5 xl:col-span-5 min-w-0 w-full shrink-0">
                <div className="bg-primary-container dark:bg-[#111] border border-primary-container/50 dark:border-[#e3b54a]/20 rounded-3xl p-6 md:p-8 lg:sticky lg:top-0 shadow-lg dark:shadow-none overflow-hidden transition-all duration-500">
                  <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-primary dark:text-[#e3b54a] mb-6 truncate">Total a Producir (Global)</h3>
                  
                  <div className="space-y-4">
                    {global.map((g, idx) => (
                      <div key={idx} className={`flex items-center justify-between border-b border-primary/10 dark:border-white/10 pb-4 last:border-0 last:pb-0 gap-4 transition-all duration-500 ${g.remaining === 0 ? 'opacity-30 grayscale' : ''}`}>
                        <span className={`text-on-surface dark:text-white/90 font-medium truncate transition-all duration-500 ${g.remaining === 0 ? 'line-through' : ''}`}>{g.name}</span>
                        
                        <div className="flex flex-col items-end shrink-0">
                          <span className={`font-bold text-2xl transition-colors duration-500 ${g.remaining === 0 ? 'text-on-surface-variant dark:text-white/50' : 'text-primary dark:text-white'}`}>
                            {g.remaining}
                          </span>
                          {/* Pequeño indicador de completados si hay algunos */}
                          {g.completed > 0 && g.remaining > 0 && (
                            <span className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                              {g.completed} listos
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-8 pt-6 border-t border-primary/20 dark:border-white/10">
                    <p className="text-xs uppercase tracking-widest text-on-surface-variant/70 dark:text-white/40 font-bold mb-2 truncate">Unidades Restantes</p>
                    <p className="text-5xl font-headline-xl text-primary dark:text-[#e3b54a] truncate transition-all duration-500">
                      {global.reduce((acc, curr) => acc + curr.remaining, 0)}
                    </p>
                    
                    {global.reduce((acc, curr) => acc + curr.completed, 0) > 0 && (
                       <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400 mt-3 flex items-center gap-2">
                         <CheckSquare className="w-4 h-4" />
                         {global.reduce((acc, curr) => acc + curr.completed, 0)} unidades elaboradas
                       </p>
                    )}
                  </div>
                </div>
              </div>

            </div>
          )}
        </div>

      </div>
    </div>
  );
}
