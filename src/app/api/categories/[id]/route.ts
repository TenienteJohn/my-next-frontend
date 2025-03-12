// src/app/api/categories/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';

// Función para manejar solicitudes PUT a /api/categories/:id
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://cartaenlinea-67dbc62791d3.herokuapp.com';
    const url = `${apiBaseUrl}/api/categories/${params.id}`;

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

    console.log(`Proxy /categories/${params.id} (PUT): Enviando solicitud al backend`, {
      id: params.id,
      body
    });

    // Realizar la solicitud al backend
    const response = await fetch(url, {
      method: 'PUT',
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

    console.log(`Proxy /categories/${params.id} (PUT): Respuesta del backend recibida`, {
      status: response.status,
      ok: response.ok
    });

    // Devolver los datos al cliente
    return NextResponse.json(data);
  } catch (error: unknown) {
    console.error(`Proxy /categories/${params.id} (PUT): Error en la solicitud`, error);

    const errorMessage = error instanceof Error
      ? error.message
      : 'Error desconocido';

    return NextResponse.json(
      { error: `Error en el proxy: ${errorMessage}` },
      { status: 500 }
    );
  }
}

// Función para manejar solicitudes DELETE a /api/categories/:id
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://cartaenlinea-67dbc62791d3.herokuapp.com';
    const url = `${apiBaseUrl}/api/categories/${params.id}`;

    // Obtener el token de autorización de la solicitud
    const token = request.headers.get('authorization');

    if (!token) {
      return NextResponse.json(
        { error: 'No se proporcionó token de autenticación' },
        { status: 401 }
      );
    }

    console.log(`Proxy /categories/${params.id} (DELETE): Enviando solicitud al backend`, {
      id: params.id
    });

    // Realizar la solicitud al backend
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Authorization': token,
      },
    });

    // Si la respuesta no es exitosa, devolver el error
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Error del servidor' }));
      return NextResponse.json(errorData, { status: response.status });
    }

    // Obtener los datos de la respuesta
    const data = await response.json();

    console.log(`Proxy /categories/${params.id} (DELETE): Respuesta del backend recibida`, {
      status: response.status,
      ok: response.ok
    });

    // Devolver los datos al cliente
    return NextResponse.json(data);
  } catch (error: unknown) {
    console.error(`Proxy /categories/${params.id} (DELETE): Error en la solicitud`, error);

    const errorMessage = error instanceof Error
      ? error.message
      : 'Error desconocido';

    return NextResponse.json(
      { error: `Error en el proxy: ${errorMessage}` },
      { status: 500 }
    );
  }
}

// Función para manejar solicitudes GET a /api/categories/:id
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://cartaenlinea-67dbc62791d3.herokuapp.com';
    const url = `${apiBaseUrl}/api/categories/${params.id}`;

    // Obtener el token de autorización de la solicitud
    const token = request.headers.get('authorization');

    if (!token) {
      return NextResponse.json(
        { error: 'No se proporcionó token de autenticación' },
        { status: 401 }
      );
    }

    console.log(`Proxy /categories/${params.id} (GET): Enviando solicitud al backend`, {
      id: params.id
    });

    // Realizar la solicitud al backend
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': token,
      },
    });

    // Si la respuesta no es exitosa, devolver el error
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Error del servidor' }));
      return NextResponse.json(errorData, { status: response.status });
    }

    // Obtener los datos de la respuesta
    const data = await response.json();

    console.log(`Proxy /categories/${params.id} (GET): Respuesta del backend recibida`, {
      status: response.status,
      ok: response.ok
    });

    // Devolver los datos al cliente
    return NextResponse.json(data);
  } catch (error: unknown) {
    console.error(`Proxy /categories/${params.id} (GET): Error en la solicitud`, error);

    const errorMessage = error instanceof Error
      ? error.message
      : 'Error desconocido';

    return NextResponse.json(
      { error: `Error en el proxy: ${errorMessage}` },
      { status: 500 }
    );
  }
}