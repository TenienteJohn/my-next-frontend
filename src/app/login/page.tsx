// src/app/login/page.tsx
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
  const [debugInfo, setDebugInfo] = useState<string | null>(null);
  const router = useRouter();

  const login = async () => {
    try {
      setIsLoading(true);
      setError(null);
      setDebugInfo(null);

      console.log('Iniciando proceso de login con proxy local');

      // Usar el proxy local en lugar del endpoint directo
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (res.ok) {
        const data = await res.json();

        // Para depuración - mostrar la respuesta completa del servidor
        console.log("Respuesta del servidor:", data);
        setDebugInfo(JSON.stringify(data, null, 2));

        // Guardar token y rol en localStorage
        localStorage.setItem("token", data.token);
        localStorage.setItem("role", data.role);

        // También guardar el commerceId si está disponible
        if (data.commerceId) {
          localStorage.setItem("commerceId", data.commerceId.toString());
        }

        if (data.role === "SUPERUSER") {
          router.push("/admin/commerces");
        } else {
          // Si es OWNER, manejar la redirección con subdominios
          const hostname = window.location.hostname;

          // Verificar si ya estamos en un subdominio
          const isSubdomain = (hostname.includes('localhost') && hostname !== 'localhost') ||
                             (hostname.includes('.') && !hostname.startsWith('www'));

          // Para depuración
          console.log(`Hostname actual: ${hostname}`);
          console.log(`¿Es subdominio?: ${isSubdomain}`);

          if (isSubdomain) {
            // Si ya estamos en un subdominio, simplemente navegamos a /config
            console.log("Ya estamos en un subdominio, navegando a /config");
            router.push("/config");
          } else {
            // Si no estamos en un subdominio, verificamos si la respuesta incluye información del subdominio
            if (data.commerce && data.commerce.subdomain) {
              // La API devuelve el subdominio en data.commerce.subdomain
              const subdomain = data.commerce.subdomain;
              console.log(`Subdominio encontrado en la respuesta: ${subdomain}`);

              // Construir la URL con el subdominio
              let redirectUrl;
              if (hostname.includes('localhost')) {
                redirectUrl = `http://${subdomain}.localhost:3000/config`;
              } else {
                redirectUrl = `https://${subdomain}.cartaenlinea.com/config`;
              }

              console.log(`Redirigiendo a: ${redirectUrl}`);
              window.location.href = redirectUrl;
            } else if (data.subdomain) {
              // La API devuelve el subdominio directamente en data.subdomain
              const subdomain = data.subdomain;
              console.log(`Subdominio encontrado en la respuesta: ${subdomain}`);

              // Construir la URL con el subdominio
              let redirectUrl;
              if (hostname.includes('localhost')) {
                redirectUrl = `http://${subdomain}.localhost:3000/config`;
              } else {
                redirectUrl = `https://${subdomain}.cartaenlinea.com/config`;
              }

              console.log(`Redirigiendo a: ${redirectUrl}`);
              window.location.href = redirectUrl;
            } else {
              // No hay información de subdominio, navegamos a /config en el dominio actual
              console.log("No se encontró información de subdominio, navegando a /config");
              router.push("/config");
            }
          }
        }
      } else {
        // Obtener detalles del error
        try {
          const errorData = await res.json();
          setError(errorData.message || errorData.error || "Credenciales incorrectas");
          setDebugInfo(JSON.stringify(errorData, null, 2));
        } catch (_responseError) {
          setError(`Error ${res.status}: ${res.statusText}`);
        }
      }
    } catch (error: unknown) {
      console.error("❌ Error al iniciar sesión:", error);

      const errorMessage = error instanceof Error
        ? error.message
        : "No se pudo conectar al servidor";

      setError(`Error de conexión: ${errorMessage}`);
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
        className="bg-white shadow-lg rounded-lg flex overflow-hidden w-3/4 max-w-4xl"
      >
        {/* Sección de imagen ilustrativa */}
        <div className="w-1/2 relative hidden md:block">
          <Image
            src="/images/taller-2030.png"
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
              className="bg-red-100 border border-red-400 text-red-700 p-3 rounded-md mb-4"
            >
              {error}
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

          {/* Sección de depuración - solo visible en desarrollo */}
          {process.env.NODE_ENV === 'development' && debugInfo && (
            <div className="mt-6 p-3 bg-gray-100 rounded-md text-xs overflow-x-auto">
              <p className="font-bold mb-1">Información de respuesta (depuración):</p>
              <pre>{debugInfo}</pre>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}