import { Outlet } from 'react-router-dom';
import { AdminNavBar } from '../components/admin/AdminNavBar';

export function AdminLayout() {
  return (
    <div className="min-h-screen bg-surface text-on-surface dark:bg-[#050505] dark:text-white font-sans overflow-x-hidden selection:bg-primary-container selection:text-white transition-colors duration-300 relative">
      {/* Imagen de Fondo Decorativa */}
      <div 
        className="fixed inset-0 z-0 opacity-20 dark:opacity-10 pointer-events-none transition-opacity duration-300"
        style={{
          backgroundImage: "url('/admin-bg.jpg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          filter: 'blur(1px) grayscale(10%)'
        }}
      ></div>

      {/* Contenido dinámico */}
      <main className="relative z-10 min-h-screen pb-32 pt-8 px-4 md:px-12">
        <Outlet />
      </main>

      <AdminNavBar />
    </div>
  );
}
