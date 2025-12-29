import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import PropTypes from 'prop-types';
import { addSection } from '../../services/storeConfigService';
import { getStoreConfig } from '../../services/storeConfigService';
import ImagePreview from '../../components/common/ImagePreview';

const StoreSectionsForm = ({ storeSlug, sections: currentSections, onAdd, onDelete, onClose, onRefresh }) => {
  const [sections, setSections] = useState(currentSections || []);
  const [newSection, setNewSection] = useState({
    titulo: '',
    contenido: '',
    imagen: null,
    imagenFile: null,
    imagenPreview: null,
    orden: (currentSections?.length || 0) + 1
  });
  const [loading, setLoading] = useState(false);
  const [addingSection, setAddingSection] = useState(false);

  useEffect(() => {
    if (currentSections) {
      setSections(currentSections);
    }
  }, [currentSections]);

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('La imagen es demasiado grande. Máximo 5MB.');
      return;
    }

    try {
      const reader = new FileReader();
      reader.onload = (e) => {
        setNewSection(prev => ({
          ...prev,
          imagenFile: file,
          imagenPreview: e.target.result
        }));
      };
      reader.readAsDataURL(file);
      toast.success('Imagen cargada', { icon: '📷' });
    } catch (error) {
      toast.error('Error al cargar imagen');
    }
  };

  const handleAddSection = async () => {
    if (!newSection.titulo.trim()) {
      toast.warning('El título es obligatorio');
      return;
    }
    if (!newSection.contenido.trim()) {
      toast.warning('El contenido es obligatorio');
      return;
    }

    if (!storeSlug) {
      toast.error('No se encontró el slug de la tienda');
      return;
    }

    setAddingSection(true);
    try {
      // Crear FormData para enviar
      const formData = new FormData();
      formData.append('titulo', newSection.titulo.trim());
      formData.append('contenido', newSection.contenido.trim());
      formData.append('orden', newSection.orden.toString());

      // Si hay imagen, agregarla al FormData
      if (newSection.imagenFile) {
        formData.append('imagen', newSection.imagenFile);
      }

      // Hacer POST a la API
      const response = await addSection(storeSlug, formData);
      
      toast.success('Sección agregada correctamente', { icon: '✅' });
      
      // Limpiar el formulario
      setNewSection({
        titulo: '',
        contenido: '',
        imagen: null,
        imagenFile: null,
        imagenPreview: null,
        orden: (sections?.length || 0) + 2
      });

      // Actualizar la lista de secciones desde el servidor
      if (onRefresh) {
        onRefresh();
      } else {
        // Si no hay onRefresh, obtener las secciones directamente
        const configResponse = await getStoreConfig(storeSlug);
        const config = configResponse.data?.configuracionTienda || configResponse.data;
        const updatedSections = config.secciones || config.seccionesPersonalizadas || [];
        setSections(updatedSections);
      }
    } catch (error) {
      console.error('Error al agregar sección:', error);
      const errorMessage = error.response?.data?.msg || error.message || 'Error al agregar la sección';
      toast.error(errorMessage);
    } finally {
      setAddingSection(false);
    }
  };

  const handleDeleteSection = async (sectionId) => {
    if (!sectionId) {
      toast.error('No se pudo identificar la sección');
      return;
    }

    if (!window.confirm('¿Estás seguro de que deseas eliminar esta sección?')) {
      return;
    }

    try {
      await onDelete(sectionId);
      toast.success('Sección eliminada correctamente', { icon: '🗑️' });
      
      // Actualizar la lista
      if (onRefresh) {
        onRefresh();
      } else {
        const configResponse = await getStoreConfig(storeSlug);
        const config = configResponse.data?.configuracionTienda || configResponse.data;
        const updatedSections = config.secciones || config.seccionesPersonalizadas || [];
        setSections(updatedSections);
      }
    } catch (error) {
      console.error('Error al eliminar sección:', error);
      toast.error('Error al eliminar la sección');
    }
  };

  return (
    <div className="space-y-6">
      {/* Agregar nueva sección */}
      <div className="glass-card p-6 space-y-4">
        <h4 className="text-lg font-semibold text-white flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          + Agregar Nueva Sección
        </h4>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Título <span className="text-error-400">*</span>
          </label>
          <input
            type="text"
            value={newSection.titulo}
            onChange={(e) => setNewSection(prev => ({ ...prev, titulo: e.target.value }))}
            placeholder="Ej: Sobre Nosotros"
            className="input-modern"
            disabled={addingSection}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Contenido <span className="text-error-400">*</span>
          </label>
          <textarea
            value={newSection.contenido}
            onChange={(e) => setNewSection(prev => ({ ...prev, contenido: e.target.value }))}
            placeholder="Describe tu sección..."
            rows={4}
            className="input-modern resize-none"
            disabled={addingSection}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Imagen (opcional)
          </label>
          {newSection.imagenPreview && (
            <div className="mb-3 rounded-lg overflow-hidden">
              <img src={newSection.imagenPreview} alt="Preview" className="w-full h-32 object-cover" />
            </div>
          )}
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
            id="section-image"
            disabled={addingSection}
          />
          <label
            htmlFor="section-image"
            className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white cursor-pointer hover:bg-white/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {newSection.imagenPreview ? 'Cambiar imagen' : 'Seleccionar imagen'}
          </label>
        </div>

        <button
          type="button"
          onClick={handleAddSection}
          className="btn-primary w-full"
          disabled={addingSection || !newSection.titulo.trim() || !newSection.contenido.trim()}
        >
          {addingSection ? (
            <div className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Agregando...</span>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>+ Agregar Sección</span>
            </div>
          )}
        </button>
      </div>

      {/* Lista de secciones */}
      {sections && sections.length > 0 && (
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-white">Secciones Actuales ({sections.length})</h4>
          {sections.map((section, index) => {
            // Extraer URL de la imagen (puede ser objeto con url o string directo)
            const sectionImage = typeof section.imagen === 'object' && section.imagen !== null
              ? (section.imagen?.url || section.imagen)
              : (section.imagen || section.imagenPreview);
            const sectionId = section.id || section._id;
            
            return (
              <div key={sectionId || index} className="glass-card p-4">
                <div className="flex items-start gap-4">
                  {sectionImage && (
                    <div className="w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-white/5">
                      <ImagePreview
                        src={sectionImage}
                        alt={section.titulo || `Sección ${index + 1}`}
                        className="w-full h-full object-cover"
                        showFileName={false}
                      />
                    </div>
                  )}
                  <div className="flex-1">
                    <h5 className="font-semibold text-white mb-1">{section.titulo || 'Sin título'}</h5>
                    <p className="text-sm text-gray-400 line-clamp-2">{section.contenido || 'Sin contenido'}</p>
                    {section.orden && (
                      <p className="text-xs text-gray-500 mt-1">Orden: {section.orden}</p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeleteSection(sectionId)}
                    className="p-2 rounded-lg bg-error-500/20 hover:bg-error-500/30 transition-colors"
                    title="Eliminar sección"
                  >
                    <svg className="w-4 h-4 text-error-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Botones */}
      <div className="flex gap-3 justify-end pt-4 border-t border-white/10">
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            disabled={addingSection}
            className="btn-secondary"
          >
            Cancelar
          </button>
        )}
        <button
          type="button"
          onClick={onClose}
          disabled={addingSection}
          className="btn-primary"
        >
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>✓ Guardar Secciones</span>
          </div>
        </button>
      </div>
    </div>
  );
};

StoreSectionsForm.propTypes = {
  storeSlug: PropTypes.string.isRequired,
  sections: PropTypes.array,
  onAdd: PropTypes.func,
  onDelete: PropTypes.func.isRequired,
  onClose: PropTypes.func,
  onRefresh: PropTypes.func,
};

export default StoreSectionsForm;
