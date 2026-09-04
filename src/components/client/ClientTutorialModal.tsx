import { useState, useEffect } from 'react';
import { PartyPopper, ShoppingBag, ClipboardList, Settings, ChevronRight, ShoppingCart } from 'lucide-react';
import { useLockBodyScroll } from '../../hooks/useLockBodyScroll';

interface ClientTutorialModalProps {
  userName?: string;
  currentStep: number;
  onStepChange: (step: number) => void;
  onClose: () => void;
}

export function ClientTutorialModal({ userName, currentStep, onStepChange, onClose }: ClientTutorialModalProps) {
  const [isVisible, setIsVisible] = useState(false);
  useLockBodyScroll(true);

  // Efecto de aparición suave
  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300); // Esperar animación de salida
  };

  const steps = [
    {
      icon: <PartyPopper className="w-8 h-8 text-primary dark:text-[#e3b54a]" />,
      title: 'BIENVENIDO',
      headline: `Hola ${userName || ''}, empecemos por las funciones clave`,
      description: 'En 30 segundos te mostraré lo que Sweet & Tasty puede hacer por tu negocio. Toca para avanzar.',
      buttonText: 'Siguiente'
    },
    {
      icon: <ShoppingBag className="w-8 h-8 text-primary dark:text-[#e3b54a]" />,
      title: 'CATÁLOGO',
      headline: 'Explora nuestro menú exclusivo',
      description: 'Navega por nuestras categorías (Salados, Dulces, Bebidas) y agrega los productos que necesites a tu carrito de compras.',
      buttonText: 'Siguiente'
    },
    {
      icon: <ClipboardList className="w-8 h-8 text-primary dark:text-[#e3b54a]" />,
      title: 'MIS PEDIDOS',
      headline: 'Seguimiento en tiempo real',
      description: 'Dale seguimiento al estado de tus compras en tiempo real y revisa tu historial de facturación de forma fácil y transparente.',
      buttonText: 'Siguiente'
    },
    {
      icon: <ShoppingCart className="w-8 h-8 text-primary dark:text-[#e3b54a]" />,
      title: 'CARRITO',
      headline: 'Gestiona tu carrito de compras',
      description: 'Revisa los productos que has seleccionado, ajusta las cantidades y confirma tu carrito cuando estés listo.',
      buttonText: 'Siguiente'
    },
    {
      icon: <Settings className="w-8 h-8 text-primary dark:text-[#e3b54a]" />,
      title: 'CONFIGURACIÓN',
      headline: 'Mantén tus datos al día',
      description: 'Actualiza tu información de contacto y detalles de entrega en cualquier momento desde tu panel de configuración.',
      buttonText: 'Comenzar'
    }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      onStepChange(currentStep + 1);
    } else {
      handleClose();
    }
  };

  const currentData = steps[currentStep];

  return (
    <div className={`fixed inset-0 z-[100] flex p-4 transition-all duration-300 ${
      currentStep > 0 ? 'items-end pb-24 md:items-center md:pl-32' : 'items-center justify-center'
    } ${isVisible ? 'bg-black/60 backdrop-blur-sm' : 'bg-transparent backdrop-blur-none'}`}>
      <div 
        className={`bg-surface dark:bg-[#0f0f0f] w-full max-w-sm rounded-3xl p-6 shadow-2xl border border-outline-variant/30 dark:border-white/10 relative transition-all duration-300 transform ${
          currentStep > 0 ? 'md:ml-12 mx-auto md:mx-0' : 'mx-auto'
        } ${isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-95'}`}
      >
        {/* Paginación Dots */}
        <div className="flex justify-center gap-1.5 mb-6">
          {steps.map((_, index) => (
            <div 
              key={index} 
              className={`h-1 rounded-full transition-all duration-300 ${
                index === currentStep 
                  ? 'w-6 bg-primary dark:bg-[#e3b54a]' 
                  : 'w-1.5 bg-outline-variant/30 dark:bg-white/20'
              }`}
            />
          ))}
        </div>

        {/* Content */}
        <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-right-4 duration-300" key={currentStep}>
          <div className="w-16 h-16 rounded-full bg-primary/10 dark:bg-[#e3b54a]/10 flex items-center justify-center mb-2 shadow-inner">
            {currentData.icon}
          </div>
          
          <div>
            <span className="text-[10px] font-bold tracking-widest text-primary dark:text-[#e3b54a] uppercase block mb-1">
              {currentData.title}
            </span>
            <h2 className="text-xl font-bold text-on-surface dark:text-white leading-tight mb-3">
              {currentData.headline}
            </h2>
            <p className="text-sm text-on-surface-variant dark:text-white/70 leading-relaxed">
              {currentData.description}
            </p>
          </div>
        </div>

        {/* Botones */}
        <div className="flex items-center justify-between gap-4 mt-8">
          <button 
            onClick={handleClose}
            className="text-sm font-bold text-on-surface-variant dark:text-white/50 hover:text-on-surface dark:hover:text-white transition-colors"
          >
            Saltar
          </button>
          
          <button 
            onClick={handleNext}
            className="flex items-center gap-2 bg-primary dark:bg-[#e3b54a] text-white dark:text-black px-6 py-3 rounded-2xl font-bold text-sm shadow-lg hover:opacity-90 hover:scale-[1.02] active:scale-95 transition-all"
          >
            {currentData.buttonText}
            {currentStep < steps.length - 1 && <ChevronRight className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}
