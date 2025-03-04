"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Logout from "@/components/Logout";
import CommerceList from "@/components/admin/CommerceList";

interface Commerce {
  id: number;
  business_name: string;
  subdomain: string;
  logo_url?: string; // ✅ Aseguramos que el logo esté disponible
}

export default function AdminCommercesPage() { // ✅ Aseguramos exportación por defecto
  const [commerces, setCommerces] = useState<Commerce[]>([]);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/login");
      return;
    }

    fetch("https://cartaenlinea-67dbc62791d3.herokuapp.com/api/commerces", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(async (res) => {
        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(errorText);
        }
        return res.json();
      })
      .then((data) => setCommerces(data))
      .catch((error) => {
        console.error("❌ Error cargando comercios:", error);
        setError("Error cargando datos");
      });
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Panel de Administración</h1>
        <Logout />
      </div>

      {error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <CommerceList commerces={commerces} setCommerces={setCommerces} />
      )}
    </div>
  );
}
