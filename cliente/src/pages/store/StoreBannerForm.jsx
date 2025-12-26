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
        
        // Comprimir banners a un tamaño razonable
        const maxWidth = 1200;
        const maxHeight = 600;
        
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = width * ratio;
          height = height * ratio;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        
        // Comprimir con calidad 0.75 para banners
        const dataUrl = canvas.toDataURL('image/jpeg', 0.75);
        const sizeKB = Math.round((dataUrl.length * 0.75) / 1024);
        console.log(`📏 Banner comprimido: ${sizeKB}KB`);
        
        resolve(dataUrl);
      };
      img.onerror = reject;
      img.src = e.target.result;
    };
    
    reader.onerror = error => reject(error);
  });
};

const StoreBannerForm = ({ currentBanner, onUpdate, onClose }) => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (currentBanner && Array.isArray(currentBanner)) {
      setBanners(currentBanner);
    }
  }, [currentBanner]);

  const handleAddBanner = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const base64 = await fileToBase64(file);
      const newBanner = {
        url: base64,
        alt: '',
        _id: Date.now().toString()
      };
      setBanners(prev => [...prev, newBanner]);
      toast.success('Banner agregado', { icon: '🖼️' });
    } catch (error) {
      toast.error(error.message || 'Error al cargar imagen');
    }
  };

  const handleUpdateAlt = (id, alt) => {
    setBanners(prev => prev.map(banner => 
      banner._id === id ? { ...banner, alt } : banner
    ));
  };

  const handleRemoveBanner = (id) => {
    setBanners(prev => prev.filter(banner => banner._id !== id));
    toast.info('Banner eliminado');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (banners.length === 0) {
      toast.warning('Debe agregar al menos un banner');
      return;
    }
    
    setLoading(true);
    try {
      await onUpdate({ banner: banners });
      if (onClose) onClose();
    } catch (error) {
      console.error('Error al actualizar banners:', error);
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
            <p className="font-medium text-accent-300 mb-1">Información importante:</p>
            <ul className="list-disc list-inside space-y-1 text-gray-400">
              <li>Puedes configurar varios banners para tu tienda</li>
              <li>Tamaño máximo archivo: 5MB • Se comprime automáticamente</li>
              <li>Formato: JPG, PNG, WebP</li>
              <li>Dimensiones óptimas: 1200×400px (relación 3:1)</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Lista de banners */}
      {banners.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-lg font-semibold text-white">Banners Actuales ({banners.length})</h4>
            <span className="text-xs text-gray-400 bg-white/10 px-3 py-1.5 rounded-lg">Relación 3:1 óptima</span>
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            {banners.map((banner, index) => (
              <div key={banner._id} className="glass-card p-4 hover:border-success-400/50 transition-all group">
                <div className="flex items-start gap-4">
                  {/* Preview mejorado */}
                  <div className="w-48 h-32 flex-shrink-0 rounded-xl overflow-hidden bg-white/5 border-2 border-white/10 group-hover:border-success-400/30 transition-all relative">
                    {banner.url ? (
                      <>
                        <ImagePreview
                          src={banner.url}
                          alt={banner.alt || `Banner ${index + 1}`}
                          className="w-full h-full object-cover"
                          showFileName={false}
                        />
                        {/* Overlay con número */}
                        <div className="absolute top-2 left-2 bg-dark-800/90 backdrop-blur-sm text-white text-xs font-bold px-2.5 py-1 rounded-lg border border-white/20">
                          #{index + 1}
                        </div>
                      </>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-500">
                        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        <span className="flex items-center gap-2">
                          <svg className="w-4 h-4 text-success-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                          </svg>
                          Texto alternativo (SEO)
                        </span>
                      </label>
                      <input
                        type="text"
                        value={banner.alt || ''}
                        onChange={(e) => handleUpdateAlt(banner._id, e.target.value)}
                        placeholder="Ej: Banner promocional de verano 2024"
                        className="input-modern"
                        disabled={loading}
                      />
                      <p className="text-xs text-gray-400 mt-1">Descripción para accesibilidad y SEO</p>
                    </div>
                    
                    <button
                      type="button"
                      onClick={() => handleRemoveBanner(banner._id)}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-error-500/20 hover:bg-error-500/30 text-error-400 hover:text-error-300 transition-all text-sm font-medium"
                      disabled={loading}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Eliminar Banner
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Agregar banner */}
      <div>
        <input
          type="file"
          accept="image/*"
          onChange={handleAddBanner}
          className="hidden"
          id="banner-upload"
          disabled={loading}
        />
        <label
          htmlFor="banner-upload"
          className="flex flex-col items-center justify-center gap-3 w-full px-6 py-8 bg-white/5 border-2 border-dashed border-white/20 rounded-xl text-white cursor-pointer hover:bg-white/10 hover:border-success-400/50 transition-all group"
        >
          <div className="p-3 rounded-full bg-success-500/20 group-hover:bg-success-500/30 transition-colors">
            <svg className="w-8 h-8 text-success-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <div className="text-center">
            <p className="text-base font-semibold mb-1">Agregar Nuevo Banner</p>
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
          disabled={loading || banners.length === 0}
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
              <span>Guardar Banners</span>
            </div>
          )}
        </button>
      </div>
    </form>
  );
};

StoreBannerForm.propTypes = {
  currentBanner: PropTypes.array,
  onUpdate: PropTypes.func.isRequired,
  onClose: PropTypes.func,
};

export default StoreBannerForm;
