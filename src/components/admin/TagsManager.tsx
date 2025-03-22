// src/components/admin/TagsManager.tsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash2, X, Check, Tag as TagIcon } from 'lucide-react';
import { Tag } from '../ui/Tag';

interface TagData {
  id?: number;
  name: string;
  color: string;
  textColor: string;
  type: 'product' | 'option' | 'item';
  visible: boolean;
  priority: number;
  discount?: number | null;
  disableSelection: boolean;
  isRecommended: boolean;
}

const predefinedColors = [
  { name: 'Azul', value: '#3b82f6' },
  { name: 'Rojo', value: '#ef4444' },
  { name: 'Verde', value: '#10b981' },
  { name: 'Amarillo', value: '#f59e0b' },
  { name: 'Morado', value: '#8b5cf6' },
  { name: 'Rosa', value: '#ec4899' },
  { name: 'Gris', value: '#6b7280' },
  { name: 'Negro', value: '#000000' },
];

const predefinedTextColors = [
  { name: 'Blanco', value: '#FFFFFF' },
  { name: 'Negro', value: '#000000' },
];

const TagsManager = () => {
  const [tags, setTags] = useState<TagData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingTag, setEditingTag] = useState<TagData | null>(null);

  const [newTag, setNewTag] = useState<TagData>({
    name: '',
    color: '#3b82f6',
    textColor: '#FFFFFF',
    type: 'product',
    visible: true,
    priority: 0,
    discount: null,
    disableSelection: false,
    isRecommended: false
  });

  // Cargar etiquetas al montar el componente
  useEffect(() => {
    fetchTags();
  }, []);

  const fetchTags = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No se encontró token de autenticación');
      }

      const response = await axios.get('/api/tags', {
        headers: { Authorization: `Bearer ${token}` }
      });

      setTags(response.data);
    } catch (err) {
      console.error('Error al cargar etiquetas:', err);
      setError('Error al cargar las etiquetas');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTag = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!newTag.name.trim()) {
        setError('El nombre de la etiqueta es obligatorio');
        return;
      }

      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No se encontró token de autenticación');
      }

      const response = await axios.post('/api/tags', newTag, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Actualizar la lista de etiquetas
      setTags([...tags, response.data]);

      // Limpiar el formulario
      setNewTag({
        name: '',
        color: '#3b82f6',
        textColor: '#FFFFFF',
        type: 'product',
        visible: true,
        priority: 0,
        discount: null,
        disableSelection: false,
        isRecommended: false
      });

      setShowAddForm(false);
    } catch (err) {
      console.error('Error al crear etiqueta:', err);
      setError('Error al crear la etiqueta');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTag = async () => {
    if (!editingTag || !editingTag.id) return;

    try {
      setLoading(true);
      setError(null);

      if (!editingTag.name.trim()) {
        setError('El nombre de la etiqueta es obligatorio');
        return;
      }

      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No se encontró token de autenticación');
      }

      const response = await axios.put(`/api/tags/${editingTag.id}`, editingTag, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Actualizar la lista de etiquetas
      setTags(tags.map(tag => tag.id === editingTag.id ? response.data : tag));

      setEditingTag(null);
    } catch (err) {
      console.error('Error al actualizar etiqueta:', err);
      setError('Error al actualizar la etiqueta');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTag = async (tagId: number) => {
    if (!confirm('¿Está seguro que desea eliminar esta etiqueta?')) return;

    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No se encontró token de autenticación');
      }

      await axios.delete(`/api/tags/${tagId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Actualizar la lista de etiquetas
      setTags(tags.filter(tag => tag.id !== tagId));
    } catch (err) {
      console.error('Error al eliminar etiqueta:', err);
      setError('Error al eliminar la etiqueta');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Gestión de Etiquetas</h2>
        <Button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-blue-500 hover:bg-blue-600 text-white flex items-center gap-2"
        >
          {showAddForm ? <X size={18} /> : <Plus size={18} />}
          {showAddForm ? 'Cancelar' : 'Nueva Etiqueta'}
        </Button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Formulario para crear etiqueta */}
      {showAddForm && (
        <Card className="border-2 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-600">Nueva Etiqueta</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre *
                </label>
                <input
                  type="text"
                  value={newTag.name}
                  onChange={(e) => setNewTag({ ...newTag, name: e.target.value })}
                  className="w-full p-2 border rounded"
                  placeholder="Ej: Promo, Nuevo, Agotado..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de Etiqueta *
                </label>
                <select
                  value={newTag.type}
                  onChange={(e) => setNewTag({ ...newTag, type: e.target.value as any })}
                  className="w-full p-2 border rounded"
                >
                  <option value="product">Producto</option>
                  <option value="option">Opción</option>
                  <option value="item">Ítem</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Color de Fondo
                </label>
                <div className="flex gap-2 flex-wrap">
                  {predefinedColors.map(color => (
                    <button
                      key={color.value}
                      type="button"
                      className={`w-8 h-8 rounded-full ${
                        newTag.color === color.value ? 'ring-2 ring-offset-2 ring-blue-500' : ''
                      }`}
                      style={{ backgroundColor: color.value }}
                      onClick={() => setNewTag({ ...newTag, color: color.value })}
                      title={color.name}
                    />
                  ))}
                  <input
                    type="color"
                    value={newTag.color}
                    onChange={(e) => setNewTag({ ...newTag, color: e.target.value })}
                    className="w-8 h-8 p-0 border-0"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Color de Texto
                </label>
                <div className="flex gap-2">
                  {predefinedTextColors.map(color => (
                    <button
                      key={color.value}
                      type="button"
                      className={`w-8 h-8 rounded-full border ${
                        newTag.textColor === color.value ? 'ring-2 ring-offset-2 ring-blue-500' : ''
                      }`}
                      style={{ backgroundColor: color.value }}
                      onClick={() => setNewTag({ ...newTag, textColor: color.value })}
                      title={color.name}
                    />
                  ))}
                  <input
                    type="color"
                    value={newTag.textColor}
                    onChange={(e) => setNewTag({ ...newTag, textColor: e.target.value })}
                    className="w-8 h-8 p-0 border-0"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Prioridad (Mayor = más visible)
                </label>
                <input
                  type="number"
                  value={newTag.priority}
                  onChange={(e) => setNewTag({ ...newTag, priority: parseInt(e.target.value) })}
                  className="w-full p-2 border rounded"
                  min="0"
                  max="100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descuento (opcional)
                </label>
                <div className="flex">
                  <input
                    type="number"
                    value={newTag.discount ?? ''}
                    onChange={(e) => setNewTag({ ...newTag, discount: e.target.value ? parseInt(e.target.value) : null })}
                    className="w-full p-2 border rounded-l"
                    min="0"
                    max="100"
                    placeholder="Ej: 10"
                  />
                  <div className="bg-gray-100 p-2 border border-l-0 rounded-r">
                    %
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="visible"
                  checked={newTag.visible}
                  onChange={(e) => setNewTag({ ...newTag, visible: e.target.checked })}
                  className="h-4 w-4 mr-2"
                />
                <label htmlFor="visible" className="text-sm">Visible</label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="disableSelection"
                  checked={newTag.disableSelection}
                  onChange={(e) => setNewTag({ ...newTag, disableSelection: e.target.checked })}
                  className="h-4 w-4 mr-2"
                />
                <label htmlFor="disableSelection" className="text-sm">Desactiva selección</label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isRecommended"
                  checked={newTag.isRecommended}
                  onChange={(e) => setNewTag({ ...newTag, isRecommended: e.target.checked })}
                  className="h-4 w-4 mr-2"
                />
                <label htmlFor="isRecommended" className="text-sm">Es recomendado</label>
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Vista previa:
              </label>
              <div className="p-4 bg-gray-100 rounded flex items-center gap-2">
                <Tag
                  name={newTag.name || 'Ejemplo'}
                  color={newTag.color}
                  textColor={newTag.textColor}
                  discount={newTag.discount || undefined}
                />
                {newTag.discount && (
                  <Tag
                    name=""
                    color={newTag.color}
                    textColor={newTag.textColor}
                    discount={newTag.discount}
                  />
                )}
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <Button
                type="button"
                onClick={() => setShowAddForm(false)}
                variant="outline"
                className="mr-2"
              >
                Cancelar
              </Button>
              <Button
                type="button"
                onClick={handleCreateTag}
                className="bg-blue-500 hover:bg-blue-600 text-white"
                disabled={loading || !newTag.name.trim()}
              >
                {loading ? 'Guardando...' : 'Guardar Etiqueta'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lista de etiquetas */}
      <div className="space-y-4">
        <h3 className="font-medium text-lg">Etiquetas de Productos</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tags
            .filter(tag => tag.type === 'product')
            .map(tag => (
              <Card key={tag.id} className="relative overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <TagIcon size={16} className="text-gray-500" />
                      <Tag
                        name={tag.name}
                        color={tag.color}
                        textColor={tag.textColor}
                        discount={tag.discount || undefined}
                      />
                      {!tag.visible && (
                        <span className="px-1.5 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                          Oculta
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setEditingTag(tag)}
                        className="p-1 text-blue-500 hover:text-blue-700"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => tag.id && handleDeleteTag(tag.id)}
                        className="p-1 text-red-500 hover:text-red-700"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  <div className="mt-2 text-sm text-gray-500">
                    {tag.disableSelection && <div>Desactiva selección</div>}
                    {tag.isRecommended && <div>Recomendado</div>}
                    {tag.discount && <div>Descuento: {tag.discount}%</div>}
                    <div>Prioridad: {tag.priority}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
        </div>

        <h3 className="font-medium text-lg mt-8">Etiquetas de Opciones</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tags
            .filter(tag => tag.type === 'option')
            .map(tag => (
              <Card key={tag.id} className="relative overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <TagIcon size={16} className="text-gray-500" />
                      <Tag
                        name={tag.name}
                        color={tag.color}
                        textColor={tag.textColor}
                        discount={tag.discount || undefined}
                      />
                      {!tag.visible && (
                        <span className="px-1.5 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                          Oculta
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setEditingTag(tag)}
                        className="p-1 text-blue-500 hover:text-blue-700"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => tag.id && handleDeleteTag(tag.id)}
                        className="p-1 text-red-500 hover:text-red-700"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  <div className="mt-2 text-sm text-gray-500">
                    {tag.disableSelection && <div>Desactiva selección</div>}
                    {tag.isRecommended && <div>Recomendado</div>}
                    {tag.discount && <div>Descuento: {tag.discount}%</div>}
                    <div>Prioridad: {tag.priority}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
        </div>

        <h3 className="font-medium text-lg mt-8">Etiquetas de Ítems</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tags
            .filter(tag => tag.type === 'item')
            .map(tag => (
              <Card key={tag.id} className="relative overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <TagIcon size={16} className="text-gray-500" />
                      <Tag
                        name={tag.name}
                        color={tag.color}
                        textColor={tag.textColor}
                        discount={tag.discount || undefined}
                      />
                      {!tag.visible && (
                        <span className="px-1.5 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                          Oculta
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setEditingTag(tag)}
                        className="p-1 text-blue-500 hover:text-blue-700"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => tag.id && handleDeleteTag(tag.id)}
                        className="p-1 text-red-500 hover:text-red-700"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  <div className="mt-2 text-sm text-gray-500">
                    {tag.disableSelection && <div>Desactiva selección</div>}
                    {tag.isRecommended && <div>Recomendado</div>}
                    {tag.discount && <div>Descuento: {tag.discount}%</div>}
                                        <div>Prioridad: {tag.priority}</div>
                                      </div>
                                    </CardContent>
                                  </Card>
                                ))}
                            </div>
                          </div>

                          {/* Modal para editar etiqueta */}
                          {editingTag && (
                            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                              <div className="bg-white rounded-lg p-6 w-full max-w-md">
                                <h3 className="text-lg font-bold mb-4">Editar Etiqueta</h3>

                                <div className="mb-4">
                                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Nombre *
                                  </label>
                                  <input
                                    type="text"
                                    value={editingTag.name}
                                    onChange={(e) => setEditingTag({ ...editingTag, name: e.target.value })}
                                    className="w-full p-2 border rounded"
                                    placeholder="Ej: Promo, Nuevo, Agotado..."
                                  />
                                </div>

                                <div className="mb-4">
                                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Color de Fondo
                                  </label>
                                  <div className="flex gap-2 flex-wrap">
                                    {predefinedColors.map(color => (
                                      <button
                                        key={color.value}
                                        type="button"
                                        className={`w-8 h-8 rounded-full ${
                                          editingTag.color === color.value ? 'ring-2 ring-offset-2 ring-blue-500' : ''
                                        }`}
                                        style={{ backgroundColor: color.value }}
                                        onClick={() => setEditingTag({ ...editingTag, color: color.value })}
                                        title={color.name}
                                      />
                                    ))}
                                    <input
                                      type="color"
                                      value={editingTag.color}
                                      onChange={(e) => setEditingTag({ ...editingTag, color: e.target.value })}
                                      className="w-8 h-8 p-0 border-0"
                                    />
                                  </div>
                                </div>

                                <div className="mb-4">
                                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Color de Texto
                                  </label>
                                  <div className="flex gap-2">
                                    {predefinedTextColors.map(color => (
                                      <button
                                        key={color.value}
                                        type="button"
                                        className={`w-8 h-8 rounded-full border ${
                                          editingTag.textColor === color.value ? 'ring-2 ring-offset-2 ring-blue-500' : ''
                                        }`}
                                        style={{ backgroundColor: color.value }}
                                        onClick={() => setEditingTag({ ...editingTag, textColor: color.value })}
                                        title={color.name}
                                      />
                                    ))}
                                    <input
                                      type="color"
                                      value={editingTag.textColor}
                                      onChange={(e) => setEditingTag({ ...editingTag, textColor: e.target.value })}
                                      className="w-8 h-8 p-0 border-0"
                                    />
                                  </div>
                                </div>

                                <div className="mb-4">
                                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Prioridad (Mayor = más visible)
                                  </label>
                                  <input
                                    type="number"
                                    value={editingTag.priority}
                                    onChange={(e) => setEditingTag({ ...editingTag, priority: parseInt(e.target.value) })}
                                    className="w-full p-2 border rounded"
                                    min="0"
                                    max="100"
                                  />
                                </div>

                                <div className="mb-4">
                                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Descuento (opcional)
                                  </label>
                                  <div className="flex">
                                    <input
                                      type="number"
                                      value={editingTag.discount ?? ''}
                                      onChange={(e) => setEditingTag({ ...editingTag, discount: e.target.value ? parseInt(e.target.value) : null })}
                                      className="w-full p-2 border rounded-l"
                                      min="0"
                                      max="100"
                                      placeholder="Ej: 10"
                                    />
                                    <div className="bg-gray-100 p-2 border border-l-0 rounded-r">
                                      %
                                    </div>
                                  </div>
                                </div>

                                <div className="grid grid-cols-1 gap-2 mb-4">
                                  <div className="flex items-center">
                                    <input
                                      type="checkbox"
                                      id="edit-visible"
                                      checked={editingTag.visible}
                                      onChange={(e) => setEditingTag({ ...editingTag, visible: e.target.checked })}
                                      className="h-4 w-4 mr-2"
                                    />
                                    <label htmlFor="edit-visible" className="text-sm">Visible</label>
                                  </div>
                                  <div className="flex items-center">
                                    <input
                                      type="checkbox"
                                      id="edit-disableSelection"
                                      checked={editingTag.disableSelection}
                                      onChange={(e) => setEditingTag({ ...editingTag, disableSelection: e.target.checked })}
                                      className="h-4 w-4 mr-2"
                                    />
                                    <label htmlFor="edit-disableSelection" className="text-sm">Desactiva selección</label>
                                  </div>
                                  <div className="flex items-center">
                                    <input
                                      type="checkbox"
                                      id="edit-isRecommended"
                                      checked={editingTag.isRecommended}
                                      onChange={(e) => setEditingTag({ ...editingTag, isRecommended: e.target.checked })}
                                      className="h-4 w-4 mr-2"
                                    />
                                    <label htmlFor="edit-isRecommended" className="text-sm">Es recomendado</label>
                                  </div>
                                </div>

                                <div className="mb-4">
                                  <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Vista previa:
                                  </label>
                                  <div className="p-4 bg-gray-100 rounded flex items-center gap-2">
                                    <Tag
                                      name={editingTag.name || 'Ejemplo'}
                                      color={editingTag.color}
                                      textColor={editingTag.textColor}
                                      discount={editingTag.discount || undefined}
                                    />
                                    {editingTag.discount && (
                                      <Tag
                                        name=""
                                        color={editingTag.color}
                                        textColor={editingTag.textColor}
                                        discount={editingTag.discount}
                                      />
                                    )}
                                  </div>
                                </div>

                                <div className="flex justify-end gap-2">
                                  <Button
                                    type="button"
                                    onClick={() => setEditingTag(null)}
                                    variant="outline"
                                  >
                                    Cancelar
                                  </Button>
                                  <Button
                                    type="button"
                                    onClick={handleUpdateTag}
                                    className="bg-blue-500 hover:bg-blue-600 text-white"
                                    disabled={loading || !editingTag.name.trim()}
                                  >
                                    {loading ? 'Guardando...' : 'Actualizar Etiqueta'}
                                  </Button>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    };

                    export default TagsManager;