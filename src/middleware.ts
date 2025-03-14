// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Si es una solicitud OPTIONS a la API, responder con los headers CORS adecuados
  const { pathname } = request.nextUrl;
  if (request.method === 'OPTIONS' && pathname.startsWith('/api/')) {
    console.log('[Middleware] Interceptando solicitud OPTIONS para API:', pathname);
    return new NextResponse(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
        'Access-Control-Max-Age': '86400', // 24 horas
      },
    });
  }

  // Obtener el hostname (por ejemplo: burguer.menunube.online)
  const hostname = request.headers.get('host') || '';
  console.log(`[Middleware] Hostname: ${hostname}`);

  // Comprobar si es el dominio principal de Vercel
  const isVercelDeployment = hostname.includes('vercel.app');
  if (isVercelDeployment) {
    console.log('[Middleware] Dominio Vercel detectado, manejando como dominio principal');

    // Si es una ruta de admin, permitir el acceso
    if (pathname.startsWith('/admin')) {
      console.log('[Middleware] Ruta de admin en Vercel, continuar normalmente');
      return NextResponse.next();
    }

    // Si no es login y no es admin, redirigir a login
    if (!pathname.startsWith('/login') && !pathname.startsWith('/api')) {
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      console.log(`[Middleware] Redirigiendo a login en Vercel: ${url.pathname}`);
      return NextResponse.redirect(url);
    }

    return NextResponse.next();
  }

  // Obtener el subdominio para otros dominios
  const subdomain = getSubdomain(hostname);
  console.log(`[Middleware] Subdominio detectado: ${subdomain || 'ninguno'}`);

  // La URL actual
  const url = request.nextUrl.clone();
  console.log(`[Middleware] Pathname: ${pathname}`);

  // Lista de rutas públicas que siempre deben estar accesibles
  const publicRoutes = ['/login', '/register', '/forgot-password', '/reset-password', '/api'];

  // Comprobar si la ruta actual es una ruta pública
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));
  console.log(`[Middleware] ¿Es ruta pública?: ${isPublicRoute}`);

  // Si es el dominio principal sin subdominio, mostrar la página principal
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

  // Para la landing page pública del tenant (ej. burguer.menunube.online/)
  url.pathname = `/tenant${pathname}`;
  console.log(`[Middleware] Reescribiendo a: ${url.pathname}`);
  return NextResponse.rewrite(url);
}

// Función para extraer el subdominio
function getSubdomain(hostname: string): string | null {
  // Manejo para localhost en desarrollo
  if (hostname.includes('localhost')) {
    const parts = hostname.split('.');
    if (parts.length > 1 && parts[0] !== 'www' && parts[0] !== 'localhost') {
      return parts[0];
    }
    return null;
  }

  // Manejo para menunube.online y otros dominios en producción
  const domainParts = hostname.split('.');

  // Si el formato es [subdominio].menunube.online
  if (domainParts.length >= 3 &&
      (domainParts[domainParts.length - 2] === 'menunube' &&
       domainParts[domainParts.length - 1] === 'online') &&
      domainParts[0] !== 'www') {
    return domainParts[0];
  }

  // Mantener lógica para otros dominios como cartaenlinea.com
  if (domainParts.length >= 3 && domainParts[0] !== 'www') {
    return domainParts[0];
  }

  return null;
}

// Actualizar la configuración para que el middleware también se ejecute en rutas de API
export const config = {
  matcher: [
    '/((?!_next|public|_vercel|.*\\..*).*)',
  ],
};