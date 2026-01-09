import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import ImagePreview from '../../components/common/ImagePreview';
import PropTypes from 'prop-types';

const StoreLogoForm = ({ currentLogo, onUpdate, onClose }) => {
  const [logoAlt, setLogoAlt] = useState('');
  const [logoFile, setLogoFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [logoBase64, setLogoBase64] = useState(null);
  const [refreshKey, setRefreshKey] = useState(Date.now());

  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  };

  useEffect(() => {
    if (currentLogo) {
      if (typeof currentLogo === 'string') {
        setLogoBase64(currentLogo);
      } else if (typeof currentLogo === 'object' && currentLogo !== null) {
        // Si es un objeto, extraer la URL
        const logoUrl = currentLogo.url || currentLogo;
        if (logoUrl) {
          setLogoBase64(logoUrl);
          setLogoAlt(currentLogo.alt || '');
        }
      }
    }
  }, [currentLogo]);

  const compressImage = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          
          // COMPRESIÓN MÁS AGRESIVA para logos
          // Los logos no necesitan ser tan grandes
          const maxWidth = 400;  // Reducido de 800 a 400
          const maxHeight = 400; // Reducido de 800 a 400
          
          if (width > maxWidth || height > maxHeight) {
            if (width > height) {
              height = (height / width) * maxWidth;
              width = maxWidth;
            } else {
              width = (width / height) * maxHeight;
              height = maxHeight;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          
          const ctx = canvas.getContext('2d');
          
          // Para PNGs con transparencia, mantener el canal alpha
          ctx.clearRect(0, 0, width, height);
          
          ctx.drawImage(img, 0, 0, width, height);
          
          // Para LOGOS mantener el formato original si es PNG para preservar transparencia
          // Si es PNG, mantener PNG para preservar transparencia
          let outputFormat = file.type || 'image/png';
          let quality = undefined;
          
          // Si es PNG, mantener PNG para preservar transparencia
          if (file.type === 'image/png') {
            outputFormat = 'image/png';
            quality = undefined; // PNG no usa quality
          } else if (file.type === 'image/webp') {
            outputFormat = 'image/webp';
            quality = 0.8; // WebP con buena calidad
          } else {
            // Solo para JPEG usar compresión
            outputFormat = 'image/jpeg';
            quality = 0.85; // Calidad aceptable para logos
          }
          
          let dataUrl = canvas.toDataURL(outputFormat, quality);
          
          // Si aún es muy grande, comprimir más
          const sizeInKB = Math.round((dataUrl.length * 0.75) / 1024);
          console.log(`📏 Logo comprimido: ${outputFormat}, tamaño: ${sizeInKB}KB`);
          
          if (sizeInKB > 500) {
            console.log('⚠️ Logo aún muy grande, comprimiendo más...');
            // Comprimir aún más si supera 500KB
            if (outputFormat === 'image/png') {
              // Para PNG, reducir dimensiones pero mantener formato
              // Reducir dimensiones en un 20% más
              const newWidth = Math.round(width * 0.8);
              const newHeight = Math.round(height * 0.8);
              canvas.width = newWidth;
              canvas.height = newHeight;
              ctx.clearRect(0, 0, newWidth, newHeight);
              ctx.drawImage(img, 0, 0, newWidth, newHeight);
              dataUrl = canvas.toDataURL('image/png');
              const newSize = Math.round((dataUrl.length * 0.75) / 1024);
              console.log(`✅ PNG redimensionado: ${newSize}KB`);
            } else {
              // Reducir calidad aún más para otros formatos
              dataUrl = canvas.toDataURL(outputFormat, quality ? quality * 0.8 : undefined);
              const newSize = Math.round((dataUrl.length * 0.75) / 1024);
              console.log(`✅ Calidad reducida: ${newSize}KB`);
            }
          }
          
          resolve(dataUrl);
        };
        img.onerror = reject;
        img.src = e.target.result;
      };
      reader.onerror = reject;
    });
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validar tamaño (máx 5MB archivo original)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('La imagen no debe superar 5MB');
      return;
    }

    // Validar tipo
    if (!file.type.startsWith('image/')) {
      toast.error('El archivo debe ser una imagen');
      return;
    }

    try {
      toast.info('Comprimiendo imagen...', { icon: '⏳', autoClose: 2000 });
      const base64 = await compressImage(file);
      
      // Validar tamaño final del base64
      const finalSizeKB = Math.round((base64.length * 0.75) / 1024);
      console.log(`📦 Tamaño final del logo: ${finalSizeKB}KB`);
      
      if (finalSizeKB > 800) {
        toast.warning(`Imagen muy grande (${finalSizeKB}KB). Se comprimió al máximo pero puede tener problemas.`, { autoClose: 5000 });
      }
      
      setLogoFile(file);
      setLogoBase64(base64);
      toast.success(`✅ Imagen optimizada (${finalSizeKB}KB)`, { icon: '✨' });
    } catch (error) {
      console.error("Error al convertir imagen a base64:", error);
      toast.error("Error al procesar la imagen");
    }
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      const fakeEvent = { target: { files: [file] } };
      await handleFileChange(fakeEvent);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!logoBase64) {
      toast.warning('Debe seleccionar una imagen para el logo');
      return;
    }
    
    setLoading(true);
    try {
      await onUpdate({
        logoUrl: logoBase64,
        logoAlt: logoAlt || 'Logo de la tienda'
      });
      
      setRefreshKey(Date.now());
      if (onClose) onClose();
    } catch (error) {
      console.error('Error al actualizar el logo:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Vista previa */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-3">
          Vista Previa del Logo
        </label>
        <div 
          className="p-8 flex items-center justify-center min-h-[300px] rounded-2xl border-2 border-dashed border-white/20 hover:border-primary-400/40 transition-all relative overflow-hidden"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          style={{
            background: 'transparent'
          }}
        >
          {/* Patrón de cuadrícula MUY SUTIL para mostrar transparencia */}
          <div 
            className="absolute inset-0 pointer-events-none opacity-20"
            style={{
              backgroundImage: `
                linear-gradient(45deg, rgba(255, 255, 255, 0.05) 25%, transparent 25%),
                linear-gradient(-45deg, rgba(255, 255, 255, 0.05) 25%, transparent 25%),
                linear-gradient(45deg, transparent 75%, rgba(255, 255, 255, 0.05) 75%),
                linear-gradient(-45deg, transparent 75%, rgba(255, 255, 255, 0.05) 75%)
              `,
              backgroundSize: '16px 16px',
              backgroundPosition: '0 0, 0 8px, 8px -8px, -8px 0px'
            }}
          />
          
          {logoBase64 ? (
            <div className="flex items-center justify-center w-full h-full relative z-10">
              <ImagePreview
                src={logoBase64}
                alt={logoAlt || "Logo"} 
                className="max-h-64 max-w-full object-contain"
                transparentBackground={true}
                showFileName={false}
                style={{
                  background: 'transparent',
                  backgroundColor: 'transparent'
                }}
              />
            </div>
          ) : (
            <div className="text-center text-gray-600 relative z-10">
              <div className="p-4 rounded-full bg-primary-500/10 inline-block mb-4">
                <svg className="w-16 h-16 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="text-lg font-medium">Sin imagen</p>
              <p className="text-sm mt-1">Arrastra aquí tu logo o selecciona un archivo</p>
            </div>
          )}
        </div>
      </div>

      {/* Selector de archivo */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Logo de la tienda <span className="text-error-400">*</span>
        </label>
        <div className="relative">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
            id="logo-upload"
            disabled={loading}
          />
          <label
            htmlFor="logo-upload"
            className="flex flex-col items-center justify-center gap-3 w-full px-6 py-6 bg-white/5 border-2 border-dashed border-white/20 rounded-xl text-white cursor-pointer hover:bg-white/10 hover:border-primary-400/50 transition-all group"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
          >
            <div className="p-3 rounded-full bg-primary-500/20 group-hover:bg-primary-500/30 transition-colors">
              <svg className="w-8 h-8 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <div className="text-center">
              <p className="text-sm font-medium">{logoFile ? `📄 ${logoFile.name}` : 'Click para subir o arrastra tu archivo'}</p>
              <p className="text-xs text-gray-400 mt-1">PNG o JPG • 400x400px máx • Archivo: 5MB máx</p>
              <p className="text-xs text-success-400 mt-0.5">Se comprimirá automáticamente para el servidor</p>
            </div>
          </label>
        </div>
      </div>

      {/* Texto alternativo */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Texto alternativo (SEO)
        </label>
        <input
          type="text"
          value={logoAlt}
          onChange={(e) => setLogoAlt(e.target.value)}
          placeholder="Ej: Logo de mi tienda"
          className="input-modern"
          disabled={loading}
        />
        <p className="text-xs text-gray-400 mt-2">
          Descripción de la imagen para accesibilidad y SEO
        </p>
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
          disabled={loading || !logoBase64}
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
              <span>Guardar Logo</span>
            </div>
          )}
        </button>
      </div>
    </form>
  );
};

StoreLogoForm.propTypes = {
  currentLogo: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  onUpdate: PropTypes.func.isRequired,
  onClose: PropTypes.func,
};

export default StoreLogoForm;
