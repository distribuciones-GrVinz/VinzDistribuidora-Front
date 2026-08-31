import { Mail, Phone } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getClientes, createClienteAdmin, updateCliente } from '../../services/adminService';
import { useNotification } from '../../context/NotificationContext';

export function ClientManager() {
  const { showNotification } = useNotification();
  const [clientes, setClientes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [selectedCliente, setSelectedCliente] = useState<any>(null);
  const [configData, setConfigData] = useState({ estado: 'Pendiente', factor_precio: 1.0 });
  const [priceType, setPriceType] = useState<'normal' | 'descuento' | 'incremento'>('normal');
  const [pricePercentage, setPricePercentage] = useState<number | string>('');
  
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
      showNotification('success', 'Cliente registrado exitosamente');
      window.dispatchEvent(new Event('clientesUpdated'));
    } catch (error) {
      console.error('Error creando cliente:', error);
      showNotification('error', 'Error al registrar cliente');
    }
  };

  const handleConfigSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateCliente(selectedCliente.id, configData);
      setIsConfigModalOpen(false);
      cargarClientes();
      showNotification('success', 'Configuración actualizada');
      window.dispatchEvent(new Event('clientesUpdated'));
    } catch (error) {
      console.error('Error actualizando cliente:', error);
      showNotification('error', 'Error al actualizar configuración');
    }
  };

  return (
    <div className="max-w-6xl mx-auto pt-2 pb-8 md:pt-4 md:pb-8 mb-20 transition-colors duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16 mt-8">
        <div>
          <h2 className="text-sm tracking-[0.3em] text-tertiary dark:text-[#e3b54a] font-bold uppercase mb-2">Comunidad</h2>
          <h1 className="text-5xl md:text-7xl font-headline-xl text-primary dark:text-white">Clientes.</h1>
        </div>
      </div>

      <div className="premium-table-card">
        
        {/* Toolbar */}
        <div className="premium-table-toolbar">
          <div className="relative w-full md:max-w-md">
            <input 
              type="text" 
              placeholder="Buscar por nombre o contacto..." 
              className="w-full bg-white dark:bg-[#1a1a1a] border border-outline-variant/50 dark:border-white/10 rounded-full py-2.5 px-5 text-on-surface dark:text-white focus:outline-none focus:border-tertiary dark:focus:border-[#e3b54a] transition-colors text-sm"
            />
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <button className="flex-1 md:flex-none px-5 py-2.5 bg-white dark:bg-[#1a1a1a] text-on-surface dark:text-white rounded-full text-xs font-bold border border-outline-variant/50 dark:border-white/10 hover:bg-outline-variant/30 dark:hover:bg-white/5 transition-colors shadow-sm">
              Filtrar
            </button>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="flex-1 md:flex-none px-5 py-2.5 bg-primary-container dark:bg-[#e3b54a] text-white dark:text-black rounded-full text-xs font-bold shadow-md hover:-translate-y-0.5 transition-transform"
            >
              + Nuevo Cliente
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="premium-table">
            <thead>
              <tr>
                <th>Empresa</th>
                <th className="hidden md:table-cell">Contacto</th>
                <th>Estado</th>
                <th className="text-center">Compras</th>
                <th className="text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="text-center opacity-50 py-10">Cargando clientes...</td>
                </tr>
              ) : clientes.map((cliente) => (
                <tr key={cliente.id} className="group">
                  <td>
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-primary-container/10 dark:bg-white/5 flex items-center justify-center text-tertiary dark:text-[#e3b54a] font-headline-lg text-lg">
                        {cliente.nombre_comercial?.charAt(0) || 'C'}
                      </div>
                      <div>
                        <p className="font-bold">{cliente.nombre_comercial}</p>
                        <p className="text-xs text-on-surface-variant/70 dark:text-white/40">{cliente.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="hidden md:table-cell">
                    <p className="font-semibold mb-1">
                      {cliente.usuario_detalle?.first_name} {cliente.usuario_detalle?.last_name}
                    </p>
                    <div className="flex flex-col gap-1 text-[11px] text-on-surface-variant/70 dark:text-white/40">
                      <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {cliente.usuario_detalle?.email}</span>
                      <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {cliente.usuario_detalle?.telefono || 'N/A'}</span>
                    </div>
                  </td>
                  <td>
                    <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wider uppercase border ${
                      cliente.estado === 'Aprobado'
                        ? 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20'
                        : cliente.estado === 'Pendiente'
                        ? 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20'
                        : 'bg-red-100 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20'
                    }`}>
                      {cliente.estado || 'Pendiente'}
                    </span>
                  </td>
                  <td className="text-center">
                    <span className="text-lg font-light"> -- </span>
                  </td>
                  <td className="text-right">
                    <button 
                      onClick={() => {
                        setSelectedCliente(cliente);
                        const factor = parseFloat(cliente.factor_precio) || 1.0;
                        setConfigData({ estado: cliente.estado || 'Pendiente', factor_precio: factor });
                        
                        if (factor < 1.0) {
                          setPriceType('descuento');
                          setPricePercentage(Math.round((1.0 - factor) * 100));
                        } else if (factor > 1.0) {
                          setPriceType('incremento');
                          setPricePercentage(Math.round((factor - 1.0) * 100));
                        } else {
                          setPriceType('normal');
                          setPricePercentage('');
                        }

                        setIsConfigModalOpen(true);
                      }}
                      className="px-4 py-2 bg-primary-container dark:bg-white/10 text-on-primary-container dark:text-white text-xs font-bold uppercase rounded-full hover:bg-tertiary hover:text-white dark:hover:bg-[#e3b54a] dark:hover:text-black transition-colors"
                    >
                      Configurar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Footer Paginación */}
        <div className="p-6 border-t border-outline-variant/30 dark:border-white/5 flex flex-col md:flex-row items-center justify-between gap-4 bg-surface/30 dark:bg-[#121212]">
          <p className="text-sm text-on-surface-variant dark:text-white/60 font-medium">
            Mostrando <span className="font-bold text-primary dark:text-white">{clientes.length}</span> clientes
          </p>
          <div className="flex items-center gap-2">
            <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-outline-variant/50 dark:border-white/10 text-on-surface-variant hover:bg-surface dark:hover:bg-white/5 transition-colors">
              {'<'}
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-primary dark:bg-white text-white dark:text-black font-bold shadow-md">
              1
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-outline-variant/50 dark:border-white/10 text-on-surface-variant hover:bg-surface dark:hover:bg-white/5 transition-colors">
              {'>'}
            </button>
          </div>
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

      {/* Modal Configurar Cliente */}
      {isConfigModalOpen && selectedCliente && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-surface dark:bg-[#0f0f0f] w-full max-w-md rounded-3xl p-6 md:p-8 shadow-2xl border border-outline-variant/30 dark:border-white/10 relative">
            <h2 className="text-xl md:text-2xl font-bold text-primary dark:text-white mb-2">Configurar Cliente</h2>
            <p className="text-sm text-on-surface-variant dark:text-white/60 mb-6">{selectedCliente.nombre_comercial}</p>
            
            <form onSubmit={handleConfigSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-semibold mb-1 text-on-surface-variant dark:text-white/60 uppercase">Estado de la Cuenta</label>
                <select 
                  value={configData.estado} 
                  onChange={e => setConfigData({...configData, estado: e.target.value})} 
                  className="w-full bg-white dark:bg-black border border-outline-variant/50 dark:border-white/10 rounded-xl py-2 px-3 text-sm text-on-surface dark:text-white focus:outline-none focus:border-tertiary dark:focus:border-[#e3b54a]"
                >
                  <option value="Pendiente">Pendiente de Verificación</option>
                  <option value="Aprobado">Aprobado (Acceso Completo)</option>
                  <option value="Rechazado">Rechazado (Bloqueado)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-semibold mb-1 text-on-surface-variant dark:text-white/60 uppercase">Tipo de Precio</label>
                  <select 
                    value={priceType} 
                    onChange={e => {
                      const type = e.target.value as 'normal' | 'descuento' | 'incremento';
                      setPriceType(type);
                      
                      let pct = Number(pricePercentage) || 0;
                      if (type === 'normal') pct = 0;
                      
                      let factor = 1.0;
                      if (type === 'descuento') factor = 1.0 - (pct / 100);
                      else if (type === 'incremento') factor = 1.0 + (pct / 100);
                      
                      setConfigData(prev => ({...prev, factor_precio: parseFloat(factor.toFixed(2))}));
                    }} 
                    className="w-full bg-white dark:bg-black border border-outline-variant/50 dark:border-white/10 rounded-xl py-2 px-3 text-sm text-on-surface dark:text-white focus:outline-none focus:border-tertiary dark:focus:border-[#e3b54a]"
                  >
                    <option value="normal">Precio Normal</option>
                    <option value="descuento">Descuento (-)</option>
                    <option value="incremento">Incremento (+)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-semibold mb-1 text-on-surface-variant dark:text-white/60 uppercase">Porcentaje (%)</label>
                  <input 
                    type="number" 
                    step="1"
                    min="0"
                    max="100"
                    required
                    disabled={priceType === 'normal'}
                    value={priceType === 'normal' ? '' : pricePercentage} 
                    onChange={e => {
                      const raw = e.target.value;
                      setPricePercentage(raw);
                      
                      const pct = parseFloat(raw) || 0;
                      let factor = 1.0;
                      if (priceType === 'descuento') factor = 1.0 - (pct / 100);
                      else if (priceType === 'incremento') factor = 1.0 + (pct / 100);
                      
                      setConfigData(prev => ({...prev, factor_precio: parseFloat(factor.toFixed(2))}));
                    }} 
                    className={`w-full bg-white dark:bg-black border border-outline-variant/50 dark:border-white/10 rounded-xl py-2 px-3 text-sm text-on-surface dark:text-white focus:outline-none focus:border-tertiary dark:focus:border-[#e3b54a] ${priceType === 'normal' ? 'opacity-50 cursor-not-allowed' : ''}`} 
                  />
                </div>
              </div>
              
              <p className="text-[10px] text-tertiary dark:text-[#e3b54a] font-bold text-center">
                Multiplicador Final de Precio: {configData.factor_precio.toFixed(2)}x
              </p>

              <div className="flex gap-3 pt-4 border-t border-outline-variant/30 dark:border-white/10">
                <button type="button" onClick={() => setIsConfigModalOpen(false)} className="flex-1 py-3 px-4 bg-surface dark:bg-[#1a1a1a] text-on-surface dark:text-white font-bold rounded-xl border border-outline-variant/50 dark:border-white/10 hover:bg-outline-variant/30 dark:hover:bg-white/5">Cancelar</button>
                <button type="submit" className="flex-1 py-3 px-4 bg-tertiary text-white dark:bg-[#e3b54a] dark:text-black font-bold rounded-xl shadow-md hover:-translate-y-0.5 transition-transform">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
