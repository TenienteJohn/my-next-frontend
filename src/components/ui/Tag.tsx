// src/components/ui/Tag.tsx
import React, { useMemo } from 'react';
import { Lightbulb, Star, Clock, TrendingUp, Percent, AlertTriangle } from 'lucide-react';

interface TagProps {
  name: string;
  color: string;
  textColor?: string;
  discount?: number;
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  isRecommended?: boolean;
  // Nuevas propiedades
  variant?: 'solid' | 'subtle' | 'outline' | 'frosted';
  background?: 'auto' | 'light' | 'dark';
  icon?: boolean; // Si debe mostrar icono automáticamente según el nombre/contexto
  disableSelection?: boolean; // Para etiquetas como "Agotado"
  priority?: number; // Para determinar importancia visual
}

export const Tag: React.FC<TagProps> = ({
  name,
  color,
  textColor,
  discount,
  className = '',
  size = 'sm',
  isRecommended = false,
  variant = 'solid', // Sólido por defecto para mantener compatibilidad
  background = 'auto',
  icon = true,
  disableSelection,
  priority,
}) => {
  // Tamaños refinados con mejores proporciones
  const sizeClasses = {
    xs: 'text-[9px] px-1.5 py-0.5 leading-tight',
    sm: 'text-xs px-2 py-0.5 leading-tight',
    md: 'text-sm px-2.5 py-1 leading-snug',
    lg: 'text-base px-3 py-1.5 leading-snug',
  };

  // Ajustar variante basada en el fondo si está en 'auto'
  const effectiveVariant = useMemo(() => {
    if (variant !== 'auto') return variant;
    return background === 'dark' ? 'solid' : 'subtle';
  }, [variant, background]);

  // Determinar si mostrar el icono basado en el nombre de la etiqueta
  const showIcon = useMemo(() => {
    if (!icon) return false;

    // Si ya tiene isRecommended, mostrar el icono de recomendado
    if (isRecommended) return true;

    // Detectar automáticamente basado en palabras clave en el nombre
    const nameLower = name.toLowerCase();
    const isPromo = nameLower.includes('promo') || nameLower.includes('oferta') || nameLower.includes('descuento');
    const isNew = nameLower.includes('nuevo') || nameLower.includes('new');
    const isPopular = nameLower.includes('popular');
    const isFeatured = nameLower.includes('destacado');
    const isRecom = nameLower.includes('recomendado') || nameLower.includes('sugerido') || isRecommended;
    const isSoldOut = nameLower.includes('agotado') || nameLower.includes('sin stock');

    return isPromo || isNew || isPopular || isFeatured || isRecom || isSoldOut;
  }, [icon, name, isRecommended]);

  // Seleccionar el icono apropiado según el nombre
  const TagIcon = useMemo(() => {
    if (!showIcon) return null;

    const nameLower = name.toLowerCase();

    if (nameLower.includes('promo') || nameLower.includes('oferta') || nameLower.includes('descuento') || discount) {
      return Percent;
    }
    if (nameLower.includes('nuevo') || nameLower.includes('new')) {
      return Star;
    }
    if (nameLower.includes('popular')) {
      return TrendingUp;
    }
    if (nameLower.includes('agotado') || nameLower.includes('sin stock') || disableSelection) {
      return AlertTriangle;
    }
    if (nameLower.includes('recomendado') || nameLower.includes('sugerido') || isRecommended) {
      return Lightbulb;
    }
    if (nameLower.includes('próximo') || nameLower.includes('pronto')) {
      return Clock;
    }

    // Por defecto, si es recomendado, usar lightbulb
    return isRecommended ? Lightbulb : null;
  }, [showIcon, name, discount, disableSelection, isRecommended]);

  // Texto a mostrar en la etiqueta
  const displayText = useMemo(() => {
    return discount ? `${discount}% OFF` : name;
  }, [discount, name]);

  // Ajustar tamaño del icono para que sea proporcional
  const iconSize = size === 'xs' ? 9 : size === 'sm' ? 12 : size === 'md' ? 14 : 16;

  // Determinar las clases para el borde redondeado
  const roundedClass = variant === 'solid' ? 'rounded-full' : 'rounded';

  // Función para obtener los estilos de la etiqueta según la variante
  const getTagStyles = () => {
    // Crear un objeto base para estilos
    const styles: React.CSSProperties = {};

    // Si no se proporciona textColor, usar uno apropiado según la variante
    let finalTextColor = textColor;

    switch (effectiveVariant) {
      case 'solid':
        styles.backgroundColor = color;
        if (!finalTextColor) finalTextColor = '#FFFFFF';
        styles.color = finalTextColor;
        styles.backgroundImage = `linear-gradient(135deg, ${color} 0%, ${color} 100%)`;
        return styles;

      case 'outline':
        styles.backgroundColor = 'transparent';
        if (!finalTextColor) finalTextColor = color;
        styles.color = finalTextColor;
        styles.borderWidth = '1px';
        styles.borderStyle = 'solid';
        styles.borderColor = color;
        // Quitar el gradiente para esta variante
        styles.backgroundImage = 'none';
        return styles;

      case 'frosted':
        styles.backgroundColor = `${color}30`; // 30% de opacidad
        if (!finalTextColor) finalTextColor = color;
        styles.color = finalTextColor;
        styles.backdropFilter = 'blur(4px)';
        styles.borderWidth = '1px';
        styles.borderStyle = 'solid';
        styles.borderColor = `${color}40`; // 40% de opacidad
        // Quitar el gradiente para esta variante
        styles.backgroundImage = 'none';
        return styles;

      case 'subtle':
      default:
        styles.backgroundColor = `${color}15`; // 15% de opacidad
        if (!finalTextColor) finalTextColor = color;
        styles.color = finalTextColor;
        styles.borderWidth = '1px';
        styles.borderStyle = 'solid';
        styles.borderColor = `${color}25`; // 25% de opacidad
        // Quitar el gradiente para esta variante
        styles.backgroundImage = 'none';
        return styles;
    }
  };

  // Aplicar estilos según la variante
  const tagStyles = getTagStyles();

  // Clases adicionales basadas en prioridad
  const priorityClass = priority && priority > 0 ? 'font-medium' : '';

  // Clase para el estado de deshabilitado
  const disabledClass = disableSelection ? 'opacity-80' : '';

  return (
    <span
      className={`inline-flex items-center ${roundedClass} ${
        effectiveVariant === 'solid' ? 'font-semibold shadow-sm' : 'font-medium'
      } ${sizeClasses[size]} ${priorityClass} ${disabledClass} ${className}`}
      style={tagStyles}
    >
      {TagIcon && (
        <TagIcon
          size={iconSize}
          className="mr-0.5"
          strokeWidth={size === 'xs' || size === 'sm' ? 2.5 : 2}
        />
      )}
      {displayText}
    </span>
  );
};