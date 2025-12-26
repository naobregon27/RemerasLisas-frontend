import { useState, useRef } from 'react';
import PropTypes from 'prop-types';

const ProductFormBasic = ({ 
  formData, 
  errors, 
  categories, 
  onChange, 
  onEtiquetasChange,
  onImagenesChange 
}) => {
  const [tagInput, setTagInput] = useState('');
  const fileInputRef = useRef(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState(null);

  const handleAddTag = () => {
    if (tagInput.trim() !== '' && !formData.etiquetas.includes(tagInput.trim())) {
      const newTags = [...formData.etiquetas, tagInput.trim()];
      onEtiquetasChange(newTags);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    const newTags = formData.etiquetas.filter(tag => tag !== tagToRemove);
    onEtiquetasChange(newTags);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const compressImage = (file) => {
    return new Promise((resolve, reject) => {
      try {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        
        reader.onload = (e) => {
          try {
            const img = new Image();
            
            img.onload = () => {
              try {
                const maxWidth = 800;
                const maxHeight = 800;
                const quality = 0.7;
                
                let width = img.width;
                let height = img.height;
                
                if (width > maxWidth) {
                  height = Math.round((height * maxWidth) / width);
                  width = maxWidth;
                }
                
                if (height > maxHeight) {
                  width = Math.round((width * maxHeight) / height);
                  height = maxHeight;
                }
                
                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;
                
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                
                const dataUrl = canvas.toDataURL('image/jpeg', quality);
                
                if (!dataUrl.startsWith('data:image')) {
                  reject(new Error('Error en el formato de la imagen'));
                  return;
                }
                
                resolve(dataUrl);
              } catch (err) {
                reject(err);
              }
            };
            
            img.onerror = () => reject(new Error('Error al cargar la imagen'));
            img.src = e.target.result;
          } catch (err) {
            reject(err);
          }
        };
        
        reader.onerror = () => reject(new Error('Error al leer el archivo'));
      } catch (err) {
        reject(err);
      }
    });
  };

  const handleImageUpload = async (event) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    
    setUploadingImage(true);
    setUploadError(null);
    
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        if (file.size > 5 * 1024 * 1024) {
          setUploadError(`El archivo ${file.name} es demasiado grande. Máximo 5MB.`);
          continue;
        }
        
        if (!file.type.startsWith('image/')) {
          setUploadError(`El archivo ${file.name} no es una imagen válida.`);
          continue;
        }
        
        try {
          const compressedImageUrl = await compressImage(file);
          
          const imageObject = {
            url: compressedImageUrl,
            alt: file.name.replace(/\.[^/.]+$/, '') || `imagen-${Date.now()}`
          };
          
          if (!imageObject.url || !imageObject.url.startsWith('data:image')) {
            throw new Error('La imagen no tiene el formato correcto después de la compresión');
          }
          
          const currentImages = Array.isArray(formData.imagenes) ? formData.imagenes : [];
          onImagenesChange([...currentImages, imageObject]);
        } catch (error) {
          setUploadError(`Error al procesar ${file.name}: ${error.message}`);
        }
      }
    } catch (error) {
      setUploadError(`Error al subir imágenes: ${error.message}`);
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveImage = (urlToRemove) => {
    const newImages = formData.imagenes.filter(img => {
      if (typeof img === 'object' && img.url) {
        return img.url !== urlToRemove;
      }
      return img !== urlToRemove;
    });
    onImagenesChange(newImages);
  };

  const renderImagePreview = (imagen, index) => {
    const url = typeof imagen === 'object' && imagen.url ? imagen.url : imagen;
    const nombre = typeof imagen === 'object' && imagen.alt ? imagen.alt : `Imagen ${index + 1}`;
    
    const handleImgError = (e) => {
      e.target.src = 'https://via.placeholder.com/150?text=Error';
      e.target.onerror = null;
    };

    return (
      <div key={index} className="relative group">
        <div className="aspect-square w-full overflow-hidden rounded-xl bg-white/5">
          <img
            src={url}
            alt={nombre}
            className="h-full w-full object-cover"
            onError={handleImgError}
          />
        </div>
        <button
          type="button"
          onClick={() => handleRemoveImage(url)}
          className="absolute top-2 right-2 p-1.5 rounded-lg bg-error-500/90 hover:bg-error-500 opacity-0 group-hover:opacity-100 transition-all"
        >
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <p className="mt-1 text-xs text-gray-400 truncate">{nombre}</p>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Nombre */}
        <div>
          <label htmlFor="nombre" className="block text-sm font-medium text-gray-300 mb-2">
            Nombre <span className="text-error-400">*</span>
          </label>
          <input
            type="text"
            id="nombre"
            name="nombre"
            value={formData.nombre}
            onChange={onChange}
            className={`input-modern ${errors.nombre ? 'border-error-400' : ''}`}
          />
          {errors.nombre && <p className="mt-1 text-sm text-error-400">{errors.nombre}</p>}
        </div>
        
        {/* Categoría */}
        <div>
          <label htmlFor="categoria" className="block text-sm font-medium text-gray-300 mb-2">
            Categoría <span className="text-error-400">*</span>
          </label>
          <select
            id="categoria"
            name="categoria"
            value={formData.categoria}
            onChange={onChange}
            className={`select-modern ${errors.categoria ? 'border-error-400' : ''}`}
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              color: '#ffffff'
            }}
          >
            <option value="" style={{ backgroundColor: 'rgba(10, 32, 29, 0.98)', color: '#ffffff' }}>
              Seleccionar categoría
            </option>
            {categories.map((cat) => (
              <option 
                key={cat._id} 
                value={cat._id}
                style={{ backgroundColor: 'rgba(10, 32, 29, 0.98)', color: '#ffffff' }}
              >
                {cat.nombre}
              </option>
            ))}
          </select>
          {errors.categoria && <p className="mt-1 text-sm text-error-400">{errors.categoria}</p>}
        </div>
      </div>
      
      {/* Descripción */}
      <div>
        <label htmlFor="descripcion" className="block text-sm font-medium text-gray-300 mb-2">
          Descripción <span className="text-error-400">*</span>
        </label>
        <textarea
          id="descripcion"
          name="descripcion"
          rows="3"
          value={formData.descripcion}
          onChange={onChange}
          className={`input-modern resize-none ${errors.descripcion ? 'border-error-400' : ''}`}
        />
        {errors.descripcion && <p className="mt-1 text-sm text-error-400">{errors.descripcion}</p>}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Precio */}
        <div>
          <label htmlFor="precio" className="block text-sm font-medium text-gray-300 mb-2">
            Precio <span className="text-error-400">*</span>
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
            <input
              type="number"
              id="precio"
              name="precio"
              min="0"
              step="0.01"
              value={formData.precio}
              onChange={onChange}
              className={`input-modern pl-7 ${errors.precio ? 'border-error-400' : ''}`}
            />
          </div>
          {errors.precio && <p className="mt-1 text-sm text-error-400">{errors.precio}</p>}
        </div>
        
        {/* Precio anterior */}
        <div>
          <label htmlFor="precioAnterior" className="block text-sm font-medium text-gray-300 mb-2">
            Precio anterior
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
            <input
              type="number"
              id="precioAnterior"
              name="precioAnterior"
              min="0"
              step="0.01"
              value={formData.precioAnterior}
              onChange={onChange}
              className="input-modern pl-7"
            />
          </div>
        </div>
        
        {/* Stock */}
        <div>
          <label htmlFor="stock" className="block text-sm font-medium text-gray-300 mb-2">
            Stock <span className="text-error-400">*</span>
          </label>
          <input
            type="number"
            id="stock"
            name="stock"
            min="0"
            value={formData.stock}
            onChange={onChange}
            className={`input-modern ${errors.stock ? 'border-error-400' : ''}`}
          />
          {errors.stock && <p className="mt-1 text-sm text-error-400">{errors.stock}</p>}
        </div>
      </div>
      
      {/* Checkboxes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <label 
          htmlFor="destacado"
          className={`flex items-center gap-3 glass-card p-4 cursor-pointer transition-all ${
            formData.destacado 
              ? 'bg-warning-500/20 border-warning-400/50' 
              : 'bg-white/5 hover:bg-white/10'
          }`}
        >
          <input
            type="checkbox"
            id="destacado"
            name="destacado"
            checked={formData.destacado}
            onChange={onChange}
            className="w-5 h-5 text-warning-600 bg-white/10 border-white/20 rounded focus:ring-warning-500 focus:ring-2"
          />
          <div className="flex items-center gap-2">
            <span className="text-xl">⭐</span>
            <span className="text-sm font-medium text-white">Producto destacado</span>
          </div>
        </label>
        
        <label 
          htmlFor="enOferta"
          className={`flex items-center gap-3 glass-card p-4 cursor-pointer transition-all ${
            formData.enOferta 
              ? 'bg-error-500/20 border-error-400/50' 
              : 'bg-white/5 hover:bg-white/10'
          }`}
        >
          <input
            type="checkbox"
            id="enOferta"
            name="enOferta"
            checked={formData.enOferta}
            onChange={onChange}
            className="w-5 h-5 text-error-600 bg-white/10 border-white/20 rounded focus:ring-error-500 focus:ring-2"
          />
          <div className="flex items-center gap-2">
            <span className="text-xl">🏷️</span>
            <span className="text-sm font-medium text-white">En oferta</span>
          </div>
        </label>
      </div>
      
      {/* Porcentaje de descuento - solo si está en oferta */}
      {formData.enOferta && (
        <div className="glass-card p-4 bg-error-500/5 border border-error-400/20">
          <label htmlFor="porcentajeDescuento" className="block text-sm font-medium text-white mb-2">
            Porcentaje de descuento
          </label>
          <div className="relative">
            <input
              type="number"
              id="porcentajeDescuento"
              name="porcentajeDescuento"
              min="0"
              max="100"
              value={formData.porcentajeDescuento}
              onChange={onChange}
              className="input-modern pr-8"
              placeholder="0"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-error-400 font-semibold">%</span>
          </div>
          {formData.porcentajeDescuento > 0 && formData.precio > 0 && (
            <p className="mt-2 text-sm text-gray-400">
              Precio con descuento: <span className="text-error-400 font-bold">
                ${((formData.precio * (1 - formData.porcentajeDescuento / 100))).toFixed(2)}
              </span>
            </p>
          )}
        </div>
      )}
      
      {/* Etiquetas */}
      <div>
        <label htmlFor="etiquetas" className="block text-sm font-medium text-gray-300 mb-2">
          Etiquetas
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            id="etiquetas"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="input-modern flex-1"
            placeholder="Añadir etiqueta"
          />
          <button
            type="button"
            onClick={handleAddTag}
            className="btn-primary px-4"
          >
            Añadir
          </button>
        </div>
        
        {formData.etiquetas.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {formData.etiquetas.map((tag, index) => (
              <span 
                key={index}
                className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-primary-500/20 text-primary-300 text-sm"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="hover:bg-primary-500/30 rounded-full p-0.5"
                >
                  <svg className="w-3 h-3" stroke="currentColor" fill="none" viewBox="0 0 8 8">
                    <path strokeLinecap="round" strokeWidth="1.5" d="M1 1l6 6m0-6L1 7" />
                  </svg>
                </button>
              </span>
            ))}
          </div>
        )}
      </div>
      
      {/* Imágenes */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-3">
          Imágenes del producto
        </label>
        
        <div 
          className="glass-card p-8 text-center cursor-pointer hover:bg-white/10 transition-all border-2 border-dashed border-white/20 hover:border-primary-400/50 group"
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            e.currentTarget.classList.add('border-primary-400', 'bg-primary-500/10');
          }}
          onDragLeave={(e) => {
            e.currentTarget.classList.remove('border-primary-400', 'bg-primary-500/10');
          }}
          onDrop={(e) => {
            e.preventDefault();
            e.currentTarget.classList.remove('border-primary-400', 'bg-primary-500/10');
            if (e.dataTransfer.files.length > 0) {
              const fakeEvent = { target: { files: e.dataTransfer.files } };
              handleImageUpload(fakeEvent);
            }
          }}
        >
          <div className="flex flex-col items-center gap-3">
            <div className="p-4 rounded-full bg-primary-500/20 group-hover:bg-primary-500/30 transition-colors">
              <svg className="w-10 h-10 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-300 mb-1">
                <span className="font-medium text-primary-400">Click para subir</span> o arrastra y suelta
              </p>
              <p className="text-xs text-gray-400">
                PNG, JPG, GIF hasta 5MB • Máximo 5 imágenes
              </p>
            </div>
          </div>
          
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageUpload}
            accept="image/*"
            multiple
            className="hidden"
          />
          
          {uploadingImage && (
            <div className="mt-3 flex items-center justify-center gap-2 text-primary-400">
              <div className="w-5 h-5 border-2 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />
              <span className="text-sm">Subiendo...</span>
            </div>
          )}
          
          {uploadError && (
            <p className="mt-2 text-sm text-error-400">{uploadError}</p>
          )}
        </div>
        
        {formData.imagenes.length > 0 && (
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {formData.imagenes.map((imagen, index) => renderImagePreview(imagen, index))}
          </div>
        )}
      </div>
    </div>
  );
};

ProductFormBasic.propTypes = {
  formData: PropTypes.object.isRequired,
  errors: PropTypes.object.isRequired,
  categories: PropTypes.array.isRequired,
  onChange: PropTypes.func.isRequired,
  onEtiquetasChange: PropTypes.func.isRequired,
  onImagenesChange: PropTypes.func.isRequired
};

export default ProductFormBasic;
