import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, ShoppingCart, Minus, Plus } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useLockBodyScroll } from '../../hooks/useLockBodyScroll';
import { ScrollProgressIndicator } from '../ui/ScrollProgressIndicator';

interface ProductImmersiveModalProps {
  producto: {
    id: string;
    nombre: string;
    descripcion?: string;
    precio_unitario: string;
    categoria_nombre: string;
    imagen_url?: string;
    exento_isv?: boolean;
  };
  onClose: () => void;
}

export function ProductImmersiveModal({ producto, onClose }: ProductImmersiveModalProps) {
  const { addToCart } = useCart();
  const overlayRef = useRef<HTMLDivElement>(null);
  const [cantidad, setCantidad] = useState(1);

  useLockBodyScroll(true);

  // Close on backdrop click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) onClose();
  };

  // Close on Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  const handleAddToCart = () => {
    addToCart({
      id: producto.id,
      nombre: producto.nombre,
      precio: parseFloat(producto.precio_unitario),
      cantidad: cantidad,
      unidad_minima: 1,
      stock_disponible: 99,
      exento_isv: producto.exento_isv || false,
      imagen: producto.imagen_url
        ? producto.imagen_url
        : undefined
    });
    onClose();
  };

  const handleDecrease = () => setCantidad(c => Math.max(1, c - 1));
  const handleIncrease = () => setCantidad(c => c + 1);
  const handleManualQuantity = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value);
    if (!isNaN(val) && val >= 1) {
      setCantidad(val);
    } else if (e.target.value === '') {
      // Permitir que el usuario borre momentáneamente
      setCantidad(0 as any); // Temporal, se limpia
    }
  };
  const handleQuantityBlur = () => {
    if (!cantidad || cantidad < 1) {
      setCantidad(1);
    }
  };

  return createPortal(
      <div
        ref={overlayRef}
        onClick={handleBackdropClick}
        className="fixed inset-0 z-[10000] flex items-start md:items-center justify-center overflow-y-auto bg-surface/95 dark:bg-[#080603]/95 backdrop-blur-md"
      >
        <ScrollProgressIndicator targetRef={overlayRef} />

      {/* Close button */}
      <button
        onClick={onClose}
        className="fixed top-6 right-6 z-[10001] p-3 rounded-full text-on-surface-variant hover:text-on-surface hover:bg-outline-variant/10 dark:text-white/60 dark:hover:text-white dark:hover:bg-white/10 transition-all duration-200"
        aria-label="Cerrar"
      >
        <X className="w-6 h-6" />
      </button>

      {/* Main content */}
      <div className="relative z-10 flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16 max-w-5xl w-full px-8 py-20 min-h-full">
        
        {/* Product image — floating animation */}
        <div
          className="relative flex-shrink-0"
          style={{ animation: 'floatProduct 4s ease-in-out infinite' }}
        >
          {/* Glow behind the product */}
          <div
            className="absolute inset-0 rounded-full blur-3xl opacity-30"
            style={{
              background: 'radial-gradient(circle, #e3b54a 0%, transparent 70%)',
              transform: 'scale(1.2)',
            }}
          />
          <img
            src={producto.imagen_url ? producto.imagen_url : '/sweet_logo.jpg'}
            alt={producto.nombre}
            className="relative z-10 drop-shadow-2xl"
            style={{
              width: 'clamp(240px, 35vw, 420px)',
              height: 'clamp(240px, 35vw, 420px)',
              objectFit: 'contain',
              mixBlendMode: 'luminosity',
              filter: 'brightness(1.05) contrast(1.05)',
            }}
          />
        </div>

        {/* Info panel */}
        <div className="flex flex-col items-start max-w-sm w-full">
          {/* Category badge */}
          <span
            className="text-xs tracking-[0.25em] uppercase font-bold mb-4 px-4 py-2 rounded-full border border-primary/30 text-primary dark:text-[#e3b54a] bg-primary/10"
          >
            {producto.categoria_nombre}
          </span>

          {/* Product name */}
          <h1
            className="text-on-surface dark:text-white mb-4"
            style={{
              fontSize: 'clamp(2rem, 5vw, 3.5rem)',
              fontWeight: 800,
              lineHeight: 1.05,
              letterSpacing: '-0.02em',
            }}
          >
            {producto.nombre}
          </h1>

          {/* Divider */}
          <div className="w-12 h-0.5 mb-5 bg-primary dark:bg-[#e3b54a]" />

          {/* Description */}
          {producto.descripcion && (
            <p className="text-on-surface-variant/80 dark:text-white/50 text-sm leading-relaxed mb-8">
              {producto.descripcion}
            </p>
          )}

          {/* Price */}
          <div className="flex-shrink-0 mb-6">
            <span className="text-on-surface-variant/60 dark:text-white/40 text-xs uppercase tracking-widest block mb-1">Precio</span>
            <span
              className="font-black text-primary dark:text-[#e3b54a]"
              style={{ fontSize: 'clamp(1.8rem, 3vw, 2.2rem)', lineHeight: 1 }}
            >
              L {parseFloat(producto.precio_unitario).toFixed(2)}
            </span>
          </div>

          {/* Quantity + CTA — misma fila */}
          <div className="flex items-center gap-3 w-full">
            {/* Selector de cantidad */}
            <div className="flex items-center bg-surface-variant/20 dark:bg-white/5 border border-outline-variant/20 dark:border-white/10 rounded-xl p-1 flex-shrink-0">
              <button 
                onClick={handleDecrease}
                className="p-3 md:p-2 rounded-lg text-on-surface hover:text-[#e3b54a] dark:text-white transition-colors"
              >
                <Minus className="w-5 h-5" />
              </button>
              <input 
                type="number"
                min="1"
                value={cantidad || ''}
                onChange={handleManualQuantity}
                onBlur={handleQuantityBlur}
                className="w-10 text-center text-lg font-bold text-on-surface dark:text-white bg-transparent outline-none focus:ring-1 focus:ring-primary/50 dark:focus:ring-[#e3b54a]/50 rounded-md"
              />
              <button 
                onClick={handleIncrease}
                className="p-3 md:p-2 rounded-lg text-on-surface hover:text-[#e3b54a] dark:text-white transition-colors"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>

            {/* Botón Agregar */}
            <button
              onClick={handleAddToCart}
              className="flex-1 flex items-center justify-center gap-3 font-bold py-4 px-6 rounded-2xl transition-all duration-200 hover:scale-105 active:scale-95"
              style={{
                background: 'linear-gradient(135deg, #e3b54a 0%, #c9923c 100%)',
                color: '#000',
                boxShadow: '0 0 30px rgba(227, 181, 74, 0.4)',
              }}
            >
              <ShoppingCart className="w-5 h-5" />
              Agregar
            </button>
          </div>
        </div>
      </div>

      {/* CSS keyframes injected inline */}
      <style>{`
        @keyframes floatProduct {
          0%, 100% { transform: translateY(0px) rotate(-1deg); }
          50%       { transform: translateY(-18px) rotate(1deg); }
        }
      `}</style>
    </div>,
    document.body
  );
}
