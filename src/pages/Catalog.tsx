import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

interface Producto {
  id: string;
  nombre: string;
  descripcion: string;
  precio_unitario: string;
  categoria_nombre: string;
}

export function Catalog() {
  const { token, logout } = useAuth();
  const navigate = useNavigate();
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProductos = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/productos/', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          setProductos(data);
        }
      } catch (error) {
        console.error("Error fetching products", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProductos();
  }, [token]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const salados = productos.filter(p => p.categoria_nombre && p.categoria_nombre.includes('Salados'));
  const dulces = productos.filter(p => p.categoria_nombre && p.categoria_nombre.includes('Dulces'));

  return (
    <div className="min-h-screen bg-surface font-sans text-on-surface">
      {/* Navigation Bar */}
      <nav className="flex justify-between items-center p-6 md:px-12 border-b border-outline-variant/30">
        <img src="/sweet_logo.jpg" alt="Sweet & Tasty" className="h-12 object-contain mix-blend-multiply" />
        <button 
          onClick={handleLogout}
          className="text-sm font-semibold uppercase tracking-wider text-tertiary hover:text-primary transition-colors"
        >
          Cerrar Sesión
        </button>
      </nav>

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
                {salados.map(prod => (
                  <div key={prod.id} className="flex justify-between items-end border-b border-outline-variant/40 pb-2 group hover:border-tertiary transition-colors">
                    <span className="text-lg font-medium">{prod.nombre}</span>
                    <span className="text-primary-container font-semibold ml-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      +
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Dulces Column */}
            <div className="relative">
              <h2 className="text-3xl font-headline-lg font-bold text-center mb-8 text-primary-container">
                DULCES <span className="text-outline-variant font-light px-2">/</span> SWEET
              </h2>
              <div className="space-y-6">
                {dulces.map(prod => (
                  <div key={prod.id} className="flex justify-between items-end border-b border-outline-variant/40 pb-2 group hover:border-primary-container transition-colors">
                    <span className="text-lg font-medium">{prod.nombre}</span>
                    <span className="text-tertiary font-semibold ml-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      +
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}
      </main>
    </div>
  );
}
