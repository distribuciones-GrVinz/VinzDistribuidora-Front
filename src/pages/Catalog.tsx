import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

interface Producto {
  id: string;
  nombre: string;
  descripcion: string;
  precio_unitario: string;
  categoria_nombre: string;
  unidad_minima: number;
  stock_disponible: number;
}

export function Catalog() {
  const { token } = useAuth();
  const { addToCart, items } = useCart();
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProductos = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}/productos/`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          setProductos(data.results || data);
        }
      } catch (error) {
        console.error("Error fetching products", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProductos();
  }, [token]);

  const handleAddProduct = (prod: Producto) => {
    addToCart({
      id: prod.id,
      nombre: prod.nombre,
      precio: parseFloat(prod.precio_unitario),
      cantidad: 1, // El CartContext se encarga de usar unidad_minima si es el primero
      unidad_minima: prod.unidad_minima || 1,
      stock_disponible: prod.stock_disponible || 99
    });
  };

  const getProductQuantity = (productId: string) => {
    const item = items.find(i => i.id === productId);
    return item ? item.cantidad : 0;
  };

  const renderProduct = (prod: Producto, theme: 'salado' | 'dulce') => {
    const qty = getProductQuantity(prod.id);
    
    // Evitar interpolación dinámica de Tailwind para que los estilos compilen correctamente
    const hoverBg = theme === 'salado' ? 'hover:bg-[#8A865D]/10' : 'hover:bg-[#C89F53]/10';
    const borderHover = theme === 'salado' ? 'hover:border-transparent' : 'hover:border-transparent';
    const btnText = theme === 'salado' ? 'text-[#8A865D]' : 'text-[#C89F53]';
    const btnHoverBg = theme === 'salado' ? 'hover:bg-[#8A865D]/20' : 'hover:bg-[#C89F53]/20';

    return (
      <div 
        key={prod.id} 
        className={`flex justify-between items-center border-b border-outline-variant/30 p-3 -mx-3 rounded-xl group transition-all duration-300 cursor-pointer ${hoverBg} ${borderHover}`} 
        onClick={() => handleAddProduct(prod)}
      >
        <div className="flex flex-col">
          <span className="text-lg font-medium group-hover:translate-x-1 transition-transform duration-300">{prod.nombre}</span>
          <span className="text-sm text-on-surface-variant font-semibold mt-0.5">L {parseFloat(prod.precio_unitario).toFixed(2)} c/u</span>
        </div>
        <div className="flex items-center gap-3">
          {qty > 0 && (
            <span className="text-xs font-bold bg-surface-variant px-2 py-1 rounded-md text-on-surface-variant shadow-sm">
              {qty} en carrito
            </span>
          )}
          <button 
            className={`${btnText} font-bold text-xl w-8 h-8 rounded-full flex items-center justify-center transition-colors opacity-50 group-hover:opacity-100 group-hover:scale-110 ${btnHoverBg}`}
            aria-label="Agregar al carrito"
            onClick={(e) => {
              e.stopPropagation();
              handleAddProduct(prod);
            }}
          >
            +
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen font-sans">
      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-headline-xl font-bold mb-4 tracking-tight">SWEET & TASTY</h1>
          <p className="text-xl md:text-2xl text-tertiary font-serif italic mb-8 border-b border-primary-container pb-8 inline-block px-12">
            by VINZ
          </p>
          <p className="text-sm tracking-[0.3em] uppercase text-on-surface-variant">Menú Exclusivo</p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-container"></div>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-16 md:gap-24">
            
            {/* Salados Column */}
            <div className="relative">
              <h2 className="text-3xl font-headline-lg font-bold text-center mb-8 text-tertiary">
                SALADOS <span className="text-outline-variant font-light px-2">/</span> SAVORY
              </h2>
              <div className="space-y-6">
                {productos.filter(p => p.categoria_nombre && p.categoria_nombre.includes('Salados')).map(prod => 
                  renderProduct(prod, 'salado')
                )}
              </div>
            </div>

            {/* Dulces Column */}
            <div className="relative">
              <h2 className="text-3xl font-headline-lg font-bold text-center mb-8 text-primary-container">
                DULCES <span className="text-outline-variant font-light px-2">/</span> SWEET
              </h2>
              <div className="space-y-4">
                {productos.filter(p => p.categoria_nombre && p.categoria_nombre.includes('Dulces')).map(prod => 
                  renderProduct(prod, 'dulce')
                )}
              </div>
            </div>

            {/* Bebidas Naturales Column */}
            <div className="relative md:col-span-2 mt-8 md:mt-12">
              <h2 className="text-3xl font-headline-lg font-bold text-center mb-12 text-on-surface">
                BEBIDAS NATURALES <span className="text-outline-variant font-light px-2">/</span> DRINKS
              </h2>
              
              <div className="grid md:grid-cols-2 gap-16 md:gap-24">
                {/* Con Azúcar */}
                <div>
                  <h3 className="text-xl font-bold mb-6 text-tertiary uppercase tracking-widest text-center">Con Azúcar</h3>
                  <div className="space-y-4">
                    {productos.filter(p => p.categoria_nombre && p.categoria_nombre.includes('Bebidas') && p.categoria_nombre.includes('Con')).map(prod => 
                      renderProduct(prod, 'salado')
                    )}
                  </div>
                </div>

                {/* Sin Azúcar */}
                <div>
                  <h3 className="text-xl font-bold mb-6 text-primary-container uppercase tracking-widest text-center">Sin Azúcar</h3>
                  <div className="space-y-4">
                    {productos.filter(p => p.categoria_nombre && p.categoria_nombre.includes('Bebidas') && p.categoria_nombre.includes('Sin')).map(prod => 
                      renderProduct(prod, 'dulce')
                    )}
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}
      </main>
    </div>
  );
}
