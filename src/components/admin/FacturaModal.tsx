import { X, Printer, CheckCircle } from 'lucide-react';

interface FacturaModalProps {
  isOpen: boolean;
  onClose: () => void;
  pedido: any;
}

export function FacturaModal({ isOpen, onClose, pedido }: FacturaModalProps) {
  const handlePrint = () => {
    const printContent = document.getElementById('factura-content');
    if (!printContent) return;

    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = 'none';
    document.body.appendChild(iframe);

    const iframeDoc = iframe.contentWindow?.document;
    if (!iframeDoc) return;

    const styleTags = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'))
      .map(node => node.outerHTML)
      .join('');

    iframeDoc.open();
    iframeDoc.write(`
      <html>
        <head>
          <title>Factura Pedido #${pedido.id.split('-')[0].toUpperCase()}</title>
          ${styleTags}
          <style>
            @media print {
              @page { margin: 0; }
              body { margin: 1.6cm; background: white !important; }
              /* Forzar impresión de colores en navegadores basados en webkit */
              * {
                -webkit-print-color-adjust: exact !important;
                color-adjust: exact !important;
                print-color-adjust: exact !important;
              }
            }
          </style>
        </head>
        <body class="bg-white text-black p-0 m-0">
          ${printContent.outerHTML}
        </body>
      </html>
    `);
    iframeDoc.close();

    setTimeout(() => {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
      setTimeout(() => {
        document.body.removeChild(iframe);
      }, 1000);
    }, 500);
  };

  if (!isOpen || !pedido) return null;

  const date = new Date(pedido.created_at).toLocaleDateString('es-HN', {
    year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
  });

  const subtotal = Number(pedido.total);
  const isv = subtotal * 0.15;
  const granTotal = subtotal + isv;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md transition-opacity">
      <div className="bg-surface dark:bg-[#111] w-full max-w-3xl max-h-[90vh] rounded-3xl shadow-2xl border border-outline-variant/30 dark:border-white/10 flex flex-col overflow-hidden relative">
        {/* Header no imprimible */}
        <div className="p-6 border-b border-outline-variant/30 dark:border-white/10 flex items-center justify-between bg-white dark:bg-[#151515]">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            <h2 className="text-xl font-bold text-on-surface dark:text-white">Factura Generada</h2>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-tertiary text-white dark:bg-[#e3b54a] dark:text-black font-bold rounded-xl hover:opacity-80 transition-opacity"
            >
              <Printer className="w-5 h-5" />
              Imprimir
            </button>
            <button 
              onClick={onClose}
              className="p-2 rounded-full hover:bg-outline-variant/20 dark:hover:bg-white/10 text-on-surface-variant dark:text-white/60 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Contenido Imprimible */}
        <div className="flex-1 overflow-y-auto p-8 bg-white dark:bg-white text-black" id="factura-content">
          <div className="max-w-2xl mx-auto space-y-8">
            {/* Cabecera Factura */}
            <div className="flex justify-between items-start border-b pb-6 border-gray-200">
              <div>
                <h1 className="text-4xl font-black text-[#e3b54a] mb-2 tracking-tighter">VINZ</h1>
                <p className="text-sm font-medium text-gray-500 uppercase tracking-widest">Distribuidora</p>
              </div>
              <div className="text-right">
                <h2 className="text-xl font-bold text-gray-800">FACTURA</h2>
                <p className="text-gray-500 text-sm">Pedido #{pedido.id.split('-')[0].toUpperCase()}</p>
                <p className="text-gray-500 text-sm">{date}</p>
              </div>
            </div>

            {/* Datos del Cliente */}
            <div className="grid grid-cols-2 gap-8">
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Facturado a:</p>
                <h3 className="text-lg font-bold text-gray-800">{pedido.cliente_nombre || 'Cliente Desconocido'}</h3>
              </div>
            </div>

            {/* Tabla de Productos */}
            <table className="w-full text-left text-sm mt-8">
              <thead className="bg-gray-50 border-b-2 border-gray-200">
                <tr>
                  <th className="p-3 text-gray-600 font-bold uppercase text-xs">Producto</th>
                  <th className="p-3 text-gray-600 font-bold uppercase text-xs text-center">Cant.</th>
                  <th className="p-3 text-gray-600 font-bold uppercase text-xs text-right">Precio Unit.</th>
                  <th className="p-3 text-gray-600 font-bold uppercase text-xs text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {pedido.detalles?.map((det: any) => {
                  const cant = Math.round(Number(det.cantidad));
                  const unitPrice = Number(det.subtotal) / cant;
                  return (
                    <tr key={det.id} className="text-gray-700">
                      <td className="p-3">
                        <p className="font-semibold">{det.producto_nombre}</p>
                        <p className="text-xs text-gray-400">{det.producto_sku}</p>
                      </td>
                      <td className="p-3 text-center font-bold">{cant}</td>
                      <td className="p-3 text-right">L {unitPrice.toFixed(2)}</td>
                      <td className="p-3 text-right font-bold text-gray-900">L {Number(det.subtotal).toFixed(2)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Totales */}
            <div className="flex justify-end pt-6">
              <div className="w-1/2">
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-500">Subtotal</span>
                  <span className="font-medium text-gray-700">L {subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-500">I.S.V. (15%)</span>
                  <span className="font-medium text-gray-700">L {isv.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center py-4">
                  <span className="text-lg font-bold text-gray-800 uppercase">Total a Pagar</span>
                  <span className="text-2xl font-black text-[#e3b54a]">L {granTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Notas y Pie */}
            <div className="border-t border-gray-200 pt-6 mt-8">
              {pedido.notas && (
                <div className="mb-6">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Notas del Pedido:</p>
                  <p className="text-sm text-gray-600 italic">{pedido.notas}</p>
                </div>
              )}
              <p className="text-center text-gray-400 text-xs font-medium">
                Gracias por su compra. ¡Esperamos verle pronto!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
