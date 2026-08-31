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
  estado?: boolean;
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
          const allProducts = data.results || data;
          // Filtrar productos inactivos y ordenarlos alfabéticamente
          const filteredAndSorted = allProducts
            .filter((p: Producto) => p.estado !== false)
            .sort((a: Producto, b: Producto) => a.nombre.localeCompare(b.nombre));
          setProductos(filteredAndSorted);
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
        className={`flex flex-col mx-auto w-full max-w-[170px] sm:max-w-[220px] md:max-w-[240px] h-full bg-white/95 dark:bg-[#1a1a1a]/95 border border-white/40 dark:border-white/10 rounded-2xl overflow-hidden group transition-all duration-500 cursor-pointer ${borderHover} shadow-xl hover:shadow-2xl hover:-translate-y-1`} 
        onClick={() => setSelectedProduct(prod)}
      >
        {/* Imagen del producto o placeholder con fondo crema/gris */}
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#F2EFE9] dark:bg-[#222222]">
          {prod.imagen_url ? (
            <img 
              src={prod.imagen_url?.replace(/^https?:\/\/[^\/]+/, '')} 
              alt={prod.nombre} 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-on-surface/50 dark:text-white/50 bg-outline-variant/30 dark:bg-black/60">
              <span className="text-3xl font-serif italic opacity-30 mb-2">Vinz</span>
              <span className="text-xs tracking-[0.2em] uppercase opacity-30">Distribuidora</span>
            </div>
          )}
          
          {/* Overlay sutil (se eliminó el gradiente crema que desenfocaba la imagen) */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent dark:from-black/60 dark:to-transparent"></div>
          
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

  const renderProductList = (items: Producto[], theme: 'salado' | 'dulce') => {
    if (items.length % 2 === 0) {
      return (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-6 md:gap-8 px-1 sm:px-2 md:px-4">
          {items.map(prod => renderProduct(prod, theme))}
        </div>
      );
    }
    
    if (items.length <= 3) {
      return (
        <div className="flex overflow-x-auto gap-3 sm:gap-6 md:gap-8 pb-6 snap-x snap-mandatory scroll-smooth hide-scrollbar px-1 sm:px-2 md:px-4">
          {items.map(prod => (
            <div key={prod.id} className="w-[calc(50%-0.375rem)] sm:w-[calc(33.3333%-1rem)] md:w-[calc(25%-1.5rem)] xl:w-[calc(20%-1.6rem)] flex-none snap-start">
              {renderProduct(prod, theme)}
            </div>
          ))}
        </div>
      );
    }

    // Impares mayores a 3 (ej: 5, 7, 9)
    // Se divide en una cuadrícula para los primeros elementos (pares) y un carrusel para los últimos 3
    const gridItems = items.slice(0, items.length - 3);
    const carouselItems = items.slice(items.length - 3);

    return (
      <div className="flex flex-col gap-3 sm:gap-6 md:gap-8">
        {gridItems.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-6 md:gap-8 px-1 sm:px-2 md:px-4">
            {gridItems.map(prod => renderProduct(prod, theme))}
          </div>
        )}
        <div className="flex overflow-x-auto gap-3 sm:gap-6 md:gap-8 pb-6 snap-x snap-mandatory scroll-smooth hide-scrollbar px-1 sm:px-2 md:px-4">
          {carouselItems.map(prod => (
            <div key={prod.id} className="w-[calc(50%-0.375rem)] sm:w-[calc(33.3333%-1rem)] md:w-[calc(25%-1.5rem)] xl:w-[calc(20%-1.6rem)] flex-none snap-start">
              {renderProduct(prod, theme)}
            </div>
          ))}
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
      <main className="relative z-10 max-w-7xl mx-auto px-2 sm:px-6 pt-2 md:pt-4 md:pb-12">
        <div className="text-center mb-4">
          <h1 className="text-5xl md:text-7xl font-headline-xl font-bold mb-2 tracking-tight text-on-surface dark:text-white drop-shadow-sm transition-colors">
            SWEET <span style={{ fontSize: '55%', verticalAlign: 'middle', opacity: 0.65, fontWeight: 400 }}>&amp;</span> TASTY
          </h1>
          <p className="block text-xl md:text-2xl text-primary dark:text-[#C89F53] font-serif italic mb-6 drop-shadow-sm transition-colors">
            by VINZ
          </p>
          <div className="w-20 h-px bg-primary/30 dark:bg-[#C89F53]/50 mx-auto mb-4" />
          <span className="inline-block text-sm tracking-[0.4em] uppercase text-on-surface-variant dark:text-white/80 bg-surface/70 dark:bg-black/50 px-6 py-2 rounded-full border border-outline-variant/50 dark:border-white/20 shadow-sm transition-colors">
            Menú Exclusivo
          </span>
        </div>

        {/* Filtros de categoría */}
        {!loading && (() => {
          const availableCategories = ['Todos'];
          if (productos.some(p => p.categoria_nombre && p.categoria_nombre.includes('Salados'))) availableCategories.push('Salados');
          if (productos.some(p => p.categoria_nombre && p.categoria_nombre.includes('Dulces'))) availableCategories.push('Dulces');
          if (productos.some(p => p.categoria_nombre && p.categoria_nombre.includes('Bebida'))) availableCategories.push('Bebidas');

          return (
            <div className="flex flex-wrap gap-3 sm:gap-4 justify-center mb-2 px-2 py-2">
              {availableCategories.map(cat => (
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
          );
        })()}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#C89F53]"></div>
          </div>
        ) : (
          <div className="space-y-8">
            
            {/* Salados Row */}
            {(activeCategory === 'Todos' || activeCategory === 'Salados') && (() => {
              const items = productos.filter(p => p.categoria_nombre && p.categoria_nombre.includes('Salados'));
              if (items.length === 0) return null;
              
              return (
                <div className="relative animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="flex justify-center mb-3">
                    <h2 className="text-4xl md:text-5xl font-headline-lg font-bold text-center text-primary dark:text-white drop-shadow-2xl transition-colors">
                      SALADOS <span className="text-tertiary dark:text-[#C89F53] font-light px-3 opacity-90">|</span> <span className="text-tertiary dark:text-[#C89F53]">SAVORY</span>
                    </h2>
                  </div>
                  {renderProductList(items, 'salado')}
                </div>
              );
            })()}

            {/* Dulces Row */}
            {(activeCategory === 'Todos' || activeCategory === 'Dulces') && (() => {
              const items = productos.filter(p => p.categoria_nombre && p.categoria_nombre.includes('Dulces'));
              if (items.length === 0) return null;
              
              return (
                <div className="relative animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="flex justify-center mb-3">
                    <h2 className="text-4xl md:text-5xl font-headline-lg font-bold text-center text-primary dark:text-white drop-shadow-2xl transition-colors">
                      DULCES <span className="text-tertiary dark:text-[#C89F53] font-light px-3 opacity-90">|</span> <span className="text-tertiary dark:text-[#C89F53]">SWEET</span>
                    </h2>
                  </div>
                  {renderProductList(items, 'dulce')}
                </div>
              );
            })()}

            {/* Bebidas Naturales Row */}
            {(activeCategory === 'Todos' || activeCategory === 'Bebidas') && (() => {
              const bebidas = productos.filter(p => p.categoria_nombre && p.categoria_nombre.includes('Bebida'));
              if (bebidas.length === 0) return null;

              const conAzucar = bebidas.filter(p => p.categoria_nombre.includes('Con'));
              const sinAzucar = bebidas.filter(p => p.categoria_nombre.includes('Sin'));

              return (
                <div className="relative animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="flex justify-center mb-1">
                    <h2 className="text-4xl md:text-5xl font-headline-lg font-bold text-center text-primary dark:text-white drop-shadow-2xl transition-colors">
                      BEBIDAS <span className="text-tertiary dark:text-[#C89F53] font-light px-3 opacity-90">|</span> <span className="text-tertiary dark:text-[#C89F53]">DRINKS</span>
                    </h2>
                  </div>
                  
                  <div className="flex flex-col gap-6">
                    {/* Con Azúcar */}
                    {conAzucar.length > 0 && (
                      <div>
                        <h3 className="text-xl font-bold mb-4 text-[#686343] dark:text-[#8A865D] uppercase tracking-widest text-center drop-shadow-md transition-colors">Con Azúcar</h3>
                        {renderProductList(conAzucar, 'salado')}
                      </div>
                    )}

                    {/* Sin Azúcar */}
                    {sinAzucar.length > 0 && (
                      <div>
                        <h3 className="text-xl font-bold mb-4 text-primary dark:text-[#C89F53] uppercase tracking-widest text-center drop-shadow-md transition-colors">Sin Azúcar</h3>
                        {renderProductList(sinAzucar, 'dulce')}
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}

          </div>
        )}
      </main>
    </div>
  );
}
