import React from 'react';
import { ChevronDown } from 'lucide-react';

interface CustomSelectProps {
  label?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  className?: string;
  selectClassName?: string;
  disabled?: boolean;
  hasError?: boolean;
}

export function CustomSelect({ 
  label, 
  options, 
  placeholder = 'Select',
  className = '',
  selectClassName = '',
  value,
  onChange,
  disabled = false,
  hasError = false,
}: CustomSelectProps) {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (onChange) {
      onChange(e.target.value);
    }
  };

  return (
    <div className={className}>
      {label && (
        <label className="block text-sm text-[#666666] mb-1.5 font-normal">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          className={`w-full h-7 pl-3 pr-8 border rounded text-sm text-gray-700 bg-white appearance-none focus:outline-none focus:ring-1 cursor-pointer disabled:bg-gray-100 disabled:cursor-not-allowed ${
            hasError
              ? 'border-amber-400 focus:ring-amber-400 focus:border-amber-400'
              : 'border-gray-300 focus:ring-[#ff9800] focus:border-[#ff9800]'
          } ${selectClassName}`}
          value={value || ''}
          onChange={handleChange}
          disabled={disabled}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
      </div>
    </div>
  );
}