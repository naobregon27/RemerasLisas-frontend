import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import PropTypes from 'prop-types';
import { addSection, deleteSection, updateSection } from '../../services/storeConfigService';
import ImagePreview from '../../components/common/ImagePreview';

const compressImage = (file) =>
  new Promise((resolve, reject) => {
    if (file.size > 5 * 1024 * 1024) {
      reject(new Error('La imagen supera 5MB'));
      return;
    }
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxW = 900;
        let w = img.width;
        let h = img.height;
        if (w > maxW) { h = Math.round((h * maxW) / w); w = maxW; }
        canvas.width = w;
        canvas.height = h;
        canvas.getContext('2d').drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL('image/jpeg', 0.8));
      };
      img.onerror = reject;
      img.src = ev.target.result;
    };
    reader.onerror = reject;
  });

const EMPTY_NEW = { titulo: '', contenido: '', imagenFile: null, imagenPreview: null };

const StoreSectionsForm = ({ storeSlug, sections: currentSections, onDelete, onClose, onRefresh }) => {
  const [sections, setSections] = useState(currentSections || []);
  const [newSection, setNewSection] = useState(EMPTY_NEW);
  const [addingSection, setAddingSection] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});

  useEffect(() => {
    setSections(currentSections || []);
  }, [currentSections]);

  const handleImageChange = async (e, forEdit = false) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const preview = await compressImage(file);
      if (forEdit) {
        setEditData((p) => ({ ...p, imagenFile: file, imagenPreview: preview }));
      } else {
        setNewSection((p) => ({ ...p, imagenFile: file, imagenPreview: preview }));
      }
      toast.success('Imagen lista', { icon: '📷' });
    } catch (err) {
      toast.error(err.message || 'Error al cargar imagen');
    }
  };

  const handleAddSection = async () => {
    if (!newSection.titulo.trim()) { toast.warning('El título es obligatorio'); return; }
    if (!newSection.contenido.trim()) { toast.warning('El contenido es obligatorio'); return; }
    if (!storeSlug) { toast.error('No se encontró el slug de la tienda'); return; }

    setAddingSection(true);
    try {
      const formData = new FormData();
      formData.append('titulo', newSection.titulo.trim());
      formData.append('contenido', newSection.contenido.trim());
      formData.append('orden', (sections?.length || 0) + 1);
      if (newSection.imagenFile) formData.append('imagen', newSection.imagenFile);

      await addSection(storeSlug, formData);
      toast.success('Sección agregada', { icon: '✅' });
      setNewSection(EMPTY_NEW);
      if (onRefresh) onRefresh();
    } catch (err) {
      toast.error(err.response?.data?.msg || err.message || 'Error al agregar la sección');
    } finally {
      setAddingSection(false);
    }
  };

  const handleDeleteSection = async (sectionId) => {
    if (!sectionId) { toast.error('No se pudo identificar la sección'); return; }
    if (!window.confirm('¿Eliminar esta sección?')) return;
    try {
      await onDelete(sectionId);
      toast.success('Sección eliminada', { icon: '🗑️' });
      if (onRefresh) onRefresh();
    } catch {
      toast.error('Error al eliminar la sección');
    }
  };

  const startEdit = (section) => {
    setEditingId(section._id || section.id);
    setEditData({
      titulo: section.titulo || '',
      contenido: section.contenido || '',
      imagenFile: null,
      imagenPreview: null,
    });
  };

  const handleSaveEdit = async (section) => {
    const sectionId = section._id || section.id;
    if (!editData.titulo.trim()) { toast.warning('El título es obligatorio'); return; }
    if (!editData.contenido.trim()) { toast.warning('El contenido es obligatorio'); return; }
    try {
      const formData = new FormData();
      formData.append('titulo', editData.titulo.trim());
      formData.append('contenido', editData.contenido.trim());
      if (editData.imagenFile) formData.append('imagen', editData.imagenFile);

      await updateSection(storeSlug, sectionId, formData);
      toast.success('Sección actualizada', { icon: '✏️' });
      setEditingId(null);
      if (onRefresh) onRefresh();
    } catch (err) {
      toast.error(err.response?.data?.msg || err.message || 'Error al actualizar la sección');
    }
  };

  return (
    <div className="space-y-6">
      {/* Agregar nueva sección */}
      <div className="glass-card p-6 space-y-4">
        <h4 className="text-lg font-semibold text-white flex items-center gap-2">
          <svg className="w-5 h-5 text-warning-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
            onChange={(e) => setNewSection((p) => ({ ...p, titulo: e.target.value }))}
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
            onChange={(e) => setNewSection((p) => ({ ...p, contenido: e.target.value }))}
            placeholder="Describe esta sección..."
            rows={4}
            className="input-modern resize-none"
            disabled={addingSection}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Imagen (opcional)</label>
          {newSection.imagenPreview && (
            <div className="mb-3 rounded-xl overflow-hidden border border-white/10">
              <img src={newSection.imagenPreview} alt="Preview" className="w-full h-32 object-cover" />
            </div>
          )}
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
            id="section-image-new"
            disabled={addingSection}
          />
          <label
            htmlFor="section-image-new"
            className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-white/5 border-2 border-dashed border-white/20 rounded-xl text-white cursor-pointer hover:bg-white/10 hover:border-warning-400/50 transition-all"
          >
            <svg className="w-5 h-5 text-warning-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {newSection.imagenPreview ? 'Cambiar imagen' : 'Seleccionar imagen'}
          </label>
          <p className="text-xs text-gray-500 mt-1">Se comprimirá a 900px • Máx 5MB</p>
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
              <span>Agregar Sección</span>
            </div>
          )}
        </button>
      </div>

      {/* Lista de secciones existentes */}
      {sections.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-lg font-semibold text-white">
            Secciones Actuales ({sections.length})
          </h4>
          {sections.map((section, index) => {
            const sectionId = section._id || section.id;
            const isEditing = editingId === sectionId;
            const sectionImage = isEditing && editData.imagenPreview
              ? editData.imagenPreview
              : typeof section.imagen === 'object' && section.imagen !== null
              ? section.imagen?.url
              : section.imagen;

            return (
              <div key={sectionId || index} className="glass-card p-4 hover:border-warning-400/30 transition-all">
                {isEditing ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-gray-400 mb-1">Título *</label>
                        <input
                          type="text"
                          value={editData.titulo}
                          onChange={(e) => setEditData((p) => ({ ...p, titulo: e.target.value }))}
                          className="input-modern text-sm py-2"
                        />
                      </div>
                      <div className="flex items-end">
                        <div className="w-full">
                          <label className="block text-xs text-gray-400 mb-1">Cambiar imagen</label>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleImageChange(e, true)}
                            className="hidden"
                            id={`section-image-edit-${sectionId}`}
                          />
                          <label
                            htmlFor={`section-image-edit-${sectionId}`}
                            className="flex items-center gap-2 px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-sm text-gray-300 cursor-pointer hover:bg-white/10 transition-all w-full justify-center"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            {editData.imagenFile ? editData.imagenFile.name : 'Nueva imagen'}
                          </label>
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Contenido *</label>
                      <textarea
                        value={editData.contenido}
                        onChange={(e) => setEditData((p) => ({ ...p, contenido: e.target.value }))}
                        rows={3}
                        className="input-modern text-sm resize-none"
                      />
                    </div>
                    {editData.imagenPreview && (
                      <img src={editData.imagenPreview} alt="Nueva imagen" className="w-full h-24 object-cover rounded-lg" />
                    )}
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleSaveEdit(section)}
                        className="btn-primary text-sm px-5 py-2"
                      >
                        Guardar
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingId(null)}
                        className="btn-secondary text-sm px-5 py-2"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-4">
                    {sectionImage && (
                      <div className="w-24 h-24 flex-shrink-0 rounded-xl overflow-hidden bg-white/5 border border-white/10">
                        <ImagePreview
                          src={sectionImage}
                          alt={section.titulo}
                          className="w-full h-full object-cover"
                          showFileName={false}
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h5 className="font-semibold text-white truncate">{section.titulo || 'Sin título'}</h5>
                      <p className="text-sm text-gray-400 line-clamp-2 mt-0.5">{section.contenido || 'Sin contenido'}</p>
                      {section.orden !== undefined && (
                        <p className="text-xs text-gray-500 mt-1">Orden: {section.orden}</p>
                      )}
                    </div>
                    <div className="flex flex-col gap-2 flex-shrink-0">
                      <button
                        type="button"
                        onClick={() => startEdit(section)}
                        className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-all"
                        title="Editar"
                      >
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteSection(sectionId)}
                        className="p-2 rounded-lg bg-error-500/20 hover:bg-error-500/30 transition-all"
                        title="Eliminar"
                      >
                        <svg className="w-4 h-4 text-error-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Footer */}
      <div className="flex gap-3 justify-end pt-4 border-t border-white/10">
        {onClose && (
          <button type="button" onClick={onClose} className="btn-secondary">
            Cerrar
          </button>
        )}
      </div>
    </div>
  );
};

StoreSectionsForm.propTypes = {
  storeSlug: PropTypes.string.isRequired,
  sections: PropTypes.array,
  onDelete: PropTypes.func.isRequired,
  onClose: PropTypes.func,
  onRefresh: PropTypes.func,
};

export default StoreSectionsForm;
