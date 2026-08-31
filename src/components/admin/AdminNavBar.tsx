import { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, PackageSearch, Users, ReceiptText, LogOut, Settings } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';
import { getClientes } from '../../services/adminService';

export function AdminNavBar() {
  const { logout } = useAuth();
  const location = useLocation();
  const [hoveredPath, setHoveredPath] = useState<string | null>(null);
  const [pendingClientsCount, setPendingClientsCount] = useState(0);

  useEffect(() => {
    const fetchPending = async () => {
      try {
        const data = await getClientes();
        const pending = data.filter((c: any) => c.estado === 'Pendiente');
        setPendingClientsCount(pending.length);
      } catch (error) {
        console.error("Error fetching pending clients", error);
      }
    };
    fetchPending();
    const interval = setInterval(fetchPending, 30000); // Polling cada 30 segundos
    window.addEventListener('clientesUpdated', fetchPending);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('clientesUpdated', fetchPending);
    };
  }, []);

  
  const navItems = [
    { to: '/admin', icon: LayoutDashboard, label: 'Inicio', end: true },
    { to: '/admin/productos', icon: PackageSearch, label: 'Productos' },
    { to: '/admin/pedidos', icon: ReceiptText, label: 'Pedidos' },
    { to: '/admin/clientes', icon: Users, label: 'Clientes' },
    { to: '/admin/configuracion', icon: Settings, label: 'Ajustes' },
  ];

  // Identificar el path base de la ruta activa actualmente
  const activeItem = navItems.find(item => 
    item.end ? location.pathname === item.to : location.pathname.startsWith(item.to)
  );
  
  // El fondo se deslizará hacia el elemento hoverado, o regresará al activo si no hay hover
  const currentPath = hoveredPath || (activeItem ? activeItem.to : null);

  return (
    <nav className="fixed bottom-0 left-0 md:bottom-auto md:left-8 md:top-1/2 md:-translate-y-1/2 md:translate-x-0 z-50 w-full md:w-auto">
      
      {/* Contenedor Flex: Fila en móvil, Columna en Desktop */}
      <div 
        className="flex flex-row md:flex-col items-center justify-between md:justify-center gap-2 md:gap-3 bg-white/95 dark:bg-[#1a1a1a]/95 md:bg-transparent md:dark:bg-transparent backdrop-blur-2xl md:backdrop-blur-none border-t border-primary/10 dark:border-white/10 md:border-none rounded-t-3xl md:rounded-none px-8 py-4 md:p-0 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] dark:shadow-[0_-10px_40px_rgba(0,0,0,0.3)] md:shadow-none transition-colors duration-300"
        onMouseLeave={() => setHoveredPath(null)}
      >
        
        {navItems.map((item) => {
          const isActive = item.end ? location.pathname === item.to : location.pathname.startsWith(item.to);
          const isCurrent = currentPath === item.to;

          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onMouseEnter={() => setHoveredPath(item.to)}
              className="group relative flex items-center justify-center w-10 h-10 md:w-14 md:h-14 rounded-full md:rounded-2xl transition-colors duration-300 z-10"
              style={{
                color: isActive 
                  ? 'var(--color-tertiary)' 
                  : 'var(--color-on-surface-variant)'
              }}
            >
              {/* Active Background - ALWAYS VISIBLE for active item */}
              {isActive && (
                <div
                  className="absolute inset-0 rounded-full md:rounded-2xl -z-10 bg-tertiary dark:bg-[#e3b54a] shadow-lg shadow-tertiary/30 dark:shadow-[#e3b54a]/30"
                />
              )}

              {/* Hover Background - Slides between hovered non-active items */}
              {!isActive && isCurrent && (
                <motion.div
                  layoutId="navbar-hover-pill"
                  className="absolute inset-0 rounded-full md:rounded-2xl -z-10 bg-outline-variant/15 dark:bg-white/10"
                  initial={false}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}

              <item.icon 
                className={`w-5 h-5 md:w-6 md:h-6 transition-all duration-300 transform ${
                  isActive ? 'text-white dark:text-black scale-110' : 'text-on-surface-variant/60 dark:text-white/40 group-hover:text-tertiary dark:group-hover:text-[#e3b54a] group-hover:scale-125 md:group-hover:translate-x-1.5 group-hover:-translate-y-1 md:group-hover:-translate-y-0'
                }`} 
                strokeWidth={2.5} 
              />
              
              {/* Badge for Pending Clients */}
              {item.to === '/admin/clientes' && pendingClientsCount > 0 && (
                <div className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-bold h-4 min-w-[16px] flex items-center justify-center rounded-full px-1 z-20 shadow-sm shadow-red-500/50 animate-bounce">
                  {pendingClientsCount > 99 ? '99+' : pendingClientsCount}
                </div>
              )}

              {/* Tooltip visible solo en Desktop al hacer hover */}
              <span className="absolute left-[calc(100%+1rem)] opacity-0 md:group-hover:opacity-100 transition-opacity duration-300 bg-surface-variant dark:bg-[#1a1a1a] text-on-surface-variant dark:text-white/80 text-[10px] font-extrabold tracking-widest uppercase px-3 py-1.5 rounded-md whitespace-nowrap pointer-events-none shadow-lg border border-outline-variant/20 dark:border-white/5 hidden md:block z-50">
                {item.label}
              </span>
            </NavLink>
          );
        })}
        
        {/* Separador */}
        <div className="w-px h-6 bg-primary/20 dark:bg-white/20 md:hidden"></div>
        <div className="h-px w-6 bg-outline-variant/30 dark:bg-white/10 hidden md:block my-2"></div>
        
        {/* Botón Salir */}
        <button 
          onClick={logout}
          className="group relative flex items-center justify-center w-10 h-10 md:w-14 md:h-14 rounded-full md:rounded-2xl bg-transparent md:bg-outline-variant/10 md:dark:bg-white/5 text-red-500/70 hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400 transition-all duration-300 hover:scale-105"
        >
          <LogOut className="w-5 h-5 md:w-6 md:h-6" strokeWidth={2.5} />
          
          <span className="absolute left-[calc(100%+1rem)] opacity-0 md:group-hover:opacity-100 transition-opacity duration-300 bg-red-500/10 text-red-600 dark:text-red-400 text-[10px] font-extrabold tracking-widest uppercase px-3 py-1.5 rounded-md whitespace-nowrap pointer-events-none shadow-lg border border-red-500/20 hidden md:block z-50">
            Salir
          </span>
        </button>
        
        {/* Etiqueta MENU (Solo Desktop) */}
        <div className="hidden md:flex flex-col items-center mt-4 opacity-50">
          <span className="text-[10px] font-extrabold tracking-widest text-on-surface-variant dark:text-white uppercase">Menu</span>
          <div className="flex gap-1 mt-1">
            <div className="w-1 h-1 rounded-full bg-current"></div>
            <div className="w-1 h-1 rounded-full bg-current"></div>
            <div className="w-1 h-1 rounded-full bg-current"></div>
          </div>
        </div>

      </div>
    </nav>
  );
}
