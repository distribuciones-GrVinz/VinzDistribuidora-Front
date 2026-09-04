import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Store, ClipboardList, ShoppingCart, User } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { motion } from 'framer-motion';

export function ClientNavBar({ tutorialStep }: { tutorialStep?: number | null }) {
  const location = useLocation();
  const { items } = useCart();
  const [hoveredPath, setHoveredPath] = useState<string | null>(null);
  
  const navItems = [
    { to: '/catalogo', icon: Store, label: 'Catálogo', end: false },
    { to: '/mis-pedidos', icon: ClipboardList, label: 'Mis Pedidos', end: false },
    { to: '/carrito', icon: ShoppingCart, label: 'Carrito', end: false },
    { to: '/configuracion', icon: User, label: 'Perfil', end: false },
  ];

  const activeItem = navItems.find(item => 
    item.end ? location.pathname === item.to : location.pathname.startsWith(item.to)
  );

  const currentPath = hoveredPath || (activeItem ? activeItem.to : null);
  
  const totalItems = items.reduce((acc, item) => acc + item.cantidad, 0);

  return (
    <>
      <nav className={`fixed bottom-0 left-0 md:bottom-auto md:left-8 md:top-1/2 md:-translate-y-1/2 md:translate-x-0 w-full md:w-auto h-[72px] md:h-auto max-h-[72px] md:max-h-none transition-all duration-300 ${tutorialStep ? 'z-[110]' : 'z-50'}`}>
        <div 
          className={`flex flex-row md:flex-col items-center justify-around md:justify-center md:bg-transparent md:dark:bg-transparent backdrop-blur-2xl md:backdrop-blur-none border-t border-primary/10 dark:border-white/10 md:border-none rounded-t-3xl md:rounded-none px-4 py-2 md:p-0 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] dark:shadow-[0_-10px_40px_rgba(0,0,0,0.3)] md:shadow-none w-full h-[72px] md:h-auto max-h-[72px] md:max-h-none transition-all duration-300 ${tutorialStep ? 'bg-transparent dark:bg-transparent' : 'bg-white/95 dark:bg-[#1a1a1a]/95'}`}
          onMouseLeave={() => setHoveredPath(null)}
        >
        
        {navItems.map((item, index) => {
          const isActive = item.end ? location.pathname === item.to : location.pathname.startsWith(item.to);
          const isCurrent = currentPath === item.to;
          const isCart = item.to === '/carrito';
          const isHighlighted = tutorialStep === index + 1; // +1 porque el paso 0 es bienvenida

          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onMouseEnter={() => setHoveredPath(item.to)}
              className={`group relative flex flex-col md:flex-row items-center justify-center w-16 h-14 md:w-14 md:h-14 md:my-1 rounded-2xl transition-all duration-300 ${
                isHighlighted 
                  ? 'z-[110] bg-surface dark:bg-[#1a1a1a] shadow-[0_0_20px_rgba(227,181,74,0.4)] scale-110' 
                  : (tutorialStep ? 'z-10 opacity-30 grayscale' : 'z-10')
              }`}
              style={{
                color: isActive || isHighlighted
                  ? 'var(--color-tertiary)' 
                  : 'var(--color-on-surface-variant)'
              }}
            >
              {/* Indicador de Activo (Pill tipo Glass) */}
              {isCurrent && (
                <motion.div
                  layoutId="client-navbar-active-pill"
                  className={`absolute inset-0 rounded-2xl md:rounded-2xl -z-10 backdrop-blur-md border ${
                    isActive 
                      ? 'bg-tertiary/20 dark:bg-[#e3b54a]/20 border-tertiary/30 dark:border-[#e3b54a]/30 shadow-lg' 
                      : 'bg-surface-variant/20 dark:bg-white/10 border-outline-variant/20 dark:border-white/10'
                  }`}
                  initial={false}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}

              <div className="relative flex flex-col items-center justify-center">
                <item.icon 
                  className={`w-6 h-6 transition-all duration-300 transform ${
                    isActive ? 'text-tertiary dark:text-[#e3b54a] scale-110 mb-1 md:mb-0' : 'text-on-surface-variant/70 dark:text-white/60 md:group-hover:text-primary dark:md:group-hover:text-white md:group-hover:scale-125 md:group-hover:translate-x-1.5 mb-0'
                  }`} 
                  strokeWidth={isActive ? 3 : 2.5} 
                />
                
                {/* Badge de Carrito */}
                {isCart && totalItems > 0 && (
                  <span className="absolute -top-1 -right-2 transform translate-x-1/4 -translate-y-1/4 bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full border border-surface dark:border-[#0a0a0a] shadow-sm">
                    {totalItems}
                  </span>
                )}

                {/* Etiqueta para Mobile (solo activa) */}
                <div className={`md:hidden overflow-hidden transition-all duration-300 flex items-center justify-center ${isActive ? 'h-3 opacity-100' : 'h-0 opacity-0'}`}>
                  <span className="text-[10px] font-extrabold tracking-tight text-tertiary dark:text-[#e3b54a] whitespace-nowrap">
                    {item.label}
                  </span>
                </div>
              </div>
              
              {/* Etiqueta Tooltip Desktop (Hover) */}
              <span className="absolute left-[calc(100%+1rem)] opacity-0 md:group-hover:opacity-100 transition-opacity duration-300 bg-surface-variant dark:bg-[#1a1a1a] text-on-surface-variant dark:text-white/80 text-[10px] font-extrabold tracking-widest uppercase px-3 py-1.5 rounded-md whitespace-nowrap pointer-events-none shadow-lg border border-outline-variant/20 dark:border-white/10 hidden md:block z-50">
                {item.label}
              </span>
            </NavLink>
          );
        })}
        
        {/* Etiqueta MENU (Solo Desktop) */}
        <div className="hidden md:flex flex-col items-center mt-4 opacity-50 dark:opacity-40">
          <span className="text-[10px] font-extrabold tracking-widest text-on-surface-variant dark:text-white uppercase">Menu</span>
          <div className="flex gap-1 mt-1">
            <div className="w-1 h-1 rounded-full bg-current dark:bg-white/50"></div>
            <div className="w-1 h-1 rounded-full bg-current dark:bg-white/50"></div>
            <div className="w-1 h-1 rounded-full bg-current dark:bg-white/50"></div>
          </div>
        </div>

        </div>
      </nav>
    </>
  );
}
