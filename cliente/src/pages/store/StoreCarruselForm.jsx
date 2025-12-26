import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import ImagePreview from '../../components/common/ImagePreview';
import PropTypes from 'prop-types';

const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    if (file.size > 5 * 1024 * 1024) {
      reject(new Error('La imagen es demasiado grande. Máximo 5MB.'));
      return;
    }
    
    const reader = new FileReader();
    reader.readAsDataURL(file);
    
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        
        // Comprimir slides del carrusel
        const maxWidth = 1920;
        const maxHeight = 800;
        
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = width * ratio;
          height = height * ratio;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        
        // Comprimir con calidad 0.8 para carrusel (mejor calidad que banners)
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        const sizeKB = Math.round((dataUrl.length * 0.75) / 1024);
        console.log(`📏 Slide carrusel comprimido: ${sizeKB}KB`);
        
        resolve(dataUrl);
      };
      img.onerror = reject;
      img.src = e.target.result;
    };
    
    reader.onerror = error => reject(error);
  });
};

const StoreCarruselForm = ({ currentCarrusel, onUpdate, onClose }) => {
  const [carruseles, setCarruseles] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (currentCarrusel && Array.isArray(currentCarrusel)) {
      setCarruseles(currentCarrusel);
    }
  }, [currentCarrusel]);

  const handleAddCarrusel = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const base64 = await fileToBase64(file);
      const newCarrusel = {
        url: base64,
        titulo: '',
        subtitulo: '',
        textoBoton: '',
        urlBoton: '',
        orden: carruseles.length + 1,
        _id: Date.now().toString()
      };
      setCarruseles(prev => [...prev, newCarrusel]);
      toast.success('Imagen agregada al carrusel', { icon: '🎨' });
    } catch (error) {
      toast.error(error.message || 'Error al cargar imagen');
    }
  };

  const handleUpdateCarrusel = (id, field, value) => {
    setCarruseles(prev => prev.map(carrusel => 
      carrusel._id === id ? { ...carrusel, [field]: value } : carrusel
    ));
  };

  const handleRemoveCarrusel = (id) => {
    setCarruseles(prev => prev.filter(carrusel => carrusel._id !== id));
    toast.info('Slide eliminado del carrusel');
  };

  const handleMoveUp = (index) => {
    if (index === 0) return;
    const newCarruseles = [...carruseles];
    [newCarruseles[index], newCarruseles[index - 1]] = [newCarruseles[index - 1], newCarruseles[index]];
    setCarruseles(newCarruseles);
  };

  const handleMoveDown = (index) => {
    if (index === carruseles.length - 1) return;
    const newCarruseles = [...carruseles];
    [newCarruseles[index], newCarruseles[index + 1]] = [newCarruseles[index + 1], newCarruseles[index]];
    setCarruseles(newCarruseles);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (carruseles.length === 0) {
      toast.warning('Debe agregar al menos un slide al carrusel');
      return;
    }
    
    setLoading(true);
    try {
      await onUpdate({ carrusel: carruseles.map((c, i) => ({ ...c, orden: i + 1 })) });
      if (onClose) onClose();
    } catch (error) {
      console.error('Error al actualizar carrusel:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Info */}
      <div className="glass-card p-4 bg-accent-500/10 border-accent-400/30">
        <div className="flex items-start gap-3">
          <svg className="w-5 h-5 text-accent-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="text-sm text-gray-300">
            <p className="font-medium text-accent-300 mb-1">Información sobre el carrusel:</p>
            <ul className="list-disc list-inside space-y-1 text-gray-400">
              <li>Agrega múltiples slides con imágenes y texto</li>
              <li>Tamaño máximo archivo: 5MB • Se comprime automáticamente</li>
              <li>Dimensiones óptimas: 1920×800px (alta calidad)</li>
              <li>Usa las flechas para reordenar los slides</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Lista de slides */}
      {carruseles.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-lg font-semibold text-white flex items-center gap-2">
              <svg className="w-5 h-5 text-accent-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Slides del Carrusel ({carruseles.length})
            </h4>
            <span className="text-xs text-gray-400 bg-white/10 px-3 py-1.5 rounded-lg">Usa ↑↓ para reordenar</span>
          </div>
          
          <div className="space-y-3">
            {carruseles.map((carrusel, index) => (
              <div key={carrusel._id} className="glass-card p-4 hover:border-accent-400/50 transition-all group">
                <div className="flex items-start gap-4">
                  {/* Preview mejorado */}
                  <div className="relative">
                    <div className="w-56 h-36 flex-shrink-0 rounded-xl overflow-hidden bg-white/5 border-2 border-white/10 group-hover:border-accent-400/30 transition-all">
                      {carrusel.url ? (
                        <ImagePreview
                          src={carrusel.url}
                          alt={carrusel.titulo || `Slide ${index + 1}`}
                          className="w-full h-full object-cover"
                          showFileName={false}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-500">
                          <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                    </div>
                    {/* Badge con número de orden */}
                    <div className="absolute -top-2 -left-2 bg-accent-500 text-white text-xs font-bold w-8 h-8 rounded-full flex items-center justify-center border-2 border-dark-800 shadow-lg">
                      {index + 1}
                    </div>
                  </div>

                  {/* Form */}
                  <div className="flex-1 space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1.5 flex items-center gap-1.5">
                          <svg className="w-3.5 h-3.5 text-accent-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                          </svg>
                          Título
                        </label>
                        <input
                          type="text"
                          value={carrusel.titulo || ''}
                          onChange={(e) => handleUpdateCarrusel(carrusel._id, 'titulo', e.target.value)}
                          placeholder="Título destacado"
                          className="input-modern"
                          disabled={loading}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1.5 flex items-center gap-1.5">
                          <svg className="w-3.5 h-3.5 text-accent-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                          </svg>
                          Subtítulo
                        </label>
                        <input
                          type="text"
                          value={carrusel.subtitulo || ''}
                          onChange={(e) => handleUpdateCarrusel(carrusel._id, 'subtitulo', e.target.value)}
                          placeholder="Descripción breve"
                          className="input-modern"
                          disabled={loading}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1.5 flex items-center gap-1.5">
                          <svg className="w-3.5 h-3.5 text-accent-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                          Texto del botón
                        </label>
                        <input
                          type="text"
                          value={carrusel.textoBoton || ''}
                          onChange={(e) => handleUpdateCarrusel(carrusel._id, 'textoBoton', e.target.value)}
                          placeholder="Ver más"
                          className="input-modern"
                          disabled={loading}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1.5 flex items-center gap-1.5">
                          <svg className="w-3.5 h-3.5 text-accent-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                          </svg>
                          URL del botón
                        </label>
                        <input
                          type="text"
                          value={carrusel.urlBoton || ''}
                          onChange={(e) => handleUpdateCarrusel(carrusel._id, 'urlBoton', e.target.value)}
                          placeholder="/productos"
                          className="input-modern"
                          disabled={loading}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Acciones */}
                  <div className="flex flex-col gap-2">
                    <button
                      type="button"
                      onClick={() => handleMoveUp(index)}
                      disabled={index === 0 || loading}
                      className="p-2.5 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all hover:scale-110"
                      title="Mover arriba"
                    >
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleMoveDown(index)}
                      disabled={index === carruseles.length - 1 || loading}
                      className="p-2.5 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all hover:scale-110"
                      title="Mover abajo"
                    >
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveCarrusel(carrusel._id)}
                      className="p-2.5 rounded-lg bg-error-500/20 hover:bg-error-500/30 transition-all hover:scale-110"
                      disabled={loading}
                      title="Eliminar"
                    >
                      <svg className="w-4 h-4 text-error-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Agregar slide */}
      <div>
        <input
          type="file"
          accept="image/*"
          onChange={handleAddCarrusel}
          className="hidden"
          id="carrusel-upload"
          disabled={loading}
        />
        <label
          htmlFor="carrusel-upload"
          className="flex flex-col items-center justify-center gap-3 w-full px-6 py-8 bg-white/5 border-2 border-dashed border-white/20 rounded-xl text-white cursor-pointer hover:bg-white/10 hover:border-accent-400/50 transition-all group"
        >
          <div className="p-3 rounded-full bg-accent-500/20 group-hover:bg-accent-500/30 transition-colors">
            <svg className="w-8 h-8 text-accent-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <div className="text-center">
            <p className="text-base font-semibold mb-1">Agregar Nuevo Slide</p>
            <p className="text-xs text-gray-400">Click para seleccionar • Máx 2MB • JPG, PNG, WebP</p>
          </div>
        </label>
      </div>

      {/* Botones */}
      <div className="flex gap-3 justify-end pt-4 border-t border-white/10">
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="btn-secondary"
          >
            Cancelar
          </button>
        )}
        <button
          type="submit"
          disabled={loading || carruseles.length === 0}
          className="btn-primary"
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Guardando...</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Guardar Carrusel</span>
            </div>
          )}
        </button>
      </div>
    </form>
  );
};

StoreCarruselForm.propTypes = {
  currentCarrusel: PropTypes.array,
  onUpdate: PropTypes.func.isRequired,
  onClose: PropTypes.func,
};

export default StoreCarruselForm;
