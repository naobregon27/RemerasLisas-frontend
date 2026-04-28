import { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import PropTypes from 'prop-types';
import {
  getAdminVideos,
  uploadAdminVideo,
  updateAdminVideo,
  deleteAdminVideo,
} from '../../services/storeConfigService';
import { resolveApiMediaUrl } from '../../config/apiConfig';

const MAX_MB = 12;
const EMPTY_UPLOAD = { file: null, previewUrl: null, titulo: '', descripcion: '' };

const StoreVideosForm = ({ storeSlug, onClose }) => {
  const [videos, setVideos] = useState([]);
  const [loadingList, setLoadingList] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [pending, setPending] = useState(EMPTY_UPLOAD);
  const fileInputRef = useRef(null);

  const fetchVideos = async () => {
    if (!storeSlug) return;
    try {
      setLoadingList(true);
      const data = await getAdminVideos(storeSlug);
      const list = Array.isArray(data?.videos) ? data.videos : Array.isArray(data) ? data : [];
      setVideos(
        list.map((v) => ({
          ...v,
          url: typeof v.url === 'string' ? resolveApiMediaUrl(v.url) : v.url,
        }))
      );
    } catch {
      toast.error('No se pudieron cargar los videos');
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    fetchVideos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storeSlug]);

  // Al seleccionar un archivo solo genera el preview, no sube
  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';

    if (file.size > MAX_MB * 1024 * 1024) {
      toast.error(`El video supera el límite de ${MAX_MB}MB`);
      return;
    }
    const allowed = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo'];
    if (!allowed.includes(file.type)) {
      toast.error('Formato no soportado. Usar MP4, WebM, MOV o AVI.');
      return;
    }
    const previewUrl = URL.createObjectURL(file);
    setPending((p) => ({ ...p, file, previewUrl }));
  };

  const cancelPending = () => {
    if (pending.previewUrl) URL.revokeObjectURL(pending.previewUrl);
    setPending(EMPTY_UPLOAD);
  };

  // Sube el video solo cuando el usuario hace clic en "Guardar video"
  const handleUpload = async () => {
    if (!pending.file) return;
    const form = new FormData();
    form.append('video', pending.file);
    if (pending.titulo.trim()) form.append('titulo', pending.titulo.trim());
    if (pending.descripcion.trim()) form.append('descripcion', pending.descripcion.trim());

    setUploading(true);
    try {
      await uploadAdminVideo(storeSlug, form);
      toast.success('Video guardado correctamente', { icon: '🎬' });
      URL.revokeObjectURL(pending.previewUrl);
      setPending(EMPTY_UPLOAD);
      await fetchVideos();
    } catch (err) {
      const msg = err?.response?.data?.msg || err?.message || 'Error al subir el video';
      toast.error(msg);
    } finally {
      setUploading(false);
    }
  };

  const handleToggleActive = async (video) => {
    try {
      await updateAdminVideo(storeSlug, video._id, { activo: !video.activo });
      toast.success(video.activo ? 'Video ocultado' : 'Video activado', { icon: '👁️' });
      setVideos((prev) =>
        prev.map((v) => (v._id === video._id ? { ...v, activo: !v.activo } : v))
      );
    } catch {
      toast.error('No se pudo cambiar el estado del video');
    }
  };

  const handleSaveEdit = async (video) => {
    try {
      await updateAdminVideo(storeSlug, video._id, {
        titulo: video.titulo,
        descripcion: video.descripcion,
        orden: video.orden,
      });
      toast.success('Video actualizado', { icon: '✏️' });
      setEditingId(null);
    } catch {
      toast.error('No se pudo actualizar el video');
    }
  };

  const handleDelete = async (videoId) => {
    if (!window.confirm('¿Eliminar este video? La acción no se puede deshacer.')) return;
    try {
      await deleteAdminVideo(storeSlug, videoId);
      toast.success('Video eliminado', { icon: '🗑️' });
      setVideos((prev) => prev.filter((v) => v._id !== videoId));
    } catch {
      toast.error('No se pudo eliminar el video');
    }
  };

  const updateLocalVideo = (id, field, value) => {
    setVideos((prev) => prev.map((v) => (v._id === id ? { ...v, [field]: value } : v)));
  };

  return (
    <div className="space-y-6">
      {/* Info */}
      <div className="glass-card p-4 bg-blue-500/10 border-blue-400/30">
        <div className="flex items-start gap-3">
          <svg className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="text-sm text-gray-300">
            <p className="font-medium text-blue-300 mb-1">Gestión de videos de la tienda</p>
            <ul className="list-disc list-inside space-y-0.5 text-gray-400">
              <li>Máximo <span className="text-white font-semibold">{MAX_MB}MB</span> por video — usar clips cortos</li>
              <li>Formatos: MP4, WebM, MOV, AVI</li>
              <li>Los videos se guardan en base64 en la base de datos</li>
              <li>Solo los videos <span className="text-success-300">activos</span> son visibles en la web</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Formulario de subida */}
      <div className="glass-card p-6 space-y-4">
        <h4 className="text-lg font-semibold text-white flex items-center gap-2">
          <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          Subir Nuevo Video
        </h4>

        {/* PASO 1 — Seleccionar archivo (solo si no hay pending) */}
        {!pending.file && (
          <>
            <input
              ref={fileInputRef}
              type="file"
              accept="video/mp4,video/webm,video/quicktime,video/x-msvideo"
              onChange={handleFileSelect}
              className="hidden"
              disabled={uploading}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="flex flex-col items-center justify-center gap-3 w-full px-6 py-10 bg-white/5 border-2 border-dashed border-blue-400/30 rounded-xl text-white cursor-pointer hover:bg-blue-500/10 hover:border-blue-400/60 transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="p-3 rounded-full bg-blue-500/20 group-hover:bg-blue-500/30 transition-colors">
                <svg className="w-9 h-9 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.069A1 1 0 0121 8.82v6.36a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="text-center">
                <p className="text-base font-semibold">Seleccionar video</p>
                <p className="text-xs text-gray-400 mt-0.5">MP4, WebM, MOV, AVI • Máx {MAX_MB}MB</p>
              </div>
            </button>
          </>
        )}

        {/* PASO 2 — Preview + metadatos + botón Guardar */}
        {pending.file && (
          <div className="space-y-4">
            {/* Preview del video seleccionado */}
            <div className="rounded-xl overflow-hidden bg-black/50 border-2 border-blue-400/30 relative">
              <video
                src={pending.previewUrl}
                controls
                className="w-full max-h-52 object-contain"
              />
              <span className="absolute top-2 left-2 bg-blue-600/80 text-white text-xs font-semibold px-2 py-1 rounded-lg backdrop-blur-sm">
                Vista previa
              </span>
            </div>

            {/* Nombre del archivo */}
            <div className="flex items-center gap-2 px-3 py-2 bg-blue-500/10 border border-blue-400/20 rounded-lg">
              <svg className="w-4 h-4 text-blue-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.069A1 1 0 0121 8.82v6.36a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <span className="text-sm text-blue-200 truncate flex-1">{pending.file.name}</span>
              <span className="text-xs text-gray-400 flex-shrink-0">
                {(pending.file.size / (1024 * 1024)).toFixed(1)} MB
              </span>
            </div>

            {/* Campos opcionales */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Título (opcional)</label>
                <input
                  type="text"
                  value={pending.titulo}
                  onChange={(e) => setPending((p) => ({ ...p, titulo: e.target.value }))}
                  placeholder="Ej: Video institucional"
                  className="input-modern"
                  disabled={uploading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Descripción (opcional)</label>
                <input
                  type="text"
                  value={pending.descripcion}
                  onChange={(e) => setPending((p) => ({ ...p, descripcion: e.target.value }))}
                  placeholder="Breve descripción"
                  className="input-modern"
                  disabled={uploading}
                />
              </div>
            </div>

            {/* Acciones */}
            <div className="flex gap-3 pt-1">
              <button
                type="button"
                onClick={handleUpload}
                disabled={uploading}
                className="btn-primary flex-1 flex items-center justify-center gap-2"
              >
                {uploading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Guardando en base64...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <span>Guardar video</span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={cancelPending}
                disabled={uploading}
                className="btn-secondary px-5"
                title="Cancelar y elegir otro"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Lista de videos */}
      {loadingList ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-2 border-blue-400/30 border-t-blue-400 rounded-full animate-spin" />
        </div>
      ) : videos.length === 0 ? (
        <div className="glass-card p-10 flex flex-col items-center justify-center text-gray-500 border-2 border-dashed border-white/10 rounded-xl">
          <svg className="w-16 h-16 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.069A1 1 0 0121 8.82v6.36a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          <p className="text-sm">Sin videos cargados aún</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-lg font-semibold text-white flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
              </svg>
              Videos ({videos.length})
            </h4>
            <span className="text-xs text-gray-400 bg-white/10 px-3 py-1.5 rounded-lg">
              {videos.filter((v) => v.activo).length} activos
            </span>
          </div>

          <div className="space-y-3">
            {videos.map((video, index) => (
              <div
                key={video._id}
                className={`glass-card p-4 transition-all ${
                  video.activo ? 'border-success-400/20' : 'opacity-60 border-white/10'
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Player */}
                  <div className="w-48 h-28 flex-shrink-0 rounded-xl overflow-hidden bg-black/40 border-2 border-white/10 relative">
                    {video.url ? (
                      <video
                        src={video.url}
                        className="w-full h-full object-cover"
                        controls={false}
                        muted
                        preload="metadata"
                        onMouseEnter={(e) => e.target.play()}
                        onMouseLeave={(e) => { e.target.pause(); e.target.currentTime = 0; }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-600">
                        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.069A1 1 0 0121 8.82v6.36a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                    <div className="absolute top-1.5 left-1.5 bg-black/70 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center">
                      {index + 1}
                    </div>
                  </div>

                  {/* Datos */}
                  <div className="flex-1 min-w-0">
                    {editingId === video._id ? (
                      <div className="space-y-2">
                        <input
                          type="text"
                          value={video.titulo || ''}
                          onChange={(e) => updateLocalVideo(video._id, 'titulo', e.target.value)}
                          placeholder="Título"
                          className="input-modern text-sm py-2"
                        />
                        <input
                          type="text"
                          value={video.descripcion || ''}
                          onChange={(e) => updateLocalVideo(video._id, 'descripcion', e.target.value)}
                          placeholder="Descripción"
                          className="input-modern text-sm py-2"
                        />
                        <input
                          type="number"
                          value={video.orden ?? index + 1}
                          onChange={(e) => updateLocalVideo(video._id, 'orden', Number(e.target.value))}
                          placeholder="Orden"
                          min={1}
                          className="input-modern text-sm py-2 w-24"
                        />
                        <div className="flex gap-2 mt-2">
                          <button
                            type="button"
                            onClick={() => handleSaveEdit(video)}
                            className="btn-primary text-xs px-4 py-2"
                          >
                            Guardar
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingId(null)}
                            className="btn-secondary text-xs px-4 py-2"
                          >
                            Cancelar
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <p className="font-semibold text-white truncate">
                          {video.titulo || <span className="text-gray-500 italic">Sin título</span>}
                        </p>
                        <p className="text-sm text-gray-400 truncate mt-0.5">
                          {video.descripcion || <span className="italic">Sin descripción</span>}
                        </p>
                        <div className="flex items-center gap-3 mt-2">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${video.activo ? 'bg-success-500/20 text-success-300' : 'bg-gray-500/20 text-gray-400'}`}>
                            {video.activo ? '● Activo' : '○ Inactivo'}
                          </span>
                          {video.orden !== undefined && (
                            <span className="text-xs text-gray-500">Orden: {video.orden}</span>
                          )}
                          {video.createdAt && (
                            <span className="text-xs text-gray-600">
                              {new Date(video.createdAt).toLocaleDateString('es-AR')}
                            </span>
                          )}
                        </div>
                      </>
                    )}
                  </div>

                  {/* Acciones */}
                  {editingId !== video._id && (
                    <div className="flex flex-col gap-2 flex-shrink-0">
                      <button
                        type="button"
                        onClick={() => setEditingId(video._id)}
                        className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-all"
                        title="Editar"
                      >
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleToggleActive(video)}
                        className={`p-2 rounded-lg transition-all ${video.activo ? 'bg-yellow-500/20 hover:bg-yellow-500/30' : 'bg-success-500/20 hover:bg-success-500/30'}`}
                        title={video.activo ? 'Ocultar' : 'Activar'}
                      >
                        {video.activo ? (
                          <svg className="w-4 h-4 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                          </svg>
                        ) : (
                          <svg className="w-4 h-4 text-success-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(video._id)}
                        className="p-2 rounded-lg bg-error-500/20 hover:bg-error-500/30 transition-all"
                        title="Eliminar"
                      >
                        <svg className="w-4 h-4 text-error-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="flex justify-end pt-4 border-t border-white/10">
        {onClose && (
          <button type="button" onClick={onClose} className="btn-secondary">
            Cerrar
          </button>
        )}
      </div>
    </div>
  );
};

StoreVideosForm.propTypes = {
  storeSlug: PropTypes.string.isRequired,
  onClose: PropTypes.func,
};

export default StoreVideosForm;
