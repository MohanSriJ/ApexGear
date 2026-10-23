import React from 'react';
import { Sparkles } from 'lucide-react';

export default function Logo({ size = 'md', showBadge = true, variant = 'full' }) {
  const iconSizes = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12'
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl'
  };

  return (
    <div className="flex items-center gap-3 select-none group cursor-pointer">
      {/* Dynamic AI Apex Emblem */}
      <div className={`relative ${iconSizes[size]} shrink-0 transition-transform duration-300 group-hover:scale-105`}>
        {/* Glow halo on hover */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-brand-600 via-indigo-500 to-purple-500 blur-sm opacity-60 group-hover:opacity-100 transition-opacity" />
        
        {/* Main Logo SVG */}
        <svg 
          viewBox="0 0 44 44" 
          className="relative w-full h-full drop-shadow-md"
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Primary Apex Gradient */}
            <linearGradient id="apexBrandGrad" x1="2" y1="2" x2="42" y2="42" gradientUnits="userSpaceOnUse">
              <stop stopColor="#4f46e5" />
              <stop offset="0.5" stopColor="#6366f1" />
              <stop offset="1" stopColor="#9333ea" />
            </linearGradient>

            {/* Neural Sparkle Gradient */}
            <linearGradient id="sparkleCoreGrad" x1="14" y1="12" x2="30" y2="28" gradientUnits="userSpaceOnUse">
              <stop stopColor="#ffffff" />
              <stop offset="0.6" stopColor="#e0e7ff" />
              <stop offset="1" stopColor="#a5b4fc" />
            </linearGradient>

            {/* Glow Filter */}
            <filter id="softGlow" x="0" y="0" width="44" height="44" filterUnits="userSpaceOnUse">
              <feGaussianBlur stdDeviation="1.5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Squircle Background Container */}
          <rect width="44" height="44" rx="13" fill="url(#apexBrandGrad)" />
          
          {/* Subtle Inner Border */}
          <rect x="0.5" y="0.5" width="43" height="43" rx="12.5" stroke="white" strokeOpacity="0.2" />

          {/* The "Apex" Ascending Delta Architecture (Represents Peak Gear + Digital Prism) */}
          <path 
            d="M22 8L34.5 32H27L22 20.5L17 32H9.5L22 8Z" 
            fill="white" 
            fillOpacity="0.2" 
          />

          <path 
            d="M22 8L30 25.5H24.5L22 19L19.5 25.5H14L22 8Z" 
            fill="white" 
            fillOpacity="0.35" 
          />

          {/* AI Neural Spark at the Summit (Represents the AI Shopping Intelligence) */}
          <path 
            d="M22 10.5C22.6 15 24 16.4 28.5 17C24 17.6 22.6 19 22 23.5C21.4 19 20 17.6 15.5 17C20 16.4 21.4 15 22 10.5Z" 
            fill="url(#sparkleCoreGrad)"
            filter="url(#softGlow)"
          />

          {/* Dynamic Shopping Spark Node (Top Right Satellite Orbit) */}
          <circle cx="33" cy="11" r="2.8" fill="#38bdf8" />
          <circle cx="33" cy="11" r="1.3" fill="white" />
        </svg>
      </div>

      {/* Typography & AI Badge */}
      {variant === 'full' && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className={`${textSizes[size]} font-extrabold tracking-tight text-slate-900 leading-none`}>
              Apex<span className="bg-gradient-to-r from-brand-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">Gear</span>
            </span>
          </div>

          {showBadge && (
            <div className="flex items-center gap-1 mt-1">
              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-gradient-to-r from-brand-50 to-indigo-50 text-brand-700 border border-brand-200/80 shadow-2xs">
                <Sparkles className="w-2.5 h-2.5 text-brand-600 animate-pulse" />
                <span>AI Consultative Store</span>
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
