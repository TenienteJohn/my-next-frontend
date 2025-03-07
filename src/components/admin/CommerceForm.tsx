'use client';
import { useState } from 'react';
import axios from 'axios';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

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

      const apiBaseUrl =
        process.env.NEXT_PUBLIC_API_BASE_URL ||
        'https://cartaenlinea-67dbc62791d3.herokuapp.com';

      const response = await axios.post(`${apiBaseUrl}/api/commerces`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      // Después de crear el comercio, obtenemos la información completa
      const getResponse = await axios.get(`${apiBaseUrl}/api/commerces`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Buscamos el comercio recién creado por su subdominio
      const newCommerce = getResponse.data.find(
        (c: any) => c.subdomain === formData.subdomain
      );

      // Si encontramos el comercio, lo pasamos al callback
      if (newCommerce) {
        onCommerceCreated(newCommerce);
      } else {
        // Si no lo encontramos, pasamos la respuesta original más los datos que conocemos
        onCommerceCreated({
          ...response.data,
          business_name: formData.commerceName,
          subdomain: formData.subdomain
        });
      }

      // Reiniciar el formulario
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

      setMessage('¡Comercio creado exitosamente!');
    } catch (error: any) {
      console.error("Error al crear el comercio:", error);
      setError(error.response?.data?.error || 'Error al crear el comercio. Intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="max-w-3xl mx-auto shadow-lg">
      <CardContent className="p-8">
        <h2 className="text-xl font-semibold mb-4">Crear Comercio</h2>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {message && (
          <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="commerceName" className="block text-sm font-medium text-gray-700 mb-1">
                Nombre del comercio *
              </label>
              <input
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
              <input
                id="subdomain"
                name="subdomain"
                placeholder="Ej: mirestaurante"
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={formData.subdomain}
                onChange={handleChange}
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                El subdominio será: {formData.subdomain}.tudominio.com
              </p>
            </div>
          </div>

          <div>
            <label htmlFor="business_category" className="block text-sm font-medium text-gray-700 mb-1">
              Categoría del negocio
            </label>
            <input
              id="business_category"
              name="business_category"
              placeholder="Ej: Restaurante, Cafetería, Tienda"
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={formData.business_category}
              onChange={handleChange}
            />
          </div>

          <h3 className="text-lg font-medium mt-6 mb-2 text-gray-800">Información del propietario</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="owner_name" className="block text-sm font-medium text-gray-700 mb-1">
                Nombre *
              </label>
              <input
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
              <input
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
            <input
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
            <input
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
              <input
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
              <input
                id="owner_phone"
                name="owner_phone"
                placeholder="Número de teléfono"
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={formData.owner_phone}
                onChange={handleChange}
              />
            </div>
          </div>

          <Button
            type="submit"
            className="mt-6 w-full"
            disabled={isLoading}
          >
            {isLoading ? 'Creando comercio...' : 'Crear Comercio'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}