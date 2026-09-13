import { Outlet, useLocation } from 'react-router-dom';
import { AdminNavBar } from '../components/admin/AdminNavBar';
import { NotificationBell } from '../components/notifications/NotificationBell';

export function AdminLayout() {
  const location = useLocation();

  const getPageTitle = () => {
    const path = location.pathname.toLowerCase();
    if (path.includes('/productos')) return 'Productos';
    if (path.includes('/clientes')) return 'Clientes';
    if (path.includes('/pedidos')) return 'Pedidos';
    if (path.includes('/configuracion')) return 'Configuración';
    return 'Backstage';
  };

  return (
    <div className="min-h-screen bg-surface text-on-surface dark:bg-[#050505] dark:text-white font-sans overflow-x-hidden selection:bg-primary-container selection:text-white transition-colors duration-300 relative">
      {/* Imagen de Fondo Decorativa */}
      <div 
        className="fixed top-0 left-0 w-full z-0 opacity-20 dark:opacity-10 pointer-events-none transition-opacity duration-300"
        style={{
          backgroundImage: "url('/admin-bg.jpg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          filter: 'blur(1px) grayscale(10%)',
          height: '100lvh'
        }}
      ></div>

      {/* Top Navbar — Gold (Solo Móvil) */}
      <div className="md:hidden fixed top-0 left-0 w-full z-40">
        <header
          className="relative w-full px-5 h-14 flex items-center justify-between rounded-b-3xl shadow-[0_10px_40px_rgba(200,159,83,0.35)]"
          style={{ background: 'linear-gradient(90deg, #C89F53 0%, #e3b54a 50%, #C89F53 100%)' }}
        >
          {/* Left: Logo */}
          <div className="z-10 flex items-center">
            <div className="w-8 h-8 rounded-full overflow-hidden border border-[#3D2B1F]/30 shadow-sm bg-[#F9F6F0] shrink-0 flex items-center justify-center">
              <img src="/sweet_logo.jpg" alt="Sweet & Tasty" className="w-full h-full object-cover scale-[1.8]" />
            </div>
          </div>

          {/* Center: Brand name perfectly centered */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <div className="leading-none text-center">
              <span
                className="font-bold text-[16px] uppercase whitespace-nowrap block"
                style={{ color: '#1C1008', letterSpacing: '0.1em' }}
              >
                Sweet{' '}
                <span style={{ fontSize: '10px', verticalAlign: 'middle', opacity: 0.6, fontWeight: 400 }}>&amp;</span>
                {' '}Tasty
              </span>
              <span className="block text-[10px] uppercase whitespace-nowrap" style={{ color: '#3D2B1F', letterSpacing: '0.3em' }}>
                {getPageTitle()}
              </span>
            </div>
          </div>

          {/* Right: Notification Bell */}
          <div className="z-10 flex items-center">
            <NotificationBell forceDark />
          </div>
        </header>
      </div>

      {/* Contenido dinámico */}
      <main className="relative min-h-screen pb-32 pt-20 md:pt-4 px-4 md:pr-12 md:pl-32">
        <Outlet />
      </main>

      <AdminNavBar />
      <div className="hidden md:block fixed top-6 right-8 z-50">
        <NotificationBell />
      </div>
    </div>
  );
}
