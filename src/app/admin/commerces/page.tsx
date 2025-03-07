"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Logout from "@/components/Logout";
import CommerceList from "@/components/admin/CommerceList";

interface Commerce {
  id: number;
  business_name: string;
  subdomain: string;
  logo_url?: string;
  created_at?: string;
}

export default function AdminCommercesPage() {
  const [commerces, setCommerces] = useState<Commerce[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchCommerces();
  }, []);

  const fetchCommerces = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/login");
      return;
    }

    try {
      setIsLoading(true);
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://cartaenlinea-67dbc62791d3.herokuapp.com';

      const response = await axios.get(`${apiBaseUrl}/api/commerces`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setCommerces(response.data);
      setError(null);
    } catch (error: any) {
      console.error("❌ Error cargando comercios:", error);
      setError(error.response?.data?.error || "Error cargando datos");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Panel de Administración</h1>
        <Logout />
      </div>

      {error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
          {error}
          <button
            onClick={fetchCommerces}
            className="ml-4 px-3 py-1 bg-red-500 text-white rounded"
          >
            Reintentar
          </button>
        </div>
      ) : isLoading ? (
        <div className="text-center py-8">
          <p className="text-lg text-gray-600">Cargando comercios...</p>
        </div>
      ) : (
        <CommerceList
          commerces={commerces}
          setCommerces={setCommerces}
        />
      )}
    </div>
  );
}