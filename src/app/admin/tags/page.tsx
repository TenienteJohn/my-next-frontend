'use client'; // Elimina esta línea si estás usando Pages Router

import React from 'react';
import TagsManager from '@/components/admin/TagsManager';

export default function TagsPage() {
  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">Gestión de Etiquetas</h1>
      <TagsManager />
    </div>
  );
}