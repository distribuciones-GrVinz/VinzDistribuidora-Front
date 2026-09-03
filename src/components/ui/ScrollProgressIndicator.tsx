import type { RefObject } from 'react';
import { useScrollProgress } from '../../hooks/useScrollProgress';

interface ScrollProgressIndicatorProps {
  targetRef: RefObject<HTMLElement | null>;
  className?: string; // Para posicionamiento adicional si se desea
}

export function ScrollProgressIndicator({ targetRef, className = "bottom-6 right-6 lg:bottom-10 lg:right-10" }: ScrollProgressIndicatorProps) {
  const { progress, canScroll } = useScrollProgress(targetRef);

  // Si no hay scroll o ya llegó al 100%, lo ocultamos para no estorbar
  // Pero mantenemos un pequeño umbral por errores de float (ej. 99.5%)
  const isVisible = canScroll && progress < 98;

  return (
    <div 
      className={`absolute pointer-events-none z-50 transition-opacity duration-300 ${className}`} 
      style={{ opacity: isVisible ? 1 : 0 }}
    >
      <div className="bg-surface dark:bg-black rounded-full shadow-lg border border-outline-variant/30 dark:border-white/10 p-1 flex items-center justify-center backdrop-blur-md">
        <svg className="w-10 h-10 transform -rotate-90">
          <circle 
            className="text-outline-variant/20 dark:text-white/5" 
            strokeWidth="3" 
            stroke="currentColor" 
            fill="transparent" 
            r="16" 
            cx="20" 
            cy="20" 
          />
          <circle 
            className="text-tertiary dark:text-[#e3b54a] transition-all duration-150" 
            strokeWidth="3" 
            strokeDasharray={16 * 2 * Math.PI} 
            strokeDashoffset={16 * 2 * Math.PI - (progress / 100) * 16 * 2 * Math.PI} 
            strokeLinecap="round" 
            stroke="currentColor" 
            fill="transparent" 
            r="16" 
            cx="20" 
            cy="20" 
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center text-tertiary dark:text-[#e3b54a]">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <path d="m6 9 6 6 6-6"/>
          </svg>
        </div>
      </div>
    </div>
  );
}
