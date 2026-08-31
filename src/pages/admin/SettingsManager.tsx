import { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useNotification } from '../../context/NotificationContext';
import { Calendar, Moon, Sun, Monitor, FileText, Save, AlertTriangle } from 'lucide-react';
import { getSARConfig, updateSARConfig, getConfiguracionesEntrega, updateConfiguracionesEntrega } from '../../services/adminService';

export function SettingsManager() {
  const { theme, toggleTheme } = useTheme();
  const { showNotification } = useNotification();
  
  const [sarConfig, setSarConfig] = useState<any>(null);
  const [entregaConfig, setEntregaConfig] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSavingEntrega, setIsSavingEntrega] = useState(false);

  useEffect(() => {
    cargarSAR();
  }, []);

  const cargarSAR = async () => {
    try {
      const [configSar, configEntrega] = await Promise.all([
        getSARConfig(),
        getConfiguracionesEntrega()
      ]);
      setSarConfig(configSar);
      setEntregaConfig(configEntrega);
    } catch (error) {
      console.error(error);
      showNotification('error', 'Error al cargar configuraciones');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSarConfig({
      ...sarConfig,
      [e.target.name]: e.target.value
    });
  };

  const handleSaveSAR = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateSARConfig(sarConfig);
      showNotification('success', 'Configuración SAR actualizada');
    } catch (error) {
      console.error(error);
      showNotification('error', 'Error al guardar configuración');
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangeEntrega = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setEntregaConfig({
      ...entregaConfig,
      [e.target.name]: parseInt(e.target.value, 10)
    });
  };

  const handleSaveEntrega = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingEntrega(true);
    try {
      await updateConfiguracionesEntrega(entregaConfig);
      showNotification('success', 'Configuración de Despachos actualizada');
    } catch (error) {
      console.error(error);
      showNotification('error', 'Error al guardar configuración de despachos');
    } finally {
      setIsSavingEntrega(false);
    }
  };

  let warningMessage = '';
  if (sarConfig) {
    const restantes = Number(sarConfig.rango_final) - Number(sarConfig.correlativo_actual);
    if (restantes <= 100 && restantes >= 0) {
      warningMessage = `¡Atención! Quedan pocos correlativos fiscales disponibles (${restantes}).`;
    } else if (restantes < 0) {
      warningMessage = `¡ALERTA CRÍTICA! Has superado el rango máximo de facturas permitidas.`;
    }
    
    if (sarConfig.fecha_limite_emision) {
      const limitDate = new Date(sarConfig.fecha_limite_emision);
      const today = new Date();
      const diffTime = limitDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
      if (diffDays <= 30 && diffDays > 0) {
        warningMessage += ` La fecha límite está próxima a expirar (en ${diffDays} días).`;
      } else if (diffDays <= 0) {
        warningMessage = ' ¡ALERTA CRÍTICA! La fecha límite del SAR ha expirado.';
      }
    }
  }

  return (
    <div className="max-w-4xl mx-auto pt-2 pb-8 md:pt-4 md:pb-8 mb-20 transition-colors duration-300">
      <div className="mb-12 mt-8">
        <h2 className="text-sm tracking-[0.3em] text-tertiary dark:text-[#e3b54a] font-bold uppercase mb-2">Preferencias</h2>
        <h1 className="text-5xl md:text-7xl font-headline-xl text-primary dark:text-white">Configuración.</h1>
      </div>

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
              <p className="text-on-surface-variant/70 dark:text-white/40 text-sm mt-1 max-w-sm">Cambia libremente entre la versión iluminada (estilo crema boutique) y la oscura (Backstage nocturno) del panel.</p>
            </div>
            
            <button 
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

        {/* Facturación SAR */}
        <section className="bg-white dark:bg-[#0f0f0f] border border-outline-variant/50 dark:border-white/5 rounded-3xl p-6 md:p-10 shadow-lg dark:shadow-2xl transition-colors">
          <div className="flex items-center gap-3 mb-8">
            <div className="bg-surface dark:bg-[#1a1a1a] p-3 rounded-xl border border-outline-variant/50 dark:border-white/5 shadow-sm dark:shadow-none">
              <FileText className="w-6 h-6 text-tertiary dark:text-[#e3b54a]" />
            </div>
            <div>
              <h2 className="text-2xl font-headline-lg text-on-surface dark:text-white">Facturación SAR</h2>
              <p className="text-on-surface-variant/70 dark:text-white/40 text-sm mt-1">Configura el control de correlativos y autorización.</p>
            </div>
          </div>

          {!isLoading && sarConfig && (
            <form onSubmit={handleSaveSAR} className="space-y-6">
              
              {warningMessage && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 p-4 rounded-xl flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                  <p className="text-sm font-medium">{warningMessage}</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-on-surface-variant dark:text-white/70 mb-2">CAI (Clave de Autorización)</label>
                  <input
                    type="text"
                    name="cai"
                    value={sarConfig.cai}
                    onChange={handleChange}
                    required
                    className="w-full bg-surface dark:bg-[#111] border border-outline-variant/30 dark:border-white/10 rounded-xl px-4 py-3 text-on-surface dark:text-white focus:outline-none focus:ring-2 focus:ring-tertiary dark:focus:ring-[#e3b54a] transition-all uppercase"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-on-surface-variant dark:text-white/70 mb-2">Fecha Límite de Emisión</label>
                  <input
                    type="date"
                    name="fecha_limite_emision"
                    value={sarConfig.fecha_limite_emision}
                    onChange={handleChange}
                    required
                    className="w-full bg-surface dark:bg-[#111] border border-outline-variant/30 dark:border-white/10 rounded-xl px-4 py-3 text-on-surface dark:text-white focus:outline-none focus:ring-2 focus:ring-tertiary dark:focus:ring-[#e3b54a] transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-on-surface-variant dark:text-white/70 mb-2">Prefijo de Factura</label>
                  <input
                    type="text"
                    name="prefijo_factura"
                    value={sarConfig.prefijo_factura}
                    onChange={handleChange}
                    required
                    placeholder="Ej. 000-001-01-"
                    className="w-full bg-surface dark:bg-[#111] border border-outline-variant/30 dark:border-white/10 rounded-xl px-4 py-3 text-on-surface dark:text-white focus:outline-none focus:ring-2 focus:ring-tertiary dark:focus:ring-[#e3b54a] transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-on-surface-variant dark:text-white/70 mb-2">Correlativo Actual (Próxima Factura)</label>
                  <input
                    type="number"
                    name="correlativo_actual"
                    value={sarConfig.correlativo_actual}
                    onChange={handleChange}
                    required
                    className="w-full bg-surface dark:bg-[#111] border border-outline-variant/30 dark:border-white/10 rounded-xl px-4 py-3 text-on-surface dark:text-white focus:outline-none focus:ring-2 focus:ring-tertiary dark:focus:ring-[#e3b54a] transition-all font-mono font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-on-surface-variant dark:text-white/70 mb-2">Rango Inicial</label>
                  <input
                    type="number"
                    name="rango_inicial"
                    value={sarConfig.rango_inicial}
                    onChange={handleChange}
                    required
                    className="w-full bg-surface dark:bg-[#111] border border-outline-variant/30 dark:border-white/10 rounded-xl px-4 py-3 text-on-surface dark:text-white focus:outline-none focus:ring-2 focus:ring-tertiary dark:focus:ring-[#e3b54a] transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-on-surface-variant dark:text-white/70 mb-2">Rango Final</label>
                  <input
                    type="number"
                    name="rango_final"
                    value={sarConfig.rango_final}
                    onChange={handleChange}
                    required
                    className="w-full bg-surface dark:bg-[#111] border border-outline-variant/30 dark:border-white/10 rounded-xl px-4 py-3 text-on-surface dark:text-white focus:outline-none focus:ring-2 focus:ring-tertiary dark:focus:ring-[#e3b54a] transition-all"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex items-center gap-2 bg-tertiary hover:bg-tertiary-container text-white dark:bg-[#e3b54a] dark:text-black dark:hover:bg-white px-8 py-3 rounded-xl font-bold transition-all disabled:opacity-50"
                >
                  <Save className="w-5 h-5" />
                  {isSaving ? 'Guardando...' : 'Guardar Configuración'}
                </button>
              </div>
            </form>
          )}

        </section>

        {/* Configuracion Entregas */}
        <section className="bg-white dark:bg-[#0f0f0f] border border-outline-variant/50 dark:border-white/5 rounded-3xl p-6 md:p-10 shadow-lg dark:shadow-2xl transition-colors">
          <div className="flex items-center gap-3 mb-8">
            <div className="bg-surface dark:bg-[#1a1a1a] p-3 rounded-xl border border-outline-variant/50 dark:border-white/5 shadow-sm dark:shadow-none">
              <Calendar className="w-6 h-6 text-tertiary dark:text-[#e3b54a]" />
            </div>
            <div>
              <h2 className="text-2xl font-headline-lg text-on-surface dark:text-white">Calendario de Despachos</h2>
              <p className="text-on-surface-variant/70 dark:text-white/40 text-sm mt-1">Configura las reglas de corte y días de entrega para los pedidos.</p>
            </div>
          </div>

          {!isLoading && entregaConfig && (
            <form onSubmit={handleSaveEntrega} className="space-y-8">
              
              <div className="bg-gray-50 dark:bg-white/5 p-6 rounded-2xl border border-gray-200 dark:border-white/10">
                <h3 className="font-bold text-lg text-on-surface dark:text-white mb-4 flex items-center gap-2">
                  <span className="bg-tertiary text-white dark:bg-[#e3b54a] dark:text-black w-6 h-6 rounded-full flex items-center justify-center text-sm">1</span>
                  Regla de Corte Principal
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-on-surface-variant dark:text-white/70 mb-2">Pedidos realizados hasta el:</label>
                    <select
                      name="corte_1_dia"
                      value={entregaConfig.corte_1_dia}
                      onChange={handleChangeEntrega}
                      className="w-full bg-white dark:bg-[#111] border border-outline-variant/30 dark:border-white/10 rounded-xl px-4 py-3 text-on-surface dark:text-white focus:outline-none focus:ring-2 focus:ring-tertiary dark:focus:ring-[#e3b54a]"
                    >
                      <option value={0}>Lunes</option>
                      <option value={1}>Martes</option>
                      <option value={2}>Miércoles</option>
                      <option value={3}>Jueves</option>
                      <option value={4}>Viernes</option>
                      <option value={5}>Sábado</option>
                      <option value={6}>Domingo</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-on-surface-variant dark:text-white/70 mb-2">Empiezan a entregarse el:</label>
                    <select
                      name="corte_1_entrega_inicio"
                      value={entregaConfig.corte_1_entrega_inicio}
                      onChange={handleChangeEntrega}
                      className="w-full bg-white dark:bg-[#111] border border-outline-variant/30 dark:border-white/10 rounded-xl px-4 py-3 text-on-surface dark:text-white focus:outline-none focus:ring-2 focus:ring-tertiary dark:focus:ring-[#e3b54a]"
                    >
                      <option value={0}>Lunes</option>
                      <option value={1}>Martes</option>
                      <option value={2}>Miércoles</option>
                      <option value={3}>Jueves</option>
                      <option value={4}>Viernes</option>
                      <option value={5}>Sábado</option>
                      <option value={6}>Domingo</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-on-surface-variant dark:text-white/70 mb-2">Y terminan de entregarse el:</label>
                    <select
                      name="corte_1_entrega_fin"
                      value={entregaConfig.corte_1_entrega_fin}
                      onChange={handleChangeEntrega}
                      className="w-full bg-white dark:bg-[#111] border border-outline-variant/30 dark:border-white/10 rounded-xl px-4 py-3 text-on-surface dark:text-white focus:outline-none focus:ring-2 focus:ring-tertiary dark:focus:ring-[#e3b54a]"
                    >
                      <option value={0}>Lunes</option>
                      <option value={1}>Martes</option>
                      <option value={2}>Miércoles</option>
                      <option value={3}>Jueves</option>
                      <option value={4}>Viernes</option>
                      <option value={5}>Sábado</option>
                      <option value={6}>Domingo</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-white/5 p-6 rounded-2xl border border-gray-200 dark:border-white/10">
                <h3 className="font-bold text-lg text-on-surface dark:text-white mb-4 flex items-center gap-2">
                  <span className="bg-tertiary text-white dark:bg-[#e3b54a] dark:text-black w-6 h-6 rounded-full flex items-center justify-center text-sm">2</span>
                  Regla de Corte Secundaria
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-on-surface-variant dark:text-white/70 mb-2">Pedidos realizados hasta el:</label>
                    <select
                      name="corte_2_dia"
                      value={entregaConfig.corte_2_dia}
                      onChange={handleChangeEntrega}
                      className="w-full bg-white dark:bg-[#111] border border-outline-variant/30 dark:border-white/10 rounded-xl px-4 py-3 text-on-surface dark:text-white focus:outline-none focus:ring-2 focus:ring-tertiary dark:focus:ring-[#e3b54a]"
                    >
                      <option value={0}>Lunes</option>
                      <option value={1}>Martes</option>
                      <option value={2}>Miércoles</option>
                      <option value={3}>Jueves</option>
                      <option value={4}>Viernes</option>
                      <option value={5}>Sábado</option>
                      <option value={6}>Domingo</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-on-surface-variant dark:text-white/70 mb-2">Empiezan a entregarse el:</label>
                    <select
                      name="corte_2_entrega_inicio"
                      value={entregaConfig.corte_2_entrega_inicio}
                      onChange={handleChangeEntrega}
                      className="w-full bg-white dark:bg-[#111] border border-outline-variant/30 dark:border-white/10 rounded-xl px-4 py-3 text-on-surface dark:text-white focus:outline-none focus:ring-2 focus:ring-tertiary dark:focus:ring-[#e3b54a]"
                    >
                      <option value={0}>Lunes</option>
                      <option value={1}>Martes</option>
                      <option value={2}>Miércoles</option>
                      <option value={3}>Jueves</option>
                      <option value={4}>Viernes</option>
                      <option value={5}>Sábado</option>
                      <option value={6}>Domingo</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-on-surface-variant dark:text-white/70 mb-2">Y terminan de entregarse el:</label>
                    <select
                      name="corte_2_entrega_fin"
                      value={entregaConfig.corte_2_entrega_fin}
                      onChange={handleChangeEntrega}
                      className="w-full bg-white dark:bg-[#111] border border-outline-variant/30 dark:border-white/10 rounded-xl px-4 py-3 text-on-surface dark:text-white focus:outline-none focus:ring-2 focus:ring-tertiary dark:focus:ring-[#e3b54a]"
                    >
                      <option value={0}>Lunes</option>
                      <option value={1}>Martes</option>
                      <option value={2}>Miércoles</option>
                      <option value={3}>Jueves</option>
                      <option value={4}>Viernes</option>
                      <option value={5}>Sábado</option>
                      <option value={6}>Domingo</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="submit"
                  disabled={isSavingEntrega}
                  className="flex items-center gap-2 bg-tertiary hover:bg-tertiary-container text-white dark:bg-[#e3b54a] dark:text-black dark:hover:bg-white px-8 py-3 rounded-xl font-bold transition-all disabled:opacity-50"
                >
                  <Save className="w-5 h-5" />
                  {isSavingEntrega ? 'Guardando...' : 'Guardar Calendario'}
                </button>
              </div>
            </form>
          )}

        </section>
      </div>
    </div>
  );
}
