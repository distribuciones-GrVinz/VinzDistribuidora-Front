import { Link } from 'react-router-dom';
import { PackageSearch, ReceiptText, Users, TrendingUp, ChefHat } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getPedidos } from '../services/adminService';
import { ProductionSummaryModal } from '../components/admin/ProductionSummaryModal';

export function AdminDashboard() {
  const [pedidos, setPedidos] = useState<any[]>([]);
  const [isProdModalOpen, setIsProdModalOpen] = useState(false);

  useEffect(() => {
    const fetchPedidos = async () => {
      try {
        const data = await getPedidos();
        setPedidos(data);
      } catch (error) {
        console.error("Error fetching pedidos", error);
      }
    };
    fetchPedidos();
  }, []);

  const pendingCount = pedidos.filter(p => p.estado === 'Pendiente' || p.estado === 'Nuevo').length;
  const modules = [
    { name: 'Productos', path: '/admin/productos', icon: PackageSearch, count: '12', color: 'bg-white dark:bg-[#111]', hover: 'hover:bg-gray-50 dark:hover:bg-[#1a1a1a]', text: 'text-on-surface dark:text-white', subtext: 'text-on-surface-variant dark:text-white/40' },
    { name: 'Pedidos', path: '/admin/pedidos', icon: ReceiptText, count: '5', color: 'bg-white dark:bg-[#111]', hover: 'hover:bg-gray-50 dark:hover:bg-[#1a1a1a]', text: 'text-on-surface dark:text-white', subtext: 'text-on-surface-variant dark:text-white/40' },
    { name: 'Clientes', path: '/admin/clientes', icon: Users, count: '24', color: 'bg-white dark:bg-[#111]', hover: 'hover:bg-gray-50 dark:hover:bg-[#1a1a1a]', text: 'text-on-surface dark:text-white', subtext: 'text-on-surface-variant dark:text-white/40' },
  ];

  return (
    <div className="max-w-6xl mx-auto py-8 transition-colors duration-300">
      {/* Header */}
      <div className="mb-16 md:mb-24 mt-8 md:mt-16">
        <h2 className="text-sm tracking-[0.3em] text-tertiary dark:text-primary-container font-bold uppercase mb-4">Portal Administrativo</h2>
        <h1 className="text-4xl md:text-7xl font-headline-xl text-primary dark:text-white">
          Backstage.
        </h1>
        <p className="mt-6 text-on-surface-variant dark:text-white/50 text-lg md:text-xl max-w-2xl font-light leading-relaxed">
          Bienvenido al centro de operaciones de VINZ. Desde aquí controlas el flujo, la exhibición y las entregas de Sweet & Tasty.
        </p>
      </div>

      {/* Main Stats (Magazine Layout) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 mb-16 relative z-10">
        {/* Tarjeta Verde Oliva */}
        <div className="bg-tertiary dark:bg-[#111] border-2 border-tertiary-container/30 dark:border-white/10 p-8 md:p-12 rounded-3xl relative overflow-hidden group transition-all shadow-xl hover:shadow-2xl dark:shadow-none hover:-translate-y-1">
          <div className="absolute -top-10 -right-10 p-8 opacity-10 dark:opacity-5 group-hover:opacity-20 dark:group-hover:opacity-10 transition-opacity rotate-12">
            <TrendingUp className="w-64 h-64 text-white dark:text-[#e3b54a]" />
          </div>
          <p className="text-white/70 dark:text-white/40 uppercase tracking-widest text-xs font-bold mb-4 relative z-10">Ingresos de Hoy</p>
          <h3 className="text-5xl md:text-6xl font-headline-xl text-white relative z-10">L 4,250<span className="text-white/50 dark:text-[#e3b54a]">.00</span></h3>
          <p className="mt-4 text-emerald-200 dark:text-emerald-400 text-sm font-semibold flex items-center gap-2 relative z-10">
            ↑ 15% vs ayer
          </p>
        </div>

        {/* Tarjeta Dorada */}
        <div className="bg-primary-container p-8 md:p-12 rounded-3xl relative overflow-hidden text-black group shadow-xl hover:shadow-2xl hover:-translate-y-1 border-2 border-white/20 dark:shadow-[0_0_40px_rgba(227,181,74,0.15)] dark:border-[#e3b54a]/30 transition-all flex flex-col justify-between">
          <div>
            <p className="text-black/60 uppercase tracking-widest text-xs font-bold mb-4 relative z-10">Acción Requerida</p>
            <h3 className="text-5xl md:text-6xl font-headline-xl text-black relative z-10">{pendingCount}</h3>
            <p className="mt-4 font-semibold text-black/80 relative z-10">Pedidos nuevos pendientes de despacho.</p>
          </div>
          
          <div className="mt-8 flex flex-col sm:flex-row gap-4 relative z-10">
            <button 
              onClick={() => setIsProdModalOpen(true)}
              className="flex items-center gap-2 bg-black text-white hover:bg-black/80 dark:bg-black dark:text-[#e3b54a] px-5 py-3 rounded-xl font-bold transition-colors w-max"
            >
              <ChefHat className="w-5 h-5" />
              Resumen de Producción
            </button>
            <Link to="/admin/pedidos" className="flex items-center border-b-2 border-black pb-1 font-bold hover:px-2 transition-all w-max h-max mt-auto mb-2">
              Ir a Pedidos &rarr;
            </Link>
          </div>
        </div>
      </div>

      {/* Modules */}
      <div className="relative z-10">
        <h3 className="text-sm tracking-[0.2em] text-on-surface-variant/50 dark:text-white/40 font-bold uppercase mb-8">Módulos Principales</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {modules.map((mod) => (
            <Link key={mod.name} to={mod.path} className={`${mod.color} ${mod.hover} border-2 border-outline-variant/60 dark:border-white/10 p-8 rounded-3xl transition-all group hover:-translate-y-1 block relative overflow-hidden shadow-md hover:shadow-xl dark:shadow-none bg-white/90 backdrop-blur-md`}>
              <div className="w-12 h-12 bg-surface dark:bg-black/50 rounded-full flex items-center justify-center mb-6 text-tertiary dark:text-[#e3b54a] border border-outline-variant/50 dark:border-white/5 group-hover:bg-tertiary dark:group-hover:bg-[#e3b54a] group-hover:text-white dark:group-hover:text-black transition-colors relative z-10 shadow-sm dark:shadow-none">
                <mod.icon className="w-5 h-5" />
              </div>
              <h4 className={`text-2xl font-headline-lg mb-2 relative z-10 ${mod.text}`}>{mod.name}</h4>
              <p className={`text-sm relative z-10 ${mod.subtext}`}>{mod.count} registros activos</p>
            </Link>
          ))}
        </div>
      </div>
      {/* Production Summary Modal */}
      <ProductionSummaryModal 
        isOpen={isProdModalOpen} 
        onClose={() => setIsProdModalOpen(false)} 
        pedidos={pedidos} 
      />
    </div>
  );
}
