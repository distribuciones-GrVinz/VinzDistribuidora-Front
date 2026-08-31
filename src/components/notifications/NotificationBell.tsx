import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, CheckCircle2, XCircle, Info, AlertTriangle, Check, Trash2 } from 'lucide-react';
import { useNotification } from '../../context/NotificationContext';

const ICONS = {
  success: <CheckCircle2 className="w-5 h-5 text-green-500" />,
  error: <XCircle className="w-5 h-5 text-red-500" />,
  info: <Info className="w-5 h-5 text-blue-500" />,
  warning: <AlertTriangle className="w-5 h-5 text-yellow-500" />
};

export function NotificationBell() {
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearHistory } = useNotification();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Cerrar al hacer clic afuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative z-[9900]" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2.5 rounded-full border border-[#3D2B1F]/30 hover:border-[#3D2B1F]/60 transition-all"
        style={{ background: 'rgba(61,43,31,0.1)' }}
      >
        <Bell className="w-5 h-5" strokeWidth={2.5} style={{ color: '#1C1008' }} />
        
        {unreadCount > 0 && (
          <div className="absolute top-0 right-0 bg-red-500 text-white text-[9px] font-bold h-4 min-w-[16px] flex items-center justify-center rounded-full px-1 shadow-sm shadow-red-500/50 border-2 border-white dark:border-[#1a1a1a]">
            {unreadCount > 99 ? '99+' : unreadCount}
          </div>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute top-[120%] right-0 w-80 md:w-96 bg-white dark:bg-[#111] border border-outline-variant/30 dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
          >
            <div className="p-4 border-b border-outline-variant/30 dark:border-white/10 flex items-center justify-between bg-surface dark:bg-[#151515]">
              <h3 className="font-bold text-on-surface dark:text-white">Notificaciones</h3>
              <div className="flex gap-2">
                {unreadCount > 0 && (
                  <button onClick={markAllAsRead} className="p-1.5 text-on-surface-variant/70 hover:bg-outline-variant/20 dark:hover:bg-white/10 rounded-lg transition-colors" title="Marcar todo como leído">
                    <Check className="w-4 h-4" />
                  </button>
                )}
                {notifications.length > 0 && (
                  <button onClick={clearHistory} className="p-1.5 text-on-surface-variant/70 hover:bg-red-500/10 hover:text-red-500 rounded-lg transition-colors" title="Limpiar historial">
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            <div className="max-h-[60vh] overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-on-surface-variant/50 dark:text-white/40 text-sm">
                  No hay notificaciones recientes.
                </div>
              ) : (
                <div className="flex flex-col">
                  {notifications.map((notif) => (
                    <div 
                      key={notif.id}
                      onClick={() => !notif.read && markAsRead(notif.id)}
                      className={`p-4 border-b border-outline-variant/10 dark:border-white/5 flex gap-3 cursor-default transition-colors ${
                        notif.read ? 'opacity-60 bg-transparent' : 'bg-primary/5 dark:bg-[#e3b54a]/10 cursor-pointer hover:bg-primary/10 dark:hover:bg-[#e3b54a]/20'
                      }`}
                    >
                      <div className="flex-shrink-0 mt-0.5">
                        {ICONS[notif.type]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm ${notif.read ? 'text-on-surface-variant dark:text-white/70' : 'font-bold text-on-surface dark:text-white'}`}>
                          {notif.message}
                        </p>
                        <p className="text-[10px] text-on-surface-variant/50 dark:text-white/40 mt-1 uppercase tracking-wider font-semibold">
                          {notif.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                      {!notif.read && (
                        <div className="w-2 h-2 rounded-full bg-primary dark:bg-[#e3b54a] mt-1.5 flex-shrink-0"></div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
