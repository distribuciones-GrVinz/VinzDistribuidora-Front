import { Check, X } from 'lucide-react';

interface PasswordStrengthMeterProps {
  password: string;
}

export function PasswordStrengthMeter({ password }: PasswordStrengthMeterProps) {
  const requirements = [
    { regex: /.{8,}/, text: "Al menos 8 caracteres" },
    { regex: /[A-Z]/, text: "Al menos una letra mayúscula" },
    { regex: /[a-z]/, text: "Al menos una letra minúscula" },
    { regex: /[0-9]/, text: "Al menos un número" },
  ];

  const getStrength = () => {
    let strength = 0;
    requirements.forEach(req => {
      if (req.regex.test(password)) strength++;
    });
    return strength;
  };

  const strength = getStrength();

  const getBarColor = () => {
    if (strength === 0) return 'bg-gray-200';
    if (strength === 1) return 'bg-red-500';
    if (strength === 2) return 'bg-orange-500';
    if (strength === 3) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getMessage = () => {
    if (password.length === 0) return 'Esperando...';
    if (strength === 1) return 'Muy débil';
    if (strength === 2) return 'Débil';
    if (strength === 3) return 'Buena';
    return 'Fuerte y Segura';
  };

  return (
    <div className="mt-2 space-y-2 bg-white/50 dark:bg-black/20 p-2 rounded-lg border border-gray-200/50 dark:border-gray-700/50">
      <div className="flex justify-between items-center text-xs px-1">
        <span className="font-medium text-gray-600 dark:text-gray-400">Fuerza:</span>
        <span className={`font-bold transition-colors ${strength === 4 ? 'text-green-500' : 'text-gray-500'}`}>{getMessage()}</span>
      </div>
      
      <div className="flex gap-1 h-1.5 px-1">
        {[1, 2, 3, 4].map((index) => (
          <div 
            key={index} 
            className={`flex-1 rounded-full transition-all duration-300 ${strength >= index ? getBarColor() : 'bg-gray-200 dark:bg-gray-700'}`}
          />
        ))}
      </div>

      <div className="grid grid-cols-2 gap-x-2 gap-y-1.5 mt-2 px-1">
        {requirements.map((req, index) => {
          const isMet = req.regex.test(password);
          return (
            <div key={index} className={`flex items-center gap-1.5 text-[10px] transition-colors ${isMet ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-500'}`}>
              {isMet ? <Check className="w-3.5 h-3.5 shrink-0" /> : <X className="w-3.5 h-3.5 shrink-0 opacity-50" />}
              <span className="leading-tight">{req.text}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
