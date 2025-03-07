'use client';
import { useState, useEffect } from "react";
import Image from "next/image";
import axios from "axios";
import CommerceForm from "./CommerceForm";
import CommerceEditModal from "./CommerceEditModal";
import { Button } from "@/components/ui/button";

interface Commerce {
  id: number;
  business_name: string;
  subdomain: string;
  logo_url?: string;
  business_category?: string;
  created_at?: string;
}

interface CommerceListProps {
  commerces?: Commerce[];
  setCommerces?: React.Dispatch<React.SetStateAction<Commerce[]>>;
}

export default function CommerceList({ commerces: initialCommerces, setCommerces: parentSetCommerces }: CommerceListProps) {
  // Si se pasan comercios como prop, úsalos; de lo contrario, inicializa un estado local
  const [localCommerces, setLocalCommerces] = useState<Commerce[]>(initialCommerces || []);
  const [isLoading, setIsLoading] = useState<boolean>(!initialCommerces);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadingForId, setUploadingForId] = useState<number | null>(null);

  // Estado para el modal de edición
  const [editingCommerce, setEditingCommerce] = useState<Commerce | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  // Estado para el modal de eliminación
  const [commerceToDelete, setCommerceToDelete] = useState<Commerce | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Estados para forzar refresco de imágenes
  const [imageVersions, setImageVersions] = useState<Record<number, number>>({});

  // Referencia a la función correcta para actualizar los comercios
  const updateCommerces = parentSetCommerces || setLocalCommerces;

  // Referencia a los comercios correctos
  const displayCommerces = initialCommerces || localCommerces;

  // Cargar comercios si no se proporcionaron como props
  useEffect(() => {
    if (!initialCommerces) {
      fetchCommerces();
    }
  }, [initialCommerces]);

  const fetchCommerces = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("No se encontró token de autenticación");
      }

      const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://cartaenlinea-67dbc62791d3.herokuapp.com';

      const response = await axios.get(`${apiBaseUrl}/api/commerces`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setLocalCommerces(response.data);
      setError(null);
    } catch (error) {
      console.error("Error al cargar comercios:", error);
      setError("Error al cargar los comercios. Por favor, intenta de nuevo.");
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Función para agregar un comercio a la lista luego de ser creado.
   */
  const handleCommerceCreated = (newCommerce: any) => {
    console.log("Comercio creado:", newCommerce);

    // Asegurarnos de que tenemos la estructura correcta
    const commerceToAdd: Commerce = {
      id: newCommerce.id || Date.now(), // Usar un ID temporal si no hay uno
      business_name: newCommerce.business_name || newCommerce.message?.business_name || "Nuevo Comercio",
      subdomain: newCommerce.subdomain || newCommerce.message?.subdomain || "subdominio",
      logo_url: newCommerce.logo_url || newCommerce.message?.logo_url,
      business_category: newCommerce.business_category || newCommerce.message?.business_category,
      created_at: new Date().toISOString()
    };

    updateCommerces(prev => [...prev, commerceToAdd]);

    // Actualizamos la lista completa desde el servidor para asegurarnos
    fetchCommerces();
  };

  /**
   * Función para manejar la selección de archivos para el logo
   */
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, commerceId: number) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      handleLogoUpload(commerceId, e.target.files[0]);
    }
  };

  /**
   * Función para subir el logo
   */
  const handleLogoUpload = async (commerceId: number, file: File) => {
    try {
      setUploadingForId(commerceId);
      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("No se encontró token de autenticación");
      }

      const formData = new FormData();
      formData.append('logo', file);

      const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://cartaenlinea-67dbc62791d3.herokuapp.com';

      const response = await axios.put(`${apiBaseUrl}/api/commerces/${commerceId}/update-logo`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log("Logo actualizado con éxito:", response.data);

      // Actualizar inmediatamente la URL del logo en el estado local
      if (response.data && response.data.logo_url) {
        updateCommerces(prevCommerces =>
          prevCommerces.map(commerce =>
            commerce.id === commerceId
              ? { ...commerce, logo_url: response.data.logo_url + `?v=${Date.now()}` }
              : commerce
          )
        );

        // Incrementar la versión de la imagen para forzar la recarga
        setImageVersions(prev => ({
          ...prev,
          [commerceId]: (prev[commerceId] || 0) + 1
        }));
      }

      // Recargar la lista completa para asegurar consistencia
      fetchCommerces();

    } catch (error: any) {
      console.error("Error al subir el logo:", error);
      if (error.response) {
        console.error("Respuesta del servidor:", error.response.status, error.response.data);
      }
      setError("Error al subir el logo: " + (error.response?.data?.error || error.message));
    } finally {
      setUploadingForId(null);
    }
  };

  /**
   * Función para abrir el modal de edición
   */
  const handleEditClick = (commerce: Commerce) => {
    setEditingCommerce(commerce);
    setShowEditModal(true);
  };

  /**
   * Función para manejar la actualización de un comercio
   */
  const handleCommerceUpdated = (updatedCommerce: Commerce) => {
    // Actualizar el estado local con los datos actualizados
    updateCommerces(prevCommerces =>
      prevCommerces.map(commerce =>
        commerce.id === updatedCommerce.id ? updatedCommerce : commerce
      )
    );

    // Cerrar el modal de edición
    setShowEditModal(false);
    setEditingCommerce(null);

    // Recargar la lista para asegurar consistencia
    fetchCommerces();
  };

  /**
   * Función para mostrar el modal de confirmación de eliminación
   */
  const handleDeleteClick = (commerce: Commerce) => {
    setCommerceToDelete(commerce);
    setShowDeleteModal(true);
    setDeletePassword('');
    setDeleteError(null);
  };

  /**
   * Función para confirmar la eliminación de un comercio
   */
  const confirmDelete = async () => {
    if (!commerceToDelete) return;

    try {
      setDeleteLoading(true);
      setDeleteError(null);

      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("No se encontró token de autenticación");
      }

      const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://cartaenlinea-67dbc62791d3.herokuapp.com';

      // Primero verificamos la contraseña del superuser
      const authResponse = await axios.post(`${apiBaseUrl}/api/auth/verify-password`, {
        password: deletePassword
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }).catch(error => {
        if (error.response && error.response.status === 401) {
          throw new Error("Contraseña incorrecta");
        }
        throw error;
      });

      // Si la contraseña es correcta, procedemos a eliminar el comercio
      await axios.delete(`${apiBaseUrl}/api/commerces/${commerceToDelete.id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      // Actualizamos el estado local eliminando el comercio
      updateCommerces(prevCommerces =>
        prevCommerces.filter(commerce => commerce.id !== commerceToDelete.id)
      );

      // Cerramos el modal
      setShowDeleteModal(false);
      setCommerceToDelete(null);
      setDeletePassword('');

    } catch (error: any) {
      console.error("Error al eliminar comercio:", error);
      setDeleteError(error.message || "Error al eliminar el comercio");
    } finally {
      setDeleteLoading(false);
    }
  };

  /**
   * Función para cancelar la eliminación
   */
  const cancelDelete = () => {
    setShowDeleteModal(false);
    setCommerceToDelete(null);
    setDeletePassword('');
    setDeleteError(null);
  };

  if (isLoading) {
    return <div className="text-center p-8">Cargando comercios...</div>;
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
        {error}
        <button
          onClick={() => setError(null)}
          className="absolute top-0 bottom-0 right-0 px-4 py-3"
        >
          <span className="text-red-500">×</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Sección para crear comercios */}
      <CommerceForm onCommerceCreated={handleCommerceCreated} />

      {/* Lista de comercios */}
      <h2 className="text-2xl font-bold mt-8 mb-4">Comercios Registrados</h2>
      {displayCommerces.length === 0 ? (
        <p className="text-gray-500">No hay comercios registrados. Crea uno nuevo usando el formulario de arriba.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayCommerces.map((commerce) => (
            <div key={commerce.id} className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h2 className="text-xl font-semibold">{commerce.business_name}</h2>
                  <p className="text-gray-500">{commerce.subdomain}</p>
                  {commerce.business_category && (
                    <p className="text-gray-500 text-sm">
                      Categoría: {commerce.business_category}
                    </p>
                  )}
                  {commerce.created_at && (
                    <p className="text-xs text-gray-400 mt-1">
                      Creado: {new Date(commerce.created_at).toLocaleDateString()}
                    </p>
                  )}
                </div>

                <div className="relative group">
                  <div className="w-24 h-24 bg-gray-100 rounded-md overflow-hidden flex items-center justify-center">
                    {commerce.logo_url ? (
                      <div className="relative w-full h-full">
                        <Image
                          src={`${commerce.logo_url}${imageVersions[commerce.id] ? `?v=${imageVersions[commerce.id]}` : ''}`}
                          alt={`Logo de ${commerce.business_name}`}
                          fill
                          sizes="96px"
                          style={{ objectFit: "contain" }}
                          onError={(e) => {
                            console.error("Error al cargar la imagen:", commerce.logo_url);
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                          }}
                        />
                      </div>
                    ) : (
                      <div className="text-gray-400 text-sm">Sin Logo</div>
                    )}

                    {/* Overlay para subir logo */}
                    <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <label
                        htmlFor={`logo-upload-${commerce.id}`}
                        className="text-white text-xs cursor-pointer hover:underline"
                      >
                        {uploadingForId === commerce.id ? 'Subiendo...' : 'Cambiar Logo'}
                      </label>
                      <input
                        id={`logo-upload-${commerce.id}`}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleFileChange(e, commerce.id)}
                        disabled={uploadingForId !== null}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-2 mt-4">
                <a
                  href={`https://${commerce.subdomain}.tudominio.com`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1 text-xs text-blue-600 border border-blue-600 rounded hover:bg-blue-50"
                >
                  Visitar
                </a>

                <button
                  className="px-3 py-1 text-xs text-green-600 border border-green-600 rounded hover:bg-green-50"
                  onClick={() => handleEditClick(commerce)}
                >
                  Editar
                </button>

                <button
                  className="px-3 py-1 text-xs text-red-600 border border-red-600 rounded hover:bg-red-50"
                  onClick={() => handleDeleteClick(commerce)}
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de edición */}
      {showEditModal && editingCommerce && (
        <CommerceEditModal
          commerce={editingCommerce}
          onClose={() => setShowEditModal(false)}
          onUpdate={handleCommerceUpdated}
        />
      )}

      {/* Modal de confirmación para eliminar */}
      {showDeleteModal && commerceToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h3 className="text-lg font-bold mb-4">Confirmar eliminación</h3>
            <p className="mb-4">
              ¿Estás seguro de que deseas eliminar el comercio <strong>{commerceToDelete.business_name}</strong>?
            </p>
            <p className="mb-4 text-red-600 font-medium">
              ¡Atención! Esta acción no se puede deshacer y eliminará todos los datos asociados al comercio.
            </p>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ingresa tu contraseña para confirmar:
              </label>
              <input
                type="password"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Contraseña de superusuario"
              />
              {deleteError && (
                <p className="text-red-500 text-sm mt-1">{deleteError}</p>
              )}
            </div>

            <div className="flex justify-end space-x-3">
              <Button
                onClick={cancelDelete}
                variant="outline"
                disabled={deleteLoading}
              >
                Cancelar
              </Button>
              <Button
                onClick={confirmDelete}
                variant="destructive"
                disabled={!deletePassword || deletePassword.length < 3 || deleteLoading}
              >
                {deleteLoading ? 'Eliminando...' : 'Eliminar'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

