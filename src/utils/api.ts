// src/utils/api.ts
import axios from 'axios';

// Crear una instancia de Axios con la configuración base
const api = axios.create({
  baseURL: '/', // La base URL está configurada mediante el proxy de Next.js
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para añadir el token a todas las peticiones
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores de respuesta
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      console.log('Token expirado o inválido');
      // Guardar la URL actual antes de redirigir
      const currentPath = window.location.pathname;
      localStorage.setItem('redirectAfterLogin', currentPath);

      // Limpiar el token
      localStorage.removeItem('token');

      // Mostrar un mensaje al usuario
      alert('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');

      // Redirigir a la página de login
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;