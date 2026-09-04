import { useState, useEffect, useRef } from 'react';
import { X, Printer, CheckCircle, Download, Loader2 } from 'lucide-react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { useLockBodyScroll } from '../../hooks/useLockBodyScroll';
import { ScrollProgressIndicator } from '../ui/ScrollProgressIndicator';
import { getSARConfig } from '../../services/adminService';

function numeroALetras(num: number): string {
  if (num === 0) return 'CERO LEMPIRAS CON CERO CENTAVOS';
  
  const unidades = ['', 'UN ', 'DOS ', 'TRES ', 'CUATRO ', 'CINCO ', 'SEIS ', 'SIETE ', 'OCHO ', 'NUEVE '];
  const decenas = ['DIEZ ', 'ONCE ', 'DOCE ', 'TRECE ', 'CATORCE ', 'QUINCE ', 'DIECISEIS ', 'DIECISIETE ', 'DIECIOCHO ', 'DIECINUEVE '];
  const decenas2 = ['', '', 'VEINTE ', 'TREINTA ', 'CUARENTA ', 'CINCUENTA ', 'SESENTA ', 'SETENTA ', 'OCHENTA ', 'NOVENTA '];
  const centenas = ['', 'CIENTO ', 'DOSCIENTOS ', 'TRESCIENTOS ', 'CUATROCIENTOS ', 'QUINIENTOS ', 'SEISCIENTOS ', 'SETECIENTOS ', 'OCHOCIENTOS ', 'NOVECIENTOS '];

  const getUnidades = (n: number) => unidades[n];
  const getDecenas = (n: number) => {
    if (n < 10) return getUnidades(n);
    if (n < 20) return decenas[n - 10];
    const u = n % 10;
    if (n === 20) return 'VEINTE ';
    if (n < 30) return 'VEINTI' + getUnidades(u).trim() + ' ';
    return decenas2[Math.floor(n / 10)] + (u > 0 ? 'Y ' + getUnidades(u) : '');
  };
  const getCentenas = (n: number) => {
    if (n === 100) return 'CIEN ';
    const d = n % 100;
    return centenas[Math.floor(n / 100)] + (d > 0 ? getDecenas(d) : '');
  };
  const getMiles = (n: number) => {
    const c = n % 1000;
    const m = Math.floor(n / 1000);
    if (m === 0) return getCentenas(c);
    if (m === 1) return 'MIL ' + getCentenas(c);
    return getCentenas(m) + 'MIL ' + (c > 0 ? getCentenas(c) : '');
  };
  const getMillones = (n: number) => {
    const m = n % 1000000;
    const mi = Math.floor(n / 1000000);
    if (mi === 0) return getMiles(m);
    if (mi === 1) return 'UN MILLON ' + (m > 0 ? getMiles(m) : '');
    return getMiles(mi) + 'MILLONES ' + (m > 0 ? getMiles(m) : '');
  };

  const entero = Math.floor(num);
  const decimales = Math.round((num - entero) * 100);
  
  const letrasEntero = entero === 0 ? 'CERO' : getMillones(entero).trim();
  const moneda = entero === 1 ? 'LEMPIRA' : 'LEMPIRAS';
  
  let letrasDecimales = '';
  if (decimales === 0) {
    letrasDecimales = 'CERO CENTAVOS';
  } else if (decimales === 1) {
    letrasDecimales = 'UN CENTAVO';
  } else {
    letrasDecimales = getDecenas(decimales).trim() + ' CENTAVOS';
  }
  
  return `${letrasEntero} ${moneda} CON ${letrasDecimales}`.trim();
}

interface FacturaModalProps {
  isOpen: boolean;
  onClose: () => void;
  pedido: any;
  isClientView?: boolean;
}

export function FacturaModal({ isOpen, onClose, pedido }: FacturaModalProps) {
  useLockBodyScroll(isOpen);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [sarConfig, setSarConfig] = useState<any>(null);
  const [isExporting, setIsExporting] = useState(false);
  
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
  
  // Editable Invoice Date
  const [facturaFecha, setFacturaFecha] = useState(() => {
    // Current date in local timezone YYYY-MM-DD
    const now = new Date();
    const offset = now.getTimezoneOffset();
    const local = new Date(now.getTime() - (offset*60*1000));
    return local.toISOString().split('T')[0];
  });

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      if (pedido) {
        setClienteNombre(pedido.cliente_nombre || '');
        setClienteDireccion(pedido.cliente_direccion || '');
        setClienteRTN(pedido.cliente_rtn || '');
        setCondicionPago('CONTADO'); // Default
        
        const now = new Date();
        const offset = now.getTimezoneOffset();
        const local = new Date(now.getTime() - (offset*60*1000));
        setFacturaFecha(local.toISOString().split('T')[0]);
        
        const loadSAR = async () => {
          try {
            const config = await getSARConfig();
            setSarConfig(config);
            if (config) {
              setEmpresaNombre(config.razon_social || 'Sweet & Tasty');
              let dir = config.direccion || '';
              dir = dir.replace(/\uFFFD/g, 'á').replace(/Morazn/g, 'Morazán').replace(/Moraz.n/g, 'Morazán');
              setEmpresaDireccion(dir);
              setEmpresaTelefono(config.telefono || '');
              
              let correo = config.correo || 'grupovinzhn@gmail.com';
              if (correo === 'grupovinzh@gmail.com') correo = 'grupovinzhn@gmail.com';
              setEmpresaEmail(correo);
              
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

  // Descarga las fuentes de Google y devuelve un <style> con @font-face en base64
  // para que html2canvas y el iframe puedan renderizar la tipografía correctamente.
  const embedGoogleFonts = async (): Promise<string> => {
    try {
      const FONT_URL = 'https://fonts.googleapis.com/css2?family=Manrope:wght@400;600;700;800&family=Playfair+Display:ital,wght@0,400..900;1,400..900&display=swap';
      const cssResp = await fetch(FONT_URL, { headers: { 'Accept': 'text/css' } });
      if (!cssResp.ok) return '';
      let css = await cssResp.text();

      // Reemplazar cada url(https://fonts.gstatic.com/...) por su base64
      const urlMatches = [...css.matchAll(/url\((https:\/\/fonts\.gstatic\.com[^)]+)\)/g)];
      for (const m of urlMatches) {
        try {
          const fontResp = await fetch(m[1]);
          const blob = await fontResp.blob();
          const b64 = await new Promise<string>(res => {
            const r = new FileReader();
            r.onloadend = () => res(r.result as string);
            r.readAsDataURL(blob);
          });
          css = css.replace(m[0], `url(${b64})`);
        } catch { /* omitir esta fuente */ }
      }
      return `<style>${css}</style>`;
    } catch {
      return '';
    }
  };

  const handlePrint = async () => {
    const printContent = document.getElementById('factura-content');
    if (!printContent) return;

    // Actualizar campos editables
    printContent.querySelectorAll('input[type="text"], input[type="date"], textarea').forEach(el => {
      if (el instanceof HTMLInputElement) el.setAttribute('value', el.value);
      if (el instanceof HTMLTextAreaElement) el.textContent = el.value;
    });

    // Obtener fuentes embebidas en base64
    const embeddedFonts = await embedGoogleFonts();

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
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Factura Pedido #${pedido.id.split('-')[0].toUpperCase()}</title>
          ${styleTags}
          ${embeddedFonts}
          <style>
            @media print {
              @page { margin: 0.5cm; size: letter portrait; }
              body { margin: 0; padding: 0; background: white !important; font-family: 'Manrope', sans-serif; }
              * {
                -webkit-print-color-adjust: exact !important;
                color-adjust: exact !important;
                print-color-adjust: exact !important;
              }
              .page-break {
                page-break-before: always !important;
                break-before: page !important;
              }
              .copy-label {
                text-align: right;
                font-weight: 900;
                font-size: 14px;
                color: #555 !important;
                margin-bottom: 10px;
                letter-spacing: 1px;
              }
              input[type="text"], input[type="date"], textarea { 
                border: none !important; 
                background: transparent !important;
                padding: 0 !important;
                margin: 0 !important;
                color: black !important;
                font-family: 'Manrope', sans-serif;
                resize: none;
              }
              input::placeholder, textarea::placeholder { color: transparent !important; }
              input[type="date"]::-webkit-calendar-picker-indicator { display: none !important; }
              input[type="date"]::-webkit-inner-spin-button { display: none !important; }
              textarea { overflow: hidden; }
              input:focus, textarea:focus { outline: none !important; }
              .print-hidden { display: none !important; }
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
          <div style="padding: 0.5cm 1.5cm 1cm 1.5cm; position: relative; z-index: 1;">
            <div class="copy-label">ORIGINAL: CLIENTE</div>
            ${printContent.outerHTML}
          </div>
          <div class="page-break"></div>
          <div style="padding: 0.5cm 1.5cm 1cm 1.5cm; position: relative; z-index: 1;">
            <div class="copy-label">COPIA: EMISOR</div>
            ${printContent.outerHTML}
          </div>
        </body>
      </html>
    `);
    iframeDoc.close();

    // Esperar a que las fuentes carguen en el iframe antes de imprimir
    const doPrint = () => {
      // Cambiar temporalmente el título para el nombre de archivo en "Guardar como PDF"
      const originalTitle = document.title;
      // Usar facturaFecha para el nombre del archivo
      const [year, month, day] = facturaFecha.split('-');
      document.title = `Factura-${pedido.id.split('-')[0].toUpperCase()}-${day}-${month}-${year}`;

      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();

      // Restaurar el título y limpiar el DOM después de que el diálogo se cierre/procese
      setTimeout(() => { 
        document.title = originalTitle;
        document.body.removeChild(iframe); 
      }, 1000);
    };

    try {
      await iframeDoc.fonts.ready;
      await new Promise(r => setTimeout(r, 150));
      doPrint();
    } catch {
      setTimeout(doPrint, 800);
    }
  };

  const handleExportPDF = async () => {
    const source = document.getElementById('factura-content');
    if (!source || !pedido) return;

    try {
      setIsExporting(true);

      // Obtener fuentes embebidas en base64
      const embeddedFonts = await embedGoogleFonts();

      // --- Actualizar campos editables antes de clonar ---
      source.querySelectorAll('input[type="text"], input[type="date"], textarea').forEach(el => {
        if (el instanceof HTMLInputElement) {
          el.setAttribute('value', el.value);
          el.removeAttribute('placeholder'); // Prevenir que html2canvas imprima el placeholder
        }
        if (el instanceof HTMLTextAreaElement) {
          el.textContent = el.value;
          el.removeAttribute('placeholder');
        }
      });

      // --- Clonar el nodo FUERA del modal para que html2canvas lo vea limpio ---
      const clone = source.cloneNode(true) as HTMLElement;
      clone.style.position = 'fixed';
      clone.style.top = '-9999px';
      clone.style.left = '-9999px';
      clone.style.width = source.offsetWidth + 'px';
      clone.style.boxShadow = 'none';
      clone.style.borderRadius = '0';
      clone.style.overflow = 'visible';
      clone.style.zIndex = '-1';
      clone.querySelectorAll('.print-hidden').forEach(el => {
        (el as HTMLElement).style.display = 'none';
      });

      // Inyectar fuentes inline en el clon para que html2canvas las renderice
      if (embeddedFonts) {
        const fontStyle = document.createElement('div');
        fontStyle.innerHTML = embeddedFonts;
        const styleEl = fontStyle.firstChild as HTMLStyleElement;
        if (styleEl) clone.insertBefore(styleEl, clone.firstChild);
      }

      document.body.appendChild(clone);

      // Esperar fuentes + renderizado
      await document.fonts.ready;
      await new Promise(r => setTimeout(r, 400));

      const canvas = await html2canvas(clone, {
        scale: 2,
        useCORS: true,
        allowTaint: false,
        logging: false,
        backgroundColor: '#ffffff',
        width: clone.offsetWidth,
        height: clone.offsetHeight,
      });

      document.body.removeChild(clone);

      // --- Generar PDF tamaño carta ---
      const imgData = canvas.toDataURL('image/jpeg', 0.98);
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'letter' });
      const pdfW = pdf.internal.pageSize.getWidth();
      const pdfH = pdf.internal.pageSize.getHeight();
      const margin = 5; // Reducido para usar mejor el espacio
      const usableW = pdfW - margin * 2;
      const imgH = (canvas.height * usableW) / canvas.width;
      const finalH = imgH > pdfH - margin * 2 ? pdfH - margin * 2 : imgH;
      const finalW = (canvas.width * finalH) / canvas.height;
      pdf.addImage(imgData, 'JPEG', margin, margin, finalW, finalH);
      pdf.save(`Factura-${pedido.id.split('-')[0].toUpperCase()}.pdf`);
    } catch (error) {
      console.error('Error al exportar PDF:', error);
    } finally {
      setIsExporting(false);
    }
  };

  if (!isOpen || !pedido) return null;

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
            <div className="flex items-center gap-2 bg-[#fcf8ef] dark:bg-[#2a2415] px-3 py-1.5 rounded-lg border border-[#e3b54a]/30">
              <span className="text-sm font-bold text-[#8c6d23] dark:text-[#e3b54a]/80">Pago:</span>
              <select 
                value={condicionPago} 
                onChange={(e) => setCondicionPago(e.target.value)}
                className="bg-transparent border-none focus:ring-0 text-sm cursor-pointer font-bold text-[#a6822c] dark:text-[#e3b54a] outline-none"
              >
                <option value="CONTADO">CONTADO</option>
                <option value="CRÉDITO">CRÉDITO</option>
              </select>
            </div>

            {/* Grupo de botones Imprimir/Exportar */}
            <div className="flex bg-tertiary dark:bg-[#e3b54a] rounded-xl border border-tertiary/20 dark:border-[#e3b54a]/20 p-0.5 overflow-hidden shadow-sm">
              <button 
                onClick={handlePrint}
                disabled={isExporting}
                className="flex items-center gap-2 px-3 py-1.5 bg-tertiary hover:bg-tertiary/90 text-white dark:bg-[#e3b54a] dark:hover:bg-[#d4a845] dark:text-black font-bold rounded-lg transition-colors text-sm disabled:opacity-50"
                title="Imprimir Factura"
              >
                <Printer className="w-4 h-4" />
                <span className="hidden md:inline">Imprimir</span>
              </button>
              <div className="w-[1px] bg-white/20 dark:bg-black/10 mx-0.5 my-1" />
              <button 
                onClick={handleExportPDF}
                disabled={isExporting}
                className="flex items-center gap-2 px-3 py-1.5 bg-tertiary hover:bg-tertiary/90 text-white dark:bg-[#e3b54a] dark:hover:bg-[#d4a845] dark:text-black font-bold rounded-lg transition-colors text-sm disabled:opacity-50"
                title="Descargar PDF"
              >
                {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                <span className="hidden md:inline">PDF</span>
              </button>
            </div>

            <button 
              onClick={onClose}
              className="p-2 ml-2 rounded-full hover:bg-outline-variant/20 dark:hover:bg-white/10 text-on-surface-variant dark:text-white/60 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Preview Container */}
        <div 
          ref={scrollRef}
          className="flex-1 overflow-auto p-4 md:p-6 bg-gray-100 dark:bg-black/20 flex justify-center items-start relative scroll-smooth"
        >
          <div id="factura-content" className="bg-white text-black p-4 md:p-5 w-[21.59cm] min-w-[21.59cm] shrink-0 shadow-lg rounded-xl flex flex-col relative mx-auto">
            
            <div className="flex justify-between items-start mb-3">
              {/* Logo y Empresa */}
              <div className="w-[55%] pr-4 -mt-5">
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
                <div className="flex items-center justify-end font-bold text-base mb-1 text-right">
                  <div className="flex items-center border-b border-transparent hover:border-gray-300 focus-within:border-[#e3b54a] transition-colors">
                    <span className="mr-1">No.</span>
                    <input 
                      type="text" 
                      value={numeroFiscalLocal} 
                      onChange={(e) => setNumeroFiscalLocal(e.target.value)} 
                      className="w-[170px] text-right bg-transparent outline-none focus:outline-none"
                    />
                  </div>
                </div>
                <p className="text-[10px] text-gray-600 mb-2">CAI: <span className="font-mono">{sarConfig?.cai || 'POR DEFINIR'}</span></p>
                
                <div className="flex justify-end gap-2">
                  <div className="inline-block border border-gray-300 rounded-md overflow-hidden bg-white">
                    <div className="bg-gray-100 px-3 py-1 text-[10px] font-bold text-center border-b border-gray-300">FECHA</div>
                    <div className="px-2 py-1 flex items-center justify-center">
                      <input 
                        type="date"
                        value={facturaFecha}
                        onChange={(e) => setFacturaFecha(e.target.value)}
                        className="font-bold text-xs text-center border-none bg-transparent hover:bg-gray-50 focus:ring-0 p-0 m-0 outline-none w-[100px] print:w-auto cursor-pointer"
                      />
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
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-3">
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
            <div className="rounded-lg overflow-hidden border border-gray-200 mb-3 flex-1">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-[#e3b54a] text-black">
                    <th className="px-2 py-1.5 text-center font-bold w-10">CANT.</th>
                    <th className="px-2 py-1.5 text-left font-bold">DESCRIPCIÓN</th>
                    <th className="px-2 py-1.5 text-right font-bold w-20">PRECIO L.</th>
                    <th className="px-2 py-1.5 text-right font-bold w-20">DESC. L.</th>
                    <th className="px-2 py-1.5 text-right font-bold w-24">TOTAL L.</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {pedido.detalles?.map((det: any, index: number) => {
                    const unitPrice = Number(det.subtotal) / Number(det.cantidad);
                    return (
                      <tr key={index} className="bg-white">
                        <td className="px-2 py-1.5 text-center align-top">{Number(det.cantidad)}</td>
                        <td className="px-2 py-1.5 align-top font-medium">{det.producto_nombre}</td>
                        <td className="px-2 py-1.5 text-right align-top text-gray-600">{unitPrice.toFixed(2)}</td>
                        <td className="px-2 py-1.5 text-right align-top text-gray-600">0.00</td>
                        <td className="px-2 py-1.5 text-right font-bold align-top">{Number(det.subtotal).toFixed(2)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Footer de Factura: Totales + Información Legal agrupados */}
            <div className="w-full mt-auto flex gap-3">
              {/* Bloque Izquierdo: Son + Info SAR */}
              <div className="flex-1 bg-gray-50 border border-gray-200 rounded-lg p-3 flex flex-col">
                <div className="flex items-start gap-2 text-[10px] mb-2">
                  <span className="font-bold pt-1 whitespace-nowrap">Son:</span>
                  <span className="flex-1 font-medium italic uppercase border-b border-gray-400 pb-0.5">{numeroALetras(granTotal)}</span>
                </div>
                <div className="pt-1 text-[9px] space-y-1 mt-3 text-gray-600">
                  <p><span className="font-bold">Rango Autorizado:</span> {getRango(sarConfig?.rango_inicial || 1)} al {getRango(sarConfig?.rango_final || 1000)}</p>
                  <p><span className="font-bold">Fecha Límite de Emisión:</span> {limiteEmision}</p>
                  <p className="font-bold text-[#e3b54a] text-[10px] mt-2 uppercase tracking-wide">LA FACTURA ES BENEFICIO DE TODOS: ¡EXÍJALA!</p>
                </div>
              </div>

              {/* Bloque Derecho: Totales */}
              <div className="w-[45%] md:w-64 bg-gray-50 rounded-lg border border-gray-200 p-2.5">
                <div className="space-y-1.5 text-[11px]">
                  <div className="flex justify-between text-gray-600"><span>Importe Exonerado</span><span>L. 0.00</span></div>
                  <div className="flex justify-between text-gray-600"><span>Importe Exento</span><span>L. {importeExento.toFixed(2)}</span></div>
                  <div className="flex justify-between text-gray-600"><span>Importe Gravado 15%</span><span>L. {importeGravado15.toFixed(2)}</span></div>
                  <div className="flex justify-between text-gray-600"><span>Importe Gravado 18%</span><span>L. 0.00</span></div>
                  <div className="flex justify-between text-gray-600"><span>15% I.S.V.</span><span>L. {isv15.toFixed(2)}</span></div>
                  <div className="flex justify-between text-gray-600"><span>18% I.S.V.</span><span>L. 0.00</span></div>
                  <div className="pt-2 border-t border-gray-300 flex justify-between items-center mt-1">
                    <span className="font-black text-xs">TOTAL A PAGAR</span>
                    <span className="font-black text-sm text-[#e3b54a]">L. {granTotal.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
        
        {/* Indicador de scroll flotante */}
        <ScrollProgressIndicator targetRef={scrollRef} />
        
      </div>
    </div>
  );
}
