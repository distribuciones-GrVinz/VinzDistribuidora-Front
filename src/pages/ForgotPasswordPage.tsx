import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Por favor ingresa tu correo.');
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const apiHost = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:8000/api`;
      const response = await fetch(`${apiHost}/password-reset/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setSuccess(true);
      } else {
        setError(data.error || 'Ocurrió un error al enviar la solicitud.');
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
          
          <button onClick={() => navigate('/login')} className="absolute top-6 left-6 text-on-surface-variant/70 hover:text-primary transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="mb-6 flex justify-center">
            <div className="bg-white rounded-full h-16 w-16 md:h-20 md:w-20 flex items-center justify-center shadow-lg overflow-hidden border-2 border-white">
              <img src="/sweet_logo.jpg" alt="Sweet & Tasty" className="w-full h-full object-cover scale-[1.35]" />
            </div>
          </div>

          {!success ? (
            <>
              <div className="mb-6 text-center">
                <h2 className="text-2xl font-bold mb-2 text-on-surface">Recuperar contraseña</h2>
                <p className="text-sm text-on-surface-variant">Ingresa tu correo y te enviaremos un enlace para crear una nueva contraseña.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold mb-1 text-on-surface-variant">Correo electrónico</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant/50 transition-colors" />
                    <input 
                      type="email" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={`w-full pl-9 pr-4 py-3 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all bg-gray-100 text-black ${error ? 'ring-2 ring-red-500' : ''}`}
                      placeholder="nombre@gmail.com" 
                    />
                  </div>
                </div>
                
                {error && <p className="text-red-500 text-sm font-medium text-center">{error}</p>}
                
                <button 
                  type="submit" 
                  disabled={isLoading}
                  className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center disabled:opacity-70 mt-2 shadow-lg"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    'Enviar enlace'
                  )}
                </button>
              </form>
            </>
          ) : (
            <div className="text-center py-6">
              <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2 text-on-surface">¡Correo enviado!</h2>
              <p className="text-sm text-on-surface-variant mb-6">Si existe una cuenta asociada a <b>{email}</b>, recibirás un enlace para restablecer tu contraseña en los próximos minutos.</p>
              <Link to="/login" className="inline-block bg-primary hover:bg-primary/90 text-white font-bold py-3 px-6 rounded-lg transition-colors shadow-lg">
                Volver al inicio
              </Link>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
