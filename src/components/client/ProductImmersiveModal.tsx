import { useEffect, useRef, useState } from 'react';
import { X, ShoppingCart, Minus, Plus } from 'lucide-react';
import { useCart } from '../../context/CartContext';

interface ProductImmersiveModalProps {
  producto: {
    id: string;
    nombre: string;
    descripcion?: string;
    precio_unitario: string;
    categoria_nombre: string;
    imagen_url?: string;
  };
  onClose: () => void;
}

export function ProductImmersiveModal({ producto, onClose }: ProductImmersiveModalProps) {
  const { addToCart } = useCart();
  const overlayRef = useRef<HTMLDivElement>(null);
  const [cantidad, setCantidad] = useState(1);

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
    });
    onClose();
  };

  const handleDecrease = () => setCantidad(c => Math.max(1, c - 1));
  const handleIncrease = () => setCantidad(c => c + 1);

  return (
      <div
        ref={overlayRef}
        onClick={handleBackdropClick}
        className="fixed inset-0 z-50 flex items-center justify-center"
        style={{
          background: 'rgba(8, 6, 3, 0.92)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
        }}
      >

      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-6 right-6 z-20 p-3 rounded-full text-white/60 hover:text-white hover:bg-white/10 transition-all duration-200"
        aria-label="Cerrar"
      >
        <X className="w-6 h-6" />
      </button>

      {/* Main content */}
      <div className="relative z-10 flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16 max-w-5xl w-full px-8">
        
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
            src={producto.imagen_url || '/sweet_logo.jpg'}
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
        <div className="flex flex-col items-start max-w-sm">
          {/* Category badge */}
          <span
            className="text-xs tracking-[0.25em] uppercase font-bold mb-4 px-4 py-2 rounded-full border"
            style={{
              color: '#e3b54a',
              borderColor: 'rgba(227, 181, 74, 0.3)',
              background: 'rgba(227, 181, 74, 0.08)',
            }}
          >
            {producto.categoria_nombre}
          </span>

          {/* Product name */}
          <h1
            className="text-white mb-4"
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
          <div className="w-12 h-0.5 mb-5" style={{ background: '#e3b54a' }} />

          {/* Description */}
          {producto.descripcion && (
            <p className="text-white/50 text-sm leading-relaxed mb-8">
              {producto.descripcion}
            </p>
          )}

          {/* Price + Quantity + CTA */}
          <div className="flex flex-col md:flex-row items-start md:items-end gap-6 w-full">
            <div className="flex-shrink-0">
              <span className="text-white/40 text-xs uppercase tracking-widest block mb-1">Precio</span>
              <span
                className="font-black"
                style={{ fontSize: 'clamp(1.8rem, 3vw, 2.2rem)', color: '#e3b54a', lineHeight: 1 }}
              >
                L {parseFloat(producto.precio_unitario).toFixed(2)}
              </span>
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-white/40 text-xs uppercase tracking-widest block mb-1">Cantidad</span>
              <div className="flex items-center bg-white/5 border border-white/10 rounded-xl p-1 w-fit">
                <button 
                  onClick={handleDecrease}
                  className="p-2 rounded-lg text-white hover:bg-white/10 hover:text-[#e3b54a] transition-colors"
                >
                  <Minus className="w-5 h-5" />
                </button>
                <span className="w-12 text-center text-lg font-bold text-white">{cantidad}</span>
                <button 
                  onClick={handleIncrease}
                  className="p-2 rounded-lg text-white hover:bg-white/10 hover:text-[#e3b54a] transition-colors"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
            </div>

            <button
              onClick={handleAddToCart}
              className="flex-1 w-full md:w-auto flex items-center justify-center gap-3 font-bold py-4 px-6 rounded-2xl transition-all duration-200 hover:scale-105 active:scale-95"
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
    </div>
  );
}
