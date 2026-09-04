interface SkeletonProps {
  className?: string;
}

/**
 * Componente base Skeleton
 */
export function Skeleton({ className = "" }: SkeletonProps) {
  return (
    <div 
      className={`animate-pulse bg-gray-200 dark:bg-[#1a1a1a] rounded-md ${className}`} 
    />
  );
}

/**
 * Skeleton para tarjetas de productos (Catálogo)
 */
export function ProductCardSkeleton() {
  return (
    <div className="bg-surface dark:bg-[#0f0f0f] border border-outline-variant/30 dark:border-white/10 rounded-2xl overflow-hidden flex flex-col h-full shadow-sm">
      {/* Imagen */}
      <Skeleton className="w-full h-48 md:h-56 rounded-none" />
      
      {/* Contenido */}
      <div className="p-4 md:p-5 flex-1 flex flex-col">
        {/* Categoría */}
        <Skeleton className="w-20 h-4 rounded-full mb-3" />
        
        {/* Título */}
        <Skeleton className="w-3/4 h-6 mb-2" />
        
        {/* Descripción */}
        <Skeleton className="w-full h-3 mb-1.5" />
        <Skeleton className="w-5/6 h-3 mb-4" />
        
        {/* Precio y Botón (Abajo) */}
        <div className="mt-auto flex items-center justify-between pt-4 border-t border-outline-variant/10 dark:border-white/10">
          <Skeleton className="w-24 h-7" />
          <Skeleton className="w-10 h-10 rounded-full" />
        </div>
      </div>
    </div>
  );
}

/**
 * Skeleton para filas de tablas (Gestión de Clientes, Pedidos)
 */
export function TableSkeleton({ columns = 5, rows = 5 }: { columns?: number, rows?: number }) {
  return (
    <div className="w-full overflow-hidden">
      <div className="w-full">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="flex items-center border-b border-outline-variant/10 dark:border-white/5 py-4">
            {Array.from({ length: columns }).map((_, colIndex) => (
              <div 
                key={colIndex} 
                className={`px-4 ${colIndex === 0 ? 'w-1/3' : 'flex-1'}`}
              >
                <Skeleton 
                  className={`h-5 ${
                    colIndex === 0 ? 'w-3/4' : 
                    colIndex === columns - 1 ? 'w-10 ml-auto' : 'w-1/2'
                  }`} 
                />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
