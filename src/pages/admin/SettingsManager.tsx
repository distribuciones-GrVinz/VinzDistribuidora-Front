import { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useNotification } from '../../context/NotificationContext';
import { Calendar, Moon, Sun, Monitor, FileText, Save, AlertTriangle, QrCode, Download, ChevronDown, ChevronUp, Bell, Send } from 'lucide-react';
import { getSARConfig, updateSARConfig, getConfiguracionesEntrega, updateConfiguracionesEntrega } from '../../services/adminService';
import { QRCodeCanvas } from 'qrcode.react';
import { pushService } from '../../services/pushService';

const API_URL = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:8000/api`;
function getAuthHeaders() {
  const token = localStorage.getItem('vinz_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
}

export function SettingsManager() {
  const { theme, toggleTheme } = useTheme();
  const { showNotification } = useNotification();
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const [pushData, setPushData] = useState({ titulo: '', mensaje: '', url_destino: '/' });
  const [isSendingPush, setIsSendingPush] = useState(false);
  const [isSubscribing, setIsSubscribing] = useState(false);

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const downloadQR = () => {
    const canvas = document.getElementById('qr-gen') as HTMLCanvasElement;
    if (canvas) {
      const pngUrl = canvas
        .toDataURL('image/png')
        .replace('image/png', 'image/octet-stream');
      const downloadLink = document.createElement('a');
      downloadLink.href = pngUrl;
      downloadLink.download = 'vinz-app-qr.png';
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    }
  };
  
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

        {/* Generador de QR */}
        <section className="bg-white dark:bg-[#0f0f0f] border border-outline-variant/50 dark:border-white/5 rounded-3xl p-6 md:p-8 shadow-lg dark:shadow-2xl transition-colors">
          <button onClick={() => toggleSection('qr')} className="w-full flex items-center justify-between outline-none">
            <div className="flex items-center gap-3">
              <div className="bg-surface dark:bg-[#1a1a1a] p-3 rounded-xl border border-outline-variant/50 dark:border-white/5 shadow-sm dark:shadow-none">
                <QrCode className="w-6 h-6 text-tertiary dark:text-[#e3b54a]" />
              </div>
              <h2 className="text-xl font-headline-lg text-on-surface dark:text-white text-left">Código QR de la App</h2>
            </div>
            {expandedSection === 'qr' ? <ChevronUp className="w-6 h-6 text-on-surface dark:text-white/70" /> : <ChevronDown className="w-6 h-6 text-on-surface dark:text-white/70" />}
          </button>

          {expandedSection === 'qr' && (
            <div className="mt-8 flex flex-col md:flex-row items-center justify-between gap-6 p-6 bg-surface dark:bg-[#1a1a1a] rounded-2xl border border-outline-variant/50 dark:border-white/5 shadow-sm dark:shadow-none transition-colors">
            <div className="flex flex-col items-center gap-4">
              <div className="bg-white p-4 rounded-xl shadow-inner border border-gray-200">
                <QRCodeCanvas
                  id="qr-gen"
                  value={window.location.origin}
                  size={180}
                  level={"H"}
                  includeMargin={true}
                  imageSettings={{
                    src: "/sweet_logo.jpg",
                    x: undefined,
                    y: undefined,
                    height: 40,
                    width: 40,
                    excavate: true,
                  }}
                />
              </div>
            </div>
            
            <button 
              onClick={downloadQR}
              className="relative flex items-center justify-center gap-2 px-8 py-4 rounded-full font-bold transition-all shadow-md w-full md:w-auto bg-[#e3b54a] text-black hover:bg-[#c89f53] hover:-translate-y-1 dark:shadow-[0_0_20px_rgba(227,181,74,0.2)]"
            >
              <Download className="w-5 h-5" />
              <span>Descargar QR</span>
            </button>
          </div>
          )}
        </section>

        {/* Facturación SAR */}
        <section className="bg-white dark:bg-[#0f0f0f] border border-outline-variant/50 dark:border-white/5 rounded-3xl p-6 md:p-8 shadow-lg dark:shadow-2xl transition-colors">
          <button onClick={() => toggleSection('sar')} className="w-full flex items-center justify-between outline-none">
            <div className="flex items-center gap-3">
              <div className="bg-surface dark:bg-[#1a1a1a] p-3 rounded-xl border border-outline-variant/50 dark:border-white/5 shadow-sm dark:shadow-none">
                <FileText className="w-6 h-6 text-tertiary dark:text-[#e3b54a]" />
              </div>
              <h2 className="text-xl font-headline-lg text-on-surface dark:text-white text-left">Facturación SAR</h2>
            </div>
            {expandedSection === 'sar' ? <ChevronUp className="w-6 h-6 text-on-surface dark:text-white/70" /> : <ChevronDown className="w-6 h-6 text-on-surface dark:text-white/70" />}
          </button>

          {expandedSection === 'sar' && !isLoading && sarConfig && (
            <form onSubmit={handleSaveSAR} className="space-y-6 mt-8">
              
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
        <section className="bg-white dark:bg-[#0f0f0f] border border-outline-variant/50 dark:border-white/5 rounded-3xl p-6 md:p-8 shadow-lg dark:shadow-2xl transition-colors">
          <button onClick={() => toggleSection('entregas')} className="w-full flex items-center justify-between outline-none">
            <div className="flex items-center gap-3">
              <div className="bg-surface dark:bg-[#1a1a1a] p-3 rounded-xl border border-outline-variant/50 dark:border-white/5 shadow-sm dark:shadow-none">
                <Calendar className="w-6 h-6 text-tertiary dark:text-[#e3b54a]" />
              </div>
              <h2 className="text-xl font-headline-lg text-on-surface dark:text-white text-left">Calendario de Despachos</h2>
            </div>
            {expandedSection === 'entregas' ? <ChevronUp className="w-6 h-6 text-on-surface dark:text-white/70" /> : <ChevronDown className="w-6 h-6 text-on-surface dark:text-white/70" />}
          </button>

          {expandedSection === 'entregas' && !isLoading && entregaConfig && (
            <form onSubmit={handleSaveEntrega} className="space-y-8 mt-8">
              
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

        {/* Notificaciones Push (Administrar & Suscribirse) */}
        <section className="bg-white dark:bg-[#0f0f0f] border border-outline-variant/50 dark:border-white/5 rounded-3xl p-6 md:p-8 shadow-lg dark:shadow-2xl transition-colors">
          <button onClick={() => toggleSection('push')} className="w-full flex items-center justify-between outline-none">
            <div className="flex items-center gap-3">
              <div className="bg-surface dark:bg-[#1a1a1a] p-3 rounded-xl border border-outline-variant/50 dark:border-white/5 shadow-sm dark:shadow-none">
                <Bell className="w-6 h-6 text-tertiary dark:text-[#e3b54a]" />
              </div>
              <h2 className="text-xl font-headline-lg text-on-surface dark:text-white text-left">Notificaciones Push</h2>
            </div>
            {expandedSection === 'push' ? <ChevronUp className="w-6 h-6 text-on-surface dark:text-white/70" /> : <ChevronDown className="w-6 h-6 text-on-surface dark:text-white/70" />}
          </button>

          {expandedSection === 'push' && (
            <div className="mt-8 space-y-6">
              
              {/* Suscripción personal */}
              <div className="bg-surface dark:bg-[#1a1a1a] p-6 rounded-2xl border border-outline-variant/50 dark:border-white/5">
                <h3 className="font-bold text-lg text-on-surface dark:text-white mb-2">Notificaciones en este Dispositivo</h3>
                <p className="text-sm text-on-surface-variant dark:text-white/70 mb-4">
                  Activa las notificaciones para recibir alertas importantes en este dispositivo.
                </p>
                <div className="flex gap-4">
                  <button 
                    onClick={async () => {
                      setIsSubscribing(true);
                      const exito = await pushService.subscribe();
                      if (exito) showNotification('success', 'Te has suscrito exitosamente');
                      else showNotification('error', 'No se pudo activar las notificaciones');
                      setIsSubscribing(false);
                    }}
                    disabled={isSubscribing}
                    className="bg-primary text-white dark:bg-[#e3b54a] dark:text-black px-6 py-2 rounded-xl font-bold hover:-translate-y-0.5 transition-all"
                  >
                    {isSubscribing ? 'Procesando...' : 'Activar Notificaciones'}
                  </button>
                  <button 
                    onClick={async () => {
                      setIsSubscribing(true);
                      const exito = await pushService.unsubscribe();
                      if (exito) showNotification('success', 'Te has desuscrito');
                      else showNotification('error', 'Error al desuscribir');
                      setIsSubscribing(false);
                    }}
                    disabled={isSubscribing}
                    className="bg-error/10 text-error px-6 py-2 rounded-xl font-bold hover:bg-error/20 transition-all"
                  >
                    Desactivar
                  </button>
                </div>
              </div>

              {/* Enviar Notificación Masiva */}
              <div className="bg-surface dark:bg-[#1a1a1a] p-6 rounded-2xl border border-outline-variant/50 dark:border-white/5">
                <h3 className="font-bold text-lg text-on-surface dark:text-white mb-4">Enviar Notificación Masiva</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-on-surface-variant dark:text-white/70 mb-2">Título</label>
                    <input 
                      type="text"
                      value={pushData.titulo}
                      onChange={e => setPushData({...pushData, titulo: e.target.value})}
                      className="w-full bg-white dark:bg-[#111] border border-outline-variant/30 dark:border-white/10 rounded-xl px-4 py-3 text-on-surface dark:text-white focus:outline-none focus:ring-2 focus:ring-tertiary dark:focus:ring-[#e3b54a]"
                      placeholder="Ej. ¡Nueva Promoción!"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-on-surface-variant dark:text-white/70 mb-2">Mensaje</label>
                    <textarea 
                      value={pushData.mensaje}
                      onChange={e => setPushData({...pushData, mensaje: e.target.value})}
                      className="w-full bg-white dark:bg-[#111] border border-outline-variant/30 dark:border-white/10 rounded-xl px-4 py-3 text-on-surface dark:text-white focus:outline-none focus:ring-2 focus:ring-tertiary dark:focus:ring-[#e3b54a] h-24 resize-none"
                      placeholder="Escribe el mensaje..."
                    />
                  </div>
                  <div className="flex justify-end pt-2">
                    <button
                      onClick={async () => {
                        if (!pushData.titulo || !pushData.mensaje) {
                          showNotification('error', 'Por favor llena el título y mensaje');
                          return;
                        }
                        setIsSendingPush(true);
                        try {
                          const res = await fetch(`${API_URL}/push/campaign/`, {
                            method: 'POST',
                            headers: getAuthHeaders(),
                            body: JSON.stringify(pushData)
                          });
                          if (!res.ok) throw new Error('Error en petición');
                          const data = await res.json();
                          showNotification('success', `Enviada a ${data.exitos} dispositivos.`);
                          setPushData({ titulo: '', mensaje: '', url_destino: '/' });
                        } catch (e) {
                          showNotification('error', 'Error al enviar la campaña');
                        } finally {
                          setIsSendingPush(false);
                        }
                      }}
                      disabled={isSendingPush}
                      className="flex items-center gap-2 bg-tertiary hover:bg-tertiary-container text-white dark:bg-[#e3b54a] dark:text-black dark:hover:bg-white px-8 py-3 rounded-xl font-bold transition-all disabled:opacity-50"
                    >
                      <Send className="w-5 h-5" />
                      {isSendingPush ? 'Enviando...' : 'Enviar Ahora'}
                    </button>
                  </div>
                </div>
              </div>

            </div>
          )}
        </section>
      </div>
    </div>
  );
}
