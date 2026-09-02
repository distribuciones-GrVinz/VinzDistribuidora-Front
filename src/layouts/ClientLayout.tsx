import { Outlet } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { ClientNavBar } from '../components/client/ClientNavBar';
import { useAuth } from '../context/AuthContext';
import { NotificationBell } from '../components/notifications/NotificationBell';
import { Clock, ShieldAlert } from 'lucide-react';

export function ClientLayout() {
  const { user, refreshUserState } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const isAdmin = user?.rol === 'Administrador';
  const isAprobado = user?.cliente_estado === 'Aprobado';
  const isRejected = user?.cliente_estado === 'Rechazado';
  const isPending = !isAdmin && !isAprobado && !isRejected;

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  console.log("ClientLayout Debug -> USER:", user, "isPending:", isPending, "isRejected:", isRejected);

  if (isPending || isRejected) {
    return (
      <div className="min-h-screen bg-surface dark:bg-[#0a0a0a] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white dark:bg-[#111] rounded-3xl p-8 text-center shadow-2xl border border-outline-variant/30 dark:border-white/10">
          <div className="w-20 h-20 bg-primary-container/20 mx-auto rounded-full flex items-center justify-center mb-6">
            {isRejected ? (
              <ShieldAlert className="w-10 h-10 text-red-500" />
            ) : (
              <Clock className="w-10 h-10 text-primary dark:text-[#e3b54a] animate-pulse" />
            )}
          </div>
          <h2 className="text-2xl font-bold text-on-surface dark:text-white mb-4">
            {isRejected ? 'Cuenta Rechazada' : 'Cuenta en Verificación'}
          </h2>
          <p className="text-on-surface-variant dark:text-white/60 mb-8">
            {isRejected
              ? 'Lo sentimos, tu solicitud de cuenta corporativa no ha sido aprobada. Por favor contacta a soporte.'
              : 'Tu información está siendo validada por nuestro equipo. Este proceso puede tardar unos minutos. Podrás acceder al catálogo una vez se apruebe tu perfil.'}
          </p>
          <button
            onClick={async () => {
              setIsRefreshing(true);
              await refreshUserState();
              setIsRefreshing(false);
            }}
            disabled={isRefreshing}
            className={`w-full py-3 px-4 font-bold rounded-xl transition-all flex items-center justify-center ${
              isRefreshing 
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                : 'bg-tertiary text-white dark:bg-[#e3b54a] dark:text-black hover:opacity-90'
            }`}
          >
            {isRefreshing ? (
              <svg className="animate-spin h-5 w-5 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : null}
            {isRefreshing ? 'Verificando...' : 'Refrescar Estado'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen font-sans text-on-surface dark:text-white flex flex-col relative overflow-x-hidden selection:bg-primary-container selection:text-white transition-colors duration-300">

      <div
        className="fixed top-0 left-0 w-full z-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/real_menu_bg.jpg')", height: '100lvh' }}
      >
        <div className="absolute inset-0 bg-surface/60 dark:bg-black/70 backdrop-blur-[2px] transition-colors duration-300" />
      </div>

      {/* Top Navbar — Gold with rounded bottom + scroll-aware title */}
      <div className="fixed top-0 left-0 w-full z-40 md:hidden">
        <header
          className="relative w-full px-5 md:px-8 h-14 flex items-center justify-between rounded-b-3xl shadow-[0_10px_40px_rgba(200,159,83,0.35)]"
          style={{ background: 'linear-gradient(90deg, #C89F53 0%, #e3b54a 50%, #C89F53 100%)' }}
        >
          {/* Left: Logo */}
          <div className="z-10 flex items-center">
            <div className="w-8 h-8 rounded-full overflow-hidden border border-[#3D2B1F]/30 shadow-sm bg-[#F9F6F0] shrink-0 flex items-center justify-center">
              <img src="/sweet_logo.jpg" alt="Sweet & Tasty" className="w-full h-full object-cover" />
            </div>
          </div>

          {/* Center: Brand name perfectly centered, enters elegantly on scroll */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <div
              className="leading-none text-center"
              style={{
                opacity: scrolled ? 1 : 0,
                transform: scrolled ? 'translateY(0)' : 'translateY(15px)',
                transition: 'opacity 0.8s ease-out, transform 0.8s cubic-bezier(0.2, 0.8, 0.2, 1)',
              }}
            >
              <span
                className="font-bold text-[16px] uppercase whitespace-nowrap block"
                style={{ color: '#1C1008', letterSpacing: '0.1em' }}
              >
                Sweet{' '}
                <span style={{ fontSize: '10px', verticalAlign: 'middle', opacity: 0.6, fontWeight: 400 }}>&amp;</span>
                {' '}Tasty
              </span>
              <span className="block text-[10px] uppercase whitespace-nowrap" style={{ color: '#3D2B1F', letterSpacing: '0.3em' }}>
                by Vinz
              </span>
            </div>
          </div>

          {/* Right: Notification Bell */}
          <div className="z-10 flex items-center">
            <NotificationBell />
          </div>
        </header>
      </div>

      <main className="relative z-10 flex-1 min-h-screen pb-24 pt-14 md:pr-12 md:pl-32 overflow-x-hidden">
        <Outlet />
      </main>

      <ClientNavBar />
    </div>
  );
}
