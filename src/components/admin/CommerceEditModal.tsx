'use client';
import { useState } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

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
      onUpdate(updatedCommerce);

    } catch (error: any) {
      console.error("Error al actualizar comercio:", error);
      setError(error.response?.data?.error || "Error al actualizar el comercio");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Editar Comercio</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
              Comercio actualizado correctamente
            </div>
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
                  <label
                    htmlFor="logo-upload"
                    className="inline-block px-4 py-2 bg-gray-200 text-gray-800 rounded cursor-pointer hover:bg-gray-300"
                  >
                    Seleccionar nuevo logo
                  </label>
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
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? 'Guardando...' : 'Guardar cambios'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}