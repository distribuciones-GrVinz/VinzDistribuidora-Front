import { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, Eye, EyeOff, Mail, User as UserIcon, ShieldAlert } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { GoogleLogin } from '@react-oauth/google';
import { PasswordStrengthMeter } from '../components/PasswordStrengthMeter';

export function Login() {
  const [isRightPanelActive, setIsRightPanelActive] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Registration state
  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  
  const lastClicks = useRef<number[]>([]);
  const [isAdminMode, setIsAdminMode] = useState(false);

  const handleLogoClick = () => {
    const now = Date.now();
    // Mantener solo los clics de los últimos 2 segundos
    lastClicks.current = lastClicks.current.filter(time => now - time < 2000);
    lastClicks.current.push(now);
    
    if (lastClicks.current.length >= 3) {
      setIsAdminMode(curr => !curr);
      lastClicks.current = []; // Reiniciar
    }
  };
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleGoogleSuccess = async (credentialResponse: any) => {
    setIsLoading(true);
    setError(null);
    try {
      const apiHost = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:8000/api`;
      const response = await fetch(`${apiHost}/google-login/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ credential: credentialResponse.credential }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        login(data.access);
        try {
          const payload = JSON.parse(atob(data.access.split('.')[1]));
          if (payload.rol === 'Administrador') {
            navigate('/admin');
          } else if (!payload.perfil_completado) {
            navigate('/completar-perfil');
          } else {
            navigate('/catalogo');
          }
        } catch {
          navigate('/completar-perfil');
        }
      } else {
        setError(data.detail || 'Error al iniciar sesión con Google');
      }
    } catch {
      setError('Error de conexión al servidor');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Por favor, llena todos los campos.');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const apiHost = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:8000/api`;
      const response = await fetch(`${apiHost}/login/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: email, password }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        login(data.access);
        // Decodificar el token temporalmente para saber a dónde redirigir
        try {
          const payload = JSON.parse(atob(data.access.split('.')[1]));
          
          // Validación estricta de portal
          if (isAdminMode && payload.rol !== 'Administrador') {
            setError('Acceso denegado: Usa el portal de clientes.');
            return;
          }
          if (!isAdminMode && payload.rol === 'Administrador') {
            setError('Acceso denegado: Usa el portal de administrador.');
            return;
          }

          if (payload.rol === 'Administrador') {
            navigate('/admin'); // o '/dashboard' cuando lo creemos
          } else if (!payload.perfil_completado) {
            navigate('/completar-perfil');
          } else {
            navigate('/catalogo');
          }
        } catch {
          navigate('/completar-perfil'); // fallback
        }
      } else {
        setError(data.detail || 'Credenciales incorrectas');
      }
    } catch {
      setError('Error de conexión al servidor');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!registerName || !registerEmail || !registerPassword) {
      setError('Por favor, llena todos los campos para registrarte.');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Use dynamic host for local network access
      const apiHost = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:8000/api`;
      const response = await fetch(`${apiHost}/registro/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email: registerEmail, 
          password: registerPassword,
          nombre: registerName
        }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        // Switch back to login panel and pre-fill email
        setEmail(registerEmail);
        setPassword(registerPassword);
        setIsRightPanelActive(false);
        // Clear registration fields
        setRegisterName('');
        setRegisterEmail('');
        setRegisterPassword('');
        // Optional: you could auto-login here by calling handleLogin logic
      } else {
        setError(data.detail || 'Error al registrar la cuenta');
      }
    } catch {
      setError('Error de conexión al servidor');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center font-sans relative overflow-hidden">

      
      {/* Background Image Container */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/login-bg.jpg')" }}
      >
        <div className="absolute inset-0 bg-black/40 backdrop-blur-[3px]"></div>
      </div>

      {/* Container */}
      <div className="z-10 w-full max-w-[1000px] px-4 sm:px-6 md:px-10 py-6 md:py-4 h-[95vh] md:h-[90vh] min-h-[700px] max-h-[1000px] md:min-h-[650px] md:max-h-[850px] relative">
        <div className={`auth-container w-full h-full shadow-2xl rounded-3xl overflow-hidden relative transition-colors duration-500 ${isAdminMode ? 'bg-black/90 backdrop-blur-md' : 'bg-surface/95 backdrop-blur-md'}`}>
          
          {/* Form Panel (White/Black) */}
          <div className={`absolute left-0 w-full md:w-1/2 h-[80%] md:h-full z-10 transition-all duration-500 ease-in-out ${isAdminMode ? 'bg-black text-white' : 'bg-white'} 
            ${isRightPanelActive ? 'top-0 md:top-0 md:translate-x-full' : 'top-[20%] md:top-0 md:translate-x-0'}`}>
            <div className="p-8 md:p-12 h-full flex flex-col justify-center relative">

              {/* Login Form */}
              <div className={`transition-opacity duration-400 absolute inset-0 p-6 md:p-8 flex flex-col justify-center ${isRightPanelActive ? 'opacity-0 pointer-events-none' : 'opacity-100 pointer-events-auto'}`}>
                <div className="my-auto w-full max-w-sm mx-auto">
                  <div className="mb-4 flex justify-center cursor-pointer select-none" onClick={handleLogoClick}>
                    {isAdminMode ? (
                      <div className="bg-white rounded-full h-16 w-16 md:h-20 md:w-20 flex items-center justify-center shadow-lg overflow-hidden border-2 border-white">
                        <img src="/sweet_logo.jpg" alt="Sweet & Tasty" className="w-full h-full object-cover scale-[1.35]" />
                      </div>
                    ) : (
                      <img src="/sweet_logo.jpg" alt="Sweet & Tasty" className="h-16 md:h-20 w-auto object-contain mix-blend-multiply" />
                    )}
                  </div>
                <div className="mb-6 text-center">
                  <p className={`text-xs md:text-sm uppercase tracking-wider mb-1 font-bold flex items-center justify-center ${isAdminMode ? 'text-red-500' : 'text-primary'}`}>
                    {isAdminMode && <ShieldAlert className="w-4 h-4 mr-2" />}
                    {isAdminMode ? 'Acceso Restringido' : 'Bienvenido de nuevo'}
                  </p>
                  <h2 className={`text-2xl md:text-3xl font-bold mb-1 ${isAdminMode ? 'text-white' : 'text-on-surface'}`}>
                    {isAdminMode ? 'Portal Admin' : 'Inicia sesión'}
                  </h2>
                </div>
                
                <form onSubmit={handleLogin} className="space-y-3 flex-grow flex flex-col justify-center">
                  <div>
                    <label className={`block text-xs font-semibold mb-1 ${isAdminMode ? 'text-gray-300' : 'text-on-surface-variant'}`}>Correo electrónico</label>
                    <div className="relative">
                      <Mail className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${isAdminMode ? 'text-gray-400' : 'text-on-surface-variant/50'}`} />
                      <input 
                        type="email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={`w-full pl-9 pr-4 py-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 transition-all ${isAdminMode ? 'bg-zinc-900 border border-zinc-800 text-white placeholder-gray-500 focus:bg-black' : 'bg-gray-100 text-black focus:ring-primary'} ${error ? 'ring-2 ring-red-500' : ''}`}
                        placeholder="nombre@gmail.com" 
                      />
                    </div>
                  </div>
                  <div>
                    <label className={`block text-xs font-semibold mb-1 ${isAdminMode ? 'text-gray-300' : 'text-on-surface-variant'}`}>Contraseña</label>
                    <div className="relative">
                      <Lock className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${isAdminMode ? 'text-gray-400' : 'text-on-surface-variant/50'}`} />
                      <input 
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className={`w-full pl-9 pr-10 py-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 transition-all ${isAdminMode ? 'bg-zinc-900 border border-zinc-800 text-white placeholder-gray-500 focus:bg-black' : 'bg-gray-100 text-black focus:ring-primary'} ${error ? 'ring-2 ring-red-500' : ''}`}
                        placeholder="••••••••" 
                      />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant/50 hover:text-primary transition-colors">
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  
                  {error && <p className="text-red-500 text-sm font-medium">{error}</p>}
                  
                  <div className="flex items-center justify-between mt-1">
                    <label className={`flex items-center gap-2 cursor-pointer ${isAdminMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      <input type="checkbox" className="rounded text-primary focus:ring-primary h-3.5 w-3.5" />
                      <span className="text-xs">Recordarme</span>
                    </label>
                    {!isAdminMode && (
                      <Link to="/forgot-password" className="text-xs text-primary hover:underline font-semibold">
                        ¿Olvidaste tu contraseña?
                      </Link>
                    )}
                  </div>
                  
                  <button 
                    disabled={isLoading}
                    type="submit" 
                    className={`w-full font-bold py-2.5 rounded-full text-sm transition-all transform hover:scale-[1.02] mt-4 flex justify-center items-center ${isAdminMode ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-[#e3b54a] text-[#251a00] hover:bg-[#efc054]'}`}
                  >
                    {isLoading ? (
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    ) : 'Iniciar sesión'}
                  </button>

                  {!isAdminMode && (
                    <>
                      <div className="relative flex py-4 items-center">
                        <div className="flex-grow border-t border-gray-300"></div>
                        <span className="flex-shrink-0 mx-4 text-gray-500 text-xs">O continuar con</span>
                        <div className="flex-grow border-t border-gray-300"></div>
                      </div>
                      
                      <div className="flex justify-center">
                        <GoogleLogin
                          onSuccess={handleGoogleSuccess}
                          onError={() => {
                            setError('El inicio de sesión con Google falló.');
                          }}
                          useOneTap
                          shape="pill"
                          theme="outline"
                          width="100%"
                        />
                      </div>
                    </>
                  )}
                </form>
                </div>
              </div>

              {/* Sign Up Form */}
              <div className={`transition-opacity duration-400 absolute inset-0 p-6 md:p-8 flex flex-col justify-center ${isRightPanelActive ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
                <div className="my-auto w-full max-w-sm mx-auto">
                  <div className="mb-4 flex justify-center select-none">
                    <img src="/sweet_logo.jpg" alt="Sweet & Tasty" className="h-12 md:h-16 w-auto object-contain mix-blend-multiply" />
                  </div>
                  <div className="mb-5 text-center">
                    <p className="text-xs text-primary uppercase tracking-wider mb-1 font-bold">Únete a la familia</p>
                    <h2 className="text-2xl md:text-3xl font-bold text-on-surface mb-1 font-headline-xl">Crear una cuenta</h2>
                  </div>
                <form onSubmit={handleRegister} className="space-y-3 flex-grow flex flex-col justify-center">
                  <div>
                    <label className="block text-xs font-semibold text-on-surface-variant mb-1">Nombre completo</label>
                    <div className="relative">
                      <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/50 w-4 h-4" />
                      <input 
                        type="text" 
                        value={registerName}
                        onChange={(e) => setRegisterName(e.target.value)}
                        className={`w-full pl-9 pr-4 py-2.5 text-sm bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${error && isRightPanelActive ? 'ring-2 ring-red-500' : ''}`} 
                        placeholder="Juan Pérez" 
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-on-surface-variant mb-1">Correo electrónico</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/50 w-4 h-4" />
                      <input 
                        type="email" 
                        value={registerEmail}
                        onChange={(e) => setRegisterEmail(e.target.value)}
                        className={`w-full pl-9 pr-4 py-2.5 text-sm bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${error && isRightPanelActive ? 'ring-2 ring-red-500' : ''}`} 
                        placeholder="nombre@gmail.com" 
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-on-surface-variant mb-1">Contraseña</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/50 w-4 h-4" />
                      <input 
                        type={showRegisterPassword ? "text" : "password"} 
                        value={registerPassword}
                        onChange={(e) => setRegisterPassword(e.target.value)}
                        className={`w-full pl-9 pr-10 py-2.5 text-sm bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${error && isRightPanelActive ? 'ring-2 ring-red-500' : ''}`} 
                        placeholder="Crea una contraseña" 
                      />
                      <button type="button" onClick={() => setShowRegisterPassword(!showRegisterPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant/50 hover:text-primary transition-colors">
                        {showRegisterPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    <PasswordStrengthMeter password={registerPassword} />
                  </div>
                  {error && isRightPanelActive && <p className="text-red-500 text-sm font-medium">{error}</p>}

                  <button 
                    type="submit" 
                    disabled={isLoading}
                    className="w-full bg-[#e3b54a] text-[#251a00] text-sm font-bold py-2.5 rounded-full hover:bg-[#efc054] transition-all transform hover:scale-[1.02] mt-3 flex justify-center items-center"
                  >
                    {isLoading ? (
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    ) : 'Regístrate'}
                  </button>
                  
                  <div className="relative flex py-3 items-center">
                    <div className="flex-grow border-t border-gray-300"></div>
                    <span className="flex-shrink-0 mx-4 text-gray-500 text-xs">O continuar con</span>
                    <div className="flex-grow border-t border-gray-300"></div>
                  </div>
                  
                  <div className="flex justify-center">
                    <GoogleLogin
                      onSuccess={handleGoogleSuccess}
                      onError={() => {
                        setError('El registro con Google falló.');
                      }}
                      shape="pill"
                      theme="outline"
                      width="100%"
                      text="signup_with"
                    />
                  </div>
                </form>
                </div>
              </div>

            </div>
          </div>

          {/* Overlay Panel (Gold) */}
          <div className={`absolute left-0 md:left-1/2 w-full md:w-1/2 h-[20%] md:h-full z-20 transition-all duration-500 ease-in-out bg-[#e3b54a] overflow-hidden text-black
            ${isRightPanelActive ? 'top-[80%] md:top-0 md:-translate-x-full' : 'top-0 md:top-0 md:translate-x-0'}`}>
            
            <div className={`absolute inset-0 flex flex-col justify-center items-center text-center px-4 md:px-12 transition-all duration-600 
              ${isRightPanelActive ? '-translate-y-[20%] md:-translate-y-0 md:-translate-x-[20%] opacity-0 pointer-events-none' : 'translate-y-0 md:translate-x-0 opacity-100 pointer-events-auto'}`}>
              
              {isAdminMode ? (
                <>
                  <ShieldAlert className="w-20 h-20 mb-6 text-black/20" />
                  <h2 className="text-3xl md:text-5xl font-extrabold mb-2 md:mb-4">Solo Personal</h2>
                  <p className="text-sm md:text-lg mb-4 md:mb-8 opacity-90 hidden sm:block">Este portal es de uso exclusivo para el equipo de administración de VINZ.</p>
                </>
              ) : (
                <>
                  <h2 className="text-3xl md:text-5xl font-extrabold mb-2 md:mb-4 font-headline-xl">¿Eres nuevo?</h2>
                  <p className="text-sm md:text-lg mb-4 md:mb-8 opacity-90 hidden sm:block">Crea una cuenta para acceder a nuestro catálogo de delicias y realizar tus pedidos fácilmente.</p>
                  <button 
                    onClick={() => setIsRightPanelActive(true)}
                    className="border-2 border-black text-black hover:bg-black hover:text-white font-bold py-2 md:py-3 px-6 md:px-8 rounded-full transition-all text-sm md:text-base"
                  >
                    Crear cuenta
                  </button>
                </>
              )}
            </div>

            <div className={`absolute inset-0 flex flex-col justify-center items-center text-center px-4 md:px-12 transition-all duration-600 
              ${isRightPanelActive ? 'translate-y-0 md:translate-x-0 opacity-100 pointer-events-auto' : 'translate-y-[20%] md:-translate-y-0 md:translate-x-[20%] opacity-0 pointer-events-none'}`}>
              <h2 className="text-3xl md:text-5xl font-extrabold mb-2 md:mb-4 font-headline-xl">¡Bienvenido!</h2>
              <p className="text-sm md:text-lg mb-4 md:mb-8 opacity-90 hidden sm:block">Para realizar tus pedidos o ver el catálogo, por favor inicia sesión.</p>
              <button 
                onClick={() => setIsRightPanelActive(false)}
                className="border-2 border-black text-black hover:bg-black hover:text-white font-bold py-2 md:py-3 px-6 md:px-8 rounded-full transition-all text-sm md:text-base"
              >
                Iniciar sesión
              </button>
            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
}
