import { useState } from 'react';
import { X, Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { clientService } from '../../services/clientService';

export function ShoppingCartPanel() {
  const { isCartOpen, setIsCartOpen, items, updateQuantity, removeFromCart, clearCart, total } = useCart();
  const { token } = useAuth();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [notas, setNotas] = useState('');

  if (!isCartOpen) return null;

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
      
      // Cerrar y resetear después de 3 segundos
      setTimeout(() => {
        setSuccess(false);
        setIsCartOpen(false);
        setNotas('');
      }, 3000);
      
    } catch (err: any) {
      setError(err.message || 'Ocurrió un error al procesar el pedido.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={() => setIsCartOpen(false)}
      ></div>

      {/* Slide-over panel */}
      <div className="relative w-full max-w-md bg-surface h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-outline-variant/30">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <ShoppingBag className="w-6 h-6 text-primary" />
            Tu Pedido
          </h2>
          <button 
            onClick={() => setIsCartOpen(false)}
            className="p-2 hover:bg-outline-variant/10 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-on-surface-variant" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {success ? (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              </div>
              <h3 className="text-2xl font-bold text-on-surface">¡Pedido Confirmado!</h3>
              <p className="text-on-surface-variant">Tu orden ha sido enviada exitosamente. Pronto nos pondremos en contacto.</p>
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center opacity-50">
              <ShoppingBag className="w-16 h-16 mb-4" />
              <p className="text-lg">Tu carrito está vacío</p>
              <p className="text-sm">Agrega productos del catálogo para comenzar.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4 border border-red-200">
                  {error}
                </div>
              )}

              {items.map(item => (
                <div key={item.id} className="flex gap-4 bg-surface-variant/30 p-3 rounded-xl border border-outline-variant/20">
                  <div className="flex-1">
                    <h4 className="font-bold text-on-surface line-clamp-1">{item.nombre}</h4>
                    <p className="text-sm font-semibold text-primary mt-1">
                      ${Number(item.precio).toFixed(2)} c/u
                    </p>
                    
                    <div className="flex items-center justify-between mt-3">
                      {/* Control de cantidad */}
                      <div className="flex items-center gap-3 bg-surface rounded-lg border border-outline-variant/30 px-2 py-1">
                        <button 
                          onClick={() => updateQuantity(item.id, item.cantidad - item.unidad_minima)}
                          className="text-on-surface-variant hover:text-red-500 transition-colors"
                          disabled={item.cantidad <= item.unidad_minima}
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="font-bold min-w-[2rem] text-center text-sm">{item.cantidad}</span>
                        <button 
                          onClick={() => updateQuantity(item.id, item.cantidad + item.unidad_minima)}
                          className="text-on-surface-variant hover:text-green-500 transition-colors"
                          disabled={item.cantidad >= item.stock_disponible}
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>

                      <button 
                        onClick={() => removeFromCart(item.id)}
                        className="text-red-400 hover:text-red-600 p-1 transition-colors"
                        title="Eliminar"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                    <div className="text-xs text-on-surface-variant/70 mt-2 text-right">
                      Subtotal: <span className="font-bold text-on-surface">${(item.precio * item.cantidad).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              ))}

              <div className="mt-6">
                <label className="block text-sm font-semibold text-on-surface-variant mb-2">Notas del Pedido (Opcional)</label>
                <textarea 
                  className="w-full bg-surface-variant/20 border border-outline-variant/50 rounded-lg p-3 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                  rows={3}
                  placeholder="Ej: Entregar por la tarde, dejar en recepción..."
                  value={notas}
                  onChange={(e) => setNotas(e.target.value)}
                ></textarea>
              </div>
            </div>
          )}
        </div>

        {/* Footer / Checkout */}
        {!success && items.length > 0 && (
          <div className="p-4 border-t border-outline-variant/30 bg-surface shadow-[0_-4px_15px_-3px_rgba(0,0,0,0.05)]">
            <div className="flex justify-between items-center mb-4">
              <span className="text-lg text-on-surface-variant font-medium">Total Estimado</span>
              <span className="text-2xl font-black text-primary">${total.toFixed(2)}</span>
            </div>
            <button 
              onClick={handleCheckout}
              disabled={isSubmitting}
              className={`w-full py-4 rounded-xl font-bold text-white shadow-lg transition-all transform hover:-translate-y-1 ${
                isSubmitting ? 'bg-primary/70 cursor-wait' : 'bg-primary hover:bg-primary/90 hover:shadow-primary/30'
              }`}
            >
              {isSubmitting ? 'Procesando...' : 'Confirmar Pedido'}
            </button>
            <button 
              onClick={clearCart}
              className="w-full mt-3 py-2 text-sm font-semibold text-on-surface-variant hover:text-red-500 transition-colors"
            >
              Vaciar Carrito
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
