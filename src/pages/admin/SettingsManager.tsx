import { useTheme } from '../../context/ThemeContext';
import { Moon, Sun, Monitor, Bell, Shield } from 'lucide-react';

export function SettingsManager() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="max-w-4xl mx-auto py-8 mb-20 transition-colors duration-300">
      <div className="mb-12 mt-8">
        <h2 className="text-sm tracking-[0.3em] text-tertiary dark:text-[#e3b54a] font-bold uppercase mb-2">Preferencias</h2>
        <h1 className="text-5xl md:text-7xl font-headline-xl text-primary dark:text-white">Configuración.</h1>
      </div>

      <div className="space-y-6">
        {/* Aspecto Visual */}
        <section className="bg-white dark:bg-[#0f0f0f] border border-outline-variant/50 dark:border-white/5 rounded-3xl p-6 md:p-10 shadow-lg dark:shadow-2xl transition-colors">
          <div className="flex items-center gap-3 mb-8">
            <div className="bg-surface dark:bg-[#1a1a1a] p-3 rounded-xl border border-outline-variant/50 dark:border-white/5 shadow-sm dark:shadow-none">
              <Monitor className="w-6 h-6 text-tertiary dark:text-[#e3b54a]" />
            </div>
            <h2 className="text-2xl font-headline-lg text-on-surface dark:text-white">Apariencia</h2>
          </div>

          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 p-6 bg-surface dark:bg-[#1a1a1a] rounded-2xl border border-outline-variant/50 dark:border-white/5 shadow-sm dark:shadow-none transition-colors">
            <div>
              <h3 className="font-bold text-on-surface dark:text-white text-lg">Modo de Visualización</h3>
              <p className="text-on-surface-variant/70 dark:text-white/40 text-sm mt-1 max-w-sm">Cambia libremente entre la versión iluminada (estilo crema boutique) y la oscura (Backstage nocturno) del panel.</p>
            </div>
            
            <button 
              onClick={toggleTheme}
              className={`relative flex items-center justify-center gap-2 px-8 py-4 rounded-full font-bold transition-all shadow-md w-full md:w-auto ${
                theme === 'light' 
                  ? 'bg-primary-container text-white hover:bg-tertiary hover:-translate-y-1' 
                  : 'bg-[#e3b54a] text-black hover:bg-white hover:-translate-y-1 dark:shadow-[0_0_20px_rgba(227,181,74,0.2)]'
              }`}
            >
              {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
              <span>{theme === 'light' ? 'Cambiar a Modo Oscuro' : 'Cambiar a Modo Claro'}</span>
            </button>
          </div>
        </section>

        {/* Future Modules Placeholders */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <section className="bg-white dark:bg-[#0f0f0f] border border-outline-variant/30 dark:border-white/5 rounded-3xl p-6 md:p-8 shadow-sm opacity-60 grayscale cursor-not-allowed transition-colors">
            <div className="flex items-center gap-3 mb-4">
              <Bell className="w-6 h-6 text-on-surface-variant/50 dark:text-white/50" />
              <h2 className="text-xl font-headline-lg text-on-surface dark:text-white">Notificaciones</h2>
            </div>
            <p className="text-on-surface-variant/70 dark:text-white/40 text-sm">Configura alertas por correo y notificaciones push. (Próximamente)</p>
          </section>

          <section className="bg-white dark:bg-[#0f0f0f] border border-outline-variant/30 dark:border-white/5 rounded-3xl p-6 md:p-8 shadow-sm opacity-60 grayscale cursor-not-allowed transition-colors">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="w-6 h-6 text-on-surface-variant/50 dark:text-white/50" />
              <h2 className="text-xl font-headline-lg text-on-surface dark:text-white">Seguridad</h2>
            </div>
            <p className="text-on-surface-variant/70 dark:text-white/40 text-sm">Cambio de contraseña, 2FA y roles de administrador. (Próximamente)</p>
          </section>
        </div>
      </div>
    </div>
  );
}
