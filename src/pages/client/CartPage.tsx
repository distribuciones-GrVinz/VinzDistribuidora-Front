import { useState, useEffect } from 'react';
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import { motion, useAnimation, type PanInfo } from 'framer-motion';

import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useLockBodyScroll } from '../../hooks/useLockBodyScroll';
import { clientService } from '../../services/clientService';

function SwipeableCartItem({ item, isLast, removeFromCart, updateQuantity }: any) {
  const controls = useAnimation();
  
  const handleDragEnd = (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (info.offset.x < -80) {
      removeFromCart(item.id);
    } else {
      controls.start({ x: 0 });
    }
  };

  return (
    <div className="relative overflow-hidden bg-red-500 transition-colors">
      {/* Fondo de acción (Eliminar) */}
      <div className="absolute inset-y-0 right-0 w-1/2 flex items-center justify-end pr-8 bg-red-500 text-white font-bold rounded-r-3xl">
        <Trash2 className="w-8 h-8" />
      </div>
      
      {/* Swipeable Item */}
      <motion.div
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={{ left: 0.5, right: 0 }}
        onDragEnd={handleDragEnd}
        animate={controls}
        className={`bg-surface dark:bg-[#0f0f0f] relative z-10 flex items-stretch gap-4 p-4 hover:bg-surface-variant/10 dark:hover:bg-white/[0.02] transition-colors ${!isLast ? 'border-b border-outline-variant/30 dark:border-white/5' : ''}`}
      >
        {/* Image */}
        <div className="w-24 h-24 sm:w-32 sm:h-32 bg-outline-variant/10 dark:bg-black/20 rounded-2xl overflow-hidden flex-shrink-0 flex items-center justify-center relative shadow-sm pointer-events-none">
          {item.imagen ? (
            <img 
              src={item.imagen} 
              alt={item.nombre} 
              className="w-full h-full object-cover mix-blend-multiply dark:mix-blend-normal"
            />
          ) : (
            <img src="/sweet_logo.jpg" alt="Vinz" className="w-full h-full object-cover opacity-80" />
          )}
        </div>
        
        {/* Content */}
        <div className="flex-1 flex flex-col justify-between py-1 pointer-events-auto">
          <div className="flex justify-between items-start gap-2">
            <h4 className="font-bold text-on-surface dark:text-white text-base sm:text-lg leading-tight line-clamp-2">{item.nombre}</h4>
          </div>

          <div className="flex items-end justify-between mt-auto pt-4">
            <div>
              {/* Subtotal */}
              <p className="font-black text-on-surface dark:text-white text-lg">
                L {(item.precio * item.cantidad).toFixed(2)}
              </p>
              <p className="text-xs text-on-surface-variant/70 dark:text-white/50 mt-0.5">
                L {Number(item.precio).toFixed(2)} c/u
              </p>
            </div>

            {/* Quantity Control */}
            <div className="flex items-center gap-2 sm:gap-3 bg-surface-variant/30 dark:bg-[#1a1a1a] rounded-full border border-outline-variant/30 dark:border-white/10 px-2 py-1 shadow-sm">
              <button 
                onClick={() => updateQuantity(item.id, item.cantidad - item.unidad_minima)}
                className="text-on-surface-variant dark:text-white/50 hover:text-primary dark:hover:text-[#e3b54a] transition-colors p-1"
                disabled={item.cantidad <= item.unidad_minima}
              >
                <Minus className="w-4 h-4" />
              </button>
              <input
                type="number"
                min={item.unidad_minima}
                value={item.cantidad ? Math.floor(Number(item.cantidad)) : ''}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  if (!isNaN(val) && val >= item.unidad_minima) {
                    updateQuantity(item.id, val);
                  } else if (e.target.value === '') {
                     updateQuantity(item.id, 0 as any); // Temporal, se limpia en blur
                  }
                }}
                onBlur={() => {
                  if (!item.cantidad || item.cantidad < item.unidad_minima) {
                    updateQuantity(item.id, item.unidad_minima);
                  }
                }}
                className="w-6 sm:w-8 text-center font-bold text-on-surface dark:text-white bg-transparent outline-none text-sm sm:text-base"
              />
              <button 
                onClick={() => updateQuantity(item.id, item.cantidad + item.unidad_minima)}
                className="text-on-surface-variant dark:text-white/50 hover:text-primary dark:hover:text-[#e3b54a] transition-colors p-1"
                disabled={item.cantidad >= item.stock_disponible}
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export function CartPage() {
  const { items, updateQuantity, removeFromCart, clearCart } = useCart();
  const { token } = useAuth();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [notas, setNotas] = useState('');
  const [fechasEntrega, setFechasEntrega] = useState<{inicio: string, fin: string} | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  useLockBodyScroll(showConfirmModal);

  const subtotal = items.reduce((sum, item) => sum + item.precio * item.cantidad, 0);
  const isv = items.reduce((sum, item) => {
    if (!item.exento_isv) {
      return sum + (item.precio * item.cantidad * 0.15);
    }
    return sum;
  }, 0);
  const totalEstimado = subtotal + isv;

  useEffect(() => {
    const fetchFechas = async () => {
      try {
        if (token) {
          const data = await clientService.getConfiguracionDespacho(token);
          setFechasEntrega({
            inicio: data.proxima_entrega_inicio,
            fin: data.proxima_entrega_fin
          });
        }
      } catch (err) {
        console.error('Error al obtener fechas de entrega', err);
      }
    };
    fetchFechas();
  }, [token]);


  const handleCheckout = async () => {
    if (items.length === 0) return;
    
    setIsSubmitting(true);
    setError('');
    
    try {
      await clientService.crearPedido(token as string, {
        notas: notas,
        detalles: items.map(i => ({ producto_id: i.id, cantidad: i.cantidad }))
      });
      
      setSuccess(true);
      clearCart();
      setShowConfirmModal(false);
      
      // Resetear después de 3 segundos
      setTimeout(() => {
        setSuccess(false);
        setNotas('');
      }, 3000);
      
    } catch (err: any) {
      setError(err.message || 'Ocurrió un error al procesar el pedido.');
      setShowConfirmModal(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-6 pt-2 pb-12 md:pt-4 md:pb-12 transition-colors duration-300">
      {/* Modal de confirmación */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-surface dark:bg-[#1a1a1a] rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl border border-outline-variant/30 dark:border-white/10 animate-in zoom-in-95 duration-200">
            <h3 className="text-2xl font-bold text-on-surface dark:text-white mb-2">Confirmar Pedido</h3>
            <p className="text-on-surface-variant dark:text-white/70 mb-6">
              ¿Estás seguro de que deseas enviar este pedido por un total de <strong>L {totalEstimado.toFixed(2)}</strong>? Una vez enviado, pasará a estar Pendiente de elaboración.
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 px-4 py-3 rounded-xl border border-outline-variant dark:border-white/20 text-on-surface dark:text-white font-bold hover:bg-surface-variant/30 dark:hover:bg-white/5 transition-colors"
                disabled={isSubmitting}
              >
                Cancelar
              </button>
              <button 
                onClick={handleCheckout}
                className="flex-1 px-4 py-3 rounded-xl bg-primary dark:bg-[#e3b54a] text-white dark:text-black font-bold hover:opacity-90 transition-opacity flex justify-center items-center"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white dark:border-black/30 dark:border-t-black rounded-full animate-spin" />
                ) : (
                  'Sí, Confirmar'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <h1 className="text-4xl md:text-5xl font-headline-xl font-bold mb-12 text-on-surface dark:text-white drop-shadow-sm">Tu Pedido</h1>

      {success ? (
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 bg-surface dark:bg-[#0f0f0f] border border-outline-variant/30 dark:border-white/5 rounded-2xl shadow-sm">
          <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mb-4">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
          </div>
          <h3 className="text-3xl font-bold text-on-surface dark:text-white">¡Pedido Confirmado!</h3>
          <p className="text-on-surface-variant dark:text-white/70">Tu orden ha sido enviada exitosamente. Pronto nos pondremos en contacto.</p>
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-20 bg-surface-variant/20 dark:bg-[#111111] rounded-3xl border border-outline-variant/30 dark:border-white/5 transition-colors">
          <ShoppingBag className="w-16 h-16 mx-auto text-on-surface-variant/50 dark:text-white/30 mb-4" />
          <h2 className="text-2xl font-bold text-on-surface dark:text-white mb-2">Tu carrito está vacío</h2>
          <p className="text-on-surface-variant dark:text-white/60">Agrega productos del catálogo para comenzar.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-xl text-sm mb-4 border border-red-200 dark:border-red-800">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-surface dark:bg-[#0f0f0f] rounded-3xl border border-outline-variant/30 dark:border-white/5 shadow-sm overflow-hidden h-fit">
              {items.map((item, index) => (
                <SwipeableCartItem 
                  key={item.id} 
                  item={item} 
                  isLast={index === items.length - 1}
                  removeFromCart={removeFromCart}
                  updateQuantity={updateQuantity}
                />
              ))}
              
              <div className="p-5 bg-surface-variant/10 dark:bg-black/20 border-t border-outline-variant/30 dark:border-white/5">
                <label className="block text-xs font-bold text-on-surface-variant dark:text-white/70 mb-2 uppercase tracking-widest">Notas del Pedido (Opcional)</label>
                <textarea 
                  className="w-full bg-white dark:bg-[#1a1a1a] border border-outline-variant/50 dark:border-white/10 rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary dark:focus:ring-[#e3b54a] focus:border-transparent outline-none transition-all dark:text-white placeholder:text-on-surface-variant/40 dark:placeholder:text-white/20 resize-none"
                  rows={2}
                  placeholder="Ej: Entregar por la tarde, dejar en recepción..."
                  value={notas}
                  onChange={(e) => setNotas(e.target.value)}
                ></textarea>
              </div>
            </div>

            <div className="lg:col-span-1">
              <div className="bg-surface dark:bg-[#0f0f0f] p-6 rounded-3xl border border-outline-variant/30 dark:border-white/5 shadow-sm sticky top-24">
                <h3 className="text-xl font-bold text-on-surface dark:text-white mb-6 border-b border-outline-variant/20 dark:border-white/10 pb-4">Resumen</h3>
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between items-center text-on-surface-variant dark:text-white/70">
                    <span>Subtotal</span>
                    <span className="font-medium">L {subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center text-on-surface-variant dark:text-white/70">
                    <span>ISV (15%)</span>
                    <span className="font-medium">L {isv.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center text-on-surface-variant dark:text-white/70">
                    <span>Envío</span>
                    <span className="font-medium text-green-600 dark:text-green-400">Gratis</span>
                  </div>
                  
                  {fechasEntrega && (
                    <div className="bg-primary-container/30 dark:bg-[#e3b54a]/10 p-4 rounded-xl border border-primary/20 dark:border-[#e3b54a]/20 mt-4 mb-4">
                      <h4 className="text-sm font-bold text-primary dark:text-[#e3b54a] mb-1">Fecha Estimada de Entrega:</h4>
                      <p className="text-sm text-on-surface dark:text-white/90">
                        Entre el <span className="font-bold">{new Date(fechasEntrega.inicio).toLocaleDateString()}</span> y el <span className="font-bold">{new Date(fechasEntrega.fin).toLocaleDateString()}</span>
                      </p>
                    </div>
                  )}

                  <div className="border-t border-outline-variant/20 dark:border-white/10 pt-4 flex justify-between items-center">
                    <span className="text-lg font-bold text-on-surface dark:text-white">Total Estimado</span>
                    <span className="text-3xl font-black text-primary dark:text-[#e3b54a]">L {totalEstimado.toFixed(2)}</span>
                  </div>
                </div>
                
                <button 
                  onClick={() => setShowConfirmModal(true)}
                  disabled={isSubmitting}
                  className={`w-full py-4 rounded-xl font-bold text-white shadow-lg transition-all transform hover:-translate-y-1 ${
                    isSubmitting ? 'bg-primary/70 dark:bg-[#e3b54a]/70 cursor-wait' : 'bg-primary dark:bg-[#e3b54a] dark:text-black hover:bg-primary/90 dark:hover:bg-white hover:shadow-primary/30 dark:hover:shadow-[#e3b54a]/30'
                  }`}
                >
                  {isSubmitting ? 'Procesando...' : 'Confirmar Pedido'}
                </button>
                <button 
                  onClick={clearCart}
                  className="w-full mt-4 py-3 text-sm font-bold text-on-surface-variant dark:text-white/50 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                >
                  Vaciar Carrito
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
