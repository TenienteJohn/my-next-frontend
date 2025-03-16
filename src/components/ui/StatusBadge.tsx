// src/components/ui/StatusBadge.tsx
import React from 'react';

interface StatusBadgeProps {
  type: 'required' | 'ready' | 'soldout' | 'optional';
  children: React.ReactNode;
  className?: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ type, children, className = '' }) => {
  let baseClassName = 'px-3 py-1 text-xs font-medium rounded-full';

  switch (type) {
    case 'required':
      baseClassName += ' bg-gray-200 text-gray-800';
      break;
    case 'ready':
      baseClassName += ' bg-green-500 text-white';
      break;
    case 'soldout':
      baseClassName += ' bg-red-100 text-red-600';
      break;
    case 'optional':
      baseClassName += ' bg-gray-100 text-gray-600';
      break;
  }

  return (
    <span className={`${baseClassName} ${className}`}>
      {children}
    </span>
  );
};

export default StatusBadge;