import React from 'react';

export const Button = ({
  children,
  onClick,
  variant = 'default',
  size = 'md',
  className = '',
}) => {
  const baseStyle = 'px-4 py-2 rounded font-semibold transition-colors';
  const variants = {
    default: 'bg-blue-600 text-white hover:bg-blue-700',
    outline: 'border border-gray-400 text-gray-700 hover:bg-gray-100',
    destructive: 'bg-red-600 text-white hover:bg-red-700',
  };
  const sizes = {
    sm: 'text-sm py-1 px-3',
    md: 'text-base',
    lg: 'text-lg py-3 px-6',
  };

  return (
    <button
      onClick={onClick}
      className={`${baseStyle} ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {children}
    </button>
  );
};
