"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function Login() {
  // ✅ Se define el estado para el email, la contraseña y el error.
  const [email, setEmail] = useState(""); // Estado para el email ingresado
  const [password, setPassword] = useState(""); // Estado para la contraseña ingresada
  const [error, setError] = useState<string | null>(null); // ✅ Se agregó el tipo 'string | null' para evitar errores de asignación en TypeScript
  const router = useRouter(); // Hook para la navegación

  /**
   * ✅ Función para manejar el inicio de sesión
   * Envía las credenciales al backend y redirige según el rol del usuario.
   */
  const login = async () => {
    try {
      const res = await fetch("https://cartaenlinea-67dbc62791d3.herokuapp.com/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (res.ok) {
        const data = await res.json();
        localStorage.setItem("token", data.token);
        localStorage.setItem("role", data.role);

        // ✅ Redirige según el rol del usuario
        if (data.role === "SUPERUSER") {
          router.push("/admin/commerces");
        } else {
          router.push("/config");
        }
      } else {
        setError("Credenciales incorrectas"); // ✅ Ahora TypeScript permite esta asignación sin errores
      }
    } catch (error) {
      console.error("❌ Error al iniciar sesión:", error);
      setError("Ocurrió un error. Inténtalo nuevamente."); // Manejo de errores inesperados
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-500 to-purple-600">
      <div className="bg-white shadow-lg rounded-lg flex overflow-hidden w-3/4 max-w-4xl">

        {/* ✅ Sección de imagen ilustrativa */}
        <div className="w-1/2 relative">
          <Image
            src="/images/taller-2030.png"
            alt="Ilustración de inicio de sesión"
            layout="fill"
            objectFit="cover"
          />
        </div>

        {/* ✅ Sección del formulario de login */}
        <div className="w-1/2 p-8">
          <h1 className="text-3xl font-bold mb-6 text-gray-800">Bienvenido de nuevo</h1>

          {/* ✅ Muestra el mensaje de error si existe */}
          {error && <p className="text-red-500 mb-4">{error}</p>}

          {/* ✅ Input para el correo electrónico */}
          <div className="mb-4">
            <label className="block text-gray-700 mb-2" htmlFor="email">
              Correo Electrónico
            </label>
            <input
              type="email"
              id="email"
              placeholder="Ingresa tu correo"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* ✅ Input para la contraseña */}
          <div className="mb-6">
            <label className="block text-gray-700 mb-2" htmlFor="password">
              Contraseña
            </label>
            <input
              type="password"
              id="password"
              placeholder="Ingresa tu contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* ✅ Botón de inicio de sesión */}
          <button
            onClick={login}
            className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition duration-300"
          >
            Iniciar Sesión
          </button>
        </div>
      </div>
    </div>
  );
}





