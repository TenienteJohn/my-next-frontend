// src/components/config/TagsManagerWrapper.tsx
'use client';

import React from 'react';
import TagsManager from '@/components/admin/TagsManager';
import ConfigLayout from '@/components/layouts/ConfigLayout'; // Ajusta según tu estructura

export default function TagsManagerWrapper() {
  // Si tienes un layout para la sección de configuración, úsalo
  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">Gestión de Etiquetas</h1>
      <TagsManager />
    </div>
  );
}