// CommerceEditModal.tsx
'use client';
import { useState } from 'react';
import axios from 'axios';
import Image from 'next/image';
import { motion } from 'framer-motion';

interface Commerce {
  id: number;
  business_name: string;
  subdomain: string;
  logo_url?: string;
  business_category?: string;
  created_at?: string;
}

interface CommerceEditModalProps {
  commerce: Commerce;
  onClose: () => void;
  onUpdate: (updatedCommerce: Commerce) => void;
}

export default function CommerceEditModal({ commerce, onClose, onUpdate }: CommerceEditModalProps) {
  // MANTENER EL CÓDIGO ORIGINAL
  const [formData, setFormData] = useState({
    business_name: commerce.business_name,
    subdomain: commerce.subdomain,
    business_category: commerce.business_category || '',
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Si es el campo de subdominio, formateamos para eliminar caracteres no permitidos
    if (e.target.name === 'subdomain') {
      const formattedSubdomain = e.target.value
        .toLowerCase()
        .replace(/[^a-z0-9-]/g, '') // Solo permitir letras minúsculas, números y guiones
        .replace(/^-+|-+$/g, ''); // Eliminar guiones al principio y al final

      setFormData({ ...formData, subdomain: formattedSubdomain });
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);

      // Crear URL temporal para previsualización
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);

      // Limpiar URL al desmontar
      return () => URL.revokeObjectURL(objectUrl);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("No se encontró token de autenticación");
      }

      const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://cartaenlinea-67dbc62791d3.herokuapp.com';

      // 1. Primero actualizamos los datos del comercio
      const response = await axios.put(`${apiBaseUrl}/api/commerces/${commerce.id}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      let updatedCommerce = {
        ...commerce,
        ...formData
      };

      // 2. Si hay un nuevo logo, lo subimos
      if (selectedFile) {
        const formData = new FormData();
        formData.append('logo', selectedFile);

        const logoResponse = await axios.put(`${apiBaseUrl}/api/commerces/${commerce.id}/update-logo`, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        });

        if (logoResponse.data && logoResponse.data.logo_url) {
          updatedCommerce.logo_url = logoResponse.data.logo_url;
        }
      }

      setSuccess(true);

      // Esperar un momento para mostrar el mensaje de éxito antes de cerrar
      setTimeout(() => {
        onUpdate(updatedCommerce);
      }, 1000);

    } catch (error: any) {
      console.error("Error al actualizar comercio:", error);
      setError(error.response?.data?.error || "Error al actualizar el comercio");
    } finally {
      setIsLoading(false);
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
        className="bg-white rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 rounded-t-lg">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Editar Comercio</h2>
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
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded"
            >
              {error}
            </motion.div>
          )}

          {success && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Comercio actualizado correctamente
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre del comercio
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
              <p className="text-xs text-gray-500 mt-1">
                El subdominio será: {formData.subdomain}.tudominio.com
              </p>
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Logo
              </label>

              <div className="flex items-center space-x-4">
                <div className="w-24 h-24 bg-gray-100 rounded-md overflow-hidden flex items-center justify-center">
                  {previewUrl ? (
                    <div className="relative w-full h-full">
                      <Image
                        src={previewUrl}
                        alt="Vista previa del logo"
                        fill
                        sizes="96px"
                        style={{ objectFit: "contain" }}
                      />
                    </div>
                  ) : commerce.logo_url ? (
                    <div className="relative w-full h-full">
                      <Image
                        src={commerce.logo_url}
                        alt={`Logo de ${commerce.business_name}`}
                        fill
                        sizes="96px"
                        style={{ objectFit: "contain" }}
                      />
                    </div>
                  ) : (
                    <div className="text-gray-400 text-sm">Sin Logo</div>
                  )}
                </div>

                <div>
                  <motion.label
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    htmlFor="logo-upload"
                    className="inline-block px-4 py-2 bg-blue-500 text-white rounded cursor-pointer hover:bg-blue-600"
                  >
                    Seleccionar nuevo logo
                  </motion.label>
                  <input
                    id="logo-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                  {selectedFile && (
                    <p className="text-sm text-gray-600 mt-1">
                      {selectedFile.name}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 transition"
              >
                Cancelar
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
              >
                {isLoading ? 'Guardando...' : 'Guardar cambios'}
              </motion.button>
            </div>
          </form>
        </div>
      </motion.div>
    </motion.div>
  );
}