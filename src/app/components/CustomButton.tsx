import React from 'react';

interface CustomButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export function CustomButton({ 
  variant = 'primary', 
  size = 'md', 
  children, 
  className = '',
  ...props 
}: CustomButtonProps) {
  const baseStyles = 'inline-flex items-center justify-center rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    primary: 'bg-[#ff9800] text-white hover:bg-[#f57c00] border border-[#d67000]',
    secondary: 'bg-white text-[#666666] border border-gray-300 hover:bg-gray-50',
    outline: 'bg-transparent text-[#ff9800] border-2 border-[#ff9800] hover:bg-[#ff9800] hover:text-white',
    danger: 'bg-red-600 text-white hover:bg-red-700 border border-red-800',
  };
  
  const sizes = {
    sm: 'h-7 px-3 text-xs gap-1.5',
    md: 'h-8 px-4 text-xs gap-1.5',
    lg: 'h-9 px-5 text-sm gap-2',
  };
  
  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}