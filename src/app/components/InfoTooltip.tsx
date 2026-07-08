import React, { useState } from 'react';
import { Info } from 'lucide-react';

interface InfoTooltipProps {
  content: string;
}

export function InfoTooltip({ content }: InfoTooltipProps) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        className="cursor-help"
      >
        <Info className="w-3.5 h-3.5 text-[#ff9800]" />
      </div>
      {isVisible && (
        <div className="absolute z-50 left-0 top-5 w-64 p-2 bg-white text-gray-900 border border-gray-200 text-xs rounded shadow-lg">
          {content}
        </div>
      )}
    </div>
  );
}
