// src/components/ui/Tag.tsx
import React from 'react';

interface TagProps {
  name: string;
  color: string;
  textColor?: string;
  discount?: number;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const Tag: React.FC<TagProps> = ({
  name,
  color,
  textColor = '#FFFFFF',
  discount,
  className = '',
  size = 'md'
}) => {
  // Tamaños predefinidos
  const sizeClasses = {
    sm: 'text-xs px-1.5 py-0.5',
    md: 'text-sm px-2 py-1',
    lg: 'text-base px-3 py-1.5'
  };

  // Si hay descuento, mostrar el porcentaje
  const displayText = discount ? `${discount}% OFF` : name;

  return (
    <div
      className={`inline-flex items-center rounded-md font-medium ${sizeClasses[size]} ${className}`}
      style={{
        backgroundColor: color,
        color: textColor
      }}
    >
      {displayText}
    </div>
  );
};