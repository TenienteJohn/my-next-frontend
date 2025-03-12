/// src/app/api/public/[subdomain]/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { subdomain: string } }
) {
  try {
    const subdomain = params.subdomain;

    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://cartaenlinea-67dbc62791d3.herokuapp.com';
    const url = `${apiBaseUrl}/api/public/${subdomain}`;

    console.log("Proxy API - Public: Llamando al backend", {
      url,
      subdomain
    });

    // Realizar la solicitud al backend
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store'
    });

    // Imprimir información de respuesta
    console.log("Proxy API - Public: Respuesta recibida", {
      status: response.status,
      ok: response.ok
    });

    // Si la respuesta no es exitosa, devolver el error
    if (!response.ok) {
      const errorText = await response.text();
      let errorData;

      try {
        errorData = JSON.parse(errorText);
      } catch (_parseError) {
        errorData = { error: `Error del servidor: ${response.status}` };
      }

      return NextResponse.json(errorData, { status: response.status });
    }

    // Obtener los datos de la respuesta
    const data = await response.json();

    // Devolver los datos al cliente
    return NextResponse.json(data);
  } catch (error: unknown) {
    console.error("Proxy API - Public: Error en la solicitud", error);

    const errorMessage = error instanceof Error
      ? error.message
      : 'Error desconocido';

    return NextResponse.json(
      { error: `Error en el proxy: ${errorMessage}` },
      { status: 500 }
    );
  }
}