import { Outlet } from 'react-router-dom';
import { ShoppingCartPanel } from '../components/client/ShoppingCartPanel';
import { ClientNavBar } from '../components/client/ClientNavBar';

export function ClientLayout() {
  return (
    <div className="min-h-screen font-sans text-on-surface dark:text-white flex flex-col relative overflow-x-hidden selection:bg-primary-container selection:text-white transition-colors duration-300">

      <div 
        className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/real_menu_bg.jpg')" }}
      >
        {/* Full-screen frosted glass overlay: Reduced opacity and blur so the image is clearly visible */}
        <div className="absolute inset-0 bg-surface/60 dark:bg-black/70 backdrop-blur-[2px] transition-colors duration-300"></div>
      </div>

      {/* Branding Logo: Flotante esquina superior izquierda */}
      <div className="fixed top-4 left-4 md:left-8 z-40">
        <img
          src="/sweet_logo.jpg"
          alt="Sweet & Tasty"
          className="h-10 md:h-14 object-contain mix-blend-multiply dark:mix-blend-normal dark:rounded-full dark:bg-white/90 drop-shadow-sm opacity-90"
        />
      </div>

      {/* Main Content Area: padding lateral para navBar */}
      <main className="relative z-10 flex-1 min-h-screen pb-32 pt-20 md:pt-10 md:pr-12 md:pl-32 overflow-x-hidden">
        <Outlet />
      </main>

      {/* Sidebar / Bottom Navigation Bar */}
      <ClientNavBar />

      {/* Shopping Cart Slide-over */}
      <ShoppingCartPanel />
    </div>
  );
}
