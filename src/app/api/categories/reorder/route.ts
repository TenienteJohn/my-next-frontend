// src/app/api/categories/reorder/route.ts
import { NextRequest, NextResponse } from 'next/server';

interface CategoryOrder {
  id: number;
  position: number;
}

export async function POST(request: NextRequest) {
  try {
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://cartaenlinea-67dbc62791d3.herokuapp.com';
    const url = `${apiBaseUrl}/api/categories/reorder`;

    // Obtener el token de autorización de la solicitud
    const token = request.headers.get('authorization');

    if (!token) {
      return NextResponse.json(
        { error: 'No se proporcionó token de autenticación' },
        { status: 401 }
      );
    }

    // Obtener el cuerpo de la solicitud
    const body = await request.json();

    console.log('Proxy /categories/reorder (POST): Enviando solicitud al backend', {
      categoriesCount: body.categories?.length
    });

    // Realizar la solicitud al backend
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': token,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    // Si la respuesta no es exitosa, devolver el error
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Error del servidor' }));
      return NextResponse.json(errorData, { status: response.status });
    }

    // Obtener los datos de la respuesta
    const data = await response.json();

    console.log('Proxy /categories/reorder (POST): Respuesta del backend recibida', {
      status: response.status,
      ok: response.ok
    });

    // Devolver los datos al cliente
    return NextResponse.json(data);
  } catch (error: unknown) {
    console.error('Proxy /categories/reorder (POST): Error en la solicitud', error);

    const errorMessage = error instanceof Error
      ? error.message
      : 'Error desconocido';

    return NextResponse.json(
      { error: `Error en el proxy: ${errorMessage}` },
      { status: 500 }
    );
  }
}