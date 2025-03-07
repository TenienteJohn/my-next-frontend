// src/app/admin/commerces/page.tsx
"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import axios from "axios";
import AnimatedLayout from "@/components/AnimatedLayout";
import AdminNavbar from "@/components/admin/AdminNavbar";
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
    <>
      <AdminNavbar />
      <AnimatedLayout>
        <div className="min-h-screen bg-gray-100 p-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Panel de Comercios</h1>
          </motion.div>

          {error ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4"
            >
              {error}
              <button
                onClick={fetchCommerces}
                className="ml-4 px-3 py-1 bg-red-500 text-white rounded"
              >
                Reintentar
              </button>
            </motion.div>
          ) : isLoading ? (
            <div className="flex justify-center py-8">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="animate-spin h-10 w-10 border-4 border-blue-500 rounded-full border-t-transparent"
              />
            </div>
          ) : (
            <CommerceList
              commerces={commerces}
              setCommerces={setCommerces}
            />
          )}
        </div>
      </AnimatedLayout>
    </>
  );
}