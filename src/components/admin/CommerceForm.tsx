// src/components/admin/CommerceForm.tsx
'use client';
import { useState } from 'react';
import axios from 'axios';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

interface CommerceDataForm {
  commerceName: string;      // Se usará para business_name
  subdomain: string;
  owner_email: string;
  owner_password: string;
  owner_name: string;        // Se usará para first_name
  owner_lastname: string;    // Se usará para last_name
  owner_address: string;     // Se usará para address
  owner_phone: string;       // Se usará para phone
  business_category?: string;
}

interface CommerceFormProps {
  onCommerceCreated: (newCommerce: any) => void;
}

export default function CommerceForm({ onCommerceCreated }: CommerceFormProps) {
  const [formData, setFormData] = useState<CommerceDataForm>({
    commerceName: '',
    subdomain: '',
    owner_email: '',
    owner_password: '',
    owner_name: '',
    owner_lastname: '',
    owner_address: '',
    owner_phone: '',
    business_category: '',
  });

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1); // Para navegación multi-pasos
  const [formSubmitted, setFormSubmitted] = useState(false);

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

  const isStepValid = () => {
    if (step === 1) {
      return formData.commerceName && formData.subdomain && formData.business_category;
    } else {
      return formData.owner_name && formData.owner_lastname && formData.owner_email && formData.owner_password;
    }
  };

  const nextStep = () => {
    if (isStepValid()) {
      setStep(2);
    }
  };

  const prevStep = () => {
    setStep(1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setMessage('');

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("No se encontró token de autenticación");
      }

      // Mapeo de campos del formulario a los nombres que espera el backend:
      const payload = {
        business_name: formData.commerceName,
        subdomain: formData.subdomain,
        owner_email: formData.owner_email,
        owner_password: formData.owner_password,
        first_name: formData.owner_name,
        last_name: formData.owner_lastname,
        address: formData.owner_address,
        phone: formData.owner_phone,
        business_category: formData.business_category,
      };

      const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://cartaenlinea-67dbc62791d3.herokuapp.com';

      const response = await axios.post(`${apiBaseUrl}/api/commerces`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      // Animación de éxito
      setFormSubmitted(true);

      // Reiniciar el formulario después de un tiempo
      setTimeout(() => {
        setFormData({
          commerceName: '',
          subdomain: '',
          owner_email: '',
          owner_password: '',
          owner_name: '',
          owner_lastname: '',
          owner_address: '',
          owner_phone: '',
          business_category: '',
        });
        setStep(1);
        setFormSubmitted(false);
      }, 2000);

      setMessage('¡Comercio creado exitosamente!');
      onCommerceCreated(response.data);
    } catch (error: any) {
      console.error("Error al crear el comercio:", error);
      setError(error.response?.data?.error || 'Error al crear el comercio. Intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  const fadeVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 }
  };

  return (
    <Card className="max-w-3xl mx-auto shadow-lg overflow-hidden bg-white">
      <CardContent className="p-0">
        {/* Header del formulario con gradiente */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 text-white">
          <h2 className="text-2xl font-semibold">
            {step === 1 ? 'Crear Nuevo Comercio' : 'Información del Propietario'}
          </h2>
          <p className="text-white/80 mt-1">
            {step === 1
              ? 'Completa la información básica del comercio'
              : 'Ingresa los datos del propietario del comercio'}
          </p>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded mx-6 mt-6"
          >
            {error}
          </motion.div>
        )}

        {message && formSubmitted && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg mx-6 mt-6 flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center mr-3"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </motion.div>
            {message}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="p-6">
          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.div
                key="step1"
                initial="hidden"
                animate="visible"
                exit="exit"
                variants={fadeVariants}
                transition={{ duration: 0.3 }}
                className="space-y-4"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="commerceName" className="block text-sm font-medium text-gray-700 mb-1">
                      Nombre del comercio *
                    </label>
                    <motion.input
                      whileFocus={{ scale: 1.01 }}
                      transition={{ type: "spring", stiffness: 300 }}
                      id="commerceName"
                      name="commerceName"
                      placeholder="Ej: Mi Restaurante"
                      className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={formData.commerceName}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="subdomain" className="block text-sm font-medium text-gray-700 mb-1">
                      Subdominio *
                    </label>
                    <motion.input
                      whileFocus={{ scale: 1.01 }}
                      transition={{ type: "spring", stiffness: 300 }}
                      id="subdomain"
                      name="subdomain"
                      placeholder="Ej: mirestaurante"
                      className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={formData.subdomain}
                      onChange={handleChange}
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      El subdominio será: {formData.subdomain || 'micomercio'}.tudominio.com
                    </p>
                  </div>
                </div>

                <div>
                  <label htmlFor="business_category" className="block text-sm font-medium text-gray-700 mb-1">
                    Categoría del negocio *
                  </label>
                  <motion.input
                    whileFocus={{ scale: 1.01 }}
                    transition={{ type: "spring", stiffness: 300 }}
                    id="business_category"
                    name="business_category"
                    placeholder="Ej: Restaurante, Cafetería, Tienda"
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={formData.business_category}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="pt-4 flex justify-end">
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
                    onClick={nextStep}
                    disabled={!isStepValid()}
                  >
                    Siguiente
                  </motion.button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="step2"
                initial="hidden"
                animate="visible"
                exit="exit"
                variants={fadeVariants}
                transition={{ duration: 0.3 }}
                className="space-y-4"
              >
                <h3 className="text-lg font-medium text-gray-800">Información del propietario</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="owner_name" className="block text-sm font-medium text-gray-700 mb-1">
                      Nombre *
                    </label>
                    <motion.input
                      whileFocus={{ scale: 1.01 }}
                      transition={{ type: "spring", stiffness: 300 }}
                      id="owner_name"
                      name="owner_name"
                      placeholder="Nombre del propietario"
                      className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={formData.owner_name}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="owner_lastname" className="block text-sm font-medium text-gray-700 mb-1">
                      Apellido *
                    </label>
                    <motion.input
                      whileFocus={{ scale: 1.01 }}
                      transition={{ type: "spring", stiffness: 300 }}
                      id="owner_lastname"
                      name="owner_lastname"
                      placeholder="Apellido del propietario"
                      className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={formData.owner_lastname}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="owner_email" className="block text-sm font-medium text-gray-700 mb-1">
                    Correo electrónico *
                  </label>
                  <motion.input
                    whileFocus={{ scale: 1.01 }}
                    transition={{ type: "spring", stiffness: 300 }}
                    type="email"
                    id="owner_email"
                    name="owner_email"
                    placeholder="correo@ejemplo.com"
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={formData.owner_email}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div>
                  <label htmlFor="owner_password" className="block text-sm font-medium text-gray-700 mb-1">
                    Contraseña *
                  </label>
                  <motion.input
                    whileFocus={{ scale: 1.01 }}
                    transition={{ type: "spring", stiffness: 300 }}
                    type="password"
                    id="owner_password"
                    name="owner_password"
                    placeholder="Contraseña segura"
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={formData.owner_password}
                    onChange={handleChange}
                    required
                    minLength={6}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="owner_address" className="block text-sm font-medium text-gray-700 mb-1">
                      Dirección
                    </label>
                    <motion.input
                      whileFocus={{ scale: 1.01 }}
                      transition={{ type: "spring", stiffness: 300 }}
                      id="owner_address"
                      name="owner_address"
                      placeholder="Dirección del propietario"
                      className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={formData.owner_address}
                      onChange={handleChange}
                    />
                  </div>

                  <div>
                    <label htmlFor="owner_phone" className="block text-sm font-medium text-gray-700 mb-1">
                      Teléfono
                    </label>
                    <motion.input
                      whileFocus={{ scale: 1.01 }}
                      transition={{ type: "spring", stiffness: 300 }}
                      id="owner_phone"
                      name="owner_phone"
                      placeholder="Número de teléfono"
                      className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={formData.owner_phone}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="pt-4 flex justify-between">
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    className="px-6 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition"
                    onClick={prevStep}
                  >
                    Atrás
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
                    disabled={isLoading || !isStepValid()}
                  >
                    {isLoading ? (
                      <div className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Creando...
                      </div>
                    ) : 'Crear Comercio'}
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </form>
      </CardContent>
    </Card>
  );
}