/** @type {import('next').NextConfig} */
const nextConfig = {
  // Ignora errores de TypeScript durante el build
  typescript: {
    ignoreBuildErrors: true,
  },
  // Ignora errores de ESLint durante el build
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Configuración de imágenes
  images: {
    domains: ["res.cloudinary.com"], // ✅ Permite imágenes desde Cloudinary
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },
  // Añadir reescrituras para redirigir las solicitudes API al backend y manejar subdominios
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'https://cartaenlinea-67dbc62791d3.herokuapp.com/api/:path*',
      },
      {
        source: '/api/public/:subdomain',
        destination: 'https://cartaenlinea-67dbc62791d3.herokuapp.com/api/public/:subdomain',
      },
    ];
  },
  // Configuración de headers para CORS y subdominios
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*'
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET,HEAD,PUT,PATCH,POST,DELETE'
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type,Authorization'
          }
        ]
      }
    ];
  }
}

module.exports = nextConfig;