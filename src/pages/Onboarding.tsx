import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Store, FileText, MapPin } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function Onboarding() {
  const { token, completeProfile } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    razon_social: '',
    nombre_comercial: '',
    identificacion_fiscal: '',
    direccion_entrega: ''
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const formatIdentificacion = (val: string) => {
    const digits = val.replace(/\D/g, '');
    let formatted = '';
    
    if (digits.length > 0) {
      formatted += digits.substring(0, 4);
    }
    if (digits.length > 4) {
      formatted += '-' + digits.substring(4, 8);
    }
    if (digits.length > 8) {
      formatted += '-' + digits.substring(8, 14);
    }
    return formatted;
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.nombre_comercial.trim()) newErrors.nombre_comercial = 'El Nombre Comercial es requerido';
    if (!formData.direccion_entrega.trim()) newErrors.direccion_entrega = 'La Dirección de Entrega es requerida';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    let processedValue = value;
    
    if (name === 'identificacion_fiscal') {
      processedValue = formatIdentificacion(value);
    }

    setFormData({ ...formData, [name]: processedValue });
    
    // Limpiar error en tiempo real
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    
    setIsLoading(true);
    setServerError(null);
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || `http://${window.location.hostname}:8000/api`}/clientes/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          // Guardar sin guiones para la base de datos si se desea, o con guiones (se deja tal cual)
        }),
      });
      
      if (response.status === 201) {
        completeProfile();
        navigate('/catalogo');
      } else {
        const data = await response.json();
        setServerError(data.detail || 'Error al guardar los datos de la empresa');
      }
    } catch {
      setServerError('Error de conexión al servidor');
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid = formData.nombre_comercial.trim() !== '' && formData.direccion_entrega.trim() !== '';

  return (
    <div className="min-h-screen bg-neutral-100 flex items-center justify-center p-4">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100 flex flex-col">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-[#e3b54a] to-[#d4a038] p-4 md:p-5 text-center text-black relative flex-shrink-0">
          <div className="absolute inset-0 bg-white/10 mix-blend-overlay"></div>
          <img src="/sweet_logo.jpg" alt="Vinz Logo" className="h-10 md:h-14 w-auto object-cover scale-[1.3] mix-blend-multiply mx-auto mb-1.5 relative z-10 rounded-full" />
          <h2 className="text-xl md:text-2xl font-extrabold relative z-10 tracking-tight">¡Bienvenido a VINZ!</h2>
          <p className="mt-1 text-black/80 font-medium relative z-10 text-xs md:text-sm max-w-sm mx-auto leading-snug">
            Paso Final: Configuración de Perfil. Necesitamos estos datos para habilitar tus pedidos y entregas.
          </p>
        </div>

        {/* Form */}
        <div className="p-5 md:p-6 bg-white flex-grow">
          {serverError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-100 text-red-700 rounded-lg flex items-center text-xs font-medium">
              <svg className="w-4 h-4 mr-2 flex-shrink-0 text-red-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
              <span>{serverError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Razón Social / Empresa <span className="text-gray-400 font-normal ml-1">(Opcional, si aplica)</span></label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input 
                  type="text" 
                  name="razon_social"
                  disabled={isLoading}
                  value={formData.razon_social}
                  onChange={handleChange}
                  className={`w-full pl-9 pr-3 py-2 text-sm bg-white border rounded-lg focus:outline-none focus:border-[#e3b54a] focus:ring-2 focus:ring-[#e3b54a]/20 transition-all ${errors.razon_social ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20' : 'border-gray-200'}`}
                  placeholder="Ej. Inversiones López S.A." 
                />
              </div>
              {errors.razon_social && <p className="text-red-500 text-[10px] mt-1 font-medium">{errors.razon_social}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Nombre Completo o Comercial <span className="text-red-500">*</span></label>
              <div className="relative">
                <Store className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input 
                  type="text" 
                  name="nombre_comercial"
                  disabled={isLoading}
                  value={formData.nombre_comercial}
                  onChange={handleChange}
                  className={`w-full pl-9 pr-3 py-2 text-sm bg-white border rounded-lg focus:outline-none focus:border-[#e3b54a] focus:ring-2 focus:ring-[#e3b54a]/20 transition-all ${errors.nombre_comercial ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20' : 'border-gray-200'}`}
                  placeholder="Ej. Distribuidora El Sol" 
                />
              </div>
              {errors.nombre_comercial && <p className="text-red-500 text-[10px] mt-1 font-medium">{errors.nombre_comercial}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Identificación Fiscal (RTN/NIT) <span className="text-gray-400 font-normal ml-1">(Opcional)</span></label>
              <div className="relative">
                <FileText className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input 
                  type="text" 
                  name="identificacion_fiscal"
                  disabled={isLoading}
                  value={formData.identificacion_fiscal}
                  onChange={handleChange}
                  maxLength={16}
                  className={`w-full pl-9 pr-3 py-2 text-sm bg-white border rounded-lg focus:outline-none focus:border-[#e3b54a] focus:ring-2 focus:ring-[#e3b54a]/20 transition-all ${errors.identificacion_fiscal ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20' : 'border-gray-200'}`}
                  placeholder="0801-1999-049390" 
                />
              </div>
              {errors.identificacion_fiscal && <p className="text-red-500 text-[10px] mt-1 font-medium">{errors.identificacion_fiscal}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Dirección de Entrega <span className="text-red-500">*</span></label>
              <div className="relative">
                <MapPin className="absolute left-3 top-2.5 text-gray-400 w-4 h-4" />
                <textarea 
                  name="direccion_entrega"
                  disabled={isLoading}
                  value={formData.direccion_entrega}
                  onChange={handleChange}
                  rows={2}
                  className={`w-full pl-9 pr-3 py-2 text-sm bg-white border rounded-lg focus:outline-none focus:border-[#e3b54a] focus:ring-2 focus:ring-[#e3b54a]/20 resize-none transition-all ${errors.direccion_entrega ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20' : 'border-gray-200'}`}
                  placeholder="Especifica calle, número, referencias para el camión repartidor..." 
                />
              </div>
              {errors.direccion_entrega && <p className="text-red-500 text-[10px] mt-1 font-medium">{errors.direccion_entrega}</p>}
            </div>

            <button 
              disabled={isLoading || !isFormValid}
              type="submit" 
              className={`w-full font-bold py-3 text-sm rounded-lg transition-all mt-6 flex justify-center items-center shadow-md ${
                isLoading || !isFormValid 
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                  : 'bg-black text-white hover:bg-gray-800 hover:shadow-lg transform hover:scale-[1.01]'
              }`}
            >
              {isLoading ? (
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : 'Guardar y ver catálogo'}
            </button>
            
          </form>
        </div>
      </div>
    </div>
  );
}
