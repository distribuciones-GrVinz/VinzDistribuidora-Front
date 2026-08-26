import { useState, useEffect } from 'react';
import { Plus, Edit2, Search } from 'lucide-react';
import { getProductos, getCategorias, createProducto, updateProducto } from '../../services/adminService';

interface Producto {
  id: string;
  nombre: string;
  descripcion: string;
  precio_unitario: string;
  categoria_nombre: string;
  imagen_url?: string;
}

export function ProductManager() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [categorias, setCategorias] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [imagenFile, setImagenFile] = useState<File | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [formData, setFormData] = useState({
    nombre: '',
    codigo_sku: '',
    descripcion: '',
    precio_unitario: '',
    unidad_minima: 1,
    categoria: ''
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [prodData, catData] = await Promise.all([
        getProductos(),
        getCategorias()
      ]);
      console.log('API Productos:', prodData);
      setProductos(prodData);
      setCategorias(catData);
      if (catData.length > 0) {
        setFormData(prev => ({ ...prev, categoria: catData[0].id }));
      }
    } catch (error) {
      console.error("Error fetching data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleEdit = (prod: Producto) => {
    // Buscar la categoría ID original usando el nombre o simplemente resetear.
    // Lo ideal sería tener categoria_id en el modelo, pero usaremos el primero o lo buscamos
    const cat = categorias.find(c => c.nombre === prod.categoria_nombre);
    
    setFormData({
      nombre: prod.nombre,
      codigo_sku: prod.id, // Suponiendo que viene en los datos o no lo editamos
      descripcion: prod.descripcion,
      precio_unitario: prod.precio_unitario,
      unidad_minima: 1,
      categoria: cat ? cat.id : (categorias.length > 0 ? categorias[0].id : '')
    });
    setEditingId(prod.id);
    setImagenFile(null);
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    setFormData({ nombre: '', codigo_sku: '', descripcion: '', precio_unitario: '', unidad_minima: 1, categoria: categorias.length > 0 ? categorias[0].id : '' });
    setEditingId(null);
    setImagenFile(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = new FormData();
      data.append('nombre', formData.nombre);
      if (!editingId) data.append('codigo_sku', formData.codigo_sku); // SKU is usually required on create
      data.append('descripcion', formData.descripcion);
      data.append('precio_unitario', formData.precio_unitario);
      data.append('unidad_minima', formData.unidad_minima.toString());
      data.append('categoria', formData.categoria);
      
      if (imagenFile) {
        data.append('imagen', imagenFile);
      }

      if (editingId) {
        await updateProducto(editingId, data);
      } else {
        await createProducto(data);
      }
      
      setIsModalOpen(false);
      fetchData();
    } catch (error: any) {
      console.error("Error guardando producto:", error);
      alert(`Error al guardar producto: ${error.message}`);
    }
  };

  const filteredProducts = productos.filter(prod => {
    const matchesSearch = prod.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (prod.descripcion && prod.descripcion.toLowerCase().includes(searchTerm.toLowerCase()));
    
    // Check if category matches. We use categoria_nombre to compare.
    const matchesCategory = selectedCategory === 'all' || prod.categoria_nombre === selectedCategory;
    
    return matchesSearch && matchesCategory;
  }).sort((a, b) => a.nombre.localeCompare(b.nombre));

  return (
    <div className="max-w-7xl mx-auto py-8 mb-20 transition-colors duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16 mt-8">
        <div>
          <h2 className="text-sm tracking-[0.3em] text-tertiary dark:text-[#e3b54a] font-bold uppercase mb-2">Colección</h2>
          <h1 className="text-5xl md:text-7xl font-headline-xl text-primary dark:text-white">Productos.</h1>
        </div>
        <button 
          onClick={handleAddNew}
          className="bg-primary-container dark:bg-[#e3b54a] text-white dark:text-black px-6 py-3 rounded-full font-bold flex items-center gap-2 hover:bg-tertiary dark:hover:bg-white transition-all shadow-md dark:shadow-[0_0_20px_rgba(227,181,74,0.3)]"
        >
          <Plus className="w-5 h-5" /> Agregar Nuevo
        </button>
      </div>

      {/* Toolbar & Filters */}
      <div className="flex flex-col gap-6 mb-12 border-b border-outline-variant/50 dark:border-white/10 pb-6">
        {/* Search Bar */}
        <div className="flex items-center gap-4">
          <div className="relative flex-grow max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant/50 dark:text-white/40" />
            <input 
              type="text" 
              placeholder="Buscar por nombre o descripción..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white dark:bg-black border border-outline-variant dark:border-white/10 rounded-full py-3 pl-12 pr-6 text-on-surface dark:text-white focus:outline-none focus:border-tertiary dark:focus:border-[#e3b54a] transition-colors shadow-sm dark:shadow-none"
            />
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap gap-2 items-center">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-5 py-2 rounded-full text-sm font-bold transition-all duration-300 ${
              selectedCategory === 'all' 
                ? 'bg-tertiary text-white dark:bg-[#e3b54a] dark:text-black shadow-md' 
                : 'bg-surface-variant/50 text-on-surface-variant hover:bg-surface-variant dark:bg-white/5 dark:text-white/60 dark:hover:bg-white/10'
            }`}
          >
            Todos
          </button>
          {categorias.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.nombre)}
              className={`px-5 py-2 rounded-full text-sm font-bold transition-all duration-300 ${
                selectedCategory === cat.nombre 
                  ? 'bg-tertiary text-white dark:bg-[#e3b54a] dark:text-black shadow-md' 
                  : 'bg-surface-variant/50 text-on-surface-variant hover:bg-surface-variant dark:bg-white/5 dark:text-white/60 dark:hover:bg-white/10'
              }`}
            >
              {cat.nombre}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-tertiary dark:border-[#e3b54a]"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filteredProducts.map(prod => (
            <div key={prod.id} className="group relative bg-white dark:bg-[#0f0f0f] border border-outline-variant/80 dark:border-white/5 rounded-2xl overflow-hidden hover:border-tertiary/60 dark:hover:border-[#e3b54a]/50 transition-all duration-500 shadow-md hover:shadow-xl dark:shadow-none">
              {/* Product Image Placeholder */}
              <div className="aspect-[4/5] bg-[#f5f1e6] dark:bg-[#1a1a1a] p-8 flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-black/5 dark:from-[#0f0f0f] to-transparent z-10"></div>
                
                {/* Simulated product photo area */}
                <div className="w-3/4 h-3/4 bg-white/40 dark:bg-[#e3b54a]/10 rounded-full blur-2xl absolute"></div>
                <img 
                  src={prod.imagen_url || "/sweet_logo.jpg"} 
                  alt={prod.nombre} 
                  className={`w-40 relative z-20 drop-shadow-md ${prod.imagen_url ? 'object-contain h-full' : 'opacity-60 dark:opacity-30 mix-blend-multiply dark:mix-blend-screen dark:grayscale'}`}
                />
                
                {/* Hover Action */}
                <button onClick={() => handleEdit(prod)} className="absolute top-4 right-4 z-30 bg-white/80 dark:bg-black/50 backdrop-blur-md p-3 rounded-full text-tertiary dark:text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-tertiary hover:text-white dark:hover:bg-[#e3b54a] dark:hover:text-black shadow-md dark:shadow-none">
                  <Edit2 className="w-4 h-4" />
                </button>
              </div>

              <div className="p-6 relative z-20 bg-white dark:bg-transparent -mt-2 rounded-t-2xl shadow-[0_-10px_20px_rgba(0,0,0,0.02)] dark:shadow-none border-t border-outline-variant/30 dark:border-transparent pt-4">
                <div className="flex justify-between items-end mb-3">
                  <span className="text-[10px] tracking-widest uppercase text-tertiary dark:text-[#e3b54a] font-bold bg-surface dark:bg-[#0f0f0f] px-3 py-1.5 rounded-full border border-outline-variant/50 dark:border-white/5">
                    {prod.categoria_nombre}
                  </span>
                  <span className="text-xl font-bold text-primary dark:text-white">L {prod.precio_unitario}</span>
                </div>
                <h3 className="text-2xl font-headline-lg text-primary dark:text-white mb-2 line-clamp-1 group-hover:text-tertiary dark:group-hover:text-[#e3b54a] transition-colors">{prod.nombre}</h3>
                <p className="text-on-surface-variant/80 dark:text-white/40 text-sm line-clamp-2 leading-relaxed">{prod.descripcion}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Agregar Producto */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-surface dark:bg-[#0f0f0f] w-full max-w-lg rounded-3xl p-6 md:p-8 shadow-2xl border border-outline-variant/30 dark:border-white/10 relative">
            <h2 className="text-2xl font-bold text-primary dark:text-white mb-6">
              {editingId ? 'Editar Producto' : 'Nuevo Producto'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-semibold mb-1 text-on-surface-variant dark:text-white/60">Nombre del Producto</label>
                  <input required type="text" value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})} className="w-full bg-white dark:bg-black border border-outline-variant/50 dark:border-white/10 rounded-xl py-2 px-4 text-on-surface dark:text-white focus:outline-none focus:border-tertiary dark:focus:border-[#e3b54a]" />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1 text-on-surface-variant dark:text-white/60">Código SKU</label>
                  <input required type="text" value={formData.codigo_sku} onChange={e => setFormData({...formData, codigo_sku: e.target.value})} className="w-full bg-white dark:bg-black border border-outline-variant/50 dark:border-white/10 rounded-xl py-2 px-4 text-on-surface dark:text-white focus:outline-none focus:border-tertiary dark:focus:border-[#e3b54a]" />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1 text-on-surface-variant dark:text-white/60">Categoría</label>
                  <select required value={formData.categoria} onChange={e => setFormData({...formData, categoria: e.target.value})} className="w-full bg-white dark:bg-black border border-outline-variant/50 dark:border-white/10 rounded-xl py-2 px-4 text-on-surface dark:text-white focus:outline-none focus:border-tertiary dark:focus:border-[#e3b54a]">
                    {categorias.map(cat => <option key={cat.id} value={cat.id}>{cat.nombre}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1 text-on-surface-variant dark:text-white/60">Precio Unitario (L)</label>
                  <input required type="number" step="0.01" value={formData.precio_unitario} onChange={e => setFormData({...formData, precio_unitario: e.target.value})} className="w-full bg-white dark:bg-black border border-outline-variant/50 dark:border-white/10 rounded-xl py-2 px-4 text-on-surface dark:text-white focus:outline-none focus:border-tertiary dark:focus:border-[#e3b54a]" />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1 text-on-surface-variant dark:text-white/60">Unidad Mínima</label>
                  <input required type="number" min="1" value={formData.unidad_minima} onChange={e => setFormData({...formData, unidad_minima: Number(e.target.value)})} className="w-full bg-white dark:bg-black border border-outline-variant/50 dark:border-white/10 rounded-xl py-2 px-4 text-on-surface dark:text-white focus:outline-none focus:border-tertiary dark:focus:border-[#e3b54a]" />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-semibold mb-1 text-on-surface-variant dark:text-white/60">Descripción</label>
                  <textarea rows={3} value={formData.descripcion} onChange={e => setFormData({...formData, descripcion: e.target.value})} className="w-full bg-white dark:bg-black border border-outline-variant/50 dark:border-white/10 rounded-xl py-2 px-4 text-on-surface dark:text-white focus:outline-none focus:border-tertiary dark:focus:border-[#e3b54a]"></textarea>
                </div>
                
                <div className="col-span-2">
                  <label className="block text-xs font-semibold mb-1 text-on-surface-variant dark:text-white/60">Imagen del Producto (Recomendado PNG transparente)</label>
                  <input type="file" accept="image/*" onChange={e => setImagenFile(e.target.files?.[0] || null)} className="w-full bg-white dark:bg-black border border-outline-variant/50 dark:border-white/10 rounded-xl py-2 px-4 text-on-surface dark:text-white focus:outline-none focus:border-tertiary dark:focus:border-[#e3b54a]" />
                </div>
              </div>
              
              <div className="flex justify-end gap-3 pt-4 border-t border-outline-variant/30 dark:border-white/10 mt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2 rounded-full font-bold text-on-surface-variant hover:bg-outline-variant/20 dark:text-white/60 dark:hover:bg-white/10 transition-colors">
                  Cancelar
                </button>
                <button type="submit" className="px-6 py-2 rounded-full font-bold bg-primary text-white hover:bg-tertiary dark:bg-[#e3b54a] dark:text-black dark:hover:bg-white transition-colors">
                  Guardar Producto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
