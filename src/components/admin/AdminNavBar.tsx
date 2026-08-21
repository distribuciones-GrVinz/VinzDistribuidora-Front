import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, PackageSearch, Users, ReceiptText, LogOut, Settings } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';

export function AdminNavBar() {
  const { logout } = useAuth();
  const location = useLocation();
  const [hoveredPath, setHoveredPath] = useState<string | null>(null);
  
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
    <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 md:bottom-auto md:left-8 md:top-1/2 md:-translate-y-1/2 md:translate-x-0 z-50 w-[95%] md:w-auto">
      
      {/* Contenedor Flex: Fila en móvil, Columna en Desktop */}
      <div 
        className="flex flex-row md:flex-col items-center justify-between md:justify-center gap-2 md:gap-3 bg-white/80 dark:bg-black/80 md:bg-transparent md:dark:bg-transparent backdrop-blur-xl md:backdrop-blur-none border border-primary/10 dark:border-white/10 md:border-none rounded-full md:rounded-none px-6 py-3 md:p-0 shadow-2xl md:shadow-none transition-colors duration-300"
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
              {/* Animated Sliding Background */}
              {isCurrent && (
                <motion.div
                  layoutId="navbar-active-pill"
                  className={`absolute inset-0 rounded-full md:rounded-2xl -z-10 ${
                    isActive ? 'bg-tertiary/15 dark:bg-[#e3b54a]/20 md:shadow-sm' : 'bg-outline-variant/15 dark:bg-white/10'
                  }`}
                  initial={false}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}

              <item.icon 
                className={`w-5 h-5 md:w-6 md:h-6 transition-all duration-300 transform ${
                  isActive ? 'text-tertiary dark:text-[#e3b54a] scale-110' : 'text-on-surface-variant/60 dark:text-white/40 group-hover:text-primary dark:group-hover:text-white group-hover:scale-125 md:group-hover:translate-x-1.5 group-hover:-translate-y-1 md:group-hover:-translate-y-0'
                }`} 
                strokeWidth={2.5} 
              />
              
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
