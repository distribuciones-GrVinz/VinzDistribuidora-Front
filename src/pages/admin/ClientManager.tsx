import { Mail, Phone, MoreVertical } from 'lucide-react';

export function ClientManager() {
  const clientes = [
    { id: 'C-001', nombre: 'Cafetería El Faro', contacto: 'María Fernández', email: 'contacto@elfaro.com', telefono: '+504 9988-7766', compras: 45, estado: 'Activo' },
    { id: 'C-002', nombre: 'Hotel Plaza', contacto: 'Carlos Ruiz', email: 'compras@hotelplaza.hn', telefono: '+504 8877-6655', compras: 112, estado: 'VIP' },
    { id: 'C-003', nombre: 'Restaurante Bella Vista', contacto: 'Ana Martínez', email: 'ana@bellavista.com', telefono: '+504 9911-2233', compras: 23, estado: 'Activo' },
    { id: 'C-004', nombre: 'Mini Super Central', contacto: 'José López', email: 'jose.lopez@gmail.com', telefono: '+504 3322-1100', compras: 8, estado: 'Inactivo' },
  ];

  return (
    <div className="max-w-6xl mx-auto py-8 mb-20 transition-colors duration-300 relative z-10">
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
            <button className="flex-1 md:flex-none px-6 py-3 bg-primary-container dark:bg-[#e3b54a] text-white dark:text-black rounded-full text-sm font-bold shadow-md hover:-translate-y-0.5 transition-transform">
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
              {clientes.map((cliente) => (
                <tr key={cliente.id} className="hover:bg-surface/80 dark:hover:bg-[#1a1a1a] transition-colors group">
                  <td className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-primary-container/10 dark:bg-white/5 flex items-center justify-center text-tertiary dark:text-[#e3b54a] font-headline-lg text-xl">
                        {cliente.nombre.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-on-surface dark:text-white text-lg group-hover:text-tertiary dark:group-hover:text-[#e3b54a] transition-colors">{cliente.nombre}</p>
                        <p className="text-sm text-on-surface-variant/70 dark:text-white/40">{cliente.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-6 hidden md:table-cell">
                    <p className="font-semibold text-on-surface dark:text-white mb-1">{cliente.contacto}</p>
                    <div className="flex flex-col gap-1 text-xs text-on-surface-variant/70 dark:text-white/40">
                      <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {cliente.email}</span>
                      <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {cliente.telefono}</span>
                    </div>
                  </td>
                  <td className="p-6">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase border ${
                      cliente.estado === 'VIP' 
                        ? 'bg-primary-container/20 text-primary border-primary-container/30 dark:bg-[#e3b54a]/10 dark:text-[#e3b54a] dark:border-[#e3b54a]/20' 
                        : cliente.estado === 'Activo'
                          ? 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20'
                          : 'bg-gray-100 text-gray-500 border-gray-200 dark:bg-white/5 dark:text-white/40 dark:border-white/10'
                    }`}>
                      {cliente.estado}
                    </span>
                  </td>
                  <td className="p-6 text-center">
                    <span className="text-xl font-light text-on-surface dark:text-white">{cliente.compras}</span>
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
    </div>
  );
}
