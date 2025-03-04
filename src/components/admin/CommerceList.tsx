"use client";
import { useState } from "react";
import Image from "next/image";

interface Commerce {
  id: number;
  business_name: string;
  subdomain: string;
  logo_url?: string; // ✅ Se agrega el logo_url opcional
}

interface CommerceListProps {
  commerces: Commerce[];
  setCommerces: (commerces: Commerce[]) => void;
}

export default function CommerceList({ commerces, setCommerces }: CommerceListProps) {
  const [editingSubdomain, setEditingSubdomain] = useState<number | null>(null);
  const [newSubdomain, setNewSubdomain] = useState("");

  /**
   * ✅ Maneja la edición del subdominio de un comercio.
   */
  const handleUpdateSubdomain = async (commerceId: number) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `https://cartaenlinea-67dbc62791d3.herokuapp.com/api/commerces/${commerceId}/assign-subdomain`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ subdomain: newSubdomain }),
        }
      );

      if (!res.ok) {
        throw new Error("Error al actualizar el subdominio.");
      }

      const data = await res.json();
      setCommerces((prevCommerces) =>
        prevCommerces.map((commerce) =>
          commerce.id === commerceId ? { ...commerce, subdomain: data.commerce.subdomain } : commerce
        )
      );
      setEditingSubdomain(null);
      setNewSubdomain("");
    } catch (error) {
      console.error("❌ Error al actualizar el subdominio:", error);
    }
  };

  /**
   * ✅ Maneja la subida del logo de un comercio.
   */
  const handleUploadLogo = async (commerceId: number, file: File) => {
    const formData = new FormData();
    formData.append("image", file);

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `https://cartaenlinea-67dbc62791d3.herokuapp.com/api/commerces/${commerceId}/update-logo`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Error desconocido al subir la imagen.");
      }

      // ✅ Actualizar la lista de comercios con la nueva imagen
      setCommerces((prevCommerces) =>
        prevCommerces.map((commerce) =>
          commerce.id === commerceId ? { ...commerce, logo_url: data.commerce.logo_url } : commerce
        )
      );
    } catch (error) {
      console.error("❌ Error al subir el logo:", error);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {commerces.map((commerce) => (
        <div key={commerce.id} className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
          {/* Contenedor del logo */}
          <div className="relative w-24 h-24 mx-auto mb-4">
            {commerce.logo_url ? (
              <Image
                src={commerce.logo_url}
                alt="Logo del comercio"
                layout="fill"
                objectFit="cover"
                className="rounded-full border"
              />
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center rounded-full text-gray-500 text-sm">
                Sin Logo
              </div>
            )}

            {/* Botón minimalista para subir imagen */}
            <label className="absolute bottom-0 right-0 bg-blue-500 text-white text-xs p-1 rounded-full cursor-pointer">
              +
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleUploadLogo(commerce.id, e.target.files[0]);
                  }
                }}
              />
            </label>
          </div>

          <h2 className="text-xl font-semibold text-gray-700">{commerce.business_name}</h2>
          <p className="text-gray-500">{commerce.subdomain}</p>

          {editingSubdomain === commerce.id ? (
            <div className="mt-4">
              <input
                type="text"
                value={newSubdomain}
                onChange={(e) => setNewSubdomain(e.target.value)}
                className="p-2 border rounded w-full"
              />
              <button
                onClick={() => handleUpdateSubdomain(commerce.id)}
                className="mt-2 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition duration-300"
              >
                Guardar
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                setEditingSubdomain(commerce.id);
                setNewSubdomain(commerce.subdomain);
              }}
              className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition duration-300"
            >
              Editar Subdominio
            </button>
          )}
        </div>
      ))}
    </div>
  );
}


