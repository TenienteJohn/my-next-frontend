// src/app/api/commerces/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://cartaenlinea-67dbc62791d3.herokuapp.com';
    const url = `${apiBaseUrl}/api/commerces/${id}`;

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

    console.log(`Proxy /commerces/${id} (PUT): Enviando solicitud al backend`, {
      id,
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

    console.log(`Proxy /commerces/${id} (PUT): Respuesta del backend recibida`, {
      status: response.status,
      ok: response.ok
    });

    // Devolver los datos al cliente
    return NextResponse.json(data);
  } catch (error: any) {
    console.error(`Proxy /commerces/${id} (PUT): Error en la solicitud`, error);

    return NextResponse.json(
      { error: `Error en el proxy: ${error.message}` },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://cartaenlinea-67dbc62791d3.herokuapp.com';
    const url = `${apiBaseUrl}/api/commerces/${id}`;

    // Obtener el token de autorización
    const token = request.headers.get('authorization');

    if (!token) {
      return NextResponse.json(
        { error: 'No se proporcionó token de autenticación' },
        { status: 401 }
      );
    }

    console.log(`Proxy /commerces/${id} (DELETE): Eliminando comercio con ID ${id}`);

    // Realizar la solicitud al backend
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Authorization': token,
        'Content-Type': 'application/json',
      },
    });

    console.log(`Proxy /commerces/${id} (DELETE): Respuesta recibida`, {
      status: response.status,
      statusText: response.statusText
    });

    // Si hay un cuerpo en la respuesta, obtenerlo
    let data;
    try {
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = { message: 'Operación completada' };
      }
    } catch (parseError) {
      console.error(`Proxy /commerces/${id} (DELETE): Error al parsear respuesta`, parseError);
      data = { message: response.ok ? 'Comercio eliminado correctamente' : 'Error al eliminar comercio' };
    }

    // Si la respuesta no es exitosa, devolver el error
    if (!response.ok) {
      return NextResponse.json(
        data.error ? data : { error: `Error del servidor: ${response.status}` },
        { status: response.status }
      );
    }

    // Devolver la respuesta al cliente
    return NextResponse.json(data, { status: response.status });
  } catch (error: any) {
    console.error(`Proxy /commerces/${id} (DELETE): Error en la solicitud`, error);
    return NextResponse.json(
      { error: `Error en el proxy: ${error.message}` },
      { status: 500 }
    );
  }
}