// src/app/api/auth/login/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://cartaenlinea-67dbc62791d3.herokuapp.com';
    const url = `${apiBaseUrl}/api/auth/login`;

    // Obtener el cuerpo de la solicitud
    const body = await request.json();

    console.log('Proxy auth/login: Enviando solicitud al backend', {
      url,
      method: 'POST',
      body: { email: body.email, password: '***' } // Ocultar contraseña en logs
    });

    // Realizar la solicitud al backend
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    // Obtener los datos de la respuesta
    let data;
    try {
      data = await response.json();
    } catch (e) {
      console.error('Error al parsear la respuesta JSON:', e);
      return NextResponse.json(
        { error: 'Error al procesar la respuesta del servidor' },
        { status: 500 }
      );
    }

    console.log('Proxy auth/login: Respuesta del backend recibida', {
      status: response.status,
      ok: response.ok,
      hasToken: !!data.token,
      role: data.role,
      commerce: data.commerce ? {
        id: data.commerce.id,
        subdomain: data.commerce.subdomain
      } : 'No hay datos de comercio'
    });

    // Devolver los datos al cliente
    return NextResponse.json(data, {
      status: response.status,
    });
  } catch (error: any) {
    console.error('Proxy auth/login: Error en la solicitud', error);

    return NextResponse.json(
      { error: `Error en el proxy: ${error.message}` },
      { status: 500 }
    );
  }
}