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
  // Añadir reescrituras para redirigir las solicitudes API al backend
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'https://cartaenlinea-67dbc62791d3.herokuapp.com/api/:path*',
      },
    ];
  },
}

module.exports = nextConfig;