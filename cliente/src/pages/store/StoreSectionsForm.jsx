import { useState } from 'react';
import { toast } from 'react-toastify';
import PropTypes from 'prop-types';

const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    if (file.size > 2 * 1024 * 1024) {
      reject(new Error('La imagen es demasiado grande. Máximo 2MB.'));
      return;
    }
    
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
};

const StoreSectionsForm = ({ currentSections, onUpdate, onClose }) => {
  const [sections, setSections] = useState(currentSections || []);
  const [newSection, setNewSection] = useState({
    titulo: '',
    contenido: '',
    imagen: null,
    imagenPreview: null,
    orden: sections.length + 1
  });
  const [loading, setLoading] = useState(false);

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const base64 = await fileToBase64(file);
      setNewSection(prev => ({
        ...prev,
        imagen: base64,
        imagenPreview: base64
      }));
      toast.success('Imagen cargada', { icon: '📷' });
    } catch (error) {
      toast.error(error.message || 'Error al cargar imagen');
    }
  };

  const handleAddSection = () => {
    if (!newSection.titulo.trim()) {
      toast.warning('El título es obligatorio');
      return;
    }
    if (!newSection.contenido.trim()) {
      toast.warning('El contenido es obligatorio');
      return;
    }

    const section = {
      ...newSection,
      _id: Date.now().toString(),
      orden: sections.length + 1
    };

    setSections(prev => [...prev, section]);
    setNewSection({
      titulo: '',
      contenido: '',
      imagen: null,
      imagenPreview: null,
      orden: sections.length + 2
    });
    toast.success('Sección agregada', { icon: '✅' });
  };

  const handleRemoveSection = (id) => {
    setSections(prev => prev.filter(s => s._id !== id));
    toast.info('Sección eliminada');
  };

  const handleMoveUp = (index) => {
    if (index === 0) return;
    const newSections = [...sections];
    [newSections[index], newSections[index - 1]] = [newSections[index - 1], newSections[index]];
    setSections(newSections);
  };

  const handleMoveDown = (index) => {
    if (index === sections.length - 1) return;
    const newSections = [...sections];
    [newSections[index], newSections[index + 1]] = [newSections[index + 1], newSections[index]];
    setSections(newSections);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    setLoading(true);
    try {
      await onUpdate({ sections: sections.map((s, i) => ({ ...s, orden: i + 1 })) });
      if (onClose) onClose();
    } catch (error) {
      console.error('Error al actualizar secciones:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Agregar nueva sección */}
      <div className="glass-card p-6 space-y-4">
        <h4 className="text-lg font-semibold text-white flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Agregar Nueva Sección
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
          />
          <label
            htmlFor="section-image"
            className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white cursor-pointer hover:bg-white/20 transition-all"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {newSection.imagen ? 'Cambiar imagen' : 'Seleccionar imagen'}
          </label>
        </div>

        <button
          type="button"
          onClick={handleAddSection}
          className="btn-primary w-full"
        >
          <div className="flex items-center justify-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>Agregar Sección</span>
          </div>
        </button>
      </div>

      {/* Lista de secciones */}
      {sections.length > 0 && (
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-white">Secciones Actuales ({sections.length})</h4>
          {sections.map((section, index) => (
            <div key={section._id} className="glass-card p-4">
              <div className="flex items-start gap-4">
                {section.imagenPreview && (
                  <div className="w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-white/5">
                    <img src={section.imagenPreview} alt={section.titulo} className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="flex-1">
                  <h5 className="font-semibold text-white mb-1">{section.titulo}</h5>
                  <p className="text-sm text-gray-400 line-clamp-2">{section.contenido}</p>
                </div>
                <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => handleMoveUp(index)}
                    disabled={index === 0}
                    className="p-2 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMoveDown(index)}
                    disabled={index === sections.length - 1}
                    className="p-2 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemoveSection(section._id)}
                    className="p-2 rounded-lg bg-error-500/20 hover:bg-error-500/30 transition-colors"
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
      )}

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
          disabled={loading}
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
              <span>Guardar Secciones</span>
            </div>
          )}
        </button>
      </div>
    </form>
  );
};

StoreSectionsForm.propTypes = {
  currentSections: PropTypes.array,
  onUpdate: PropTypes.func.isRequired,
  onClose: PropTypes.func,
};

export default StoreSectionsForm;
