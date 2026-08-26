/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { jwtDecode } from 'jwt-decode';

interface User {
  email: string;
  rol: string;
  perfil_completado: boolean;
}

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

  useEffect(() => {
    if (token) {
      try {
        const decoded = jwtDecode<User & { exp?: number }>(token);
        // Verificar si el token ya expiró
        if (decoded.exp && decoded.exp * 1000 < Date.now()) {
          console.warn("Token expirado");
          logout();
          return;
        }
        setUser({
          email: decoded.email,
          rol: decoded.rol,
          perfil_completado: decoded.perfil_completado || localStorage.getItem('vinz_perfil_completado') === 'true'
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
          // Opcional: recargar la página o mostrar un mensaje
          window.location.reload();
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
      setUser({ ...user, perfil_completado: true });
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
