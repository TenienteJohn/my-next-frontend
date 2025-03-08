// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Obtener el hostname (por ejemplo: burguer.cartaenlinea.com)
  const hostname = request.headers.get('host') || '';
  console.log(`[Middleware] Hostname: ${hostname}`);

  // Obtener el subdominio
  const subdomain = getSubdomain(hostname);
  console.log(`[Middleware] Subdominio detectado: ${subdomain || 'ninguno'}`);

  // La URL actual
  const url = request.nextUrl.clone();
  const { pathname } = url;
  console.log(`[Middleware] Pathname: ${pathname}`);

  // Lista de rutas públicas que siempre deben estar accesibles
  const publicRoutes = ['/login', '/register', '/forgot-password', '/reset-password', '/api'];

  // Comprobar si la ruta actual es una ruta pública
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));
  console.log(`[Middleware] ¿Es ruta pública?: ${isPublicRoute}`);

  // Si es el dominio principal sin subdominio (cartaenlinea.com), mostrar la página principal
  if (!subdomain) {
    console.log('[Middleware] Sin subdominio, continuar normalmente');
    return NextResponse.next();
  }

  // Si es una ruta pública, permitir el acceso directo sin reescritura
  if (isPublicRoute) {
    console.log('[Middleware] Ruta pública, continuar sin reescribir');
    return NextResponse.next();
  }

  // Si ya estamos en rutas de tenant, no reescribir
  if (pathname.startsWith('/tenant')) {
    console.log('[Middleware] Ruta de tenant, continuar sin reescribir');
    return NextResponse.next();
  }

  // Si es /config o alguna subruta de config, ir a la página de administración del tenant
  if (pathname.startsWith('/config')) {
    url.pathname = `/tenant/config${pathname.replace('/config', '')}`;
    console.log(`[Middleware] Reescribiendo a: ${url.pathname}`);
    return NextResponse.rewrite(url);
  }

  // Para la landing page pública del tenant (ej. burguer.cartaenlinea.com/)
  url.pathname = `/tenant${pathname}`;
  console.log(`[Middleware] Reescribiendo a: ${url.pathname}`);
  return NextResponse.rewrite(url);
}

// Función para extraer el subdominio
function getSubdomain(hostname: string): string | null {
  // En desarrollo: test.localhost:3000 -> test
  // En producción: burguer.cartaenlinea.com -> burguer

  // Manejo específico para localhost en desarrollo
  if (hostname.includes('localhost')) {
    const parts = hostname.split('.');
    if (parts.length > 1 && parts[0] !== 'www' && parts[0] !== 'localhost') {
      return parts[0];
    }
    return null;
  }

  // Para dominios en producción (Vercel)
  const domainParts = hostname.split('.');

  // Si el formato es [subdominio].[dominio].[tld]
  if (domainParts.length >= 3 && domainParts[0] !== 'www') {
    return domainParts[0];
  }

  return null;
}

// Configurar en qué rutas se ejecuta el middleware
export const config = {
  matcher: [
    '/((?!api|_next|public|_vercel|.*\\..*).*)',
  ],
};