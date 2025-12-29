import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  getStoreConfig,
  updateLogo,
  updateBanner,
  updateCarrusel,
  addSection,
  deleteSection,
  updateVisual
} from '../../services/storeConfigService';
import StoreLogoForm from './StoreLogoForm';
import StoreBannerForm from './StoreBannerForm';
import StoreCarruselForm from './StoreCarruselForm';
import StoreSectionsForm from './StoreSectionsForm';
import StoreVisualForm from './StoreVisualForm';
import ImagePreview from '../../components/common/ImagePreview';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorState from '../../components/common/ErrorState';

// Componente para el Modal actualizado
const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
          <h3 className="text-2xl font-bold text-white">{title}</h3>
          <button 
            onClick={onClose} 
            className="p-2 rounded-xl hover:bg-white/10 transition-colors text-gray-400 hover:text-white"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

const StoreSettingsPage = () => {
  const navigate = useNavigate();
  const { user, profileData } = useSelector(state => state.auth);
  
  const [loading, setLoading] = useState(true);
  const [storeConfig, setStoreConfig] = useState(null);
  const [activeModal, setActiveModal] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Obtener el slug de la tienda del usuario
  const storeSlug = user?.local?.slug || profileData?.local?.slug || localStorage.getItem('store_slug');
  const localId = user?.local?._id || profileData?.local?._id;

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (storeSlug) {
      fetchStoreConfig();
    } else {
      console.error('No se encontró el slug de la tienda');
      toast.error('No se pudo identificar la tienda');
      setLoading(false);
    }
  }, [user, navigate, refreshTrigger, storeSlug]);

  const fetchStoreConfig = async () => {
    try {
      setLoading(true);
      const response = await getStoreConfig(storeSlug);
      const config = response.data?.configuracionTienda || response.data;
      
      console.log('Configuración de tienda cargada:', config);
      console.log('Banner en configuración:', config.banner);
      
      setStoreConfig(config);
      toast.success('Configuración cargada', { icon: '⚙️' });
    } catch (error) {
      console.error('Error al cargar configuración:', error);
      toast.error('Error al cargar la configuración de la tienda');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const openModal = (modalName) => {
    setActiveModal(modalName);
  };

  const closeModal = () => {
    setActiveModal(null);
  };

  const handleLogoUpdate = async (data) => {
    try {
      await updateLogo(storeSlug, data);
      toast.success('Logo actualizado correctamente', { icon: '🖼️' });
      closeModal();
      handleRefresh();
    } catch (error) {
      console.error('Error al actualizar logo:', error);
      toast.error('Error al actualizar el logo');
    }
  };

  const handleBannerUpdate = async (data) => {
    try {
      await updateBanner(storeSlug, data);
      toast.success('Banner actualizado correctamente', { icon: '🖼️' });
      closeModal();
      handleRefresh();
    } catch (error) {
      console.error('Error al actualizar banner:', error);
      toast.error('Error al actualizar el banner');
    }
  };

  const handleCarruselUpdate = async (data) => {
    try {
      await updateCarrusel(storeSlug, data);
      toast.success('Carrusel actualizado correctamente', { icon: '🎠' });
      closeModal();
      handleRefresh();
    } catch (error) {
      console.error('Error al actualizar carrusel:', error);
      toast.error('Error al actualizar el carrusel');
    }
  };

  const handleVisualUpdate = async (data) => {
    try {
      await updateVisual(storeSlug, data);
      toast.success('Visualización actualizada correctamente', { icon: '🎨' });
      closeModal();
      handleRefresh();
    } catch (error) {
      console.error('Error al actualizar visualización:', error);
      toast.error('Error al actualizar la visualización');
    }
  };

  const handleSectionAdd = async (data) => {
    try {
      await addSection(storeSlug, data);
      toast.success('Sección agregada correctamente', { icon: '➕' });
      closeModal();
      handleRefresh();
    } catch (error) {
      console.error('Error al agregar sección:', error);
      toast.error('Error al agregar la sección');
    }
  };

  const handleSectionDelete = async (sectionId) => {
    try {
      await deleteSection(storeSlug, sectionId);
      toast.success('Sección eliminada correctamente', { icon: '🗑️' });
      handleRefresh();
    } catch (error) {
      console.error('Error al eliminar sección:', error);
      toast.error('Error al eliminar la sección');
    }
  };

  if (loading) {
    return <LoadingSpinner fullScreen text="Cargando configuración de la tienda..." />;
  }

  if (!storeConfig) {
    return <ErrorState title="Error" message="No se pudo cargar la configuración" onRetry={fetchStoreConfig} />;
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="glass-card p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold gradient-title">Configuración de Tienda</h1>
            <p className="text-gray-400 mt-1">Personaliza la apariencia de tu tienda</p>
          </div>
          <button
            onClick={handleRefresh}
            className="btn-secondary flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Actualizar
          </button>
        </div>
      </div>

      {/* Grid de configuraciones */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Logo */}
        <div className="glass-card p-6 hover:border-primary-400/50 transition-all group cursor-pointer" onClick={() => openModal('logo')}>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-primary-500/20 group-hover:bg-primary-500/30 transition-colors">
              <svg className="w-6 h-6 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-white">Logo</h3>
              <p className="text-sm text-gray-400">Logo principal de tu tienda</p>
            </div>
          </div>
          
          {storeConfig.logo ? (
            <div className="mb-4">
              <div className="glass-card p-3 bg-white/5 rounded-xl">
                <div className="aspect-[3/1] rounded-lg overflow-hidden bg-white/5 border border-white/10 flex items-center justify-center">
                  <ImagePreview
                    src={typeof storeConfig.logo === 'object' ? storeConfig.logo?.url || storeConfig.logo : storeConfig.logo}
                    alt={typeof storeConfig.logo === 'object' ? storeConfig.logo?.alt || "Logo de la tienda" : "Logo de la tienda"}
                    className="max-h-20 max-w-full object-contain"
                    showFileName={false}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="mb-4 glass-card p-6 bg-white/5 rounded-xl flex flex-col items-center justify-center min-h-[120px] border-2 border-dashed border-white/20">
              <svg className="w-12 h-12 text-gray-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-sm text-gray-400">Sin logo configurado</p>
            </div>
          )}
          
          <p className="text-xs text-gray-500 mb-3">📐 Recomendado: 200x80px PNG</p>
          <button
            onClick={(e) => { e.stopPropagation(); openModal('logo'); }}
            className="btn-primary w-full group-hover:shadow-glow-primary"
          >
            {storeConfig.logo ? 'Cambiar Logo' : 'Configurar Logo'}
          </button>
        </div>

        {/* Banner Principal */}
        <div className="glass-card p-6 hover:border-primary-400/50 transition-all group cursor-pointer" onClick={() => openModal('banner')}>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-success-500/20 group-hover:bg-success-500/30 transition-colors">
              <svg className="w-6 h-6 text-success-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-white">Banner Principal</h3>
              <p className="text-sm text-gray-400">Imágenes destacadas</p>
            </div>
          </div>
          
          {((storeConfig.banner && Array.isArray(storeConfig.banner) && storeConfig.banner.length > 0) ||
            (storeConfig.bannerPrincipal && Array.isArray(storeConfig.bannerPrincipal) && storeConfig.bannerPrincipal.length > 0)) ? (
            <div className="mb-4">
              <div className="glass-card p-3 bg-white/5 rounded-xl">
                <div className="grid grid-cols-3 gap-2">
                  {(storeConfig.banner || storeConfig.bannerPrincipal || []).slice(0, 3).map((banner, idx) => {
                    // Extraer URL del banner (puede ser objeto con url o string directo)
                    const bannerUrl = typeof banner === 'string' 
                      ? banner 
                      : (banner?.url || (typeof banner === 'object' && banner !== null ? banner : null));
                    const bannerAlt = typeof banner === 'object' && banner !== null ? (banner?.alt || `Banner ${idx + 1}`) : `Banner ${idx + 1}`;
                    return (
                      <div key={banner?._id || idx} className="aspect-[3/1] rounded-lg overflow-hidden bg-white/5 border border-white/10">
                        {bannerUrl ? (
                          <ImagePreview
                            src={bannerUrl}
                            alt={bannerAlt}
                            className="w-full h-full object-cover"
                            showFileName={false}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-500">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                {(storeConfig.banner || storeConfig.bannerPrincipal || []).length > 3 && (
                  <p className="text-xs text-center text-gray-400 mt-2">+{(storeConfig.banner || storeConfig.bannerPrincipal || []).length - 3} más</p>
                )}
              </div>
              <p className="text-sm text-success-300 mt-2 flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {(storeConfig.banner || storeConfig.bannerPrincipal || []).length} {(storeConfig.banner || storeConfig.bannerPrincipal || []).length === 1 ? 'banner configurado' : 'banners configurados'}
              </p>
            </div>
          ) : (
            <div className="mb-4 glass-card p-6 bg-white/5 rounded-xl flex flex-col items-center justify-center min-h-[120px] border-2 border-dashed border-white/20">
              <svg className="w-12 h-12 text-gray-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-sm text-gray-400">Sin banners configurados</p>
            </div>
          )}
          
          <p className="text-xs text-gray-500 mb-3">📐 Recomendado: 1200x400px</p>
          <button
            onClick={(e) => { e.stopPropagation(); openModal('banner'); }}
            className="btn-primary w-full group-hover:shadow-glow-primary"
          >
            {storeConfig.banner && storeConfig.banner.length > 0 ? 'Gestionar Banners' : 'Agregar Banners'}
          </button>
        </div>

        {/* Carrusel */}
        <div className="glass-card p-6 hover:border-primary-400/50 transition-all group cursor-pointer" onClick={() => openModal('carrusel')}>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-accent-500/20 group-hover:bg-accent-500/30 transition-colors">
              <svg className="w-6 h-6 text-accent-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-white">Carrusel</h3>
              <p className="text-sm text-gray-400">Slides de la página principal</p>
            </div>
          </div>
          
          {storeConfig.carrusel && ((storeConfig.carrusel.imagenes && storeConfig.carrusel.imagenes.length > 0) || (Array.isArray(storeConfig.carrusel) && storeConfig.carrusel.length > 0)) ? (
            <div className="mb-4">
              <div className="glass-card p-3 bg-white/5 rounded-xl">
                <div className="grid grid-cols-3 gap-2">
                  {(storeConfig.carrusel.imagenes || storeConfig.carrusel).slice(0, 3).map((slide, idx) => {
                    const slideUrl = slide.url || slide;
                    return (
                      <div key={idx} className="aspect-video rounded-lg overflow-hidden bg-white/5">
                        {slideUrl ? (
                          <ImagePreview
                            src={slideUrl}
                            alt={slide.titulo || `Slide ${idx + 1}`}
                            className="w-full h-full object-cover"
                            showFileName={false}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-500">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                {(storeConfig.carrusel.imagenes || storeConfig.carrusel).length > 3 && (
                  <p className="text-xs text-center text-gray-400 mt-2">+{(storeConfig.carrusel.imagenes || storeConfig.carrusel).length - 3} más</p>
                )}
              </div>
              <p className="text-sm text-accent-300 mt-2 flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {(storeConfig.carrusel.imagenes || storeConfig.carrusel).length} {(storeConfig.carrusel.imagenes || storeConfig.carrusel).length === 1 ? 'slide' : 'slides'}
              </p>
            </div>
          ) : (
            <div className="mb-4 glass-card p-6 bg-white/5 rounded-xl flex flex-col items-center justify-center min-h-[120px] border-2 border-dashed border-white/20">
              <svg className="w-12 h-12 text-gray-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-sm text-gray-400">Sin slides en el carrusel</p>
            </div>
          )}
          
          <p className="text-xs text-gray-500 mb-3">📐 Recomendado: 1920x600px</p>
          <button
            onClick={(e) => { e.stopPropagation(); openModal('carrusel'); }}
            className="btn-primary w-full group-hover:shadow-glow-primary"
          >
            {(storeConfig.carrusel && ((storeConfig.carrusel.imagenes && storeConfig.carrusel.imagenes.length > 0) || (Array.isArray(storeConfig.carrusel) && storeConfig.carrusel.length > 0))) ? 'Gestionar Carrusel' : 'Configurar Carrusel'}
          </button>
        </div>

        {/* Configuración Visual (Colores y Textos) */}
        <div className="glass-card p-6 hover:border-primary-400/50 transition-all group cursor-pointer" onClick={() => openModal('visual')}>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-purple-500/20 group-hover:bg-purple-500/30 transition-colors">
              <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-white">Personalización Visual</h3>
              <p className="text-sm text-gray-400">Colores, textos y metadatos SEO</p>
            </div>
          </div>
          
          {storeConfig.colorPrimario && (
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg border-2 border-white/20" style={{ backgroundColor: storeConfig.colorPrimario }}></div>
                <div className="w-8 h-8 rounded-lg border-2 border-white/20" style={{ backgroundColor: storeConfig.colorSecundario }}></div>
                <div className="w-8 h-8 rounded-lg border-2 border-white/20" style={{ backgroundColor: storeConfig.colorTexto }}></div>
              </div>
              <p className="text-xs text-gray-400">Colores configurados</p>
            </div>
          )}
          
          <button
            onClick={(e) => { e.stopPropagation(); openModal('visual'); }}
            className="btn-primary w-full group-hover:shadow-glow-primary"
          >
            {storeConfig.colorPrimario ? 'Editar Colores' : 'Configurar Colores'}
          </button>
        </div>

        {/* Secciones Personalizadas */}
        <div className="glass-card p-6 hover:border-primary-400/50 transition-all group">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-warning-500/20">
              <svg className="w-6 h-6 text-warning-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-white">Secciones Personalizadas</h3>
              <p className="text-sm text-gray-400">Agrega secciones con imágenes y textos para tu página</p>
            </div>
          </div>
          
          {((storeConfig.secciones && storeConfig.secciones.length > 0) || 
            (storeConfig.seccionesPersonalizadas && storeConfig.seccionesPersonalizadas.length > 0)) && (
            <div className="mb-4">
              <div className="glass-card p-3 bg-white/5 rounded-xl">
                <div className="grid grid-cols-3 gap-2">
                  {(storeConfig.secciones || storeConfig.seccionesPersonalizadas || []).slice(0, 3).map((section, idx) => {
                    // Extraer URL de la imagen (puede ser objeto con url o string directo)
                    const sectionImage = typeof section.imagen === 'object' && section.imagen !== null
                      ? (section.imagen?.url || section.imagen)
                      : (section.imagen || section.imagenPreview);
                    return (
                      <div key={section.id || section._id || idx} className="aspect-video rounded-lg overflow-hidden bg-white/5 border border-white/10">
                        {sectionImage ? (
                          <ImagePreview
                            src={sectionImage}
                            alt={section.titulo || `Sección ${idx + 1}`}
                            className="w-full h-full object-cover"
                            showFileName={false}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-500">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                {(storeConfig.secciones || storeConfig.seccionesPersonalizadas || []).length > 3 && (
                  <p className="text-xs text-center text-gray-400 mt-2">+{(storeConfig.secciones || storeConfig.seccionesPersonalizadas || []).length - 3} más</p>
                )}
              </div>
              <p className="text-sm text-warning-300 mt-2 flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {(storeConfig.secciones || storeConfig.seccionesPersonalizadas || []).length} {(storeConfig.secciones || storeConfig.seccionesPersonalizadas || []).length === 1 ? 'sección creada' : 'secciones creadas'}
              </p>
            </div>
          )}
          
          <button
            onClick={() => openModal('sections')}
            className="btn-primary w-full"
          >
            Configurar
          </button>
        </div>
      </div>

      {/* Modales */}
      <Modal
        isOpen={activeModal === 'logo'}
        onClose={closeModal}
        title="Configurar Logo"
      >
        <StoreLogoForm
          currentLogo={storeConfig.logo}
          onUpdate={handleLogoUpdate}
          onClose={closeModal}
        />
      </Modal>

      <Modal
        isOpen={activeModal === 'banner'}
        onClose={closeModal}
        title="Configurar Banner Principal"
      >
        <StoreBannerForm
          currentBanner={storeConfig.banner}
          onUpdate={handleBannerUpdate}
          onClose={closeModal}
        />
      </Modal>

      <Modal
        isOpen={activeModal === 'carrusel'}
        onClose={closeModal}
        title="Configurar Carrusel"
      >
        <StoreCarruselForm
          currentCarrusel={storeConfig.carrusel}
          onUpdate={handleCarruselUpdate}
          onClose={closeModal}
        />
      </Modal>

      <Modal
        isOpen={activeModal === 'visual'}
        onClose={closeModal}
        title="Configuración Visual de la Tienda"
      >
        <StoreVisualForm
          config={storeConfig}
          slug={storeSlug}
          onUpdate={handleVisualUpdate}
          onClose={closeModal}
        />
      </Modal>

      <Modal
        isOpen={activeModal === 'sections'}
        onClose={closeModal}
        title="Gestionar Secciones Personalizadas"
      >
        <StoreSectionsForm
          storeSlug={storeSlug}
          sections={storeConfig.secciones || storeConfig.seccionesPersonalizadas || []}
          onAdd={handleSectionAdd}
          onDelete={handleSectionDelete}
          onClose={closeModal}
          onRefresh={handleRefresh}
        />
      </Modal>
    </div>
  );
};

export default StoreSettingsPage;
