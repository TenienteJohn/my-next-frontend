'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface CommerceSettings {
  id: number;
  business_name: string;
  business_category?: string;
  subdomain: string;
  logo_url?: string;
  banner_url?: string;
  is_open?: boolean;
  delivery_time?: string;
  delivery_fee?: number;
  min_order_value?: number;
  accepts_delivery?: boolean;
  accepts_pickup?: boolean;
  contact_phone?: string;
  contact_email?: string;
  social_instagram?: string;
  social_facebook?: string;
  social_whatsapp?: string;
}

interface AxiosError {
  response?: {
    data?: {
      error?: string;
    };
    status?: number;
  };
  request?: unknown;
  message?: string;
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<CommerceSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const router = useRouter();

  // Cargar configuración actual
  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      if (!token) {
        router.push('/login');
        return;
      }

      const response = await axios.get('/api/commerces/my-commerce', {
        headers: { Authorization: `Bearer ${token}` }
      });

      setSettings(response.data);
      setError(null);
    } catch (error: unknown) {
      console.error('Error al cargar configuración:', error);

      if (error && typeof error === 'object') {
        const err = error as AxiosError;
        setError(err.response?.data?.error || 'Error al cargar la configuración');
      } else {
        setError('Error al cargar la configuración');
      }
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  // Manejar cambio en archivos de imagen
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'banner') => {
    if (!e.target.files || e.target.files.length === 0) return;

    const file = e.target.files[0];
    const previewUrl = URL.createObjectURL(file);

    if (type === 'logo') {
      setLogoFile(file);
      setLogoPreview(previewUrl);
    } else {
      setBannerFile(file);
      setBannerPreview(previewUrl);
    }
  };

  // Manejar cambios en los campos de texto
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;

    setSettings(prev => {
      if (!prev) return prev;

      // Manejar checkboxes
      if (type === 'checkbox') {
        const checkbox = e.target as HTMLInputElement;
        return { ...prev, [name]: checkbox.checked };
      }

      // Manejar campos numéricos
      if (type === 'number') {
        return { ...prev, [name]: value === '' ? null : Number(value) };
      }

      // Campos de texto normales
      return { ...prev, [name]: value };
    });
  };

  // Guardar cambios
  const handleSave = async () => {
    if (!settings) return;

    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      // Primero actualizamos los datos básicos
      await axios.put(
        `/api/commerces/${settings.id}`,
        {
          business_name: settings.business_name,
          business_category: settings.business_category,
          subdomain: settings.subdomain,
          is_open: settings.is_open,
          delivery_time: settings.delivery_time,
          delivery_fee: settings.delivery_fee,
          min_order_value: settings.min_order_value,
          accepts_delivery: settings.accepts_delivery,
          accepts_pickup: settings.accepts_pickup,
          contact_phone: settings.contact_phone,
          contact_email: settings.contact_email,
          social_instagram: settings.social_instagram,
          social_facebook: settings.social_facebook,
          social_whatsapp: settings.social_whatsapp
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Subir logo si se seleccionó uno nuevo
      if (logoFile) {
        const logoFormData = new FormData();
        logoFormData.append('logo', logoFile);

        await axios.put(
          `/api/commerces/${settings.id}/update-logo`,
          logoFormData,
          { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' } }
        );
      }

      // Subir banner si se seleccionó uno nuevo
      if (bannerFile) {
        const bannerFormData = new FormData();
        bannerFormData.append('banner', bannerFile);

        await axios.put(
          `/api/commerces/${settings.id}/update-banner`,
          bannerFormData,
          { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' } }
        );
      }

      setSuccess('Configuración guardada correctamente');

      // Recargar datos
      const response = await axios.get('/api/commerces/my-commerce', {
        headers: { Authorization: `Bearer ${token}` }
      });

      setSettings(response.data);

    } catch (error: unknown) {
      console.error('Error al guardar configuración:', error);

      if (error && typeof error === 'object') {
        const err = error as AxiosError;
        setError(err.response?.data?.error || 'Error al guardar la configuración');
      } else {
        setError('Error al guardar la configuración');
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin h-12 w-12 border-4 border-blue-500 rounded-full border-t-transparent"></div>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          No se pudo cargar la información del comercio.
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Configuración de la Tienda</h1>
          <Button
            onClick={() => router.push('/config')}
            variant="outline"
            className="flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Volver al panel
          </Button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            {success}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Información Básica */}
          <Card>
            <CardHeader className="bg-blue-50">
              <CardTitle>Información Básica</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Negocio</label>
                  <input
                    type="text"
                    name="business_name"
                    value={settings.business_name || ''}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
                  <input
                    type="text"
                    name="business_category"
                    value={settings.business_category || ''}
                    onChange={handleInputChange}
                    placeholder="Ej: Restaurante, Cafetería, etc."
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subdominio</label>
                  <div className="flex items-center">
                    <input
                      type="text"
                      name="subdomain"
                      value={settings.subdomain || ''}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 rounded-l-md"
                    />
                    <span className="bg-gray-100 text-gray-500 p-2 border border-l-0 border-gray-300 rounded-r-md whitespace-nowrap">
                      .cartaenlinea.com
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Imágenes */}
          <Card>
            <CardHeader className="bg-blue-50">
              <CardTitle>Imágenes</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Logo</label>
                  <div className="flex items-center space-x-4">
                    <div className="relative w-24 h-24 border rounded-md overflow-hidden bg-gray-100">
                      {(logoPreview || settings.logo_url) && (
                        <Image
                          src={logoPreview || settings.logo_url || ''}
                          alt="Logo preview"
                          fill
                          style={{ objectFit: "cover" }}
                        />
                      )}
                    </div>
                    <div className="flex-1">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileChange(e, 'logo')}
                        className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                      />
                      <p className="text-xs text-gray-500 mt-1">Recomendado: 500x500px - PNG, JPG o GIF</p>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Banner de la Tienda</label>
                  <div className="flex items-center space-x-4">
                    <div className="relative w-full h-32 border rounded-md overflow-hidden bg-gray-100">
                      {(bannerPreview || settings.banner_url) && (
                        <Image
                          src={bannerPreview || settings.banner_url || ''}
                          alt="Banner preview"
                          fill
                          style={{ objectFit: "cover" }}
                        />
                      )}
                    </div>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, 'banner')}
                    className="w-full mt-2 text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                  <p className="text-xs text-gray-500 mt-1">Recomendado: 1200x400px - PNG, JPG o GIF</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Configuración de Pedidos */}
          <Card>
            <CardHeader className="bg-blue-50">
              <CardTitle>Configuración de Pedidos</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="is_open"
                    name="is_open"
                    checked={settings.is_open || false}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                  />
                  <label htmlFor="is_open" className="ml-2 block text-sm text-gray-900">
                    Tienda Abierta
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tiempo de Entrega (min)</label>
                  <input
                    type="text"
                    name="delivery_time"
                    value={settings.delivery_time || ''}
                    onChange={handleInputChange}
                    placeholder="Ej: 30-45"
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Costo de Envío ($)</label>
                  <input
                    type="number"
                    name="delivery_fee"
                    value={settings.delivery_fee || ''}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Pedido Mínimo ($)</label>
                  <input
                    type="number"
                    name="min_order_value"
                    value={settings.min_order_value || ''}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="accepts_delivery"
                    name="accepts_delivery"
                    checked={settings.accepts_delivery || false}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                  />
                  <label htmlFor="accepts_delivery" className="ml-2 block text-sm text-gray-900">
                    Aceptar Entregas a Domicilio
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="accepts_pickup"
                    name="accepts_pickup"
                    checked={settings.accepts_pickup || false}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                  />
                  <label htmlFor="accepts_pickup" className="ml-2 block text-sm text-gray-900">
                    Aceptar Retiro en Tienda
                  </label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contacto y Redes Sociales */}
          <Card>
            <CardHeader className="bg-blue-50">
              <CardTitle>Contacto y Redes Sociales</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono de Contacto</label>
                  <input
                    type="text"
                    name="contact_phone"
                    value={settings.contact_phone || ''}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email de Contacto</label>
                  <input
                    type="email"
                    name="contact_email"
                    value={settings.contact_email || ''}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Instagram</label>
                  <div className="flex items-center">
                    <span className="bg-gray-100 text-gray-500 p-2 border border-r-0 border-gray-300 rounded-l-md">
                      @
                    </span>
                    <input
                      type="text"
                      name="social_instagram"
                      value={settings.social_instagram || ''}
                      onChange={handleInputChange}
                      placeholder="username"
                      className="w-full p-2 border border-gray-300 rounded-r-md"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Facebook</label>
                  <input
                    type="text"
                    name="social_facebook"
                    value={settings.social_facebook || ''}
                    onChange={handleInputChange}
                    placeholder="https://facebook.com/yourbusiness"
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp</label>
                  <input
                    type="text"
                    name="social_whatsapp"
                    value={settings.social_whatsapp || ''}
                    onChange={handleInputChange}
                    placeholder="+56912345678"
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Botones de acción */}
        <div className="flex justify-end mt-6 space-x-3">
          <Button
            variant="outline"
            onClick={() => router.push('/config')}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {saving ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Guardando...
              </>
            ) : (
              'Guardar Cambios'
            )}
          </Button>
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-md text-sm text-blue-800">
          <p className="font-medium">Nota:</p>
          <p>Algunos campos requieren actualización del backend para funcionar. Serán implementados próximamente.</p>
        </div>
      </motion.div>
    </div>
  );
}