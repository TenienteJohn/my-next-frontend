// src/components/ui/Tag.tsx
import React from 'react';
import { Lightbulb } from 'lucide-react';

interface TagProps {
  name: string;
  color: string;
  textColor?: string;
  discount?: number;
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  isRecommended?: boolean;
}

export const Tag: React.FC<TagProps> = ({
  name,
  color,
  textColor = '#FFFFFF',
  discount,
  className = '',
  size = 'sm',
  isRecommended = false,
}) => {
  // Clases de tamaño definidas con Tailwind
  const sizeClasses = {
    xs: 'text-xs px-2 py-0.5',
    sm: 'text-sm px-3 py-1',
    md: 'text-base px-4 py-2',
    lg: 'text-lg px-5 py-2.5',
  };

  // Si hay descuento, se muestra ese valor; de lo contrario, se muestra el nombre
  const displayText = discount ? `${discount}% OFF` : name;

  return (
    <span
      className={`inline-flex items-center rounded-full font-semibold shadow-sm border border-transparent ${sizeClasses[size]} ${className}`}
      style={{
        backgroundImage: `linear-gradient(135deg, ${color} 0%, ${color} 100%)`,
        color: textColor,
      }}
    >
      {isRecommended && (
        <Lightbulb
          size={size === 'xs' ? 12 : size === 'sm' ? 14 : size === 'md' ? 16 : 18}
          className="mr-1"
        />
      )}
      {displayText}
    </span>
  );
};
