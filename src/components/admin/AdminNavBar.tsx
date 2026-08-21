import { NavLink } from 'react-router-dom';
import { LayoutDashboard, PackageSearch, Users, ReceiptText, LogOut, Settings } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export function AdminNavBar() {
  const { logout } = useAuth();
  
  const navItems = [
    { to: '/admin', icon: LayoutDashboard, label: 'Inicio', end: true },
    { to: '/admin/productos', icon: PackageSearch, label: 'Productos' },
    { to: '/admin/pedidos', icon: ReceiptText, label: 'Pedidos' },
    { to: '/admin/clientes', icon: Users, label: 'Clientes' },
    { to: '/admin/configuracion', icon: Settings, label: 'Ajustes' },
  ];

  return (
    <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[95%] md:w-auto">
      <div className="bg-white/80 dark:bg-black/80 backdrop-blur-xl border border-primary/10 dark:border-white/10 rounded-full px-6 py-3 flex items-center justify-between md:justify-center gap-4 md:gap-8 shadow-2xl transition-colors duration-300">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `flex flex-col md:flex-row items-center gap-1.5 md:gap-2 transition-all duration-300 ${
                isActive 
                  ? 'text-tertiary dark:text-primary-container drop-shadow-[0_0_8px_rgba(138,134,93,0.3)] dark:drop-shadow-[0_0_8px_rgba(200,159,83,0.4)] scale-110 md:scale-105' 
                  : 'text-on-surface-variant/70 dark:text-white/50 hover:text-primary dark:hover:text-white'
              }`
            }
          >
            <item.icon className="w-5 h-5 md:w-4 md:h-4" />
            <span className="text-[10px] md:text-xs font-semibold tracking-widest uppercase">{item.label}</span>
          </NavLink>
        ))}
        
        <div className="w-px h-6 bg-primary/20 dark:bg-white/20 hidden md:block"></div>
        
        <button 
          onClick={logout}
          className="flex flex-col md:flex-row items-center gap-1.5 md:gap-2 text-red-500/80 hover:text-red-600 dark:text-red-500/70 dark:hover:text-red-500 transition-all hover:scale-105"
        >
          <LogOut className="w-5 h-5 md:w-4 md:h-4" />
          <span className="text-[10px] md:text-xs font-semibold tracking-widest uppercase md:inline">Salir</span>
        </button>
      </div>
    </nav>
  );
}
