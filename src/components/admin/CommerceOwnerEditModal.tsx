'use client';
import { useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';

interface Commerce {
  id: number;
  business_name: string;
  subdomain: string;
  logo_url?: string;
  business_category?: string;
  created_at?: string;
  working_hours?: string;
}

interface Owner {
  id: number;
  email: string;
  password?: string;
  first_name?: string;
  last_name?: string;
  dni?: string;
  address?: string;
  phone?: string;
}

interface CommerceDetails {
  commerce?: Commerce;
  owner?: Owner;
}

interface CommerceOwnerEditModalProps {
  commerce: Commerce;
  onClose: () => void;
  onUpdate: (updatedCommerce: Commerce) => void;
}

export default function CommerceOwnerEditModal({ commerce, onClose, onUpdate }: CommerceOwnerEditModalProps) {
  const [superuserPassword, setSuperuserPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [details, setDetails] = useState<CommerceDetails | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [formData, setFormData] = useState<{
    business_name: string;
    subdomain: string;
    business_category: string;
    working_hours: string;
    owner_email: string;
    owner_password: string;
    owner_first_name: string;
    owner_last_name: string;
    owner_dni: string;
    owner_address: string;
    owner_phone: string;
  }>({
    business_name: commerce.business_name,
    subdomain: commerce.subdomain,
    business_category: commerce.business_category || '',
    working_hours: commerce.working_hours || '',
    owner_email: '',
    owner_password: '',
    owner_first_name: '',
    owner_last_name: '',
    owner_dni: '',
    owner_address: '',
    owner_phone: '',
  });

  const handleAuthenticate = async () => {
    if (!superuserPassword) {
      setError('Por favor ingresa tu contraseña');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("No se encontró token de autenticación");
      }

      const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://cartaenlinea-67dbc62791d3.herokuapp.com';

      const response = await axios.post(
        `${apiBaseUrl}/api/commerces/${commerce.id}/full-details`,
        { superuser_password: superuserPassword },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      setDetails(response.data);

      // Actualizar el estado del formulario con los datos obtenidos
      if (response.data.owner) {
        setFormData(prev => ({
          ...prev,
          owner_email: response.data.owner.email || '',
          owner_first_name: response.data.owner.first_name || '',
          owner_last_name: response.data.owner.last_name || '',
          owner_dni: response.data.owner.dni || '',
          owner_address: response.data.owner.address || '',
          owner_phone: response.data.owner.phone || '',
          owner_password: '', // Dejamos la contraseña vacía por seguridad
        }));
      }

      if (response.data.commerce) {
        setFormData(prev => ({
          ...prev,
          business_name: response.data.commerce.business_name || '',
          subdomain: response.data.commerce.subdomain || '',
          business_category: response.data.commerce.business_category || '',
          working_hours: response.data.commerce.working_hours || '',
        }));
      }

      setIsAuthenticated(true);

    } catch (error: unknown) {
      console.error("Error al obtener detalles:", error);

      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: { error?: string } } };
        setError(axiosError.response?.data?.error || "Error al obtener los detalles");
      } else {
        setError("Error al obtener los detalles");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("No se encontró token de autenticación");
      }

      const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://cartaenlinea-67dbc62791d3.herokuapp.com';

      // Preparar datos del comercio
      const commerce_data = {
        business_name: formData.business_name,
        subdomain: formData.subdomain,
        business_category: formData.business_category,
        working_hours: formData.working_hours,
      };

      // Preparar datos del propietario (owner)
      const owner_data: any = {
        email: formData.owner_email,
        first_name: formData.owner_first_name,
        last_name: formData.owner_last_name,
        dni: formData.owner_dni,
        address: formData.owner_address,
        phone: formData.owner_phone,
      };

      // Incluir contraseña solo si se proporcionó una nueva
      if (formData.owner_password) {
        owner_data.password = formData.owner_password;
      }

      // Realizar la solicitud de actualización completa
      const response = await axios.put(
        `${apiBaseUrl}/api/commerces/${commerce.id}/full-update`,
        {
          superuser_password: superuserPassword,
          commerce_data,
          owner_data
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      setSuccessMessage("Datos actualizados correctamente");

      // Actualizar el objeto commerce con los nuevos datos
      const updatedCommerce: Commerce = {
        ...commerce,
        business_name: formData.business_name,
        subdomain: formData.subdomain,
        business_category: formData.business_category,
        working_hours: formData.working_hours,
      };

      // Notificar al componente padre sobre la actualización
      setTimeout(() => {
        onUpdate(updatedCommerce);
      }, 1500);

    } catch (error: unknown) {
      console.error("Error al actualizar datos:", error);

      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: { error?: string } } };
        setError(axiosError.response?.data?.error || "Error al actualizar los datos");
      } else {
        setError("Error al actualizar los datos");
      }
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="bg-white rounded-lg shadow-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto"
      >
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 rounded-t-lg">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Editar Datos Completos del Comercio y Propietario</h2>
            <button
              onClick={onClose}
              className="text-white hover:bg-white/10 p-1 rounded-full"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-6">
          {!isAuthenticated ? (
            <div className="space-y-4">
              <p className="text-gray-700">Para editar los datos completos, por favor confirma tu contraseña de superusuario.</p>

              {error && (
                <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contraseña de superusuario
                </label>
                <input
                  type="password"
                  value={superuserPassword}
                  onChange={(e) => setSuperuserPassword(e.target.value)}
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ingresa tu contraseña"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 transition"
                >
                  Cancelar
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={handleAuthenticate}
                  disabled={isLoading || !superuserPassword}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition disabled:bg-blue-300"
                >
                  {isLoading ? 'Verificando...' : 'Continuar'}
                </motion.button>
              </div>
            </div>
          ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                            {error && (
                              <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                                {error}
                              </div>
                            )}

                            {successMessage && (
                              <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="p-3 bg-green-100 border border-green-400 text-green-700 rounded flex items-center"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                {successMessage}
                              </motion.div>
                            )}

                            {/* Sección de datos del comercio */}
                            <div className="bg-gray-50 p-4 rounded-lg">
                              <h3 className="text-lg font-semibold text-gray-800 mb-3">Información del Comercio</h3>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Nombre del Comercio
                                  </label>
                                  <input
                                    type="text"
                                    name="business_name"
                                    value={formData.business_name}
                                    onChange={handleChange}
                                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    required
                                  />
                                </div>

                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Subdominio
                                  </label>
                                  <input
                                    type="text"
                                    name="subdomain"
                                    value={formData.subdomain}
                                    onChange={handleChange}
                                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    required
                                  />
                                </div>

                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Categoría
                                  </label>
                                  <input
                                    type="text"
                                    name="business_category"
                                    value={formData.business_category}
                                    onChange={handleChange}
                                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                  />
                                </div>

                                <div className="col-span-1 md:col-span-2">
                                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Horario de Trabajo
                                  </label>
                                  <textarea
                                    name="working_hours"
                                    value={formData.working_hours}
                                    onChange={handleChange}
                                    rows={2}
                                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Ej: 08:00 hs a 19:00 hs, o 07:00 hs a 14:00 hs y de 16:30 hs a 24:00 hs"
                                  />
                                </div>
                              </div>
                            </div>

                            {/* Sección de datos del propietario */}
                            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                              <h3 className="text-lg font-semibold text-yellow-800 mb-3">
                                Información del Propietario <span className="text-yellow-600 text-sm">(Confidencial)</span>
                              </h3>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <label className="block text-sm font-medium text-yellow-800 mb-1">
                                    Email
                                  </label>
                                  <input
                                    type="email"
                                    name="owner_email"
                                    value={formData.owner_email}
                                    onChange={handleChange}
                                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    required
                                  />
                                </div>

                                <div>
                                  <label className="block text-sm font-medium text-yellow-800 mb-1">
                                    Nueva Contraseña (Dejar en blanco para mantener la actual)
                                  </label>
                                  <input
                                    type="password"
                                    name="owner_password"
                                    value={formData.owner_password}
                                    onChange={handleChange}
                                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Nueva contraseña (opcional)"
                                  />
                                </div>

                                <div>
                                  <label className="block text-sm font-medium text-yellow-800 mb-1">
                                    Nombre
                                  </label>
                                  <input
                                    type="text"
                                    name="owner_first_name"
                                    value={formData.owner_first_name}
                                    onChange={handleChange}
                                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                  />
                                </div>

                                <div>
                                  <label className="block text-sm font-medium text-yellow-800 mb-1">
                                    Apellido
                                  </label>
                                  <input
                                    type="text"
                                    name="owner_last_name"
                                    value={formData.owner_last_name}
                                    onChange={handleChange}
                                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                  />
                                </div>

                                <div>
                                  <label className="block text-sm font-medium text-yellow-800 mb-1">
                                    DNI
                                  </label>
                                  <input
                                    type="text"
                                    name="owner_dni"
                                    value={formData.owner_dni}
                                    onChange={handleChange}
                                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                  />
                                </div>

                                <div>
                                  <label className="block text-sm font-medium text-yellow-800 mb-1">
                                    Teléfono
                                  </label>
                                  <input
                                    type="text"
                                    name="owner_phone"
                                    value={formData.owner_phone}
                                    onChange={handleChange}
                                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                  />
                                </div>

                                <div className="col-span-1 md:col-span-2">
                                  <label className="block text-sm font-medium text-yellow-800 mb-1">
                                    Dirección
                                  </label>
                                  <input
                                    type="text"
                                    name="owner_address"
                                    value={formData.owner_address}
                                    onChange={handleChange}
                                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                  />
                                </div>
                              </div>
                            </div>

                            <div className="flex justify-end space-x-3 pt-4">
                              <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 transition"
                                disabled={isUpdating}
                              >
                                Cancelar
                              </motion.button>
                              <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                type="submit"
                                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition disabled:bg-blue-300"
                                disabled={isUpdating}
                              >
                                {isUpdating ? 'Guardando...' : 'Guardar cambios'}
                              </motion.button>
                            </div>
                          </form>
                        )}
                      </div>
                    </motion.div>
                  </motion.div>
                );
              }