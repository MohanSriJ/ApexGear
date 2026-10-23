import React, { useState } from 'react';
import { 
  Keyboard, 
  Headphones, 
  Mouse, 
  Watch, 
  Zap, 
  Sun, 
  BatteryCharging, 
  Package,
  Layers
} from 'lucide-react';

const CATEGORY_ICONS = {
  'Keyboards & Mice': Keyboard,
  'Audio': Headphones,
  'Desk Setup': Layers,
  'Wearables & Fitness': Watch,
  'Travel & Power': Zap
};

export default function SafeImage({ 
  src, 
  alt, 
  className = '', 
  category = '',
  loading = 'lazy'
}) {
  const [hasError, setHasError] = useState(false);

  if (hasError || !src) {
    const IconComponent = CATEGORY_ICONS[category] || Package;

    return (
      <div className={`flex flex-col items-center justify-center bg-gradient-to-br from-slate-800 to-indigo-950 text-slate-300 p-4 select-none ${className}`}>
        <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-brand-300 mb-1.5 shadow-inner">
          <IconComponent className="w-5 h-5" />
        </div>
        <span className="text-[10px] font-semibold text-slate-300 text-center line-clamp-1 px-1">
          {alt || category || 'Product'}
        </span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      loading={loading}
      onError={() => setHasError(true)}
    />
  );
}
