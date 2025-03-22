// src/components/products/ProductCard.tsx
import React from 'react';
import Image from 'next/image';
import { Tag } from '../ui/Tag';

interface ProductTag {
  id: number;
  name: string;
  color: string;
  textColor?: string;
  discount?: number;
  isRecommended?: boolean;
  priority?: number;
}

interface ProductProps {
  id: number;
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
  onClick: () => void;
  tags?: ProductTag[];
}

const ProductCard: React.FC<ProductProps> = ({
  id,
  name,
  description,
  price,
  imageUrl,
  onClick,
  tags = []
}) => {
  // Formatear el precio con separadores de miles
  const formattedPrice = price.toLocaleString('es-CL', {
    style: 'currency',
    currency: 'CLP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).replace('CLP', '$');

  // Ordenar etiquetas por prioridad
  const sortedTags = [...tags].sort((a, b) => (b.priority || 0) - (a.priority || 0));

  // Separar la etiqueta de descuento, si existe
  const discountTag = sortedTags.find(tag => tag.discount);
  const regularTags = sortedTags.filter(tag => !tag.discount);

  return (
    <div
      className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow cursor-pointer"
      onClick={onClick}
    >
      {/* Imagen del producto con superposición de etiquetas */}
      <div className="relative h-48">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={name}
            fill
            style={{ objectFit: 'cover' }}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}

        {/* Etiquetas en esquina superior derecha */}
        {regularTags.length > 0 && (
          <div className="absolute top-2 right-2 flex flex-col items-end space-y-1">
            {regularTags.slice(0, 3).map(tag => (
              <Tag
                key={tag.id}
                name={tag.name}
                color={tag.color}
                textColor={tag.textColor}
                size="sm"
              />
            ))}
          </div>
        )}

        {/* Etiqueta de descuento (grande) si existe */}
        {discountTag && (
          <div className="absolute top-2 left-2">
            <Tag
              name=""
              color={discountTag.color}
              textColor={discountTag.textColor}
              discount={discountTag.discount}
              size="lg"
            />
          </div>
        )}
      </div>

      {/* Información del producto */}
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-1">{name}</h3>
        {description && (
          <p className="text-gray-600 text-sm mb-2 line-clamp-2">{description}</p>
        )}
        <div className="flex justify-between items-center mt-2">
          <span className="text-lg font-bold text-gray-900">{formattedPrice}</span>

          {/* Etiqueta de "Recomendado" si corresponde */}
          {tags.some(tag => tag.isRecommended) && (
            <span className="px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded-full">
              Recomendado
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;