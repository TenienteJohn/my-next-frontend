// src/app/api/commerces/my-commerce/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://cartaenlinea-67dbc62791d3.herokuapp.com';
    const url = `${apiBaseUrl}/api/commerces/my-commerce`;

    // Obtener el token de autorización de la solicitud
    const token = request.headers.get('authorization');

    console.log('Proxy /commerces/my-commerce: Headers recibidos:', {
      authorization: token ? token.substring(0, 15) + '...' : 'No token', // Por seguridad no mostrar el token completo
      contentType: request.headers.get('content-type'),
    });

    if (!token) {
      console.log('Proxy /commerces/my-commerce: No se proporcionó token de autenticación');
      return NextResponse.json(
        { error: 'No se proporcionó token de autenticación' },
        { status: 401 }
      );
    }

    console.log(`Proxy /commerces/my-commerce: Enviando solicitud a ${url}`);

    // Realizar la solicitud al backend
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': token,
        'Content-Type': 'application/json',
      },
    });

    console.log('Proxy /commerces/my-commerce: Respuesta recibida', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
    });

    // Si la respuesta no es exitosa, devolver el error
    if (!response.ok) {
      let errorMessage = 'Error del servidor';
      try {
        const errorText = await response.text();
        console.error('Proxy /commerces/my-commerce: Error de respuesta', {
          status: response.status,
          text: errorText,
        });

        try {
          const errorData = JSON.parse(errorText);
          return NextResponse.json(errorData, { status: response.status });
        } catch {
          errorMessage = `Error del servidor: ${response.status} ${response.statusText}`;
        }
      } catch (_textError) {
        console.error('Error al leer el texto de la respuesta:', _textError);
      }

      return NextResponse.json(
        { error: errorMessage },
        { status: response.status }
      );
    }

    // Obtener los datos de la respuesta
    const data = await response.json();

    console.log('Proxy /commerces/my-commerce: Datos recibidos correctamente', {
      datos: {
        id: data.id,
        business_name: data.business_name,
        subdomain: data.subdomain
      }
    });

    // Devolver los datos al cliente
    return NextResponse.json(data);
  } catch (error: unknown) {
    console.error('Proxy /commerces/my-commerce: Error en la solicitud', error);

    const errorMessage = error instanceof Error
      ? error.message
      : 'Error desconocido';

    return NextResponse.json(
      { error: `Error en el proxy: ${errorMessage}` },
      { status: 500 }
    );
  }
}