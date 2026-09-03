import { useState, useMemo, useRef } from 'react';
import { X, Plus, Minus, Copy, Check, Search, PlusCircle, Trash2, FileDown, ChevronDown } from 'lucide-react';
import { useNotification } from '../../context/NotificationContext';
import { useLockBodyScroll } from '../../hooks/useLockBodyScroll';
import { ScrollProgressIndicator } from '../ui/ScrollProgressIndicator';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface Producto {
  id: string;
  nombre: string;
  precio_unitario: string;
}

interface QuoteItem {
  id: string; // Unique ID (could be product ID or a random string for custom items)
  nombre: string;
  precio_unitario: number;
  cantidad: number;
  isCustom: boolean;
}

interface QuoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  productos: Producto[];
}

export function QuoteModal({ isOpen, onClose, productos }: QuoteModalProps) {
  useLockBodyScroll(isOpen);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { showNotification } = useNotification();
  const [items, setItems] = useState<QuoteItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Custom item state
  const [customName, setCustomName] = useState('');
  const [customPrice, setCustomPrice] = useState('');

  const [copied, setCopied] = useState(false);

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Filtered products for the search
  const filteredProducts = useMemo(() => {
    if (!searchTerm.trim()) return productos;
    return productos.filter(p => p.nombre.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [searchTerm, productos]);

  const total = items.reduce((acc, item) => acc + (item.precio_unitario * item.cantidad), 0);

  const addItem = (prod: Producto) => {
    setItems(prev => {
      const existing = prev.find(i => i.id === prod.id);
      if (existing) {
        return prev.map(i => i.id === prod.id ? { ...i, cantidad: i.cantidad + 1 } : i);
      }
      return [...prev, {
        id: prod.id,
        nombre: prod.nombre,
        precio_unitario: parseFloat(prod.precio_unitario),
        cantidad: 1,
        isCustom: false
      }];
    });
    setSearchTerm('');
  };

  const addCustomItem = () => {
    if (!customName.trim() || !customPrice || isNaN(parseFloat(customPrice))) {
      showNotification('error', 'Por favor ingresa un nombre y precio válido');
      return;
    }
    setItems(prev => [...prev, {
      id: `custom-${Date.now()}`,
      nombre: customName,
      precio_unitario: parseFloat(customPrice),
      cantidad: 1,
      isCustom: true
    }]);
    setCustomName('');
    setCustomPrice('');
  };

  const updateItemQty = (id: string, delta: number) => {
    setItems(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = Math.max(1, item.cantidad + delta);
        return { ...item, cantidad: newQty };
      }
      return item;
    }));
  };

  const updateItemPrice = (id: string, newPrice: string) => {
    const parsed = parseFloat(newPrice);
    if (isNaN(parsed)) return;
    setItems(prev => prev.map(item => item.id === id ? { ...item, precio_unitario: parsed } : item));
  };

  const removeItem = (id: string) => {
    setItems(prev => prev.filter(i => i.id !== id));
  };

  const copyToClipboard = () => {
    if (items.length === 0) return;
    
    let text = `*✨ COTIZACIÓN - SWEET & TASTY ✨*\n\n`;
    text += `Aquí tienes el detalle de tu solicitud:\n\n`;
    
    items.forEach(item => {
      const subtotal = item.precio_unitario * item.cantidad;
      text += `▪️ *${item.cantidad}x* ${item.nombre}\n`;
      text += `   ↳ L ${item.precio_unitario.toFixed(2)} c/u = *L ${subtotal.toFixed(2)}*\n`;
    });
    
    text += `\n*TOTAL: L ${total.toFixed(2)}*\n\n`;
    text += `_Precios sujetos a confirmación._\n`;
    text += `¡Gracias por tu preferencia! 🤎`;

    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      showNotification('success', 'Cotización copiada al portapapeles');
      setTimeout(() => setCopied(false), 3000);
    }).catch(err => {
      console.error('Error al copiar:', err);
      showNotification('error', 'No se pudo copiar el texto');
    });
  };

  const handleDownloadPDF = async () => {
    if (items.length === 0) return;
    
    const doc = new jsPDF();
    
    // 1. Intentar cargar el logo
    try {
      const response = await fetch('/sweet_logo.jpg');
      const blob = await response.blob();
      const reader = new FileReader();
      const base64data = await new Promise<string>((resolve) => {
        reader.readAsDataURL(blob);
        reader.onloadend = () => resolve(reader.result as string);
      });
      // Imagen en la esquina superior izquierda
      doc.addImage(base64data, 'JPEG', 14, 12, 28, 28);
    } catch (e) {
      console.warn("No se pudo cargar el logo para el PDF", e);
    }
    
    // 2. Título / Membrete Corporativo
    doc.setFontSize(26);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(30, 30, 30); // Gris oscuro casi negro
    doc.text("VINZ DISTRIBUIDORA", 48, 24);
    
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(120, 120, 120); // Gris medio
    doc.text("COTIZACIÓN DE PRODUCTOS", 48, 32);
    
    // 3. Línea separadora dorada
    doc.setDrawColor(200, 159, 83); // #C89F53
    doc.setLineWidth(0.5);
    doc.line(14, 45, 196, 45);
    
    // 4. Fecha y No. Cotización
    doc.setFontSize(10);
    doc.setTextColor(80, 80, 80);
    const date = new Date().toLocaleDateString('es-HN', {
      year: 'numeric', month: 'long', day: 'numeric'
    });
    doc.text(`Fecha de emisión: ${date}`, 14, 55);
    doc.text(`Cotización #: VZ-${new Date().getTime().toString().slice(-6)}`, 14, 61);
    
    // Preparar datos para la tabla
    const tableColumn = ["Producto", "Cant.", "P. Unitario", "Subtotal"];
    const tableRows: any[] = [];
    
    items.forEach(item => {
      const subtotal = (item.cantidad * item.precio_unitario).toFixed(2);
      const rowData = [
        item.nombre,
        item.cantidad.toString(),
        `L ${item.precio_unitario.toFixed(2)}`,
        `L ${subtotal}`
      ];
      tableRows.push(rowData);
    });
    
    // 5. Generar tabla con diseño elegante
    autoTable(doc, {
      startY: 70,
      head: [tableColumn],
      body: tableRows,
      theme: 'striped',
      headStyles: { 
        fillColor: [200, 159, 83], // Color dorado #C89F53
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 10
      },
      alternateRowStyles: {
        fillColor: [252, 250, 247] // Un tono crema muy sutil
      },
      styles: { 
        fontSize: 10, 
        cellPadding: 5,
        textColor: [60, 60, 60] // Texto gris oscuro
      },
      columnStyles: {
        0: { cellWidth: 90, fontStyle: 'bold' }, // Producto destacado
        1: { halign: 'center' }, // Cantidad centrada
        2: { halign: 'right' }, // Precio a la derecha
        3: { halign: 'right', fontStyle: 'bold', textColor: [30, 30, 30] }  // Subtotal destacado
      }
    });
    
    // @ts-ignore
    const finalY = doc.lastAutoTable.finalY || 70;
    
    // 6. Caja de Total
    doc.setFillColor(245, 245, 245);
    doc.rect(126, finalY + 10, 70, 12, 'F'); // Rectángulo de fondo para el total
    
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(30, 30, 30);
    doc.text(`TOTAL: L ${total.toFixed(2)}`, 192, finalY + 18, { align: "right" });
    
    // 7. Pie de página formal
    doc.setFontSize(9);
    doc.setFont("helvetica", "italic");
    doc.setTextColor(150, 150, 150);
    doc.text("Precios sujetos a cambio. Documento generado automáticamente.", 105, finalY + 40, { align: "center" });
    doc.text("¡Gracias por su preferencia!", 105, finalY + 45, { align: "center" });
    
    // Descargar
    doc.save(`Cotizacion_Vinz_${new Date().getTime()}.pdf`);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative bg-surface dark:bg-slate-900 w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden border border-outline-variant/50 dark:border-white/10">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-outline-variant/30 dark:border-white/10 bg-white/50 dark:bg-black/20">
          <div>
            <h2 className="text-2xl font-headline-lg font-bold text-primary dark:text-white">Generar Cotización</h2>
            <p className="text-xs text-on-surface-variant dark:text-white/50 mt-1">Busca productos o agrega ítems manualmente</p>
          </div>
          <button onClick={onClose} className="p-2 bg-white dark:bg-black rounded-full shadow-sm hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <X className="w-5 h-5 text-on-surface dark:text-white" />
          </button>
        </div>

        {/* Body */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-8 relative scroll-smooth">
          
          {/* Add Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Search DB Products */}
            <div className="relative">
              <label className="block text-xs font-bold uppercase tracking-wider text-tertiary dark:text-[#C89F53] mb-2">Buscar Producto</label>
              <div className="relative">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Ej. Pastel de chocolate..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setIsDropdownOpen(true);
                  }}
                  onFocus={() => setIsDropdownOpen(true)}
                  onBlur={() => setTimeout(() => setIsDropdownOpen(false), 200)}
                  className="w-full bg-white dark:bg-black border border-outline-variant/50 dark:border-white/10 rounded-xl py-2 pl-9 pr-10 text-sm text-on-surface dark:text-white focus:border-primary focus:outline-none"
                />
                <button 
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="absolute right-2 top-1.5 p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400"
                >
                  <ChevronDown className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
              </div>
              {isDropdownOpen && filteredProducts.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white dark:bg-slate-800 border border-outline-variant/50 dark:border-white/10 rounded-xl shadow-xl overflow-hidden max-h-48 overflow-y-auto">
                  {filteredProducts.map(prod => (
                    <div 
                      key={prod.id} 
                      className="p-3 hover:bg-primary-container/10 dark:hover:bg-white/5 cursor-pointer flex justify-between items-center transition-colors border-b border-gray-100 dark:border-gray-700/50 last:border-0"
                      onClick={() => {
                        addItem(prod);
                        setIsDropdownOpen(false);
                      }}
                    >
                      <span className="text-sm font-medium dark:text-white truncate pr-2">{prod.nombre}</span>
                      <span className="text-xs font-bold text-tertiary dark:text-[#C89F53] whitespace-nowrap">L {prod.precio_unitario}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Custom Item */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-tertiary dark:text-[#C89F53] mb-2">Ítem Manual</label>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="Descripción"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="flex-1 bg-white dark:bg-black border border-outline-variant/50 dark:border-white/10 rounded-xl py-2 px-3 text-sm text-on-surface dark:text-white focus:border-primary focus:outline-none min-w-0"
                />
                <input 
                  type="number" 
                  placeholder="Precio"
                  value={customPrice}
                  onChange={(e) => setCustomPrice(e.target.value)}
                  className="w-24 bg-white dark:bg-black border border-outline-variant/50 dark:border-white/10 rounded-xl py-2 px-3 text-sm text-on-surface dark:text-white focus:border-primary focus:outline-none"
                />
                <button 
                  onClick={addCustomItem}
                  className="p-2 bg-primary-container dark:bg-[#C89F53] text-white dark:text-black rounded-xl hover:opacity-90 transition-opacity"
                >
                  <PlusCircle className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Quote Items List */}
          <div>
            <h3 className="text-sm font-bold border-b border-outline-variant/50 dark:border-white/10 pb-2 mb-4 dark:text-white">Detalle de Cotización</h3>
            {items.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 dark:bg-white/5 rounded-xl border border-dashed border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-400">Aún no hay ítems en la cotización.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {items.map(item => (
                  <div key={item.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-3 bg-white dark:bg-black border border-outline-variant/50 dark:border-white/10 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                    
                    <div className="flex-1">
                      <p className="text-sm font-bold dark:text-white">{item.nombre} {item.isCustom && <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded ml-1 uppercase">Custom</span>}</p>
                      
                      {/* Price editor */}
                      <div className="flex items-center gap-1 mt-1">
                        <span className="text-xs text-gray-500">L</span>
                        <input 
                          type="number" 
                          value={item.precio_unitario} 
                          onChange={(e) => updateItemPrice(item.id, e.target.value)}
                          className="text-xs font-medium bg-transparent border-b border-gray-300 dark:border-gray-700 w-16 focus:outline-none focus:border-primary dark:text-gray-300 px-0.5 py-0.5"
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-4 justify-end">
                      <div className="flex items-center gap-2 bg-gray-50 dark:bg-white/5 rounded-lg p-1 border border-gray-200 dark:border-gray-700">
                        <button onClick={() => updateItemQty(item.id, -1)} className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded text-gray-600 dark:text-gray-300 transition-colors">
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-bold w-4 text-center dark:text-white">{item.cantidad}</span>
                        <button onClick={() => updateItemQty(item.id, 1)} className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded text-gray-600 dark:text-gray-300 transition-colors">
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      
                      <div className="text-sm font-bold text-tertiary dark:text-[#C89F53] w-20 text-right">
                        L {(item.precio_unitario * item.cantidad).toFixed(2)}
                      </div>

                      <button onClick={() => removeItem(item.id)} className="p-1.5 text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                  </div>
                ))}
              </div>
            )}
          </div>
          
        </div>

        <div className="p-6 border-t border-outline-variant/30 dark:border-white/10 bg-white dark:bg-slate-900 flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Total Estimado</p>
            <p className="text-3xl font-headline-lg font-bold text-primary dark:text-white">L {total.toFixed(2)}</p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={handleDownloadPDF}
              disabled={items.length === 0}
              className={`flex items-center gap-2 px-5 py-3 rounded-full font-bold text-sm transition-all ${
                items.length === 0 
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed dark:bg-gray-800' 
                  : 'bg-white dark:bg-black border border-outline-variant/30 text-tertiary dark:text-[#e3b54a] shadow-md hover:-translate-y-0.5 hover:bg-gray-50'
              }`}
            >
              <FileDown className="w-4 h-4" />
              Descargar PDF
            </button>
            <button 
              onClick={copyToClipboard}
              disabled={items.length === 0}
              className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold text-sm transition-all ${
                items.length === 0 
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed dark:bg-gray-800' 
                  : copied 
                    ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' 
                    : 'bg-primary-container text-white dark:text-black shadow-xl hover:-translate-y-0.5'
              }`}
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? '¡Copiado!' : 'Copiar Whatsapp'}
            </button>
          </div>
        </div>

        {/* Scroll Indicator */}
        <ScrollProgressIndicator targetRef={scrollRef} />

      </div>
    </div>
  );
}
