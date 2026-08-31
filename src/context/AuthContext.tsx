/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { jwtDecode } from 'jwt-decode';

interface User {
  email: string;
  rol: string;
  perfil_completado: boolean;
  cliente_estado?: string;
}

import { AlertTriangle } from 'lucide-react';

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string) => void;
  logout: () => void;
  completeProfile: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(localStorage.getItem('vinz_token'));
  const [user, setUser] = useState<User | null>(null);
  const [showInactivityModal, setShowInactivityModal] = useState(false);

  useEffect(() => {
    if (token) {
      try {
        const decoded = jwtDecode<User & { exp?: number, cliente_estado?: string }>(token);
        // Verificar si el token ya expiró
        if (decoded.exp && decoded.exp * 1000 < Date.now()) {
          console.warn("Token expirado");
          logout();
          return;
        }
        setUser({
          email: decoded.email,
          rol: decoded.rol,
          perfil_completado: decoded.perfil_completado || localStorage.getItem('vinz_perfil_completado') === 'true',
          cliente_estado: decoded.cliente_estado
        });
      } catch (error) {
        console.error("Token inválido", error);
        logout();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // Cierre de sesión automático por inactividad (15 minutos)
  useEffect(() => {
    let inactivityTimer: ReturnType<typeof setTimeout>;

    const resetTimer = () => {
      if (inactivityTimer) clearTimeout(inactivityTimer);
      if (token) {
        inactivityTimer = setTimeout(() => {
          console.warn("Cerrando sesión por inactividad (15 minutos)");
          logout();
          setShowInactivityModal(true);
        }, 15 * 60 * 1000); // 15 minutos
      }
    };

    const handleActivity = () => resetTimer();

    if (token) {
      resetTimer();
      window.addEventListener('mousemove', handleActivity);
      window.addEventListener('keydown', handleActivity);
      window.addEventListener('scroll', handleActivity);
      window.addEventListener('click', handleActivity);
    }

    return () => {
      if (inactivityTimer) clearTimeout(inactivityTimer);
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('keydown', handleActivity);
      window.removeEventListener('scroll', handleActivity);
      window.removeEventListener('click', handleActivity);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const login = (newToken: string) => {
    localStorage.setItem('vinz_token', newToken);
    setToken(newToken);
  };

  const logout = () => {
    localStorage.removeItem('vinz_token');
    localStorage.removeItem('vinz_perfil_completado');
    setToken(null);
    setUser(null);
  };

  const completeProfile = () => {
    if (user) {
      setUser({ ...user, perfil_completado: true, cliente_estado: 'Pendiente' });
      localStorage.setItem('vinz_perfil_completado', 'true');
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      token, 
      login, 
      logout, 
      completeProfile,
      isAuthenticated: !!token 
    }}>
      {children}
      
      {showInactivityModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-surface dark:bg-[#111] border border-outline-variant/30 dark:border-white/10 rounded-3xl p-8 max-w-md w-full text-center shadow-2xl">
            <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="w-10 h-10 text-red-500" />
            </div>
            <h2 className="text-2xl font-bold text-on-surface dark:text-white mb-4">Sesión Expirada</h2>
            <p className="text-on-surface-variant dark:text-white/60 mb-8">
              Tu sesión se ha cerrado automáticamente por inactividad de 15 minutos para proteger tu información.
            </p>
            <button
              onClick={() => {
                setShowInactivityModal(false);
                window.location.href = '/login';
              }}
              className="w-full bg-tertiary text-white dark:bg-[#e3b54a] dark:text-black py-4 rounded-xl font-bold text-lg hover:scale-[1.02] transition-transform"
            >
              Volver a Iniciar Sesión
            </button>
          </div>
        </div>
      )}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
