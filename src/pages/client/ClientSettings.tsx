import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { User, Building2, Store, FileText, MapPin, Save, Loader2, Phone, Moon, Sun, Monitor, LogOut } from 'lucide-react';

interface ClienteProfile {
  id: string;
  nombre_comercial: string;
  razon_social: string;
  identificacion_fiscal: string;
  direccion_entrega: string;
  usuario_detalle: {
    first_name: string;
    last_name: string;
    telefono: string;
    email: string;
  };
}

export function ClientSettings() {
  const { token, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [profile, setProfile] = useState<ClienteProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    telefono: '',
    nombre_comercial: '',
    razon_social: '',
    identificacion_fiscal: '',
    direccion_entrega: ''
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL || `http://${window.location.hostname}:8000/api`}/clientes/`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          const items = data.results || data;
          if (items.length > 0) {
            const client = items[0];
            setProfile(client);
            setFormData({
              first_name: client.usuario_detalle.first_name || '',
              last_name: client.usuario_detalle.last_name || '',
              telefono: client.usuario_detalle.telefono || '',
              nombre_comercial: client.nombre_comercial || '',
              razon_social: client.razon_social || '',
              identificacion_fiscal: client.identificacion_fiscal || '',
              direccion_entrega: client.direccion_entrega || ''
            });
          }
        }
      } catch (error) {
        console.error("Error fetching profile", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [token]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Validación estricta en tiempo real: Solo letras para nombres
    if (name === 'first_name' || name === 'last_name' || name === 'razon_social' || name === 'nombre_comercial') {
      if (/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/.test(value)) {
        return; 
      }
    }
    
    // Validación estricta en tiempo real: Solo números para teléfonos y RTN
    if (name === 'telefono' || name === 'identificacion_fiscal') {
      // Permitimos solo números (y guiones porque a veces la gente los pone en el RTN)
      if (/[^0-9-]/.test(value)) {
        return;
      }
    }

    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setSaving(true);
    setMessage(null);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || `http://${window.location.hostname}:8000/api`}/clientes/update_profile/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      
      if (response.ok) {
        setMessage({ type: 'success', text: 'Perfil actualizado exitosamente' });
      } else {
        const err = await response.json();
        setMessage({ type: 'error', text: err.detail || 'Error al actualizar el perfil' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Error de conexión con el servidor' });
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(null), 5000);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <Loader2 className="w-10 h-10 animate-spin text-tertiary" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto pt-2 pb-8 md:pt-4 md:pb-8 mb-20 px-4 md:px-8 transition-colors duration-300">
      <div className="mb-12 mt-8">
        <h2 className="text-sm tracking-[0.3em] text-tertiary dark:text-[#e3b54a] font-bold uppercase mb-2">Preferencias y Perfil</h2>
        <h1 className="text-5xl md:text-7xl font-headline-xl text-primary dark:text-white">Configuración.</h1>
      </div>

      {message && (
        <div className={`mb-6 p-4 rounded-xl flex items-center justify-center transition-all shadow-md ${
          message.type === 'success' ? 'bg-green-500/10 text-green-700 dark:text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-700 dark:text-red-400 border border-red-500/20'
        }`}>
          {message.text}
        </div>
      )}

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
              <p className="text-on-surface-variant/70 dark:text-white/40 text-sm mt-1 max-w-sm">Cambia libremente entre la versión iluminada (estilo crema boutique) y la oscura (Backstage nocturno) del catálogo.</p>
            </div>
            
            <button 
              type="button"
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

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Información Personal */}
          <section className="bg-white dark:bg-[#0f0f0f] border border-outline-variant/50 dark:border-white/5 rounded-3xl p-6 md:p-10 shadow-lg dark:shadow-2xl transition-colors">
            <div className="flex items-center gap-3 mb-8">
              <div className="bg-surface dark:bg-[#1a1a1a] p-3 rounded-xl border border-outline-variant/50 dark:border-white/5 shadow-sm dark:shadow-none">
                <User className="w-6 h-6 text-tertiary dark:text-[#e3b54a]" />
              </div>
              <h2 className="text-2xl font-headline-lg text-on-surface dark:text-white">Información del Titular</h2>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-on-surface-variant dark:text-white/60 uppercase tracking-wider mb-2">Nombre</label>
                <input 
                  type="text" name="first_name" value={formData.first_name} onChange={handleChange}
                  className="w-full bg-surface dark:bg-[#1a1a1a] border border-outline-variant/50 dark:border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-tertiary/50 dark:text-white transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-on-surface-variant dark:text-white/60 uppercase tracking-wider mb-2">Apellido</label>
                <input 
                  type="text" name="last_name" value={formData.last_name} onChange={handleChange}
                  className="w-full bg-surface dark:bg-[#1a1a1a] border border-outline-variant/50 dark:border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-tertiary/50 dark:text-white transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-on-surface-variant dark:text-white/60 uppercase tracking-wider mb-2">Teléfono</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant/50 dark:text-white/40" />
                  <input 
                    type="text" name="telefono" value={formData.telefono} onChange={handleChange}
                    className="w-full bg-surface dark:bg-[#1a1a1a] border border-outline-variant/50 dark:border-white/10 rounded-xl pl-12 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-tertiary/50 dark:text-white transition-colors"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-on-surface-variant dark:text-white/60 uppercase tracking-wider mb-2">Correo Electrónico</label>
                <input 
                  type="text" disabled value={profile?.usuario_detalle?.email || ''}
                  className="w-full bg-surface-variant/50 dark:bg-white/5 border border-outline-variant/30 dark:border-white/10 rounded-xl px-4 py-3 text-on-surface-variant dark:text-white/50 opacity-70 cursor-not-allowed transition-colors"
                  title="El correo no se puede cambiar"
                />
              </div>
            </div>
          </section>

          {/* Información de la Empresa */}
          <section className="bg-white dark:bg-[#0f0f0f] border border-outline-variant/50 dark:border-white/5 rounded-3xl p-6 md:p-10 shadow-lg dark:shadow-2xl transition-colors">
            <div className="flex items-center gap-3 mb-8">
              <div className="bg-surface dark:bg-[#1a1a1a] p-3 rounded-xl border border-outline-variant/50 dark:border-white/5 shadow-sm dark:shadow-none">
                <Building2 className="w-6 h-6 text-primary-container dark:text-[#e3b54a]" />
              </div>
              <h2 className="text-2xl font-headline-lg text-on-surface dark:text-white">Datos de la Empresa</h2>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-on-surface-variant dark:text-white/60 uppercase tracking-wider mb-2">Nombre Comercial</label>
                <div className="relative">
                  <Store className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant/50 dark:text-white/40" />
                  <input 
                    type="text" name="nombre_comercial" value={formData.nombre_comercial} onChange={handleChange} required
                    className="w-full bg-surface dark:bg-[#1a1a1a] border border-outline-variant/50 dark:border-white/10 rounded-xl pl-12 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-container/50 dark:text-white transition-colors"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-on-surface-variant dark:text-white/60 uppercase tracking-wider mb-2">Razón Social</label>
                <div className="relative">
                  <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant/50 dark:text-white/40" />
                  <input 
                    type="text" name="razon_social" value={formData.razon_social} onChange={handleChange}
                    className="w-full bg-surface dark:bg-[#1a1a1a] border border-outline-variant/50 dark:border-white/10 rounded-xl pl-12 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-container/50 dark:text-white transition-colors"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-on-surface-variant dark:text-white/60 uppercase tracking-wider mb-2">RTN / NIT</label>
                <div className="relative">
                  <FileText className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant/50 dark:text-white/40" />
                  <input 
                    type="text" name="identificacion_fiscal" value={formData.identificacion_fiscal} onChange={handleChange}
                    className="w-full bg-surface dark:bg-[#1a1a1a] border border-outline-variant/50 dark:border-white/10 rounded-xl pl-12 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-container/50 dark:text-white transition-colors"
                  />
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-on-surface-variant dark:text-white/60 uppercase tracking-wider mb-2">Dirección de Entrega</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-4 w-4 h-4 text-on-surface-variant/50 dark:text-white/40" />
                  <textarea 
                    name="direccion_entrega" value={formData.direccion_entrega} onChange={handleChange} rows={3} required
                    className="w-full bg-surface dark:bg-[#1a1a1a] border border-outline-variant/50 dark:border-white/10 rounded-xl pl-12 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-container/50 resize-none dark:text-white transition-colors"
                  />
                </div>
              </div>
            </div>
            
            <div className="mt-8 flex justify-end">
              <button 
                type="submit" 
                disabled={saving}
                className="bg-black dark:bg-[#e3b54a] text-white dark:text-black font-bold py-3 px-8 rounded-full flex items-center gap-2 hover:scale-105 transition-transform shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                {saving ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </div>
          </section>
        </form>

        {/* Sección de Cerrar Sesión */}
        <section className="mt-8 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-3xl p-6 md:p-10 shadow-sm transition-colors">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h2 className="text-xl font-bold text-red-600 dark:text-red-400 mb-2">Cerrar Sesión</h2>
              <p className="text-sm text-red-500/80 dark:text-red-400/70">Si cierras sesión tendrás que volver a ingresar tus credenciales para acceder a la plataforma.</p>
            </div>
            <button 
              onClick={logout}
              className="w-full md:w-auto bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-8 rounded-full flex items-center justify-center gap-2 transition-transform hover:scale-105 shadow-md"
            >
              <LogOut className="w-5 h-5" />
              Salir de la Cuenta
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
