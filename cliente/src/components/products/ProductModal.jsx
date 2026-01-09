import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { toast } from 'react-toastify';
import ProductFormBasic from './ProductFormBasic';
import ProductFormFeatures from './ProductFormFeatures';
import ProductFormVariants from './ProductFormVariants';

const ProductModal = ({ isOpen, onClose, onSave, product = null, categories = [], localId }) => {
  const [activeTab, setActiveTab] = useState('basic');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    precio: '',
    precioAnterior: '',
    stock: '',
    categoria: '',
    local: localId || '',
    etiquetas: [],
    caracteristicas: [],
    variantes: [],
    imagenes: [],
    destacado: false,
    enOferta: false,
    porcentajeDescuento: 0
  });

  useEffect(() => {
    if (product) {
      const etiquetas = Array.isArray(product.etiquetas) 
        ? product.etiquetas 
        : (product.etiquetas ? JSON.parse(product.etiquetas) : []);
      
      const caracteristicas = Array.isArray(product.caracteristicas) 
        ? product.caracteristicas 
        : (product.caracteristicas ? JSON.parse(product.caracteristicas) : []);
      
      const variantes = Array.isArray(product.variantes) 
        ? product.variantes 
        : (product.variantes ? JSON.parse(product.variantes) : []);
      
      setFormData({
        nombre: product.nombre || '',
        descripcion: product.descripcion || '',
        precio: product.precio || '',
        precioAnterior: product.precioAnterior || product.precio || '',
        stock: product.stock || '',
        categoria: product.categoria || '',
        local: product.local || localId || '',
        etiquetas,
        caracteristicas,
        variantes,
        imagenes: product.imagenes || [],
        // Asegurar que los valores booleanos sean explícitos (true/false, no null/undefined)
        destacado: Boolean(product.destacado),
        enOferta: Boolean(product.enOferta),
        porcentajeDescuento: product.porcentajeDescuento || 0
      });
    } else {
      setFormData({
        nombre: '',
        descripcion: '',
        precio: '',
        precioAnterior: '',
        stock: '',
        categoria: categories.length > 0 ? categories[0]._id : '',
        local: localId || '',
        etiquetas: [],
        caracteristicas: [],
        variantes: [],
        imagenes: [],
        destacado: false,
        enOferta: false,
        porcentajeDescuento: 0
      });
    }
    
    setErrors({});
    setActiveTab('basic');
  }, [product, isOpen, localId, categories]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    
    setFormData(prev => ({
      ...prev,
      [name]: newValue
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const handleEtiquetasChange = (etiquetas) => {
    setFormData(prev => ({ ...prev, etiquetas }));
  };

  const handleCaracteristicasChange = (caracteristicas) => {
    setFormData(prev => ({ ...prev, caracteristicas }));
  };

  const handleVariantesChange = (variantes) => {
    setFormData(prev => ({ ...prev, variantes }));
  };

  const handleImagenesChange = (imagenes) => {
    const processedImages = typeof imagenes === 'function' 
      ? imagenes(formData.imagenes)
      : imagenes;
    
    const validatedImages = Array.isArray(processedImages) 
      ? processedImages.map((img, index) => {
          if (typeof img === 'object' && img !== null && img.url) {
            if (typeof img.url === 'string') {
              if (img.url.startsWith('data:image')) {
                return {
                  url: img.url,
                  alt: img.alt || `imagen-${index+1}`
                };
              }
              
              if (img.url.length > 100 && 
                  !img.url.startsWith('http') && 
                  !img.url.startsWith('/') && 
                  !img.url.includes('.')) {
                return {
                  url: `data:image/jpeg;base64,${img.url}`,
                  alt: img.alt || `imagen-${index+1}`
                };
              }
              
              return {
                url: img.url,
                alt: img.alt || `imagen-${index+1}`
              };
            }
          }
          
          if (typeof img === 'string' && img.startsWith('data:image')) {
            return {
              url: img,
              alt: `imagen-${index+1}`
            };
          }
          
          return img;
        })
      : [];
    
    setFormData(prev => ({
      ...prev,
      imagenes: validatedImages
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es obligatorio';
    }
    
    if (!formData.descripcion.trim()) {
      newErrors.descripcion = 'La descripción es obligatoria';
    }
    
    if (!formData.precio || parseFloat(formData.precio) <= 0) {
      newErrors.precio = 'El precio debe ser mayor a 0';
    }
    
    if (!formData.stock || parseInt(formData.stock) < 0) {
      newErrors.stock = 'El stock no puede ser negativo';
    }
    
    if (!formData.categoria) {
      newErrors.categoria = 'Debe seleccionar una categoría';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Por favor completa todos los campos obligatorios');
      setActiveTab('basic');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await onSave(formData);
      // El toast de éxito se muestra en la función handleSaveProduct
    } catch (error) {
      console.error('Error al guardar producto:', error);
      
      // Mostrar mensaje de error específico si está disponible
      const errorMessage = error?.message || 'Error al guardar el producto';
      toast.error(errorMessage);
      
      if (error.errors) {
        setErrors(error.errors);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const tabs = [
    { id: 'basic', label: 'Información Básica', icon: '📝' },
    { id: 'features', label: 'Características', icon: '⭐' },
    { id: 'variants', label: 'Variantes', icon: '🎨' },
  ];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content max-w-5xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary-500/20">
              <svg className="w-6 h-6 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-white">
              {product ? 'Editar Producto' : 'Agregar Nuevo Producto'}
            </h3>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 rounded-xl hover:bg-white/10 transition-colors text-gray-400 hover:text-white"
            disabled={isSubmitting}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto scrollbar-custom">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-primary-600 to-primary-500 text-white shadow-glow-primary'
                  : 'bg-white/10 text-gray-300 hover:bg-white/20'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Error general */}
        {errors.general && (
          <div className="mb-6 p-4 rounded-xl bg-error-500/10 border border-error-400/30 animate-slideDown">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-error-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-error-300 text-sm">{errors.general}</p>
            </div>
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Contenido por tabs */}
          <div className="min-h-[400px] max-h-[65vh] overflow-y-auto scrollbar-custom pr-2">
            {activeTab === 'basic' && (
              <ProductFormBasic
                formData={formData}
                categories={categories}
                errors={errors}
                onChange={handleChange}
                onEtiquetasChange={handleEtiquetasChange}
                onImagenesChange={handleImagenesChange}
              />
            )}
            
            {activeTab === 'features' && (
              <ProductFormFeatures
                caracteristicas={formData.caracteristicas}
                onChange={handleCaracteristicasChange}
              />
            )}
            
            {activeTab === 'variants' && (
              <ProductFormVariants
                variantes={formData.variantes}
                onChange={handleVariantesChange}
              />
            )}
          </div>

          {/* Botones */}
          <div className="flex gap-3 justify-end pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="btn-secondary"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary"
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Guardando...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>{product ? 'Actualizar' : 'Crear'} Producto</span>
                </div>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

ProductModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  product: PropTypes.object,
  categories: PropTypes.array.isRequired,
  localId: PropTypes.string,
};

export default ProductModal;
