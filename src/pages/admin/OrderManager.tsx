import { Package, Clock, CheckCircle } from 'lucide-react';

export function OrderManager() {
  const pedidos = [
    { id: '#ORD-001', cliente: 'Cafetería El Faro', total: 'L 1,250.00', estado: 'Pendiente', tiempo: 'hace 10 min' },
    { id: '#ORD-002', cliente: 'Hotel Plaza', total: 'L 3,400.00', estado: 'Pendiente', tiempo: 'hace 45 min' },
    { id: '#ORD-003', cliente: 'Restaurante Bella Vista', total: 'L 890.00', estado: 'En Ruta', tiempo: 'hace 2 horas' },
    { id: '#ORD-004', cliente: 'Mini Super Central', total: 'L 450.00', estado: 'Entregado', tiempo: 'Ayer' },
  ];

  return (
    <div className="max-w-5xl mx-auto py-8 mb-20 transition-colors duration-300">
      {/* Header */}
      <div className="mb-16 mt-8">
        <h2 className="text-sm tracking-[0.3em] text-tertiary dark:text-[#e3b54a] font-bold uppercase mb-2">Despacho</h2>
        <h1 className="text-5xl md:text-7xl font-headline-xl text-primary dark:text-white">Pedidos.</h1>
      </div>

      <div className="bg-white dark:bg-[#0f0f0f] border border-outline-variant/50 dark:border-white/5 rounded-3xl p-6 md:p-10 shadow-xl dark:shadow-2xl relative overflow-hidden transition-colors duration-300">
        {/* Decorative background */}
        <div className="absolute top-0 right-0 p-12 opacity-[0.03] dark:opacity-5 pointer-events-none">
          <Package className="w-96 h-96 text-primary dark:text-white" />
        </div>

        <div className="relative z-10">
          <div className="flex gap-4 mb-8 border-b border-outline-variant/50 dark:border-white/10 pb-4 overflow-x-auto hide-scrollbar">
            <button className="text-tertiary dark:text-[#e3b54a] border-b-2 border-tertiary dark:border-[#e3b54a] pb-2 font-bold px-4 whitespace-nowrap">Nuevos / Pendientes</button>
            <button className="text-on-surface-variant/50 hover:text-on-surface dark:text-white/40 dark:hover:text-white pb-2 font-bold px-4 transition-colors whitespace-nowrap">En Tránsito</button>
            <button className="text-on-surface-variant/50 hover:text-on-surface dark:text-white/40 dark:hover:text-white pb-2 font-bold px-4 transition-colors whitespace-nowrap">Historial</button>
          </div>

          <div className="space-y-4">
            {pedidos.map(pedido => (
              <div key={pedido.id} className="group flex flex-col md:flex-row md:items-center justify-between p-6 bg-surface dark:bg-[#1a1a1a] rounded-2xl border border-outline-variant/50 dark:border-white/5 hover:border-tertiary/40 dark:hover:border-[#e3b54a]/30 transition-colors shadow-sm hover:shadow-md dark:shadow-none">
                <div className="flex items-start gap-4 mb-4 md:mb-0">
                  <div className={`p-3 rounded-xl flex-shrink-0 ${pedido.estado === 'Pendiente' ? 'bg-primary-container/20 text-primary-container dark:bg-[#e3b54a]/10 dark:text-[#e3b54a]' : pedido.estado === 'En Ruta' ? 'bg-blue-100 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400' : 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400'}`}>
                    {pedido.estado === 'Pendiente' ? <Clock className="w-6 h-6" /> : pedido.estado === 'En Ruta' ? <Package className="w-6 h-6" /> : <CheckCircle className="w-6 h-6" />}
                  </div>
                  <div>
                    <h3 className="text-xl font-headline-lg text-on-surface dark:text-white group-hover:text-tertiary dark:group-hover:text-[#e3b54a] transition-colors">{pedido.cliente}</h3>
                    <div className="flex items-center gap-3 text-sm mt-1">
                      <span className="text-on-surface-variant/70 dark:text-white/40">{pedido.id}</span>
                      <span className="w-1 h-1 bg-outline-variant dark:bg-white/20 rounded-full"></span>
                      <span className="text-on-surface-variant/70 dark:text-white/40">{pedido.tiempo}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between md:justify-end gap-6">
                  <div className="text-right">
                    <p className="text-[10px] tracking-widest uppercase text-on-surface-variant/60 dark:text-white/40 font-bold mb-1">Total</p>
                    <p className="text-xl text-on-surface dark:text-white font-light">{pedido.total}</p>
                  </div>
                  <button className="px-6 py-2 bg-white dark:bg-white/5 hover:bg-tertiary hover:text-white dark:hover:bg-[#e3b54a] dark:hover:text-black text-tertiary dark:text-white font-bold rounded-full transition-all border border-outline-variant/50 dark:border-white/10 hover:border-transparent text-sm cursor-pointer shadow-sm dark:shadow-none hover:shadow-md">
                    Revisar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
