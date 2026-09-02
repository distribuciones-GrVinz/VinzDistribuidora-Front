import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { ReactNode } from 'react';
import { useAuth } from './AuthContext';

export type NotificationType = 'success' | 'error' | 'info' | 'warning';

export interface AppNotification {
  id: string;
  type: NotificationType;
  message: string;
  timestamp: Date;
  read: boolean;
}

interface NotificationContextProps {
  notifications: AppNotification[];
  unreadCount: number;
  showNotification: (type: NotificationType, message: string) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearHistory: () => void;
  removeNotification: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextProps | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const { token, isAuthenticated } = useAuth();

  const fetchNotifications = useCallback(async () => {
    if (!token) return;
    try {
      const apiHost = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:8000/api`;
      const response = await fetch(`${apiHost}/notificaciones/`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        const mappedNotifs: AppNotification[] = data.map((n: any) => ({
          id: n.id,
          type: n.tipo,
          message: n.mensaje,
          timestamp: new Date(n.created_at),
          read: n.leida
        }));
        setNotifications(mappedNotifs);
      }
    } catch (error) {
      console.error("Error fetching notifications", error);
    }
  }, [token]);

  // Polling cada 60 segundos y fetch inicial
  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 60000);
      return () => clearInterval(interval);
    } else {
      setNotifications([]);
    }
  }, [isAuthenticated, fetchNotifications]);

  // Esta función crea notificaciones locales pero ya no las guardamos en memoria, 
  // solo sirven temporalmente si la app quiere hacer "toasts". 
  // Podríamos enviarlas al backend si quisiéramos persistirlas.
  const showNotification = useCallback((type: NotificationType, message: string) => {
    const newNotification: AppNotification = {
      id: Date.now().toString() + Math.random().toString(36).substring(7),
      type,
      message,
      timestamp: new Date(),
      read: false,
    };
    setNotifications((prev) => [newNotification, ...prev]);
  }, []);

  const markAsRead = useCallback(async (id: string) => {
    // Update local immediately for responsive UI
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    
    // Call backend
    if (!token) return;
    try {
      const apiHost = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:8000/api`;
      await fetch(`${apiHost}/notificaciones/${id}/marcar_leida/`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
    } catch (error) {
      console.error("Error marking as read", error);
    }
  }, [token]);

  const markAllAsRead = useCallback(async () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    if (!token) return;
    try {
      const apiHost = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:8000/api`;
      await fetch(`${apiHost}/notificaciones/marcar_todas_leidas/`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
    } catch (error) {
      console.error("Error marking all as read", error);
    }
  }, [token]);

  const clearHistory = useCallback(async () => {
    setNotifications([]);
    if (!token) return;
    try {
      const apiHost = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:8000/api`;
      await fetch(`${apiHost}/notificaciones/limpiar_historial/`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
    } catch (error) {
      console.error("Error clearing history", error);
    }
  }, [token]);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <NotificationContext.Provider value={{ 
      notifications, 
      unreadCount, 
      showNotification, 
      markAsRead, 
      markAllAsRead, 
      clearHistory, 
      removeNotification 
    }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
}
