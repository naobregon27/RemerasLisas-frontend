import { useState } from 'react';
import PropTypes from 'prop-types';

const ProductFormVariants = ({ variantes = [], onChange }) => {
  const [variantName, setVariantName] = useState('');
  const [editingVariantIndex, setEditingVariantIndex] = useState(null);
  const [showOptionsForm, setShowOptionsForm] = useState(false);
  const [currentVariant, setCurrentVariant] = useState(null);
  const [option, setOption] = useState({ valor: '', precio: '', stock: '' });
  const [editingOptionIndex, setEditingOptionIndex] = useState(null);

  const handleAddVariant = () => {
    if (!variantName.trim()) return;
    
    const newVariant = {
      nombre: variantName,
      opciones: []
    };
    
    if (editingVariantIndex !== null) {
      const updatedVariants = [...variantes];
      updatedVariants[editingVariantIndex].nombre = variantName;
      onChange(updatedVariants);
      setEditingVariantIndex(null);
    } else {
      onChange([...variantes, newVariant]);
    }
    
    setVariantName('');
  };

  const handleEditVariant = (index) => {
    setVariantName(variantes[index].nombre);
    setEditingVariantIndex(index);
  };

  const handleDeleteVariant = (index) => {
    const updatedVariants = variantes.filter((_, i) => i !== index);
    onChange(updatedVariants);
    
    if (editingVariantIndex === index) {
      setEditingVariantIndex(null);
      setVariantName('');
    }
  };

  const handleManageOptions = (variant, index) => {
    setCurrentVariant({ ...variant, index });
    setShowOptionsForm(true);
  };

  const handleAddOption = () => {
    if (!option.valor.trim() || !option.precio || !option.stock) return;
    
    const updatedVariants = [...variantes];
    const variantIndex = currentVariant.index;
    
    const formattedOption = {
      valor: option.valor,
      precio: parseFloat(option.precio),
      stock: parseInt(option.stock)
    };
    
    if (editingOptionIndex !== null) {
      updatedVariants[variantIndex].opciones[editingOptionIndex] = formattedOption;
      setEditingOptionIndex(null);
    } else {
      if (!updatedVariants[variantIndex].opciones) {
        updatedVariants[variantIndex].opciones = [];
      }
      updatedVariants[variantIndex].opciones.push(formattedOption);
    }
    
    onChange(updatedVariants);
    setOption({ valor: '', precio: '', stock: '' });
    
    setCurrentVariant({
      ...currentVariant,
      opciones: updatedVariants[variantIndex].opciones
    });
  };

  const handleEditOption = (optionIndex) => {
    const targetOption = currentVariant.opciones[optionIndex];
    setOption({
      valor: targetOption.valor,
      precio: targetOption.precio.toString(),
      stock: targetOption.stock.toString()
    });
    setEditingOptionIndex(optionIndex);
  };

  const handleDeleteOption = (optionIndex) => {
    const updatedVariants = [...variantes];
    const variantIndex = currentVariant.index;
    
    updatedVariants[variantIndex].opciones = updatedVariants[variantIndex].opciones.filter(
      (_, i) => i !== optionIndex
    );
    
    onChange(updatedVariants);
    
    setCurrentVariant({
      ...currentVariant,
      opciones: updatedVariants[variantIndex].opciones
    });
    
    if (editingOptionIndex === optionIndex) {
      setEditingOptionIndex(null);
      setOption({ valor: '', precio: '', stock: '' });
    }
  };

  const handleBackToVariants = () => {
    setShowOptionsForm(false);
    setCurrentVariant(null);
    setOption({ valor: '', precio: '', stock: '' });
    setEditingOptionIndex(null);
  };

  const cancelEditVariant = () => {
    setEditingVariantIndex(null);
    setVariantName('');
  };

  const cancelEditOption = () => {
    setEditingOptionIndex(null);
    setOption({ valor: '', precio: '', stock: '' });
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
            <p className="font-medium text-accent-300 mb-1">Variantes del Producto</p>
            <p className="text-gray-400">Añade variantes como tallas, colores u otras opciones con sus precios y stock específicos.</p>
          </div>
        </div>
      </div>

      {!showOptionsForm ? (
        <>
          {/* Formulario para añadir/editar variantes */}
          <div className="glass-card p-4">
            <div className="flex items-end gap-2">
              <div className="flex-1">
                <label htmlFor="variantName" className="block text-sm font-medium text-gray-300 mb-2">
                  Nombre de la variante
                </label>
                <input
                  type="text"
                  id="variantName"
                  value={variantName}
                  onChange={(e) => setVariantName(e.target.value)}
                  className="input-modern"
                  placeholder="Ej: Talla, Color, Material"
                />
              </div>
              <button
                type="button"
                onClick={handleAddVariant}
                className="btn-primary"
              >
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span>{editingVariantIndex !== null ? 'Actualizar' : 'Añadir'}</span>
                </div>
              </button>
              
              {editingVariantIndex !== null && (
                <button
                  type="button"
                  onClick={cancelEditVariant}
                  className="btn-secondary px-4"
                >
                  Cancelar
                </button>
              )}
            </div>
          </div>
          
          {/* Lista de variantes */}
          {variantes.length > 0 ? (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-300">Variantes agregadas ({variantes.length})</h4>
              {variantes.map((variante, index) => (
                <div
                  key={index}
                  className={`glass-card p-4 flex items-center justify-between transition-all ${
                    editingVariantIndex === index ? 'bg-primary-500/20 border-primary-400/50' : 'bg-white/5'
                  }`}
                >
                  <div className="flex-1 flex items-center gap-3">
                    <p className="font-medium text-white text-lg">{variante.nombre}</p>
                    <span className="px-2 py-1 rounded-lg bg-accent-500/20 text-accent-300 text-xs font-medium">
                      {variante.opciones?.length || 0} opciones
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleManageOptions(variante, index)}
                      className="p-2 rounded-lg bg-primary-500/20 hover:bg-primary-500/30 text-primary-400 transition-colors"
                      title="Gestionar opciones"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleEditVariant(index)}
                      className="p-2 rounded-lg bg-accent-500/20 hover:bg-accent-500/30 text-accent-400 transition-colors"
                      title="Editar variante"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteVariant(index)}
                      className="p-2 rounded-lg bg-error-500/20 hover:bg-error-500/30 text-error-400 transition-colors"
                      title="Eliminar variante"
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
              <p className="text-gray-400">No hay variantes definidas</p>
              <p className="text-gray-500 text-sm mt-1">Agrega variantes si tu producto tiene opciones como tallas o colores</p>
            </div>
          )}
        </>
      ) : (
        <>
          {/* Formulario para gestionar opciones de una variante */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 glass-card p-3 bg-accent-500/10">
              <button
                type="button"
                onClick={handleBackToVariants}
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
              >
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </button>
              <h4 className="text-lg font-medium text-white">
                Opciones para: <span className="text-accent-300">{currentVariant?.nombre}</span>
              </h4>
            </div>
            
            <div className="glass-card p-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Valor</label>
                  <input
                    type="text"
                    value={option.valor}
                    onChange={(e) => setOption({...option, valor: e.target.value})}
                    className="input-modern"
                    placeholder="Ej: XL, Rojo, etc."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Precio</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={option.precio}
                      onChange={(e) => setOption({...option, precio: e.target.value})}
                      className="input-modern pl-7"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Stock</label>
                  <input
                    type="number"
                    min="0"
                    value={option.stock}
                    onChange={(e) => setOption({...option, stock: e.target.value})}
                    className="input-modern"
                  />
                </div>
                
                <div className="flex items-end gap-2">
                  <button
                    type="button"
                    onClick={handleAddOption}
                    className="btn-primary flex-1"
                  >
                    {editingOptionIndex !== null ? 'Actualizar' : 'Añadir'}
                  </button>
                  
                  {editingOptionIndex !== null && (
                    <button
                      type="button"
                      onClick={cancelEditOption}
                      className="btn-secondary px-4"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>
            </div>
            
            {/* Lista de opciones */}
            {currentVariant?.opciones?.length > 0 ? (
              <div className="glass-card p-4 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left py-2 text-gray-400 font-medium">Valor</th>
                      <th className="text-right py-2 text-gray-400 font-medium">Precio</th>
                      <th className="text-right py-2 text-gray-400 font-medium">Stock</th>
                      <th className="text-right py-2 text-gray-400 font-medium">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentVariant.opciones.map((opcion, index) => (
                      <tr 
                        key={index} 
                        className={`border-b border-white/5 ${editingOptionIndex === index ? 'bg-primary-500/20' : ''}`}
                      >
                        <td className="py-3 text-white font-medium">{opcion.valor}</td>
                        <td className="text-right py-3 text-gray-300">${opcion.precio.toFixed(2)}</td>
                        <td className="text-right py-3 text-gray-300">{opcion.stock}</td>
                        <td className="text-right py-3">
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => handleEditOption(index)}
                              className="p-1 rounded bg-accent-500/20 hover:bg-accent-500/30 text-accent-400 transition-colors"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteOption(index)}
                              className="p-1 rounded bg-error-500/20 hover:bg-error-500/30 text-error-400 transition-colors"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="glass-card p-8 text-center bg-white/5">
                <p className="text-gray-400">No hay opciones definidas para esta variante</p>
                <p className="text-gray-500 text-sm mt-1">Agrega opciones para especificar precio y stock de cada una</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

ProductFormVariants.propTypes = {
  variantes: PropTypes.array,
  onChange: PropTypes.func.isRequired
};

export default ProductFormVariants;
