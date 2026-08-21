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

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.nombre_comercial.trim()) newErrors.nombre_comercial = 'El Nombre Comercial es requerido';
    if (!formData.direccion_entrega.trim()) newErrors.direccion_entrega = 'La Dirección de Entrega es requerida';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Limpiar error en tiempo real
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    
    setIsLoading(true);
    setServerError(null);
    
    try {
      const response = await fetch('http://localhost:8000/api/clientes/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData),
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

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl overflow-hidden">
        
        {/* Header */}
        <div className="bg-[#e3b54a] p-8 text-center text-black">
          <p className="text-sm font-bold uppercase tracking-widest opacity-80 mb-2">Paso final: Configuración de Empresa</p>
          <h2 className="text-3xl font-extrabold">¡Bienvenido a VINZ!</h2>
          <p className="mt-2 text-black/80 font-medium">Para habilitar tu catálogo de precios y programar tus entregas, necesitamos los datos operativos de tu empresa.</p>
        </div>

        {/* Form */}
        <div className="p-8 md:p-12">
          {serverError && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Razón Social <span className="text-gray-400 font-normal">(Opcional para individuos)</span></label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input 
                  type="text" 
                  name="razon_social"
                  disabled={isLoading}
                  value={formData.razon_social}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-4 py-3 bg-gray-50 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#e3b54a] ${errors.razon_social ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-200'}`}
                  placeholder="Ej. Inversiones López S.A." 
                />
              </div>
              {errors.razon_social && <p className="text-red-500 text-xs mt-1">{errors.razon_social}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Nombre o Nombre Comercial</label>
              <div className="relative">
                <Store className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input 
                  type="text" 
                  name="nombre_comercial"
                  disabled={isLoading}
                  value={formData.nombre_comercial}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-4 py-3 bg-gray-50 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#e3b54a] ${errors.nombre_comercial ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-200'}`}
                  placeholder="Ej. Distribuidora El Sol" 
                />
              </div>
              {errors.nombre_comercial && <p className="text-red-500 text-xs mt-1">{errors.nombre_comercial}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Identificación Fiscal (RTN/NIT) <span className="text-gray-400 font-normal">(Opcional)</span></label>
              <div className="relative">
                <FileText className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input 
                  type="text" 
                  name="identificacion_fiscal"
                  disabled={isLoading}
                  value={formData.identificacion_fiscal}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-4 py-3 bg-gray-50 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#e3b54a] ${errors.identificacion_fiscal ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-200'}`}
                  placeholder="12345678901234" 
                />
              </div>
              {errors.identificacion_fiscal && <p className="text-red-500 text-xs mt-1">{errors.identificacion_fiscal}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Dirección de Entrega</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-4 text-gray-400 w-5 h-5" />
                <textarea 
                  name="direccion_entrega"
                  disabled={isLoading}
                  value={formData.direccion_entrega}
                  onChange={handleChange}
                  rows={3}
                  className={`w-full pl-10 pr-4 py-3 bg-gray-50 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#e3b54a] resize-none ${errors.direccion_entrega ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-200'}`}
                  placeholder="Especifica calle, número, referencias para el camión repartidor..." 
                />
              </div>
              {errors.direccion_entrega && <p className="text-red-500 text-xs mt-1">{errors.direccion_entrega}</p>}
            </div>

            <button 
              disabled={isLoading}
              type="submit" 
              className="w-full bg-black text-white font-bold py-4 rounded-xl hover:bg-gray-800 transition-all transform hover:scale-[1.01] mt-8 flex justify-center items-center shadow-lg"
            >
              {isLoading ? (
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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
