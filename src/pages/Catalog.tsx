import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { ProductImmersiveModal } from '../components/client/ProductImmersiveModal';

interface Producto {
  id: string;
  nombre: string;
  descripcion: string;
  precio_unitario: string;
  categoria_nombre: string;
  unidad_minima: number;
  stock_disponible: number;
  imagen_url?: string;
}

export function Catalog() {
  const { token } = useAuth();
  const { items } = useCart();
  const [productos, setProductos] = useState<Producto[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Producto | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>('Todos');

  useEffect(() => {
    const fetchProductos = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL || `http://${window.location.hostname}:8000/api`}/productos/`, {
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



  const getProductQuantity = (productId: string) => {
    const item = items.find(i => i.id === productId);
    return item ? item.cantidad : 0;
  };

  const renderProduct = (prod: Producto, theme: 'salado' | 'dulce') => {
    const qty = getProductQuantity(prod.id);
    
    // Evitar interpolación dinámica de Tailwind para que los estilos compilen correctamente
    const borderHover = theme === 'salado' ? 'hover:border-[#8A865D]' : 'hover:border-[#C89F53]';
    const textHover = theme === 'salado' ? 'group-hover:text-[#8A865D]' : 'group-hover:text-[#C89F53]';
    const btnText = theme === 'salado' ? 'text-black bg-[#8A865D]' : 'text-black bg-[#C89F53]';

    return (
      <div 
        key={prod.id} 
        className={`flex flex-col bg-white/95 dark:bg-[#1a1a1a]/95 border border-white/40 dark:border-white/10 rounded-2xl overflow-hidden group transition-all duration-500 cursor-pointer ${borderHover} shadow-xl hover:shadow-2xl hover:-translate-y-1`} 
        onClick={() => setSelectedProduct(prod)}
      >
        {/* Imagen del producto o placeholder */}
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-outline-variant/30 dark:bg-black/40">
          {prod.imagen_url ? (
            <img 
              src={prod.imagen_url} 
              alt={prod.nombre} 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-on-surface/50 dark:text-white/50 bg-outline-variant/30 dark:bg-black/60">
              <span className="text-3xl font-serif italic opacity-30 mb-2">Vinz</span>
              <span className="text-xs tracking-[0.2em] uppercase opacity-30">Distribuidora</span>
            </div>
          )}
          
          {/* Overlay oscuro para darle más elegancia */}
          <div className="absolute inset-0 bg-gradient-to-t from-surface/80 via-surface/20 to-transparent dark:from-black/80 dark:via-black/20 dark:to-transparent"></div>
          
          {/* Insignia de carrito en la imagen si ya hay unidades */}
          {qty > 0 && (
            <div className="absolute top-2 right-2 sm:top-3 sm:right-3 bg-black/70 backdrop-blur-sm text-white text-[10px] sm:text-xs font-bold px-2 py-0.5 sm:px-3 sm:py-1 rounded-full border border-white/10 shadow-lg">
              {qty} en carrito
            </div>
          )}
        </div>

        {/* Detalles del producto */}
        <div className="p-3 sm:p-5 flex flex-col flex-grow relative">
          <div className="flex justify-between items-start mb-1 sm:mb-2">
            <h3 className={`text-sm sm:text-lg font-medium text-on-surface dark:text-white transition-colors pr-2 line-clamp-2 ${textHover}`}>
              {prod.nombre}
            </h3>
          </div>
          
          <div className="mt-auto flex justify-between items-center pt-2 sm:pt-4">
            <span className="text-base sm:text-xl font-bold text-on-surface/90 dark:text-white/90 transition-colors">
              L {parseFloat(prod.precio_unitario).toFixed(2)}
            </span>
            
            <button 
              className={`${btnText} font-bold text-base sm:text-lg w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all duration-300 opacity-80 group-hover:opacity-100 hover:scale-110 shadow-lg`}
              aria-label="Ver producto"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedProduct(prod);
              }}
            >
              +
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="font-sans relative transition-colors duration-300 min-h-screen">

      {selectedProduct && (
        <ProductImmersiveModal
          producto={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}
      
      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-2 sm:px-6 py-12 md:py-20 pb-16">
        <div className="text-center mb-24">
          <h1 className="text-5xl md:text-7xl font-headline-xl font-bold mb-4 tracking-tight text-on-surface dark:text-white drop-shadow-sm transition-colors">SWEET & TASTY</h1>
          <p className="text-xl md:text-2xl text-primary dark:text-[#C89F53] font-serif italic mb-8 border-b border-primary/30 dark:border-[#C89F53]/50 pb-8 inline-block px-16 drop-shadow-sm transition-colors">
            by VINZ
          </p>
          <br/>
          <span className="text-sm tracking-[0.4em] uppercase text-on-surface-variant dark:text-white/80 bg-surface/50 dark:bg-black/40 px-6 py-2 rounded-full border border-outline-variant/50 dark:border-white/20 backdrop-blur-md shadow-sm transition-colors">
            Menú Exclusivo
          </span>
        </div>

        {/* Filtros de categoría */}
        {!loading && (
          <div className="flex overflow-x-auto hide-scrollbar gap-3 sm:gap-4 justify-start md:justify-center mb-12 px-2 py-2">
            {['Todos', 'Salados', 'Dulces', 'Bebidas'].map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`whitespace-nowrap px-6 py-2.5 rounded-full font-bold text-sm transition-all shadow-sm border ${
                  activeCategory === cat 
                    ? 'bg-gradient-to-r from-[#e3b54a] to-[#c9923c] text-black border-transparent scale-105' 
                    : 'bg-surface-variant/40 text-on-surface/70 dark:bg-black/40 dark:text-white/70 border-outline-variant/30 dark:border-white/10 hover:border-[#e3b54a]/50 hover:text-on-surface dark:hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#C89F53]"></div>
          </div>
        ) : (
          <div className="space-y-24">
            
            {/* Salados Row */}
            {(activeCategory === 'Todos' || activeCategory === 'Salados') && (
              <div className="relative animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h2 className="text-3xl md:text-4xl font-headline-lg font-bold text-center mb-12 text-[#686343] dark:text-[#8A865D] drop-shadow-lg transition-colors">
                  SALADOS <span className="text-outline-variant/50 dark:text-white/30 font-light px-3">|</span> SAVORY
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-6 md:gap-8">
                  {productos.filter(p => p.categoria_nombre && p.categoria_nombre.includes('Salados')).map(prod => 
                    renderProduct(prod, 'salado')
                  )}
                </div>
              </div>
            )}

            {/* Dulces Row */}
            {(activeCategory === 'Todos' || activeCategory === 'Dulces') && (
              <div className="relative animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h2 className="text-3xl md:text-4xl font-headline-lg font-bold text-center mb-12 text-primary dark:text-[#C89F53] drop-shadow-lg transition-colors">
                  DULCES <span className="text-outline-variant/50 dark:text-white/30 font-light px-3">|</span> SWEET
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-6 md:gap-8">
                  {productos.filter(p => p.categoria_nombre && p.categoria_nombre.includes('Dulces')).map(prod => 
                    renderProduct(prod, 'dulce')
                  )}
                </div>
              </div>
            )}

            {/* Bebidas Naturales Row */}
            {(activeCategory === 'Todos' || activeCategory === 'Bebidas') && (
              <div className="relative animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h2 className="text-3xl md:text-4xl font-headline-lg font-bold text-center mb-16 text-on-surface dark:text-white drop-shadow-lg transition-colors">
                  BEBIDAS NATURALES <span className="text-outline-variant/50 dark:text-white/30 font-light px-3">|</span> DRINKS
                </h2>
                
                <div className="grid lg:grid-cols-2 gap-12 lg:gap-20">
                  {/* Con Azúcar */}
                  <div className="bg-surface-variant/40 dark:bg-black/30 p-5 sm:p-8 rounded-3xl border border-outline-variant/20 dark:border-white/5 backdrop-blur-sm transition-colors">
                    <h3 className="text-xl font-bold mb-8 text-[#686343] dark:text-[#8A865D] uppercase tracking-widest text-center transition-colors">Con Azúcar</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-6">
                      {productos.filter(p => p.categoria_nombre && p.categoria_nombre.includes('Bebidas') && p.categoria_nombre.includes('Con')).map(prod => 
                        renderProduct(prod, 'salado')
                      )}
                    </div>
                  </div>

                  {/* Sin Azúcar */}
                  <div className="bg-surface-variant/40 dark:bg-black/30 p-5 sm:p-8 rounded-3xl border border-outline-variant/20 dark:border-white/5 backdrop-blur-sm transition-colors">
                    <h3 className="text-xl font-bold mb-8 text-primary dark:text-[#C89F53] uppercase tracking-widest text-center transition-colors">Sin Azúcar</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-6">
                      {productos.filter(p => p.categoria_nombre && p.categoria_nombre.includes('Bebidas') && p.categoria_nombre.includes('Sin')).map(prod => 
                        renderProduct(prod, 'dulce')
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>
        )}
      </main>
    </div>
  );
}
