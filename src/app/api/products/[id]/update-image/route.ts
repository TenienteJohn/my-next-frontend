// src/app/api/products/[id]/update-image/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://cartaenlinea-67dbc62791d3.herokuapp.com';
    const url = `${apiBaseUrl}/api/products/${params.id}/update-image`;

    // Obtener el token de autorización de la solicitud
    const token = request.headers.get('authorization');

    if (!token) {
      return NextResponse.json(
        { error: 'No se proporcionó token de autenticación' },
        { status: 401 }
      );
    }

    // Obtener el formData de la solicitud
    const formData = await request.formData();

    // Verificar que hay un archivo en el FormData
    const imageFile = formData.get('image');
    if (!imageFile || !(imageFile instanceof File)) {
      return NextResponse.json(
        { error: 'No se proporcionó una imagen válida' },
        { status: 400 }
      );
    }

    console.log(`Proxy /products/${params.id}/update-image (PUT): Enviando solicitud al backend`, {
      id: params.id,
      hasFormData: !!formData,
      fileName: imageFile.name,
      fileSize: imageFile.size,
      fileType: imageFile.type
    });

    // Realizar la solicitud al backend
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Authorization': token,
        // No incluir Content-Type ya que fetch lo configurará automáticamente para FormData
      },
      body: formData,
    });

    // Manejar respuesta sin detener la ejecución en caso de error
    try {
      const responseText = await response.text();
      let data;

      try {
        data = JSON.parse(responseText);
      } catch (e) {
        console.error("Error al parsear la respuesta JSON:", e);

        // Si la respuesta no es JSON pero el status es OK, crear un objeto de respuesta
        if (response.ok) {
          data = {
            message: 'Imagen actualizada exitosamente',
            image_url: `/images/products/${params.id}.jpg`  // URL de fallback genérica
          };
        } else {
          throw new Error(`Error del servidor: ${response.status} ${response.statusText}`);
        }
      }

      console.log(`Proxy /products/${params.id}/update-image (PUT): Respuesta del backend recibida`, {
        status: response.status,
        ok: response.ok,
        data
      });

      // Si la respuesta no fue exitosa pero pudimos parsear los datos, devolver el error
      if (!response.ok) {
        return NextResponse.json(
          data || { error: `Error del servidor: ${response.status} ${response.statusText}` },
          { status: response.status }
        );
      }

      // Devolver los datos al cliente
      return NextResponse.json(data);
    } catch (error) {
      console.error(`Error al procesar la respuesta: ${error}`);

      // Si hubo un error pero la respuesta fue exitosa, devolver un mensaje genérico de éxito
      if (response.ok) {
        return NextResponse.json({
          message: 'Imagen actualizada exitosamente',
          image_url: `/images/products/${params.id}.jpg`  // URL de fallback genérica
        });
      }

      // Si la respuesta no fue exitosa, devolver un error
      return NextResponse.json(
        { error: `Error del servidor: ${response.status} ${response.statusText}` },
        { status: response.status }
      );
    }
  } catch (error: any) {
    console.error(`Proxy /products/${params.id}/update-image (PUT): Error en la solicitud`, error);

    return NextResponse.json(
      { error: `Error en el proxy: ${error.message}` },
      { status: 500 }
    );
  }
}