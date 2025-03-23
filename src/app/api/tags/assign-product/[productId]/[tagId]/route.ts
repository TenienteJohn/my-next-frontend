// src/app/api/tags/assign-product/[productId]/[tagId]/route.ts
import { NextRequest, NextResponse } from 'next/server';

// POST /api/tags/assign-product/:productId/:tagId
export async function POST(
  request: NextRequest,
  { params }: { params: { productId: string, tagId: string } }
) {
  try {
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://cartaenlinea-67dbc62791d3.herokuapp.com';
    const url = `${apiBaseUrl}/api/tags/assign-product/${params.productId}/${params.tagId}`;

    // Obtener el token de autorización
    const token = request.headers.get('authorization');
    if (!token) {
      return NextResponse.json(
        { error: 'No se proporcionó token de autenticación' },
        { status: 401 }
      );
    }

    // Realizar la solicitud al backend
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': token,
        'Content-Type': 'application/json',
      },
      // El body es vacío porque toda la información necesaria va en la URL
      body: JSON.stringify({}),
    });

    // Si la respuesta no es exitosa, devolver el error
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Error del servidor' }));
      return NextResponse.json(errorData, { status: response.status });
    }

    // Obtener los datos de la respuesta
    const data = await response.json();

    // Devolver los datos al cliente
    return NextResponse.json(data);
  } catch (error: unknown) {
    console.error(`Proxy /tags/assign-product/${params.productId}/${params.tagId} (POST): Error en la solicitud`, error);

    const errorMessage = error instanceof Error
      ? error.message
      : 'Error desconocido';

    return NextResponse.json(
      { error: `Error en el proxy: ${errorMessage}` },
      { status: 500 }
    );
  }
}

// DELETE /api/tags/assign-product/:productId/:tagId
export async function DELETE(
  request: NextRequest,
  { params }: { params: { productId: string, tagId: string } }
) {
  try {
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://cartaenlinea-67dbc62791d3.herokuapp.com';
    const url = `${apiBaseUrl}/api/tags/assign-product/${params.productId}/${params.tagId}`;

    // Obtener el token de autorización
    const token = request.headers.get('authorization');
    if (!token) {
      return NextResponse.json(
        { error: 'No se proporcionó token de autenticación' },
        { status: 401 }
      );
    }

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

    // Devolver los datos al cliente
    return NextResponse.json(data);
  } catch (error: unknown) {
    console.error(`Proxy /tags/assign-product/${params.productId}/${params.tagId} (DELETE): Error en la solicitud`, error);

    const errorMessage = error instanceof Error
      ? error.message
      : 'Error desconocido';

    return NextResponse.json(
      { error: `Error en el proxy: ${errorMessage}` },
      { status: 500 }
    );
  }
}