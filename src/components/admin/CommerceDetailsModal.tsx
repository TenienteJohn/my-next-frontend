'use client';
import { useState } from 'react';
import axios from 'axios';
import Image from 'next/image';

// Eliminamos la importación de framer-motion que está causando problemas
// import { motion } from 'framer-motion';

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
  password: string;
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

interface CommerceDetailsModalProps {
  commerce: Commerce;
  onClose: () => void;
}

export default function CommerceDetailsModal({ commerce, onClose }: CommerceDetailsModalProps) {
  const [superuserPassword, setSuperuserPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [details, setDetails] = useState<CommerceDetails | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

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

  // Reemplazado motion.div con div normal
  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      style={{ opacity: 1 }}
    >
      <div
        className="bg-white rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        style={{ transform: 'scale(1)' }}
      >
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 rounded-t-lg">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Detalles Completos del Comercio</h2>
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
              <p className="text-gray-700">Para ver los detalles completos, por favor confirma tu contraseña de superusuario.</p>

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
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 transition"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleAuthenticate}
                  disabled={isLoading || !superuserPassword}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
                >
                  {isLoading ? 'Verificando...' : 'Ver detalles'}
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Detalles del comercio */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Información del Comercio</h3>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">ID:</p>
                    <p className="font-medium">{details?.commerce?.id}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Nombre:</p>
                    <p className="font-medium">{details?.commerce?.business_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Subdominio:</p>
                    <p className="font-medium">{details?.commerce?.subdomain}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Categoría:</p>
                    <p className="font-medium">{details?.commerce?.business_category || "No especificada"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Fecha de creación:</p>
                    <p className="font-medium">
                      {details?.commerce?.created_at
                        ? new Date(details.commerce.created_at).toLocaleString()
                        : "No disponible"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">URL del Logo:</p>
                    <p className="font-medium text-xs break-all">{details?.commerce?.logo_url || "Sin logo"}</p>
                  </div>
                   {details?.commerce?.working_hours && (
                     <div className="col-span-2">
                       <p className="text-sm text-gray-600">Horario de trabajo:</p>
                       <p className="font-medium">{details.commerce.working_hours}</p>
                     </div>
                  )}

                  {details?.commerce?.logo_url && (
                    <div className="mt-4 flex justify-center">
                      <div className="relative w-40 h-40 bg-white rounded-md overflow-hidden border">
                        <Image
                          src={details.commerce.logo_url}
                          alt={`Logo de ${details.commerce.business_name}`}
                          fill
                          sizes="160px"
                          style={{ objectFit: "contain" }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Detalles del owner */}
              {details?.owner && (
                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                  <h3 className="text-lg font-semibold text-yellow-800 mb-3">
                    Información del Owner <span className="text-yellow-600 text-sm">(Confidencial)</span>
                  </h3>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-yellow-800">ID:</p>
                      <p className="font-medium">{details.owner.id}</p>
                    </div>
                    <div>
                      <p className="text-sm text-yellow-800">Email:</p>
                      <p className="font-medium">{details.owner.email}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-sm text-yellow-800">Contraseña (hash):</p>
                      <div className="mt-1 p-2 bg-gray-100 rounded-md border border-yellow-300 overflow-x-auto">
                        <code className="text-xs font-mono">{details.owner.password}</code>
                      </div>
                    </div>
                    {details.owner.first_name && (
                      <div>
                        <p className="text-sm text-yellow-800">Nombre:</p>
                        <p className="font-medium">
                          {details.owner.first_name} {details.owner.last_name || ''}
                        </p>
                      </div>
                    )}
                    {details.owner.dni && (
                      <div>
                        <p className="text-sm text-yellow-800">DNI:</p>
                        <p className="font-medium">{details.owner.dni}</p>
                      </div>
                    )}
                    {details.owner.address && (
                      <div>
                        <p className="text-sm text-yellow-800">Dirección:</p>
                        <p className="font-medium">{details.owner.address}</p>
                      </div>
                    )}
                    {details.owner.phone && (
                      <div>
                        <p className="text-sm text-yellow-800">Teléfono:</p>
                        <p className="font-medium">{details.owner.phone}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="flex justify-end pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
                >
                  Cerrar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}