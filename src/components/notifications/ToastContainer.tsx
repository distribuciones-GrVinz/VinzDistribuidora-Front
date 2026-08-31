import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, Info, AlertTriangle, X } from 'lucide-react';
import { useNotification } from '../../context/NotificationContext';
import type { AppNotification } from '../../context/NotificationContext';

const ICONS = {
  success: <CheckCircle2 className="w-5 h-5 text-green-500" />,
  error: <XCircle className="w-5 h-5 text-red-500" />,
  info: <Info className="w-5 h-5 text-blue-500" />,
  warning: <AlertTriangle className="w-5 h-5 text-yellow-500" />
};

export function ToastContainer() {
  const { notifications } = useNotification();
  const [activeToasts, setActiveToasts] = useState<AppNotification[]>([]);

  // Cuando llega una notificación nueva, la agregamos a activeToasts
  // Solo consideramos las creadas muy recientemente (menos de 1 segundo de antigüedad al renderizar)
  // Para que no se llenen los toasts con historial al cargar
  useEffect(() => {
    if (notifications.length > 0) {
      const latest = notifications[0];
      const now = new Date().getTime();
      const notifTime = latest.timestamp.getTime();
      
      // Si la notificación acaba de llegar (hace menos de 1 segundo)
      if (now - notifTime < 1000) {
        setActiveToasts(prev => [latest, ...prev].slice(0, 5)); // Máximo 5 toasts visibles
      }
    }
  }, [notifications]);

  // Remover un toast individualmente (solo de la vista flotante)
  const removeToast = (id: string) => {
    setActiveToasts(prev => prev.filter(t => t.id !== id));
  };

  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none w-80">
      <AnimatePresence>
        {activeToasts.map((toast) => (
          <ToastItem 
            key={toast.id} 
            toast={toast} 
            onClose={() => removeToast(toast.id)} 
          />
        ))}
      </AnimatePresence>
    </div>
  );
}

function ToastItem({ toast, onClose }: { toast: AppNotification, onClose: () => void }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000); // 5 segundos de duración
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: 100, scale: 0.9 }}
      transition={{ duration: 0.2 }}
      className="pointer-events-auto bg-white dark:bg-[#1a1a1a] border border-outline-variant/30 dark:border-white/10 shadow-2xl rounded-2xl p-4 flex items-start gap-3"
    >
      <div className="flex-shrink-0 mt-0.5">
        {ICONS[toast.type]}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-on-surface dark:text-white capitalize">
          {toast.type === 'success' ? 'Éxito' : toast.type === 'error' ? 'Error' : toast.type}
        </p>
        <p className="text-xs text-on-surface-variant dark:text-white/60 mt-0.5 leading-snug">
          {toast.message}
        </p>
      </div>
      <button 
        onClick={onClose}
        className="flex-shrink-0 text-on-surface-variant/50 hover:text-on-surface dark:text-white/30 dark:hover:text-white transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  );
}
