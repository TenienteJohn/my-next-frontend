"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const login = async () => {
    const res = await fetch("https://cartaenlinea-67dbc62791d3.herokuapp.com/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (res.ok) {
      const data = await res.json();
      console.log("Rol del usuario:", data.role);

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
      setError("Credenciales incorrectas");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white shadow-lg rounded-lg flex overflow-hidden w-11/12 md:w-3/4 lg:w-1/2">
        {/* Sección de imagen */}
        <div className="hidden md:block md:w-1/2 relative">
          <Image
            src="/images/login-illustration.png"
            alt="Ilustración de inicio de sesión"
            layout="fill"
            objectFit="cover"
          />
        </div>

        {/* Sección de formulario */}
        <div className="w-full md:w-1/2 p-8">
          <h1 className="text-3xl font-bold mb-6 text-gray-800">Bienvenido de nuevo</h1>
          {error && <p className="text-red-500 mb-4">{error}</p>}
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
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
            />
          </div>
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
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
            />
          </div>
          <button
            onClick={login}
            className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition duration-300 transform hover:scale-105"
          >
            Iniciar Sesión
          </button>
        </div>
      </div>
    </div>
  );
}








