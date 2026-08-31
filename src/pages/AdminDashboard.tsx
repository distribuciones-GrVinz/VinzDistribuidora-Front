import { Link } from 'react-router-dom';
import { PackageSearch, ReceiptText, Users, TrendingUp, ChefHat, ChevronRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getPedidos, getProductos, getClientes } from '../services/adminService';
import { ProductionSummaryModal } from '../components/admin/ProductionSummaryModal';

export function AdminDashboard() {
  const [pedidos, setPedidos] = useState<any[]>([]);
  const [productosCount, setProductosCount] = useState<number>(0);
  const [clientesCount, setClientesCount] = useState<number>(0);
  const [isProdModalOpen, setIsProdModalOpen] = useState(false);
  const [periodo, setPeriodo] = useState<'semanal' | 'mensual'>('semanal');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [pedidosData, productosData, clientesData] = await Promise.all([
          getPedidos(),
          getProductos(),
          getClientes()
        ]);
        setPedidos(pedidosData);
        setProductosCount(productosData.length);
        setClientesCount(clientesData.length);
      } catch (error) {
        console.error("Error fetching admin dashboard data", error);
      }
    };
    fetchData();
  }, []);

  const now = new Date();
  now.setHours(23,59,59,999);
  
  let currentStart = new Date(now);
  let prevStart = new Date(now);
  let prevEnd = new Date(now);

  if (periodo === 'semanal') {
    currentStart.setDate(now.getDate() - 7);
    prevEnd = new Date(currentStart);
    prevStart.setDate(now.getDate() - 14);
  } else {
    currentStart.setDate(now.getDate() - 30);
    prevEnd = new Date(currentStart);
    prevStart.setDate(now.getDate() - 60);
  }

  const pedidosActuales = pedidos.filter(p => {
    const d = new Date(p.created_at);
    return d >= currentStart && d <= now;
  });
  const ingresosActuales = pedidosActuales.reduce((sum, p) => sum + parseFloat(p.total || '0'), 0);

  const pedidosAnteriores = pedidos.filter(p => {
    const d = new Date(p.created_at);
    return d >= prevStart && d < prevEnd;
  });
  const ingresosAnteriores = pedidosAnteriores.reduce((sum, p) => sum + parseFloat(p.total || '0'), 0);
  
  let crecimiento = 0;
  if (ingresosAnteriores > 0) {
    crecimiento = ((ingresosActuales - ingresosAnteriores) / ingresosAnteriores) * 100;
  } else if (ingresosActuales > 0) {
    crecimiento = 100;
  }

  const pendingCount = pedidos.filter(p => p.estado === 'Pendiente' || p.estado === 'Nuevo').length;
  const modules = [
    { name: 'Productos', path: '/admin/productos', icon: PackageSearch, count: productosCount.toString(), color: 'bg-white dark:bg-[#111]', hover: 'hover:bg-gray-50 dark:hover:bg-[#1a1a1a]', text: 'text-on-surface dark:text-white', subtext: 'text-on-surface-variant dark:text-white/40' },
    { name: 'Pedidos', path: '/admin/pedidos', icon: ReceiptText, count: pedidos.length.toString(), color: 'bg-white dark:bg-[#111]', hover: 'hover:bg-gray-50 dark:hover:bg-[#1a1a1a]', text: 'text-on-surface dark:text-white', subtext: 'text-on-surface-variant dark:text-white/40' },
    { name: 'Clientes', path: '/admin/clientes', icon: Users, count: clientesCount.toString(), color: 'bg-white dark:bg-[#111]', hover: 'hover:bg-gray-50 dark:hover:bg-[#1a1a1a]', text: 'text-on-surface dark:text-white', subtext: 'text-on-surface-variant dark:text-white/40' },
  ];

  return (
    <div className="max-w-6xl mx-auto pt-2 pb-8 md:pt-4 md:pb-8 transition-colors duration-300">
      {/* Header */}
      <div className="mb-10 md:mb-16 mt-0 md:mt-4">
        <h2 className="text-sm tracking-[0.3em] text-tertiary dark:text-primary-container font-bold uppercase mb-2">Portal Administrativo</h2>
        <h1 className="text-4xl md:text-6xl font-headline-xl text-primary dark:text-white">
          Backstage.
        </h1>
        <p className="mt-6 text-on-surface-variant dark:text-white/50 text-lg md:text-xl max-w-2xl font-light leading-relaxed">
          Bienvenido al centro de operaciones de VINZ. Desde aquí controlas el flujo, la exhibición y las entregas de Sweet & Tasty.
        </p>
      </div>

      {/* Main Stats (Magazine Layout) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12 relative z-10">
        {/* Nueva Tarjeta de Rendimiento (Performance Analytics) */}
        <div className="lg:col-span-2 group relative flex w-full flex-col rounded-[1.5rem] bg-white dark:bg-slate-950 p-5 md:p-6 shadow-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-tertiary/30 dark:hover:shadow-[#C89F53]/20">
          <div className="absolute inset-0 rounded-[1.5rem] bg-gradient-to-r from-tertiary via-primary-container to-tertiary opacity-20 blur-md transition-opacity duration-300 group-hover:opacity-30" />
          <div className="absolute inset-[2px] rounded-[22px] bg-white dark:bg-slate-950" />
          <div className="relative h-full flex flex-col justify-between">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-tertiary to-primary-container shadow-lg">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white tracking-wide">
                    Rendimiento
                  </h3>
                  <div className="flex gap-2 mt-1">
                    <button 
                      onClick={() => setPeriodo('semanal')} 
                      className={`text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded-md transition-colors ${periodo === 'semanal' ? 'bg-tertiary text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700'}`}
                    >
                      Semanal
                    </button>
                    <button 
                      onClick={() => setPeriodo('mensual')} 
                      className={`text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded-md transition-colors ${periodo === 'mensual' ? 'bg-tertiary text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700'}`}
                    >
                      Mensual
                    </button>
                  </div>
                </div>
              </div>
              <span className="flex items-center gap-2 rounded-full bg-emerald-500/10 px-4 py-2 text-xs font-bold text-emerald-500 uppercase tracking-widest border border-emerald-500/20">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                Live
              </span>
            </div>
            
            <div className="mb-4 grid grid-cols-1 sm:grid-cols-3 gap-4 mt-auto">
              <div className="rounded-xl bg-slate-50 dark:bg-slate-900/60 p-4 border border-slate-200 dark:border-slate-800">
                <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Ingresos (L)</p>
                <p className="text-2xl md:text-3xl font-headline-lg font-bold text-slate-900 dark:text-white">{ingresosActuales.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
                <span className={`text-[10px] font-bold ${crecimiento >= 0 ? 'text-emerald-500' : 'text-red-500'} flex items-center gap-1 mt-1`}>
                  {crecimiento >= 0 ? '↑' : '↓'} {Math.abs(crecimiento).toFixed(1)}% vs ant.
                </span>
              </div>
              <div className="rounded-xl bg-slate-50 dark:bg-slate-900/60 p-4 border border-slate-200 dark:border-slate-800">
                <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Pedidos ({periodo})</p>
                <p className="text-2xl md:text-3xl font-headline-lg font-bold text-slate-900 dark:text-white">{pedidosActuales.length}</p>
                <span className="text-[10px] font-bold text-slate-500 mt-1 block">
                  En proceso
                </span>
              </div>
              <div className="rounded-xl bg-slate-50 dark:bg-slate-900/60 p-4 border border-slate-200 dark:border-slate-800">
                <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Ticket Promedio</p>
                <p className="text-2xl md:text-3xl font-headline-lg font-bold text-slate-900 dark:text-white">
                  {(pedidosActuales.length > 0 ? (ingresosActuales / pedidosActuales.length) : 0).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                </p>
                <span className="text-[10px] font-bold text-slate-500 mt-1 block">
                  Por pedido
                </span>
              </div>
            </div>
            
            <div className="mb-4 h-24 w-full overflow-hidden rounded-xl bg-slate-50 dark:bg-slate-900/60 p-4 border border-slate-200 dark:border-slate-800">
              <div className="flex h-full w-full items-end justify-center gap-4 sm:gap-6">
                <div className="h-[40%] w-8 sm:w-12 rounded-md bg-tertiary/20 dark:bg-[#C89F53]/20 relative overflow-hidden">
                  <div className="absolute bottom-0 w-full rounded-md bg-tertiary dark:bg-[#C89F53] transition-all duration-700" style={{ height: '60%' }} />
                </div>
                <div className="h-[60%] w-8 sm:w-12 rounded-md bg-tertiary/20 dark:bg-[#C89F53]/20 relative overflow-hidden">
                  <div className="absolute bottom-0 w-full rounded-md bg-tertiary dark:bg-[#C89F53] transition-all duration-700" style={{ height: '40%' }} />
                </div>
                <div className="h-[75%] w-8 sm:w-12 rounded-md bg-tertiary/20 dark:bg-[#C89F53]/20 relative overflow-hidden">
                  <div className="absolute bottom-0 w-full rounded-md bg-tertiary dark:bg-[#C89F53] transition-all duration-700" style={{ height: '80%' }} />
                </div>
                <div className="h-[45%] w-8 sm:w-12 rounded-md bg-tertiary/20 dark:bg-[#C89F53]/20 relative overflow-hidden">
                  <div className="absolute bottom-0 w-full rounded-md bg-tertiary dark:bg-[#C89F53] transition-all duration-700" style={{ height: '50%' }} />
                </div>
                <div className="h-[85%] w-8 sm:w-12 rounded-md bg-tertiary/20 dark:bg-[#C89F53]/20 relative overflow-hidden">
                  <div className="absolute bottom-0 w-full rounded-md bg-tertiary dark:bg-[#C89F53] transition-all duration-700" style={{ height: '90%' }} />
                </div>
                <div className="h-[65%] w-8 sm:w-12 rounded-md bg-tertiary/20 dark:bg-[#C89F53]/20 relative overflow-hidden">
                  <div className="absolute bottom-0 w-full rounded-md bg-tertiary dark:bg-[#C89F53] transition-all duration-700" style={{ height: '70%' }} />
                </div>
                <div className="h-[95%] w-8 sm:w-12 rounded-md bg-tertiary/20 dark:bg-[#C89F53]/20 relative overflow-hidden">
                  <div className="absolute bottom-0 w-full rounded-md bg-tertiary-container dark:bg-white transition-all duration-700 shadow-[0_0_10px_rgba(200,159,83,0.5)]" style={{ height: '85%' }} />
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                <span className="text-[10px] font-bold uppercase tracking-wider">Últimos {periodo === 'semanal' ? '7' : '30'} días</span>
              </div>
              <Link to="/admin/pedidos" className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-tertiary to-primary-container px-4 py-2 text-[10px] sm:text-xs font-bold text-white transition-all duration-300 hover:from-tertiary-container hover:to-primary hover:shadow-lg hover:shadow-[#C89F53]/30">
                Ver Detalles &rarr;
              </Link>
            </div>
          </div>
        </div>

        {/* Tarjeta Dorada */}
        <div className="lg:col-span-1 h-full bg-primary-container p-6 md:p-8 rounded-[1.5rem] relative overflow-hidden text-black group shadow-xl hover:shadow-2xl hover:-translate-y-1 border-2 border-white/20 dark:shadow-[0_0_40px_rgba(227,181,74,0.15)] dark:border-[#e3b54a]/30 transition-all flex flex-col justify-between">
          <div className="absolute -right-10 -bottom-10 opacity-10 rotate-12 scale-150 pointer-events-none">
            <ChefHat className="w-64 h-64" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-2 relative z-10">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <p className="text-black/60 uppercase tracking-widest text-[10px] font-bold">Producción & Despacho</p>
            </div>
            <h3 className="text-5xl md:text-6xl font-headline-xl text-black relative z-10 mt-4 mb-2">{pendingCount}</h3>
            <p className="text-sm font-semibold text-black/80 relative z-10 max-w-[200px]">Pedidos nuevos listos para procesar o en preparación.</p>
          </div>
          
          <div className="mt-6 flex flex-col sm:flex-row gap-3 relative z-10 w-full">
            <button 
              onClick={() => setIsProdModalOpen(true)}
              className="flex items-center justify-between w-full bg-tertiary text-white hover:bg-[#5a7a5a] dark:bg-tertiary dark:text-white px-6 py-4 rounded-xl text-sm font-bold transition-all hover:pr-4 group/btn shadow-lg"
            >
              <div className="flex items-center gap-3">
                <ChefHat className="w-5 h-5 text-white/90" />
                <span>Generar Resumen</span>
              </div>
              <ChevronRight className="w-5 h-5 opacity-50 group-hover/btn:opacity-100 group-hover/btn:translate-x-1 transition-all" />
            </button>
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
