import { Mail, Phone, MoreVertical, RefreshCw } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getClientes, createClienteAdmin } from '../../services/adminService';

export function ClientManager() {
  const [clientes, setClientes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    telefono: '',
    nombre_comercial: '',
    razon_social: '',
    identificacion_fiscal: '',
    direccion_entrega: ''
  });

  useEffect(() => {
    cargarClientes();
  }, []);

  const cargarClientes = async () => {
    try {
      setLoading(true);
      const data = await getClientes();
      setClientes(data);
    } catch (error) {
      console.error('Error al cargar clientes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createClienteAdmin(formData);
      setIsModalOpen(false);
      setFormData({
        email: '', password: '', first_name: '', last_name: '', telefono: '',
        nombre_comercial: '', razon_social: '', identificacion_fiscal: '', direccion_entrega: ''
      });
      cargarClientes();
    } catch (error) {
      console.error('Error creando cliente:', error);
      alert('Error al registrar cliente');
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-8 mb-20 transition-colors duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16 mt-8">
        <div>
          <h2 className="text-sm tracking-[0.3em] text-tertiary dark:text-[#e3b54a] font-bold uppercase mb-2">Comunidad</h2>
          <h1 className="text-5xl md:text-7xl font-headline-xl text-primary dark:text-white">Clientes.</h1>
        </div>
      </div>

      <div className="bg-white/95 backdrop-blur-xl dark:bg-[#0f0f0f] border-2 border-outline-variant/60 dark:border-white/5 rounded-3xl shadow-xl dark:shadow-2xl overflow-hidden transition-all duration-300">
        
        {/* Toolbar */}
        <div className="p-6 md:p-8 border-b border-outline-variant/50 dark:border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full md:max-w-md">
            <input 
              type="text" 
              placeholder="Buscar por nombre o contacto..." 
              className="w-full bg-surface dark:bg-black border border-outline-variant/50 dark:border-white/10 rounded-full py-3 px-6 text-on-surface dark:text-white focus:outline-none focus:border-tertiary dark:focus:border-[#e3b54a] transition-colors"
            />
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <button className="flex-1 md:flex-none px-6 py-3 bg-surface dark:bg-[#1a1a1a] text-on-surface dark:text-white rounded-full text-sm font-bold border border-outline-variant/50 dark:border-white/10 hover:bg-outline-variant/30 dark:hover:bg-white/5 transition-colors">
              Exportar
            </button>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="flex-1 md:flex-none px-6 py-3 bg-primary-container dark:bg-[#e3b54a] text-white dark:text-black rounded-full text-sm font-bold shadow-md hover:-translate-y-0.5 transition-transform"
            >
              Nuevo Cliente
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface/50 dark:bg-[#151515] text-on-surface-variant/70 dark:text-white/40 text-[10px] uppercase tracking-widest">
                <th className="p-6 font-bold">Empresa</th>
                <th className="p-6 font-bold hidden md:table-cell">Contacto</th>
                <th className="p-6 font-bold">Estado</th>
                <th className="p-6 font-bold text-center">Compras</th>
                <th className="p-6 font-bold text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/30 dark:divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-on-surface-variant/50">Cargando clientes...</td>
                </tr>
              ) : clientes.map((cliente) => (
                <tr key={cliente.id} className="hover:bg-surface/80 dark:hover:bg-[#1a1a1a] transition-colors group">
                  <td className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-primary-container/10 dark:bg-white/5 flex items-center justify-center text-tertiary dark:text-[#e3b54a] font-headline-lg text-xl">
                        {cliente.nombre_comercial?.charAt(0) || 'C'}
                      </div>
                      <div>
                        <p className="font-bold text-on-surface dark:text-white text-lg group-hover:text-tertiary dark:group-hover:text-[#e3b54a] transition-colors">{cliente.nombre_comercial}</p>
                        <p className="text-sm text-on-surface-variant/70 dark:text-white/40">{cliente.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-6 hidden md:table-cell">
                    <p className="font-semibold text-on-surface dark:text-white mb-1">
                      {cliente.usuario_detalle?.first_name} {cliente.usuario_detalle?.last_name}
                    </p>
                    <div className="flex flex-col gap-1 text-xs text-on-surface-variant/70 dark:text-white/40">
                      <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {cliente.usuario_detalle?.email}</span>
                      <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {cliente.usuario_detalle?.telefono || 'N/A'}</span>
                    </div>
                  </td>
                  <td className="p-6">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase border ${
                      cliente.usuario_detalle?.is_active
                        ? 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20'
                        : 'bg-gray-100 text-gray-500 border-gray-200 dark:bg-white/5 dark:text-white/40 dark:border-white/10'
                    }`}>
                      {cliente.usuario_detalle?.is_active ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="p-6 text-center">
                    <span className="text-xl font-light text-on-surface dark:text-white">{/* Compras: Mock u obtener count */} -- </span>
                  </td>
                  <td className="p-6 text-right">
                    <button className="p-2 text-on-surface-variant/50 hover:text-tertiary dark:text-white/40 dark:hover:text-white transition-colors">
                      <MoreVertical className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Agregar Cliente */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-surface dark:bg-[#0f0f0f] w-full max-w-2xl rounded-3xl p-6 md:p-8 shadow-2xl border border-outline-variant/30 dark:border-white/10 relative max-h-[85vh] overflow-y-auto hide-scrollbar">
            <h2 className="text-xl md:text-2xl font-bold text-primary dark:text-white mb-4">Nuevo Cliente</h2>
            
            <form onSubmit={handleSubmit} className="space-y-3">
              
              <h3 className="text-xs tracking-widest text-tertiary dark:text-[#e3b54a] font-bold uppercase border-b border-outline-variant/30 dark:border-white/10 pb-1 mb-2">Datos del Negocio</h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-semibold mb-1 text-on-surface-variant dark:text-white/60">Nombre Comercial</label>
                  <input required type="text" value={formData.nombre_comercial} onChange={e => setFormData({...formData, nombre_comercial: e.target.value})} className="w-full bg-white dark:bg-black border border-outline-variant/50 dark:border-white/10 rounded-xl py-1.5 px-3 text-sm text-on-surface dark:text-white focus:outline-none focus:border-tertiary dark:focus:border-[#e3b54a]" />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold mb-1 text-on-surface-variant dark:text-white/60">Razón Social</label>
                  <input type="text" value={formData.razon_social} onChange={e => setFormData({...formData, razon_social: e.target.value})} className="w-full bg-white dark:bg-black border border-outline-variant/50 dark:border-white/10 rounded-xl py-1.5 px-3 text-sm text-on-surface dark:text-white focus:outline-none focus:border-tertiary dark:focus:border-[#e3b54a]" />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold mb-1 text-on-surface-variant dark:text-white/60">Identificación Fiscal</label>
                  <input type="text" value={formData.identificacion_fiscal} onChange={e => setFormData({...formData, identificacion_fiscal: e.target.value})} className="w-full bg-white dark:bg-black border border-outline-variant/50 dark:border-white/10 rounded-xl py-1.5 px-3 text-sm text-on-surface dark:text-white focus:outline-none focus:border-tertiary dark:focus:border-[#e3b54a]" />
                </div>
                <div className="col-span-2">
                  <label className="block text-[10px] font-semibold mb-1 text-on-surface-variant dark:text-white/60">Dirección de Entrega</label>
                  <input required type="text" value={formData.direccion_entrega} onChange={e => setFormData({...formData, direccion_entrega: e.target.value})} className="w-full bg-white dark:bg-black border border-outline-variant/50 dark:border-white/10 rounded-xl py-1.5 px-3 text-sm text-on-surface dark:text-white focus:outline-none focus:border-tertiary dark:focus:border-[#e3b54a]" />
                </div>
              </div>

              <h3 className="text-xs tracking-widest text-tertiary dark:text-[#e3b54a] font-bold uppercase border-b border-outline-variant/30 dark:border-white/10 pb-1 mt-4 mb-2">Usuario del Sistema</h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-semibold mb-1 text-on-surface-variant dark:text-white/60">Nombres</label>
                  <input required type="text" value={formData.first_name} onChange={e => setFormData({...formData, first_name: e.target.value})} className="w-full bg-white dark:bg-black border border-outline-variant/50 dark:border-white/10 rounded-xl py-1.5 px-3 text-sm text-on-surface dark:text-white focus:outline-none focus:border-tertiary dark:focus:border-[#e3b54a]" />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold mb-1 text-on-surface-variant dark:text-white/60">Apellidos</label>
                  <input required type="text" value={formData.last_name} onChange={e => setFormData({...formData, last_name: e.target.value})} className="w-full bg-white dark:bg-black border border-outline-variant/50 dark:border-white/10 rounded-xl py-1.5 px-3 text-sm text-on-surface dark:text-white focus:outline-none focus:border-tertiary dark:focus:border-[#e3b54a]" />
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-[10px] font-semibold mb-1 text-on-surface-variant dark:text-white/60">Correo Electrónico</label>
                  <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-white dark:bg-black border border-outline-variant/50 dark:border-white/10 rounded-xl py-1.5 px-3 text-sm text-on-surface dark:text-white focus:outline-none focus:border-tertiary dark:focus:border-[#e3b54a]" />
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-[10px] font-semibold mb-1 text-on-surface-variant dark:text-white/60">Teléfono</label>
                  <input type="text" value={formData.telefono} onChange={e => setFormData({...formData, telefono: e.target.value})} className="w-full bg-white dark:bg-black border border-outline-variant/50 dark:border-white/10 rounded-xl py-1.5 px-3 text-sm text-on-surface dark:text-white focus:outline-none focus:border-tertiary dark:focus:border-[#e3b54a]" />
                </div>
                <div className="col-span-2">
                  <label className="block text-[10px] font-semibold mb-1 text-on-surface-variant dark:text-white/60">Contraseña Temporal</label>
                  <input required type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full bg-white dark:bg-black border border-outline-variant/50 dark:border-white/10 rounded-xl py-1.5 px-3 text-sm text-on-surface dark:text-white focus:outline-none focus:border-tertiary dark:focus:border-[#e3b54a]" />
                </div>
              </div>
              
              <div className="flex justify-end gap-3 pt-4 border-t border-outline-variant/30 dark:border-white/10 mt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2 rounded-full font-bold text-sm text-on-surface-variant hover:bg-outline-variant/20 dark:text-white/60 dark:hover:bg-white/10 transition-colors">
                  Cancelar
                </button>
                <button type="submit" className="px-6 py-2 rounded-full font-bold text-sm bg-primary text-white hover:bg-tertiary dark:bg-[#e3b54a] dark:text-black dark:hover:bg-white transition-colors">
                  Registrar Cliente
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
