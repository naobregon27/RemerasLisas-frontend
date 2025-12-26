import { useState } from 'react';
import PropTypes from 'prop-types';

const ProductFormFeatures = ({ caracteristicas = [], onChange }) => {
  const [feature, setFeature] = useState({ nombre: '', valor: '' });
  const [editIndex, setEditIndex] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFeature(prev => ({ ...prev, [name]: value }));
  };

  const handleAddFeature = () => {
    if (!feature.nombre.trim() || !feature.valor.trim()) {
      return;
    }

    let updatedFeatures;

    if (editIndex !== null) {
      updatedFeatures = [...caracteristicas];
      updatedFeatures[editIndex] = { ...feature };
      setEditIndex(null);
    } else {
      updatedFeatures = [...caracteristicas, { ...feature }];
    }

    onChange(updatedFeatures);
    setFeature({ nombre: '', valor: '' });
  };

  const handleEdit = (index) => {
    setFeature({ ...caracteristicas[index] });
    setEditIndex(index);
  };

  const handleDelete = (index) => {
    const updatedFeatures = caracteristicas.filter((_, i) => i !== index);
    onChange(updatedFeatures);
    
    if (editIndex === index) {
      setEditIndex(null);
      setFeature({ nombre: '', valor: '' });
    }
  };

  const cancelEdit = () => {
    setEditIndex(null);
    setFeature({ nombre: '', valor: '' });
  };

  return (
    <div className="space-y-6">
      {/* Info */}
      <div className="glass-card p-4 bg-accent-500/10 border-accent-400/30">
        <div className="flex items-start gap-3">
          <svg className="w-5 h-5 text-accent-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="text-sm text-gray-300">
            <p className="font-medium text-accent-300 mb-1">Características del Producto</p>
            <p className="text-gray-400">Añade características específicas del producto como material, dimensiones, etc.</p>
          </div>
        </div>
      </div>

      {/* Formulario para agregar/editar */}
      <div className="glass-card p-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div>
            <label htmlFor="nombre" className="block text-sm font-medium text-gray-300 mb-2">
              Nombre
            </label>
            <input
              type="text"
              id="nombre"
              name="nombre"
              value={feature.nombre}
              onChange={handleInputChange}
              className="input-modern"
              placeholder="Ej: Material, Color, Talla"
            />
          </div>
          
          <div>
            <label htmlFor="valor" className="block text-sm font-medium text-gray-300 mb-2">
              Valor
            </label>
            <input
              type="text"
              id="valor"
              name="valor"
              value={feature.valor}
              onChange={handleInputChange}
              className="input-modern"
              placeholder="Ej: Algodón, Rojo, XL"
            />
          </div>
          
          <div className="flex items-end gap-2">
            <button
              type="button"
              onClick={handleAddFeature}
              className="btn-primary flex-1"
            >
              <div className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span>{editIndex !== null ? 'Actualizar' : 'Añadir'}</span>
              </div>
            </button>
            
            {editIndex !== null && (
              <button
                type="button"
                onClick={cancelEdit}
                className="btn-secondary px-4"
              >
                Cancelar
              </button>
            )}
          </div>
        </div>
      </div>
      
      {/* Lista de características */}
      {caracteristicas.length > 0 ? (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-300">Características agregadas ({caracteristicas.length})</h4>
          {caracteristicas.map((caract, index) => (
            <div 
              key={index} 
              className={`glass-card p-4 flex items-center justify-between transition-all ${
                editIndex === index ? 'bg-primary-500/20 border-primary-400/50' : 'bg-white/5'
              }`}
            >
              <div className="flex-1">
                <p className="font-medium text-white">{caract.nombre}</p>
                <p className="text-gray-400 text-sm">{caract.valor}</p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => handleEdit(index)}
                  className="p-2 rounded-lg bg-accent-500/20 hover:bg-accent-500/30 text-accent-400 transition-colors"
                  title="Editar"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(index)}
                  className="p-2 rounded-lg bg-error-500/20 hover:bg-error-500/30 text-error-400 transition-colors"
                  title="Eliminar"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="glass-card p-8 text-center bg-white/5">
          <svg className="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <p className="text-gray-400">No hay características definidas</p>
          <p className="text-gray-500 text-sm mt-1">Agrega características para describir mejor tu producto</p>
        </div>
      )}
    </div>
  );
};

ProductFormFeatures.propTypes = {
  caracteristicas: PropTypes.array,
  onChange: PropTypes.func.isRequired
};

export default ProductFormFeatures;
