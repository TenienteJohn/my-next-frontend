// src/components/admin/ProductOptionsManager.tsx
'use client';
import { useState, useEffect } from 'react';
import { ProductOption, OptionItem } from '@/types/product-options';

interface ProductOptionsManagerProps {
  productId: number | null;
  existingOptions?: ProductOption[];
  onOptionsChange: (options: ProductOption[]) => void;
}

export const ProductOptionsManager = ({
  productId,
  existingOptions = [],
  onOptionsChange
}: ProductOptionsManagerProps) => {
  const [options, setOptions] = useState<ProductOption[]>(existingOptions);
  const [showAddOption, setShowAddOption] = useState(false);
  const [newOption, setNewOption] = useState<Partial<ProductOption>>({
    name: '',
    required: false,
    multiple: false,
    max_selections: 1,
    items: []
  });
  const [showAddItem, setShowAddItem] = useState<number | null>(null);
  const [newItem, setNewItem] = useState<Partial<OptionItem>>({
    name: '',
    price_addition: 0
  });

  // Propagar cambios hacia arriba
  useEffect(() => {
    onOptionsChange(options);
  }, [options, onOptionsChange]);

  // Agregar nueva opción
  const handleAddOption = () => {
    if (!newOption.name) return;

    const optionToAdd: ProductOption = {
      id: Date.now(), // ID temporal
      product_id: productId || 0,
      name: newOption.name,
      required: newOption.required || false,
      multiple: newOption.multiple || false,
      max_selections: newOption.multiple ? newOption.max_selections || 1 : undefined,
      items: []
    };

    setOptions([...options, optionToAdd]);
    setNewOption({
      name: '',
      required: false,
      multiple: false,
      max_selections: 1,
      items: []
    });
    setShowAddOption(false);

    // Mostrar interfaz para agregar items automáticamente
    setShowAddItem(optionToAdd.id);
  };

  // Agregar item a una opción
  const handleAddItem = (optionId: number) => {
    if (!newItem.name) return;

    const newItemWithId: OptionItem = {
      id: Date.now(), // ID temporal
      option_id: optionId,
      name: newItem.name,
      price_addition: Number(newItem.price_addition) || 0
    };

    setOptions(options.map(option =>
      option.id === optionId
        ? {...option, items: [...option.items, newItemWithId]}
        : option
    ));

    setNewItem({
      name: '',
      price_addition: 0
    });
  };

  // Eliminar opción
  const handleRemoveOption = (optionId: number) => {
    setOptions(options.filter(option => option.id !== optionId));
  };

  // Eliminar item
  const handleRemoveItem = (optionId: number, itemId: number) => {
    setOptions(options.map(option =>
      option.id === optionId
        ? {...option, items: option.items.filter(item => item.id !== itemId)}
        : option
    ));
  };

  return (
    <div className="mt-6 border rounded-lg p-4">
      <h3 className="font-medium text-lg mb-3">Opciones del Producto</h3>

      {options.length === 0 ? (
        <p className="text-gray-500 mb-4">Este producto no tiene opciones.</p>
      ) : (
        <div className="space-y-4 mb-4">
          {options.map(option => (
            <div
              key={option.id}
              className="border rounded-lg p-3 bg-gray-50"
            >
              <div className="flex justify-between items-center mb-2">
                <div>
                  <h4 className="font-medium">
                    {option.name}
                    {option.required && <span className="text-red-500 ml-1">*</span>}
                  </h4>
                  <p className="text-sm text-gray-500">
                    {option.multiple
                      ? option.max_selections
                        ? `Múltiple (máx. ${option.max_selections})`
                        : 'Múltiple (sin límite)'
                      : 'Selección única'}
                  </p>
                </div>
                <button
                  onClick={() => handleRemoveOption(option.id)}
                  className="text-red-500 hover:text-red-700"
                  type="button"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>

              {/* Items de la opción */}
              {option.items.length > 0 ? (
                <div className="border rounded-md bg-white p-2 mb-3">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-1 px-2">Nombre</th>
                        <th className="text-right py-1 px-2">Precio adicional</th>
                        <th className="w-10"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {option.items.map(item => (
                        <tr key={item.id} className="border-b last:border-b-0">
                          <td className="py-1 px-2">{item.name}</td>
                          <td className="py-1 px-2 text-right">
                            {item.price_addition > 0
                              ? `+$${item.price_addition.toLocaleString()}`
                              : '-'}
                          </td>
                          <td className="py-1 px-2 text-right">
                            <button
                              onClick={() => handleRemoveItem(option.id, item.id)}
                              className="text-red-500 hover:text-red-700"
                              type="button"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-sm text-red-500 mb-3">Esta opción no tiene ítems.</p>
              )}

              {/* Formulario para agregar item */}
              {showAddItem === option.id ? (
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newItem.name}
                    onChange={(e) => setNewItem({...newItem, name: e.target.value})}
                    placeholder="Nombre del ítem"
                    className="flex-1 p-2 border rounded-md text-sm"
                  />
                  <input
                    type="number"
                    value={newItem.price_addition || ''}
                    onChange={(e) => setNewItem({...newItem, price_addition: Number(e.target.value)})}
                    placeholder="Precio adicional"
                    className="w-32 p-2 border rounded-md text-sm"
                  />
                  <button
                    onClick={() => handleAddItem(option.id)}
                    className="bg-blue-500 text-white px-3 py-2 rounded-md text-sm"
                    type="button"
                  >
                    Agregar
                  </button>
                  <button
                    onClick={() => setShowAddItem(null)}
                    className="border px-3 py-2 rounded-md text-sm"
                    type="button"
                  >
                    Cancelar
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowAddItem(option.id)}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-3 py-1 rounded text-sm"
                  type="button"
                >
                  + Agregar ítem
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Formulario para agregar opción */}
      {showAddOption ? (
        <div className="border rounded-lg p-3 bg-white">
          <h4 className="font-medium mb-2">Nueva Opción</h4>
          <div className="space-y-3">
            <div>
              <label className="block text-sm text-gray-700 mb-1">Nombre de la opción</label>
              <input
                type="text"
                value={newOption.name}
                onChange={(e) => setNewOption({...newOption, name: e.target.value})}
                placeholder="Ej: Tamaño, Ingredientes extra, etc."
                className="w-full p-2 border rounded-md"
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="required"
                checked={newOption.required}
                onChange={(e) => setNewOption({...newOption, required: e.target.checked})}
                className="h-4 w-4"
              />
              <label htmlFor="required" className="text-sm">Es obligatorio elegir</label>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="multiple"
                checked={newOption.multiple}
                onChange={(e) => setNewOption({...newOption, multiple: e.target.checked})}
                className="h-4 w-4"
              />
              <label htmlFor="multiple" className="text-sm">Permite selección múltiple</label>
            </div>

            {newOption.multiple && (
              <div>
                <label className="block text-sm text-gray-700 mb-1">
                  Máximo de selecciones (dejar en blanco para sin límite)
                </label>
                <input
                  type="number"
                  min="1"
                  value={newOption.max_selections || ''}
                  onChange={(e) => setNewOption({
                    ...newOption,
                    max_selections: e.target.value ? Number(e.target.value) : undefined
                  })}
                  placeholder="Ej: 3"
                  className="w-32 p-2 border rounded-md"
                />
              </div>
            )}

            <div className="flex justify-end space-x-2 mt-3">
              <button
                onClick={() => setShowAddOption(false)}
                className="px-3 py-2 border rounded-md"
                type="button"
              >
                Cancelar
              </button>
              <button
                onClick={handleAddOption}
                className="px-3 py-2 bg-blue-500 text-white rounded-md"
                type="button"
                disabled={!newOption.name}
              >
                Guardar Opción
              </button>
            </div>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowAddOption(true)}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
          type="button"
        >
          + Agregar Nueva Opción
        </button>
      )}
    </div>
  );
};

export default ProductOptionsManager;