// src/components/admin/CommerceForm.tsx
'use client';
import { useState } from 'react';
import axios, { AxiosError } from 'axios';
import { Card, CardContent } from '@/components/ui/card';
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
  working_hours?: string;    // Nuevo campo para horario de trabajo
}

interface Commerce {
  id: number;
  business_name: string;
  subdomain: string;
  logo_url?: string;
  business_category?: string;
  created_at?: string;
  working_hours?: string;
  // Otros campos que pueda tener tu objeto Commerce
}

interface FieldValidation {
  isValid: boolean;
  error: string | null;
  isChecking: boolean;
}

interface ValidationState {
  subdomain: FieldValidation;
  owner_email: FieldValidation;
  owner_password: FieldValidation;
}

interface DetailedError {
  status?: number;
  data?: unknown;
  request?: string;
  message?: string;
}

interface CommerceFormProps {
  onCommerceCreated: (newCommerce: Commerce) => void;
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
      working_hours: '',
    });

  // Estado para validación de campos
  const [validation, setValidation] = useState<ValidationState>({
    subdomain: { isValid: true, error: null, isChecking: false },
    owner_email: { isValid: true, error: null, isChecking: false },
    owner_password: { isValid: true, error: null, isChecking: false },
  });

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [detailedError, setDetailedError] = useState<DetailedError | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1); // Para navegación multi-pasos
  const [formSubmitted, setFormSubmitted] = useState(false);

  // Debounce timer para validación de campos
  const [emailCheckTimeout, setEmailCheckTimeout] = useState<NodeJS.Timeout | null>(null);
  const [subdomainCheckTimeout, setSubdomainCheckTimeout] = useState<NodeJS.Timeout | null>(null);

  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://cartaenlinea-67dbc62791d3.herokuapp.com';

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name === 'subdomain') {
      // Formatear subdominio: solo letras minúsculas, números y guiones
      const formattedSubdomain = value
        .toLowerCase()
        .replace(/[^a-z0-9-]/g, '') // Solo permitir letras minúsculas, números y guiones
        .replace(/^-+|-+$/g, ''); // Eliminar guiones al principio y al final

      setFormData({ ...formData, subdomain: formattedSubdomain });

      // Validar subdominio con debounce
      if (formattedSubdomain.length >= 3) {
        setValidation(prev => ({
          ...prev,
          subdomain: { ...prev.subdomain, isChecking: true, error: null }
        }));

        // Limpiar timeout anterior si existe
        if (subdomainCheckTimeout) clearTimeout(subdomainCheckTimeout);

        // Configurar nuevo timeout
        const timeout = setTimeout(async () => {
          await checkSubdomainAvailability(formattedSubdomain);
        }, 500);

        setSubdomainCheckTimeout(timeout);
      } else if (formattedSubdomain.length > 0) {
        setValidation(prev => ({
          ...prev,
          subdomain: {
            isValid: false,
            error: 'El subdominio debe tener al menos 3 caracteres',
            isChecking: false
          }
        }));
      }
    } else if (name === 'owner_email') {
      setFormData({ ...formData, owner_email: value });

      // Validar email con regex básico
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (value && !emailRegex.test(value)) {
        setValidation(prev => ({
          ...prev,
          owner_email: {
            isValid: false,
            error: 'Formato de correo electrónico inválido',
            isChecking: false
          }
        }));
        return;
      }

      // Validar disponibilidad de email con debounce
      if (value && emailRegex.test(value)) {
        setValidation(prev => ({
          ...prev,
          owner_email: { ...prev.owner_email, isChecking: true, error: null }
        }));

        // Limpiar timeout anterior si existe
        if (emailCheckTimeout) clearTimeout(emailCheckTimeout);

        // Configurar nuevo timeout
        const timeout = setTimeout(async () => {
          await checkEmailAvailability(value);
        }, 500);

        setEmailCheckTimeout(timeout);
      } else if (!value) {
        setValidation(prev => ({
          ...prev,
          owner_email: { isValid: true, error: null, isChecking: false }
        }));
      }
    } else if (name === 'owner_password') {
      setFormData({ ...formData, owner_password: value });

      // Validar longitud mínima de contraseña
      if (value && value.length < 6) {
        setValidation(prev => ({
          ...prev,
          owner_password: {
            isValid: false,
            error: 'La contraseña debe tener al menos 6 caracteres',
            isChecking: false
          }
        }));
      } else {
        setValidation(prev => ({
          ...prev,
          owner_password: { isValid: true, error: null, isChecking: false }
        }));
      }
    } else {
      // Para otros campos, no se necesita validación especial
      setFormData({ ...formData, [name]: value });
    }
  };

  // Función para verificar disponibilidad de email
  const checkEmailAvailability = async (email: string) => {
    try {
      const response = await axios.get(`${apiBaseUrl}/api/auth/check-email/${email}`);

      setValidation(prev => ({
        ...prev,
        owner_email: {
          isValid: response.data.isAvailable,
          error: response.data.isAvailable ? null : 'Este correo ya está registrado',
          isChecking: false
        }
      }));
    } catch (error) {
      console.error('Error al verificar disponibilidad de email:', error);
      setValidation(prev => ({
        ...prev,
        owner_email: {
          isValid: true, // Asumir válido en caso de error para no bloquear al usuario
          error: null,
          isChecking: false
        }
      }));
    }
  };

  // Función para verificar disponibilidad de subdominio
  const checkSubdomainAvailability = async (subdomain: string) => {
    try {
      // Verificar que el subdominio tenga al menos 3 caracteres
      if (subdomain.length < 3) {
        setValidation(prev => ({
          ...prev,
          subdomain: {
            isValid: false,
            error: 'El subdominio debe tener al menos 3 caracteres',
            isChecking: false
          }
        }));
        return;
      }

      // Verificar subdominio consultando la lista de comercios
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No se encontró token de autenticación");
      }

      const commercesResponse = await axios.get(`${apiBaseUrl}/api/commerces`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const isSubdomainAvailable = !commercesResponse.data.some(
        (commerce: Commerce) => commerce.subdomain.toLowerCase() === subdomain.toLowerCase()
      );

      setValidation(prev => ({
        ...prev,
        subdomain: {
          isValid: isSubdomainAvailable,
          error: isSubdomainAvailable ? null : 'Este subdominio ya está en uso',
          isChecking: false
        }
      }));
    } catch (error) {
      console.error('Error al verificar disponibilidad de subdominio:', error);
      setValidation(prev => ({
        ...prev,
        subdomain: {
          isValid: true, // Asumir válido en caso de error para no bloquear al usuario
          error: null,
          isChecking: false
        }
      }));
    }
  };

  const isStepValid = () => {
    if (step === 1) {
      return (
        formData.commerceName &&
        formData.subdomain &&
        validation.subdomain.isValid &&
        formData.business_category &&
        !validation.subdomain.isChecking
      );
    } else {
      return (
        formData.owner_name &&
        formData.owner_lastname &&
        formData.owner_email &&
        validation.owner_email.isValid &&
        formData.owner_password &&
        validation.owner_password.isValid &&
        !validation.owner_email.isChecking
      );
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
    setDetailedError(null);
    setMessage('');

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("No se encontró token de autenticación");
      }

      // Mapeo de campos del formulario a los nombres que espera el backend
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
              working_hours: formData.working_hours,
            };

      // Loguear el payload para depuración
      console.log("Enviando payload:", payload);

      try {
        const response = await axios.post(`${apiBaseUrl}/api/commerces`, payload, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        // Loguear la respuesta completa
        console.log("Respuesta exitosa:", response);

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
                      working_hours: '',
                    });
          setStep(1);
          setFormSubmitted(false);
        }, 2000);

        setMessage('¡Comercio creado exitosamente!');
        onCommerceCreated(response.data);
      } catch (axiosError) {
        // Capturar y mostrar detalles específicos del error de Axios
        console.error("Error de Axios:", axiosError);

        if (axios.isAxiosError(axiosError)) {
          const error = axiosError as AxiosError<{field?: string; error?: string}>;

          if (error.response) {
            // El servidor respondió con un código de estado diferente de 2xx
            console.error("Datos de la respuesta:", error.response.data);
            console.error("Estado HTTP:", error.response.status);

            // Manejar errores específicos de campo
            const responseData = error.response.data as {field?: string; error?: string};

            if (responseData?.field) {
              const field = responseData.field;
              const errorMsg = responseData.error;

              if (field === 'subdomain') {
                setValidation(prev => ({
                  ...prev,
                  subdomain: {
                    isValid: false,
                    error: errorMsg || 'Error en el subdominio',
                    isChecking: false
                  }
                }));
                setStep(1); // Volver al paso 1 si hay error en subdominio
              } else if (field === 'owner_email') {
                setValidation(prev => ({
                  ...prev,
                  owner_email: {
                    isValid: false,
                    error: errorMsg || 'Error en el email',
                    isChecking: false
                  }
                }));
                setStep(2); // Volver al paso 2 si hay error en email
              }
            } else {
              // Error general
              setError(`Error ${error.response.status}: ${(error.response.data as {error?: string})?.error || 'Error del servidor'}`);
            }

            setDetailedError({
              status: error.response.status,
              data: error.response.data,
            });
          } else if (error.request) {
            // La solicitud se realizó pero no se recibió respuesta
            console.error("No se recibió respuesta:", error.request);
            setError("No se recibió respuesta del servidor. Verifica tu conexión a internet.");
            setDetailedError({ request: "No response received" });
          } else {
            // Algo salió mal al configurar la solicitud
            console.error("Error de configuración:", error.message);
            setError(`Error de configuración: ${error.message}`);
            setDetailedError({ message: error.message });
          }
        }

        throw axiosError; // Re-lanzar para el catch externo
      }
    } catch (error) {
      // Este catch captura cualquier otro error no relacionado con Axios
      console.error("Error general al crear el comercio:", error);

      if (!detailedError) {
        setError(error instanceof Error ? error.message : 'Error al crear el comercio. Intenta de nuevo.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const fadeVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 }
  };

  // Componente para mostrar estado de validación
  const ValidationStatus = ({ field }: { field: 'subdomain' | 'owner_email' | 'owner_password' }) => {
    const { isValid, error, isChecking } = validation[field];

    if (isChecking) {
      return (
        <div className="text-blue-500 text-xs mt-1 flex items-center">
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Verificando...
        </div>
      );
    }

    if (!isValid && error) {
      return <div className="text-red-500 text-xs mt-1">{error}</div>;
    }

    if (field === 'subdomain' && formData.subdomain.length >= 3 && isValid) {
      return <div className="text-green-500 text-xs mt-1">Subdominio disponible</div>;
    }

    if (field === 'owner_email' && formData.owner_email && isValid) {
      return <div className="text-green-500 text-xs mt-1">Email disponible</div>;
    }

    return null;
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
            <p className="font-medium">{error}</p>

            {detailedError && (
              <details className="mt-2 text-sm">
                <summary className="cursor-pointer text-red-600">Ver detalles técnicos del error</summary>
                <pre className="mt-2 p-2 bg-red-50 text-red-800 rounded overflow-auto text-xs">
                  {JSON.stringify(detailedError, null, 2)}
                </pre>
              </details>
            )}
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
                      className={`w-full p-2 border rounded focus:ring-2 focus:border-transparent ${
                        validation.subdomain.isValid
                          ? "focus:ring-blue-500"
                          : "border-red-300 focus:ring-red-500"
                      }`}
                      value={formData.subdomain}
                      onChange={handleChange}
                      required
                    />
                    <ValidationStatus field="subdomain" />
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

                <div>
                                  <label htmlFor="working_hours" className="block text-sm font-medium text-gray-700 mb-1">
                                    Horario de trabajo
                                  </label>
                                  <motion.input
                                    whileFocus={{ scale: 1.01 }}
                                    transition={{ type: "spring", stiffness: 300 }}
                                    id="working_hours"
                                    name="working_hours"
                                    placeholder="Ej: 08:00 hs a 19:00 hs"
                                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    value={formData.working_hours}
                                    onChange={handleChange}
                                  />
                                  <p className="text-xs text-gray-500 mt-1">
                                    Formato: 08:00 hs a 19:00 hs, o 07:00 hs a 14:00 hs y de 16:30 hs a 24:00 hs
                                  </p>
                                </div>

                <div className="pt-4 flex justify-end">
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    className={`px-6 py-2 rounded transition ${
                      isStepValid()
                        ? "bg-blue-500 text-white hover:bg-blue-600"
                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                    }`}
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
                    className={`w-full p-2 border rounded focus:ring-2 focus:border-transparent ${
                      validation.owner_email.isValid
                        ? "focus:ring-blue-500"
                        : "border-red-300 focus:ring-red-500"
                    }`}
                    value={formData.owner_email}
                    onChange={handleChange}
                    required
                  />
                  <ValidationStatus field="owner_email" />
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
                    className={`w-full p-2 border rounded focus:ring-2 focus:border-transparent ${
                      validation.owner_password.isValid
                        ? "focus:ring-blue-500"
                        : "border-red-300 focus:ring-red-500"
                    }`}
                    value={formData.owner_password}
                    onChange={handleChange}
                    required
                    minLength={6}
                  />
                  <ValidationStatus field="owner_password" />
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
                    className={`px-6 py-2 rounded transition ${
                      isStepValid() && !isLoading
                        ? "bg-blue-500 text-white hover:bg-blue-600"
                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                    }`}
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

