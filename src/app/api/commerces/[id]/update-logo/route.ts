// src/app/api/commerces/[id]/update-banner/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://cartaenlinea-67dbc62791d3.herokuapp.com';
    const url = `${apiBaseUrl}/api/commerces/${id}/update-banner`;

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
    const bannerFile = formData.get('banner');
    if (!bannerFile || !(bannerFile instanceof File)) {
      return NextResponse.json(
        { error: 'No se proporcionó una imagen válida' },
        { status: 400 }
      );
    }

    console.log(`Proxy /commerces/${id}/update-banner (PUT): Enviando solicitud al backend`, {
      id,
      hasFormData: !!formData,
      fileName: bannerFile.name,
      fileSize: bannerFile.size,
      fileType: bannerFile.type
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
      } catch (_parseError) {
        console.error("Error al parsear la respuesta JSON:", _parseError);

        // Si la respuesta no es JSON pero el status es OK, crear un objeto de respuesta
        if (response.ok) {
          data = {
            message: 'Banner actualizado exitosamente',
            banner_url: `/images/commerces/${id}_banner.jpg`  // URL de fallback genérica
          };
        } else {
          throw new Error(`Error del servidor: ${response.status} ${response.statusText}`);
        }
      }

      console.log(`Proxy /commerces/${id}/update-banner (PUT): Respuesta del backend recibida`, {
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
    } catch (responseError: unknown) {
      console.error(`Error al procesar la respuesta: ${responseError instanceof Error ? responseError.message : 'Error desconocido'}`);

      // Si hubo un error pero la respuesta fue exitosa, devolver un mensaje genérico de éxito
      if (response.ok) {
        return NextResponse.json({
          message: 'Banner actualizado exitosamente',
          banner_url: `/images/commerces/${id}_banner.jpg`  // URL de fallback genérica
        });
      }

      // Si la respuesta no fue exitosa, devolver un error
      return NextResponse.json(
        { error: `Error del servidor: ${response.status} ${response.statusText}` },
        { status: response.status }
      );
    }
  } catch (error: unknown) {
    const { id } = params;
    console.error(`Proxy /commerces/${id}/update-banner (PUT): Error en la solicitud`, error);

    const errorMessage = error instanceof Error
      ? error.message
      : 'Error desconocido';

    return NextResponse.json(
      { error: `Error en el proxy: ${errorMessage}` },
      { status: 500 }
    );
  }
}