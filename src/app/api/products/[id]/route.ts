// src/app/api/products/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';

// Función para manejar solicitudes PUT a /api/products/:id
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://cartaenlinea-67dbc62791d3.herokuapp.com';
    const url = `${apiBaseUrl}/api/products/${params.id}`;

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

      // Validaciones básicas
      if (!body.name) {
        return NextResponse.json({ error: 'El nombre del producto es obligatorio' }, { status: 400 });
      }

      // Convertir price a número
      if (body.price !== undefined) {
        body.price = Number(body.price);
        if (isNaN(body.price)) {
          return NextResponse.json({ error: 'El precio debe ser un número válido' }, { status: 400 });
        }
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

    console.log(`Proxy /products/${params.id} (PUT): Enviando solicitud al backend`, {
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
      try {
        const errorData = await response.json();
        return NextResponse.json(errorData, { status: response.status });
      } catch (e) {
        return NextResponse.json(
          { error: `Error del servidor: ${response.status} ${response.statusText}` },
          { status: response.status }
        );
      }
    }

    // Obtener los datos de la respuesta
    try {
      const responseText = await response.text();
      let data;

      try {
        data = JSON.parse(responseText);

        // Asegurar que el precio sea un número
        if (data.product) {
          data.product.price = typeof data.product.price === 'number'
            ? data.product.price
            : Number(data.product.price) || 0;
        }
      } catch (e) {
        console.error("Error al parsear respuesta JSON:", e);
        data = { message: 'Producto actualizado exitosamente' };
      }

      console.log(`Proxy /products/${params.id} (PUT): Respuesta del backend recibida`, {
        status: response.status,
        ok: response.ok
      });

      // Devolver los datos al cliente
      return NextResponse.json(data);
    } catch (error) {
      console.error("Error al procesar la respuesta:", error);
      return NextResponse.json(
        { error: 'Error al procesar la respuesta del servidor' },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error(`Proxy /products/${params.id} (PUT): Error en la solicitud`, error);

    return NextResponse.json(
      { error: `Error en el proxy: ${error.message}` },
      { status: 500 }
    );
  }
}

// Función para manejar solicitudes DELETE a /api/products/:id
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://cartaenlinea-67dbc62791d3.herokuapp.com';
    const url = `${apiBaseUrl}/api/products/${params.id}`;

    // Obtener el token de autorización de la solicitud
    const token = request.headers.get('authorization');

    if (!token) {
      return NextResponse.json(
        { error: 'No se proporcionó token de autenticación' },
        { status: 401 }
      );
    }

    console.log(`Proxy /products/${params.id} (DELETE): Enviando solicitud al backend`, {
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
      try {
        const errorData = await response.json();
        return NextResponse.json(errorData, { status: response.status });
      } catch (e) {
        return NextResponse.json(
          { error: `Error del servidor: ${response.status} ${response.statusText}` },
          { status: response.status }
        );
      }
    }

    try {
      // Obtener los datos de la respuesta
      const data = await response.json();

      console.log(`Proxy /products/${params.id} (DELETE): Respuesta del backend recibida`, {
        status: response.status,
        ok: response.ok
      });

      // Devolver los datos al cliente
      return NextResponse.json(data);
    } catch (e) {
      // Si no se puede parsear como JSON, devolver un mensaje de éxito genérico
      return NextResponse.json({ message: 'Producto eliminado exitosamente' });
    }
  } catch (error: any) {
    console.error(`Proxy /products/${params.id} (DELETE): Error en la solicitud`, error);

    return NextResponse.json(
      { error: `Error en el proxy: ${error.message}` },
      { status: 500 }
    );
  }
}

// Función para manejar solicitudes GET a /api/products/:id
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://cartaenlinea-67dbc62791d3.herokuapp.com';
    const url = `${apiBaseUrl}/api/products/${params.id}`;

    // Obtener el token de autorización de la solicitud
    const token = request.headers.get('authorization');

    if (!token) {
      return NextResponse.json(
        { error: 'No se proporcionó token de autenticación' },
        { status: 401 }
      );
    }

    console.log(`Proxy /products/${params.id} (GET): Enviando solicitud al backend`, {
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
      try {
        const errorData = await response.json();
        return NextResponse.json(errorData, { status: response.status });
      } catch (e) {
        return NextResponse.json(
          { error: `Error del servidor: ${response.status} ${response.statusText}` },
          { status: response.status }
        );
      }
    }

    // Obtener los datos de la respuesta
    try {
      const data = await response.json();

      // Asegurar que el precio sea un número
      if (data) {
        data.price = typeof data.price === 'number'
          ? data.price
          : Number(data.price) || 0;
      }

      console.log(`Proxy /products/${params.id} (GET): Respuesta del backend recibida`, {
        status: response.status,
        ok: response.ok
      });

      // Devolver los datos al cliente
      return NextResponse.json(data);
    } catch (e) {
      console.error("Error al parsear la respuesta:", e);
      return NextResponse.json(
        { error: 'Error al procesar la respuesta del servidor' },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error(`Proxy /products/${params.id} (GET): Error en la solicitud`, error);

    return NextResponse.json(
      { error: `Error en el proxy: ${error.message}` },
      { status: 500 }
    );
  }
}