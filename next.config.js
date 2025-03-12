/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // Ignora errores de TypeScript durante el build
    ignoreBuildErrors: true,
  },
  eslint: {
    // Ignora errores de ESLint durante el build
    ignoreDuringBuilds: true,
  },
}

module.exports = nextConfig