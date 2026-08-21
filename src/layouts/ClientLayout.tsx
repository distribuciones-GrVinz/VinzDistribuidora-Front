import { Outlet } from 'react-router-dom';
import { ShoppingCartPanel } from '../components/client/ShoppingCartPanel';
import { ClientNavBar } from '../components/client/ClientNavBar';

export function ClientLayout() {
  return (
    <div className="min-h-screen bg-surface font-sans text-on-surface flex flex-col relative overflow-x-hidden selection:bg-primary-container selection:text-white transition-colors duration-300">
      
      {/* Branding Logo: Flotante esquina superior derecha en Desktop, centrado en Móvil */}
      <div className="fixed top-4 left-4 md:left-auto md:right-8 z-40">
        <img src="/sweet_logo.jpg" alt="Sweet & Tasty" className="h-10 md:h-16 object-contain mix-blend-multiply drop-shadow-sm opacity-90" />
      </div>

      {/* Main Content Area: Padding adjust to not overlap with side navbar on desktop and bottom navbar on mobile */}
      <main className="relative z-10 flex-1 min-h-screen pb-32 pt-20 md:pt-10 px-4 md:pr-12 md:pl-32">
        <Outlet />
      </main>

      {/* Sidebar / Bottom Navigation Bar */}
      <ClientNavBar />

      {/* Shopping Cart Slide-over */}
      <ShoppingCartPanel />
    </div>
  );
}
