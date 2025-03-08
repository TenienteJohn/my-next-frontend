// src/app/api/products/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://cartaenlinea-67dbc62791d3.herokuapp.com';
    const url = `${apiBaseUrl}/api/products`;

    // Obtener el token de autorización de la solicitud
    const token = request.headers.get('authorization');

    if (!token) {
      return NextResponse.json(
        { error: 'No se proporcionó token de autenticación' },
        { status: 401 }
      );
    }

    console.log('Proxy /products: Enviando solicitud al backend');

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
    let data;
    try {
      data = await response.json();

      // Si no es un array, devolver un array vacío
      if (!Array.isArray(data)) {
        console.log('Respuesta no es un array, devolviendo array vacío:', data);
        data = [];
      }

      // Asegurarnos de que el precio sea un número
      data = data.map(product => ({
        ...product,
        price: typeof product.price === 'number' ? product.price : Number(product.price) || 0
      }));
    } catch (e) {
      console.error('Error al parsear respuesta JSON:', e);
      data = [];
    }

    console.log('Proxy /products: Respuesta del backend recibida', {
      status: response.status,
      ok: response.ok,
      productsCount: data.length
    });

    // Devolver los datos al cliente
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Proxy /products: Error en la solicitud', error);

    // Devolver un array vacío en caso de error para evitar errores en el cliente
    return NextResponse.json([]);
  }
}

export async function POST(request: NextRequest) {
  try {
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://cartaenlinea-67dbc62791d3.herokuapp.com';
    const url = `${apiBaseUrl}/api/products`;

    // Obtener el token de autorización de la solicitud
    const token = request.headers.get('authorization');

    if (!token) {
      return NextResponse.json(
        { error: 'No se proporcionó token de autenticación' },
        { status: 401 }
      );
    }

    // Obtener el cuerpo de la solicitud y validarlo
    let body;
    try {
      body = await request.json();
      console.log("Cuerpo de la solicitud:", body);

      // Validaciones básicas
      if (!body.name) {
        return NextResponse.json({ error: 'El nombre del producto es obligatorio' }, { status: 400 });
      }

      if (body.price === undefined) {
        return NextResponse.json({ error: 'El precio del producto es obligatorio' }, { status: 400 });
      }

      // Convertir price a número
      body.price = Number(body.price);
      if (isNaN(body.price)) {
        return NextResponse.json({ error: 'El precio debe ser un número válido' }, { status: 400 });
      }

      if (!body.category_id) {
        return NextResponse.json({ error: 'La categoría del producto es obligatoria' }, { status: 400 });
      }
    } catch (error) {
      console.error("Error al procesar el cuerpo de la solicitud:", error);
      return NextResponse.json(
        { error: 'Error al procesar el cuerpo de la solicitud' },
        { status: 400 }
      );
    }

    console.log('Proxy /products (POST): Enviando solicitud al backend', {
      url,
      body,
      tokenPresente: !!token
    });

    // Realizar la solicitud al backend con manejo mejorado de errores
    let response;
    try {
      response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      console.log("Respuesta del backend:", {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      });
    } catch (fetchError) {
      console.error("Error al hacer fetch:", fetchError);
      return NextResponse.json(
        { error: `Error de conexión: ${fetchError.message}` },
        { status: 500 }
      );
    }

    // Manejar respuesta del backend
    try {
      // Intentar obtener el cuerpo de la respuesta como texto
      const responseText = await response.text();
      console.log("Respuesta del backend como texto:", responseText);

      // Intentar parsear como JSON si es posible
      let data;
      try {
        data = JSON.parse(responseText);

        // Si hay un producto en la respuesta, asegurar que el precio sea un número
        if (data.product) {
          data.product.price = typeof data.product.price === 'number'
            ? data.product.price
            : Number(data.product.price) || 0;
        }
      } catch (jsonError) {
        console.error("La respuesta no es JSON válido:", jsonError);
        // Si no es JSON válido, devolver el texto como está
        return NextResponse.json(
          { error: 'Respuesta no válida del servidor', responseText },
          { status: response.status }
        );
      }

      // Si no fue exitoso, devolver el error
      if (!response.ok) {
        return NextResponse.json(
          data || { error: `Error del servidor: ${response.status} ${response.statusText}` },
          { status: response.status }
        );
      }

      // Devolver los datos al cliente
      return NextResponse.json(data);
    } catch (responseError) {
      console.error("Error al procesar la respuesta:", responseError);
      return NextResponse.json(
        { error: `Error al procesar la respuesta: ${responseError.message}` },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Proxy /products (POST): Error general en la solicitud', error);
    return NextResponse.json(
      { error: `Error en el proxy: ${error.message}` },
      { status: 500 }
    );
  }
}
