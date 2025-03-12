"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";

interface FetchError extends Error {
  message: string;
}

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [detailedError, setDetailedError] = useState<string | null>(null);
  const router = useRouter();

  const login = async () => {
    try {
      setIsLoading(true);
      setError(null);
      setDetailedError(null);

      // URL de la API
      const apiUrl = "https://cartaenlinea-67dbc62791d3.herokuapp.com/api/auth/login";

      console.log(`Intentando conectar a: ${apiUrl}`);

      // Comprobar si el servidor está accesible
      try {
        // Primero hacemos un ping simple para verificar si el servidor está disponible
        await fetch(apiUrl, {
          method: 'OPTIONS',
          mode: 'cors',
          headers: {
            'Access-Control-Request-Method': 'POST',
            'Access-Control-Request-Headers': 'Content-Type'
          }
        });
      } catch (pingError: unknown) {
        console.error("Error al verificar disponibilidad del servidor:", pingError);

        const errorMessage = pingError instanceof Error
          ? pingError.message
          : "No se pudo conectar al servidor";

        setDetailedError(`Error de conexión: ${errorMessage}`);
        throw new Error("El servidor no está accesible en este momento. Por favor, intenta más tarde.");
      }

      // Si el ping es exitoso, procedemos con el login
      const res = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({ email, password }),
        // Asegurar que las solicitudes incluyan credenciales (cookies)
        credentials: 'include',
        // Forzar modo CORS para permitir solicitudes entre dominios
        mode: 'cors',
      });

      if (res.ok) {
        const data = await res.json();
        console.log("Login exitoso, rol:", data.role);

        localStorage.setItem("token", data.token);
        localStorage.setItem("role", data.role);

        if (data.role === "SUPERUSER") {
          router.push("/admin/commerces");
        } else if (data.role === "OWNER") {
          router.push("/config");
        } else {
          console.error("Rol desconocido:", data.role);
          setError("Rol desconocido. Contacta al soporte.");
        }
      } else {
        // Extraer información del error de la respuesta
        try {
          const errorData = await res.json();
          setError(errorData.message || errorData.error || "Credenciales incorrectas");
          setDetailedError(`Código: ${res.status}, Mensaje: ${JSON.stringify(errorData)}`);
        } catch (_responseError) {
          setError(`Error en la autenticación (${res.status})`);
          setDetailedError(`El servidor respondió con: ${res.statusText}`);
        }
      }
    } catch (error: unknown) {
      console.error("❌ Error al iniciar sesión:", error);
      const errorMessage = error instanceof Error ? error.message : "Ocurrió un error. Inténtalo nuevamente.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-500 to-purple-600">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white shadow-lg rounded-lg flex overflow-hidden w-11/12 md:w-3/4 max-w-4xl"
      >
        {/* Sección de imagen ilustrativa */}
        <div className="w-1/2 relative hidden md:block">
          <Image
            src="/images/login-illustration.png"
            alt="Ilustración de inicio de sesión"
            layout="fill"
            objectFit="cover"
          />
        </div>

        {/* Sección del formulario de login */}
        <div className="w-full md:w-1/2 p-8">
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-3xl font-bold mb-6 text-gray-800"
          >
            Bienvenido de nuevo
          </motion.h1>

          {error && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded"
            >
              <p className="font-medium">{error}</p>

              {detailedError && (
                <details className="mt-2 text-sm">
                  <summary className="cursor-pointer text-red-600">Detalles técnicos</summary>
                  <p className="mt-1 p-2 bg-red-50 rounded">{detailedError}</p>
                </details>
              )}

              <p className="mt-2 text-sm">
                ¿Problemas para conectar? Prueba:
                <ul className="list-disc ml-5 mt-1">
                  <li>Verificar tu conexión a internet</li>
                  <li>Comprobar que la URL del servidor es correcta</li>
                  <li>Contactar al administrador si el problema persiste</li>
                </ul>
              </p>
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-4"
          >
            <div className="mb-4">
              <label className="block text-gray-700 mb-2" htmlFor="email">
                Correo Electrónico
              </label>
              <motion.input
                whileFocus={{ scale: 1.01 }}
                transition={{ type: "spring", stiffness: 300 }}
                type="email"
                id="email"
                placeholder="Ingresa tu correo"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="mb-6">
              <label className="block text-gray-700 mb-2" htmlFor="password">
                Contraseña
              </label>
              <motion.input
                whileFocus={{ scale: 1.01 }}
                transition={{ type: "spring", stiffness: 300 }}
                type="password"
                id="password"
                placeholder="Ingresa tu contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    login();
                  }
                }}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={login}
              disabled={isLoading}
              className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition duration-300 flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Iniciando sesión...
                </>
              ) : (
                'Iniciar Sesión'
              )}
            </motion.button>
          </motion.div>

          {/* Información de entorno de desarrollo */}
          <div className="mt-6 pt-4 border-t border-gray-200 text-xs text-gray-500">
            <p>Servidor API: {process.env.NEXT_PUBLIC_API_BASE_URL || 'https://cartaenlinea-67dbc62791d3.herokuapp.com'}</p>
            <p>Entorno: {process.env.NODE_ENV}</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}








