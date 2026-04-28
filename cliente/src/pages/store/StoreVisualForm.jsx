import { useState, useEffect } from 'react';
import { updateVisual } from '../../services/storeConfigService';
import { toast } from 'react-toastify';
import PropTypes from 'prop-types';

const StoreVisualForm = ({ config, onUpdate, slug, onClose }) => {
  const [colorPrimario, setColorPrimario] = useState(config?.colorPrimario || '#3498db');
  const [colorSecundario, setColorSecundario] = useState(config?.colorSecundario || '#2ecc71');
  const [colorTexto, setColorTexto] = useState(config?.colorTexto || '#333333');
  const [mensaje, setMensaje] = useState(config?.mensaje || '');
  const [metaTitulo, setMetaTitulo] = useState(config?.metaTitulo || '');
  const [metaDescripcion, setMetaDescripcion] = useState(config?.metaDescripcion || '');
  const [loading, setLoading] = useState(false);

  // Actualizar estados cuando cambia la configuración
  useEffect(() => {
    if (config) {
      setColorPrimario(config.colorPrimario || '#3498db');
      setColorSecundario(config.colorSecundario || '#2ecc71');
      setColorTexto(config.colorTexto || '#333333');
      setMensaje(config.mensaje || '');
      setMetaTitulo(config.metaTitulo || '');
      setMetaDescripcion(config.metaDescripcion || '');
    }
  }, [config]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const updatedData = { 
        colorPrimario, 
        colorSecundario, 
        colorTexto, 
        mensaje, 
        metaTitulo, 
        metaDescripcion,
        timestamp: Date.now()
      };
      
      await updateVisual(slug, updatedData);
      toast.success('Configuración visual actualizada', { icon: '🎨' });

      if (onUpdate) {
        onUpdate(updatedData);
      }
      
      if (onClose) {
        onClose();
      }
    } catch (error) {
      console.error('Error al actualizar configuración visual:', error);
      toast.error('Error al actualizar la configuración visual');
    } finally {
      setLoading(false);
    }
  };

  // Para cambios de color, actualizar previsualización inmediata
  const handleColorChange = (setter, value) => {
    setter(value);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Info */}
      <div className="glass-card p-4 bg-purple-500/10 border-purple-400/30">
        <div className="flex items-start gap-3">
          <svg className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="text-sm text-gray-300">
            <p className="font-medium text-purple-300 mb-1">Personaliza la apariencia de tu tienda:</p>
            <ul className="list-disc list-inside space-y-1 text-gray-400">
              <li>Define los colores principales de tu marca</li>
              <li>Configura mensajes de bienvenida</li>
              <li>Optimiza los metadatos para SEO</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Selectores de Color */}
      <div className="grid grid-cols-3 gap-4">
        <div className="glass-card p-4">
          <label className="block text-sm font-medium text-gray-300 mb-3 text-center">Color Primario</label>
          <div className="flex flex-col items-center gap-2">
            <div className="relative group">
              <input 
                type="color" 
                value={colorPrimario} 
                onChange={e => handleColorChange(setColorPrimario, e.target.value)} 
                className="w-20 h-20 border-4 border-white/20 rounded-2xl cursor-pointer hover:border-primary-400/50 transition-all shadow-lg"
                disabled={loading}
              />
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            </div>
            <code className="text-xs font-mono bg-white/10 px-3 py-1.5 rounded-lg text-gray-300">{colorPrimario}</code>
          </div>
        </div>
        
        <div className="glass-card p-4">
          <label className="block text-sm font-medium text-gray-300 mb-3 text-center">Color Secundario</label>
          <div className="flex flex-col items-center gap-2">
            <div className="relative group">
              <input 
                type="color" 
                value={colorSecundario} 
                onChange={e => handleColorChange(setColorSecundario, e.target.value)} 
                className="w-20 h-20 border-4 border-white/20 rounded-2xl cursor-pointer hover:border-success-400/50 transition-all shadow-lg"
                disabled={loading}
              />
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-success-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            </div>
            <code className="text-xs font-mono bg-white/10 px-3 py-1.5 rounded-lg text-gray-300">{colorSecundario}</code>
          </div>
        </div>
        
        <div className="glass-card p-4">
          <label className="block text-sm font-medium text-gray-300 mb-3 text-center">Color de Texto</label>
          <div className="flex flex-col items-center gap-2">
            <div className="relative group">
              <input 
                type="color" 
                value={colorTexto} 
                onChange={e => handleColorChange(setColorTexto, e.target.value)} 
                className="w-20 h-20 border-4 border-white/20 rounded-2xl cursor-pointer hover:border-accent-400/50 transition-all shadow-lg"
                disabled={loading}
              />
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-accent-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            </div>
            <code className="text-xs font-mono bg-white/10 px-3 py-1.5 rounded-lg text-gray-300">{colorTexto}</code>
          </div>
        </div>
      </div>
      
      {/* Vista Previa */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-3">Vista Previa</label>
        <div className="glass-card p-6 rounded-xl border-2 border-white/10" style={{ backgroundColor: colorPrimario }}>
          <div className="font-bold text-xl mb-4" style={{ color: colorTexto }}>Ejemplo de Tienda</div>
          <div className="flex gap-3 flex-wrap">
            <button 
              className="px-5 py-2.5 rounded-xl font-semibold transition-all hover:scale-105 shadow-lg" 
              style={{ backgroundColor: colorSecundario, color: '#ffffff' }}
              type="button"
            >
              Botón Primario
            </button>
            <div 
              className="px-5 py-2.5 rounded-xl font-medium shadow-lg" 
              style={{ backgroundColor: '#ffffff', color: colorPrimario }}
            >
              Botón Secundario
            </div>
            <div className="px-5 py-2.5 rounded-xl font-medium border-2" style={{ borderColor: colorTexto, color: colorTexto }}>
              Botón con Borde
            </div>
          </div>
          <p className="mt-4 text-sm" style={{ color: colorTexto, opacity: 0.8 }}>
            Este es un ejemplo de cómo se verán los elementos en tu tienda con los colores seleccionados.
          </p>
        </div>
      </div>
      
      {/* Textos y SEO */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Mensaje de Bienvenida
          </label>
          <input 
            type="text" 
            placeholder="Ej: ¡Bienvenido a nuestra tienda!" 
            value={mensaje} 
            onChange={e => setMensaje(e.target.value)} 
            className="input-modern" 
            disabled={loading}
          />
          <p className="text-xs text-gray-400 mt-2">Mensaje que se mostrará en la página principal</p>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Meta Título (SEO)
          </label>
          <input 
            type="text" 
            placeholder="Ej: Mi Tienda - Los mejores productos" 
            value={metaTitulo} 
            onChange={e => setMetaTitulo(e.target.value)} 
            className="input-modern" 
            disabled={loading}
          />
          <p className="text-xs text-gray-400 mt-2">Título que aparece en los resultados de búsqueda (50-60 caracteres)</p>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Meta Descripción (SEO)
          </label>
          <textarea 
            placeholder="Ej: Encuentra los mejores productos al mejor precio. Envíos a todo el país." 
            value={metaDescripcion} 
            onChange={e => setMetaDescripcion(e.target.value)} 
            rows={3}
            className="input-modern resize-none" 
            disabled={loading}
          />
          <p className="text-xs text-gray-400 mt-2">Descripción que aparece en los resultados de búsqueda (150-160 caracteres)</p>
        </div>
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
          className="btn-primary" 
          disabled={loading}
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
              <span>Guardar Configuración</span>
            </div>
          )}
        </button>
      </div>
    </form>
  );
};

StoreVisualForm.propTypes = {
  config: PropTypes.object.isRequired,
  slug: PropTypes.string.isRequired,
  onUpdate: PropTypes.func.isRequired,
  onClose: PropTypes.func,
};

export default StoreVisualForm;

 