import { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Lock, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import { PasswordStrengthMeter } from '../components/PasswordStrengthMeter';

export function ResetPasswordPage() {
  const { uid, token } = useParams<{ uid: string; token: string }>();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || !confirmPassword) {
      setError('Por favor llena todos los campos.');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const apiHost = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:8000/api`;
      const response = await fetch(`${apiHost}/password-reset-confirm/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ uidb64: uid, token, new_password: password }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setSuccess(true);
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else {
        setError(data.error || 'Ocurrió un error al restablecer la contraseña.');
      }
    } catch {
      setError('Error de conexión al servidor.');
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
      <div className="z-10 w-full max-w-[500px] px-4 py-6 relative">
        <div className="auth-container w-full bg-surface/95 backdrop-blur-md shadow-2xl rounded-3xl overflow-hidden p-8 md:p-10 relative">
          
          <div className="mb-6 flex justify-center">
            <div className="bg-white rounded-full h-16 w-16 md:h-20 md:w-20 flex items-center justify-center shadow-lg overflow-hidden border-2 border-white">
              <img src="/sweet_logo.jpg" alt="Sweet & Tasty" className="w-full h-full object-cover scale-[1.8]" />
            </div>
          </div>

          {!success ? (
            <>
              <div className="mb-6 text-center">
                <h2 className="text-2xl font-bold mb-2 text-on-surface">Crear nueva contraseña</h2>
                <p className="text-sm text-on-surface-variant">Ingresa tu nueva contraseña para acceder a tu cuenta.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold mb-1 text-on-surface-variant">Nueva Contraseña</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant/50 transition-colors" />
                    <input 
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className={`w-full pl-9 pr-10 py-3 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all bg-gray-100 text-black ${error ? 'ring-2 ring-red-500' : ''}`}
                      placeholder="••••••••" 
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant/50 hover:text-primary transition-colors">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <PasswordStrengthMeter password={password} />
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1 text-on-surface-variant">Confirmar Contraseña</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant/50 transition-colors" />
                    <input 
                      type={showPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className={`w-full pl-9 pr-10 py-3 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all bg-gray-100 text-black ${error ? 'ring-2 ring-red-500' : ''}`}
                      placeholder="••••••••" 
                    />
                  </div>
                </div>
                
                {error && <p className="text-red-500 text-sm font-medium text-center">{error}</p>}
                
                <button 
                  type="submit" 
                  disabled={isLoading}
                  className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center disabled:opacity-70 mt-4 shadow-lg"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    'Guardar y continuar'
                  )}
                </button>
              </form>
            </>
          ) : (
            <div className="text-center py-6">
              <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2 text-on-surface">¡Contraseña actualizada!</h2>
              <p className="text-sm text-on-surface-variant mb-6">Tu contraseña ha sido restablecida exitosamente. Redirigiendo al inicio de sesión...</p>
              <Link to="/login" className="inline-block bg-primary hover:bg-primary/90 text-white font-bold py-3 px-6 rounded-lg transition-colors shadow-lg">
                Ir al login ahora
              </Link>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
