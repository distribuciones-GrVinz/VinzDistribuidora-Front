import { useState, useEffect } from 'react';
import { X, Printer, CheckCircle } from 'lucide-react';
import { useLockBodyScroll } from '../../hooks/useLockBodyScroll';
import { getSARConfig } from '../../services/adminService';

interface FacturaModalProps {
  isOpen: boolean;
  onClose: () => void;
  pedido: any;
}

export function FacturaModal({ isOpen, onClose, pedido }: FacturaModalProps) {
  useLockBodyScroll(isOpen);
  const [sarConfig, setSarConfig] = useState<any>(null);
  
  // Editable fields for the invoice (Client)
  const [clienteNombre, setClienteNombre] = useState('');
  const [clienteDireccion, setClienteDireccion] = useState('');
  const [clienteRTN, setClienteRTN] = useState('');

  // Editable fields for the invoice (Company)
  const [empresaNombre, setEmpresaNombre] = useState('Sweet & Tasty');
  const [empresaDireccion, setEmpresaDireccion] = useState('');
  const [empresaTelefono, setEmpresaTelefono] = useState('');
  const [empresaEmail, setEmpresaEmail] = useState('');
  const [empresaRTN, setEmpresaRTN] = useState('');

  // Payment condition
  const [condicionPago, setCondicionPago] = useState('CONTADO');
  
  // Editable Invoice Number
  const [numeroFiscalLocal, setNumeroFiscalLocal] = useState('');

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      if (pedido) {
        setClienteNombre(pedido.cliente_nombre || '');
        setClienteDireccion('');
        setClienteRTN('');
        setCondicionPago('CONTADO'); // Default
        
        const loadSAR = async () => {
          try {
            const config = await getSARConfig();
            setSarConfig(config);
            if (config) {
              setEmpresaNombre(config.razon_social || 'Sweet & Tasty');
              setEmpresaDireccion(config.direccion || '');
              setEmpresaTelefono(config.telefono || '');
              setEmpresaEmail(config.correo || '');
              setEmpresaRTN(config.rtn || '');
              
              const numFiscal = pedido?.factura_fiscal || `${config.prefijo_factura}${config.correlativo_actual.toString().padStart(8, '0')}`;
              setNumeroFiscalLocal(numFiscal);
            }
          } catch (error) {
            console.error("Error al cargar SAR Config:", error);
          }
        };
        loadSAR();
      }
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, pedido]);

  const handlePrint = () => {
    const printContent = document.getElementById('factura-content');
    if (!printContent) return;

    // Update editable elements to their values for printing
    const inputs = printContent.querySelectorAll('input[type="text"]');
    inputs.forEach(input => {
      (input as HTMLInputElement).setAttribute('value', (input as HTMLInputElement).value);
    });

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
              @page { margin: 0; size: letter portrait; }
              body { margin: 0.5cm; background: white !important; font-family: 'Inter', sans-serif; }
              * {
                -webkit-print-color-adjust: exact !important;
                color-adjust: exact !important;
                print-color-adjust: exact !important;
              }
              .watermark { 
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%) rotate(-45deg);
                font-size: 32px;
                font-weight: 900;
                color: rgba(227, 181, 74, 0.15) !important;
                text-transform: uppercase;
                letter-spacing: 4px;
                z-index: -1;
                pointer-events: none;
                white-space: nowrap;
              }
              input[type="text"], textarea { 
                border: none !important; 
                background: transparent !important;
                padding: 0 !important;
                margin: 0 !important;
                color: black !important;
                font-family: inherit;
                width: 100%;
                resize: none;
              }
              textarea {
                overflow: hidden;
              }
              input:focus, textarea:focus { outline: none !important; }
              /* Hide elements only meant for the screen */
              .print-hidden { display: none !important; }
              /* Strip shadow and rounding for clean print, reset forced widths */
              #factura-content {
                box-shadow: none !important;
                border-radius: 0 !important;
                width: 100% !important;
                max-width: 100% !important;
                min-width: 0 !important;
                padding: 0 !important;
                margin: 0 !important;
                background: transparent !important;
              }
            }
          </style>
        </head>
        <body class="bg-white text-black p-0 m-0 relative">
          <div style="padding: 1cm 1.5cm 1cm 1.5cm; position: relative; z-index: 1;">
            <div class="watermark">ORIGINAL: CLIENTE</div>
            ${printContent.outerHTML}
          </div>
          <div class="page-break"></div>
          <div style="padding: 1cm 1.5cm 1cm 1.5cm; position: relative; z-index: 1;">
            <div class="watermark">COPIA: EMISOR</div>
            ${printContent.outerHTML}
          </div>
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

  const dateObj = new Date(pedido.created_at);
  const dia = dateObj.getDate().toString().padStart(2, '0');
  const mes = (dateObj.getMonth() + 1).toString().padStart(2, '0');
  const ano = dateObj.getFullYear().toString();

  // Financial calculations
  let importeExento = 0;
  let importeGravado15 = 0;
  let isv15 = 0;

  pedido.detalles?.forEach((det: any) => {
    const sub = Number(det.subtotal);
    if (det.producto?.exento_isv) {
      importeExento += sub;
    } else {
      importeGravado15 += sub;
    }
  });

  isv15 = importeGravado15 * 0.15;
  const granTotal = importeExento + importeGravado15 + isv15;

  const getRango = (num: number) => {
    return sarConfig ? `${sarConfig.prefijo_factura}${num.toString().padStart(8, '0')}` : '';
  };

  const limiteEmision = sarConfig?.fecha_limite_emision ? new Date(sarConfig.fecha_limite_emision).toLocaleDateString('es-HN', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '';

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md transition-opacity">
      <div className="bg-surface dark:bg-[#111] w-full max-w-4xl max-h-[95vh] rounded-3xl shadow-2xl border border-outline-variant/30 dark:border-white/10 flex flex-col overflow-hidden relative">
        {/* Header no imprimible */}
        <div className="p-4 border-b border-outline-variant/30 dark:border-white/10 flex items-center justify-between bg-white dark:bg-[#151515]">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-6 h-6 text-[#e3b54a]" />
            <h2 className="text-xl font-bold text-on-surface dark:text-white">Impresión de Factura SAR</h2>
          </div>
          <div className="flex gap-3">
            {/* Controles de interfaz */}
            <div className="flex items-center gap-2 bg-gray-100 dark:bg-black/40 px-3 py-1 rounded-lg">
              <span className="text-sm font-bold dark:text-white">Pago:</span>
              <select 
                value={condicionPago} 
                onChange={(e) => setCondicionPago(e.target.value)}
                className="bg-transparent border-none focus:ring-0 text-sm cursor-pointer font-medium text-[#e3b54a]"
              >
                <option value="CONTADO">CONTADO</option>
                <option value="CRÉDITO">CRÉDITO</option>
              </select>
            </div>

            <button 
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-tertiary text-white dark:bg-[#e3b54a] dark:text-black font-bold rounded-xl hover:opacity-80 transition-opacity text-sm"
            >
              <Printer className="w-4 h-4" />
              Imprimir (Orig+Copia)
            </button>
            <button 
              onClick={onClose}
              className="p-2 rounded-full hover:bg-outline-variant/20 dark:hover:bg-white/10 text-on-surface-variant dark:text-white/60 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Contenido Imprimible */}
        <div className="flex-1 overflow-auto p-4 md:p-6 bg-gray-100 dark:bg-black/20 flex justify-center items-start">
          <div id="factura-content" className="bg-white text-black p-6 w-[21.59cm] min-w-[21.59cm] shrink-0 shadow-lg rounded-xl flex flex-col relative mx-auto">
            
            <div className="flex justify-between items-start mb-4">
              {/* Logo y Empresa */}
              <div className="w-[55%] pr-4 -mt-2">
                <div className="mb-1">
                  <img src="/sweet_logo.jpg" alt="Sweet & Tasty" className="h-20 object-contain" />
                </div>
                <input 
                  type="text" 
                  value={empresaNombre} 
                  onChange={(e) => setEmpresaNombre(e.target.value)} 
                  className="font-bold uppercase text-md border-b border-transparent hover:border-gray-300 focus:border-black transition-colors w-full"
                />
                <textarea 
                  value={empresaDireccion} 
                  onChange={(e) => setEmpresaDireccion(e.target.value)} 
                  className="text-xs text-gray-600 border-b border-transparent hover:border-gray-300 focus:border-black transition-colors w-full resize-none leading-tight"
                  rows={3}
                  placeholder="Dirección..."
                />
                <div className="flex items-center text-xs text-gray-600">
                  <span className="font-bold mr-1">Tel:</span>
                  <input 
                    type="text" 
                    value={empresaTelefono} 
                    onChange={(e) => setEmpresaTelefono(e.target.value)} 
                    className="border-b border-transparent hover:border-gray-300 focus:border-black transition-colors flex-1"
                    placeholder="Teléfono..."
                  />
                </div>
                <div className="flex items-center text-xs text-gray-600">
                  <span className="font-bold mr-1">E-mail:</span>
                  <input 
                    type="text" 
                    value={empresaEmail} 
                    onChange={(e) => setEmpresaEmail(e.target.value)} 
                    className="border-b border-transparent hover:border-gray-300 focus:border-black transition-colors flex-1"
                    placeholder="Correo..."
                  />
                </div>
                <div className="flex items-center text-xs">
                  <span className="font-bold mr-1">R.T.N.</span>
                  <input 
                    type="text" 
                    value={empresaRTN} 
                    onChange={(e) => setEmpresaRTN(e.target.value)} 
                    className="font-bold border-b border-transparent hover:border-gray-300 focus:border-black transition-colors flex-1"
                    placeholder="RTN..."
                  />
                </div>
              </div>

              {/* Factura Info */}
              <div className="w-[45%] text-right">
                <h1 className="text-lg font-black text-[#e3b54a] mb-1 uppercase tracking-wide">Factura</h1>
                <div className="flex items-center justify-end font-bold text-base mb-1">
                  <span className="mr-1">No.</span>
                  <input 
                    type="text" 
                    value={numeroFiscalLocal} 
                    onChange={(e) => setNumeroFiscalLocal(e.target.value)} 
                    className="w-48 text-right bg-transparent border-b border-transparent hover:border-gray-300 focus:border-[#e3b54a] transition-colors"
                  />
                </div>
                <p className="text-[10px] text-gray-600 mb-2">CAI: <span className="font-mono">{sarConfig?.cai || 'POR DEFINIR'}</span></p>
                
                <div className="flex justify-end gap-2">
                  <div className="inline-block border border-gray-300 rounded-md overflow-hidden">
                    <div className="bg-gray-100 px-3 py-1 text-[10px] font-bold text-center border-b border-gray-300">FECHA</div>
                    <div className="flex text-center divide-x divide-gray-300 text-xs">
                      <div className="px-2 py-1"><div className="font-bold">{dia}</div></div>
                      <div className="px-2 py-1"><div className="font-bold">{mes}</div></div>
                      <div className="px-2 py-1"><div className="font-bold">{ano}</div></div>
                    </div>
                  </div>
                  
                  <div className="inline-block border border-gray-300 rounded-md overflow-hidden">
                    <div className="bg-gray-100 px-3 py-1 text-[10px] font-bold text-center border-b border-gray-300">CONDICIÓN DE PAGO</div>
                    <div className="px-3 py-1 text-center font-bold text-xs text-[#e3b54a]">
                      {condicionPago}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Datos del Cliente */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-4">
              <h3 className="text-[10px] font-bold text-[#e3b54a] uppercase tracking-wider mb-2">Facturar A:</h3>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="flex flex-col">
                  <span className="text-gray-500 text-[10px] mb-0.5">Nombre del Cliente</span>
                  <input 
                    type="text" 
                    value={clienteNombre} 
                    onChange={(e) => setClienteNombre(e.target.value)} 
                    className="font-bold border-b border-gray-300 focus:border-[#e3b54a] transition-colors bg-transparent min-w-0" 
                    placeholder="Nombre..."
                  />
                </div>
                <div className="flex flex-col">
                  <span className="text-gray-500 text-[10px] mb-0.5">R.T.N.</span>
                  <input 
                    type="text" 
                    value={clienteRTN} 
                    onChange={(e) => setClienteRTN(e.target.value)} 
                    className="font-bold border-b border-gray-300 focus:border-[#e3b54a] transition-colors bg-transparent min-w-0" 
                    placeholder="RTN del cliente..."
                  />
                </div>
                <div className="flex flex-col col-span-2">
                  <span className="text-gray-500 text-[10px] mb-0.5">Dirección</span>
                  <input 
                    type="text" 
                    value={clienteDireccion} 
                    onChange={(e) => setClienteDireccion(e.target.value)} 
                    className="border-b border-gray-300 focus:border-[#e3b54a] transition-colors bg-transparent w-full min-w-0" 
                    placeholder="Dirección del cliente..."
                  />
                </div>
              </div>
            </div>

            {/* Tabla de Detalles */}
            <div className="rounded-lg overflow-hidden border border-gray-200 mb-4 flex-1">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-[#e3b54a] text-black">
                    <th className="px-3 py-2 text-center font-bold w-12">CANT.</th>
                    <th className="px-3 py-2 text-left font-bold">DESCRIPCIÓN</th>
                    <th className="px-3 py-2 text-right font-bold w-24">PRECIO L.</th>
                    <th className="px-3 py-2 text-right font-bold w-20">DESC. L.</th>
                    <th className="px-3 py-2 text-right font-bold w-28">TOTAL L.</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {pedido.detalles?.map((det: any, idx: number) => {
                    const cant = Math.round(Number(det.cantidad));
                    const unitPrice = Number(det.subtotal) / cant;
                    return (
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="px-3 py-2 text-center align-top">{cant}</td>
                        <td className="px-3 py-2 align-top font-medium">{det.producto_nombre}</td>
                        <td className="px-3 py-2 text-right align-top text-gray-600">{unitPrice.toFixed(2)}</td>
                        <td className="px-3 py-2 text-right align-top text-gray-600">0.00</td>
                        <td className="px-3 py-2 text-right font-bold align-top">{Number(det.subtotal).toFixed(2)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Layout Inferior (Info y Totales) */}
            <div className="flex flex-col md:flex-row gap-4 items-start mt-auto">
              
              {/* Bloque Izquierdo (Info SAR y Legal) */}
              <div className="flex-1 w-full text-[10px] text-gray-600 space-y-3">
                <div className="bg-gray-50 border border-gray-200 rounded-md p-2 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="w-2/3">No. Correlativo Orden de Compra Exenta:</span>
                    <span className="w-1/3 border-b border-gray-400"></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2/3">No. Correlativo Constancia Exonerado:</span>
                    <span className="w-1/3 border-b border-gray-400"></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2/3">No. Identificativo de Registro de SAG:</span>
                    <span className="w-1/3 border-b border-gray-400"></span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="font-bold">Son:</span>
                  <span className="flex-1 border-b border-gray-400 text-transparent select-none">________________________________________________</span>
                </div>

                <div className="pt-1 text-[9px] space-y-1">
                  <p><span className="font-bold">Rango Autorizado:</span> {getRango(sarConfig?.rango_inicial || 1)} al {getRango(sarConfig?.rango_final || 1)}</p>
                  <p><span className="font-bold">Fecha Límite de Emisión:</span> {limiteEmision}</p>
                  <p className="font-bold text-[#e3b54a] text-[10px] mt-1.5 uppercase tracking-wide">LA FACTURA ES BENEFICIO DE TODOS: ¡EXÍJALA!</p>
                </div>
              </div>

              {/* Bloque Derecho (Totales) */}
              <div className="w-full md:w-64 bg-gray-50 rounded-lg border border-gray-200 p-3">
                <div className="space-y-1.5 text-[11px]">
                  <div className="flex justify-between text-gray-600">
                    <span>Importe Exonerado</span>
                    <span>L. 0.00</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Importe Exento</span>
                    <span>L. {importeExento.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Importe Gravado 15%</span>
                    <span>L. {importeGravado15.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Importe Gravado 18%</span>
                    <span>L. 0.00</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>15% I.S.V.</span>
                    <span>L. {isv15.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>18% I.S.V.</span>
                    <span>L. 0.00</span>
                  </div>
                </div>
                
                <div className="mt-2.5 pt-2 border-t-2 border-gray-300 flex justify-between items-center">
                  <span className="font-black text-sm">TOTAL A PAGAR</span>
                  <span className="font-black text-base text-[#e3b54a]">L. {granTotal.toFixed(2)}</span>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
